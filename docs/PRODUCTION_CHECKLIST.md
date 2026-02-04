# Production Checklist

Use this list before going live.

## APIs

- **Public (client):** All public routes are under `/api/public/*` (products, categories, subcategories, banners, navigations). Used by the storefront.
- **Auth:** `/api/auth/signup`, `/api/auth/login`, `/api/auth/me` (with Bearer token).
- **Orders:** 
  - `GET /api/orders` – With Bearer token returns **only that customer’s orders** (admins get all).
  - `GET /api/orders/:id` – Order details.
  - `POST /api/orders` – Create order (body: customer, items, shippingAddress, paymentMethod).
  - `POST /api/orders/create-razorpay-order` – Create Razorpay order (body: amount in paise, currency, receipt).
  - `POST /api/orders/verify-payment` – Verify Razorpay signature (body: razorpay_order_id, razorpay_payment_id, razorpay_signature).
- **Coupons:** `POST /api/coupons/validate` (body: code, amount).
- **Notifications:** `GET /api/notifications` (with auth; used by admin/dashboard).

## No Demo Data

- Mock coupon fallback removed: coupon validation uses only `/api/coupons/validate`.
- Mock Razorpay order removed: checkout calls `/api/orders/create-razorpay-order`; on failure it throws (no fake success).
- My Account and Orders use real APIs: `/api/auth/me`, `/api/orders`, `/api/orders/:id`. No mock user or mock orders.
- **Do not run** `npm run seed:demo` in production. That script is for local/demo only.

## Environment Variables (production)

- **Backend**
  - `MONGODB_URI` – Production MongoDB connection string.
  - `JWT_SECRET` – Strong secret for auth tokens.
  - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` – Required for checkout; without these, create-razorpay-order returns 503.
- **Client**
  - `NEXT_PUBLIC_API_URL` – Full backend API base (e.g. `https://api.yourdomain.com/api`).
  - `NEXT_PUBLIC_RAZORPAY_KEY_ID` – Razorpay key for the checkout script (no test key in production).

## Order creation (guest vs logged-in)

- `Order.customer` in the backend is an ObjectId ref to `User`. For guest checkout you must either create a User per guest or extend the Order model to support guest (e.g. embedded customer object). Current POST `/api/orders` expects `customer` to be a User ID when the schema is strict.

## Placeholder images

- Cart/checkout and order details use fallbacks like `item.mainImage || '/placeholder-product.jpg'` and `item.image || '/api/placeholder/150/150'` when the API doesn’t return an image. Ensure `/placeholder-product.jpg` exists in the client `public` folder if you use it; otherwise replace with your own placeholder or remove.
