from django.db import models

# Create your models here.

class ContactMessage(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    phone = models.CharField(max_length=20, blank=True, null=True) # Add phone number
    

    #Add  a field for tracking if the message has beenn read or responded to
    is_read = models.BooleanField(default=False)
    response = models.TextField(blank=True, null=True) # Store your responses here

    def __str__(self):
        return f"Message from {self.name}({self.email})" #Include email for clarity
    
    class Meta: 
        ordering = ['-sent_at'] # Order messages by most recent first

# Other Considerations:
# Spam Prevention: Consider adding some basic spam prevention measures, 
# such as a reCAPTCHA or honeypot, to your contact form.

# Email Sending: You'll need to implement the logic to actually send the email when a new ContactMessage is created.
# You can do this in a view or using Django signals.

# Admin Customization: Customize the Django admin for the ContactMessage model to make it easier to manage messages. 
# You can use list_display, list_filter, search_fields, and other options in your admin.py file. 
# You might also want to add custom actions to mark messages as read or replied to.

# Form: Create a Django form for the ContactMessage model to allow users to submit contact messages.

# Templates: Create templates to display the contact form and any success/error messages.