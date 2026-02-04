'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Plus, Gift } from 'lucide-react';

export default function LoyaltyPage() {
  const router = useRouter();
  const [members, setMembers] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com', points: 1250, tier: 'Gold', orders: 15 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', points: 850, tier: 'Silver', orders: 8 },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', points: 320, tier: 'Bronze', orders: 3 },
  ]);
  const [showForm, setShowForm] = useState(false);

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      Gold: 'bg-yellow-500',
      Silver: 'bg-gray-400',
      Bronze: 'bg-orange-600',
    };
    return <Badge className={colors[tier]}>{tier}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loyalty & Rewards</h1>
            <p className="text-muted-foreground">Manage customer loyalty program and rewards</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reward
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Members</CardDescription>
            <CardTitle className="text-3xl">{members.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Points Issued</CardDescription>
            <CardTitle className="text-3xl">
              {members.reduce((sum, m) => sum + m.points, 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gold Members</CardDescription>
            <CardTitle className="text-3xl text-yellow-500">
              {members.filter((m) => m.tier === 'Gold').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Rewards</CardDescription>
            <CardTitle className="text-3xl">3</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Reward</CardTitle>
            <CardDescription>Add a new reward to the loyalty program</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reward Name</Label>
                <Input placeholder="Free Shipping" />
              </div>
              <div className="space-y-2">
                <Label>Points Required</Label>
                <Input type="number" placeholder="100" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Reward description" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button>Create Reward</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Loyalty Members</CardTitle>
          <CardDescription>Customer loyalty program members and their points</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      {member.points.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>{getTierBadge(member.tier)}</TableCell>
                  <TableCell>{member.orders}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
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
