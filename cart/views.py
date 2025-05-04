from django.shortcuts import render

# Create your views here.
def view_cart(request):
    return render(request, 'cart/cart.html')

def add_to_cart(request,product_id):
    return render(request, 'cart/add_to_cart.html', {'product_id': product_id})

def remove_from_cart(request, product_id):
    return render(request, 'cart/remove_from_cart.html', {'product_id': product_id})