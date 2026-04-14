from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthViewSet, RestaurantViewSet, MenuItemViewSet, CartViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'restaurants', RestaurantViewSet, basename='restaurants')
router.register(r'menu', MenuItemViewSet, basename='menu')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='orders')

urlpatterns = [
    path('', include(router.urls)),
]
