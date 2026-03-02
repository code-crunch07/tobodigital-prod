'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { createLegalPage } from '@/lib/api';

export default function NewLegalPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) return;
    try {
      setSaving(true);
      await createLegalPage({ title, slug, content, isPublished });
      router.push('/content/legal');
    } catch (error) {
      console.error('Failed to create legal page', error);
      alert('Failed to create legal page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/content/legal')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Legal Page</h1>
          <p className="text-muted-foreground">Write and publish a new legal / policy page</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Details</CardTitle>
          <CardDescription>Fill out the fields below and save to publish or keep as hidden.</CardDescription>
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
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your legal page content..."
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
                {saving ? 'Saving...' : 'Create Page'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

