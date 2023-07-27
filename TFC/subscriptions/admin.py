from django.contrib import admin
from .models import Subscription, Plan
# Register your models here.

# use the subscription model to create a subscription admin
# but only show the name and price of the plan
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'subscription', 'recurring_date', 'cancelled')

class PlanAdmin(admin.ModelAdmin):
    list_display = ('plan_name', 'price')

admin.site.register(Subscription, SubscriptionAdmin)
admin.site.register(Plan, PlanAdmin)
