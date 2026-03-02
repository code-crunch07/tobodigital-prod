'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { getArticles } from '@/lib/api';

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  author?: string;
  coverImage?: string;
  publishedAt?: string;
  createdAt?: string;
}

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticles({ limit: 24 })
      .then((res) => setArticles(res?.data ?? []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-[#ff006e] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog</h1>
        <p className="text-gray-600 mb-12">Latest articles and updates</p>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading posts...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-10">
            {articles.map((article) => (
              <article
                key={article._id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <Link href={`/blog/${article.slug}`} className="block">
                  {article.coverImage && (
                    <div className="aspect-video w-full overflow-hidden bg-gray-100">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 hover:text-[#ff006e] transition-colors mb-2">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {article.author && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {article.author}
                        </span>
                      )}
                      {(article.publishedAt || article.createdAt) && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(article.publishedAt || article.createdAt || '').toLocaleDateString(
                            'en-IN',
                            { year: 'numeric', month: 'long', day: 'numeric' }
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
