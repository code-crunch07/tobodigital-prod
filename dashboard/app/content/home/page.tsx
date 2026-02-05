'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, Upload, X } from 'lucide-react';
import { getBanners, createBanner, updateBanner, deleteBanner, uploadImage, getUploadUrl } from '@/lib/api';
import Image from 'next/image';

export default function HomePageBlocksPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<any[]>([]);
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
  });

  useEffect(() => {
    loadBanners();
  }, []);

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

  const handleAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      order: banners.length,
      isActive: true,
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

  const toggleStatus = async (banner: any) => {
    try {
      await updateBanner(banner._id, {
        ...banner,
        isActive: !banner.isActive,
      });
      loadBanners();
    } catch (error) {
      console.error('Error updating banner:', error);
      alert('Failed to update banner status');
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
        alert('Failed to upload image. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await updateBanner(editingBanner._id, formData);
      } else {
        await createBanner(formData);
      }
      setOpenDialog(false);
      loadBanners();
    } catch (error: any) {
      console.error('Error saving banner:', error);
      alert(error.response?.data?.message || 'Failed to save banner');
    }
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? 'default' : 'secondary'}>
        {status ? 'active' : 'inactive'}
      </Badge>
    );
  };

  const activeBanners = banners.filter((b) => b.isActive).length;
  const inactiveBanners = banners.filter((b) => !b.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Home Page Blocks</h1>
            <p className="text-muted-foreground">Manage homepage content sections and blocks</p>
          </div>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Block
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
              <DialogDescription>
                {editingBanner ? 'Update banner details' : 'Add a new promo banner to the homepage'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Banner title"
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Banner subtitle"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Banner description"
                />
              </div>

              <div>
                <Label htmlFor="image">Banner Image *</Label>
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="flex items-center gap-4 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : formData.image ? 'Change Image' : 'Upload Image'}
                  </Button>
                  {formData.image && (
                    <div className="relative">
                      <Image
                        src={getUploadUrl(formData.image)}
                        alt="Preview"
                        width={200}
                        height={100}
                        className="rounded border object-cover"
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
                <div className="mt-2">
                  <Label htmlFor="imageUrl" className="text-sm text-muted-foreground">
                    Or enter image URL:
                  </Label>
                  <Input
                    id="imageUrl"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Accepted formats: JPG, PNG, GIF, WebP (Max 5MB)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <Label htmlFor="buttonLink">Button Link</Label>
                  <Input
                    id="buttonLink"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    placeholder="/shop"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order">Order (Position)</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active (Visible on homepage)
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingBanner ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Blocks</CardDescription>
            <CardTitle className="text-3xl">{banners.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-3xl text-green-500">{activeBanners}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Inactive</CardDescription>
            <CardTitle className="text-3xl text-gray-500">{inactiveBanners}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Promo Banners</CardTitle>
          <CardDescription>Manage homepage promo banners displayed on the client frontend</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Loading banners...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No banners found</p>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Banner
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Subtitle</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((banner) => (
                    <TableRow key={banner._id}>
                      <TableCell>
                        {banner.image ? (
                          <Image
                            src={getUploadUrl(banner.image)}
                            alt={banner.title}
                            width={80}
                            height={40}
                            className="rounded object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-20 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{banner.title}</TableCell>
                      <TableCell>{banner.subtitle || '-'}</TableCell>
                      <TableCell>{banner.order || 0}</TableCell>
                      <TableCell>{getStatusBadge(banner.isActive)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleStatus(banner)}
                            title={banner.isActive ? 'Hide' : 'Show'}
                          >
                            {banner.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(banner._id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
