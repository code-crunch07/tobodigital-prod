import { Request, Response } from 'express';
import SubCategory from '../models/SubCategory';
import Product from '../models/Product';

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const getAllSubCategories = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;
    
    const query: any = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const subCategories = await SubCategory.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: subCategories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSubCategoriesByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    
    const subCategories = await SubCategory.find({
      category: categoryId,
      isActive: true,
    }).populate('category', 'name');

    res.json({
      success: true,
      data: subCategories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSubCategoryById = async (req: Request, res: Response) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id)
      .populate('category', 'name');

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'SubCategory not found',
      });
    }

    res.json({
      success: true,
      data: subCategory,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createSubCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, category, image } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'SubCategory name and category are required',
      });
    }

    const slug = generateSlug(name);

    // Check if subcategory with same name exists in the same category
    const existingSubCategory = await SubCategory.findOne({
      name,
      category,
    });

    if (existingSubCategory) {
      return res.status(400).json({
        success: false,
        message: 'SubCategory already exists in this category',
      });
    }

    const subCategory = new SubCategory({
      name,
      description,
      slug,
      category,
      image: image || undefined,
    });

    await subCategory.save();

    const populatedSubCategory = await SubCategory.findById(subCategory._id)
      .populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'SubCategory created successfully',
      data: populatedSubCategory,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateSubCategory = async (req: Request, res: Response) => {
  try {
    const subCategoryId = req.params.id;
    const { name, description, category, image } = req.body;

    const updateData: any = {};

    if (name) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (category) {
      updateData.category = category;
    }

    if (image !== undefined) {
      updateData.image = image;
    }

    // Check if updating to duplicate name in same category
    if (name && category) {
      const existingSubCategory = await SubCategory.findOne({
        name,
        category,
        _id: { $ne: subCategoryId },
      });

      if (existingSubCategory) {
        return res.status(400).json({
          success: false,
          message: 'SubCategory with this name already exists in the category',
        });
      }
    }

    const subCategory = await SubCategory.findByIdAndUpdate(
      subCategoryId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate('category', 'name');

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'SubCategory not found',
      });
    }

    res.json({
      success: true,
      message: 'SubCategory updated successfully',
      data: subCategory,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteSubCategory = async (req: Request, res: Response) => {
  try {
    const subCategoryId = req.params.id;

    // Check if subcategory is used in products
    const productsCount = await Product.countDocuments({
      subCategory: subCategoryId,
    });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete subcategory. It is associated with ${productsCount} product(s)`,
      });
    }

    const subCategory = await SubCategory.findByIdAndDelete(subCategoryId);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'SubCategory not found',
      });
    }

    res.json({
      success: true,
      message: 'SubCategory deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getAllSubCategories,
  getSubCategoriesByCategory,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
};



