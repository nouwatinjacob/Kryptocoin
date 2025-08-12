# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from decimal import Decimal

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # keep username for admin panel

    def __str__(self):
        return self.email

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=20, decimal_places=8, default=Decimal('1000.00000000'))  # dummy balance
    verification_fee_paid = models.BooleanField(default=False)
    bitcoin_address = models.CharField(max_length=100, blank=True, default='1YourBitcoinAddressHere')

    def __str__(self):
        return f"{self.user.username} - Balance: ${self.balance}"
