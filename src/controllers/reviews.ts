import { Request, Response } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';

// POST /api/public/reviews — submit a review (pending approval)
export const submitReview = async (req: Request, res: Response) => {
  try {
    const { productId, rating, reviewText, name, email } = req.body;

    if (!productId || !rating || !reviewText || !name || !email) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const product = await Product.findById(productId).select('itemName mainImage');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const review = await Review.create({
      productId,
      productName: product.itemName,
      productImage: product.mainImage,
      rating: Number(rating),
      reviewText: reviewText.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      isApproved: false,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted and is pending approval.',
      data: { _id: review._id },
    });
  } catch (error) {
    console.error('submitReview error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

// GET /api/public/reviews — fetch approved reviews (for homepage testimonials)
export const getApprovedReviews = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('productName productImage rating reviewText name createdAt');

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('getApprovedReviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};

// GET /api/public/reviews/product/:productId — fetch approved reviews for a product
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId, isApproved: true })
      .sort({ createdAt: -1 })
      .select('rating reviewText name createdAt');

    const total = reviews.length;
    const avg = total > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : null;

    res.json({ success: true, data: reviews, total, averageRating: avg });
  } catch (error) {
    console.error('getProductReviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product reviews.' });
  }
};

// ─── Dashboard routes ──────────────────────────────────────────────────────────

// GET /api/dashboard/reviews — list all reviews for admin
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.approved === 'true') filter.isApproved = true;
    if (req.query.approved === 'false') filter.isApproved = false;

    const [reviews, total] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Review.countDocuments(filter),
    ]);

    res.json({ success: true, data: reviews, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};

// PATCH /api/dashboard/reviews/:id/approve — approve a review
export const approveReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, message: 'Review approved.', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve review.' });
  }
};

// DELETE /api/dashboard/reviews/:id — delete a review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
};
