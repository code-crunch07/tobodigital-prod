import { Request, Response } from 'express';
import LegalPage from '../models/LegalPage';

export const listLegalPages = async (_req: Request, res: Response) => {
  try {
    const pages = await LegalPage.find().sort({ title: 1 }).lean();
    res.json({ success: true, data: pages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch legal pages' });
  }
};

export const getLegalPage = async (req: Request, res: Response) => {
  try {
    const page = await LegalPage.findById(req.params.id).lean();
    if (!page) {
      return res.status(404).json({ success: false, message: 'Legal page not found' });
    }
    res.json({ success: true, data: page });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch legal page' });
  }
};

export const createLegalPage = async (req: Request, res: Response) => {
  try {
    const { title, slug, content, isPublished } = req.body;
    if (!title || !slug || !content) {
      return res.status(400).json({ success: false, message: 'Title, slug and content are required' });
    }

    const existing = await LegalPage.findOne({ slug }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'Slug already exists' });
    }

    const page = await LegalPage.create({
      title,
      slug,
      content,
      isPublished: isPublished !== false,
      lastUpdatedAt: new Date(),
    });

    res.status(201).json({ success: true, data: page });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to create legal page' });
  }
};

export const updateLegalPage = async (req: Request, res: Response) => {
  try {
    const { title, slug, content, isPublished } = req.body;
    const page = await LegalPage.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Legal page not found' });
    }

    if (slug && slug !== page.slug) {
      const existing = await LegalPage.findOne({ slug }).lean();
      if (existing) {
        return res.status(409).json({ success: false, message: 'Slug already exists' });
      }
      page.slug = slug;
    }

    if (title !== undefined) page.title = title;
    if (content !== undefined) page.content = content;
    if (typeof isPublished === 'boolean') page.isPublished = isPublished;
    page.lastUpdatedAt = new Date();

    await page.save();
    res.json({ success: true, data: page });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to update legal page' });
  }
};

export const deleteLegalPage = async (req: Request, res: Response) => {
  try {
    const page = await LegalPage.findByIdAndDelete(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Legal page not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to delete legal page' });
  }
};

