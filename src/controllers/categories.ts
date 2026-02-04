import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;
    
    const query: any = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const categories = await Category.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

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
      message: error.message,
    });
  }
};

const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image, bannerImage } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const slug = generateSlug(name);

    // Check if category with same name or slug exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }],
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      });
    }

    const category = new Category({
      name,
      description,
      slug,
      image: image || undefined,
      bannerImage: bannerImage || undefined,
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;
    const { name, description, image, bannerImage } = req.body;

    const updateData: any = {};

    if (name) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (image !== undefined) {
      updateData.image = image;
    }

    if (bannerImage !== undefined) {
      updateData.bannerImage = bannerImage;
    }

    // Check if updating to duplicate name or slug
    if (name) {
      const existingCategory = await Category.findOne({
        $or: [{ name }, { slug: updateData.slug }],
        _id: { $ne: categoryId },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name or slug already exists',
        });
      }
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;

    // Check if category is used in products
    const productsCount = await Product.countDocuments({
      productCategory: categoryId,
    });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It is associated with ${productsCount} product(s)`,
      });
    }

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};



