<![CDATA[<div align="center">

# ⚡ EcomSystems
### Full-Stack MERN E-Commerce Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment-02042B?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com)

A production-ready, full-stack e-commerce platform with a React storefront, Express.js REST APIs, MongoDB Atlas database, Razorpay payment gateway, ImageKit media storage, and a dedicated Admin Dashboard — all deployable in one click on **Render**.

[🔗 Live Demo](#-deployment) · [📖 Docs](#-quick-start-local-development) · [🐛 Issues](https://github.com/Jeet-827/EcomSystems/issues)

</div>

---

## 📸 Screenshots

| Landing Page | Product Catalog | Admin Dashboard |
|---|---|---|
| Auto-rotating banner carousel with gradient 80s-retro aesthetics | Paginated grid with category filters & live search | Full product & order management panel |

---

## 🗂️ Repository Structure

```
EcomSystems/
├── Frontend/           # React 19 + Vite SPA (Customer Storefront)
│   ├── src/
│   │   ├── pages/      # Landing, Home, AllProducts, Cart, Checkout, Login, Register, Profile, etc.
│   │   ├── components/ # Navbar, Footer (shared)
│   │   ├── Admin/      # Admin Dashboard pages (Dashboard, Orders, Products, Customers, Settings)
│   │   ├── store/      # React Context (User, Cart state)
│   │   └── config/     # API base URL config (smart production fallback)
│   └── vite.config.js
│
├── Backend/            # Node.js + Express REST API (Port 5000)
│   ├── routes/         # Auth, Products, Cart, Orders, Search, Razorpay
│   ├── models/         # Mongoose schemas (User, Product, Cart, Order)
│   └── server.js
│
├── Admin/              # Express Admin API (Port 8000)
│   ├── routes/         # Admin auth, product management, order status, customers
│   └── server.js
│
├── render.yaml         # Render.com Blueprint (3-service auto-deploy)
├── vercel.json         # Vercel deployment config (Frontend only)
└── .gitignore
```

---

## ✨ Features

### 🛍️ Customer Storefront
- **Hero Banner Carousel** — Auto-rotating 360° product banners with dynamic color gradients and smooth slide animations
- **Product Catalog** — Server-side paginated grid with real-time category filtering and keyword search
- **Product Details** — Full product page with image gallery, description, pricing & add-to-cart
- **Smart Search** — Live dropdown search results with debounce and product thumbnails in the Navbar
- **Cart & Checkout** — Persistent cart with item quantity management and order summary
- **Payments** — Integrated **Razorpay** payment gateway (UPI, Cards, Netbanking, Wallets) + Cash on Delivery
- **Authentication** — JWT-based login/register with secure token storage and auto-refresh
- **User Profile** — Order history with status tracking, profile management
- **Responsive Design** — Mobile-first layout with a hamburger drawer, built entirely with **Tailwind CSS**

### 🛡️ Admin Dashboard
- **Product Management** — Add, edit, delete products with **ImageKit** cloud image upload
- **Order Management** — View all orders, update status (`pending → shipping → delivered`)
- **Customer Management** — Browse all registered users
- **Dashboard Stats** — Revenue overview, total orders, product count, user count
- **Settings** — Admin profile and system configuration
- **Secure Access** — Separate JWT-based admin authentication system

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9+
- **MongoDB Atlas** cluster (free tier works)
- **ImageKit** account (free tier for image uploads)
- **Razorpay** account (test mode)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Jeet-827/EcomSystems.git
cd EcomSystems
```

---

### 2. Configure Environment Variables

#### 📦 Backend — `Backend/.env`
```env
PORT=5000
MONGO_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ecom
SECRET_ONE=your_jwt_access_token_secret
SECRET_TWO=your_jwt_refresh_token_secret
ADMINKEY=your_admin_jwt_secret
publicKey=your_imagekit_public_key
privateKey=your_imagekit_private_key
urlEndpoint=https://ik.imagekit.io/your_imagekit_id
RAZOR_1=your_razorpay_key_id
RAZOR_2=your_razorpay_key_secret
```

#### 🔐 Admin — `Admin/.env`
```env
AdminPORT=8000
MONGO_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ecom
ADMINKEY=your_admin_jwt_secret
publicKey=your_imagekit_public_key
privateKey=your_imagekit_private_key
urlEndpoint=https://ik.imagekit.io/your_imagekit_id
```

#### 🌐 Frontend — `Frontend/.env`
```env
VITE_API_URL=http://localhost:5000
VITE_ADMIN_API_URL=http://localhost:8000
```

---

### 3. Install & Run

Open **3 separate terminals**:

```bash
# Terminal 1 — Backend API (Port 5000)
cd Backend
npm install
npm run dev
```

```bash
# Terminal 2 — Admin API (Port 8000)
cd Admin
npm install
npm start
```

```bash
# Terminal 3 — Frontend App (Port 5173)
cd Frontend
npm install
npm run dev
```

Visit **http://localhost:5173** to view the storefront.

---

## 🌐 Deployment

### Option A — Render (Recommended, Full-Stack)

This project includes a **`render.yaml` Blueprint** for one-click deployment of all 3 services on [Render.com](https://render.com).

1. Fork this repo to your GitHub account
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect your forked repository
4. Render auto-detects `render.yaml` and creates:
   - `ecom-backend` — Backend API (Node.js)
   - `ecom-admin` — Admin API (Node.js)
   - `ecom-frontend` — Frontend (Static Site, Vite build)
5. Add the required **environment variables** for each service in the Render dashboard

> The frontend automatically falls back to the Render service URLs if `VITE_API_URL` is not set.

---

### Option B — Vercel (Frontend Only)

1. Import `Jeet-827/EcomSystems` in [Vercel](https://vercel.com)
2. Vercel detects `vercel.json` and builds only the `Frontend/`
3. Set environment variables:
   - `VITE_API_URL` → your Backend API URL
   - `VITE_ADMIN_API_URL` → your Admin API URL

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, React Router v7 |
| **State** | React Context API |
| **Backend** | Node.js, Express.js, JWT, bcrypt |
| **Admin API** | Node.js, Express.js, JWT |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Payments** | Razorpay (UPI, Cards, COD) |
| **Media** | ImageKit (CDN image upload & delivery) |
| **Deployment** | Render (full-stack) / Vercel (frontend) |
| **Icons** | React Icons (Font Awesome) |
| **Notifications** | React Toastify |

---

## 📡 API Reference

### Backend (Port 5000)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/signup` | Register new user |
| `POST` | `/api/v1/signin` | Login user |
| `GET` | `/api/v1/product/productget` | Get all products (paginated) |
| `GET` | `/api/v1/product/categories` | Get categories with product preview |
| `GET` | `/api/v1/search/search?q=` | Live product search |
| `POST` | `/api/v1/cartdata/cartitem` | Add item to cart |
| `GET` | `/api/v1/cartdata/cartget` | Get user cart |
| `DELETE` | `/api/v1/cartdata/delete/:id` | Remove cart item |
| `POST` | `/api/v1/order/create` | Create order (COD) |
| `POST` | `/api/v1/order/razorpay` | Create Razorpay payment order |
| `GET` | `/api/v1/order/userorders` | Get user's orders |

### Admin (Port 8000)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/admin/login` | Admin login |
| `POST` | `/api/v1/adminproduct/add` | Add new product |
| `GET` | `/api/v1/adminproduct/get` | Get all products |
| `PUT` | `/api/v1/adminproduct/edit/:id` | Edit product |
| `DELETE` | `/api/v1/adminproduct/delete/:id` | Delete product |
| `GET` | `/api/v1/adminorder/allorders` | Get all customer orders |
| `PUT` | `/api/v1/adminorder/status/:id` | Update order status |
| `GET` | `/api/v1/admincustomer/all` | Get all customers |

---

## 📁 Environment Variables Summary

| Variable | Service | Description |
|---|---|---|
| `MONGO_URL` | Backend, Admin | MongoDB Atlas connection string |
| `SECRET_ONE` | Backend | JWT access token secret |
| `SECRET_TWO` | Backend | JWT refresh token secret |
| `ADMINKEY` | Backend, Admin | Admin JWT secret |
| `publicKey` | Backend, Admin | ImageKit public key |
| `privateKey` | Backend, Admin | ImageKit private key |
| `urlEndpoint` | Backend, Admin | ImageKit URL endpoint |
| `RAZOR_1` | Backend | Razorpay Key ID |
| `RAZOR_2` | Backend | Razorpay Key Secret |
| `VITE_API_URL` | Frontend | Backend API base URL |
| `VITE_ADMIN_API_URL` | Frontend | Admin API base URL |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Crafted with ❤️ by **[Jeet](https://github.com/Jeet-827)** & **[Kishor Hadiya](https://github.com/Kishorhadiya)**

⭐ Star this repo if you found it helpful!

</div>
]]>
