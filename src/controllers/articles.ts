import { Request, Response } from 'express';
import Article from '../models/Article';

export const listArticles = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(String(req.query.page || '1'), 10), 1);
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || '20'), 10), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Article.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Article.countDocuments(),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch articles' });
  }
};

export const getArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.findById(req.params.id).lean();
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.json({ success: true, data: article });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to fetch article' });
  }
};

export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, slug, excerpt, content, status, author, coverImage, tags } = req.body;

    if (!title || !slug || !content || !author) {
      return res.status(400).json({ success: false, message: 'Title, slug, author and content are required' });
    }

    const existing = await Article.findOne({ slug }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'Slug already exists' });
    }

    const article = await Article.create({
      title,
      slug,
      excerpt,
      content,
      status: status === 'published' ? 'published' : 'draft',
      author,
      coverImage,
      tags,
      publishedAt: status === 'published' ? new Date() : null,
    });

    res.status(201).json({ success: true, data: article });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to create article' });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { title, slug, excerpt, content, status, author, coverImage, tags } = req.body;
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    if (slug && slug !== article.slug) {
      const existing = await Article.findOne({ slug }).lean();
      if (existing) {
        return res.status(409).json({ success: false, message: 'Slug already exists' });
      }
      article.slug = slug;
    }

    if (title !== undefined) article.title = title;
    if (excerpt !== undefined) article.excerpt = excerpt;
    if (content !== undefined) article.content = content;
    if (author !== undefined) article.author = author;
    if (coverImage !== undefined) article.coverImage = coverImage;
    if (tags !== undefined) article.tags = Array.isArray(tags) ? tags : [];
    if (status === 'published' || status === 'draft') {
      if (article.status !== status && status === 'published') {
        article.publishedAt = new Date();
      }
      article.status = status;
    }

    await article.save();
    res.json({ success: true, data: article });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to update article' });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Failed to delete article' });
  }
};

