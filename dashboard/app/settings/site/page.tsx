'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, X } from 'lucide-react';
import { getSiteSettings, updateSiteSettings, uploadImage, getUploadUrl } from '@/lib/api';

const defaultSettings = {
  siteName: 'Tobo Admin',
  siteUrl: 'https://tobo.com',
  email: 'info@tobo.com',
  phone: '+91 1234567890',
  address: '123 Main St, City, State 12345',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  logo: '',
  favicon: '',
  defaultShippingCharge: 50,
  announcements: [] as string[],
};

export default function SiteSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSiteSettings();
        if (res?.data) {
          const loaded = { ...defaultSettings, ...res.data };
          setSettings(loaded);
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load site settings.' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Logo file size must be less than 2MB.' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file.' });
      return;
    }

    try {
      setUploadingLogo(true);
      const url = await uploadImage(file);
      setSettings({ ...settings, logo: url });
      setMessage({ type: 'success', text: 'Logo uploaded successfully.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to upload logo.' });
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Favicon file size must be less than 1MB.' });
      return;
    }

    const allowedTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please upload an ICO, PNG, or SVG file for favicon.' });
      return;
    }

    try {
      setUploadingFavicon(true);
      const url = await uploadImage(file);
      setSettings({ ...settings, favicon: url });
      setMessage({ type: 'success', text: 'Favicon uploaded successfully.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to upload favicon.' });
    } finally {
      setUploadingFavicon(false);
      if (faviconInputRef.current) faviconInputRef.current.value = '';
    }
  };

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
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Logo</Label>
            {settings.logo && (
              <div className="mb-3 flex items-center gap-4">
                <img
                  src={getUploadUrl(settings.logo)}
                  alt="Site Logo"
                  className="h-16 w-auto object-contain border border-gray-200 rounded p-2 bg-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSettings({ ...settings, logo: '' });
                    if (logoInputRef.current) logoInputRef.current.value = '';
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="flex-1"
              />
              {uploadingLogo && <span className="text-sm text-gray-500">Uploading...</span>}
            </div>
            <p className="text-xs text-muted-foreground">Upload site logo (PNG, JPG, WebP, max 2MB)</p>
          </div>

          {/* Favicon Upload */}
          <div className="space-y-2">
            <Label>Favicon</Label>
            {settings.favicon && (
              <div className="mb-3 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img
                    src={getUploadUrl(settings.favicon)}
                    alt="Favicon"
                    className="h-8 w-8 object-contain border border-gray-200 rounded p-1 bg-white"
                  />
                  <span className="text-sm text-gray-600">Current favicon</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSettings({ ...settings, favicon: '' });
                    if (faviconInputRef.current) faviconInputRef.current.value = '';
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                ref={faviconInputRef}
                type="file"
                accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml"
                onChange={handleFaviconUpload}
                disabled={uploadingFavicon}
                className="flex-1"
              />
              {uploadingFavicon && <span className="text-sm text-gray-500">Uploading...</span>}
            </div>
            <p className="text-xs text-muted-foreground">Upload favicon (ICO, PNG, SVG, max 1MB)</p>
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
          <CardDescription>Currency, timezone, and shipping configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Shipping Charge (₹) *</Label>
              <Input
                type="number"
                min={0}
                step={1}
                value={settings.defaultShippingCharge ?? 50}
                onChange={(e) => setSettings({ ...settings, defaultShippingCharge: Math.max(0, Number(e.target.value) || 0) })}
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground">Applied at checkout when cart does not qualify for free shipping</p>
            </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Announcement Bar</CardTitle>
          <CardDescription>Add short messages to show in the top announcement strip on the storefront.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.announcements.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No announcements yet. Click &quot;Add announcement&quot; to create your first message.
            </p>
          )}
          <div className="space-y-3">
            {settings.announcements.map((msg, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={msg}
                  placeholder="e.g. 🔥 Flat ₹199 delivery charges"
                  onChange={(e) => {
                    const next = [...settings.announcements];
                    next[index] = e.target.value;
                    setSettings({ ...settings, announcements: next });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const next = settings.announcements.filter((_, i) => i !== index);
                    setSettings({ ...settings, announcements: next });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setSettings({
                ...settings,
                announcements: [...settings.announcements, ''],
              })
            }
          >
            Add announcement
          </Button>
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
