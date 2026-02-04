'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bell, Plus, Send, Eye } from 'lucide-react';

export default function PushNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'New Product Launch', message: 'Check out our latest collection', status: 'sent', recipients: 5000, date: '2024-01-15' },
    { id: '2', title: 'Flash Sale Alert', message: '50% off on selected items', status: 'scheduled', recipients: 3000, date: '2024-01-20' },
    { id: '3', title: 'Order Update', message: 'Your order has been shipped', status: 'draft', recipients: 0, date: '-' },
  ]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      sent: 'default',
      scheduled: 'secondary',
      draft: 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Push Notifications</h1>
            <p className="text-muted-foreground">Send push notifications to app users</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Notification
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Notifications</CardDescription>
            <CardTitle className="text-3xl">{notifications.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sent</CardDescription>
            <CardTitle className="text-3xl text-green-500">
              {notifications.filter((n) => n.status === 'sent').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Recipients</CardDescription>
            <CardTitle className="text-3xl">
              {notifications.reduce((sum, n) => sum + n.recipients, 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Subscribers</CardDescription>
            <CardTitle className="text-3xl">8,500</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Manage push notification campaigns</CardDescription>
          <p className="text-sm text-amber-600 mt-1">Placeholder: Demo data. Connect a push service (e.g. FCM) to send real notifications.</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-medium">{notification.title}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {notification.message}
                  </TableCell>
                  <TableCell>{getStatusBadge(notification.status)}</TableCell>
                  <TableCell>{notification.recipients.toLocaleString()}</TableCell>
                  <TableCell>{notification.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {notification.status === 'draft' && (
                        <Button variant="ghost" size="icon">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
