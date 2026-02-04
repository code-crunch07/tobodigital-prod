'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Lock, Key } from 'lucide-react';
import { changePassword as changePasswordApi } from '@/lib/api';

export default function SecurityAccessPage() {
  const router = useRouter();
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleChangePassword = async () => {
    setMessage(null);
    if (passwordForm.new !== passwordForm.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordForm.new.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    try {
      setLoading(true);
      await changePasswordApi(passwordForm.current, passwordForm.new);
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || err?.message || 'Failed to change password',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security & Access</h1>
          <p className="text-muted-foreground">Configure security settings and access controls</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password *</Label>
            <Input
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>New Password *</Label>
            <Input
              type="password"
              value={passwordForm.new}
              onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password *</Label>
            <Input
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
            />
          </div>
          {message && (
            <p className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {message.text}
            </p>
          )}
          <Button onClick={handleChangePassword} disabled={loading}>
            <Lock className="h-4 w-4 mr-2" />
            {loading ? 'Updating...' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
          <p className="text-sm text-amber-600 mt-1">Placeholder: 2FA not implemented. Connect an authenticator app to enable.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">2FA Status</p>
              <p className="text-sm text-muted-foreground">Currently disabled</p>
            </div>
            <Button variant="outline" disabled>Enable 2FA</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Security</CardTitle>
          <CardDescription>Configure API access and rate limiting</CardDescription>
          <p className="text-sm text-amber-600 mt-1">Placeholder: Configure in server/env. No API connected.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Rate Limit (requests per minute)</Label>
            <Input type="number" defaultValue="100" readOnly className="bg-muted" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="require-https" defaultChecked className="rounded" disabled />
            <Label htmlFor="require-https">Require HTTPS for API requests</Label>
          </div>
          <Button variant="outline" disabled>
            <Key className="h-4 w-4 mr-2" />
            Save API Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>Manage user sessions and timeout settings</CardDescription>
          <p className="text-sm text-amber-600 mt-1">Placeholder: Configure in server. No API connected.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Session Timeout (minutes)</Label>
            <Input type="number" defaultValue="60" readOnly className="bg-muted" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="single-session" className="rounded" disabled />
            <Label htmlFor="single-session">Allow only one active session per user</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
