
from django.shortcuts import render

def home(request):
    return render(request, 'core/index.html')

def contact(request):
    return render(request, 'core/contact.html')

def about(request):
    return render(request, 'core/about.html')

def service(request):
    return render(request, 'core/service.html')

def terms(request):
    return render(request, 'core/terms.html')

def faq(request):
    return render(request, 'core/faq.html')