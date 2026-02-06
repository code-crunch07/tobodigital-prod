export interface Product {
  _id: string;
  itemName: string;
  brandName: string;
  mainImage: string;
  galleryImages?: string[];
  videoLink?: string;
  amazonLink?: string;
  productType?: string;
  productId?: string;
  modelNo?: string;
  manufacturerName?: string;
  productDescription?: string;
  bulletPoints?: string[] | string;
  genericKeyword?: string[] | string;
  specialFeatures?: string[] | string;
  itemTypeName?: string;
  partNumber?: string;
  color?: string;
  yourPrice: number;
  maximumRetailPrice?: number;
  maxRetailPrice?: number;
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  stockQuantity?: number;
  itemCondition?: string;
  compatibleDevices?: string[] | string;
  includedComponents?: string[] | string;
  itemDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  itemWeight?: number;
  itemPackageDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  packageDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  packageWeight?: number;
  hsnCode?: string;
  countryOfOrigin?: string;
  warrantyDescription?: string;
  areBatteriesRequired?: boolean;
  batteriesRequired?: boolean;
  importerContactInformation?: string;
  importerContactInfo?: string;
  packerContactInformation?: string;
  packerContactInfo?: string;
  productCategory?: {
    name: string;
    _id: string;
    slug?: string;
  };
  subCategory?: {
    name: string;
    _id: string;
  };
  productSubCategory?: {
    name: string;
    _id: string;
  };
  isFeatured?: boolean;
  isActive?: boolean;
}
