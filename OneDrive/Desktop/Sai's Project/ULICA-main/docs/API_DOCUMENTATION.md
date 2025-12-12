# ULICA E-commerce API Documentation

## Overview

The ULICA e-commerce API provides endpoints for managing products, orders, payments, and user accounts. The API follows RESTful principles and returns JSON responses.

**Base URL**: `https://api.ulica.com/api`  
**Authentication**: Bearer Token (JWT)  
**Rate Limiting**: 100 requests per 15 minutes per IP  

## Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+919876543210",
      "role": "customer",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+919876543210",
      "role": "customer"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+919876543211"
}
```

## Products

### Get All Products
```http
GET /api/products?page=1&limit=10&category=hoodies&search=black&minPrice=1000&maxPrice=5000&inStock=true&featured=true
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `category` (string): Filter by category
- `search` (string): Search in title and description
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `inStock` (boolean): Filter by stock availability
- `featured` (boolean): Filter featured products

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "title": "ULICA Black Hoodie",
        "slug": "ulica-black-hoodie",
        "description": "Premium streetwear hoodie",
        "minPrice": 299900,
        "avgRating": 4.5,
        "images": [
          {
            "url": "https://cdn.ulica.com/images/hoodie-1.jpg",
            "altText": "ULICA Black Hoodie"
          }
        ],
        "variants": [
          {
            "id": "uuid",
            "sku": "UH-001-M",
            "price": 299900,
            "stockQty": 50,
            "attributes": {
              "size": "M",
              "color": "Black"
            }
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Get Product by Slug
```http
GET /api/products/ulica-black-hoodie
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "ULICA Black Hoodie",
    "slug": "ulica-black-hoodie",
    "description": "Premium streetwear hoodie made with the finest materials...",
    "minPrice": 299900,
    "avgRating": 4.5,
    "isInWishlist": false,
    "variants": [...],
    "images": [...],
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "title": "Amazing quality!",
        "comment": "Love this hoodie!",
        "user": {
          "name": "John Doe"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Featured Products
```http
GET /api/products/featured/list
```

### Get Product Categories
```http
GET /api/products/categories/list
```

### Create Product Review
```http
POST /api/products/ulica-black-hoodie/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "title": "Amazing quality!",
  "comment": "Love this hoodie! The quality is exceptional."
}
```

## Orders

### Get User Orders
```http
GET /api/orders?page=1&limit=10&status=pending
Authorization: Bearer <token>
```

### Get Order Details
```http
GET /api/orders/uuid
Authorization: Bearer <token>
```

### Get Order Invoice
```http
GET /api/orders/uuid/invoice
Authorization: Bearer <token>
```

### Cancel Order
```http
POST /api/orders/uuid/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

### Request Order Return
```http
POST /api/orders/uuid/return
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Wrong size",
  "items": [
    {
      "orderItemId": "uuid",
      "qty": 1
    }
  ]
}
```

### Track Order
```http
GET /api/orders/tracking/ULC12345
```

## Checkout

### Create Order
```http
POST /api/checkout/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "variantId": "uuid",
      "qty": 2,
      "unitPrice": 299900
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "line1": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India",
    "phone": "+919876543210"
  },
  "billingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "line1": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India",
    "phone": "+919876543210"
  },
  "couponCode": "WELCOME10",
  "paymentMethod": "razorpay",
  "email": "user@example.com",
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "ULC12345",
      "totalAmount": 599800,
      "status": "pending",
      "paymentStatus": "unpaid"
    },
    "payment": {
      "method": "razorpay",
      "session": {
        "id": "order_razorpay_id",
        "amount": 59980000,
        "currency": "INR"
      },
      "keyId": "rzp_live_..."
    }
  }
}
```

### Check Serviceability
```http
GET /api/checkout/serviceability/400001?weight=500
```

### Validate Coupon
```http
POST /api/checkout/validate-coupon
Content-Type: application/json

{
  "code": "WELCOME10",
  "subtotal": 200000
}
```

## Payments

### Verify Payment
```http
POST /api/payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "uuid",
  "paymentData": {
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature"
  }
}
```

### Get Payment Status
```http
GET /api/payments/status/uuid
Authorization: Bearer <token>
```

### Get Payment Methods
```http
GET /api/payments/methods
```

## User Management

### Get User Addresses
```http
GET /api/users/addresses
Authorization: Bearer <token>
```

### Create Address
```http
POST /api/users/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "shipping",
  "firstName": "John",
  "lastName": "Doe",
  "line1": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India",
  "phone": "+919876543210",
  "isDefault": true
}
```

### Update Address
```http
PUT /api/users/addresses/uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "line1": "456 New Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400002",
  "country": "India",
  "phone": "+919876543211"
}
```

### Delete Address
```http
DELETE /api/users/addresses/uuid
Authorization: Bearer <token>
```

### Get Wishlist
```http
GET /api/users/wishlist?page=1&limit=10
Authorization: Bearer <token>
```

### Add to Wishlist
```http
POST /api/users/wishlist
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "uuid"
}
```

### Remove from Wishlist
```http
DELETE /api/users/wishlist/uuid
Authorization: Bearer <token>
```

### Get Notifications
```http
GET /api/users/notifications?page=1&limit=10&unread=true
Authorization: Bearer <token>
```

### Mark Notification as Read
```http
PUT /api/users/notifications/uuid/read
Authorization: Bearer <token>
```

## Admin Endpoints

All admin endpoints require admin role authentication.

### Get Dashboard Stats
```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

### Get All Products (Admin)
```http
GET /api/admin/products?page=1&limit=10&status=published&search=hoodie
Authorization: Bearer <admin_token>
```

### Create Product (Admin)
```http
POST /api/admin/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "New Product",
  "slug": "new-product",
  "description": "Product description",
  "category": "Hoodies",
  "status": "published",
  "featured": true,
  "variants": [
    {
      "sku": "NP-001-M",
      "price": 299900,
      "stockQty": 50,
      "attributes": {
        "size": "M",
        "color": "Black"
      }
    }
  ],
  "images": [
    {
      "url": "https://cdn.ulica.com/images/new-product.jpg",
      "altText": "New Product",
      "position": 0,
      "isPrimary": true
    }
  ]
}
```

### Update Product (Admin)
```http
PUT /api/admin/products/uuid
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Updated Product Title",
  "description": "Updated description",
  "status": "published"
}
```

### Delete Product (Admin)
```http
DELETE /api/admin/products/uuid
Authorization: Bearer <admin_token>
```

### Get All Orders (Admin)
```http
GET /api/admin/orders?page=1&limit=10&status=pending&paymentStatus=paid
Authorization: Bearer <admin_token>
```

### Update Order Status (Admin)
```http
PUT /api/admin/orders/uuid/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "TRK123456",
  "notes": "Order shipped via Blue Dart"
}
```

### Get Pending Reviews (Admin)
```http
GET /api/admin/reviews?page=1&limit=10&approved=false
Authorization: Bearer <admin_token>
```

### Approve Review (Admin)
```http
PUT /api/admin/reviews/uuid/approve
Authorization: Bearer <admin_token>
```

## Webhooks

### Razorpay Webhook
```http
POST /api/webhooks/razorpay
X-Razorpay-Signature: <signature>
Content-Type: application/json

{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxx",
        "order_id": "order_xxx",
        "status": "captured",
        "amount": 59980000,
        "currency": "INR"
      }
    }
  }
}
```

### PhonePe Webhook
```http
POST /api/webhooks/phonepe
X-VERIFY: <signature>
Content-Type: application/json

{
  "event": "payment.success",
  "data": {
    "transactionId": "TXN_xxx",
    "amount": 59980000,
    "status": "SUCCESS"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Detailed error information"]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Admin endpoints**: 1000 requests per 15 minutes per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## SDK Examples

### JavaScript/TypeScript
```typescript
class UlicaAPI {
  private baseURL = 'https://api.ulica.com/api';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    return response.json();
  }

  async getProducts(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products?${query}`);
  }

  async createOrder(orderData: any) {
    return this.request('/checkout/create-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
}
```

### Python
```python
import requests
from typing import Dict, Any

class UlicaAPI:
    def __init__(self, base_url: str = "https://api.ulica.com/api"):
        self.base_url = base_url
        self.token = None

    def set_token(self, token: str):
        self.token = token

    def request(self, endpoint: str, method: str = "GET", data: Dict = None):
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        url = f"{self.base_url}{endpoint}"
        response = requests.request(method, url, json=data, headers=headers)
        return response.json()

    def get_products(self, params: Dict = None):
        return self.request("/products", params=params)

    def create_order(self, order_data: Dict):
        return self.request("/checkout/create-order", "POST", order_data)
```

## Testing

### Postman Collection
Import the provided Postman collection for testing all endpoints:
- Environment variables for different stages
- Pre-request scripts for authentication
- Test scripts for response validation

### cURL Examples
```bash
# Get products
curl -X GET "https://api.ulica.com/api/products?page=1&limit=10"

# Create order
curl -X POST "https://api.ulica.com/api/checkout/create-order" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"variantId": "uuid", "qty": 1, "unitPrice": 299900}]}'
```

## Support

For API support and questions:
- Email: api-support@ulica.com
- Documentation: https://docs.ulica.com/api
- Status Page: https://status.ulica.com
