from django.urls import path
from .views import about, contact, home, service, terms, faq

app_name = 'core'

urlpatterns = [
    path('contact/', contact, name='contact'),
    path('about/', about, name='about'),
    path('deposit/', about, name='deposit'),
    path('service/', service, name='service'),
    path('terms/', terms, name='terms'),
    path('faq/', faq, name='faq'),
    path('trade/', about, name='trade'),
    path('swap/', about, name='swap'),
    path('', home, name='home'),
]