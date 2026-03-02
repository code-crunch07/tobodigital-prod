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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, X, ChevronDown, ChevronUp, GripVertical, Eye, EyeOff, Upload, Menu } from 'lucide-react';
import { getNavigations, createNavigation, updateNavigation, deleteNavigation, getCategories, uploadImage, getUploadUrl } from '@/lib/api';

interface MegaMenuLink {
  label: string;
  href: string;
  description?: string;
  image?: string;
  isCategory?: boolean;
  isExternal?: boolean;
}

interface MegaMenuColumn {
  title?: string;
  links: MegaMenuLink[];
}

export default function NavigationPage() {
  const [navigations, setNavigations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNavigation, setEditingNavigation] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [basicInfoExpanded, setBasicInfoExpanded] = useState(false);
  const [linkDrawerOpen, setLinkDrawerOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<{ columnIndex: number; linkIndex: number | null } | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const [draggedLink, setDraggedLink] = useState<{ columnIndex: number; linkIndex: number } | null>(null);
  
  const [formData, setFormData] = useState({
    label: '',
    href: '',
    order: 0,
    isActive: true,
    isExternal: false,
    hasMegaMenu: false,
    megaMenuColumns: [] as MegaMenuColumn[],
    megaMenuImage: '',
    megaMenuWidth: 'default' as 'default' | 'wide' | 'full',
  });

  const [linkFormData, setLinkFormData] = useState<MegaMenuLink>({
    label: '',
    href: '',
    description: '',
    image: '',
    isCategory: false,
    isExternal: false,
  });

  useEffect(() => {
    loadNavigations();
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

  const loadNavigations = async () => {
    try {
      setLoading(true);
      const response = await getNavigations();
      setNavigations(response.data || []);
    } catch (error) {
      console.error('Error loading navigations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingNavigation(null);
    setFormData({
      label: '',
      href: '',
      order: navigations.length,
      isActive: true,
      isExternal: false,
      hasMegaMenu: false,
      megaMenuColumns: [],
      megaMenuImage: '',
      megaMenuWidth: 'default',
    });
    setBasicInfoExpanded(false);
    setShowPreview(true);
    setOpenDialog(true);
  };

  const handleEdit = (nav: any) => {
    setEditingNavigation(nav);
    setFormData({
      label: nav.label || '',
      href: nav.href || '',
      order: nav.order || 0,
      isActive: nav.isActive !== undefined ? nav.isActive : true,
      isExternal: nav.isExternal || false,
      hasMegaMenu: nav.hasMegaMenu || false,
      megaMenuColumns: nav.megaMenuColumns || [],
      megaMenuImage: nav.megaMenuImage || '',
      megaMenuWidth: nav.megaMenuWidth || 'default',
    });
    setBasicInfoExpanded(false);
    setShowPreview(true);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this navigation item?')) return;
    try {
      await deleteNavigation(id);
      loadNavigations();
    } catch (error) {
      console.error('Error deleting navigation:', error);
      alert('Failed to delete navigation');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label || !formData.href) {
      alert('Label and Link URL are required');
      return;
    }
    try {
      const submitData = {
        ...formData,
        megaMenuColumns: formData.hasMegaMenu ? formData.megaMenuColumns : [],
        megaMenuImage: formData.hasMegaMenu ? formData.megaMenuImage : '',
      };
      if (editingNavigation) {
        await updateNavigation(editingNavigation._id, submitData);
      } else {
        await createNavigation(submitData);
      }
      setOpenDialog(false);
      loadNavigations();
    } catch (error: any) {
      console.error('Error saving navigation:', error);
      alert(error.response?.data?.message || 'Failed to save navigation');
    }
  };

  const addMegaMenuColumn = () => {
    setFormData({
      ...formData,
      megaMenuColumns: [...formData.megaMenuColumns, { title: '', links: [] }],
    });
  };

  const removeMegaMenuColumn = (index: number) => {
    const newColumns = formData.megaMenuColumns.filter((_, i) => i !== index);
    setFormData({ ...formData, megaMenuColumns: newColumns });
  };

  const updateMegaMenuColumn = (index: number, field: 'title', value: string) => {
    const newColumns = [...formData.megaMenuColumns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setFormData({ ...formData, megaMenuColumns: newColumns });
  };

  const openLinkDrawer = (columnIndex: number, linkIndex: number | null = null) => {
    if (linkIndex !== null) {
      const link = formData.megaMenuColumns[columnIndex].links[linkIndex];
      setLinkFormData({ ...link });
    } else {
      setLinkFormData({
        label: '',
        href: '',
        description: '',
        image: '',
        isCategory: false,
        isExternal: false,
      });
    }
    setEditingLink({ columnIndex, linkIndex });
    setLinkDrawerOpen(true);
  };

  const saveLink = () => {
    if (!linkFormData.label || !linkFormData.href) {
      alert('Label and URL are required');
      return;
    }
    const newColumns = [...formData.megaMenuColumns];
    if (editingLink?.linkIndex !== null && editingLink?.linkIndex !== undefined) {
      newColumns[editingLink.columnIndex].links[editingLink.linkIndex] = { ...linkFormData };
    } else {
      newColumns[editingLink!.columnIndex].links.push({ ...linkFormData });
    }
    setFormData({ ...formData, megaMenuColumns: newColumns });
    setLinkDrawerOpen(false);
    setEditingLink(null);
  };

  const removeLink = (columnIndex: number, linkIndex: number) => {
    const newColumns = [...formData.megaMenuColumns];
    newColumns[columnIndex].links = newColumns[columnIndex].links.filter((_, i) => i !== linkIndex);
    setFormData({ ...formData, megaMenuColumns: newColumns });
  };

  // Drag and Drop Handlers
  const handleColumnDragStart = (index: number) => {
    setDraggedColumn(index);
  };

  const handleColumnDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedColumn === null || draggedColumn === index) return;
    const newColumns = [...formData.megaMenuColumns];
    const dragged = newColumns[draggedColumn];
    newColumns.splice(draggedColumn, 1);
    newColumns.splice(index, 0, dragged);
    setFormData({ ...formData, megaMenuColumns: newColumns });
    setDraggedColumn(index);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
  };

  const handleLinkDragStart = (columnIndex: number, linkIndex: number) => {
    setDraggedLink({ columnIndex, linkIndex });
  };

  const handleLinkDragOver = (e: React.DragEvent, columnIndex: number, linkIndex: number) => {
    e.preventDefault();
    if (!draggedLink || (draggedLink.columnIndex === columnIndex && draggedLink.linkIndex === linkIndex)) return;
    const newColumns = [...formData.megaMenuColumns];
    const column = newColumns[columnIndex];
    const dragged = column.links[draggedLink.linkIndex];
    column.links.splice(draggedLink.linkIndex, 1);
    column.links.splice(linkIndex, 0, dragged);
    setFormData({ ...formData, megaMenuColumns: newColumns });
    setDraggedLink({ columnIndex, linkIndex });
  };

  const handleLinkDragEnd = () => {
    setDraggedLink(null);
  };

  const handleMegaMenuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploading(true);
        const url = await uploadImage(file);
        setFormData({ ...formData, megaMenuImage: url });
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
      } finally {
        setUploading(false);
      }
    }
  };

  // Preview Component
  const MegaMenuPreview = () => {
    if (!formData.hasMegaMenu) return null;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
        <div className="text-sm text-gray-500 mb-4">Live Preview</div>
        <div
          className={`bg-white border border-gray-200 rounded-lg shadow-xl p-6 ${
            formData.megaMenuWidth === 'full'
              ? 'w-full'
              : formData.megaMenuWidth === 'wide'
              ? 'w-screen max-w-7xl'
              : 'w-screen max-w-6xl'
          }`}
        >
          <div className={`grid gap-6 ${formData.megaMenuImage ? 'grid-cols-5' : 'grid-cols-4'}`}>
            {formData.megaMenuColumns.map((column, colIndex) => (
              <div key={colIndex} className="space-y-3">
                {column.title && (
                  <h3 className="font-bold text-gray-900 mb-2">{column.title}</h3>
                )}
                <div className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.href}
                      className="block text-gray-600 hover:text-[#ff006e] py-1 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            {formData.megaMenuImage && (
              <div className="col-span-1">
                <img
                  src={getUploadUrl(formData.megaMenuImage)}
                  alt="Promotional"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff006e]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Navigation Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage navigation links and mega menus for the header
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Navigation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
            {/* Header */}
            <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl">{editingNavigation ? 'Edit Navigation' : 'Add Navigation Item'}</DialogTitle>
                  <DialogDescription className="mt-1">
                    {editingNavigation ? 'Update navigation link details' : 'Create a new navigation link with optional mega menu'}
                  </DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="hidden lg:flex"
                >
                  {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
              </div>
            </DialogHeader>

            {/* Two-Pane Layout */}
            <div className="flex-1 flex overflow-hidden min-h-0" style={{ minHeight: 0 }}>
              {/* Left Pane - Structure */}
              <div className={`flex-1 overflow-y-auto p-6 ${showPreview ? 'lg:w-1/2 border-r' : 'w-full'}`} style={{ maxHeight: '100%' }}>
                  <form id="navigation-form" className="space-y-6" onSubmit={handleSubmit}>
                    {/* Basic Info - Collapsed by Default */}
                    <Card>
                      <CardHeader
                        className="cursor-pointer"
                        onClick={() => setBasicInfoExpanded(!basicInfoExpanded)}
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Basic Info</CardTitle>
                          {basicInfoExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </CardHeader>
                      {basicInfoExpanded && (
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="label">Label *</Label>
                              <Input
                                id="label"
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                placeholder="Shop"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="href">Link URL *</Label>
                              <Input
                                id="href"
                                value={formData.href}
                                onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                                placeholder="/shop"
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="order">Order</Label>
                              <Input
                                id="order"
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="isActive">Status</Label>
                              <select
                                id="isActive"
                                value={formData.isActive ? 'true' : 'false'}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                              >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="isExternal">External Link</Label>
                              <select
                                id="isExternal"
                                value={formData.isExternal ? 'true' : 'false'}
                                onChange={(e) => setFormData({ ...formData, isExternal: e.target.value === 'true' })}
                                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                              >
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                              </select>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>

                    {/* Mega Menu Toggle */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Mega Menu</CardTitle>
                            <CardDescription className="mt-1">
                              Create a multi-column dropdown menu
                            </CardDescription>
                          </div>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.hasMegaMenu}
                              onChange={(e) => {
                                setFormData({ ...formData, hasMegaMenu: e.target.checked });
                              }}
                              className="w-5 h-5 rounded border-gray-300"
                            />
                            <span className="text-sm font-medium">Enable Mega Menu</span>
                          </label>
                        </div>
                      </CardHeader>

                      {formData.hasMegaMenu && (
                        <CardContent className="space-y-6 animate-in slide-in-from-top-2 duration-200">
                          {/* Layout Settings */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="megaMenuWidth">Menu Width</Label>
                              <select
                                id="megaMenuWidth"
                                value={formData.megaMenuWidth}
                                onChange={(e) => setFormData({ ...formData, megaMenuWidth: e.target.value as any })}
                                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                              >
                                <option value="default">Default (6xl)</option>
                                <option value="wide">Wide (7xl)</option>
                                <option value="full">Full Width</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="megaMenuImage">Promo Image (Optional)</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="megaMenuImage"
                                  value={formData.megaMenuImage}
                                  onChange={(e) => setFormData({ ...formData, megaMenuImage: e.target.value })}
                                  placeholder="Image URL or upload"
                                  className="flex-1"
                                />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleMegaMenuImageUpload}
                                  className="hidden"
                                  id="megaMenuImageUpload"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => document.getElementById('megaMenuImageUpload')?.click()}
                                  disabled={uploading}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  {uploading ? 'Uploading...' : 'Upload'}
                                </Button>
                              </div>
                              {formData.megaMenuImage && (
                                <img src={getUploadUrl(formData.megaMenuImage)} alt="Preview" className="mt-2 h-20 w-auto rounded" />
                              )}
                            </div>
                          </div>

                          {/* Columns */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold">Columns</Label>
                              <Button type="button" variant="outline" size="sm" onClick={addMegaMenuColumn}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Column
                              </Button>
                            </div>

                            <div className="space-y-3">
                              {formData.megaMenuColumns.map((column, colIndex) => (
                                <Card
                                  key={colIndex}
                                  className={`transition-all duration-150 ${
                                    draggedColumn === colIndex ? 'opacity-50' : ''
                                  }`}
                                  draggable
                                  onDragStart={() => handleColumnDragStart(colIndex)}
                                  onDragOver={(e) => handleColumnDragOver(e, colIndex)}
                                  onDragEnd={handleColumnDragEnd}
                                >
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 flex-1">
                                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                                        <Input
                                          placeholder="Column Title (optional)"
                                          value={column.title || ''}
                                          onChange={(e) => updateMegaMenuColumn(colIndex, 'title', e.target.value)}
                                          className="flex-1"
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeMegaMenuColumn(colIndex)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    {column.links.map((link, linkIndex) => (
                                      <div
                                        key={linkIndex}
                                        className={`flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-all duration-150 ${
                                          draggedLink?.columnIndex === colIndex && draggedLink?.linkIndex === linkIndex
                                            ? 'opacity-50'
                                            : ''
                                        }`}
                                        draggable
                                        onDragStart={() => handleLinkDragStart(colIndex, linkIndex)}
                                        onDragOver={(e) => handleLinkDragOver(e, colIndex, linkIndex)}
                                        onDragEnd={handleLinkDragEnd}
                                      >
                                        <div className="flex items-center gap-2 flex-1">
                                          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                                          <span className="text-sm">{link.label}</span>
                                          {link.isCategory && (
                                            <Badge variant="outline" className="text-xs">Category</Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openLinkDrawer(colIndex, linkIndex)}
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeLink(colIndex, linkIndex)}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openLinkDrawer(colIndex, null)}
                                      className="w-full mt-2"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Link
                                    </Button>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>

                  </form>
                </div>

                {/* Right Pane - Preview */}
                {showPreview && (
                  <div className="hidden lg:block w-1/2 overflow-y-auto p-6 bg-gray-50">
                    <MegaMenuPreview />
                  </div>
                )}
              </div>

              {/* Submit Buttons - Fixed at bottom */}
              <div className="flex justify-end gap-2 p-6 border-t bg-white flex-shrink-0">
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    const form = document.getElementById('navigation-form') as HTMLFormElement;
                    if (form) {
                      form.requestSubmit();
                    } else {
                      handleSubmit(e as any);
                    }
                  }}
                >
                  {editingNavigation ? 'Update' : 'Create'}
                </Button>
              </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Link Drawer */}
      <Drawer open={linkDrawerOpen} onOpenChange={setLinkDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{editingLink?.linkIndex !== null ? 'Edit Link' : 'Add Link'}</DrawerTitle>
            <DrawerDescription>Configure the link details</DrawerDescription>
          </DrawerHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkLabel">Label *</Label>
              <Input
                id="linkLabel"
                value={linkFormData.label}
                onChange={(e) => setLinkFormData({ ...linkFormData, label: e.target.value })}
                placeholder="Dresses"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkHref">URL *</Label>
              <Input
                id="linkHref"
                value={linkFormData.href}
                onChange={(e) => setLinkFormData({ ...linkFormData, href: e.target.value })}
                placeholder="/dresses"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkDescription">Description</Label>
              <Input
                id="linkDescription"
                value={linkFormData.description || ''}
                onChange={(e) => setLinkFormData({ ...linkFormData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkType">Link Type</Label>
              <select
                id="linkType"
                value={linkFormData.isCategory ? 'category' : 'link'}
                onChange={(e) => {
                  const isCategory = e.target.value === 'category';
                  setLinkFormData({ ...linkFormData, isCategory, href: isCategory ? '' : linkFormData.href });
                }}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="link">Internal Link</option>
                <option value="category">Category</option>
              </select>
            </div>
            {linkFormData.isCategory && (
              <div className="space-y-2">
                <Label htmlFor="linkCategory">Category</Label>
                <select
                  id="linkCategory"
                  value={linkFormData.href}
                  onChange={(e) => setLinkFormData({ ...linkFormData, href: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.slug || cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="linkExternal"
                checked={linkFormData.isExternal || false}
                onChange={(e) => setLinkFormData({ ...linkFormData, isExternal: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="linkExternal" className="cursor-pointer">External Link</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setLinkDrawerOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={saveLink}>
                Save
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Navigation List */}
      {navigations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No navigation items found</p>
            <Button onClick={handleAdd}>Create First Navigation Item</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Navigation Items</CardTitle>
            <CardDescription>Manage your site navigation menu</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {navigations.map((nav) => (
                  <TableRow key={nav._id}>
                    <TableCell>{nav.order}</TableCell>
                    <TableCell className="font-medium">{nav.label}</TableCell>
                    <TableCell>
                      <a href={nav.href} target={nav.isExternal ? '_blank' : '_self'} className="text-blue-600 hover:underline">
                        {nav.href}
                      </a>
                    </TableCell>
                    <TableCell>
                      {nav.hasMegaMenu ? (
                        <Badge variant="secondary">Mega Menu</Badge>
                      ) : (
                        <Badge variant="outline">Simple Link</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={nav.isActive ? 'default' : 'secondary'}>
                        {nav.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(nav)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(nav._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
