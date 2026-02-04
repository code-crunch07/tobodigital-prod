'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Database, Download, Upload, Plus, Trash2 } from 'lucide-react';
import { getBackups, createBackup } from '@/lib/api';

type BackupItem = { id: string; name: string; size: string; date: string; type: string };

export default function BackupsPage() {
  const router = useRouter();
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getBackups();
        if (Array.isArray(res?.data)) setBackups(res.data);
        if (res?.message) setMessage({ type: 'info', text: res.message });
      } catch {
        setMessage({ type: 'error', text: 'Failed to load backups.' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    setMessage(null);
    try {
      await createBackup();
      setMessage({ type: 'success', text: 'Backup created.' });
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Backup creation failed.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Backups</h1>
            <p className="text-muted-foreground">Manage database and file backups</p>
            {message && (
              <p className={`text-sm mt-1 ${message.type === 'success' ? 'text-green-600' : message.type === 'error' ? 'text-red-600' : 'text-amber-600'}`}>
                {message.text}
              </p>
            )}
          </div>
        </div>
        <Button onClick={handleCreateBackup} disabled={creating}>
          <Plus className="h-4 w-4 mr-2" />
          {creating ? 'Creating...' : 'Create Backup'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Backups</CardDescription>
            <CardTitle className="text-3xl">{backups.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Size</CardDescription>
            <CardTitle className="text-3xl">–</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Last Backup</CardDescription>
            <CardTitle className="text-3xl text-sm">–</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>View and manage database backups</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Backup Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No backups. Connect a backup API to list and create backups.
                  </TableCell>
                </TableRow>
              ) : (
              backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">{backup.name}</TableCell>
                  <TableCell>{backup.type}</TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>{backup.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
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

      <Card>
        <CardHeader>
          <CardTitle>Restore Backup</CardTitle>
          <CardDescription>Upload and restore a backup file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">Select a backup file to restore</p>
            <input
              type="file"
              accept=".sql,.backup"
              className="hidden"
              id="restore-file"
            />
            <label htmlFor="restore-file">
              <div className="cursor-pointer inline-block">
                <Button variant="outline" type="button" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </label>
          </div>
          <Button variant="destructive" className="w-full">
            Restore Backup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
