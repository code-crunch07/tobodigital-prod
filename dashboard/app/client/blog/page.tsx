'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User } from 'lucide-react';

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: '10 Tips for Better Online Shopping',
      excerpt: 'Learn how to make the most out of your online shopping experience with these helpful tips.',
      author: 'Admin',
      date: 'January 15, 2024',
      image: 'https://via.placeholder.com/400x250',
    },
    {
      id: 2,
      title: 'New Product Launch Guide',
      excerpt: 'Everything you need to know about our latest product launches and how to stay updated.',
      author: 'Admin',
      date: 'January 10, 2024',
      image: 'https://via.placeholder.com/400x250',
    },
    {
      id: 3,
      title: 'Seasonal Shopping Trends 2024',
      excerpt: 'Discover the hottest trends for 2024 and what to look for in each season.',
      author: 'Admin',
      date: 'January 5, 2024',
      image: 'https://via.placeholder.com/400x250',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-muted-foreground">Stay updated with our latest news and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {post.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </div>
              </div>
              <Link href={`/client/blog/${post.id}`}>
                <Button variant="outline" className="w-full">
                  Read More
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
