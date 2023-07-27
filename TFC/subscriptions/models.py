from django.db import models
from django.contrib.auth.models import User 

# Create your models here.
class Subscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    subscription = models.JSONField()
    card_details = models.JSONField()
    payment_history = models.JSONField()
    recurring_date = models.DateTimeField(null=True, blank=True)
    first_payment = models.DateTimeField()
    cancelled = models.BooleanField()
    enrolled_classes = models.JSONField(default=[])
    class Meta:
        verbose_name = "subscriptions"

class Plan(models.Model):
    plan_name = models.CharField(unique=True, max_length=200)
    price = models.CharField(max_length=200)
