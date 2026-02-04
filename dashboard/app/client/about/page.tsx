export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About Us</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground mb-6">
            Welcome to <span className="text-pink-500 font-semibold">tobo</span>
            <span className="text-blue-400 font-semibold">digital</span>, your trusted online shopping destination.
          </p>
          <p className="text-muted-foreground mb-4">
            We are committed to providing our customers with quality products at competitive prices.
            Our mission is to make online shopping convenient, enjoyable, and accessible to everyone.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">Our Story</h2>
          <p className="text-muted-foreground mb-4">
            Founded with a vision to revolutionize online shopping, tobo digital has grown from a small
            startup to a leading e-commerce platform. We pride ourselves on offering a wide range of
            products across various categories, all backed by excellent customer service.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">Our Values</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Customer satisfaction is our top priority</li>
            <li>Quality products at affordable prices</li>
            <li>Fast and reliable shipping</li>
            <li>Transparent and honest business practices</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
