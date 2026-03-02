import { Schema, Document, model } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: 'draft' | 'published';
  author: string;
  coverImage?: string;
  tags?: string[];
  views: number;
  publishedAt?: Date | null;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, trim: true, default: '' },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    author: { type: String, required: true, trim: true },
    coverImage: { type: String, trim: true, default: '' },
    tags: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ status: 1, createdAt: -1 });

const Article = model<IArticle>('Article', ArticleSchema);

export default Article;

