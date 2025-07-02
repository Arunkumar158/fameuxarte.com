from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CategoryViewSet, TagViewSet, CommentViewSet

# Set up DRF router
router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'tags', TagViewSet)
router.register(r'posts', PostViewSet)  # ✅ Corrects `/api/posts/`
router.register(r'comments', CommentViewSet)

urlpatterns = router.urls
