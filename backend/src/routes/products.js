import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { upload, handleUploadError } from '../config/cloudinary.js';

const router = express.Router();

// All product routes are protected
router.use(protect);

// Category routes
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Product routes
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', upload.single('image'), handleUploadError, createProduct);
router.put('/:id', upload.single('image'), handleUploadError, updateProduct);
router.delete('/:id', deleteProduct);

export default router;