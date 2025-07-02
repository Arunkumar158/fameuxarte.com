from django.db import models

# Create your models here.
class About(models.Model):
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    bio = models.TextField()
    image = models.ImageField(upload_to='about/')

    def __str__(self):
        return self.name
