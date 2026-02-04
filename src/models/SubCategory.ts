import mongoose, { Document, Schema } from 'mongoose';

export interface ISubCategory extends Document {
  name: string;
  description: string;
  slug: string;
  image: string;
  category: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'SubCategory name is required'],
      trim: true,
    },
    description: {
      type: String,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Parent category is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISubCategory>('SubCategory', SubCategorySchema);



