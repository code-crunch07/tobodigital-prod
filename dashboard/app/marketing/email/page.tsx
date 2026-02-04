'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Plus, Send, Eye } from 'lucide-react';

export default function EmailCampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([
    { id: '1', name: 'Welcome Email', status: 'sent', recipients: 1250, opens: 980, clicks: 320, date: '2024-01-15' },
    { id: '2', name: 'Weekly Newsletter', status: 'scheduled', recipients: 2000, opens: 0, clicks: 0, date: '2024-01-20' },
    { id: '3', name: 'Product Launch', status: 'draft', recipients: 0, opens: 0, clicks: 0, date: '-' },
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
            <h1 className="text-3xl font-bold tracking-tight">Email Campaigns</h1>
            <p className="text-muted-foreground">Create and manage email marketing campaigns</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Campaigns</CardDescription>
            <CardTitle className="text-3xl">{campaigns.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sent</CardDescription>
            <CardTitle className="text-3xl text-green-500">
              {campaigns.filter((c) => c.status === 'sent').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Recipients</CardDescription>
            <CardTitle className="text-3xl">
              {campaigns.reduce((sum, c) => sum + c.recipients, 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Open Rate</CardDescription>
            <CardTitle className="text-3xl">
              {campaigns.filter((c) => c.status === 'sent').length > 0
                ? `${(
                    (campaigns.filter((c) => c.status === 'sent').reduce((sum, c) => sum + c.opens, 0) /
                      campaigns.filter((c) => c.status === 'sent').reduce((sum, c) => sum + c.recipients, 0)) *
                    100
                  ).toFixed(1)}%`
                : '0%'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Campaigns</CardTitle>
          <CardDescription>Manage your email marketing campaigns</CardDescription>
          <p className="text-sm text-amber-600 mt-1">Placeholder: No email API connected. Connect an email provider to enable campaigns.</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Opens</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell>{campaign.recipients.toLocaleString()}</TableCell>
                  <TableCell>{campaign.opens.toLocaleString()}</TableCell>
                  <TableCell>{campaign.clicks.toLocaleString()}</TableCell>
                  <TableCell>{campaign.date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {campaign.status === 'draft' && (
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
