'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { getArticleById, updateArticle, getUploadUrl, uploadImage, uploadImages } from '@/lib/api';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [author, setAuthor] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [coverImage, setCoverImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlsInput, setImageUrlsInput] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleFeaturedImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingFeatured(true);
      const url = await uploadImage(file);
      setCoverImage(url);
    } catch (error) {
      console.error('Failed to upload featured image', error);
      alert('Failed to upload featured image. Please try again.');
    } finally {
      setUploadingFeatured(false);
      e.target.value = '';
    }
  };

  const handleBlogImagesFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    try {
      setUploadingImages(true);
      const urls = await uploadImages(files);
      setImages((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error('Failed to upload blog images', error);
      alert('Failed to upload blog images. Please try again.');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const value = imageUrlsInput.trim();
    if (!value) return;
    setImages((prev) => [...prev, value]);
    setImageUrlsInput('');
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getArticleById(id);
        const a = res.data;
        setTitle(a.title || '');
        setSlug(a.slug || '');
        setAuthor(a.author || '');
        setExcerpt(a.excerpt || '');
        setContent(a.content || '');
        setStatus(a.status || 'draft');
        setCoverImage(a.coverImage || '');
        setImages(a.images || []);
        setCategory(a.category || '');
        setTagsInput((a.tags || []).join(', '));
        setMetaTitle(a.metaTitle || '');
        setMetaDescription(a.metaDescription || '');
      } catch (error) {
        console.error('Failed to load article', error);
        alert('Failed to load article.');
        router.push('/content/blog');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !author || !content) return;
    try {
      setSaving(true);
      const tags =
        tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean) || [];
      await updateArticle(id, {
        title,
        slug,
        author,
        excerpt,
        content,
        status,
        coverImage,
        images,
        category,
        tags,
        metaTitle,
        metaDescription,
      });
      router.push('/content/blog');
    } catch (error) {
      console.error('Failed to update article', error);
      alert('Failed to update article. Please try again.');
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
        <Button variant="ghost" size="icon" onClick={() => router.push('/content/blog')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Article</h1>
          <p className="text-muted-foreground">Update blog post content</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
          <CardDescription>Edit the fields below and save your changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-awesome-article"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Author *</Label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Input
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short summary for listings and SEO"
              />
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your blog post content..."
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Real Estate, Tips, News"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g., property, investment, mumbai (comma separated)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SEO Settings – Meta Title</Label>
                  <Input
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="SEO title (leave empty to use blog title)"
                  />
                  <p className="text-xs text-muted-foreground">Recommended: 50-60 characters</p>
                </div>
                <div className="space-y-2">
                  <Label>SEO Settings – Meta Description</Label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full min-h-[80px] px-3 py-2 border rounded-md resize-y text-sm"
                    placeholder="SEO description (leave empty to use excerpt)"
                  />
                  <p className="text-xs text-muted-foreground">Recommended: 150-160 characters</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Featured Image</Label>
                  <p className="text-xs text-muted-foreground">
                    Upload a featured image (Max 5MB), select from media library, or enter an image URL.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageFileChange}
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => alert('Media library coming soon')}
                    >
                      Media Library
                    </Button>
                  </div>
                  <Input
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="Or paste image URL"
                  />
                  {uploadingFeatured && (
                    <p className="text-xs text-muted-foreground">Uploading featured image...</p>
                  )}
                  {coverImage && (
                    <div className="mt-2">
                      <img
                        src={getUploadUrl(coverImage)}
                        alt="Featured preview"
                        className="h-32 w-auto rounded-md border object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Blog Images</Label>
                  <p className="text-xs text-muted-foreground">
                    Upload images (Max 10 images, 5MB each), or enter image URLs (press Enter to add each URL).
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBlogImagesFileChange}
                    className="text-sm"
                  />
                  {uploadingImages && (
                    <p className="text-xs text-muted-foreground">Uploading blog images...</p>
                  )}
                  <Input
                    value={imageUrlsInput}
                    onChange={(e) => setImageUrlsInput(e.target.value)}
                    onKeyDown={handleAddImageUrl}
                    placeholder="Paste image URL and press Enter"
                  />
                  {images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          className="border rounded-md p-1 text-[11px] bg-muted max-w-[180px] truncate"
                        >
                          {img}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push('/content/blog')}>
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

