from django.apps import AppConfig
import threading


class SubscriptionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'subscriptions'

    def ready(self):
        from .views import update_payments
        t = threading.Thread(target=update_payments, daemon=True)
        t.start()