from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.views import View
from rest_framework_simplejwt import views as jwt_views
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate, login, logout
from .models import CustomUser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.tokens import RefreshToken
from studios.models import Class, ClassTime
import datetime

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        logout(request)
        return Response("Logged Out")



class SignUpView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response("Need at least username and password", status=401)
        if User.objects.filter(username=username).exists():
            return Response("Username already exists", status=401)
        email = request.data.get('email') if request.data.get('email') is not None else ''
        phone = request.data.get('phone') if request.data.get('phone') is not None else ''
        first_name = request.data.get('first_name') if request.data.get('first_name') is not None else ''
        last_name = request.data.get('last_name') if request.data.get('last_name') is not None else ''
        avatar = request.data.get('avatar') if request.data.get('avatar') is not None else ''
        user = User.objects.create_user(username=username, password=password,
        email=email, first_name=first_name, last_name=last_name)
        user.save()
        if avatar:
            c_user = CustomUser.objects.create(user=user, phone=phone, avatar=avatar)
        else:
            c_user = CustomUser.objects.create(user=user, phone=phone)
        c_user.save()
        return Response({
                "username": c_user.user.username,
                "email": c_user.user.email,
                "phone": c_user.phone,
                "first_name": c_user.user.first_name,
                "last_name": c_user.user.last_name,
                "avatar": c_user.avatar
            })

class ProfileEdit(APIView):
    permission_classes = [IsAuthenticated,]
    def post(self, request):
        u_user = User.objects.get(username=request.user)
        user = CustomUser.objects.get(user=u_user)
        u_user.email = request.data.get('email') if request.data.get('email') is not None else ''
        user.phone = request.data.get('phone') if request.data.get('phone') is not None else ''
        u_user.first_name = request.data.get('first_name') if request.data.get('first_name') is not None else ''
        u_user.last_name = request.data.get('last_name') if request.data.get('last_name') is not None else ''
        user.avatar = request.data.get('avatar') if request.data.get('avatar') is not None else ''
        u_user.save()
        user.save()
        return Response({
                "username": user.user.username,
                "email": user.user.email,
                "phone": user.phone,
                "first_name": user.user.first_name,
                "last_name": user.user.last_name,
                "avatar": user.avatar
            })
    def get(self, request):
        u_user = User.objects.get(username=request.user)
        user = CustomUser.objects.get(user=u_user)
        return Response({
                "username": user.user.username,
                "email": user.user.email,
                "phone": user.phone,
                "first_name": user.user.first_name,
                "last_name": user.user.last_name,
                "avatar": user.avatar
            })

class ClassChronologyView(APIView):
    permission_classes = [IsAuthenticated,]
    def get(self, request):
        u_user = User.objects.get(username=request.user)
        user = CustomUser.objects.get(user=u_user)
        # go through all the classtimes and return the ones that the user is in
        # return {'History': [class1, class2, class3], 'Upcoming': [class4, class5, class6]}

        class_times = ClassTime.objects.all()
        history = []
        upcoming = []
        curr = datetime.datetime.now(datetime.timezone.utc)
        for class_time in class_times:
            parent_class = class_time.class_id
            if str(request.user) in class_time.users:
                desc = {'class_name': parent_class.name, 'start_time': class_time.start_time, 'end_time': class_time.end_time, 'class_id': parent_class.id, 'class_time_id': class_time.id}
                if class_time.end_time < curr:
                    history.append(desc)
                else:
                    upcoming.append(desc)
        # we want each list sorted by start time
        history.sort(key=lambda x: x['start_time'])
        upcoming.sort(key=lambda x: x['start_time'])
        res = {
            "History": history,
            "Upcoming": upcoming
        }
        return Response(res)
