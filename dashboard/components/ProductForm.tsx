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
import { createProduct, updateProduct, uploadImage, uploadImages } from '@/lib/api';
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
    itemPackageDimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
    packageWeight: 0,
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

  useEffect(() => {
    if (product) {
      const productCategoryId = product.productCategory?._id 
        ? String(product.productCategory._id)
        : (product.productCategory ? String(product.productCategory) : '');
      
      const subCategoryId = product.subCategory?._id
        ? String(product.subCategory._id)
        : (product.subCategory ? String(product.subCategory) : '');

      setFormData((prev) => ({
        ...prev,
        ...product,
        productCategory: productCategoryId,
        subCategory: subCategoryId,
        galleryImages: product.galleryImages || [],
        bulletPoints: product.bulletPoints || [],
        genericKeyword: product.genericKeyword || [],
        specialFeatures: Array.isArray(product.specialFeatures) 
          ? product.specialFeatures 
          : (product.specialFeatures ? product.specialFeatures.split(',').map((f: string) => f.trim()).filter((f: string) => f) : []),
        compatibleDevices: product.compatibleDevices || [],
        includedComponents: product.includedComponents || [],
        itemDimensions: product.itemDimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
        itemPackageDimensions: product.itemPackageDimensions || product.packageDimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
        itemCondition: product.itemCondition || 'New',
        areBatteriesRequired: product.areBatteriesRequired ?? product.batteriesRequired ?? false,
        isActive: product.isActive !== undefined ? product.isActive : true,
        // Map backend field names to form field names so inputs show correct values
        maximumRetailPrice: product.maxRetailPrice ?? product.maximumRetailPrice ?? 0,
        importerContactInformation: product.importerContactInfo ?? product.importerContactInformation ?? '',
        packerContactInformation: product.packerContactInfo ?? product.packerContactInformation ?? '',
        seoTitle: product.seoTitle ?? '',
        seoDescription: product.seoDescription ?? '',
        seoKeywords: product.seoKeywords ?? '',
        slug: product.slug ?? '',
        isFeatured: product.isFeatured ?? false,
        showOnHomepage: product.showOnHomepage ?? false,
        videoLink: product.videoLink ?? '',
        amazonLink: product.amazonLink ?? '',
      }));
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
    return subCategories.filter((sub) => sub.category === categoryId);
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
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold">{title}</h3>
        {required && <Badge variant="secondary" className="text-xs">Required</Badge>}
      </div>
      {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          )}
        </button>
  );

  const TagInput = ({ 
    label, 
    value, 
    tags, 
    onAdd, 
    onRemove, 
    placeholder 
  }: { 
    label: string; 
    value: string; 
    tags: string[]; 
    onAdd: (v: string) => void; 
    onRemove: (i: number) => void; 
    placeholder?: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onAdd(e.target.value)}
          placeholder={placeholder}
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

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Main Form - 70% */}
      <form onSubmit={handleSubmit} className="flex-1 space-y-6">
        {/* 1️⃣ Product Information - Always Open */}
        <Card>
          <CardHeader>
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
              value={formData.productCategory || ''}
              onValueChange={(value) => setFormData({ ...formData, productCategory: value, subCategory: '' })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
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
              value={formData.subCategory || ''}
              onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
              disabled={!formData.productCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
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
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
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
        <Card>
          <CardHeader>
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
        <Card>
          <CardHeader>
            <SectionHeader
              icon={IndianRupee}
              title="Pricing & Inventory"
              required
              isExpanded={expandedSections.pricing}
              onToggle={() => toggleSection('pricing')}
            />
          </CardHeader>
        {expandedSections.pricing && (
            <CardContent className="bg-blue-50/50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-gray-700">Price</h4>
                  <div className="space-y-2">
                    <Label>Your Price *</Label>
                    <Input
            type="number" 
            step="0.01"
                      value={formData.yourPrice || ''}
                      onChange={(e) => setFormData({ ...formData, yourPrice: parseFloat(e.target.value) || 0 })}
            required
          />
                  </div>
                  <div className="space-y-2">
                    <Label>MRP</Label>
                    <Input
            type="number" 
            step="0.01"
                      value={formData.maximumRetailPrice || ''}
                      onChange={(e) => setFormData({ ...formData, maximumRetailPrice: parseFloat(e.target.value) || 0 })}
          />
                  </div>
                  <div className="space-y-2">
                    <Label>Sale Price</Label>
                    <Input
            type="number" 
            step="0.01"
                      value={formData.salePrice || ''}
                      onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
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
                      onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
            required
          />
                  </div>
          <div className="space-y-2">
            <Label>Item Condition *</Label>
            <Select
              value={formData.itemCondition || 'New'}
              onValueChange={(value) => setFormData({ ...formData, itemCondition: value })}
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
                      onChange={(e) => setFormData({ ...formData, saleStartDate: e.target.value })}
            />
          </div>
                  <div className="space-y-2">
                    <Label>Sale End Date</Label>
              <Input
                      type="date"
                      value={formData.saleEndDate}
                      onChange={(e) => setFormData({ ...formData, saleEndDate: e.target.value })}
                    />
            </div>
                </div>
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
                    <Label>Weight (grams)</Label>
              <Input
                type="number"
                step="0.01"
                      value={formData.itemWeight || ''}
                onChange={(e) => setFormData({ ...formData, itemWeight: parseFloat(e.target.value) || 0 })}
              />
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
                    <Label>Pkg Weight (grams)</Label>
              <Input
                type="number"
                step="0.01"
                      value={formData.packageWeight || ''}
                onChange={(e) => setFormData({ ...formData, packageWeight: parseFloat(e.target.value) || 0 })}
              />
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
            </CardContent>
        )}
        </Card>

        {/* Save Buttons */}
      <div className="flex justify-end gap-4 pb-6">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[120px]">
          {loading ? 'Saving...' : product ? 'Update Product' : 'Save Product'}
        </Button>
      </div>
    </form>

      {/* Summary Panel - full width on small screens, sticky sidebar on large */}
      <div className="w-full xl:w-[30%] mt-6 xl:mt-0">
        <div className="xl:sticky xl:top-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Name */}
              <div>
                <Label className="text-sm text-gray-600">Product Name</Label>
                <p className="font-semibold mt-1">
                  {formData.itemName || <span className="text-gray-400">Not set</span>}
                </p>
              </div>

              {/* Main Image Preview */}
              <div>
                <Label className="text-sm text-gray-600">Main Image</Label>
                <div className="mt-2">
                  {formData.mainImage ? (
                    <img
                      src={formData.mainImage}
                      alt="Preview"
                      className="w-full h-48 object-cover border rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div>
                <Label className="text-sm text-gray-600">Price</Label>
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
                    <span className="text-gray-400">Not set</span>
                  )}
                </p>
              </div>

              {/* Stock */}
              <div>
                <Label className="text-sm text-gray-600">Stock</Label>
                <p className="font-semibold mt-1">
                  {formData.stockQuantity >= 0 ? (
                    <span className={formData.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}>
                      {formData.stockQuantity} units
                    </span>
                  ) : (
                    <span className="text-gray-400">Not set</span>
                  )}
                </p>
              </div>

              {/* Status */}
              <div>
                <Label className="text-sm text-gray-600">Status</Label>
                <div className="mt-1">
                  {formData.isActive ? (
                    <Badge variant="default" className="bg-green-600">
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
                <Label className="text-sm text-gray-600">Completion</Label>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{completionPercentage}%</span>
                    <Percent className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        completionPercentage === 100
                          ? 'bg-green-600'
                          : completionPercentage >= 70
                          ? 'bg-blue-600'
                          : completionPercentage >= 40
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${completionPercentage}%` }}
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
