import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Category description cannot exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: false,
    default: '',
    trim: true,
    maxlength: [500, 'Product description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    set: function(value) {
      return Math.round(value * 100) / 100; // Round to 2 decimal places
    }
  },
  priceType: {
    type: String,
    enum: ['fixed', 'per_kg'],
    default: 'fixed',
    required: true
  },
  availableWeights: {
    type: [Number],
    default: [0.5, 1, 1.5, 2, 3, 4, 5], // Default weight options in kg
    validate: {
      validator: function(weights) {
        return weights.length > 0 && weights.every(w => w > 0);
      },
      message: 'Available weights must be positive numbers'
    }
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  image: {
    url: {
      type: String,
      default: null
    },
    publicId: {
      type: String,
      default: null
    },
    originalName: {
      type: String,
      default: null
    },
    size: {
      type: Number,
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });

// Virtual for image URL (for backward compatibility)
productSchema.virtual('imageUrl').get(function() {
  if (this.image && this.image.url) {
    return this.image.url;
  }
  return null;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Capitalize first letter of product name
  if (this.isModified('name')) {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
  next();
});

// Static method to get products with category details
productSchema.statics.findWithCategory = function(filter = {}) {
  return this.find({ ...filter, isActive: true })
    .populate('category', 'name description')
    .sort({ createdAt: -1 });
};

// Static method to search products
productSchema.statics.searchProducts = function(searchTerm, categoryId = null) {
  const query = {
    isActive: true,
    $text: { $search: searchTerm }
  };
  
  if (categoryId) {
    query.category = categoryId;
  }
  
  return this.find(query)
    .populate('category', 'name description')
    .sort({ score: { $meta: 'textScore' } });
};

export const Category = mongoose.model('Category', categorySchema);
export const Product = mongoose.model('Product', productSchema);