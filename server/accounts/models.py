from django.db import models
from django.contrib.auth.models import User
from pathlib import Path
from studios.models import Class, ClassTime
from django_base64field.fields import Base64Field
# Create your models here.

class CustomUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, unique=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    avatar = Base64Field(max_length=900000, blank=True, null=True)
