import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Coupon from '../models/Coupon';

// Validate coupon code
export const validateCoupon = async (req: Request, res: Response) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not established',
      });
    }

    const { code, amount } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    // Find coupon by code (case-insensitive)
    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code',
      });
    }

    // Check if coupon is within valid date range
    const now = new Date();
    if (coupon.startDate > now) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is not yet active',
      });
    }

    if (coupon.endDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired',
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit reached',
      });
    }

    // Check minimum purchase amount
    if (coupon.minPurchaseAmount && amount < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount of ₹${coupon.minPurchaseAmount} required`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (amount * coupon.discountValue) / 100;
      // Apply max discount limit if set
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      // Fixed discount
      discount = coupon.discountValue;
      // Don't exceed the order amount
      if (discount > amount) {
        discount = amount;
      }
    }

    // Return coupon data with calculated discount
    res.json({
      success: true,
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
        discountPercentage: coupon.discountType === 'percentage' ? coupon.discountValue : 0,
        minPurchaseAmount: coupon.minPurchaseAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
      },
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate coupon',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// Get all coupons (admin)
export const getAllCoupons = async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not established',
      });
    }

    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      data: coupons || [],
    });
  } catch (error: any) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch coupons',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// Create coupon (admin)
export const createCoupon = async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not established',
      });
    }

    const coupon = new Coupon(req.body);
    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists',
      });
    }
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create coupon',
    });
  }
};

// Update coupon (admin)
export const updateCoupon = async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not established',
      });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update coupon',
    });
  }
};

// Delete coupon (admin)
export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not established',
      });
    }

    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete coupon',
    });
  }
};

