from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Subscription, Plan
from studios.models import ClassTime
import pause
from django.utils import timezone
from django.db import connection

class Subscribe(APIView):
    permission_classes = [IsAuthenticated,]
    def post(self, request):
        """Example request please follow format:
        {"card_details": {"card_number": "4444111122228888", "cvv": "123", "expiry_date":"02/28"},
        "plan": {"name": "Ultimate All Access", "price": "24.99"}}
        """
        card_details = request.data.get('card_details')
        plan = request.data.get('plan')
        user = User.objects.get(username=request.user)
        sub = None
        if Subscription.objects.filter(user=user).exists():
            if not Subscription.objects.get(user=user).cancelled:
                return Response("Your already have a subscription, move to update page to change it", status=400)
            sub = Subscription.objects.get(user=user)
        if not card_details:
            return Response("Enter card details", status=400)
        card_number: str = card_details['card_number']
        if not card_number:
            return Response("Invalid card number", status=400) 
        card_number = card_number.replace(" ", "")
        expiry_date: str = card_details['expiry_date']
        cvv: str = card_details['cvv']
        if not expiry_date or not cvv:
            return Response("Enter expiry date and/or cvv", status=400)
        if not plan:
            return Response("Select a plan", status=400)
        if not Plan.objects.filter(plan_name=plan).exists():
            return Response("Invalid plan selection", status=400)
        p = Plan.objects.get(plan_name=plan)
        if sub is None:
            sub = Subscription.objects.create(user=user, 
            card_details={"card_number": card_number, 'cvv': cvv, 'expiry_date': expiry_date}, 
            subscription={'plan':p.plan_name, 'price': p.price},
            payment_history={'Payment 1': {'datetime':timezone.now().isoformat(), 'plan':p.plan_name, 'price': p.price, 'card_number':card_number}},
            recurring_date = timezone.now().date() + timezone.timedelta(weeks=4),
            first_payment = timezone.now(),
            cancelled=False, enrolled_classes=[])
        else:
            sub.card_details = {"card_number": card_number, 'cvv': cvv, 'expiry_date': expiry_date}
            sub.subscription = {'plan':p.plan_name, 'price': p.price}
            sub.recurring_date = timezone.now().date() + timezone.timedelta(weeks=4)
            sub.cancelled = False
        sub.save()
        return Response(sub.subscription)

class ChangePayment(APIView):
    permission_classes = [IsAuthenticated,]
    def post(self, request):
        card_details = request.data.get('card_details')
        user = User.objects.get(username=request.user)
        if not Subscription.objects.filter(user=user).exclude(cancelled=True).exists():
            return Response("You do not currently have any subscriptions to change payment for.", status=400)
        if not card_details:
            return Response("Enter card details", status=400)
        card_number: str = card_details['card_number']
        if not card_number:
            return Response("Invalid card number", status=400) 
        card_number = card_number.replace(" ", "")
        expiry_date: str = card_details['expiry_date']
        cvv: str = card_details['cvv']
        if not expiry_date or not cvv:
            return Response("Enter expiry date and/or cvv", status=400)
        sub = Subscription.objects.get(user=user)
        sub.card_details = {"card_number": card_number, 'cvv': cvv, 'expiry_date': expiry_date}
        sub.save()
        return Response(sub.card_details)

class ChangePlan(APIView):
    permission_classes=[IsAuthenticated]
    def post(self, request):
        plan = request.data.get('plan')
        user = User.objects.get(username=request.user)
        if not Subscription.objects.filter(user=user).exclude(cancelled=True).exists():
            return Response("Your have no current subscription to change", status=400)
        if not plan:
            return Response("Select a plan", status=400)
        if not Plan.objects.filter(plan_name=plan).exists():
            return Response("Invalid plan selection", status=400)
        p = Plan.objects.get(plan_name=plan)
        sub = Subscription.objects.get(user=user)
        sub.subscription = {'plan':p.plan_name, 'price': p.price} 
        sub.save()
        return Response(sub.subscription)

class CancelPlan(APIView):
    permission_classes=[IsAuthenticated]
    def post(self, request):
        user = User.objects.get(username=request.user)
        if not Subscription.objects.filter(user=user).exclude(cancelled=True).exists():
            return Response("You do not currently have any subscriptions to cancel.", status=400)
        sub = Subscription.objects.get(user=user)
        sub.cancelled = True
        sub.save()
        return Response('Subscription cancelled') 

class PaymentHistory(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        user = User.objects.get(username=request.user)
        if not Subscription.objects.filter(user=user).exists():
            return Response({})
        sub = Subscription.objects.get(user=user)
        temp = sub.payment_history
        p = Plan.objects.get(plan_name=sub.subscription["plan"])
        if not sub.cancelled:
            temp['Next Payment'] = {'datetime': sub.recurring_date.isoformat(), 
            'plan': p.plan_name, 'price': p.price, 
            'card_number':sub.card_details['card_number']}
        return Response(temp)


class GetPlans(APIView):
    def get(self, request):
        plans = Plan.objects.all()
        resp = {}
        for plan in plans:
            resp[plan.plan_name] = {'name': plan.plan_name, 'price': plan.price}
        return Response(resp)


def update_payments():
    while True:
        if "subscriptions" not in connection.introspection.table_names():
            pause.minutes(5)
            continue
        needs_updating = Subscription.objects.filter(recurring_date=timezone.now().date())
        for sub in needs_updating:
            if not sub.cancelled:
                payment_no = len(sub.payment_history)+1
                p = Plan.objects.get(plan_name=sub.subscription["plan"])
                sub.payment_history[f'Payment {payment_no}'] = {'datetime':timezone.now().isoformat(), 
                'plan': p.plan_name, 'price': p.price, 
                'card_number': sub.card_details['card_number']}
                sub.recurring_date = timezone.now().date() + timezone.timedelta(weeks=4)
            else:
                sub.recurring_date = None
                for class_time_id in sub.enrolled_classes:
                    try:
                        class_time = ClassTime.objects.get(id=class_time_id)
                        class_time.unenroll(sub.user.username)
                    except:
                        pass
                sub.enrolled_classes = []
            sub.save()
        pause.days(1)
        

