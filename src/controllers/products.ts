import { Request, Response } from 'express';
import Product from '../models/Product';
import { createLowStockNotification } from './notifications';

const getAllProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      isActive,
    } = req.query;

    const query: any = {};

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } },
        { productId: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.productCategory = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const products = await Product.find(query)
      .populate('productCategory', 'name')
      .populate('subCategory', 'name')
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('productCategory', 'name')
      .populate('subCategory', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;

    // Check if productId already exists
    if (productData.productId) {
      const existingProduct = await Product.findOne({
        productId: productData.productId,
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product ID already exists',
        });
      }
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    // If productId is being updated, check for duplicates
    if (updateData.productId) {
      const existingProduct = await Product.findOne({
        productId: updateData.productId,
        _id: { $ne: productId },
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product ID already exists',
        });
      }
    }

    // Get old product to check stock quantity change
    const oldProduct = await Product.findById(productId);
    
    const product = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('productCategory', 'name')
      .populate('subCategory', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check for low stock notification (stock <= 10 and was previously higher)
    if (
      product.stockQuantity !== undefined &&
      product.stockQuantity <= 10 &&
      (!oldProduct || oldProduct.stockQuantity > 10)
    ) {
      await createLowStockNotification(productId);
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const bulkDeleteProducts = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs are required',
      });
    }

    const result = await Product.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${result.deletedCount} product(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const duplicateProduct = async (req: Request, res: Response) => {
  try {
    const originalProduct = await Product.findById(req.params.id);

    if (!originalProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Convert to plain object and remove _id, __v, createdAt, updatedAt
    const productData = originalProduct.toObject();
    delete productData._id;
    delete productData.__v;
    delete productData.createdAt;
    delete productData.updatedAt;

    // Generate unique productId
    let newProductId = `${productData.productId}-copy`;
    let counter = 1;
    
    // Check if productId already exists, if so add number
    while (await Product.findOne({ productId: newProductId })) {
      newProductId = `${productData.productId}-copy-${counter}`;
      counter++;
    }
    
    productData.productId = newProductId;
    
    // Update item name to indicate it's a copy
    productData.itemName = `${productData.itemName} (Copy)`;
    
    // Reset stock quantity to 0 for the duplicate
    productData.stockQuantity = 0;
    
    // Set as inactive by default (admin can activate after review)
    productData.isActive = false;

    // Create new product
    const duplicatedProduct = new Product(productData);
    await duplicatedProduct.save();

    // Populate references
    await duplicatedProduct.populate('productCategory', 'name');
    await duplicatedProduct.populate('subCategory', 'name');

    res.status(201).json({
      success: true,
      message: 'Product duplicated successfully',
      data: duplicatedProduct,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  duplicateProduct,
};



