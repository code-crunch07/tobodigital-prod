import mongoose, { Document, Schema } from 'mongoose';

export interface IMegaMenuColumn {
  title?: string;
  links: Array<{
    label: string;
    href: string;
    description?: string;
    image?: string;
    isCategory?: boolean; // If true, href is category slug
    isExternal?: boolean; // If true, opens in new tab
  }>;
}

export interface INavigation extends Document {
  label: string;
  href: string;
  order: number;
  isActive: boolean;
  isExternal?: boolean;
  hasMegaMenu: boolean;
  megaMenuColumns?: IMegaMenuColumn[];
  megaMenuImage?: string; // Optional promotional image for mega menu
  megaMenuWidth?: 'default' | 'wide' | 'full'; // Mega menu width option
  createdAt: Date;
  updatedAt: Date;
}

const MegaMenuColumnSchema = new Schema({
  title: {
    type: String,
    trim: true,
  },
  links: [{
    label: {
      type: String,
      required: true,
      trim: true,
    },
    href: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    isCategory: {
      type: Boolean,
      default: false,
    },
    isExternal: {
      type: Boolean,
      default: false,
    },
  }],
}, { _id: false });

const NavigationSchema: Schema = new Schema(
  {
    label: {
      type: String,
      required: [true, 'Label is required'],
      trim: true,
    },
    href: {
      type: String,
      required: [true, 'Href is required'],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isExternal: {
      type: Boolean,
      default: false,
    },
    hasMegaMenu: {
      type: Boolean,
      default: false,
    },
    megaMenuColumns: {
      type: [MegaMenuColumnSchema],
      default: [],
    },
    megaMenuImage: {
      type: String,
    },
    megaMenuWidth: {
      type: String,
      enum: ['default', 'wide', 'full'],
      default: 'default',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<INavigation>('Navigation', NavigationSchema);
