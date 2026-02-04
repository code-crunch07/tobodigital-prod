import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Navigation from '../models/Navigation';

const getAllNavigations = async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not established',
      });
    }

    const navigations = await Navigation.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: navigations || [],
    });
  } catch (error: any) {
    console.error('Error fetching navigations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch navigations',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

const getNavigationById = async (req: Request, res: Response) => {
  try {
    const navigation = await Navigation.findById(req.params.id);

    if (!navigation) {
      return res.status(404).json({
        success: false,
        message: 'Navigation not found',
      });
    }

    res.json({
      success: true,
      data: navigation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createNavigation = async (req: Request, res: Response) => {
  try {
    const navigation = new Navigation(req.body);
    await navigation.save();

    res.status(201).json({
      success: true,
      message: 'Navigation created successfully',
      data: navigation,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateNavigation = async (req: Request, res: Response) => {
  try {
    const navigation = await Navigation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!navigation) {
      return res.status(404).json({
        success: false,
        message: 'Navigation not found',
      });
    }

    res.json({
      success: true,
      message: 'Navigation updated successfully',
      data: navigation,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteNavigation = async (req: Request, res: Response) => {
  try {
    const navigation = await Navigation.findByIdAndDelete(req.params.id);

    if (!navigation) {
      return res.status(404).json({
        success: false,
        message: 'Navigation not found',
      });
    }

    res.json({
      success: true,
      message: 'Navigation deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Public API - Get active navigations only
const getActiveNavigations = async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not established',
      });
    }

    const navigations = await Navigation.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: navigations || [],
    });
  } catch (error: any) {
    console.error('Error fetching active navigations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch active navigations',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

export {
  getAllNavigations,
  getNavigationById,
  createNavigation,
  updateNavigation,
  deleteNavigation,
  getActiveNavigations,
};
