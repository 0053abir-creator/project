# Campus Lost & Found — Islamic University, Kushtia, Bangladesh

> Version 1.0 · Developed for the Department of Computer Science & Engineering, Islamic University, Kushtia, Bangladesh.  
> Official University Portal: [https://www.iu.ac.bd/](https://www.iu.ac.bd/)

A web platform where students and faculty of **Islamic University, Kushtia, Bangladesh** report lost items, post found items, and claim belongings with verifiable proof of ownership. The platform is designed with the iconic **Islamic University Green (`#006A4E`)** color scheme matching the official university logo.

---

## 1. Features & Capabilities

- **Visitor Experience**:
  - Explore campus listings with keyword search and filtering.
  - Browse categorized found and lost items with masked privacy details.
  - Transparent 3-step item lifecycle visualization.

- **Student Features**:
  - Register with university email, Student ID, and academic department.
  - Report lost or found items with location, date occurred, category, and safekeeping notes.
  - Manage own reported items (edit or delete while status is `open`).
  - Submit ownership claims describing unique identifying marks.
  - Track submitted claims in real-time (`Under Review`, `Approved`, `Rejected`).
  - Clear collection instructions upon admin approval.

- **Admin Features (Lost & Found Desk)**:
  - Unified login with automatic role detection (`admin`).
  - **Pending Claims Queue**: Inspect claimant identity, student ID, and proof descriptions.
  - **Approve or Reject**: Add official verification notes visible to the student.
  - **Record Handover & Return**: Record recipient name, handover officer, and verification notes; marks item as `returned`.
  - **Item Management**: Browse, edit, or close expired/invalid reports across campus.
  - **Category Management**: Create and track categories.
  - **Analytics & Reports**: Visual status breakdowns, weekly activity trends, and complete audit trail.

---

## 2. Item Lifecycle & State Flow

```
   ┌──────────┐
   │   open   ├────────────────────────┐
   └────┬─────┘                        │
        │ Student submits claim        │ Admin closes expired/invalid
        ▼                              ▼
┌───────────────┐              ┌──────────────┐
│ claim_pending │              │    closed    │
└───┬───────┬───┘              └──────────────┘
    │       │
    │       └──────────┐ Admin rejects claim
    │                  ▼
    │             ┌─────────┐
    │             │  open   │
    │             └─────────┘
    │ Admin approves claim & records handover
    ▼
┌───────────┐
│ returned  │ (Reunited with owner; locked)
└───────────┘
```

---

## 3. Technology Stack & Architecture

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, JavaScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with responsive, mobile-first design
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Node.js official driver `mongodb`)
  - Shared connection pooling in `src/lib/mongodb.js`
  - Automatic index creation
  - Built-in resilient fallback for offline testing/evaluation
- **Authentication**: Persistent session management with bcrypt-hashed credentials and role-based access control (RBAC).

### Directory Structure
```
lost-found project/
├── config.json                 # Non-secret settings, categories, locations, validation limits
├── .env.local                  # Environment secrets (MONGODB_URI, BETTER_AUTH_SECRET)
├── package.json                # Dependencies and npm scripts
├── scripts/
│   ├── seed.mjs                # Database seeder (Admin, Students, Sample Items, Claims, Returns)
│   └── e2e-http.mjs            # 24-step automated HTTP integration test suite
├── src/
│   ├── app/
│   │   ├── layout.jsx          # Root layout with AuthProvider, Navbar, and Footer
│   │   ├── page.jsx            # Home page with hero, search, stats, recent items
│   │   ├── globals.css         # Global Tailwind styles
│   │   ├── items/
│   │   │   ├── page.jsx        # Browse & filter items with search and pagination
│   │   │   ├── new/page.jsx    # Report new item (Protected)
│   │   │   └── [id]/
│   │   │       ├── page.jsx    # Item details with claim and handover actions
│   │   │       └── edit/page.jsx# Edit item report (Owner/Admin)
│   │   ├── student/page.jsx    # Student Dashboard (My reports, My claims)
│   │   ├── admin/page.jsx      # Admin Dashboard (Claims queue, Returns log, Analytics)
│   │   ├── login/page.jsx      # Sign in with quick demo credentials
│   │   ├── register/page.jsx   # Student registration form
│   │   └── api/                # REST API route handlers
│   │       ├── auth/           # /api/auth/login, /register, /logout, /me
│   │       ├── items/          # /api/items (CRUD & filters)
│   │       ├── claims/         # /api/claims (Submit, list, review)
│   │       ├── returns/        # /api/returns (Record handover & audit log)
│   │       ├── categories/     # /api/categories (List & create)
│   │       ├── reports/        # /api/reports (Dashboard numbers & metrics)
│   │       └── seed/           # /api/seed (Reseed database)
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation header with role-aware tabs
│   │   ├── Footer.jsx          # University CSE footer with desk hours
│   │   ├── AuthProvider.jsx    # React Context for user state and auth helpers
│   │   ├── ItemCard.jsx        # Responsive item card with badges and excerpt
│   │   ├── ItemForm.jsx        # Shared report creation and edit form
│   │   ├── StatusBadge.jsx     # Reusable status badges
│   │   ├── ClaimModal.jsx      # Ownership claim submission modal
│   │   └── HandoverModal.jsx   # Admin handover recording modal
│   └── lib/
│       ├── mongodb.js          # Shared MongoDB client & fallback adapter
│       ├── auth.js             # Authentication & session helpers
│       ├── config.js           # Configuration loader
│       ├── helpers.js          # Server validation and response utilities
│       └── formatters.js       # Client-safe formatting utilities
```

---

## 4. API Specification

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/items` | Public | List and filter items (search, category, status, type, location, pagination) |
| `POST` | `/api/items` | Student / Admin | Create a new lost or found report |
| `GET` | `/api/items/[id]` | Public | Fetch item details (masks sensitive contact info for non-owners) |
| `PUT` | `/api/items/[id]` | Owner / Admin | Update item report (owner can edit while `open`) |
| `DELETE` | `/api/items/[id]` | Owner / Admin | Delete item report (owner can delete while `open`) |
| `GET` | `/api/claims` | Student / Admin | Student gets their claims; Admin gets all claims |
| `POST` | `/api/claims` | Student | Submit ownership claim on an `open` item |
| `PUT` | `/api/claims/[id]` | Admin | Approve or reject claim with verification note |
| `GET` | `/api/returns` | Admin | Returns audit log |
| `POST` | `/api/returns` | Admin | Record physical handover & mark item `returned` |
| `GET` | `/api/categories` | Public | List all categories |
| `POST` | `/api/categories` | Admin | Add a new category |
| `GET` | `/api/reports` | Admin | Analytics, weekly trends, queue counts, metrics |
| `POST` | `/api/auth/register` | Public | Register student account |
| `POST` | `/api/auth/login` | Public | Authenticate student or admin |
| `POST` | `/api/auth/logout` | Authenticated | Terminate session |
| `GET` | `/api/auth/me` | Public | Get currently logged-in user profile |
| `POST` | `/api/seed` | Public | Reset database with sample campus data |

---

## 5. Demo Credentials

For quick evaluation and testing:

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@iu.ac.bd` | `Admin@123` | Desk Admin Officer, CSE Department |
| **Student** | `student@iu.ac.bd` | `Student@123` | Tanvir Hasan (2021-CSE-045) |

*(The `/login` page also includes one-click buttons to auto-fill these demo credentials).*

---

## 6. Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Seed initial campus categories, demo accounts, and sample items
npm run seed

# 3. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Running Automated Integration Tests
```bash
# Runs full 24-step HTTP integration test suite
node scripts/e2e-http.mjs
```

### Production Build
```bash
npm run build
npm start
```

---

## 7. MongoDB Configuration

In `.env.local`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/lost_and_found?retryWrites=true&w=majority
BETTER_AUTH_SECRET=campus_lost_and_found_secret_key_2026_cse_iu
BETTER_AUTH_URL=http://localhost:3000
```
- If `MONGODB_URI` points to a live MongoDB Atlas or local MongoDB instance, the application connects directly and creates indexes.
- If no MongoDB instance is currently reachable, the built-in fallback storage runs automatically without crashing, enabling instant out-of-the-box demonstration.
