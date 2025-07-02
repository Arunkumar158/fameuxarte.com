from django.db import models
from shop.models import Product
from django.core.validators import MinValueValidator

# Order Model
class Order(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='orders')
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField()
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    paid = models.BooleanField(default=False)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Store total price
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Store shipping cost
    # Add other order-related fields (e.g., order status, shipping method, etc.)

    def __str__(self):
        return f"Order {self.id}"

    def update_total(self):  # Method to calculate and save the total price
        self.total_price = sum(item.get_subtotal() for item in self.items.all())
        self.save()


# OrderItem Model
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)  # Don't delete products if order is deleted
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Store the price at the time of order
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    def get_subtotal(self):
        return self.quantity * self.price

    def save(self, *args, **kwargs):
        if not self.pk:  # Only on creation
            self.price = self.product.price  # Set price from Product model on creation
        super().save(*args, **kwargs)  # Save the object

        # Order Status: Add a field to the Order model to track the order status 
        # (e.g., "Pending," "Processing," "Shipped," "Delivered," "Cancelled"). Use a CharField with choices for this."""

        # Payment Integration: You'll need to integrate with a payment gateway (e.g., Stripe, PayPal) to process payments. This will involve 
        # adding more fields to the Order model (e.g., transaction ID, payment method) and
        # creating views to handle the payment process.

        # Shipping Integration: If you're shipping physical goods,
        # you'll need to integrate with a shipping provider (e.g., FedEx, UPS) to calculate shipping costs and generate shipping labels.

        # Inventory Management: 
        # You'll need to update your inventory when an order is placed. Decrement the stock of the products that were ordered.

        # Order Tracking: Consider adding functionality for users to track their orders.

        # Returns/Refunds: You'll need to implement a system for handling returns and refunds.