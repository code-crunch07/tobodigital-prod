import ClientHeader from '@/components/client/Header';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-muted/50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">
                <span className="text-pink-500">tobo</span>
                <span className="text-blue-400">digital</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Your trusted online shopping destination for quality products at great prices.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/client/about" className="hover:text-primary">About Us</a></li>
                <li><a href="/client/contact" className="hover:text-primary">Contact Us</a></li>
                <li><a href="/client/blog" className="hover:text-primary">Blog</a></li>
                <li><a href="/client/shop" className="hover:text-primary">Shop</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Shipping Info</a></li>
                <li><a href="#" className="hover:text-primary">Returns</a></li>
                <li><a href="#" className="hover:text-primary">FAQs</a></li>
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Facebook</a></li>
                <li><a href="#" className="hover:text-primary">Twitter</a></li>
                <li><a href="#" className="hover:text-primary">Instagram</a></li>
                <li><a href="#" className="hover:text-primary">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} tobo digital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
