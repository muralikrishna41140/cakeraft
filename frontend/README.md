# Frontend - Next.js Application

This is the frontend application for the Billing System, built with Next.js 14, TypeScript, and TailwindCSS. It provides a modern, responsive interface for managing billing operations and products.

## 🏗️ Architecture

```
src/
├── app/                   # Next.js App Router
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page  
│   ├── products/         # Product management pages
│   ├── billing/          # Billing interface pages
│   ├── layout.tsx        # Root layout with providers
│   ├── page.tsx          # Home page (redirects)
│   └── globals.css       # Global styles and Tailwind
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI components (Button, Spinner, etc.)
│   ├── ProtectedRoute.tsx # Route protection wrapper
│   └── ...               # Feature-specific components
├── context/              # React Context providers
│   └── AuthContext.tsx   # Authentication state management
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
│   └── api.ts           # API client and endpoints
└── types/               # TypeScript type definitions
```

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue shades for main actions and branding
- **Success**: Green for positive actions and confirmations
- **Warning**: Yellow/Orange for caution and alerts
- **Danger**: Red for destructive actions and errors
- **Gray**: Various shades for text, backgrounds, and borders

### Components
Custom components built with TailwindCSS:

#### Button Component
```typescript
<Button variant="primary" size="md" isLoading={false}>
  Click me
</Button>
```

Variants: `primary`, `secondary`, `success`, `danger`, `outline`
Sizes: `sm`, `md`, `lg`

#### Loading Spinner
```typescript
<LoadingSpinner size="lg" />
```

#### Form Components
- Input fields with validation states
- Form labels and error messages
- Consistent styling across all forms

### Responsive Design
- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: CSS Grid and Flexbox for layouts
- **Touch Friendly**: Large tap targets for mobile interaction

## 🔐 Authentication System

### AuthContext
Centralized authentication state management:

```typescript
const { admin, isAuthenticated, login, logout, isLoading } = useAuth();
```

### Features
- JWT token storage in localStorage
- Automatic token validation
- Protected routes with redirection
- Session persistence across browser sessions
- Automatic logout on token expiration

### Login Flow
1. User enters credentials on login page
2. API call to backend authentication endpoint
3. Store JWT token and admin data in localStorage
4. Redirect to dashboard
5. Subsequent requests include token in Authorization header

### Route Protection
```typescript
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

## 📱 Pages Overview

### Home Page (`/`)
- Automatically redirects authenticated users to dashboard
- Redirects unauthenticated users to login

### Login Page (`/login`)
- Clean, professional login form
- Email and password validation
- Remember credentials functionality
- Error handling and user feedback
- Responsive design

### Dashboard (`/dashboard`)
- Overview of system status
- Quick stats (sales, orders, products)
- Main action buttons (Start Billing, Manage Products)
- Quick links to common functions
- Real-time clock and date display

### Product Management (`/products`)
- Product listing with search and filters
- Add/Edit/Delete products
- Image upload functionality
- Category management
- Bulk operations

### Billing Interface (`/billing`)
- Product selection and cart management
- Customer information form
- Quantity adjustments
- Total calculation
- Checkout process

## 🛠️ API Integration

### API Client (`lib/api.ts`)
Centralized API client with:
- Axios configuration
- Request/Response interceptors
- Automatic token attachment
- Error handling
- Base URL configuration

### API Functions
```typescript
// Authentication
await authAPI.login(email, password);
await authAPI.getProfile();

// Products
await productAPI.getProducts({ category, search, page });
await productAPI.createProduct(formData);
await productAPI.updateProduct(id, formData);

// Categories
await productAPI.getCategories();
await productAPI.createCategory({ name, description });
```

### Error Handling
- Network error detection
- 401 unauthorized handling (auto-logout)
- User-friendly error messages
- Retry logic for failed requests

## 🎯 State Management

### React Context
- **AuthContext**: User authentication state
- **CartContext**: Shopping cart state (future implementation)
- **ThemeContext**: UI theme preferences (future implementation)

### Local State
- React useState for component-level state
- React useReducer for complex state logic
- React useEffect for side effects and API calls

### Form State
- React Hook Form for form validation
- Controlled components for user input
- Real-time validation feedback

## 🎨 Styling System

### TailwindCSS Configuration
Custom configuration in `tailwind.config.js`:
- Extended color palette
- Custom animations
- Responsive breakpoints
- Component utilities

### CSS Classes
Custom utility classes in `globals.css`:
- `.btn-*`: Button variants and sizes
- `.input`: Standard input styling
- `.card-*`: Card component styles
- `.form-*`: Form component utilities

### Animations
- Fade-in animations for page transitions
- Loading spinners for async operations
- Hover effects for interactive elements
- Smooth transitions for state changes

## 📋 Form Validation

### React Hook Form Integration
```typescript
const { register, handleSubmit, formState: { errors } } = useForm();

<input
  {...register('email', {
    required: 'Email is required',
    pattern: { value: /email-regex/, message: 'Invalid email' }
  })}
/>
```

### Validation Rules
- Required field validation
- Email format validation
- Password strength requirements
- File type and size validation
- Custom validation functions

## 🔔 User Feedback

### Toast Notifications
Using React Hot Toast for user feedback:
- Success messages for completed actions
- Error messages for failed operations
- Loading states for async operations
- Custom styling to match design system

### Loading States
- Page-level loading spinners
- Button loading states
- Skeleton screens for content loading
- Progressive loading for large datasets

## 📱 Mobile Optimization

### Responsive Features
- Collapsible navigation menu
- Touch-friendly buttons and links
- Optimized form layouts
- Mobile-first responsive images
- Appropriate font sizes

### Performance
- Code splitting for faster initial loads
- Image optimization with Next.js
- Lazy loading for non-critical components
- Minimal bundle size

## 🚀 Performance

### Next.js Features
- Static Site Generation (SSG) where appropriate
- Server-Side Rendering (SSR) for dynamic content
- Automatic code splitting
- Image optimization
- Font optimization

### Optimization Techniques
- Lazy loading components
- Memoization with React.memo
- Efficient re-rendering with useCallback/useMemo
- Optimized bundle size with tree shaking

## 🔧 Development Tools

### TypeScript
- Strict type checking
- Interface definitions for API responses
- Type-safe component props
- Automated IntelliSense support

### ESLint & Prettier
- Code quality enforcement
- Consistent code formatting
- Automated fixes for common issues
- Pre-commit hooks (future implementation)

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🌐 Deployment

### Build Process
1. Run `npm run build` to create production build
2. Next.js generates optimized static files
3. Deploy `.next` folder to hosting platform

### Environment Variables
Ensure production environment has:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Popular Deployment Options
- **Vercel**: Native Next.js deployment platform
- **Netlify**: Static site deployment with serverless functions
- **AWS**: EC2, S3, or Lambda deployment
- **Docker**: Containerized deployment

## 🔍 Debugging

### Development Tools
- React Developer Tools browser extension
- Next.js built-in debugging features
- Browser developer tools
- Network tab for API request monitoring

### Common Issues
**API Connection Problems**
```bash
# Check API URL
echo $NEXT_PUBLIC_API_URL

# Test API connectivity
curl $NEXT_PUBLIC_API_URL/health
```

**Authentication Issues**
- Clear localStorage: `localStorage.clear()`
- Check token validity in browser dev tools
- Verify API endpoint responses

**Build Issues**
- Check TypeScript errors: `npm run type-check`
- Verify all dependencies are installed
- Clear Next.js cache: `rm -rf .next`

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use existing component patterns
3. Maintain responsive design principles
4. Add proper error handling
5. Write descriptive component props interfaces

For more information, see the main project README.