'use client';

import { useEffect, useState, useRef } from 'react';
import { getSubCategories, createSubCategory, updateSubCategory, deleteSubCategory, getCategories, uploadImage } from '@/lib/api';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SubCategoriesPage() {
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '', category: '', image: '' });
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subCategoriesRes, categoriesRes] = await Promise.all([
        getSubCategories(),
        getCategories(),
      ]);
      setSubCategories(subCategoriesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      await deleteSubCategory(id);
      loadData();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      alert('Failed to delete subcategory');
    }
  };

  const handleEdit = (subCategory: any) => {
    setEditingSubCategory(subCategory);
    setFormData({ 
      name: subCategory.name, 
      description: subCategory.description || '',
      category: subCategory.category?._id || subCategory.category || '',
      image: subCategory.image || ''
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingSubCategory(null);
    setFormData({ name: '', description: '', category: '', image: '' });
    setOpenDialog(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubCategory) {
        await updateSubCategory(editingSubCategory._id, formData);
      } else {
        await createSubCategory(formData);
      }
      setOpenDialog(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving subcategory:', error);
      alert(error.response?.data?.message || 'Failed to save subcategory');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subcategories</h1>
          <p className="text-muted-foreground">Manage product subcategories</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subcategory
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSubCategory ? 'Edit Subcategory' : 'Add Subcategory'}</DialogTitle>
              <DialogDescription>
                {editingSubCategory ? 'Update subcategory information' : 'Create a new subcategory'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Subcategory Image</Label>
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
                  {formData.image && (
                    <div className="relative">
                      <img
                        src={formData.image}
                        alt="Subcategory"
                        className="w-24 h-24 object-cover border rounded-md"
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
                <p className="text-sm text-muted-foreground">
                  Accepted formats: JPG, PNG, GIF, WebP (Max 5MB)
                </p>
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingSubCategory ? 'Update' : 'Create'}</Button>
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
              <TableHead>Category</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No subcategories found
                </TableCell>
              </TableRow>
            ) : (
              subCategories.map((subCategory) => (
                <TableRow key={subCategory._id}>
                  <TableCell>
                    {subCategory.image ? (
                      <img src={subCategory.image} alt={subCategory.name} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {typeof subCategory.category === 'object' 
                      ? subCategory.category?.name 
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="font-medium">{subCategory.name}</TableCell>
                  <TableCell>{subCategory.description || '-'}</TableCell>
                  <TableCell>{subCategory.slug}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(subCategory)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(subCategory._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
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



