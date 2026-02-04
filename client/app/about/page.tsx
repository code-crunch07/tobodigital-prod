'use client';

import { Package, Leaf, Shield, Users, TrendingUp, Heart, RefreshCw, Truck, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#ff006e] to-[#16b0ee] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Tobo Digital</h1>
          <p className="text-xl md:text-2xl opacity-90">
            Our business philosophy is simple: give consumers and businesses what they want, when they want it.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Philosophy */}
        <div className="mb-16">
          <p className="text-lg text-gray-700 leading-relaxed">
            Our business philosophy is simple: give consumers and businesses what they want, when they want it. 
            We never stop improving our world class operation by putting our customers – and their needs – first.
          </p>
        </div>

        {/* Product Section */}
        <div className="mb-16 bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-[#ff006e] bg-opacity-10 rounded-lg">
              <Package className="h-8 w-8 text-[#ff006e]" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product</h2>
              <p className="text-gray-700 leading-relaxed">
                Tobo digital is proud of its High Definition products and accessories because we have full control 
                over the Manufacturing of our Unique HDMI cables and accessories. We feel that the direct collaboration 
                with Manufacturers will bring us the benefits to make changes to our products in order to best suit 
                our customers' needs, as we take our customers requests and suggestions in consideration during the 
                production of our HDMI products.
              </p>
            </div>
          </div>
        </div>

        {/* Eco-friendly Section */}
        <div className="mb-16 bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Eco-friendly</h2>
              <p className="text-gray-700 leading-relaxed">
                As tobo digital is a mail order company we do use degradable bags to dispatch all our products 
                whenever possible. No one can know for certain how long it takes for polythene to break down. 
                Estimates of life range from 100 years to whenever the next ice age comes. Old polythene bags 
                and envelopes can be found.
              </p>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-16 bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Services</h2>
              <p className="text-gray-700 leading-relaxed">
                At tobo digital, our focus has always been to help customers saving time and money. Which is why 
                we've invested in building a website that allows them to securely manage their accounts without 
                intervention. It is the empowering, 24/7 self-service approach that ensures we keep our customers 
                satisfied, and our prices competitive.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">We are working towards</h2>
          <p className="text-lg text-gray-700 mb-12 text-center max-w-3xl mx-auto">
            In today's fast-paced global economy, change is constant and innovation is critical for a company's 
            survival. As we have done for the past 10 years, we are setting our sights on the future, anticipating 
            market needs and demands so we can steer our company towards long-term success.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Excellence */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-700">
                Quite simply, a company is its people. At tobo digital, we're dedicated to giving our people a 
                wealth of opportunities to reach their full potential.
              </p>
            </div>

            {/* Co-Prosperity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Co-Prosperity</h3>
              <p className="text-gray-700">
                A business cannot be successful unless it creates prosperity and opportunity for others. Tobo digital 
                is dedicated to being a socially and environmentally responsible corporate citizen in every community 
                where we operate around the globe.
              </p>
            </div>

            {/* Integrity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Integrity</h3>
              <p className="text-gray-700">
                Operating in an ethical way is the foundation of our business. Everything we do is guided by a 
                moral compass that ensures fairness, respect for all stakeholders and complete transparency.
              </p>
            </div>

            {/* Change */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="p-3 bg-orange-100 rounded-lg w-fit mb-4">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Change</h3>
              <p className="text-gray-700">
                In today's fast-paced global economy, change is constant and innovation is critical to a company's 
                survival. As we have done for the past 10 years, we set our sights on the future, anticipating market 
                needs and demands so we can steer our company towards long-term success.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Guarantees Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Safe and Secure */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Safe and Secure</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>PayPal is industry-leading fraud prevention measures keep your financial information private from sellers making PayPal one of the safest ways to pay online.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>McAfee SECURE trust mark only appears when our website has passed its intensive, daily security scan.</span>
              </li>
            </ul>
          </div>

          {/* Returns Procedure */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <RefreshCw className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Returns Procedure</h2>
            </div>
            <p className="text-gray-700">
              Please enclose a copy of the invoice, stating the reason for return and whether you require a 
              replacement or a refund.
            </p>
          </div>
        </div>

        {/* Guarantees Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* 100% Money Back Guarantee */}
          <div className="bg-gradient-to-br from-[#ff006e] to-[#16b0ee] rounded-lg shadow-lg p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <CheckCircle className="h-10 w-10" />
              <h2 className="text-2xl font-bold">100% Money Back Guarantee</h2>
            </div>
            <p className="text-white opacity-90 leading-relaxed">
              Our products come with a 30 days money back guarantee. In order to qualify for a refund simply 
              return the goods within the 30 days, enclosing a copy of the invoice or a letter giving your 
              purchasing details.
            </p>
          </div>

          {/* Free Shipping */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#ff006e] bg-opacity-10 rounded-lg">
                <Truck className="h-8 w-8 text-[#ff006e]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Free Shipping</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Every shipment is checked carefully and each item is packed as compact as possible, to ensure the 
              best protection of your order. Also, we pack using only top quality mailing materials and we send 
              our goods discreetly packaged.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Once we process and dispatch your order, you will receive an email to inform you about the status 
              of your purchase. Usually, our goods should arrive at the destination the next day after they've been 
              dispatched. However, please allow 5 working days (up to 7 working days for International Customers) 
              before contacting us, as it might take a while for the Post Office to deliver or to return the item 
              to us, in case there was an issue with your order (address, name etc.).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
