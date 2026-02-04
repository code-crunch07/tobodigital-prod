'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Download, FileSpreadsheet } from 'lucide-react';

export default function ImportExportPage() {
  const router = useRouter();
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleImport = () => {
    if (importFile) {
      // In a real app, this would process the file
      alert(`Importing ${importFile.name}...`);
    }
  };

  const handleExport = () => {
    // In a real app, this would generate and download CSV/Excel
    alert('Exporting inventory data...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import / Export Inventory</h1>
          <p className="text-muted-foreground">Import or export inventory data via CSV or Excel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Import Inventory</CardTitle>
            <CardDescription>Upload a CSV or Excel file to import inventory data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Select a CSV or Excel file to import
              </p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file">
                <div className="cursor-pointer inline-block">
                  <Button variant="outline" type="button" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </label>
              {importFile && (
                <p className="mt-2 text-sm font-medium">{importFile.name}</p>
              )}
            </div>
            <Button onClick={handleImport} disabled={!importFile} className="w-full">
              Import Inventory
            </Button>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• File format: CSV or Excel (.xlsx, .xls)</p>
              <p>• Required columns: Product ID, Stock Quantity</p>
              <p>• Download template for reference</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Inventory</CardTitle>
            <CardDescription>Export current inventory data to CSV or Excel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Export all inventory data
              </p>
            </div>
            <Button onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
            <Button onClick={handleExport} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Includes all product inventory data</p>
              <p>• Product ID, Name, Current Stock, Status</p>
              <p>• Suitable for backup and analysis</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>Recent import operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No import history available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
