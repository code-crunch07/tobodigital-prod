import { Request, Response } from 'express';
import Setting from '../models/Setting';
import Integration from '../models/Integration';

const SITE_KEY = 'site';
const DEFAULT_SITE = {
  siteName: 'Tobo Admin',
  siteUrl: 'https://tobo.com',
  email: 'info@tobo.com',
  phone: '+91 1234567890',
  address: '123 Main St, City, State 12345',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  logo: '',
  favicon: '',
};

// GET /api/public/site-settings
// Public subset used by storefront (no admin auth)
export const getPublicSiteSettings = async (req: Request, res: Response) => {
  try {
    const doc = await Setting.findOne({ key: SITE_KEY }).lean();
    const value = (doc?.value as Record<string, unknown>) || {};
    const merged = { ...DEFAULT_SITE, ...value } as any;
    res.json({
      success: true,
      data: {
        siteName: merged.siteName,
        siteUrl: merged.siteUrl,
        logo: merged.logo || '',
        favicon: merged.favicon || '',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch public site settings',
    });
  }
};

// GET /api/settings/site
export const getSiteSettings = async (req: Request, res: Response) => {
  try {
    let doc = await Setting.findOne({ key: SITE_KEY }).lean();
    if (!doc) {
      return res.json({
        success: true,
        data: DEFAULT_SITE,
      });
    }
    const value = (doc.value as Record<string, unknown>) || {};
    res.json({
      success: true,
      data: { ...DEFAULT_SITE, ...value },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch site settings',
    });
  }
};

// PATCH /api/settings/site
export const updateSiteSettings = async (req: Request, res: Response) => {
  try {
    const allowed = ['siteName', 'siteUrl', 'email', 'phone', 'address', 'currency', 'timezone', 'logo', 'favicon'];
    const updates: Record<string, unknown> = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    let doc = await Setting.findOne({ key: SITE_KEY }).lean();
    const current = (doc?.value as Record<string, unknown>) || {};
    const merged = { ...current, ...updates };
    await Setting.findOneAndUpdate(
      { key: SITE_KEY },
      { $set: { value: merged }, $setOnInsert: { key: SITE_KEY } },
      { upsert: true, new: true }
    );
    res.json({
      success: true,
      data: { ...DEFAULT_SITE, ...merged },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update site settings',
    });
  }
};

// GET /api/settings/integrations
export const getIntegrations = async (req: Request, res: Response) => {
  try {
    let list = await Integration.find().sort({ name: 1 }).lean();
    if (list.length === 0) {
      const defaults = [
        // Payment gateways
        { name: 'Stripe', type: 'Payment', status: 'disconnected' },
        { name: 'PayPal', type: 'Payment', status: 'disconnected' },
        { name: 'Razorpay', type: 'Payment', status: 'disconnected' },
        // Shipping providers
        { name: 'FedEx', type: 'Shipping', status: 'disconnected' },
        { name: 'Shiprocket', type: 'Shipping', status: 'disconnected' },
        // Email / marketing
        { name: 'SendGrid', type: 'Email', status: 'disconnected' },
        { name: 'Brevo', type: 'Email', status: 'disconnected' },
      ];
      await Integration.insertMany(defaults);
      list = await Integration.find().sort({ name: 1 }).lean();
    }
    const data = list.map((i: any) => ({
      id: i._id.toString(),
      name: i.name,
      type: i.type,
      status: i.status,
      apiKey: i.apiKey ? '••••••••' : undefined,
    }));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch integrations',
    });
  }
};

// PATCH /api/settings/integrations/:id
export const updateIntegration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, apiKey } = req.body;
    const update: any = {};
    if (status === 'connected' || status === 'disconnected') update.status = status;
    if (apiKey !== undefined) update.apiKey = apiKey ? String(apiKey) : '';
    const integration = await Integration.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!integration) {
      return res.status(404).json({ success: false, message: 'Integration not found' });
    }
    res.json({
      success: true,
      data: {
        id: integration._id.toString(),
        name: integration.name,
        type: integration.type,
        status: integration.status,
        apiKey: integration.apiKey ? '••••••••' : undefined,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update integration',
    });
  }
};

// GET /api/settings/backups
export const listBackups = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: [],
      message: 'Backup storage not implemented. Add MongoDB dump or S3 to enable.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to list backups',
    });
  }
};

// POST /api/settings/backups
export const createBackup = async (req: Request, res: Response) => {
  try {
    res.status(501).json({
      success: false,
      message: 'Backup creation not implemented. Add backend (e.g. mongodump, S3) to enable.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create backup',
    });
  }
};
