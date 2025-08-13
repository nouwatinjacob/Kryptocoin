# accounts/views.py
import requests
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from .forms import  LoginForm, RegistrationForm
from decimal import Decimal
from .models import UserProfile


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, "Login successful!")
            return redirect('accounts:dashboard')
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = LoginForm()
    return render(request, 'accounts/login.html', {'form': form, 'hide_layout': True,})


def register_view(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Create profile with dummy balance
            UserProfile.objects.create(user=user)
            login(request, user)
            messages.success(request, "Registration successful!")
            return redirect('accounts:dashboard')
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = RegistrationForm()
        context = {
            'form': form,
            'hide_layout': True,
            'user': request.user,
        }
    return render(request, 'accounts/register.html', context)

@login_required
def dashboard(request):
    # Get user's profile
    profile = request.user.userprofile
    
    # Convert balance to different cryptocurrencies (example rates)
    btc_rate = Decimal('30000')  # 1 BTC = $30,000
    eth_rate = Decimal('2000')   # 1 ETH = $2,000
    
    btc_balance = (profile.balance / btc_rate).quantize(Decimal('0.00000'))
    eth_balance = (profile.balance / eth_rate).quantize(Decimal('0.00000'))
    
    # Get recent transactions (you'll need to create a Transaction model)
    transactions = []  # Replace with actual transaction query
    
    context = {
        'btc_balance': btc_balance,
        'eth_balance': eth_balance,
        'transactions': transactions,
        'user': request.user,
        'hide_layout': True,
    }
    
    return render(request, 'accounts/dashboard.html', context)

@login_required
def check_payment_status(request):
    bitcoin_address = "1JNH4utcnN1qxVTAF9ik7DFijBSUqUsAFV"
    MIN_USD = Decimal('100.00')

    try:
        # Fetch live BTC-USD rate (example: CoinGecko simple price)
        rate_resp = requests.get(
            "https://api.coingecko.com/api/v3/simple/price",
            params={"ids": "bitcoin", "vs_currencies": "usd"}
        )
        rate_resp.raise_for_status()
        btc_rate_usd = Decimal(str(rate_resp.json()['bitcoin']['usd']))
    except (requests.RequestException, KeyError, InvalidOperation) as e:
        btc_rate_usd = Decimal('116000')  # fallback to a default
        # Optionally: log error

    try:
        response = requests.get(f"https://api.blockcypher.com/v1/btc/main/addrs/{bitcoin_address}")
        response.raise_for_status()
        data = response.json()
        total_received_satoshis = data.get("total_received", 0)
        total_received_btc = Decimal(total_received_satoshis) / Decimal(1e8)
        total_received_usd = total_received_btc * btc_rate_usd

        if total_received_satoshis == 0:
            return JsonResponse({
                'status': 'none',
                'message': 'No Bitcoin received yet. Please send exactly $100 worth of BTC to activate your account.'
            })
        if total_received_usd < MIN_USD:
            return JsonResponse({
                'status': 'pending',
                'message': f'Only ${total_received_usd:.2f} received (≈ {total_received_btc} BTC). Waiting for full $100 deposit.'
            })
        return JsonResponse({
            'status': 'success',
            'message': (f'Payment confirmed! Received {total_received_btc:.8f} BTC ≈ '
                        f'${total_received_usd:.2f}. Your account is now activated.')
        })
    except requests.RequestException as e:
        return JsonResponse({'status': 'error', 'message': 'Network issue checking payment status. Try again shortly.'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': f'An error occurred: {str(e)}'})

