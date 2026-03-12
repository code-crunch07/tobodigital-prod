# Tobo Digital — Technology Stack

## Overview

Tobo Digital is a full-stack e-commerce platform made up of three separate applications that work together:

| App | Purpose | Port |
|---|---|---|
| **Backend API** | REST API server | `5000` |
| **Client (Storefront)** | Customer-facing online store | `3001` |
| **Dashboard (Admin)** | Merchant admin panel | `3000` |

---

## Backend

### Runtime & Framework
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | v20 | JavaScript runtime |
| **TypeScript** | ^5.5 | Type-safe development |
| **Express.js** | ^4.19 | HTTP server & REST API routing |
| **ts-node-dev** | ^2.0 | Live-reload TypeScript development server |

### Database
| Technology | Version | Purpose |
|---|---|---|
| **MongoDB** | (hosted) | NoSQL document database |
| **Mongoose** | ^8.7 | ODM — schema definitions, queries, validation |

### Authentication & Security
| Technology | Version | Purpose |
|---|---|---|
| **JSON Web Tokens (JWT)** | ^9.0 | Stateless user authentication |
| **bcrypt** | ^6.0 | Password hashing |
| **CORS** | ^2.8 | Cross-origin request handling |

### File Handling
| Technology | Version | Purpose |
|---|---|---|
| **Multer** | ^2.0 | Multipart file upload handling |

### Email
| Technology | Purpose |
|---|---|
| **Nodemailer** | Transactional email sending |
| **Brevo (Sendinblue) SMTP** | Email delivery provider for order confirmations, notifications |

### Third-Party Integrations
| Service | Purpose |
|---|---|
| **Razorpay** | Payment gateway — accepts UPI, cards, net banking |
| **Shiprocket** | Shipping & logistics — pincode check, shipping rates, order tracking, AWB |

### Utilities
| Technology | Purpose |
|---|---|
| **dotenv** | Environment variable management from `.env` files |
| **axios** | HTTP client for calling external APIs (Shiprocket, etc.) |
| **concurrently** | Run backend + client + dashboard simultaneously during development |

---

## Client (Storefront)

### Framework & Language
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 15.1.3 | React framework — SSR, file-based routing, image optimisation |
| **React** | ^19 | UI component library |
| **TypeScript** | ^5 | Type-safe development |

### Styling
| Technology | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | ^3.4 | Utility-first CSS framework |
| **PostCSS** | ^8.5 | CSS processing pipeline |
| **Autoprefixer** | ^10.4 | CSS vendor prefix automation |

### Fonts
| Font | Source | Used For |
|---|---|---|
| **Sen** | Google Fonts (via `next/font/google`) | Body text, navigation menus, buttons |
| **Space Grotesk** | Google Fonts (via `next/font/google`) | Headings & display text |

### UI Components & Icons
| Technology | Version | Purpose |
|---|---|---|
| **Lucide React** | ^0.468 | Icon library (cart, heart, eye, chevrons, etc.) |
| **Radix UI** | ^2.1 | Accessible dropdown menus, navigation menus |

### HTTP Client
| Technology | Version | Purpose |
|---|---|---|
| **axios** | ^1.7 | API calls to the backend |

### Key Features Built
- Product listing with grid/list view toggle and items-per-page selector
- Product detail page with image zoom, lightbox (Amazon-style, portal-based)
- Quick view modal on all product cards
- Add to cart, wishlist, pincode delivery check
- Order tracking via Shiprocket AWB
- Razorpay checkout flow
- Fully responsive — mobile, tablet, desktop

---

## Dashboard (Admin Panel)

### Framework & Language
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | ^16.1 | React framework |
| **React** | 19.2 | UI components |
| **TypeScript** | ^5 | Type-safe development |

### Styling
| Technology | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | ^4 | Utility-first CSS |
| **tw-animate-css** | ^1.4 | Animation utilities |
| **class-variance-authority** | ^0.7 | Dynamic class composition |
| **clsx / tailwind-merge** | ^2 / ^3 | Conditional class merging |

### UI Components & Icons
| Technology | Version | Purpose |
|---|---|---|
| **Radix UI** | various | Accessible dialog, dropdown, select, label, separator, avatar |
| **Lucide React** | ^0.552 | Icon library |

### Rich Text Editor
| Technology | Version | Purpose |
|---|---|---|
| **Tiptap** | ^3.15 | Rich text editor for product descriptions, articles |
| Extensions | — | Tables, images, colors, alignment, underline, character count |

### Charts & Analytics
| Technology | Version | Purpose |
|---|---|---|
| **Recharts** | ^3.3 | Sales charts and dashboard analytics graphs |

### HTTP Client
| Technology | Version | Purpose |
|---|---|---|
| **axios** | ^1.13 | API calls to the backend |

### Admin Features
- Product management (create, edit, delete, bulk operations)
- Category & sub-category management
- Order management with status updates
- Customer management
- Coupon & discount management
- Banner & promotional content management
- Sales reports & analytics
- Site settings management
- Article/blog management

---

## Infrastructure & Deployment

| Technology | Purpose |
|---|---|
| **Docker** | Containerisation of all three apps |
| **Docker Compose** | Multi-container orchestration (backend, client, dashboard) |
| **MongoDB Atlas / shared network** | Cloud-hosted database accessible via Docker network |
| **CloudPanel / VPS** | Hosting provider |
| **Nginx (via CloudPanel)** | Reverse proxy — routes `tobodigital.com` → client, `api.tobodigital.com` → backend |

### Domain Structure
| Domain | App |
|---|---|
| `tobodigital.com` | Customer storefront |
| `api.tobodigital.com` | Backend REST API |
| `tobodigital.com/admin` | Admin dashboard |

---

## Development Tools

| Tool | Purpose |
|---|---|
| **ESLint** | Code linting (backend + client + dashboard) |
| **TypeScript Compiler (`tsc`)** | Type checking and production build compilation |
| **ts-node-dev** | TypeScript hot-reload for backend development |
| **Git** | Version control |

---

## Architecture Summary

```
Browser
  │
  ├── tobodigital.com  →  Next.js Client (port 3001)
  │                         └── calls → Express API (port 5000)
  │                                         └── MongoDB
  │                                         └── Razorpay
  │                                         └── Shiprocket
  │                                         └── Brevo SMTP
  │
  └── tobodigital.com/admin  →  Next.js Dashboard (port 3000)
                                    └── calls → Express API (port 5000)
```

All three services are containerised with Docker and orchestrated via Docker Compose. In production they sit behind an Nginx reverse proxy managed by CloudPanel.
