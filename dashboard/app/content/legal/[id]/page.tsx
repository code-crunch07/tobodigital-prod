'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { getLegalPageById, updateLegalPage } from '@/lib/api';

export default function EditLegalPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getLegalPageById(id);
        const p = res.data;
        setTitle(p.title || '');
        setSlug(p.slug || '');
        setContent(p.content || '');
        setIsPublished(p.isPublished !== false);
      } catch (error) {
        console.error('Failed to load legal page', error);
        alert('Failed to load legal page.');
        router.push('/content/legal');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) return;
    try {
      setSaving(true);
      await updateLegalPage(id, { title, slug, content, isPublished });
      router.push('/content/legal');
    } catch (error) {
      console.error('Failed to update legal page', error);
      alert('Failed to update legal page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/content/legal')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Legal Page</h1>
          <p className="text-muted-foreground">Update content for your legal / policy page</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Details</CardTitle>
          <CardDescription>Edit the legal copy below and save your changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="terms-of-service"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[240px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <select
                value={isPublished ? 'published' : 'hidden'}
                onChange={(e) => setIsPublished(e.target.value === 'published')}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="published">Published (visible)</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push('/content/legal')}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

