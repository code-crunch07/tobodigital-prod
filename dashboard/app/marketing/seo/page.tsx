'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function SEOToolsPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [seoData, setSeoData] = useState<any>(null);

  const handleAnalyze = () => {
    // Placeholder: replace with real SEO API or crawler
    setSeoData({
      score: 85,
      issues: [
        { type: 'warning', message: 'Meta description is missing' },
        { type: 'error', message: 'Missing alt tags on 3 images' },
        { type: 'success', message: 'Page title is optimized' },
        { type: 'success', message: 'Heading structure is good' },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Tools</h1>
          <p className="text-muted-foreground">Analyze and optimize your website SEO</p>
        </div>
      </div>

      <p className="text-sm text-amber-600">Placeholder: SEO stats and analyzer use demo data. Integrate with an SEO API for production.</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>SEO Score</CardDescription>
            <CardTitle className="text-3xl">{seoData?.score || '--'}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pages Indexed</CardDescription>
            <CardTitle className="text-3xl">–</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Backlinks</CardDescription>
            <CardTitle className="text-3xl">–</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Domain Authority</CardDescription>
            <CardTitle className="text-3xl">–</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SEO Analyzer</CardTitle>
          <CardDescription>Analyze a URL for SEO optimization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="flex-1"
            />
            <Button onClick={handleAnalyze}>
              <Search className="h-4 w-4 mr-2" />
              Analyze
            </Button>
          </div>

          {seoData && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-lg font-semibold">SEO Score: {seoData.score}/100</span>
              </div>
              <div className="space-y-2">
                {seoData.issues.map((issue: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg border"
                  >
                    {issue.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                    {issue.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                    {issue.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                    <span className="flex-1">{issue.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Meta Tags Manager</CardTitle>
            <CardDescription>Manage global meta tags and SEO settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Site Title</Label>
              <Input placeholder="My Store" />
            </div>
            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Input placeholder="Best products online" />
            </div>
            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input placeholder="shopping, products, online" />
            </div>
            <Button className="w-full">Save Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sitemap</CardTitle>
            <CardDescription>Manage XML sitemap settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Sitemap URL</Label>
              <Input value="https://example.com/sitemap.xml" readOnly />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">Generate Sitemap</Button>
              <Button variant="outline" className="flex-1">Submit to Google</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
