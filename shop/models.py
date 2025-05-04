from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator  # Corrected typo here too

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    stock = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Review(models.Model):  # Review class is now OUTSIDE of Product
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    author = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='reviews')
    content = models.TextField()
    rating = models.PositiveIntegerField(default=5, validators=[MinValueValidator(1), MaxValueValidator(5)])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.product.name} by {self.author.username}"
        

        # Other Important Considerations:

        # Product Variations (e.g., Size, Color): If your products have variations (e.g., different sizes or colors),
        # you'll need to create a separate model for product variations and link it to the Product model.

        # Inventory Management: You'll need to implement proper inventory management 
        # (decrementing stock when orders are placed, etc.).

        # Search Functionality: Consider adding search functionality to your shop.

        # Wishlist: You might want to add a wishlist feature.

        # Promotions/Discounts: If you plan to offer promotions or 
        # discounts, you'll need to add models and logic to handle them.

        # Shipping and Tax Calculations: You'll need to implement logic for calculating shipping costs and taxes.

        # Payment Integration: You'll need to integrate with a payment gateway (e.g., Stripe, PayPal) to process payments.










