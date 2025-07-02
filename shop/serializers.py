from rest_framework import serializers
from .models import Category, Product, Review

#Category Serializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

#Product Serializer
class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True) # show category details in product API
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )  # Allow assinging category by ID


    class Meta:
        model = Product
        fields = '__all__'

#Review Serializer

class ReviewSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  # Show product details i review API
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )  # Allow assigining Product by ID

    author = serializers.StringRelatedField(read_only=True) # show username instead of ID


    class Meta:
        model = Review
        fields = '__all__'