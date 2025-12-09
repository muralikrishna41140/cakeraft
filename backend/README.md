# Backend - Express.js API Server

This is the backend API server for the Billing System, built with Express.js, MongoDB, and various middleware for authentication, file uploads, and data validation.

## 🏗️ Architecture

```
src/
├── controllers/        # Route handlers and business logic
│   ├── authController.js      # Authentication logic
│   └── productController.js   # Product and category management
├── middleware/         # Custom middleware functions
│   ├── auth.js               # JWT authentication middleware
│   └── upload.js            # File upload configuration
├── models/            # MongoDB schemas and models
│   ├── Admin.js             # Admin user model
│   └── Product.js          # Product and Category models
├── routes/            # Express route definitions
│   ├── auth.js             # Authentication routes
│   └── products.js         # Product management routes
└── server.js          # Application entry point
```

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database (Replace with your MongoDB Atlas connection string)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/billing-system

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Admin User (Will be created automatically)
ADMIN_EMAIL=admin@billing.com
ADMIN_PASSWORD=Admin@123

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

### Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Run Production Server

```bash
npm start
```

## 📊 Database Models

### Admin Model

- `email`: String (required, unique, validated)
- `password`: String (required, hashed with bcrypt)
- `lastLogin`: Date (updated on successful login)

### Category Model

- `name`: String (required, unique)
- `description`: String (optional)
- `isActive`: Boolean (default: true)

### Product Model

- `name`: String (required, max 100 chars)
- `description`: String (required, max 500 chars)
- `price`: Number (required, min 0, rounded to 2 decimals)
- `category`: ObjectId (reference to Category)
- `image`: Object (filename, originalName, mimetype, size, path)
- `isActive`: Boolean (default: true)
- `stock`: Number (default: 0, min 0)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login**: POST `/api/auth/login` with email/password
2. **Token**: Receive JWT token valid for 7 days
3. **Protected Routes**: Include token in Authorization header: `Bearer <token>`

### Auth Middleware

```javascript
// Protected route example
router.get("/protected", protect, (req, res) => {
  // req.admin contains authenticated admin data
  res.json({ admin: req.admin });
});
```

## 📁 File Upload

Product images are handled using Multer middleware:

- **Storage**: Local filesystem in `uploads/` directory
- **Size Limit**: 5MB per file
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **Filename**: `product-{timestamp}-{random}.{extension}`

### Upload Process

1. File validation (type, size)
2. Store in `uploads/` directory
3. Save metadata in database
4. Serve via `/uploads/:filename` endpoint

## 🛡️ Security Features

### Password Security

- Bcrypt hashing with salt rounds: 12
- Passwords never returned in API responses
- Password strength validation

### JWT Security

- Secure secret key required
- Token expiration handling
- Automatic logout on invalid tokens

### Input Validation

- Email format validation
- Required field validation
- File type/size validation
- MongoDB injection prevention

### Rate Limiting

- 100 requests per 15 minutes per IP
- Prevents brute force attacks
- Configurable limits

## 🚦 API Endpoints

### Authentication

```
POST   /api/auth/login           # Login admin
GET    /api/auth/profile         # Get profile (protected)
PUT    /api/auth/change-password # Change password (protected)
GET    /api/auth/verify          # Verify token (protected)
```

### Categories

```
GET    /api/products/categories      # Get all categories
POST   /api/products/categories      # Create category
PUT    /api/products/categories/:id  # Update category
DELETE /api/products/categories/:id  # Delete category
```

### Products

```
GET    /api/products           # Get products (with pagination/search)
GET    /api/products/:id       # Get single product
POST   /api/products           # Create product (with image upload)
PUT    /api/products/:id       # Update product (with image upload)
DELETE /api/products/:id       # Delete product
```

### Utility

```
GET    /api/health             # Health check
GET    /uploads/:filename      # Serve uploaded images
```

## 📝 API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]  // Optional validation errors
}
```

## 🔧 Development

### Project Scripts

```bash
npm run dev     # Development with nodemon
npm start       # Production server
npm run lint    # Code linting (if configured)
```

### Database Connection

The server automatically:

1. Connects to MongoDB on startup
2. Creates admin user if none exists
3. Handles connection errors gracefully

### Logging

- Successful operations logged to console
- Error details logged with stack traces
- MongoDB connection status displayed

## 🚀 Deployment

### Environment Variables

Ensure these are set in production:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_db_url
JWT_SECRET=your_secure_jwt_secret
```

### CORS Configuration

Update `server.js` for production domains:

```javascript
app.use(
  cors({
    origin: ["https://your-domain.com"],
    credentials: true,
  })
);
```

### File Upload in Production

- Ensure `uploads/` directory exists
- Set proper file permissions
- Consider cloud storage for scalability

## 🔍 Monitoring

### Health Check

```bash
curl http://localhost:5000/api/health
```

Response:

```json
{
  "status": "OK",
  "message": "Billing System API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## 🐛 Debugging

### Common Issues

**MongoDB Connection Failed**

```bash
# Check connection string
echo $MONGODB_URI

# Test MongoDB connectivity
mongosh "your_connection_string"
```

**JWT Token Issues**

```bash
# Verify JWT_SECRET is set
echo $JWT_SECRET

# Check token in requests
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/auth/verify
```

**File Upload Problems**

```bash
# Check uploads directory
ls -la uploads/

# Verify file permissions
chmod 755 uploads/
```

### Debug Mode

Set environment variable for detailed logs:

```bash
DEBUG=billing-system:* npm run dev
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

---

## 🤝 Contributing

1. Follow existing code style
2. Add proper error handling
3. Include input validation
4. Write clear comments
5. Test all endpoints

For more information, see the main project README.
