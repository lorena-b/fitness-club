from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import SignUpView, ProfileEdit, LogoutView, ClassChronologyView

app_name = 'accounts'

urlpatterns = [
    path('signup/', SignUpView.as_view(), name="signup"),
    path('login/', TokenObtainPairView.as_view(), name="login"),
    path('profile_edit/',ProfileEdit.as_view(), name="profile_edit"),
    path('logout/', LogoutView.as_view(), name="logout"),
    path('classes/', ClassChronologyView.as_view(), name="classes"),
]