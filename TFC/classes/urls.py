from django.urls import path
from . import views

urlpatterns = [
    path('test/classes/', views.test_classes),
]