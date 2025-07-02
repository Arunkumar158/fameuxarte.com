"""
URL configuration for fameuxarte project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect

def redirect_to_home(request):
    return redirect('/home/')

urlpatterns = [
    path("admin/", admin.site.urls),
    path("about/", include("about.urls")),
    path("account/", include("account.urls")),
    path("cart/", include("cart.urls")),
    path("checkout/", include("checkout.urls")),
    path("contact/", include("contact.urls")),
    path("home/", include("home.urls")),
    
    # ✅ Correct API paths (without overwriting)
    path("api/artists/", include("artists.urls")),
    path("api/blog/", include("blog.urls")),  # 🔥 This will handle api/posts/
    path("api/gallery/", include("gallery.urls")),
    path("api/shop/", include("shop.urls")),
    

    # Redirect root URL to home
    path("", redirect_to_home, name="redirect_to_home"),
]
