from django.shortcuts import render, redirect

# Create your views here.

def login_view(request):
    return render(request, 'account/login.html')

def logout_view(request):
    return redirect('home')

def register(request):
    return render(request, 'account/register.html')