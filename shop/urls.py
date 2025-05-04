from django.urls import path
from .views import (
    CategoryListCreateView, CategoryRetrieveUpdateDestroyView,
    ProductListCreateView, ProductRetrieveUpdateDestroyView,
    ReviewListCreateView, ReviewRetrieveUpdateDestroyView
)

urlpatterns = [
    # Categories
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryRetrieveUpdateDestroyView.as_view(), name='category-detail'),

    # Products
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', ProductRetrieveUpdateDestroyView.as_view(), name='product-detail'),

    # Reviews
    path('reviews/', ReviewListCreateView.as_view(), name='review-list-create'),
    path('reviews/<int:pk>/', ReviewRetrieveUpdateDestroyView.as_view(), name='review-detail'),
]
