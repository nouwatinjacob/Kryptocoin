# accounts/urls.py
from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views

app_name = 'accounts'

urlpatterns = [
    # path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', views.register_view, name='register'),
    # Dashboard and payment status check
    path('dashboard/', views.dashboard, name='dashboard'),
    path('check-payment-status/', views.check_payment_status, name='check_payment_status'),
]
