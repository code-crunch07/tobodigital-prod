import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBanner extends Document {
  title?: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
  type: 'slider' | 'promotion' | 'promo-row';
  category?: mongoose.Types.ObjectId | string; // Category ID or slug
  titleColor?: string;
  subtitleColor?: string;
  descriptionColor?: string;
  buttonTextColor?: string;
  buttonBgColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema = new Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    buttonText: {
      type: String,
      default: 'Shop Now',
    },
    buttonLink: {
      type: String,
      default: '/shop',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ['slider', 'promotion', 'promo-row'],
      default: 'slider',
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    titleColor: {
      type: String,
      default: '#ffffff',
    },
    subtitleColor: {
      type: String,
      default: '#ffffff',
    },
    descriptionColor: {
      type: String,
      default: '#ffffff',
    },
    buttonTextColor: {
      type: String,
      default: '#ff006e',
    },
    buttonBgColor: {
      type: String,
      default: '#ffffff',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBanner>('Banner', BannerSchema);
