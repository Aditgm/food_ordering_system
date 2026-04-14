# Online Food Ordering System - Client Deliverables

## Technical Stack Overview
- **Backend:** Node.js / Express.js (pivot from Django for system compatibility)
- **Frontend:** React.js (Vite)
- **Styling:** Vanilla CSS (Modern Aesthetics, Glassmorphism)
- **Database:** In-memory Mock Store (easily migratable to SQL)
- **Authentication:** JWT (JSON Web Token) with bcrypt hashing


## 1. Software Requirements Specification (SRS)

### 1.1 Purpose
The purpose of this document is to outline the requirements for a web-based Online Food Ordering System. This system allows customers to browse menus, add items to a cart, place orders, and track them, while enabling restaurants to manage their offerings and track incoming orders.

### 1.2 Scope
The application includes:
- **User Authentication:** Login and Registration for customers and administrators.
- **Menu Management:** Restaurants can add, update, or remove menu items. Customer view of the menu.
- **Cart & Checkout:** Customers can select items, review their cart, and proceed to checkout.
- **Payment Integration:** Secure dummy gateway for handling mock payments.
- **Order Tracking:** Customers and restaurant owners can track the state of the order from 'Placed' to 'Delivered'.

### 1.3 Target Audience
- Customer base, particularly from 2nd tier cities preferring an intuitive system in familiar settings.
- Restaurant Owners looking to digitize their storefront experience.

---

## 2. ER Diagram (PlantUML)

This diagram can be copied directly into Draw.io (using Arrange > Insert > Advanced > PlantUML) or rendered via any PlantUML viewer.

```plantuml
@startuml
entity "User" as user {
  * id : INT <<PK>>
  --
  name : VARCHAR
  email : VARCHAR
  password : VARCHAR
  phone : VARCHAR
  role : ENUM('CUSTOMER', 'RESTAURANT_OWNER')
  address : TEXT
}

entity "Restaurant" as restaurant {
  * id : INT <<PK>>
  --
  owner_id : INT <<FK>>
  name : VARCHAR
  address : TEXT
  phone : VARCHAR
}

entity "MenuItem" as menu {
  * id : INT <<PK>>
  --
  restaurant_id : INT <<FK>>
  name : VARCHAR
  description : TEXT
  price : DECIMAL(10,2)
  is_available : BOOLEAN
  image_url : VARCHAR
}

entity "Order" as order {
  * id : INT <<PK>>
  --
  user_id : INT <<FK>>
  restaurant_id : INT <<FK>>
  total_amount : DECIMAL(10,2)
  status : ENUM('PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED')
  payment_status : ENUM('PENDING', 'SUCCESS', 'FAILED')
  created_at : TIMESTAMP
}

entity "OrderItem" as orderitem {
  * id : INT <<PK>>
  --
  order_id : INT <<FK>>
  menu_item_id : INT <<FK>>
  quantity : INT
  price_at_purchase : DECIMAL(10,2)
}

user ||--o{ restaurant : "Owns"
user ||--o{ order : "Places"
restaurant ||--o{ menu : "Offers"
restaurant ||--o{ order : "Receives"
order ||--|{ orderitem : "Contains"
menu ||--o{ orderitem : "Included In"
@enduml
```

---

## 3. Sequence Diagram (PlantUML)

This sequence diagram depicts the flow from browsing the menu to checkout.

```plantuml
@startuml
actor Customer
participant "Frontend Web UI" as UI
participant "Backend System" as Backend
participant "Database" as DB
participant "Payment Gateway" as Payment

Customer -> UI: Browse Menu
UI -> Backend: GET /api/menu
Backend -> DB: Fetch Active Menu Items
DB --> Backend: Return Menu Data
Backend --> UI: Menu JSON
UI --> Customer: Display Menu

Customer -> UI: Add Item to Cart
UI -> UI: Update Local Cart State

Customer -> UI: Click Checkout
UI -> Customer: Request Login Details (if not authenticated)
Customer -> UI: Submit Login/Registration
UI -> Backend: POST /api/auth
Backend -> DB: Validate/Store User
DB --> Backend: Success
Backend --> UI: Auth Token

Customer -> UI: Confirm Order & Pay
UI -> Backend: POST /api/orders (Cart details)
Backend -> Payment: Initialize Payment Intent (Mock)
Payment --> Backend: Payment Intent Initialized
Backend --> UI: Return Payment Form Details
UI -> Payment: Process Mock Transaction
Payment --> UI: Transaction Success Event
UI -> Backend: PUT /api/orders/{id}/status (Update to SUCCESS)
Backend -> DB: Update Order Status
DB --> Backend: Updated
Backend --> UI: Order Confirmation Details
UI --> Customer: Show Order Success & Tracking Link
@enduml
```

---

## 4. Test Cases

| Test Case ID | Module | Scenario | Expected Outcome | Status |
|---|---|---|---|---|
| TC_01 | User Auth | Register with a valid email and strong password | User account created and logged in automatically. | Pend |
| TC_02 | User Auth | Login with incorrect password | Form shows error "Invalid credentials". | Pend |
| TC_03 | Menu Management | Restaurant owner adds a new item (e.g. Biryani - ₹150) | Item appears immediately on the restaurant's active menu for customers. | Pend |
| TC_04 | Cart | Add an out-of-stock item to the cart | Error message "Item currently unavailable" displayed; item not added. | Pend |
| TC_05 | Checkout | Proceed to checkout without logging in | Redirected to login/registration page before proceeding. | Pend |
| TC_06 | Payment | Simulate failed payment gateway response | Order status remains 'PENDING', user is asked to retry payment. | Pend |
| TC_07 | Order Tracking | Customer checks active order status | UI displays current real-time status (e.g. 'PREPARING'). | Pend |

---

## 5. Maintenance Strategy

- **Bug Tracking & Reporting:** Integrate Sentry / LogRocket to monitor front-end errors and React crashes.
- **Monitoring:** Implement application performance monitoring (APM) for backend services to measure API response times and database query latencies.
- **Database Backups:** Automated daily snapshots of the PostgreSQL / MySQL database stored in secure cloud storage.
- **Continuous Integration / Continuous Deployment (CI/CD):** Use GitHub Actions to automate running of the Test Cases (unit and integration tests) on every pull request, safeguarding main branch stability.
- **Version Control & Documentation:** Ensure this SRS acts as a living document corresponding directly with the git repository's `README.md` and feature roadmap.
