# Food Ordering Backend (Django)

This is the fully implemented Django backend incorporating all requirements:
1. Models: User, Restaurant, MenuItem, Cart, Order
2. Authentication: Django REST Framework TokenAuth (Login/Registration)
3. Orders & Tracking: Viewsets implemented for tracking status and Mock Payment checkout flow.

## Prerequisites
Ensure Python 3.9+ is installed globally.

## Setup Instructions

1. Open your terminal in this directory (`c:/Users/krish/Downloads/sftwarep2/backend`)
2. Set up virtual environment (optional but recommended):
   `python -m venv venv`
   `venv\Scripts\activate`
3. Install reqs:
   `pip install -r requirements.txt`
4. Make migrations and migrate standard database constraints:
   `python manage.py makemigrations api`
   `python manage.py migrate`
5. Run the local backend server:
   `python manage.py runserver 8000`

The backend REST APIs will be available at `http://127.0.0.1:8000/api/`.

## Endpoints Summary:
- **POST** `/api/auth/register/` - Register Customer/Restaurant Owner
- **POST** `/api/auth/login/` - Login and get Token
- **GET/POST** `/api/restaurants/` - Manage Restaurants
- **GET/POST** `/api/menu/` - Manage Menus
- **GET** `/api/cart/my_cart/` - See own cart items
- **POST** `/api/cart/add_item/` - Add to cart
- **POST** `/api/cart/checkout/` - Checkout
- **GET** `/api/orders/` - Retrieve orders status
