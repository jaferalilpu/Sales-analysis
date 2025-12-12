# 🧪 ULICA - QA Testing Checklist

This document provides comprehensive testing checklists for manual QA and automated testing coverage.

## 📱 Responsive Design Checklist

### Mobile Devices (< 768px)

#### Homepage
- [ ] Hero banner displays correctly
- [ ] Product cards stack vertically
- [ ] Navigation menu collapses to hamburger menu
- [ ] Cart icon is visible and accessible
- [ ] Search functionality works on mobile
- [ ] Footer links are readable and clickable
- [ ] Drop banner is responsive
- [ ] "Coming Soon" popup modal displays correctly on mobile
- [ ] Timer for upcoming drop is visible
- [ ] Login/Register links work

#### Product Pages
- [ ] Product images display correctly (carousel works)
- [ ] Product details are readable
- [ ] Variant selection (size, color) is usable
- [ ] Add to cart button is accessible
- [ ] Related products section displays properly
- [ ] Reviews section is scrollable

#### Cart & Checkout
- [ ] Cart items display correctly
- [ ] Quantity selector is usable
- [ ] Remove item button works
- [ ] Checkout form fields are properly sized
- [ ] Payment buttons are accessible
- [ ] Order summary is visible

#### Admin Panel
- [ ] Sidebar collapses on mobile
- [ ] Tables are horizontally scrollable
- [ ] Form inputs are properly sized
- [ ] Action buttons are accessible
- [ ] Charts/graphs display correctly
- [ ] Toast notifications appear correctly

### Tablet Devices (768px - 1024px)

#### General
- [ ] Layout adapts to tablet width
- [ ] Two-column layouts work correctly
- [ ] Images scale appropriately
- [ ] Navigation is accessible
- [ ] Forms are properly sized

### Desktop (> 1024px)

#### General
- [ ] Full layout displays correctly
- [ ] Sidebar navigation is always visible (admin)
- [ ] Multi-column layouts work
- [ ] Hover states work correctly
- [ ] Keyboard navigation works

## 🌓 Dark Mode Checklist

### Theme Toggle
- [ ] Theme toggle button is visible in admin header
- [ ] Clicking toggle switches between light/dark
- [ ] Theme preference persists after page refresh
- [ ] Theme is applied immediately on toggle

### Light Mode Appearance
- [ ] Background colors are light/white
- [ ] Text is dark and readable
- [ ] Borders are visible
- [ ] Inputs have clear borders
- [ ] Cards have proper shadows
- [ ] Icons are visible

### Dark Mode Appearance
- [ ] Background colors are dark
- [ ] Text is light and readable
- [ ] Borders are visible (lighter borders)
- [ ] Inputs have clear borders
- [ ] Cards have subtle borders/shadows
- [ ] Icons are visible
- [ ] No contrast issues (WCAG AA compliant)

### Components in Dark Mode

#### Admin Panel
- [ ] Sidebar background is dark
- [ ] Main content area background is dark
- [ ] Tables have proper contrast
- [ ] Form inputs are visible
- [ ] Buttons are visible and accessible
- [ ] Charts/graphs are readable
- [ ] Toast notifications are visible
- [ ] Modals are visible
- [ ] Loading spinners are visible

#### Storefront
- [ ] Header background is dark
- [ ] Product cards are visible
- [ ] Footer is readable
- [ ] Forms are usable
- [ ] Buttons are accessible

### Cross-Browser Dark Mode
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## 🎨 UI/UX Testing Checklist

### Toast Notifications
- [ ] Success toasts appear on successful actions
- [ ] Error toasts appear on errors
- [ ] Info toasts appear for information
- [ ] Warning toasts appear for warnings
- [ ] Loading toasts appear during async operations
- [ ] Toasts are dismissible
- [ ] Toasts have proper positioning
- [ ] Toasts work in both light and dark mode

### Loading States
- [ ] Loading spinner appears during API calls
- [ ] Skeleton loaders show for content loading
- [ ] Loading overlay appears for full-page loads
- [ ] Buttons show loading state during submission
- [ ] Loading states are accessible (ARIA)

### Forms
- [ ] Required fields are marked
- [ ] Validation errors display correctly
- [ ] Form submission works
- [ ] Form reset works
- [ ] Field errors clear on input
- [ ] Success messages appear after submission

### Navigation
- [ ] All links work correctly
- [ ] Active route is highlighted (admin)
- [ ] Breadcrumbs work (if applicable)
- [ ] Back button works
- [ ] Deep linking works

## 🔒 Security & Authentication Testing

### Authentication
- [ ] Login works correctly
- [ ] Logout works correctly
- [ ] Registration works
- [ ] Password reset works
- [ ] Email verification works
- [ ] Session persists correctly
- [ ] Session expires correctly
- [ ] Protected routes redirect correctly

### Authorization
- [ ] Admin routes require admin role
- [ ] User routes require authentication
- [ ] API routes validate roles correctly
- [ ] Unauthorized access is blocked

## 💳 Payment Testing

### Razorpay
- [ ] Payment form displays correctly
- [ ] Payment can be initiated
- [ ] Payment success is handled
- [ ] Payment failure is handled
- [ ] Webhook verification works
- [ ] Payment transactions are logged

### PhonePe
- [ ] Payment form displays correctly
- [ ] Payment can be initiated
- [ ] Payment success is handled
- [ ] Payment failure is handled
- [ ] Webhook verification works

## 📦 Shipping Testing

### Shiprocket Integration
- [ ] Order creation in Shiprocket works
- [ ] Label generation works
- [ ] Label can be viewed/downloaded
- [ ] Pickup scheduling works
- [ ] Tracking information updates
- [ ] Webhook updates order status
- [ ] Return order creation works

## 📧 Email Testing

### Email Sending
- [ ] Verification emails are sent
- [ ] Password reset emails are sent
- [ ] Order confirmation emails are sent
- [ ] Welcome emails are sent
- [ ] Email logs are created
- [ ] Failed emails are logged
- [ ] Retry mechanism works

## 🛍️ E-commerce Flow Testing

### Product Management
- [ ] Products can be created (admin)
- [ ] Products can be edited (admin)
- [ ] Products can be deleted (admin)
- [ ] Product variants work
- [ ] Product images upload correctly
- [ ] Product search works
- [ ] Product filtering works

### Cart Functionality
- [ ] Add to cart works
- [ ] Remove from cart works
- [ ] Update quantity works
- [ ] Cart persists (localStorage/cookies)
- [ ] Cart syncs when logged in
- [ ] Cart count updates correctly

### Checkout Flow
- [ ] Address can be entered/selected
- [ ] Payment method can be selected
- [ ] Order summary is correct
- [ ] Order can be placed
- [ ] Order confirmation is shown
- [ ] Order appears in order history

### Order Management
- [ ] Orders can be viewed (admin)
- [ ] Order status can be updated (admin)
- [ ] Orders can be filtered
- [ ] Order details are accurate
- [ ] Shipping labels can be generated

## 🔧 Admin Panel Testing

### Dashboard
- [ ] Dashboard loads correctly
- [ ] Statistics are accurate
- [ ] Charts display correctly
- [ ] Quick actions work
- [ ] Low stock alerts appear
- [ ] Drop performance metrics display

### Products Management
- [ ] Products list loads
- [ ] Products can be filtered/sorted
- [ ] Products can be created/edited/deleted
- [ ] Product variants can be managed
- [ ] Inventory updates work

### Drops Management
- [ ] Drops can be created
- [ ] Drops can be edited
- [ ] Drops can be published/unpublished
- [ ] Products can be assigned to drops
- [ ] Drop status updates correctly
- [ ] Drop analytics display

### Orders Management
- [ ] Orders list loads
- [ ] Orders can be filtered/search
- [ ] Order status can be updated
- [ ] Bulk actions work
- [ ] Labels can be generated
- [ ] Info sheets can be generated

### Customers Management
- [ ] Customers list loads
- [ ] Customer details can be viewed
- [ ] Customer orders can be viewed
- [ ] Customer metrics display correctly

### Settings
- [ ] Settings can be saved
- [ ] Integration tests work
- [ ] Email settings work
- [ ] Payment settings work
- [ ] Shipping settings work

## 🚀 Performance Testing

### Page Load Times
- [ ] Homepage loads < 2s
- [ ] Product pages load < 2s
- [ ] Admin dashboard loads < 2s
- [ ] API responses are < 500ms

### Image Optimization
- [ ] Images are optimized
- [ ] Lazy loading works
- [ ] Image placeholders show

### Code Splitting
- [ ] JavaScript bundles are split
- [ ] Only necessary code loads

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Escape key closes modals

### Screen Reader
- [ ] ARIA labels are present
- [ ] Alt text for images
- [ ] Form labels are associated
- [ ] Error messages are announced

### Color Contrast
- [ ] Text meets WCAG AA standards
- [ ] Links are distinguishable
- [ ] Buttons are visible

## 🌐 Cross-Browser Testing

### Browsers to Test
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Features to Verify
- [ ] Layout renders correctly
- [ ] JavaScript works
- [ ] Forms work
- [ ] Payments work
- [ ] Dark mode works

## 📝 Test Results Template

### Test Date: _______________
### Tester: _______________
### Environment: _______________

### Issues Found:
1. [Issue description] - [Priority: High/Medium/Low]
2. [Issue description] - [Priority: High/Medium/Low]

### Passed: _____ / _____
### Failed: _____ / _____

## 🎯 Test Scenarios

### Scenario 1: Complete Purchase Flow
1. Browse products
2. Add product to cart
3. Go to checkout
4. Enter shipping address
5. Select payment method
6. Complete payment
7. Verify order confirmation
8. Check order in admin panel
9. Generate shipping label
10. Update order status

### Scenario 2: Admin Product Management
1. Login as admin
2. Navigate to Products
3. Create new product
4. Add variants
5. Upload images
6. Publish product
7. Edit product
8. View product on storefront
9. Delete product

### Scenario 3: Drop Management
1. Create new drop
2. Set dates
3. Assign products
4. Publish drop
5. Verify drop appears on homepage
6. Edit drop
7. Unpublish drop

## 📊 Testing Metrics

- **Test Coverage**: Target 80%+ for critical paths
- **Pass Rate**: Target 95%+ before release
- **Critical Bugs**: Must be 0 before production
- **Performance**: All pages < 2s load time

## 🔄 Regression Testing

After each deployment, verify:
- [ ] Critical user flows still work
- [ ] No new errors in console
- [ ] No broken links
- [ ] Payment flow works
- [ ] Admin panel functions

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Playwright Documentation](https://playwright.dev/) (if using)

