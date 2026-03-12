'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Clock, RefreshCw, ChevronDown } from 'lucide-react';
import api from '@/lib/api';

interface ReturnRequest {
  _id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  type: 'return' | 'replacement';
  reason: string;
  description?: string;
  items: Array<{ productName: string; quantity: number }>;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  adminNote?: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'completed'] as const;

const statusMeta: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  approved:  { label: 'Approved',  color: 'bg-green-100 text-green-800 border-green-200',   icon: CheckCircle },
  rejected:  { label: 'Rejected',  color: 'bg-red-100 text-red-700 border-red-200',         icon: XCircle },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800 border-blue-200',      icon: CheckCircle },
};

export default function ReturnsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/returns/admin/all', { params });
      setRequests(res.data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load return requests.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const updateStatus = async (id: string, status: string) => {
    setActionId(id);
    try {
      const res = await api.patch(`/returns/admin/${id}`, {
        status,
        adminNote: noteInputs[id] || undefined,
      });
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? res.data.data : r))
      );
      setExpandedId(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update request.');
    } finally {
      setActionId(null);
    }
  };

  const counts = {
    pending:   requests.filter((r) => r.status === 'pending').length,
    approved:  requests.filter((r) => r.status === 'approved').length,
    rejected:  requests.filter((r) => r.status === 'rejected').length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Returns & Replacements</h1>
            <p className="text-muted-foreground">Review and manage customer return / replacement requests</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchRequests} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['pending', 'approved', 'rejected', 'completed'] as const).map((s) => {
          const meta = statusMeta[s];
          const Icon = meta.icon;
          return (
            <Card
              key={s}
              className={`cursor-pointer transition-all border-2 ${filterStatus === s ? 'border-primary' : 'border-transparent'}`}
              onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            >
              <CardHeader className="pb-2">
                <CardDescription className="capitalize">{meta.label}</CardDescription>
                <CardTitle className="text-3xl">{counts[s]}</CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Filter bar */}
      {filterStatus && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtering by:</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold capitalize ${statusMeta[filterStatus]?.color}`}>
            {filterStatus}
          </span>
          <button onClick={() => setFilterStatus('')} className="text-xs text-muted-foreground underline">
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            All Requests
            <span className="text-sm font-normal text-muted-foreground ml-1">({requests.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <RotateCcw className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No return/replacement requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const meta = statusMeta[req.status] || statusMeta.pending;
                const Icon = meta.icon;
                const isExpanded = expandedId === req._id;
                return (
                  <div key={req._id} className="border rounded-lg overflow-hidden">
                    {/* Row */}
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : req._id)}
                    >
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${meta.color}`}>
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{req.orderNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${
                            req.type === 'replacement'
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-orange-50 border-orange-200 text-orange-700'
                          }`}>
                            {req.type}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {req.customerName} &middot; {req.reason}
                        </p>
                      </div>
                      <div className="hidden sm:block text-xs text-muted-foreground flex-shrink-0">
                        {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t bg-muted/20 p-4 space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold mb-1">Customer</p>
                            <p>{req.customerName}</p>
                            <p className="text-muted-foreground">{req.customerEmail}</p>
                          </div>
                          <div>
                            <p className="font-semibold mb-1">Items</p>
                            {req.items.map((item, i) => (
                              <p key={i}>{item.productName} × {item.quantity}</p>
                            ))}
                          </div>
                          {req.description && (
                            <div className="sm:col-span-2">
                              <p className="font-semibold mb-1">Customer Note</p>
                              <p className="text-muted-foreground">{req.description}</p>
                            </div>
                          )}
                          {req.adminNote && (
                            <div className="sm:col-span-2">
                              <p className="font-semibold mb-1">Your Previous Note</p>
                              <p className="text-muted-foreground">{req.adminNote}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions — only for pending */}
                        {req.status === 'pending' && (
                          <div className="space-y-3 pt-2 border-t">
                            <div>
                              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                Note to customer (optional)
                              </label>
                              <textarea
                                rows={2}
                                placeholder="e.g. Please ship the item back to our warehouse at…"
                                value={noteInputs[req._id] || ''}
                                onChange={(e) =>
                                  setNoteInputs((prev) => ({ ...prev, [req._id]: e.target.value }))
                                }
                                className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                              />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                onClick={() => updateStatus(req._id, 'approved')}
                                disabled={actionId === req._id}
                                className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateStatus(req._id, 'rejected')}
                                disabled={actionId === req._id}
                                className="gap-1.5"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Mark completed (for approved) */}
                        {req.status === 'approved' && (
                          <div className="pt-2 border-t flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              onClick={() => updateStatus(req._id, 'completed')}
                              disabled={actionId === req._id}
                              className="gap-1.5"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Mark as Completed
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
