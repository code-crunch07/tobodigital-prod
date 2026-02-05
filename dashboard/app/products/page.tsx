'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProducts, deleteProduct, getCategories, getSubCategories, updateProduct, createProduct, bulkDeleteProducts, duplicateProduct } from '@/lib/api';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Edit, Trash2, Search, Package, Filter, Columns, ChevronLeft, ChevronRight, Download, Upload, Copy, Power } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ColumnVisibility {
  image: boolean;
  productName: boolean;
  brand: boolean;
  sku: boolean;
  category: boolean;
  subcategory: boolean;
  price: boolean;
  stock: boolean;
  featured: boolean;
  status: boolean;
  actions: boolean;
}

export default function ProductsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    image: true,
    productName: true,
    brand: true,
    sku: false,
    category: true,
    subcategory: false,
    price: true,
    stock: true,
    featured: false,
    status: true,
    actions: true,
  });

  // Inline editing
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>('');

  // Bulk selection
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);



  useEffect(() => {
    loadData();
    // Clear selection when filters change
    setSelectedProducts(new Set());
  }, [searchTerm, selectedCategory, selectedStatus, currentPage, itemsPerPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (selectedStatus !== 'all') {
        params.isActive = selectedStatus === 'active';
      }

      const productsRes = await getProducts(params);
      const categoriesRes = await getCategories();
      const subCategoriesRes = await getSubCategories();
      
      setProducts(productsRes.data.products || []);
      setTotalProducts(productsRes.data.totalProducts || 0);
      setTotalPages(productsRes.data.totalPages || 0);
      setCategories(categoriesRes.data || []);
      setSubCategories(subCategoriesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      loadData();
      setSelectedProducts(new Set());
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    
    const count = selectedProducts.size;
    if (!confirm(`Are you sure you want to delete ${count} product(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const ids = Array.from(selectedProducts);
      await bulkDeleteProducts(ids);
      setSelectedProducts(new Set());
      loadData();
      alert(`Successfully deleted ${count} product(s)`);
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('Failed to delete products');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p._id)));
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      setDuplicatingId(id);
      await duplicateProduct(id);
      loadData();
      alert('Product duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating product:', error);
      alert('Failed to duplicate product');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateProduct(id, { isActive: !currentStatus });
      loadData();
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Failed to update product status');
    }
  };

  const handleEditPrice = (product: any) => {
    setEditingPriceId(product._id);
    setEditingPrice(product.yourPrice?.toString() || '');
  };

  const handleSavePrice = async (productId: string) => {
    try {
      const price = parseFloat(editingPrice);
      if (isNaN(price) || price < 0) {
        alert('Please enter a valid price');
        return;
      }
      await updateProduct(productId, { yourPrice: price });
      setEditingPriceId(null);
      setEditingPrice('');
      loadData();
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price');
    }
  };

  const handleCancelEdit = () => {
    setEditingPriceId(null);
    setEditingPrice('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const handleExport = () => {
    try {
      if (products.length === 0) {
        alert('No products to export');
        return;
      }

      // Prepare data for export
      const exportData = products.map(product => ({
        'Product Name': product.itemName || '',
        'Brand Name': product.brandName || '',
        'Category': product.productCategory?.name || '',
        'Subcategory': product.productSubCategory?.name || '',
        'Price': product.yourPrice || 0,
        'MRP': product.maximumRetailPrice || '',
        'Sale Price': product.salePrice || '',
        'Stock Quantity': product.stockQuantity || 0,
        'SKU': product.productSKU || '',
        'Status': product.isActive ? 'Active' : 'Inactive',
        'Description': product.productDescription || '',
        'Main Image': product.mainImage || '',
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in values
            if (typeof value === 'string') {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting products:', error);
      alert('Failed to export products. Please try again.');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file (.csv extension required)');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      // Show loading message
      const loadingMessage = 'Processing CSV file...';
      console.log(loadingMessage);
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim()); // Filter empty lines
      
      if (lines.length < 2) {
        alert('CSV file is empty or invalid. Please ensure it has a header row and at least one data row.');
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Parse CSV with proper handling of quoted fields
      const parseCSVLine = (line: string): string[] => {
        const values: string[] = [];
        let currentValue = '';
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];

          if (char === '"') {
            if (insideQuotes && nextChar === '"') {
              // Escaped quote
              currentValue += '"';
              i++; // Skip next quote
            } else {
              // Toggle quote state
              insideQuotes = !insideQuotes;
            }
          } else if (char === ',' && !insideQuotes) {
            // End of value
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        // Add last value
        values.push(currentValue.trim());
        return values;
      };

      const headers = parseCSVLine(lines[0]);
      const importedProducts: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = parseCSVLine(lines[i]);
        const product: any = {};
        
        headers.forEach((header, index) => {
          product[header] = values[index] || '';
        });

        // Map CSV columns to product fields
        const mappedProduct: any = {
          // Required fields
          itemName: product['Product Name'] || product['Item Name'] || '',
          brandName: product['Brand Name'] || '',
          productId: product['SKU'] || product['Product ID'] || product['Product Name']?.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now(),
          productType: product['Product Type'] || 'General',
          modelNo: product['Model No'] || product['Model Number'] || product['Model'] || 'N/A',
          manufacturerName: product['Manufacturer Name'] || product['Manufacturer'] || product['Brand Name'] || 'N/A',
          productDescription: product['Description'] || product['Product Description'] || product['Product Name'] || '',
          itemTypeName: product['Item Type Name'] || product['Item Type'] || product['Product Type'] || 'General',
          mainImage: product['Main Image'] || product['Image'] || product['Image URL'] || '',
          yourPrice: parseFloat(product['Price']) || parseFloat(product['Your Price']) || 0,
          
          // Optional fields
          maxRetailPrice: product['MRP'] ? parseFloat(product['MRP']) : (product['Maximum Retail Price'] ? parseFloat(product['Maximum Retail Price']) : undefined),
          salePrice: product['Sale Price'] ? parseFloat(product['Sale Price']) : undefined,
          stockQuantity: parseInt(product['Stock Quantity']) || parseInt(product['Stock']) || 0,
          isActive: product['Status']?.toLowerCase() !== 'inactive' && product['Status']?.toLowerCase() !== 'false',
          color: product['Color'] || '',
          partNumber: product['Part Number'] || '',
          hsnCode: product['HSN Code'] || product['HSN'] || '',
          countryOfOrigin: product['Country of Origin'] || product['Country'] || '',
        };

        // Find category and subcategory by name
        const category = categories.find(c => c.name === product['Category']);
        const subCategory = subCategories.find(s => s.name === product['Subcategory'] || s.name === product['Sub Category']);
        
        if (category) {
          mappedProduct.productCategory = category._id;
        }
        if (subCategory) {
          mappedProduct.subCategory = subCategory._id;
        }
        
        // Remove empty subCategory (can't be empty string)
        if (!subCategory || mappedProduct.subCategory === '') {
          delete mappedProduct.subCategory;
        }

        // Validate required fields
        if (!mappedProduct.itemName || !mappedProduct.brandName || !mappedProduct.productCategory || !mappedProduct.yourPrice) {
          console.warn(`Skipping product: Missing required fields`, {
            itemName: mappedProduct.itemName,
            brandName: mappedProduct.brandName,
            productCategory: mappedProduct.productCategory,
            yourPrice: mappedProduct.yourPrice,
          });
          continue;
        }

        // Ensure itemTypeName is set (required field)
        if (!mappedProduct.itemTypeName) {
          mappedProduct.itemTypeName = mappedProduct.productType || 'General';
        }

        // Ensure mainImage is set (required field)
        if (!mappedProduct.mainImage) {
          mappedProduct.mainImage = 'https://via.placeholder.com/500x500?text=No+Image';
        }

        importedProducts.push(mappedProduct);
      }

      // Show confirmation dialog
      const confirmImport = confirm(
        `You are about to import ${importedProducts.length} products. This will create new products. Continue?`
      );

      if (confirmImport) {
        // Import products via API
        let successCount = 0;
        let failCount = 0;
        const errors: string[] = [];

        for (const product of importedProducts) {
          try {
            await createProduct(product);
            successCount++;
          } catch (error: any) {
            console.error('Error importing product:', error);
            failCount++;
            const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
            const productName = product.itemName || product.productId || 'Unknown product';
            errors.push(`${productName}: ${errorMessage}`);
          }
        }

        // Show import results
        let message = `Import completed!\n\nSuccessfully imported: ${successCount}\nFailed: ${failCount}`;
        if (errors.length > 0) {
          message += `\n\nErrors:\n${errors.slice(0, 10).join('\n')}`;
          if (errors.length > 10) {
            message += `\n... and ${errors.length - 10} more errors. Check console for details.`;
          }
        }
        alert(message);
        
        // Refresh product list
        loadData();
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error importing products:', error);
      alert(`Failed to import products: ${error.message || 'Please check the CSV format and try again.'}`);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const visibleColumns = Object.entries(columnVisibility).filter(([_, visible]) => visible).length;

  if (loading && products.length === 0) {
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
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          {selectedProducts.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Deleting...' : `Delete Selected (${selectedProducts.size})`}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          <Link href="/products/add">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products by name, brand, or product ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedStatus}
          onValueChange={(value) => {
            setSelectedStatus(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[180px]">
              <Columns className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={columnVisibility.image}
              onCheckedChange={(checked) =>
                setColumnVisibility({ ...columnVisibility, image: checked })
              }
            >
              Image
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.productName}
              onCheckedChange={(checked) =>
                setColumnVisibility({ ...columnVisibility, productName: checked })
              }
            >
              Product Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.brand}
              onCheckedChange={(checked) =>
                setColumnVisibility({ ...columnVisibility, brand: checked })
              }
            >
              Brand
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.sku}
              onCheckedChange={(checked) =>
                setColumnVisibility({ ...columnVisibility, sku: checked })
              }
            >
              SKU / Product ID
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.category}
              onCheckedChange={(checked) =>
                setColumnVisibility({ ...columnVisibility, category: checked })
              }
            >
              Category
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.subcategory}
              onCheckedChange={(checked) =>
                setColumnVisibility({ ...columnVisibility, subcategory: checked })
              }
            >
              Subcategory
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.price}
              onCheckedChange={(checked) =>
                setColumnVisibility({ ...columnVisibility, price: checked })
              }
            >
              Price
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.stock}
              onCheckedChange={(checked) =>
                setColumnVisibility({ ...columnVisibility, stock: checked })
              }
            >
              Stock
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.featured}
              onCheckedChange={(checked) =>
                setColumnVisibility({ ...columnVisibility, featured: checked })
              }
            >
              Featured
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.status}
              onCheckedChange={(checked) =>
                setColumnVisibility({ ...columnVisibility, status: checked })
              }
            >
              Status
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.actions}
              onCheckedChange={(checked) =>
                setColumnVisibility({ ...columnVisibility, actions: checked })
              }
            >
              Actions
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Items Per Page and Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {products.length} of {totalProducts} products
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(parseInt(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product List Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={products.length > 0 && selectedProducts.size === products.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </TableHead>
              {columnVisibility.image && <TableHead>Image</TableHead>}
              {columnVisibility.productName && <TableHead>Product</TableHead>}
              {columnVisibility.brand && <TableHead>Brand</TableHead>}
              {columnVisibility.sku && <TableHead>SKU</TableHead>}
              {columnVisibility.category && <TableHead>Category</TableHead>}
              {columnVisibility.subcategory && <TableHead>Subcategory</TableHead>}
              {columnVisibility.price && <TableHead>Price</TableHead>}
              {columnVisibility.stock && <TableHead>Stock</TableHead>}
              {columnVisibility.featured && <TableHead>Featured</TableHead>}
              {columnVisibility.status && <TableHead>Status</TableHead>}
              {columnVisibility.actions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns + 1} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm">Click "Add Product" to create your first product</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product._id} className={selectedProducts.has(product._id) ? 'bg-muted/50' : ''}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product._id)}
                      onChange={() => toggleProductSelection(product._id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                  {columnVisibility.image && (
                    <TableCell>
                      {product.mainImage && (
                        <img
                          src={product.mainImage}
                          alt={product.itemName}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                    </TableCell>
                  )}
                  {columnVisibility.productName && (
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.itemName}</div>
                        {!columnVisibility.brand && !columnVisibility.sku && (
                          <div className="text-sm text-muted-foreground">
                            {product.brandName} {product.productId ? `- ${product.productId}` : ''}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {columnVisibility.brand && (
                    <TableCell className="text-muted-foreground">{product.brandName || '—'}</TableCell>
                  )}
                  {columnVisibility.sku && (
                    <TableCell className="text-muted-foreground font-mono text-sm">{product.productId || '—'}</TableCell>
                  )}
                  {columnVisibility.category && (
                    <TableCell>
                      {typeof product.productCategory === 'object'
                        ? product.productCategory?.name
                        : '—'}
                    </TableCell>
                  )}
                  {columnVisibility.subcategory && (
                    <TableCell>
                      {typeof product.productSubCategory === 'object'
                        ? product.productSubCategory?.name
                        : '—'}
                    </TableCell>
                  )}
                  {columnVisibility.price && (
                    <TableCell>
                      {editingPriceId === product._id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(e.target.value)}
                            className="w-24 h-8"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSavePrice(product._id);
                              } else if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSavePrice(product._id)}
                            className="h-8"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="h-8"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium">{formatCurrency(product.yourPrice || 0)}</div>
                            {product.maxRetailPrice && product.yourPrice < product.maxRetailPrice && (
                              <div className="text-sm text-muted-foreground line-through">
                                {formatCurrency(product.maxRetailPrice)}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleEditPrice(product)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                  {columnVisibility.stock && (
                    <TableCell>{product.stockQuantity ?? '—'}</TableCell>
                  )}
                  {columnVisibility.featured && (
                    <TableCell>
                      {product.isFeatured ? (
                        <Badge variant="secondary">Yes</Badge>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                  )}
                  {columnVisibility.status && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={product.isActive ? 'default' : 'secondary'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(product._id, product.isActive)}
                          title={product.isActive ? 'Disable' : 'Enable'}
                          className="h-8 w-8"
                        >
                          <Power className={`h-4 w-4 ${product.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                  {columnVisibility.actions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/products/edit/${product._id}`)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(product._id)}
                          disabled={duplicatingId === product._id}
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product._id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
