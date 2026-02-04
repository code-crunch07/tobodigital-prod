'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Book, Code, Globe } from 'lucide-react';

const apiEndpoints = [
  {
    method: 'GET',
    path: '/api/products',
    description: 'Get list of all products',
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/products',
    description: 'Create a new product',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/products/:id',
    description: 'Get product by ID',
    auth: false,
  },
  {
    method: 'PUT',
    path: '/api/products/:id',
    description: 'Update product',
    auth: true,
  },
  {
    method: 'DELETE',
    path: '/api/products/:id',
    description: 'Delete product',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/orders',
    description: 'Get list of orders',
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/orders',
    description: 'Create a new order',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/customers',
    description: 'Get list of customers',
    auth: true,
  },
];

const getMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: 'bg-blue-500',
    POST: 'bg-green-500',
    PUT: 'bg-yellow-500',
    DELETE: 'bg-red-500',
  };
  return colors[method] || 'bg-gray-500';
};

export default function APIDocsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
          <p className="text-muted-foreground">API documentation and endpoint reference</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Learn how to use the API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Base URL</h3>
            <code className="block bg-muted p-2 rounded">https://api.tobo.com/v1</code>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Authentication</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Most endpoints require authentication. Include your API key in the request headers:
            </p>
            <code className="block bg-muted p-2 rounded text-sm">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Rate Limits</h3>
            <p className="text-sm text-muted-foreground">
              API requests are limited to 100 requests per minute per API key.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>Available API endpoints and methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold text-white ${getMethodColor(endpoint.method)}`}
                  >
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {endpoint.path}
                  </code>
                  {endpoint.auth && (
                    <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
                      Auth Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{endpoint.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Example Request</CardTitle>
          <CardDescription>Sample API request using cURL</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            {`curl -X GET https://api.tobo.com/v1/products \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response Format</CardTitle>
          <CardDescription>Standard API response structure</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            {`{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message"
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
