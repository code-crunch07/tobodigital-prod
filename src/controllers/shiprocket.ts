import { Request, Response } from 'express';
import axios from 'axios';

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
let authToken: string | null = null;
let tokenExpiry: number = 0;

// Get authentication token from Shiprocket
async function getAuthToken(): Promise<string> {
  // Check if token is still valid (tokens typically expire after some time)
  if (authToken && Date.now() < tokenExpiry) {
    return authToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('Shiprocket credentials not configured');
  }

  try {
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email,
      password,
    });

    authToken = response.data.token;
    // Set token expiry to 24 hours from now (adjust based on actual token expiry)
    tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    return authToken;
  } catch (error: any) {
    console.error('Shiprocket authentication error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
}

// Check pincode serviceability
export const checkPincode = async (req: Request, res: Response) => {
  try {
    const { pickup_pincode, delivery_pincode, weight } = req.body;

    if (!pickup_pincode || !delivery_pincode) {
      return res.status(400).json({
        success: false,
        message: 'Pickup pincode and delivery pincode are required',
      });
    }

    // Validate pincode format (6 digits)
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pickup_pincode) || !pincodeRegex.test(delivery_pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format. Pincode must be 6 digits',
      });
    }

    const token = await getAuthToken();

    // Check pincode serviceability
    const serviceabilityResponse = await axios.post(
      `${SHIPROCKET_BASE_URL}/open/orders/check-pincode`,
      {
        pickup_pincode,
        delivery_pincode,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const isServiceable = serviceabilityResponse.data.status === 200;

    // If serviceable and weight provided, get shipping rates
    let shippingRates = null;
    if (isServiceable && weight) {
      try {
        const rateResponse = await axios.post(
          `${SHIPROCKET_BASE_URL}/courier/serviceability/rate`,
          {
            pickup_pincode,
            delivery_pincode,
            weight: parseFloat(weight) || 0.5,
            cod: 0,
            cod_amount: 0,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        shippingRates = rateResponse.data.data?.available_courier_companies || [];
      } catch (rateError: any) {
        console.error('Error fetching shipping rates:', rateError.response?.data || rateError.message);
        // Continue without rates if rate check fails
      }
    }

    return res.json({
      success: true,
      serviceable: isServiceable,
      message: isServiceable
        ? `Delivery available to ${delivery_pincode}`
        : `Delivery not available to ${delivery_pincode}`,
      data: {
        pickup_pincode,
        delivery_pincode,
        serviceability: serviceabilityResponse.data,
        shipping_rates: shippingRates,
        estimated_days: shippingRates?.[0]?.estimated_delivery_days || '3-5',
      },
    });
  } catch (error: any) {
    console.error('Shiprocket pincode check error:', error.response?.data || error.message);

    // Handle specific Shiprocket errors
    if (error.response?.status === 401) {
      // Token expired, clear it and retry once
      authToken = null;
      tokenExpiry = 0;
      try {
        return checkPincode(req, res);
      } catch (retryError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to authenticate with Shiprocket',
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to check pincode serviceability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Calculate shipping rate
export const calculateShipping = async (req: Request, res: Response) => {
  try {
    const { pickup_pincode, delivery_pincode, weight, cod_amount } = req.body;

    if (!pickup_pincode || !delivery_pincode || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Pickup pincode, delivery pincode, and weight are required',
      });
    }

    const token = await getAuthToken();

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/courier/serviceability/rate`,
      {
        pickup_pincode,
        delivery_pincode,
        weight: parseFloat(weight),
        cod: cod_amount > 0 ? 1 : 0,
        cod_amount: cod_amount || 0,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.json({
      success: true,
      available: true,
      rates: response.data.data?.available_courier_companies || [],
      message: 'Shipping rates calculated successfully',
    });
  } catch (error: any) {
    console.error('Shiprocket shipping rate error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      authToken = null;
      tokenExpiry = 0;
      try {
        return calculateShipping(req, res);
      } catch (retryError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to authenticate with Shiprocket',
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to calculate shipping rates',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
