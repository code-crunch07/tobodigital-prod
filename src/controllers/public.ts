import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import SubCategory from '../models/SubCategory';

// Get public products (only active products)
export const getPublicProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '12',
      category,
      featured,
      sale,
      search,
      sort,
      price,
    } = req.query;

    const query: any = { isActive: true }; // Only active products

    // Filter by category (supports both ID and slug)
    if (category) {
      // Try to find category by slug first, then by ID
      const categoryDoc = await Category.findOne({
        $or: [
          { slug: category },
          { _id: category }
        ],
        isActive: true
      });
      if (categoryDoc) {
        query.productCategory = categoryDoc._id;
      }
    }

    // Filter by featured
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Filter by sale
    if (sale === 'true') {
      query.salePrice = { $exists: true, $ne: null };
      query.saleEndDate = { $gte: new Date() };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } },
        { productDescription: { $regex: search, $options: 'i' } },
      ];
    }

    // Price filter
    if (price) {
      const priceRange = price.toString().split('-');
      if (priceRange.length === 2) {
        const [min, max] = priceRange;
        query.yourPrice = {
          $gte: parseFloat(min),
          $lte: parseFloat(max),
        };
      } else if (price.toString().endsWith('+')) {
        const min = parseFloat(price.toString().replace('+', ''));
        query.yourPrice = { $gte: min };
      }
    }

    // Sorting
    let sortOption: any = { createdAt: -1 }; // Default: newest first
    if (sort === 'price-low') {
      sortOption = { yourPrice: 1 };
    } else if (sort === 'price-high') {
      sortOption = { yourPrice: -1 };
    } else if (sort === 'popular') {
      sortOption = { createdAt: -1 }; // You can add a views/rating field later
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .populate('productCategory', 'name slug')
      .populate('subCategory', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .select('-__v'); // Exclude version field

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products',
    });
  }
};

// Get single public product by ID
export const getPublicProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ _id: id, isActive: true })
      .populate('productCategory', 'name slug')
      .populate('subCategory', 'name slug')
      .select('-__v');

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
      message: error.message || 'Error fetching product',
    });
  }
};

// Get public categories (only active categories)
export const getPublicCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('name slug description image bannerImage')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching categories',
    });
  }
};

// Get public category by slug
export const getPublicCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug, isActive: true })
      .select('name slug description image bannerImage');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching category',
    });
  }
};

// Get public subcategories
export const getPublicSubCategories = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    const query: any = { isActive: true };
    if (categoryId) {
      query.category = categoryId;
    }

    const subCategories = await SubCategory.find(query)
      .select('name slug description image category')
      .populate('category', 'name slug')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: subCategories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching subcategories',
    });
  }
};
