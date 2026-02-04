'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Image as ImageIcon, Upload, X } from 'lucide-react';
import { getBanners, createBanner, updateBanner, deleteBanner, uploadImage, getCategories } from '@/lib/api';

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    buttonText: 'Shop Now',
    buttonLink: '/shop',
    order: 0,
    isActive: true,
    type: 'slider' as 'slider' | 'promotion' | 'promo-row',
    category: '',
    titleColor: '#ffffff',
    subtitleColor: '#ffffff',
    descriptionColor: '#ffffff',
    buttonTextColor: '#ff006e',
    buttonBgColor: '#ffffff',
  });

  useEffect(() => {
    loadBanners();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await getBanners();
      setBanners(response.data || []);
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploading(true);
        const url = await uploadImage(file);
        setFormData({ ...formData, image: url });
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      order: 0,
      isActive: true,
      type: 'slider',
      category: '',
      titleColor: '#ffffff',
      subtitleColor: '#ffffff',
      descriptionColor: '#ffffff',
      buttonTextColor: '#ff006e',
      buttonBgColor: '#ffffff',
    });
    setOpenDialog(true);
  };

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image: banner.image || '',
      buttonText: banner.buttonText || 'Shop Now',
      buttonLink: banner.buttonLink || '/shop',
      order: banner.order || 0,
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      type: banner.type || 'slider' as 'slider' | 'promotion' | 'promo-row',
      category: banner.category?._id || banner.category || '',
      titleColor: banner.titleColor || '#ffffff',
      subtitleColor: banner.subtitleColor || '#ffffff',
      descriptionColor: banner.descriptionColor || '#ffffff',
      buttonTextColor: banner.buttonTextColor || '#ff006e',
      buttonBgColor: banner.buttonBgColor || '#ffffff',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await deleteBanner(id);
      loadBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert('Please upload an image or enter an image URL');
      return;
    }
    try {
      const submitData = {
        ...formData,
        category: formData.category || null, // Set to null if empty
      };
      if (editingBanner) {
        await updateBanner(editingBanner._id, submitData);
      } else {
        await createBanner(submitData);
      }
      setOpenDialog(false);
      loadBanners();
    } catch (error: any) {
      console.error('Error saving banner:', error);
      alert(error.response?.data?.message || 'Failed to save banner');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banner Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage promotional banners for homepage slider and promotion sections
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
              <DialogDescription>
                Create or update a promotional banner with image, heading, title, and description
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Top Trending Galaxy Tab S6 Ultra"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="GALAXY TAB 2022"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description or promotional text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Banner Image *</Label>
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : formData.image ? 'Change Image' : 'Upload Image'}
                  </Button>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Or enter image URL"
                    className="flex-1"
                />
                </div>
                {formData.image && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Shop Now"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buttonLink">Button Link</Label>
                  <Input
                    id="buttonLink"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    placeholder="/shop"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Banner Type *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'slider' | 'promotion' | 'promo-row' })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  required
                >
                  <option value="slider">Homepage Slider</option>
                  <option value="promotion">Promotion Banner (After Categories)</option>
                  <option value="promo-row">Promo Row (Two Banners Side by Side)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Slider banners appear in the homepage hero section. Promotion banners appear after the categories section. Promo Row banners appear as two side-by-side banners after the product carousel.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="">None (Homepage/General)</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Select a category to display this banner only on that category page. Leave empty for homepage/general banners.
                </p>
              </div>

              {/* Color Options */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm">Color Customization</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titleColor">Title/Heading Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="titleColor"
                        value={formData.titleColor}
                        onChange={(e) => setFormData({ ...formData, titleColor: e.target.value })}
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.titleColor}
                        onChange={(e) => setFormData({ ...formData, titleColor: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitleColor">Subtitle Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="subtitleColor"
                        value={formData.subtitleColor}
                        onChange={(e) => setFormData({ ...formData, subtitleColor: e.target.value })}
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.subtitleColor}
                        onChange={(e) => setFormData({ ...formData, subtitleColor: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descriptionColor">Description Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="descriptionColor"
                        value={formData.descriptionColor}
                        onChange={(e) => setFormData({ ...formData, descriptionColor: e.target.value })}
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.descriptionColor}
                        onChange={(e) => setFormData({ ...formData, descriptionColor: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buttonTextColor">Button Text Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="buttonTextColor"
                        value={formData.buttonTextColor}
                        onChange={(e) => setFormData({ ...formData, buttonTextColor: e.target.value })}
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.buttonTextColor}
                        onChange={(e) => setFormData({ ...formData, buttonTextColor: e.target.value })}
                        placeholder="#ff006e"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buttonBgColor">Button Background Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="buttonBgColor"
                        value={formData.buttonBgColor}
                        onChange={(e) => setFormData({ ...formData, buttonBgColor: e.target.value })}
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.buttonBgColor}
                        onChange={(e) => setFormData({ ...formData, buttonBgColor: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Order (Display Position)</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first (0, 1, 2...)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isActive">Status</Label>
                  <select
                    id="isActive"
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Subtitle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No banners found. Click "Add Banner" to create one.
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner._id}>
                  <TableCell>
                    {banner.image ? (
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-20 h-20 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{banner.title}</TableCell>
                  <TableCell>{banner.subtitle || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={banner.type === 'promotion' ? 'secondary' : banner.type === 'promo-row' ? 'outline' : 'default'}>
                      {banner.type === 'promotion' ? 'Promotion' : banner.type === 'promo-row' ? 'Promo Row' : 'Slider'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {banner.category?.name || (banner.category ? 'Unknown' : 'General')}
                  </TableCell>
                  <TableCell>{banner.order}</TableCell>
                  <TableCell>
                    <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(banner)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(banner._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
