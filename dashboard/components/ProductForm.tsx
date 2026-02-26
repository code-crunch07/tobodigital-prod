'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createProduct, updateProduct, uploadImage, uploadImages, getProductAttributes, type ProductAttribute } from '@/lib/api';
import { cn } from '@/lib/utils';
import RichTextEditor from '@/components/RichTextEditor';
import {
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Package,
  IndianRupee,
  Warehouse,
  Ruler,
  FileText,
  Truck,
  Search,
  Settings,
  Info,
  CheckCircle2,
  AlertCircle,
  Percent,
} from 'lucide-react';

interface ProductFormProps {
  product?: any;
  categories: any[];
  subCategories?: any[];
  onSuccess: () => void;
}

// TagInput component - moved outside to prevent recreation on each render (fixes focus loss)
const TagInput = ({ 
  label, 
  value, 
  tags, 
  onChange,
  onAdd, 
  onRemove, 
  placeholder 
}: { 
  label: string; 
  value: string; 
  tags: string[]; 
  onChange: (v: string) => void;
  onAdd: (v: string) => void; 
  onRemove: (i: number) => void; 
  placeholder?: string;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="flex gap-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="whitespace-nowrap overflow-x-auto"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (value.trim()) {
              onAdd(value.trim());
            }
          }
        }}
      />
      <Button
        type="button"
        onClick={() => value.trim() && onAdd(value.trim())}
        variant="outline"
        size="icon"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
    {tags.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, i) => (
          <Badge key={i} variant="secondary" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    )}
  </div>
);

export default function ProductForm({ product, categories, subCategories = [], onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    mainImage: '',
    galleryImages: [] as string[],
    videoLink: '',
    amazonLink: '',
    productType: '',
    itemName: '',
    brandName: '',
    productId: '',
    productCategory: '',
    subCategory: '',
    modelNo: '',
    manufacturerName: '',
    shortDescription: '',
    productDescription: '',
    bulletPoints: [] as string[],
    genericKeyword: [] as string[],
    specialFeatures: [] as string[],
    itemTypeName: '',
    partNumber: '',
    color: '',
    attributeValues: {} as Record<string, string>,
    yourPrice: 0,
    maximumRetailPrice: 0,
    salePrice: 0,
    saleStartDate: '',
    saleEndDate: '',
    stockQuantity: 0,
    itemCondition: 'New',
    compatibleDevices: [] as string[],
    includedComponents: [] as string[],
    itemDimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
    itemWeight: 0,
    weightUnit: 'grams',
    itemPackageDimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
    packageWeight: 0,
    packageWeightUnit: 'grams',
    hsnCode: '',
    countryOfOrigin: '',
    warrantyDescription: '',
    areBatteriesRequired: false,
    importerContactInformation: '',
    packerContactInformation: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    slug: '',
    isActive: true,
    isFeatured: false,
    showOnHomepage: false,
    freeShipping: false,
    variants: [] as {
      id?: string;
      sku: string;
      attributes: Record<string, string>;
      price: number;
      maxRetailPrice?: number;
      stockQuantity: number;
      isDefault?: boolean;
    }[],
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bulletPointInput, setBulletPointInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [deviceInput, setDeviceInput] = useState('');
  const [componentInput, setComponentInput] = useState('');
  const [seoKeywordInput, setSeoKeywordInput] = useState('');
  
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    media: true,
    pricing: true,
    attributes: true,
    dimensions: true,
    technical: false,
    supplier: false,
    seo: false,
    status: true,
  });

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImagesInputRef = useRef<HTMLInputElement>(null);

  const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>([]);

  useEffect(() => {
    getProductAttributes().then((res) => {
      if (res.success && Array.isArray(res.data)) setProductAttributes(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (product) {
      const productCategoryId = product.productCategory?._id 
        ? String(product.productCategory._id)
        : (product.productCategory ? String(product.productCategory) : '');
      
      const subCategoryId = product.subCategory?._id
        ? String(product.subCategory._id)
        : (product.subCategory ? String(product.subCategory) : '');

      // Extract MRP - check both field names
      const mrp = product.maxRetailPrice ?? product.maximumRetailPrice ?? 0;

      // Extract attributeValues - ensure it's an object
      const attrs = product.attributeValues && typeof product.attributeValues === 'object' 
        ? { ...product.attributeValues } 
        : {};

      setFormData({
        mainImage: product.mainImage || '',
        galleryImages: product.galleryImages || [],
        videoLink: product.videoLink || '',
        amazonLink: product.amazonLink || '',
        productType: product.productType || '',
        itemName: product.itemName || '',
        brandName: product.brandName || '',
        productId: product.productId || '',
        productCategory: productCategoryId,
        subCategory: subCategoryId,
        modelNo: product.modelNo || '',
        manufacturerName: product.manufacturerName || '',
        shortDescription: product.shortDescription || '',
        productDescription: product.productDescription || '',
        bulletPoints: Array.isArray(product.bulletPoints) ? product.bulletPoints : [],
        genericKeyword: Array.isArray(product.genericKeyword) ? product.genericKeyword : [],
        specialFeatures: Array.isArray(product.specialFeatures) 
          ? product.specialFeatures 
          : (product.specialFeatures ? product.specialFeatures.split(',').map((f: string) => f.trim()).filter((f: string) => f) : []),
        itemTypeName: product.itemTypeName || '',
        partNumber: product.partNumber || '',
        color: product.color || '',
        attributeValues: attrs,
        yourPrice: product.yourPrice || 0,
        maximumRetailPrice: mrp,
        salePrice: product.salePrice || 0,
        saleStartDate: product.saleStartDate || '',
        saleEndDate: product.saleEndDate || '',
        stockQuantity: product.stockQuantity || 0,
        itemCondition: product.itemCondition || 'New',
        compatibleDevices: Array.isArray(product.compatibleDevices) ? product.compatibleDevices : [],
        includedComponents: Array.isArray(product.includedComponents) ? product.includedComponents : [],
        itemDimensions: product.itemDimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
        itemWeight: product.itemWeight || 0,
        weightUnit: product.weightUnit || 'grams',
        itemPackageDimensions: product.itemPackageDimensions || product.packageDimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
        packageWeight: product.packageWeight || 0,
        packageWeightUnit: product.packageWeightUnit || 'grams',
        hsnCode: product.hsnCode || '',
        countryOfOrigin: product.countryOfOrigin || '',
        warrantyDescription: product.warrantyDescription || '',
        areBatteriesRequired: product.areBatteriesRequired ?? product.batteriesRequired ?? false,
        importerContactInformation: product.importerContactInfo ?? product.importerContactInformation ?? '',
        packerContactInformation: product.packerContactInfo ?? product.packerContactInformation ?? '',
        seoTitle: product.seoTitle || '',
        seoDescription: product.seoDescription || '',
        seoKeywords: product.seoKeywords || '',
        slug: product.slug || '',
        isActive: product.isActive !== undefined ? product.isActive : true,
        isFeatured: product.isFeatured ?? false,
        showOnHomepage: product.showOnHomepage ?? false,
        freeShipping: product.freeShipping ?? false,
        variants: Array.isArray(product.variants)
          ? product.variants.map((v: any) => ({
              id: String(v._id || ''),
              sku: v.sku || '',
              attributes: v.attributes && typeof v.attributes === 'object' ? { ...v.attributes } : {},
              price: typeof v.price === 'number' ? v.price : product.yourPrice || 0,
              maxRetailPrice: typeof v.maxRetailPrice === 'number'
                ? v.maxRetailPrice
                : (product.maxRetailPrice ?? product.maximumRetailPrice ?? 0),
              stockQuantity: typeof v.stockQuantity === 'number' ? v.stockQuantity : product.stockQuantity || 0,
              isDefault: !!v.isDefault,
            }))
          : [],
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: any = {
        ...formData,
        genericKeyword: Array.isArray(formData.genericKeyword) ? formData.genericKeyword : [],
        specialFeatures: Array.isArray(formData.specialFeatures) ? formData.specialFeatures.join(', ') : formData.specialFeatures,
      };

      // Normalize variants for API (optional feature)
      if (Array.isArray(formData.variants) && formData.variants.length > 0) {
        submitData.variants = formData.variants.map((v) => ({
          sku: v.sku,
          attributes: v.attributes || {},
          price: Number.isFinite(v.price) ? v.price : formData.yourPrice,
          maxRetailPrice: v.maxRetailPrice ?? formData.maximumRetailPrice,
          stockQuantity: Number.isFinite(v.stockQuantity) ? v.stockQuantity : 0,
          isDefault: !!v.isDefault,
        }));
      }

      if (submitData.maximumRetailPrice !== undefined) {
        submitData.maxRetailPrice = submitData.maximumRetailPrice;
        delete submitData.maximumRetailPrice;
      }
      if (submitData.importerContactInformation !== undefined) {
        submitData.importerContactInfo = submitData.importerContactInformation;
        delete submitData.importerContactInformation;
      }
      if (submitData.packerContactInformation !== undefined) {
        submitData.packerContactInfo = submitData.packerContactInformation;
        delete submitData.packerContactInformation;
      }
      if (submitData.itemPackageDimensions !== undefined) {
        submitData.packageDimensions = submitData.itemPackageDimensions;
        delete submitData.itemPackageDimensions;
      }
      if (submitData.areBatteriesRequired !== undefined) {
        submitData.batteriesRequired = submitData.areBatteriesRequired;
        delete submitData.areBatteriesRequired;
      }

      if (!submitData.subCategory || submitData.subCategory === '') {
        delete submitData.subCategory;
      }

      if (product) {
        await updateProduct(product._id, submitData);
      } else {
        await createProduct(submitData);
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const addToArray = (field: string, value: string, inputSetter: (v: string) => void) => {
    if (value.trim()) {
      setFormData((prev: any) => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()],
      }));
      inputSetter('');
    }
  };

  const removeFromArray = (field: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }));
  };

  const getSubCategoriesForCategory = (categoryId: string) => {
    if (!categoryId) return [];
    return subCategories.filter((sub) => {
      const catId = sub.category?._id ?? sub.category;
      return catId != null && String(catId) === String(categoryId);
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const requiredFields = [
      formData.itemName,
      formData.brandName,
      formData.productId,
      formData.productCategory,
      formData.modelNo,
      formData.manufacturerName,
      formData.productDescription,
      formData.itemTypeName,
      formData.mainImage,
      formData.yourPrice > 0,
      formData.stockQuantity >= 0,
    ];
    const filled = requiredFields.filter(Boolean).length;
    return Math.round((filled / requiredFields.length) * 100);
  }, [formData]);

  const SectionHeader = ({
    icon: Icon,
    title,
    required,
    isExpanded,
    onToggle
  }: {
    icon: any;
    title: string;
    required?: boolean;
    isExpanded: boolean;
    onToggle: () => void;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 rounded-t-xl hover:bg-muted/60 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {required && <Badge variant="secondary" className="text-xs">Required</Badge>}
      </div>
      <span className="text-muted-foreground transition-transform duration-200">
        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </span>
    </button>
  );

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex-1 space-y-6">
        {/* Product Information */}
        <Card className="rounded-2xl overflow-hidden border-border shadow-sm">
          <CardHeader className="p-0">
            <SectionHeader
              icon={Package}
              title="Product Information"
            required
              isExpanded={expandedSections.basic}
              onToggle={() => toggleSection('basic')}
          />
          </CardHeader>
          {expandedSections.basic && (
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input
            value={formData.itemName} 
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            required
                    placeholder="Enter product name"
          />
                </div>
          <div className="space-y-2">
                  <Label>Category *</Label>
            <Select
              key={`category-${formData.productCategory}`}
              value={formData.productCategory || ''}
              onValueChange={(value) => setFormData({ ...formData, productCategory: value, subCategory: '' })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category">
                  {formData.productCategory && categories.find(c => String(c._id) === String(formData.productCategory))?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={String(cat._id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
                <div className="space-y-2">
                  <Label>Brand *</Label>
                  <Input
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onValueChange={(value) => setFormData({ ...formData, isActive: value === 'active' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Input
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief description for product cards"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Type *</Label>
                  <Input
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Product ID *</Label>
                  <Input
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    required
                  />
                </div>
          <div className="space-y-2">
            <Label>Sub Category</Label>
            <Select
              key={`subcategory-${formData.subCategory}`}
              value={formData.subCategory || ''}
              onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
              disabled={!formData.productCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.productCategory ? "Select subcategory" : "Select category first"}>
                  {formData.subCategory && getSubCategoriesForCategory(formData.productCategory).find(s => String(s._id) === String(formData.subCategory))?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {getSubCategoriesForCategory(formData.productCategory).length === 0 && formData.productCategory ? (
                  <SelectItem value="__none__" disabled>No subcategories for this category</SelectItem>
                ) : null}
                {getSubCategoriesForCategory(formData.productCategory).map((sub) => (
                  <SelectItem key={sub._id} value={String(sub._id)}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
                <div className="space-y-2">
                  <Label>Model No. *</Label>
                  <Input
            value={formData.modelNo} 
                    onChange={(e) => setFormData({ ...formData, modelNo: e.target.value })}
            required
          />
                </div>
                <div className="space-y-2">
                  <Label>Manufacturer Name *</Label>
                  <Input
            value={formData.manufacturerName} 
                    onChange={(e) => setFormData({ ...formData, manufacturerName: e.target.value })}
            required
          />
                </div>
                <div className="space-y-2">
                  <Label>Item Type Name *</Label>
                  <Input
                    value={formData.itemTypeName}
                    onChange={(e) => setFormData({ ...formData, itemTypeName: e.target.value })}
              required
            />
          </div>
                <div className="space-y-2">
                  <Label>Part Number</Label>
              <Input
                    value={formData.partNumber}
                    onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                  />
            </div>
                {/* Product Attributes from Settings: Color uses formData.color, others use attributeValues */}
                {(() => {
                  const colorAttr = productAttributes.find((a) => a.name.toLowerCase() === 'color');
                  if (!colorAttr) {
                    return (
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <Input
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          placeholder="e.g. Black, Red"
                        />
                      </div>
                    );
                  }
                  const colorIsFromList = colorAttr.values.includes(formData.color);
                  return (
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Select
                        value={colorIsFromList ? formData.color : '__other__'}
                        onValueChange={(v) => setFormData({
                          ...formData,
                          color: v === '__other__' ? '' : v,
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorAttr.values.map((val) => (
                            <SelectItem key={val} value={val}>{val}</SelectItem>
                          ))}
                          <SelectItem value="__other__">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {!colorIsFromList && (
                        <Input
                          placeholder="Enter color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        />
                      )}
                    </div>
                  );
                })()}
                {productAttributes.filter((a) => a.name.toLowerCase() !== 'color').map((attr) => {
                  const attrValue = formData.attributeValues[attr.name] || '';
                  return (
                    <div key={attr.id} className="space-y-2">
                      <Label>{attr.name}</Label>
                      <Select
                        key={`attr-${attr.id}-${attrValue}`}
                        value={attrValue}
                        onValueChange={(v) => setFormData({
                          ...formData,
                          attributeValues: { ...formData.attributeValues, [attr.name]: v },
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${attr.name.toLowerCase()}`}>
                            {attrValue && attr.values.includes(attrValue) ? attrValue : ''}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {attr.values.map((val) => (
                            <SelectItem key={val} value={val}>{val}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
            </div>
              <div className="space-y-2">
                <Label>Product Description *</Label>
                <RichTextEditor
                  value={formData.productDescription}
                  onChange={(value) => setFormData({ ...formData, productDescription: value })}
                  placeholder="Enter detailed product description"
                />
          </div>
              <TagInput
                label="Bullet Points"
                value={bulletPointInput}
                tags={formData.bulletPoints}
                onChange={(v) => setBulletPointInput(v)}
                onAdd={(v) => {
                  addToArray('bulletPoints', v, setBulletPointInput);
                }}
                onRemove={(i) => removeFromArray('bulletPoints', i)}
                placeholder="Add bullet point"
              />
              <TagInput
                label="Generic Keywords"
                value={keywordInput}
                tags={formData.genericKeyword}
                onChange={(v) => setKeywordInput(v)}
                onAdd={(v) => {
                  addToArray('genericKeyword', v, setKeywordInput);
                }}
                onRemove={(i) => removeFromArray('genericKeyword', i)}
                placeholder="Add keyword"
              />
            </CardContent>
        )}
        </Card>

        {/* 2️⃣ Media Section */}
        <Card className="rounded-2xl overflow-hidden border-border shadow-sm">
          <CardHeader className="p-0">
            <SectionHeader
              icon={ImageIcon}
              title="Media"
              required
              isExpanded={expandedSections.media}
              onToggle={() => toggleSection('media')}
            />
          </CardHeader>
        {expandedSections.media && (
            <CardContent className="space-y-6">
          <div>
            <Label>Main Image *</Label>
            <input
              type="file"
              ref={mainImageInputRef}
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    setUploading(true);
                    const url = await uploadImage(file);
                    setFormData({ ...formData, mainImage: url });
                  } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('Failed to upload image. Please try again.');
                  } finally {
                    setUploading(false);
                  }
                }
              }}
            />
                <div className="mt-2">
                  {formData.mainImage ? (
                    <div className="relative inline-block">
                  <img
                    src={formData.mainImage}
                    alt="Main product"
                        className="w-48 h-48 object-cover border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mainImage: '' })}
                        className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                  >
                        <X className="h-4 w-4" />
                  </button>
                </div>
                  ) : (
                    <div
                      onClick={() => mainImageInputRef.current?.click()}
                      className="w-48 h-48 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50"
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload</p>
                      </div>
                    </div>
              )}
            </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => mainImageInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : formData.mainImage ? 'Change Image' : 'Upload Main Image'}
                </Button>
          </div>

          <div>
                <Label>Gallery Images</Label>
            <input
              type="file"
              ref={galleryImagesInputRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  try {
                    setUploading(true);
                    const urls = await uploadImages(files);
                    setFormData({
                      ...formData,
                      galleryImages: [...formData.galleryImages, ...urls],
                    });
                  } catch (error) {
                    console.error('Error uploading images:', error);
                    alert('Failed to upload images. Please try again.');
                  } finally {
                    setUploading(false);
                    if (galleryImagesInputRef.current) {
                      galleryImagesInputRef.current.value = '';
                    }
                  }
                }
              }}
            />
              <Button
                type="button"
                variant="outline"
                onClick={() => galleryImagesInputRef.current?.click()}
                disabled={uploading}
                  className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Add Gallery Images'}
              </Button>
            {formData.galleryImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-4">
                {formData.galleryImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={img}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-24 object-cover border rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeFromArray('galleryImages', i)}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

              <div className="space-y-2">
                <Label>Video Link</Label>
            <Input
              value={formData.videoLink}
              onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
              <div className="space-y-2">
                <Label>Buy on Amazon (URL)</Label>
                <Input
                  value={formData.amazonLink || ''}
                  onChange={(e) => setFormData({ ...formData, amazonLink: e.target.value })}
                  placeholder="https://www.amazon.in/..."
                />
                <p className="text-xs text-muted-foreground">Optional. Adds a &quot;Buy from Amazon&quot; button on the product page.</p>
              </div>
            </CardContent>
        )}
        </Card>

        {/* 3️⃣ Pricing & Inventory */}
        <Card className="rounded-2xl overflow-hidden border-border shadow-sm">
          <CardHeader className="p-0">
            <SectionHeader
              icon={IndianRupee}
              title="Pricing & Inventory"
              required
              isExpanded={expandedSections.pricing}
              onToggle={() => toggleSection('pricing')}
            />
          </CardHeader>
        {expandedSections.pricing && (
          <CardContent className="bg-primary/5 dark:bg-primary/10 p-6 rounded-b-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-foreground">Price</h4>
                <div className="space-y-2">
                  <Label>Your Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.yourPrice || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        yourPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>MRP</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.maximumRetailPrice || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maximumRetailPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sale Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.salePrice || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salePrice: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-gray-700">Stock</h4>
                <div className="space-y-2">
                  <Label>Stock Quantity *</Label>
                  <Input
                    type="number"
                    value={formData.stockQuantity || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockQuantity: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Item Condition *</Label>
                  <Select
                    value={formData.itemCondition || 'New'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, itemCondition: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Refurbished">Refurbished</SelectItem>
                      <SelectItem value="Used">Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sale Start Date</Label>
                  <Input
                    type="date"
                    value={formData.saleStartDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        saleStartDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sale End Date</Label>
                  <Input
                    type="date"
                    value={formData.saleEndDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        saleEndDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="mt-2 border-t border-blue-100 pt-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">
                    Variants (optional)
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 max-w-xl">
                    Use variants when this product has options like Color or
                    Size and each option needs its own price and stock. If you
                    do not add variants, the base price and stock above will be
                    used.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      variants: [
                        ...formData.variants,
                        {
                          id: Date.now().toString(),
                          sku: formData.productId
                            ? `${formData.productId}-${formData.variants.length + 1}`
                            : '',
                          attributes: {},
                          price: formData.yourPrice || 0,
                          maxRetailPrice:
                            formData.maximumRetailPrice || undefined,
                          stockQuantity: formData.stockQuantity || 0,
                          isDefault: formData.variants.length === 0,
                        },
                      ],
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variant
                </Button>
              </div>

              {formData.variants.length > 0 && (
                <div className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <div
                      key={variant.id || index}
                      className="rounded-lg border border-blue-100 bg-white p-3 sm:p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500">
                            Variant {index + 1}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            (SKU, attributes, price & stock)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                            <input
                              type="radio"
                              name="defaultVariant"
                              checked={!!variant.isDefault}
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  variants: formData.variants.map((v, i) => ({
                                    ...v,
                                    isDefault: i === index,
                                  })),
                                })
                              }
                            />
                            Default
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                variants: formData.variants.filter(
                                  (_, i) => i !== index,
                                ),
                              })
                            }
                            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-600">SKU</Label>
                          <Input
                            value={variant.sku}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                variants: formData.variants.map((v, i) =>
                                  i === index
                                    ? { ...v, sku: e.target.value }
                                    : v,
                                ),
                              })
                            }
                            placeholder="Variant SKU"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-600">
                            Price
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variant.price ?? ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                variants: formData.variants.map((v, i) =>
                                  i === index
                                    ? {
                                        ...v,
                                        price:
                                          parseFloat(e.target.value) || 0,
                                      }
                                    : v,
                                ),
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-600">MRP</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variant.maxRetailPrice ?? ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                variants: formData.variants.map((v, i) =>
                                  i === index
                                    ? {
                                        ...v,
                                        maxRetailPrice:
                                          parseFloat(e.target.value) || 0,
                                      }
                                    : v,
                                ),
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-600">
                            Stock
                          </Label>
                          <Input
                            type="number"
                            value={variant.stockQuantity ?? ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                variants: formData.variants.map((v, i) =>
                                  i === index
                                    ? {
                                        ...v,
                                        stockQuantity:
                                          parseInt(e.target.value) || 0,
                                      }
                                    : v,
                                ),
                              })
                            }
                          />
                        </div>
                      </div>

                      {productAttributes.length > 0 && (
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {productAttributes.map((attr) => (
                            <div key={attr.id} className="space-y-1.5">
                              <Label className="text-xs text-gray-600">
                                {attr.name}
                              </Label>
                              <Select
                                key={`variant-${index}-${attr.name}`}
                                value={
                                  (variant.attributes &&
                                    variant.attributes[attr.name]) ||
                                  ''
                                }
                                onValueChange={(v) =>
                                  setFormData({
                                    ...formData,
                                    variants: formData.variants.map((vv, i) =>
                                      i === index
                                        ? {
                                            ...vv,
                                            attributes: {
                                              ...(vv.attributes || {}),
                                              [attr.name]: v,
                                            },
                                          }
                                        : vv,
                                    ),
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={`Select ${attr.name.toLowerCase()}`}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {attr.values.map((val) => (
                                    <SelectItem key={val} value={val}>
                                      {val}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        )}
        </Card>

        {/* 4️⃣ Product Attributes */}
        <Card>
          <CardHeader>
            <SectionHeader
              icon={Info}
              title="Product Attributes"
              isExpanded={expandedSections.attributes}
              onToggle={() => toggleSection('attributes')}
            />
          </CardHeader>
          {expandedSections.attributes && (
            <CardContent className="space-y-6">
              <TagInput
                label="Special Features"
                value={featureInput}
                tags={Array.isArray(formData.specialFeatures) ? formData.specialFeatures : []}
                onChange={(v) => setFeatureInput(v)}
                onAdd={(v) => {
                  addToArray('specialFeatures', v, setFeatureInput);
                }}
                onRemove={(i) => removeFromArray('specialFeatures', i)}
                placeholder="Add special feature"
              />
              <TagInput
                label="Compatible Devices"
                value={deviceInput}
                tags={formData.compatibleDevices}
                onChange={(v) => setDeviceInput(v)}
                onAdd={(v) => {
                  addToArray('compatibleDevices', v, setDeviceInput);
                }}
                onRemove={(i) => removeFromArray('compatibleDevices', i)}
                placeholder="Add compatible device"
              />
              <TagInput
                label="Included Components"
                value={componentInput}
                tags={formData.includedComponents}
                onChange={(v) => setComponentInput(v)}
                onAdd={(v) => {
                  addToArray('includedComponents', v, setComponentInput);
                }}
                onRemove={(i) => removeFromArray('includedComponents', i)}
                placeholder="Add component"
              />
            </CardContent>
          )}
        </Card>

        {/* 5️⃣ Dimensions & Weight - Inline Rows */}
        <Card>
          <CardHeader>
            <SectionHeader
              icon={Ruler}
              title="Dimensions & Weight"
              isExpanded={expandedSections.dimensions}
              onToggle={() => toggleSection('dimensions')}
            />
          </CardHeader>
          {expandedSections.dimensions && (
            <CardContent className="space-y-6">
            <div>
                <h4 className="font-semibold mb-4">Item Dimensions</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Length (cm)</Label>
              <Input
                type="number"
                step="0.01"
                      value={formData.itemDimensions.length || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  itemDimensions: { ...formData.itemDimensions, length: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>
                  <div className="space-y-2">
                    <Label>Width (cm)</Label>
              <Input
                type="number"
                step="0.01"
                      value={formData.itemDimensions.width || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  itemDimensions: { ...formData.itemDimensions, width: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>
                  <div className="space-y-2">
                    <Label>Height (cm)</Label>
              <Input
                type="number"
                step="0.01"
                      value={formData.itemDimensions.height || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  itemDimensions: { ...formData.itemDimensions, height: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>
                  <div className="space-y-2">
                    <Label>Item Weight</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  className="flex-1"
                  value={formData.itemWeight || ''}
                  onChange={(e) => setFormData({ ...formData, itemWeight: parseFloat(e.target.value) || 0 })}
                />
                <Select
                  value={formData.weightUnit || 'grams'}
                  onValueChange={(v) => setFormData({ ...formData, weightUnit: v })}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grams">grams</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
              </div>
            <div>
                <h4 className="font-semibold mb-4">Package Dimensions</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Pkg Length (cm)</Label>
              <Input
                type="number"
                step="0.01"
                      value={formData.itemPackageDimensions.length || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  itemPackageDimensions: { ...formData.itemPackageDimensions, length: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>
                  <div className="space-y-2">
                    <Label>Pkg Width (cm)</Label>
              <Input
                type="number"
                step="0.01"
                      value={formData.itemPackageDimensions.width || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  itemPackageDimensions: { ...formData.itemPackageDimensions, width: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>
                  <div className="space-y-2">
                    <Label>Pkg Height (cm)</Label>
              <Input
                type="number"
                step="0.01"
                      value={formData.itemPackageDimensions.height || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  itemPackageDimensions: { ...formData.itemPackageDimensions, height: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>
                  <div className="space-y-2">
                    <Label>Package Weight</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  className="flex-1"
                  value={formData.packageWeight || ''}
                  onChange={(e) => setFormData({ ...formData, packageWeight: parseFloat(e.target.value) || 0 })}
                />
                <Select
                  value={formData.packageWeightUnit || 'grams'}
                  onValueChange={(v) => setFormData({ ...formData, packageWeightUnit: v })}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grams">grams</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* 6️⃣ Technical & Compliance - Collapsed by Default */}
        <Card>
          <CardHeader>
            <SectionHeader
              icon={FileText}
              title="Technical & Compliance"
              isExpanded={expandedSections.technical}
              onToggle={() => toggleSection('technical')}
            />
          </CardHeader>
          {expandedSections.technical && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
                  <Label>HSN Code</Label>
                  <Input
                    value={formData.hsnCode}
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
            />
          </div>
                <div className="space-y-2">
                  <Label>Country of Origin</Label>
                  <Input
                    value={formData.countryOfOrigin}
                    onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                  />
                </div>
              </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="batteriesRequired"
              checked={formData.areBatteriesRequired}
              onChange={(e) => setFormData({ ...formData, areBatteriesRequired: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="batteriesRequired" className="cursor-pointer">
                  Batteries Required
            </Label>
          </div>
              <div className="space-y-2">
                <Label>Warranty Description</Label>
                <textarea
                  className="w-full min-h-[80px] px-3 py-2 border rounded-md resize-y"
                  value={formData.warrantyDescription}
                  onChange={(e) => setFormData({ ...formData, warrantyDescription: e.target.value })}
                  placeholder="Enter warranty details"
                />
        </div>
            </CardContent>
          )}
        </Card>

        {/* 7️⃣ Supplier Information - Collapsed by Default */}
        <Card>
          <CardHeader>
            <SectionHeader
              icon={Truck}
              title="Supplier Information"
              isExpanded={expandedSections.supplier}
              onToggle={() => toggleSection('supplier')}
            />
          </CardHeader>
        {expandedSections.supplier && (
            <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Importer Contact Information</Label>
            <textarea
              className="w-full min-h-[100px] px-3 py-2 border rounded-md resize-y"
              value={formData.importerContactInformation}
              onChange={(e) => setFormData({ ...formData, importerContactInformation: e.target.value })}
              placeholder="Name, Address, Phone, Email"
            />
          </div>
          <div className="space-y-2">
            <Label>Packer Contact Information</Label>
            <textarea
              className="w-full min-h-[100px] px-3 py-2 border rounded-md resize-y"
              value={formData.packerContactInformation}
              onChange={(e) => setFormData({ ...formData, packerContactInformation: e.target.value })}
              placeholder="Name, Address, Phone, Email"
            />
          </div>
            </CardContent>
        )}
        </Card>

        {/* 8️⃣ SEO Section - Collapsed by Default */}
        <Card>
          <CardHeader>
            <SectionHeader
              icon={Search}
              title="SEO & Meta Data"
              isExpanded={expandedSections.seo}
              onToggle={() => toggleSection('seo')}
            />
          </CardHeader>
        {expandedSections.seo && (
            <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Meta Title</Label>
            <Input
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              placeholder="SEO optimized title"
            />
          </div>
          <div className="space-y-2">
            <Label>Slug / URL Handle</Label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="product-url-slug"
            />
          </div>
              </div>
              <div className="space-y-2">
            <Label>Meta Description</Label>
            <textarea
              className="w-full min-h-[100px] px-3 py-2 border rounded-md resize-y"
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              placeholder="SEO optimized description (150-160 characters)"
            />
          </div>
              <TagInput
                label="Meta Keywords"
                value={seoKeywordInput}
                tags={formData.seoKeywords ? formData.seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) : []}
                onChange={(v) => setSeoKeywordInput(v)}
                onAdd={(v) => {
                  if (v) {
                    const keywords = formData.seoKeywords ? formData.seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [];
                    if (!keywords.includes(v)) {
                      setFormData({ ...formData, seoKeywords: [...keywords, v].join(', ') });
                      setSeoKeywordInput('');
                    }
                  }
                }}
                onRemove={(i) => {
                  const keywords = formData.seoKeywords ? formData.seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [];
                  keywords.splice(i, 1);
                  setFormData({ ...formData, seoKeywords: keywords.join(', ') });
                }}
                placeholder="Add keyword"
              />
            </CardContent>
          )}
        </Card>

        {/* Status & Settings */}
        <Card>
          <CardHeader>
            <SectionHeader
              icon={Settings}
              title="Status & Settings"
              isExpanded={expandedSections.status}
              onToggle={() => toggleSection('status')}
            />
          </CardHeader>
        {expandedSections.status && (
            <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="isActive" className="cursor-pointer font-medium">
              Product Active
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="isFeatured" className="cursor-pointer font-medium">
              Featured Product
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showOnHomepage"
              checked={formData.showOnHomepage}
              onChange={(e) => setFormData({ ...formData, showOnHomepage: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="showOnHomepage" className="cursor-pointer font-medium">
              Show on Homepage
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="freeShipping"
              checked={formData.freeShipping}
              onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="freeShipping" className="cursor-pointer font-medium">
              Free Shipping
            </Label>
          </div>
            </CardContent>
        )}
        </Card>

        {/* Save Buttons */}
      <div className="flex flex-wrap justify-end gap-3 pb-6 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess} className="min-w-[100px]">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[140px] bg-primary hover:bg-primary/90">
          {loading ? 'Saving...' : product ? 'Update Product' : 'Save Product'}
        </Button>
      </div>
    </form>

      {/* Summary Panel */}
      <div className="w-full xl:w-[30%] mt-6 xl:mt-0">
        <div className="xl:sticky xl:top-6">
          <Card className="rounded-2xl overflow-hidden border-border shadow-sm">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg">Product Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Name */}
              <div>
                <Label className="text-sm text-muted-foreground">Product Name</Label>
                <p className="font-semibold mt-1">
                  {formData.itemName || <span className="text-gray-400">Not set</span>}
                </p>
              </div>

              {/* Main Image Preview */}
              <div>
                <Label className="text-sm text-muted-foreground">Main Image</Label>
                <div className="mt-2">
                  {formData.mainImage ? (
                    <img
                      src={formData.mainImage}
                      alt="Preview"
                      className="w-full h-48 object-cover border border-border rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-48 border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-muted/50">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div>
                <Label className="text-sm text-muted-foreground">Price</Label>
                <p className="font-semibold text-lg mt-1">
                  {formData.yourPrice > 0 ? (
                    <>
                      ₹{formData.yourPrice.toLocaleString()}
                      {formData.maximumRetailPrice > 0 && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ₹{formData.maximumRetailPrice.toLocaleString()}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </p>
              </div>

              {/* Stock */}
              <div>
                <Label className="text-sm text-muted-foreground">Stock</Label>
                <p className="font-semibold mt-1">
                  {formData.stockQuantity >= 0 ? (
                    <span className={formData.stockQuantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}>
                      {formData.stockQuantity} units
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </p>
              </div>

              {/* Status */}
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <div className="mt-1">
                  {formData.isActive ? (
                    <Badge variant="default" className="bg-emerald-600 dark:bg-emerald-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>

              {/* Completion Percentage */}
              <div>
                <Label className="text-sm text-muted-foreground">Completion</Label>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{completionPercentage}%</span>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div
                      className={cn(
                        'h-2.5 rounded-full transition-all duration-300',
                        completionPercentage === 100 && 'bg-emerald-500',
                        completionPercentage >= 70 && completionPercentage < 100 && 'bg-primary',
                        completionPercentage >= 40 && completionPercentage < 70 && 'bg-amber-500',
                        completionPercentage < 40 && 'bg-destructive/80'
                      )}
                      style={{ width: `${Math.max(0, completionPercentage)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
