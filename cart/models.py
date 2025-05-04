from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from shop.models import Product

# Cart Model
class Cart(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, null=True, blank=True)
    session_key = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    discount = models.ForeignKey('Discount', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Cart {self.id}"

    def get_total(self):
        total = 0
        for item in self.items.all():
            total += item.get_subtotal()
        return total

    def apply_discount(self, discount_code):
        try:
            discount = Discount.objects.get(code=discount_code, active=True)
            self.discount = discount
            self.save()
            return True  # Success
        except Discount.DoesNotExist:
            return False  # Discount code not found or valid

    def get_discount_total(self):
        total = self.get_total()
        if self.discount:
            discount_amount = (self.discount.percentage / 100) * total
            total -= discount_amount
        return total


# CartItem Model
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('shop.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])  # Ensure quantity >= 1

    class Meta:
        unique_together = [('cart', 'product')]  # Prevent duplicate products in the same cart

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    def get_subtotal(self):
        return self.quantity * self.product.price

    def clean(self):
        if self.product.stock < self.quantity:
            raise ValidationError("Not enough stock available for this product.")
        super().clean()


# Discount Model
class Discount(models.Model):
    code = models.CharField(max_length=50, unique=True)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    active = models.BooleanField(default=True)  # Corrected field name

    def __str__(self):
        return self.code


# Shipping Model
class Shipping(models.Model):
    cart = models.OneToOneField(Cart, on_delete=models.CASCADE, related_name="shipping")
    address = models.TextField()  # Or more detailed address fields
    method = models.CharField(max_length=50)
    cost = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    def __str__(self):
        return f"Shipping for cart {self.cart.id}"


    # Product price and stock: The CartItem model and its methods assume that your Product 
    # model has price and stock fields. Make sure these fields exist in your Product model.