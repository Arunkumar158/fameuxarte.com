from django.db import models
from django.utils import timezone # For handling dates and times
from django.contrib.auth.models import User # For User
from django.urls import reverse

# Create your models here.
class Category(models.Model):
     name= models.CharField(max_length=100)
     slug = models.SlugField(unique=True)

     def __str__(self):
          return self.name
     

class Post(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique =True, help_text="Unique URL identifier") #For SEO friendly URLs
    author =models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts') #Author of the post
    content =models.TextField() # Main content of the blog
    created_at = models.DateTimeField(auto_now_add=True) #When the post was created
    published_at = models.DateTimeField(auto_now=True) #When the post was published.Allows for Drafts.
    tags = models.ManyToManyField('Tag', blank=True)  # Many-to-,any relationship with RAg model(see below)
    image = models.ImageField(upload_to='image/', blank=True, null=True) #Optional image for the post

class Meta:
        ordering = ['-published_at']  # Order posts by published date (newset first)

        def __str__(self):
            return self.title
        def publish(self):
            self.published_at = timezone.now()
            self.save()
            
        def get_absolute_url(self):  # For generating URLs to individual posts (important for SEO and links)
            return reverse('blog_post_detail', args = [self.slug])   #Replace 'blog_post_detail' with your URL name
    
class Tag(models.Model):      # Model for tags (for categorizing posts)
        name = models.CharField(max_length=100, unique=True)
        slug = models.SlugField(max_length=100, unique=True)

        def __str__(self):
            return self.name
        def get_absolute_url(self):
            return reverse('tag_detail', args=[self.slug]) #Replace 'tag_detail' with your URL name
        
class Comment(models.Model):
        post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments') #Related to the post
        author = models.CharField(max_length=255) # Or Foreignkey to User if you want loggedin comments
        email = models.EmailField()
        body = models.TextField()
        created_at = models.DateTimeField(auto_now_add=True)
        approved = models.BooleanField(default=False) # For comment maderation

        def __str__(self):
            return self.body
