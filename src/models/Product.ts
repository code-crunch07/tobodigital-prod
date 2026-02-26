import mongoose, { Document, Schema } from 'mongoose';

export interface IProductVariant {
  _id?: any;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  maxRetailPrice?: number;
  stockQuantity: number;
  isDefault?: boolean;
}

export interface IProduct extends Document {
  // Basic Information
  mainImage: string;
  galleryImages: string[];
  productType: string;
  itemName: string;
  brandName: string;
  productId: string;
  productCategory: mongoose.Types.ObjectId;
  subCategory: mongoose.Types.ObjectId;
  modelNo: string;
  manufacturerName: string;
  shortDescription?: string;
  productDescription: string;
  bulletPoints: string[];
  genericKeyword: string[];
  specialFeatures: string;
  itemTypeName: string;
  partNumber: string;
  color: string;
  
  // Contact Information
  importerContactInfo: string;
  packerContactInfo: string;
  
  // Device & Compatibility
  compatibleDevices: string[];
  includedComponents: string[];
  
  // Dimensions & Weight
  itemDimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  itemWeight: number;
  weightUnit: string;
  packageDimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  packageWeight: number;
  packageWeightUnit: string;
  
  // Pricing
  yourPrice: number;
  maxRetailPrice: number;
  salePrice: number;
  saleStartDate: Date;
  saleEndDate: Date;
  
  // Additional Information
  hsnCode: string;
  countryOfOrigin: string;
  itemCondition: string;
  warrantyDescription: string;
  batteriesRequired: boolean;
  
  // Status
  isActive: boolean;
  stockQuantity: number;
  isFeatured?: boolean;
  showOnHomepage?: boolean;
  freeShipping?: boolean;

  // Variants
  variants?: IProductVariant[];

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  slug?: string;

  // External links
  videoLink?: string;
  amazonLink?: string;

  /** Values for Product Attributes (e.g. Size, Material) – Color uses the color field */
  attributeValues?: Record<string, string>;

  createdAt: Date;
  updatedAt: Date;
}

const ItemDimensionsSchema = new Schema(
  {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    unit: { type: String, required: true, default: 'cm' },
  },
  { _id: false }
);

const VariantSchema = new Schema(
  {
    sku: { type: String, required: true },
    attributes: { type: Schema.Types.Mixed, default: {} },
    price: { type: Number, required: true, min: 0 },
    maxRetailPrice: { type: Number, min: 0 },
    stockQuantity: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const ProductSchema: Schema = new Schema(
  {
    mainImage: { type: String, required: [true, 'Main image is required'] },
    galleryImages: { type: [String], default: [] },
    productType: { type: String, required: true },
    itemName: { type: String, required: [true, 'Item name is required'] },
    brandName: { type: String, required: true },
    productId: { type: String, required: true, unique: true },
    productCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
    },
    modelNo: { type: String, required: true },
    manufacturerName: { type: String, required: true },
    shortDescription: { type: String },
    productDescription: { type: String, required: [true, 'Description is required'] },
    bulletPoints: { type: [String], default: [] },
    genericKeyword: { type: [String], default: [] },
    specialFeatures: { type: String },
    itemTypeName: { type: String, required: true },
    partNumber: { type: String },
    color: { type: String },
    importerContactInfo: { type: String },
    packerContactInfo: { type: String },
    compatibleDevices: { type: [String], default: [] },
    includedComponents: { type: [String], default: [] },
    itemDimensions: { type: ItemDimensionsSchema },
    itemWeight: { type: Number },
    weightUnit: { type: String, default: 'grams' },
    packageDimensions: { type: ItemDimensionsSchema },
    packageWeight: { type: Number },
    packageWeightUnit: { type: String, default: 'grams' },
    yourPrice: { type: Number, required: [true, 'Price is required'], min: 0 },
    maxRetailPrice: { type: Number, min: 0 },
    salePrice: { type: Number, min: 0 },
    saleStartDate: { type: Date },
    saleEndDate: { type: Date },
    hsnCode: { type: String },
    countryOfOrigin: { type: String },
    itemCondition: { type: String, default: 'New' },
    warrantyDescription: { type: String },
    batteriesRequired: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    showOnHomepage: { type: Boolean, default: false },
    freeShipping: { type: Boolean, default: false },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: { type: String },
    slug: { type: String },
    videoLink: { type: String },
    amazonLink: { type: String },
    attributeValues: { type: Schema.Types.Mixed, default: {} },
    variants: { type: [VariantSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProduct>('Product', ProductSchema);



