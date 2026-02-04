'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, X, Tag, Edit, Trash2 } from 'lucide-react';

export default function ProductAttributesPage() {
  const router = useRouter();
  const [attributes, setAttributes] = useState([
    { id: '1', name: 'Color', values: ['Red', 'Blue', 'Green', 'Black'], type: 'select' },
    { id: '2', name: 'Size', values: ['S', 'M', 'L', 'XL'], type: 'select' },
    { id: '3', name: 'Material', values: ['Cotton', 'Polyester', 'Wool'], type: 'select' },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAttribute, setNewAttribute] = useState({ name: '', type: 'select', values: [''] });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddAttribute = () => {
    if (newAttribute.name.trim()) {
      setAttributes([...attributes, {
        id: Date.now().toString(),
        name: newAttribute.name,
        type: newAttribute.type,
        values: newAttribute.values.filter(v => v.trim())
      }]);
      setNewAttribute({ name: '', type: 'select', values: [''] });
      setShowAddForm(false);
    }
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

  const handleDelete = (id: string) => {
    setAttributes(attributes.filter(a => a.id !== id));
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
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Attribute
        </Button>
      </div>

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
              <Button onClick={handleAddAttribute}>Create Attribute</Button>
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
              {attributes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No attributes found. Click "Add Attribute" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                attributes.map((attr) => (
                  <TableRow key={attr.id}>
                    <TableCell className="font-medium">{attr.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-muted rounded-md text-xs capitalize">
                        {attr.type}
                      </span>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(attr.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
