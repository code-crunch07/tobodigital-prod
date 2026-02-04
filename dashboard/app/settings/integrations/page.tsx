'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Truck, Mail, CheckCircle } from 'lucide-react';
import { getIntegrations, updateIntegration } from '@/lib/api';

type IntegrationType = 'Payment' | 'Shipping' | 'Email';
type IntegrationStatus = 'connected' | 'disconnected';

interface IntegrationItem {
  id: string;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
}

const iconByType: Record<IntegrationType, typeof CreditCard> = {
  Payment: CreditCard,
  Shipping: Truck,
  Email: Mail,
};

export default function IntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    try {
      const res = await getIntegrations();
      if (res?.data) setIntegrations(res.data);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load integrations.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleIntegration = async (integration: IntegrationItem) => {
    const id = integration.id;
    setUpdatingId(id);
    setMessage(null);
    try {
      if (integration.status === 'connected') {
        await updateIntegration(id, { status: 'disconnected' });
        setIntegrations((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: 'disconnected' as const } : i))
        );
        setMessage({ type: 'success', text: `${integration.name} disconnected.` });
      } else {
        const apiKey = apiKeys[id]?.trim();
        await updateIntegration(id, { status: 'connected', apiKey: apiKey || undefined });
        setIntegrations((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: 'connected' as const } : i))
        );
        setApiKeys((prev) => ({ ...prev, [id]: '' }));
        setMessage({ type: 'success', text: `${integration.name} connected.` });
      }
    } catch (e: any) {
      setMessage({
        type: 'error',
        text: e?.response?.data?.message || 'Failed to update integration.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">Manage payment, shipping, and other integrations</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Integrations</CardDescription>
                <CardTitle className="text-3xl">{integrations.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Connected</CardDescription>
                <CardTitle className="text-3xl text-green-500">
                  {integrations.filter((i) => i.status === 'connected').length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Payment Gateways</CardDescription>
                <CardTitle className="text-3xl">
                  {integrations.filter((i) => i.type === 'Payment').length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Shipping Providers</CardDescription>
                <CardTitle className="text-3xl">
                  {integrations.filter((i) => i.type === 'Shipping').length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((integration) => {
              const Icon = iconByType[integration.type];
              const isUpdating = updatingId === integration.id;
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <CardTitle>{integration.name}</CardTitle>
                          <CardDescription>{integration.type}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={integration.status === 'connected' ? 'default' : 'secondary'}>
                        {integration.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {integration.status === 'connected' ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-500">
                          <CheckCircle className="h-4 w-4" />
                          <span>Connected successfully</span>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => toggleIntegration(integration)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Updating...' : 'Disconnect'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <Input
                          type="password"
                          placeholder="Enter API key"
                          value={apiKeys[integration.id] ?? ''}
                          onChange={(e) =>
                            setApiKeys((prev) => ({ ...prev, [integration.id]: e.target.value }))
                          }
                        />
                        <Button
                          className="w-full"
                          onClick={() => toggleIntegration(integration)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Connecting...' : 'Connect'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
