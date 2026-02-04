import { Request, Response } from 'express';
import User from '../models/User';

const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
    } = req.query;

    const query: any = { role: 'customer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const customers = await User.find(query)
      .select('-password')
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        customers,
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalCustomers: total,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: 'customer',
    }).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Check if email already exists
    const existingCustomer = await User.findOne({ email });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const customer = new User({
      name,
      email,
      password, // In production, hash this password
      role: 'customer',
    });

    await customer.save();

    const customerData = customer.toObject();
    delete (customerData as any).password;

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customerData,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customerId = req.params.id;
    const updateData = req.body;

    // Don't allow role change through this endpoint
    if (updateData.role) {
      delete updateData.role;
    }

    const customer = await User.findOneAndUpdate(
      { _id: customerId, role: 'customer' },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTheme = async (req: Request, res: Response) => {
  try {
    const customerId = req.params.id;
    const { theme } = req.body;

    if (!theme || !['light', 'dark'].includes(theme)) {
      return res.status(400).json({
        success: false,
        message: 'Valid theme (light/dark) is required',
      });
    }

    const customer = await User.findOneAndUpdate(
      { _id: customerId, role: 'customer' },
      { theme },
      {
        new: true,
      }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.json({
      success: true,
      message: 'Theme updated successfully',
      data: customer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'customer',
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateTheme,
  deleteCustomer,
};



