'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { getSiteSettings, updateSiteSettings } from '@/lib/api';

const defaultSettings = {
  siteName: 'Tobo Admin',
  siteUrl: 'https://tobo.com',
  email: 'info@tobo.com',
  phone: '+91 1234567890',
  address: '123 Main St, City, State 12345',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
};

export default function SiteSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSiteSettings();
        if (res?.data) setSettings({ ...defaultSettings, ...res.data });
      } catch {
        setMessage({ type: 'error', text: 'Failed to load site settings.' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateSiteSettings(settings);
      setMessage({ type: 'success', text: 'Settings saved successfully.' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.response?.data?.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
          <p className="text-muted-foreground">Configure site settings, logo, and contact information</p>
          {message && (
            <p className={`text-sm mt-1 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
      <>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Basic site configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Site Name *</Label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Site URL *</Label>
              <Input
                value={settings.siteUrl}
                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Logo</Label>
            <Input type="file" accept="image/*" />
            <p className="text-xs text-muted-foreground">Upload site logo (PNG, JPG, max 2MB)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Business contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regional Settings</CardTitle>
          <CardDescription>Currency and timezone configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Currency *</Label>
              <select
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                style={{
                  '--tw-ring-color': 'rgb(237, 130, 79)'
                } as React.CSSProperties}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                onBlur={(e) => e.currentTarget.style.borderColor = ''}
              >
                <option value="INR">INR - Indian Rupee (₹)</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
                <option value="AED">AED - UAE Dirham</option>
                <option value="SGD">SGD - Singapore Dollar</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Timezone *</Label>
              <select
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent"
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                style={{
                  '--tw-ring-color': 'rgb(237, 130, 79)'
                } as React.CSSProperties}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgb(237, 130, 79)'}
                onBlur={(e) => e.currentTarget.style.borderColor = ''}
              >
                <option value="Asia/Kolkata">Asia/Kolkata (India Standard Time)</option>
                <option value="Asia/Dubai">Asia/Dubai (Gulf Standard Time)</option>
                <option value="Asia/Singapore">Asia/Singapore (Singapore Time)</option>
                <option value="America/New_York">America/New_York (Eastern Time)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (Pacific Time)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (Japan Standard Time)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving}
          style={{
            backgroundColor: 'rgb(237, 130, 79)',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            if (!saving) e.currentTarget.style.backgroundColor = 'rgb(220, 110, 60)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgb(237, 130, 79)';
          }}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
      </>
      )}
    </div>
  );
}
