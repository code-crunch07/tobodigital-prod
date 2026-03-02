'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Image as ImageIcon, X, Plus } from 'lucide-react';
import { getProducts, getUploadUrl } from '@/lib/api';

export default function MediaManagerPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryInput, setGalleryInput] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts({ limit: 1000 });
      setProducts(response.data?.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMainImage = () => {
    if (imageUrl.trim() && selectedProduct) {
      // In a real app, this would call an API to update the product
      alert('Main image would be updated via API');
      setImageUrl('');
    }
  };

  const handleAddGalleryImage = () => {
    if (galleryInput.trim()) {
      setGalleryUrls([...galleryUrls, galleryInput.trim()]);
      setGalleryInput('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryUrls(galleryUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Manager</h1>
          <p className="text-muted-foreground">Upload and manage images for products</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Media</CardTitle>
            <CardDescription>Add main image and gallery images for products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Product</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.itemName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Main Image URL</Label>
              <div className="flex gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <Button onClick={handleAddMainImage} disabled={!selectedProduct || !imageUrl}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              {imageUrl && (
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Gallery Images</Label>
              <div className="flex gap-2">
                <Input
                  value={galleryInput}
                  onChange={(e) => setGalleryInput(e.target.value)}
                  placeholder="https://example.com/gallery-image.jpg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddGalleryImage();
                    }
                  }}
                />
                <Button onClick={handleAddGalleryImage} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {galleryUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                    <button
                      onClick={() => handleRemoveGalleryImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Library */}
        <Card>
          <CardHeader>
            <CardTitle>Media Library</CardTitle>
            <CardDescription>Browse all product images</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                {products.filter(p => p.mainImage).map((product) => (
                  <div key={product._id} className="space-y-2">
                    <img
                      src={getUploadUrl(product.mainImage)}
                      alt={product.itemName}
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <p className="text-sm font-medium truncate">{product.itemName}</p>
                    <div className="flex gap-1">
                      {product.galleryImages?.slice(0, 3).map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={getUploadUrl(img)}
                          alt={`${product.itemName} ${idx + 1}`}
                          className="w-12 h-12 object-cover rounded border"
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {products.filter(p => p.mainImage).length === 0 && (
                  <div className="col-span-2 text-center py-12 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No media files found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
