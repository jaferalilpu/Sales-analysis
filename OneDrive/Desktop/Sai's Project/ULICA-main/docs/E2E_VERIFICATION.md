# 🔄 ULICA - End-to-End Verification Checklist

This document provides a comprehensive E2E verification checklist for the complete user journey: **Product → Cart → Payment → Label → Tracking → Email**.

## 🎯 Complete Flow Verification

### Phase 1: Product Discovery & Selection

#### 1.1 Homepage
- [ ] Homepage loads correctly
- [ ] Live drop banner displays (if drop is live)
- [ ] "Coming Soon" modal appears (if no live drop)
- [ ] Featured products section displays
- [ ] Product cards are clickable
- [ ] Navigation menu works
- [ ] Search functionality works
- [ ] Cart icon shows correct count

#### 1.2 Product Listing
- [ ] Navigate to `/products`
- [ ] Products list loads
- [ ] Filters work (category, price, etc.)
- [ ] Sorting works
- [ ] Pagination works
- [ ] Product cards display correctly
- [ ] Clicking product navigates to detail page

#### 1.3 Product Detail Page
- [ ] Product images display correctly
- [ ] Image carousel works
- [ ] Product title, price, description visible
- [ ] Variant selection works (size, color, etc.)
- [ ] Stock availability shows correctly
- [ ] "Add to Cart" button works
- [ ] "Add to Wishlist" button works
- [ ] Reviews section displays
- [ ] Related products section displays

### Phase 2: Cart Management

#### 2.1 Add to Cart
- [ ] Click "Add to Cart" on product page
- [ ] Toast notification appears: "Product added to cart"
- [ ] Cart count in header updates
- [ ] Cart icon shows correct number

#### 2.2 View Cart
- [ ] Navigate to `/cart`
- [ ] Cart items display correctly
- [ ] Product images, names, prices show
- [ ] Quantity selector works
- [ ] Update quantity updates total
- [ ] Remove item button works
- [ ] Cart total calculates correctly
- [ ] Shipping cost shows (if applicable)
- [ ] Discount/coupon code input works
- [ ] "Proceed to Checkout" button works

#### 2.3 Cart Persistence
- [ ] Cart persists on page refresh (guest)
- [ ] Cart syncs when logged in
- [ ] Cart persists across browser sessions (logged in)

### Phase 3: Checkout Process

#### 3.1 Checkout Page
- [ ] Navigate to `/checkout`
- [ ] Shipping address form displays
- [ ] Can select saved address
- [ ] Can add new address
- [ ] Address validation works
- [ ] Payment method selection works
- [ ] Order summary displays correctly
- [ ] Total amount is correct

#### 3.2 Address Management
- [ ] Can add new shipping address
- [ ] Can edit existing address
- [ ] Can delete address (with confirmation)
- [ ] Address validation works
- [ ] Pincode validation works

#### 3.3 Payment Method Selection
- [ ] Razorpay option available
- [ ] PhonePe option available
- [ ] COD option available (if enabled)
- [ ] Selected method is highlighted

### Phase 4: Payment Processing

#### 4.1 Razorpay Payment
- [ ] Click "Pay with Razorpay"
- [ ] Razorpay checkout opens
- [ ] Can enter card details (test mode)
- [ ] Payment succeeds
- [ ] Redirects to success page
- [ ] Order confirmation shows
- [ ] Order number is displayed
- [ ] Payment transaction is logged in database

#### 4.2 PhonePe Payment
- [ ] Click "Pay with PhonePe"
- [ ] PhonePe checkout opens
- [ ] Payment succeeds
- [ ] Redirects to success page
- [ ] Order confirmation shows
- [ ] Payment transaction is logged

#### 4.3 Payment Verification
- [ ] Backend verifies payment signature
- [ ] Order status updates to "confirmed"
- [ ] Payment status updates to "paid"
- [ ] Order appears in admin panel
- [ ] Payment transaction record created

### Phase 5: Order Processing (Admin)

#### 5.1 Order Appears in Admin
- [ ] Login as admin
- [ ] Navigate to `/admin/orders`
- [ ] New order appears in list
- [ ] Order details are correct
- [ ] Customer information shows
- [ ] Order items show correctly
- [ ] Payment status shows "paid"
- [ ] Order status shows "confirmed"

#### 5.2 Shiprocket Integration
- [ ] Click "Create Shiprocket Order"
- [ ] Shiprocket order created successfully
- [ ] Shipment ID is stored
- [ ] Order status updates
- [ ] Click "Generate Label"
- [ ] Shipping label generates
- [ ] Label URL is stored
- [ ] Can view/download label PDF
- [ ] Click "Schedule Pickup"
- [ ] Pickup scheduled successfully
- [ ] Pickup status updates

#### 5.3 Product Info Sheet
- [ ] Click "Generate Info Sheet"
- [ ] Info sheet generates successfully
- [ ] PDF contains:
  - [ ] Product details
  - [ ] Customer information
  - [ ] Shipping address
  - [ ] Barcode
  - [ ] Order number
- [ ] Can download info sheet
- [ ] Can print info sheet

### Phase 6: Shipping & Tracking

#### 6.1 Label Generation
- [ ] Shipping label is generated
- [ ] Label PDF is viewable
- [ ] Label contains:
  - [ ] Shipping address
  - [ ] Return address
  - [ ] AWB number
  - [ ] Barcode
- [ ] Can download label
- [ ] Can print label

#### 6.2 Tracking
- [ ] AWB number is stored
- [ ] Navigate to tracking page
- [ ] Enter AWB number
- [ ] Tracking information displays
- [ ] Status updates show:
  - [ ] Order Placed
  - [ ] Picked Up
  - [ ] In Transit
  - [ ] Out for Delivery
  - [ ] Delivered
- [ ] Tracking timeline displays correctly

#### 6.3 Webhook Updates
- [ ] Shiprocket sends webhook
- [ ] Backend receives webhook
- [ ] Webhook signature verified
- [ ] Order status updates automatically
- [ ] Shipment log created
- [ ] Frontend updates via SSE (if enabled)

### Phase 7: Email Notifications

#### 7.1 Order Confirmation Email
- [ ] Email sent to customer
- [ ] Email contains:
  - [ ] Order number
  - [ ] Order items
  - [ ] Total amount
  - [ ] Shipping address
  - [ ] Tracking link (if available)
- [ ] Email logged in database
- [ ] Email status shows "sent"

#### 7.2 Shipping Notification Email
- [ ] Email sent when order ships
- [ ] Email contains tracking information
- [ ] AWB number included
- [ ] Tracking link included

#### 7.3 Delivery Confirmation Email
- [ ] Email sent when order delivered
- [ ] Email contains delivery confirmation
- [ ] Order status updated

#### 7.4 Email Logging
- [ ] All emails logged in `/admin/settings/email-history`
- [ ] Email status shows correctly
- [ ] Failed emails show error
- [ ] Retry mechanism works

### Phase 8: Order Completion

#### 8.1 Customer View
- [ ] Customer can view order in dashboard
- [ ] Order status shows correctly
- [ ] Tracking information available
- [ ] Can download invoice
- [ ] Can contact support

#### 8.2 Admin View
- [ ] Order marked as delivered
- [ ] Order status updated
- [ ] All logs are complete
- [ ] Payment transaction recorded
- [ ] Email logs show all sent emails

## 🔍 Verification Checklist by Component

### Frontend Components

#### Product Pages
- [ ] Product listing page loads
- [ ] Product detail page loads
- [ ] Images display correctly
- [ ] Variants work
- [ ] Add to cart works
- [ ] Toast notifications appear

#### Cart
- [ ] Cart page loads
- [ ] Items display correctly
- [ ] Quantity updates work
- [ ] Remove works
- [ ] Total calculates correctly

#### Checkout
- [ ] Checkout page loads
- [ ] Address form works
- [ ] Payment selection works
- [ ] Order summary correct
- [ ] Payment redirects work

#### Admin Panel
- [ ] Orders list loads
- [ ] Order details show
- [ ] Shiprocket actions work
- [ ] Label generation works
- [ ] Info sheet generation works

### Backend APIs

#### Product APIs
- [ ] `GET /api/products` works
- [ ] `GET /api/products/:id` works
- [ ] `GET /api/admin/products` works
- [ ] `POST /api/admin/products` works
- [ ] `PUT /api/admin/products/:id` works
- [ ] `DELETE /api/admin/products/:id` works

#### Cart APIs
- [ ] `GET /api/cart` works
- [ ] `POST /api/cart` works
- [ ] `PUT /api/cart/:id` works
- [ ] `DELETE /api/cart/:id` works

#### Checkout APIs
- [ ] `POST /api/checkout/create-order` works
- [ ] `POST /api/checkout/verify-payment` works
- [ ] Payment verification works

#### Order APIs
- [ ] `GET /api/orders` works
- [ ] `GET /api/admin/orders` works
- [ ] `PUT /api/admin/orders/:id/status` works
- [ ] `POST /api/admin/orders/:id/info-sheet/generate` works

#### Shiprocket APIs
- [ ] `POST /api/shiprocket/order/:id/create` works
- [ ] `GET /api/shiprocket/order/:id/label` works
- [ ] `POST /api/shiprocket/order/:id/pickup` works
- [ ] `GET /api/shiprocket/order/track/:awb` works
- [ ] `POST /api/shiprocket/webhook` works

#### Email APIs
- [ ] Email sending works
- [ ] Email logging works
- [ ] `GET /api/admin/email-logs` works
- [ ] `POST /api/admin/email-logs/:id/retry` works

## 🐛 Common Issues to Check

### Payment Issues
- [ ] Payment signature verification fails
- [ ] Payment webhook not received
- [ ] Order status not updating after payment
- [ ] Payment transaction not logged

### Shipping Issues
- [ ] Shiprocket order creation fails
- [ ] Label generation fails
- [ ] AWB number not stored
- [ ] Tracking not working
- [ ] Webhook not updating status

### Email Issues
- [ ] Email not sending
- [ ] Email not logged
- [ ] Email template errors
- [ ] Retry mechanism not working

### UI Issues
- [ ] Toast notifications not appearing
- [ ] Loading states not showing
- [ ] Skeleton loaders not displaying
- [ ] Dark mode not working
- [ ] Responsive layout broken

## 📊 Success Criteria

### Functional Requirements
- ✅ Complete flow works end-to-end
- ✅ All payments process correctly
- ✅ All emails send successfully
- ✅ All labels generate correctly
- ✅ All tracking updates work

### Performance Requirements
- ✅ Page loads < 2 seconds
- ✅ API responses < 500ms
- ✅ Images load quickly
- ✅ No console errors

### Quality Requirements
- ✅ No broken links
- ✅ No missing images
- ✅ All forms validate
- ✅ All errors handled gracefully

## 🚀 Test Execution

### Prerequisites
1. Backend server running on `http://localhost:5001`
2. Frontend server running on `http://localhost:3000`
3. Database seeded with test data
4. Admin user created
5. Test payment credentials configured

### Test Steps
1. Start with product discovery
2. Add product to cart
3. Proceed to checkout
4. Complete payment
5. Verify order in admin
6. Generate shipping label
7. Schedule pickup
8. Track shipment
9. Verify emails sent
10. Complete order

### Expected Results
- All steps complete successfully
- No errors in console
- All data persisted correctly
- All notifications sent
- All statuses updated

## 📝 Test Results Template

### Test Date: _______________
### Tester: _______________
### Environment: _______________

### Flow Completion: ✅ / ❌
### Issues Found: _______________
### Notes: _______________

---

**Last Updated**: [Current Date]
**Version**: 1.0.0

