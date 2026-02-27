'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, X, Tag, Edit, Trash2 } from 'lucide-react';
import { getProductAttributes, updateProductAttributes, type ProductAttribute } from '@/lib/api';

export default function ProductAttributesPage() {
  const router = useRouter();
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAttribute, setNewAttribute] = useState({ name: '', type: 'select', values: [''] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAttribute, setEditingAttribute] = useState<ProductAttribute | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getProductAttributes();
        if (!cancelled && res.success && Array.isArray(res.data)) {
          setAttributes(res.data);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load attributes');
          setAttributes([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const saveAttributes = async (next: ProductAttribute[]) => {
    setSaving(true);
    setError(null);
    try {
      const res = await updateProductAttributes(next);
      if (res.success && Array.isArray(res.data)) {
        setAttributes(res.data);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to save attributes');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAttribute = async () => {
    if (!newAttribute.name.trim()) return;
    const next: ProductAttribute[] = [
      ...attributes,
      {
        id: Date.now().toString(),
        name: newAttribute.name.trim(),
        type: newAttribute.type,
        values: newAttribute.values.filter(v => v.trim()),
      },
    ];
    setNewAttribute({ name: '', type: 'select', values: [''] });
    setShowAddForm(false);
    await saveAttributes(next);
  };

  const handleAddValue = (index: number) => {
    const updated = { ...newAttribute };
    updated.values = [...updated.values, ''];
    setNewAttribute(updated);
  };

  const handleValueChange = (index: number, value: string) => {
    const updated = { ...newAttribute };
    updated.values[index] = value;
    setNewAttribute(updated);
  };

  const handleRemoveValue = (index: number) => {
    const updated = { ...newAttribute };
    updated.values = updated.values.filter((_, i) => i !== index);
    setNewAttribute(updated);
  };

  const handleDelete = async (id: string) => {
    const next = attributes.filter(a => a.id !== id);
    setAttributes(next);
    await saveAttributes(next);
  };

  const startEditing = (attr: ProductAttribute) => {
    setEditingId(attr.id);
    // Deep copy to avoid mutating original until save
    setEditingAttribute({
      id: attr.id,
      name: attr.name,
      type: attr.type,
      values: [...attr.values],
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingAttribute(null);
  };

  const handleEditingValueChange = (index: number, value: string) => {
    if (!editingAttribute) return;
    const updated: ProductAttribute = {
      ...editingAttribute,
      values: editingAttribute.values.map((v, i) => (i === index ? value : v)),
    };
    setEditingAttribute(updated);
  };

  const handleEditingAddValue = () => {
    if (!editingAttribute) return;
    setEditingAttribute({
      ...editingAttribute,
      values: [...editingAttribute.values, ''],
    });
  };

  const handleEditingRemoveValue = (index: number) => {
    if (!editingAttribute) return;
    setEditingAttribute({
      ...editingAttribute,
      values: editingAttribute.values.filter((_, i) => i !== index),
    });
  };

  const saveEditing = async () => {
    if (!editingId || !editingAttribute) return;
    const cleaned: ProductAttribute = {
      ...editingAttribute,
      name: editingAttribute.name.trim(),
      values: editingAttribute.type === 'select'
        ? editingAttribute.values.map(v => v.trim()).filter(Boolean)
        : [],
    };
    const next = attributes.map(a => (a.id === editingId ? cleaned : a));
    setEditingId(null);
    setEditingAttribute(null);
    await saveAttributes(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Product Attributes</h1>
            <p className="text-muted-foreground">Manage product attributes like Color, Size, etc.</p>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} disabled={loading || saving}>
          <Plus className="h-4 w-4 mr-2" />
          Add Attribute
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Attribute</CardTitle>
            <CardDescription>Create a new product attribute</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Attribute Name *</Label>
                <Input
                  value={newAttribute.name}
                  onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                  placeholder="e.g., Color, Size, Material"
                />
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={newAttribute.type}
                  onChange={(e) => setNewAttribute({ ...newAttribute, type: e.target.value })}
                >
                  <option value="select">Select / Dropdown</option>
                  <option value="text">Text Input</option>
                  <option value="number">Number</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Values {newAttribute.type === 'select' && '*'}</Label>
              {newAttribute.values.map((value, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    placeholder={`Value ${index + 1}`}
                  />
                  {newAttribute.values.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveValue(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {newAttribute.type === 'select' && (
                <Button
                  variant="outline"
                  onClick={() => handleAddValue(newAttribute.values.length)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Value
                </Button>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAttribute} disabled={saving}>Create Attribute</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Attributes List</CardTitle>
          <CardDescription>All available product attributes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attribute Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Values</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Loading attributes...
                  </TableCell>
                </TableRow>
              ) : attributes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No attributes found. Click "Add Attribute" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                attributes.map((attr) => (
                  <TableRow key={attr.id}>
                    <TableCell className="font-medium">
                      {editingId === attr.id && editingAttribute ? (
                        <Input
                          value={editingAttribute.name}
                          onChange={(e) =>
                            setEditingAttribute({
                              ...editingAttribute,
                              name: e.target.value,
                            } as ProductAttribute)
                          }
                        />
                      ) : (
                        attr.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === attr.id && editingAttribute ? (
                        <select
                          className="w-full px-2 py-1 border rounded-md text-xs capitalize"
                          value={editingAttribute.type}
                          onChange={(e) =>
                            setEditingAttribute({
                              ...editingAttribute,
                              type: e.target.value,
                            } as ProductAttribute)
                          }
                        >
                          <option value="select">Select / Dropdown</option>
                          <option value="text">Text Input</option>
                          <option value="number">Number</option>
                        </select>
                      ) : (
                        <span className="px-2 py-1 bg-muted rounded-md text-xs capitalize">
                          {attr.type}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === attr.id && editingAttribute ? (
                        editingAttribute.type === 'select' ? (
                          <div className="space-y-1">
                            {editingAttribute.values.map((val, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Input
                                  value={val}
                                  onChange={(e) => handleEditingValueChange(idx, e.target.value)}
                                  placeholder={`Value ${idx + 1}`}
                                />
                                {editingAttribute.values.length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleEditingRemoveValue(idx)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleEditingAddValue}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Value
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Free text / number input (no fixed values)
                          </span>
                        )
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {attr.values.map((val, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                            >
                              {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {editingId === attr.id ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditing}
                              disabled={saving}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={saveEditing}
                              disabled={saving}
                            >
                              Save
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditing(attr)}
                              disabled={saving}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(attr.id)}
                              disabled={saving}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
