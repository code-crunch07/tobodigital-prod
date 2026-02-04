import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Banner from '../models/Banner';
import Category from '../models/Category';

const getAllBanners = async (req: Request, res: Response) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not established',
      });
    }

    const banners = await Banner.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: banners || [],
    });
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch banners',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

const getBannerById = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    res.json({
      success: true,
      data: banner,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createBanner = async (req: Request, res: Response) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    res.json({
      success: true,
      message: 'Banner updated successfully',
      data: banner,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    res.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Public API - Get active banners only (defaults to slider type)
const getActiveBanners = async (req: Request, res: Response) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not established',
      });
    }

    const type = req.query.type as string || 'slider';
    const limit = type === 'slider' ? 3 : undefined;

    const query: any = { isActive: true, type };
    const banners = await Banner.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(limit || 0)
      .lean();

    res.json({
      success: true,
      data: banners || [],
    });
  } catch (error: any) {
    console.error('Error fetching active banners:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch active banners',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// Public API - Get active promotion banners
const getActivePromotionBanners = async (req: Request, res: Response) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not established',
      });
    }

    const banners = await Banner.find({ isActive: true, type: 'promotion' })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: banners || [],
    });
  } catch (error: any) {
    console.error('Error fetching promotion banners:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch promotion banners',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// Public API - Get active promo row banners (two side-by-side banners after product carousel)
const getActivePromoRowBanners = async (req: Request, res: Response) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not established',
      });
    }

    const banners = await Banner.find({ isActive: true, type: 'promo-row' })
      .sort({ order: 1, createdAt: -1 })
      .limit(2) // Limit to 2 for the side-by-side display
      .lean();

    res.json({
      success: true,
      data: banners || [],
    });
  } catch (error: any) {
    console.error('Error fetching promo row banners:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch promo row banners',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// Public API - Get active banners by category
const getActiveBannersByCategory = async (req: Request, res: Response) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not established',
      });
    }

    const { slug } = req.params;
    const type = (req.query.type as string) || 'slider';

    // Find category by slug
    const category = await Category.findOne({ slug, isActive: true });
    
    if (!category) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const query: any = { 
      isActive: true, 
      type,
      category: category._id 
    };

    const banners = await Banner.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: banners || [],
    });
  } catch (error: any) {
    console.error('Error fetching banners by category:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch banners by category',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

export {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getActiveBanners,
  getActivePromotionBanners,
  getActivePromoRowBanners,
  getActiveBannersByCategory,
};
