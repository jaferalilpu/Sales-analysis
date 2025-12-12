# ULICA Toast Notification System

A comprehensive, user-friendly toast notification system built with `react-hot-toast` and integrated throughout the ULICA e-commerce project.

## 🚀 Features

### ✅ **Toast Types**
- **Success**: Green background with checkmark icon
- **Error**: Red background with error icon  
- **Info**: Blue background with info icon
- **Loading**: Yellow background with spinner icon
- **Custom**: Fully customizable styling and icons

### ✅ **ULICA-Specific Actions**
- **Cart Operations**: Add, remove, update quantity, clear cart
- **Order Management**: Order placement, processing, success/failure
- **Authentication**: Login, register, logout success/failure
- **Payment Processing**: Payment success/failure with amounts
- **Wishlist Management**: Add/remove from wishlist
- **Error Handling**: Network errors, server errors, validation errors

### ✅ **Behavior & UX**
- **Auto-dismiss**: 3-5 seconds based on message type
- **Manual Close**: Click to dismiss any toast
- **Toast Stacking**: Multiple toasts stack vertically
- **Position**: Top-right corner (responsive)
- **Animations**: Smooth fade-in/fade-out transitions
- **Accessibility**: ARIA labels and screen reader support

## 📁 File Structure

```
frontend/
├── lib/
│   ├── toast.ts                 # Main toast configuration and functions
│   └── TOAST_README.md         # This documentation
├── contexts/
│   ├── CartContext.tsx         # Cart management with toast integration
│   └── WishlistContext.tsx     # Wishlist management with toast integration
├── components/
│   ├── products/
│   │   └── ProductCard.tsx     # Product card with cart/wishlist toasts
│   └── checkout/
│       └── CheckoutForm.tsx    # Checkout form with order/payment toasts
└── app/
    ├── login/page.tsx          # Login with auth toasts
    ├── register/page.tsx       # Registration with auth toasts
    └── toast-demo/page.tsx     # Demo page for all toast features
```

## 🛠️ Usage

### Basic Toast Functions

```typescript
import { showToast, ulicaToasts, withToast } from '@/lib/toast';

// Basic toast types
showToast.success('Operation successful!');
showToast.error('Something went wrong');
showToast.info('Here is some information');
showToast.loading('Processing...');

// ULICA-specific toasts
ulicaToasts.addedToCart('Product Name');
ulicaToasts.orderPlaced('UL-2024-001');
ulicaToasts.loginSuccess('John Doe');
ulicaToasts.paymentSuccess(2500);
```

### Async Actions with Toast

```typescript
import { withToast } from '@/lib/toast';

// Wrap async operations with automatic toast handling
await withToast(
  async () => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      throw new Error('Order failed');
    }
    
    return response.json();
  },
  {
    loading: 'Processing your order...',
    success: (result) => `Order #${result.orderNumber} placed successfully!`,
    error: (error) => `Order failed: ${error.message}`,
  }
);
```

### Cart Integration

```typescript
import { useCart } from '@/contexts/CartContext';

function ProductCard({ product }) {
  const { addToCart, removeFromCart, updateQuantity } = useCart();

  const handleAddToCart = async () => {
    await addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    // Toast notification is automatically shown
  };
}
```

### Wishlist Integration

```typescript
import { useWishlist } from '@/contexts/WishlistContext';

function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleToggleWishlist = async () => {
    await toggleWishlist({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    // Toast notification is automatically shown
  };
}
```

## 🎨 Customization

### Toast Configuration

```typescript
// In lib/toast.ts
const toastConfig = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    background: '#363636',
    color: '#fff',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'Helvetica Neue, Arial, sans-serif',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  // ... more configuration
};
```

### Custom Toast Messages

```typescript
// Create custom toast messages
ulicaToasts.custom('Custom message', 'success', {
  icon: '🎉',
  duration: 6000,
});

// Or use the base showToast function
showToast.custom('Custom styled message', {
  style: {
    background: '#purple',
    color: '#white',
  },
  icon: '⭐',
});
```

## 🔧 Integration Examples

### Login Component

```typescript
// In app/login/page.tsx
import { ulicaToasts, withToast } from '@/lib/toast';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  await withToast(
    async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        ulicaToasts.loginSuccess(data.user.firstName);
        // Handle successful login
      } else {
        throw new Error('Login failed');
      }
    },
    {
      loading: 'Signing you in...',
      error: 'Login failed. Please try again.',
    }
  );
};
```

### Checkout Component

```typescript
// In components/checkout/CheckoutForm.tsx
import { ulicaToasts, withToast } from '@/lib/toast';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  await withToast(
    async () => {
      // Process order
      const order = await createOrder(orderData);
      
      // Process payment
      if (paymentMethod === 'razorpay') {
        await processRazorpayPayment(order);
      }
      
      ulicaToasts.orderPlaced(order.orderNumber);
      ulicaToasts.paymentSuccess(order.total);
    },
    {
      loading: 'Processing your order...',
      error: 'Order processing failed',
    }
  );
};
```

## 📱 Responsive Design

The toast system is fully responsive and works on:
- **Desktop**: Top-right positioning with proper spacing
- **Tablet**: Adjusted positioning and sizing
- **Mobile**: Full-width toasts with touch-friendly close buttons

## ♿ Accessibility

- **ARIA Labels**: All interactive elements have proper labels
- **Screen Reader Support**: Toast messages are announced to screen readers
- **Keyboard Navigation**: Toasts can be dismissed with keyboard
- **Focus Management**: Proper focus handling during toast interactions

## 🧪 Testing

Visit `/toast-demo` to test all toast features:
- Basic toast types
- ULICA-specific actions
- Async operations
- Error scenarios
- Multiple toast stacking
- Responsive behavior

## 🚀 Performance

- **Lightweight**: Minimal bundle size impact
- **Efficient**: Automatic cleanup of dismissed toasts
- **Optimized**: Debounced toast creation for rapid actions
- **Memory Safe**: Proper cleanup of event listeners and timeouts

## 🔄 Future Enhancements

- **Toast Persistence**: Save important toasts across page reloads
- **Toast Categories**: Group related toasts together
- **Custom Animations**: More animation options
- **Sound Notifications**: Audio feedback for important actions
- **Toast Analytics**: Track toast interaction patterns

## 📝 Notes

- All toast functions are async and return Promise<void>
- Toast IDs are returned for manual dismissal
- Error handling is built into all ULICA-specific functions
- The system integrates seamlessly with existing ULICA styling
- All toasts respect the user's reduced motion preferences

---

**Built with ❤️ for ULICA - Streetwear Fashion Brand**
