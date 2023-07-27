from django.urls import path, include
from . import views
from .views import Subscribe, ChangePayment, ChangePlan, CancelPlan, PaymentHistory, GetPlans

urlpatterns = [
    path('subscribe/',Subscribe.as_view(), name="subscribe"),
    path("change_payment/", ChangePayment.as_view(), name='change_payment'),
    path('change_plan/', ChangePlan.as_view(), name='change_plan'),
    path('cancel/', CancelPlan.as_view(), name='cancel'),
    path('payment_history/', PaymentHistory.as_view(), name='payment_history'),
    path('get_plans/', GetPlans.as_view(), name="get_plans")
]