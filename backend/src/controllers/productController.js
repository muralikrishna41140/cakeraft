import { Product, Category } from "../models/Product.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

// CATEGORY CONTROLLERS

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Private
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
    });
  }
};

// @desc    Create new category
// @route   POST /api/products/categories
// @access  Private
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || "",
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating category",
    });
  }
};

// @desc    Update category
// @route   PUT /api/products/categories/:id
// @access  Private
export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        description: description?.trim() || "",
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating category",
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/products/categories/:id
// @access  Private
export const deleteCategory = async (req, res) => {
  try {
    // Check if category has products
    const productsCount = await Product.countDocuments({
      category: req.params.id,
      isActive: true,
    });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${productsCount} active product(s).`,
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting category",
    });
  }
};

// PRODUCT CONTROLLERS

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;

    let query = { isActive: true };

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .populate("category", "name description")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name description"
    );

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, priceType, availableWeights } =
      req.body;

    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required",
      });
    }

    if (parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // Validate price type and available weights
    const finalPriceType = priceType || "fixed";
    let finalAvailableWeights = [0.5, 1, 1.5, 2, 3, 4, 5]; // Default weights

    if (finalPriceType === "per_kg" && availableWeights) {
      try {
        const weights = JSON.parse(availableWeights);
        if (Array.isArray(weights) && weights.length > 0) {
          finalAvailableWeights = weights
            .filter((w) => w > 0)
            .sort((a, b) => a - b);
        }
      } catch (e) {
        // Use default weights if parsing fails
      }
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists || !categoryExists.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid category selected",
      });
    }

    // Prepare product data
    const productData = {
      name: name.trim(),
      description: description?.trim() || "",
      price: parseFloat(price),
      category,
      priceType: finalPriceType,
      availableWeights: finalAvailableWeights,
    };

    // Handle image upload
    if (req.file) {
      productData.image = {
        url: req.file.path, // Cloudinary returns secure_url in path
        publicId: req.file.filename, // Cloudinary returns public_id in filename
        originalName: req.file.originalname,
        size: req.file.size,
      };
    }

    const product = await Product.create(productData);

    // Populate category before sending response
    await product.populate("category", "name description");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    // Delete uploaded file from Cloudinary if product creation fails
    if (req.file && req.file.filename) {
      try {
        await deleteFromCloudinary(req.file.filename);
      } catch (deleteError) {
        console.error(
          "Error deleting uploaded file from Cloudinary:",
          deleteError
        );
      }
    }

    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating product",
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, priceType, availableWeights } =
      req.body;

    // Find existing product
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct || !existingProduct.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required",
      });
    }

    if (parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists || !categoryExists.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid category selected",
      });
    }

    // Prepare update data
    const finalPriceType = priceType || existingProduct.priceType || "fixed";
    let finalAvailableWeights = existingProduct.availableWeights || [
      0.5, 1, 1.5, 2, 3, 4, 5,
    ];

    if (finalPriceType === "per_kg" && availableWeights) {
      try {
        const weights = JSON.parse(availableWeights);
        if (Array.isArray(weights) && weights.length > 0) {
          finalAvailableWeights = weights
            .filter((w) => w > 0)
            .sort((a, b) => a - b);
        }
      } catch (e) {
        // Keep existing weights if parsing fails
      }
    }

    const updateData = {
      name: name.trim(),
      description: description?.trim() || existingProduct.description || "",
      price: parseFloat(price),
      category,
      priceType: finalPriceType,
      availableWeights: finalAvailableWeights,
    };

    // Handle image update
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (existingProduct.image?.publicId) {
        try {
          await deleteFromCloudinary(existingProduct.image.publicId);
        } catch (error) {
          console.error("Error deleting old image from Cloudinary:", error);
          // Continue with update even if old image deletion fails
        }
      }

      // Add new image from Cloudinary
      updateData.image = {
        url: req.file.path, // Cloudinary secure_url
        publicId: req.file.filename, // Cloudinary public_id
        originalName: req.file.originalname,
        size: req.file.size,
      };
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("category", "name description");

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    // Delete uploaded file from Cloudinary if update fails
    if (req.file && req.file.filename) {
      try {
        await deleteFromCloudinary(req.file.filename);
      } catch (deleteError) {
        console.error(
          "Error deleting uploaded file from Cloudinary:",
          deleteError
        );
      }
    }

    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating product",
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    // Delete associated image from Cloudinary
    if (product.image && product.image.publicId) {
      try {
        await deleteFromCloudinary(product.image.publicId);
      } catch (error) {
        console.error("Error deleting product image from Cloudinary:", error);
        // Continue even if image deletion fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    });
  }
};
