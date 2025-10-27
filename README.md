# CakeRaft - Professional Cake Business Management System

# 🎂 CakeRaft - Professional Cake Business Management System

**Live Backend:** https://cakeraft-backend.onrender.com

A complete full-stack billing and management system designed specifically for cake businesses. Features Next.js, Express.js, MongoDB Atlas, and WhatsApp Business API integration.

## 🚀 Features

- **Single Admin Authentication** - Secure login with JWT tokens
- **Product Management** - Add, edit, delete products with categories and image upload
- **Billing System** - Create bills with cart functionality and customer info
- **WhatsApp PDF Bills** - Send professional PDF bills via WhatsApp Business API
- **Loyalty Rewards** - Automatic customer loyalty tracking with discounts
- **Modern UI** - Clean, responsive design with TailwindCSS
- **Real-time Updates** - Live product inventory and billing
- **Secure Backend** - Protected APIs with authentication middleware

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Modern CSS framework
- **React Hook Form** - Form validation and handling
- **Lucide React** - Modern icon library
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **PDFKit** - Professional PDF generation
- **WhatsApp Business API** - Bill delivery via WhatsApp

## 📁 Project Structure

```
billing-system/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, upload, error handling
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── services/      # WhatsApp, PDF, loyalty services
│   │   └── server.js      # Application entry point
│   ├── uploads/           # Product images
│   ├── package.json
│   └── .env.example
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/          # Utilities and API
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Git installed

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd billing-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend Setup (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
NODE_ENV=development
PORT=5000

# Replace with your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/billing-system

# Generate a secure JWT secret
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Admin credentials (change these!)
ADMIN_EMAIL=admin@billing.com
ADMIN_PASSWORD=Admin@123

# File upload settings
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# WhatsApp Business API (Optional)
WHATSAPP_API_TOKEN=your_whatsapp_business_api_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

> **🔔 WhatsApp Integration**: For WhatsApp PDF bill sending, see [WHATSAPP_SETUP.md](WHATSAPP_SETUP.md) for detailed setup instructions.

#### Frontend Setup (.env.local)
```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Database Setup

1. **Create MongoDB Atlas Account** (if you don't have one)
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account
   - Create a new cluster

2. **Get Connection String**
   - In your cluster, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` and `<username>` with your credentials
   - Update `MONGODB_URI` in backend/.env

3. **Set Up Database Access**
   - Create a database user
   - Add your IP address to the whitelist (or use 0.0.0.0/0 for development)

### 4. Run the Application

#### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Server will run on http://localhost:5000

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

### 5. First Login

1. Open http://localhost:3000
2. Use default credentials:
   - **Email:** admin@billing.com
   - **Password:** Admin@123

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get admin profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/verify` - Verify token

### Product Endpoints
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (with image)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/:id` - Get single product

### Category Endpoints
- `GET /api/products/categories` - Get all categories
- `POST /api/products/categories` - Create category
- `PUT /api/products/categories/:id` - Update category
- `DELETE /api/products/categories/:id` - Delete category

## 🔧 Development

### Backend Commands
```bash
npm run dev          # Start development server
npm start           # Start production server
npm run lint        # Lint code
```

### Frontend Commands
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm start          # Start production server
npm run lint       # Lint code
```

## 📦 Deployment

### Backend Deployment
1. Set environment variables in your hosting platform
2. Ensure MongoDB Atlas allows connections from your server
3. Set `NODE_ENV=production`
4. Update CORS origins in server.js

### Frontend Deployment
1. Update `NEXT_PUBLIC_API_URL` to your production API URL
2. Build the application: `npm run build`
3. Deploy the `.next` folder

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- File upload validation
- Rate limiting
- Input sanitization
- CORS configuration

## 🎯 Usage Guide

### Adding Products
1. Go to Dashboard → Manage Products
2. Click "Add Product"
3. Fill in product details
4. Upload an image (optional)
5. Select category
6. Set pricing and stock

### Creating Bills
1. Go to Dashboard → Start Billing
2. Add products to cart
3. Adjust quantities
4. Enter customer information
5. Process checkout

### Managing Categories
1. Go to Products → Categories
2. Add, edit, or delete categories
3. Categories help organize products

## ❗ Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Verify connection string in .env
- Check database user credentials
- Ensure IP whitelist includes your address

**File Upload Issues**
- Check file size (max 5MB)
- Verify file type (images only)
- Ensure uploads folder has write permissions

**Authentication Problems**
- Verify JWT_SECRET in .env
- Check token expiration settings
- Clear browser localStorage

**Port Already in Use**
- Change PORT in backend/.env
- Kill existing processes: `lsof -ti:5000 | xargs kill`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email: support@billing-system.com

---

Built with ❤️ using modern web technologies