---
applyTo: '**'
---

# 🎂 Sweet Creations Cake Business - Complete Billing & Management System

## Project Overview
This is a comprehensive full-stack web application designed specifically for a cake business, providing complete product management, advanced billing system, customer loyalty programs, revenue analytics, and administrative capabilities. The system is optimized for made-to-order cake businesses with intelligent features for customer retention and business growth.

## 🏗️ Technical Architecture

### Backend (Express.js + MongoDB + Google Sheets Integration)
- **Framework**: Express.js with ES6 modules
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer for cake image handling
- **External APIs**: Google Sheets API for revenue archival
- **Services**: Loyalty calculation, Revenue aggregation, Data export
- **Port**: 5001
- **Location**: `/backend/src/`

#### Enhanced Backend Structure:
```
backend/src/
├── controllers/
│   ├── authController.js       # Admin authentication logic
│   ├── productController.js    # Product & category CRUD operations
│   └── checkoutController.js   # Billing system with loyalty integration
├── middleware/
│   ├── auth.js                # JWT token verification
│   └── upload.js              # File upload handling
├── models/
│   ├── Admin.js               # Admin user schema
│   ├── Category.js            # Cake category schema
│   ├── Product.js             # Cake product schema (no stock field)
│   └── Bill.js                # Customer bills with loyalty tracking
├── services/
│   ├── loyaltyService.js      # 3rd purchase discount logic
│   └── googleSheetsService.js # Revenue export to Google Sheets
├── routes/
│   ├── auth.js                # Authentication routes
│   ├── products.js            # Product & category API routes
│   ├── checkout.js            # Billing and loyalty routes
│   └── revenue.js             # Analytics and export routes
├── scripts/
│   ├── generateSampleRevenue.js     # Test data generation
│   └── generateLoyaltyTestData.js   # Loyalty test scenarios
└── server.js                  # Main server configuration
```

### Frontend (Next.js 14 + TypeScript + Advanced Charts)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom cake business theme
- **Forms**: React Hook Form with validation
- **Charts**: Recharts for revenue analytics
- **UI Components**: Custom component library with loyalty features
- **Port**: 3000 (or 3001 if 3000 is occupied)
- **Location**: `/frontend/src/`

#### Enhanced Frontend Structure:
```
frontend/src/
├── app/
│   ├── categories/
│   │   └── manage/              # Category management page
│   ├── dashboard/               # Enhanced admin dashboard with analytics
│   ├── login/                  # Authentication
│   ├── billing/                # Complete billing system with loyalty
│   ├── products/
│   │   ├── add/                # Add new cake product
│   │   └── page.tsx            # Products listing
│   └── layout.tsx              # Root layout with theme
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── RevenueChart.tsx    # 30-day revenue analytics chart
│   │   ├── RevenueCard.tsx     # Today's revenue display
│   │   └── OrdersCard.tsx      # Order count display
│   └── ProtectedRoute.tsx      # Route protection
├── lib/
│   └── api.ts                  # Enhanced API client with loyalty & revenue
├── services/
│   └── loyaltyService.ts       # Frontend loyalty utilities
└── types/
    └── index.ts                # Complete TypeScript definitions
```

## 🎨 Design System & Theme

### Color Palette (Cake Business Themed)
- **Primary**: Pink/Rose gradients (#ec4899 to #f43f5e)
- **Background**: Soft rose and orange gradients
- **Accents**: Warm pastels perfect for bakery aesthetic
- **Text**: Dark grays with pink accents

### Visual Elements
- Floating cake and chef hat decorative elements
- Gradient cards with subtle shadows
- Smooth hover animations and transitions
- Responsive design for all device sizes
- Beautiful modal dialogs for forms

## 🔐 Authentication System
- JWT-based admin authentication
- Protected routes for all admin functionality
- Token stored in localStorage
- Automatic redirect on authentication failure
- Password change functionality

## 📊 Database Schema

### Admin Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Category Model
```javascript
{
  name: String (required),
  description: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## 📊 Database Schema

### Admin Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Category Model
```javascript
{
  name: String (required),
  description: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model (Optimized for Cake Business)
```javascript
{
  name: String (required),           // Cake name
  description: String (required),    // Cake description
  price: Number (required),          // Cake price
  category: ObjectId (required),     // Reference to Category
  image: String (optional),          // Image filename
  createdAt: Date,
  updatedAt: Date
}
```

### Bill Model (Enhanced with Loyalty Tracking)
```javascript
{
  items: [{
    productId: ObjectId (required),   // Reference to Product
    name: String (required),          // Cake name
    quantity: Number (required),      // Quantity ordered
    price: Number (required),         // Unit price
    discount: Number (default: 0),   // Item-level discount
    discountType: String             // 'percentage' or 'fixed'
  }],
  subtotal: Number (required),       // Total before discounts
  totalDiscount: Number (default: 0), // Total discount applied
  total: Number (required),          // Final amount
  customerInfo: {
    name: String (required),         // Customer name
    phone: String (required)         // Customer phone (loyalty tracking)
  },
  billNumber: String (unique),       // Auto-generated bill number
  createdAt: Date,
  updatedAt: Date
}
```

**Note**: Stock quantity field has been completely removed as it's not relevant for made-to-order cake businesses.

## 🚀 Key Features

### ✅ Completed Features
1. **Product Management**
   - Add new cake products with image upload
   - Edit existing products (form pre-population)
   - Delete products with confirmation
   - Beautiful cake-themed UI
   - No stock tracking (perfect for custom cakes)

2. **Category Management**
   - Dedicated category management page (`/categories/manage`)
   - Add, edit, delete cake categories
   - Modal-based category forms
   - Categories like "Birthday Cakes", "Wedding Cakes", "Custom Cakes"
   - Beautiful icons for different cake types

3. **Authentication & Security**
   - Secure admin login system
   - JWT token-based authentication
   - Protected routes and API endpoints
   - Password change functionality

4. **Complete Billing System**
   - Interactive product selection with visual cart
   - Customer information collection (name & phone)
   - Item-level discount system (percentage or fixed)
   - Real-time cart calculation
   - Professional bill generation with unique bill numbers
   - Beautiful checkout UI with cake business theme

5. **Customer Loyalty Program**
   - Automatic 3rd purchase discount (10% configurable)
   - Phone number-based customer tracking
   - Real-time loyalty status display during checkout
   - Purchase history and loyalty level tracking
   - Intelligent discount messaging ("2 more purchases until reward")
   - Loyalty rewards prominently displayed in checkout success

6. **Revenue Analytics & Dashboard**
   - Today's revenue and order count cards
   - Interactive 30-day revenue chart with line/bar toggle
   - Daily revenue breakdown with trend analysis
   - Responsive charts using Recharts library
   - Weekly revenue aggregation (ready for expansion)
   - Beautiful gradient-themed dashboard design

7. **Revenue Export & Archive System**
   - Export bills older than 30 days to Google Sheets
   - Automatic data archival with daily summaries
   - Google Sheets integration with service account authentication
   - Data cleanup (delete exported bills from MongoDB)
   - Export history tracking and audit trail
   - One-click export button from admin dashboard

8. **Beautiful UI/UX**
   - Cake business themed interface
   - Pink/rose gradient color scheme
   - Smooth animations and hover effects
   - Responsive design for all devices
   - Professional bakery aesthetic
   - Loading states and error handling

### 🔄 API Endpoints

#### Authentication Routes (`/api/auth/`)
- `POST /login` - Admin login
- `GET /profile` - Get admin profile
- `PUT /change-password` - Change admin password
- `GET /verify` - Verify JWT token

#### Product Routes (`/api/products/`)
- `GET /` - Get all products (with filtering)
- `GET /:id` - Get single product
- `POST /` - Create new product (with image upload)
- `PUT /:id` - Update product (with image upload)
- `DELETE /:id` - Delete product

#### Category Routes (`/api/products/categories/`)
- `GET /` - Get all categories
- `POST /` - Create new category
- `PUT /:id` - Update category
- `DELETE /:id` - Delete category

#### Checkout Routes (`/api/checkout/`)
- `POST /` - Create new bill with loyalty calculation
- `GET /bills` - Get all bills with pagination
- `GET /bills/:id` - Get single bill details
- `GET /summary` - Get today's sales summary
- `POST /loyalty/check` - Check customer loyalty status

#### Revenue Routes (`/api/revenue/`)
- `GET /today` - Get today's revenue and order count
- `GET /weekly` - Get weekly revenue breakdown
- `GET /30days` - Get 30-day daily revenue data
- `POST /export` - Export old revenue to Google Sheets
- `GET /export/test` - Test Google Sheets connection

## 🎯 Business Logic

### Cake Business Specific Features
1. **No Stock Tracking**: Perfect for made-to-order cake business model
2. **Category-Based Organization**: Organize cakes by type (Birthday, Wedding, etc.)
3. **Image-First Design**: Visual appeal is crucial for cake products
4. **Customer-Centric Pricing**: Simple pricing with loyalty rewards

### Loyalty Program Logic
1. **3rd Purchase Discount**: Every 3rd purchase gets 10% discount (configurable)
2. **Phone-Based Tracking**: Uses customer phone number as unique identifier
3. **Automatic Calculation**: Discount applied automatically during checkout
4. **Purchase History**: Complete customer purchase tracking and analytics
5. **Loyalty Levels**: Progressive customer levels based on total purchases
   - 👋 New Customer (0 purchases)
   - 🌟 Sweet Friend (1-4 purchases)
   - 🎂 Cake Lover (5-14 purchases)
   - ⭐ Loyal Baker (15-29 purchases)
   - 🏆 Sweet Champion (30-49 purchases)
   - 👑 Cake Royalty (50+ purchases)

### Revenue Analytics Logic
1. **Daily Aggregation**: Groups bills by date for trend analysis
2. **30-Day Rolling Window**: Always shows last 30 days of data
3. **Missing Date Handling**: Fills gaps with zero revenue for complete charts
4. **Real-Time Updates**: Dashboard updates with each new bill
5. **Export Optimization**: Archives old data to maintain database performance

### User Workflow
1. Admin logs in to dashboard with revenue overview
2. Manages cake categories and products with images
3. Processes customer orders through billing system
4. Loyalty discounts automatically applied for eligible customers
5. Views analytics and exports old revenue data
6. Maintains lean database with historical Google Sheets archive

### 🔄 API Endpoints

#### Authentication Routes (`/api/auth/`)
- `POST /login` - Admin login
- `GET /profile` - Get admin profile
- `PUT /change-password` - Change admin password
- `GET /verify` - Verify JWT token

#### Product Routes (`/api/products/`)
- `GET /` - Get all products (with filtering)
- `GET /:id` - Get single product
- `POST /` - Create new product (with image upload)
- `PUT /:id` - Update product (with image upload)
- `DELETE /:id` - Delete product

#### Category Routes (`/api/products/categories/`)
- `GET /` - Get all categories
- `POST /` - Create new category
- `PUT /:id` - Update category
- `DELETE /:id` - Delete category

## 🎯 Business Logic

### Cake Business Specific Features
1. **No Stock Tracking**: Perfect for made-to-order cake business model
2. **Category-Based Organization**: Organize cakes by type (Birthday, Wedding, etc.)
3. **Image-First Design**: Visual appeal is crucial for cake products
4. **Simple Pricing**: Straightforward price per cake without complex variations

### User Workflow
1. Admin logs in to dashboard
2. Manages cake categories (Birthday, Wedding, Custom, etc.)
3. Adds cake products with images and descriptions
4. Views and manages all products in beautiful interface
5. Future: Process customer orders and generate bills

## 🛠️ Development Guidelines

### Code Standards
- Use TypeScript for type safety
- Follow Next.js 14 App Router conventions
- Use React Hook Form for form handling
- Implement proper error handling and loading states
- Use TailwindCSS for consistent styling
- Follow the pink/rose cake business theme

### File Naming Conventions
- React components: PascalCase (`ProductCard.tsx`)
- API routes: kebab-case (`auth-controller.js`)
- Types: PascalCase interfaces (`Product`, `Category`)
- Utilities: camelCase (`formatPrice.ts`)

### Component Structure
- Always use TypeScript interfaces for props
- Implement proper loading and error states
- Use the established color palette and animations
- Follow responsive design patterns
- Include proper accessibility attributes

## 🚀 Deployment & Environment

### Environment Variables
```
# Backend (.env)
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
LOYALTY_FREQUENCY=3
LOYALTY_DISCOUNT_PERCENTAGE=10
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id
GOOGLE_APPLICATION_CREDENTIALS=./src/config/google-credentials.json

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### Running the Application
```bash
# Backend
cd backend
npm install
npm run dev    # Runs on port 5001

# Frontend
cd frontend  
npm install
npm run dev    # Runs on port 3000/3001
```

## 📱 User Experience

### Target Audience
- Cake business owners and staff
- Admin users managing cake inventory and categories
- Future: Customers placing cake orders

### Key UX Principles
1. **Beauty First**: Every interface should reflect the artistry of cake making
2. **Simplicity**: Easy-to-use forms and navigation
3. **Visual Appeal**: Image-heavy design showcasing cake products
4. **Mobile-Friendly**: Responsive design for tablet/phone management
5. **Fast Performance**: Quick loading and smooth animations

### Accessibility Features
- Semantic HTML structure
- Proper ARIA labels
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly

## 🔮 Future Enhancements
1. **Customer Portal**: Public-facing cake catalog and ordering system
2. **Order Management**: Track custom cake orders and delivery schedules
3. **Advanced Analytics**: Customer behavior analysis and sales forecasting
4. **Multi-user**: Staff roles and permissions with different access levels
5. **Email/SMS Notifications**: Order confirmations and loyalty rewards
6. **Inventory Planning**: Raw materials tracking for cake production
7. **Seasonal Campaigns**: Holiday-specific promotions and discounts
8. **Mobile App**: Native mobile application for customers and staff

## 📝 Notes for AI Assistants
When working with this project:
1. Always maintain the pink/rose cake business theme
2. Remember this is for made-to-order cakes (no stock tracking)
3. Focus on visual appeal and user experience
4. Use the established component patterns and styling
5. Ensure proper TypeScript typing
6. Follow the existing API structure and naming conventions
7. Test both frontend and backend integration
8. Consider mobile responsiveness in all designs
9. Loyalty program uses phone number as unique customer identifier
10. Revenue analytics should always show trend data
11. Google Sheets integration requires proper service account setup
12. All monetary values should be displayed in ₹ (Indian Rupees)
13. Bill numbers follow format: BILL-YYYYMMDD-XXXX
14. Loyalty discounts are automatically calculated and applied
15. Export functionality maintains data integrity (export before delete)