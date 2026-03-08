import { Request, Response } from 'express';
import axios from 'axios';

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
let authToken: string | null = null;
let tokenExpiry: number = 0;

// Get authentication token from Shiprocket
export async function getAuthToken(): Promise<string> {
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
    const response = await axios.post<{ token?: string }>(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email,
      password,
    });

    const token = response.data.token;
    if (typeof token !== 'string') {
      throw new Error('Invalid token from Shiprocket');
    }
    authToken = token;
    // Set token expiry to 24 hours from now (adjust based on actual token expiry)
    tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    return authToken;
  } catch (error: any) {
    console.error('Shiprocket authentication error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
}

// Check pincode serviceability
export const checkPincode = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { pickup_pincode, delivery_pincode, weight } = req.body;

    if (!pickup_pincode || !delivery_pincode) {
      return res.status(400).json({
        success: false,
        message: 'Pickup pincode and delivery pincode are required',
      });
    }

    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pickup_pincode) || !pincodeRegex.test(delivery_pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format. Pincode must be 6 digits',
      });
    }

    const token = await getAuthToken();

    const serviceabilityResponse = await axios.get(
      `${SHIPROCKET_BASE_URL}/courier/serviceability/`,
      {
        params: {
          pickup_postcode: pickup_pincode,
          delivery_postcode: delivery_pincode,
          weight: parseFloat(weight) || 0.5,
          cod: 0,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const couriers = serviceabilityResponse.data?.data?.available_courier_companies || [];
    const isServiceable = couriers.length > 0;

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
        shipping_rates: isServiceable ? couriers : null,
        estimated_days: couriers[0]?.estimated_delivery_days || '3-5',
      },
    });
  } catch (error: any) {
    console.error('Shiprocket pincode check error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
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

// Track shipment by AWB number
export const trackShipment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { awb } = req.params;

    if (!awb) {
      return res.status(400).json({
        success: false,
        message: 'AWB number is required',
      });
    }

    const token = await getAuthToken();

    const trackingResponse = await axios.get(
      `${SHIPROCKET_BASE_URL}/courier/track/awb/${awb}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const trackingData = trackingResponse.data?.tracking_data;

    return res.json({
      success: true,
      tracking: {
        current_status: trackingData?.shipment_track?.[0]?.current_status || 'Unknown',
        delivered_date: trackingData?.shipment_track?.[0]?.delivered_date || null,
        origin: trackingData?.shipment_track?.[0]?.origin || '',
        destination: trackingData?.shipment_track?.[0]?.destination || '',
        courier_name: trackingData?.shipment_track?.[0]?.courier_name || '',
        edd: trackingData?.shipment_track?.[0]?.edd || null,
        awb: awb,
        track_url: trackingData?.track_url || '',
        activities: trackingData?.shipment_track_activities || [],
      },
    });
  } catch (error: any) {
    console.error('Shiprocket tracking error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      authToken = null;
      tokenExpiry = 0;
      try {
        return trackShipment(req, res);
      } catch (retryError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to authenticate with Shiprocket',
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch tracking information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Calculate shipping rate
export const calculateShipping = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { pickup_pincode, delivery_pincode, weight, cod_amount } = req.body;

    if (!pickup_pincode || !delivery_pincode || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Pickup pincode, delivery pincode, and weight are required',
      });
    }

    const token = await getAuthToken();

    const response = await axios.get(
      `${SHIPROCKET_BASE_URL}/courier/serviceability/`,
      {
        params: {
          pickup_postcode: pickup_pincode,
          delivery_postcode: delivery_pincode,
          weight: parseFloat(weight),
          cod: cod_amount > 0 ? 1 : 0,
        },
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
