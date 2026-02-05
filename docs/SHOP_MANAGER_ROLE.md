# Shop Manager role and access

The app supports three roles: **admin**, **shop_manager**, and **customer**.

## Role summary

| Role          | Dashboard access | Products, orders, categories, etc. | Settings, reports, user management |
|---------------|------------------|-------------------------------------|-------------------------------------|
| **admin**     | Full             | Full                                | Full                                 |
| **shop_manager** | Full          | Full                                | No (menu hidden, API returns 403)   |
| **customer**  | No (storefront only) | Own orders only via API         | No                                   |

## Shop manager can

- Log in to the dashboard (admin.tobodigital.com).
- Manage **products** (create, edit, delete, duplicate).
- Manage **orders** (view all, update status, cancel).
- Manage **categories** and **subcategories**.
- Manage **customers** (view, edit).
- Manage **banners** and **marketing**.
- Manage **navigation** (menu).
- **Upload** images (products, banners, etc.).
- View **dashboard stats** and **analytics**.
- Manage **coupons** and **notifications**.

## Shop manager cannot

- Access **Settings** (site settings, logo, integrations, backups, admin users). The Settings and Reports sections are hidden in the sidebar and the API returns 403.
- Access **Reports** (sales, stock, orders, customers reports).
- Create or edit **admin** or **shop_manager** users (only admins can).

## How to add a shop manager

1. Log in to the dashboard as **admin**.
2. Go to **Settings → Admin Users / Roles**.
3. Click **Create Admin** (or “Add user”).
4. Enter name, email, and password; set **Role** to **Shop Manager**.
5. Save. The user can log in with that email/password and will have shop manager access.

Alternatively, create a user with role “Customer” and then **edit** the user and change **Role** to **Shop Manager**.

## Backend details

- **User model** (`src/models/User.ts`): `role` enum is `['admin', 'shop_manager', 'customer']`.
- **Auth** (`src/controllers/auth.ts`):
  - `requireAdmin`: only `admin` (used for `/api/settings`, `/api/reports`, `/api/auth/users`).
  - `requireAdminOrShopManager`: `admin` or `shop_manager` (used for products, orders, categories, customers, banners, navigation, upload, coupons, dashboard, notifications).
- **Orders**: customers see only their own orders; admin and shop_manager see all orders and can update/delete.

## Dashboard UI

- **Sidebar**: Settings and Reports sections are shown only when the logged-in user’s role is **admin** (read from `localStorage.user.role`).
- **Admin Users / Roles** page: role dropdown includes **Admin**, **Shop Manager**, and **Customer**; table shows role with a badge (Admin = blue, Shop Manager = amber, Customer = gray).
