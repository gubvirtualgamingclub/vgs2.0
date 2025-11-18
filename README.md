# VGS 2.0 - Gaming Society Website

A modern, full-stack web application for university gaming societies, built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

### Public Website
- 🏠 **Dynamic Home Page** - Hero section, latest updates, upcoming activities, sponsor showcase
- 📢 **Updates System** - News and announcements with date sorting
- 🎮 **Activities Hub** - Event listings with detailed pages (workshops, tournaments, seminars)
- 🏆 **Tournaments Portal** - Multi-category gaming tournaments (Casual, Mobile, PC)
- 👥 **Committee Profiles** - Year-based team member showcase with role history
- 💼 **Sponsor Showcase** - Tier-based sponsor display (Platinum, Gold, Silver, Bronze)
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop

### Admin Panel
- 🔐 **Secure Authentication** - Email/password login with Supabase Auth
- 📊 **Dashboard** - Quick stats and overview
- ✏️ **Content Management** - Full CRUD operations for all content types
- 👁️ **Publish Control** - Toggle visibility without deleting content
- 📱 **Mobile-Friendly Admin** - Responsive admin panel with hamburger menu
- 🔄 **Real-Time Updates** - Changes reflect immediately on public pages

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.local.example .env.local
```
Edit `.env.local` with your Supabase credentials.

### 3. Set Up Database
Run `db-setup.sql` in Supabase SQL Editor to create all tables.

### 4. Add Sample Data (Optional)
Run `mock-data-insert.sql` to populate with professional mock content.

### 5. Start Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

### 6. Access Admin Panel
- Login at `/admin/login`
- Create admin user in Supabase Dashboard (Authentication → Users)

## 📚 Documentation

### For Setup & Deployment
📖 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup, configuration, and deployment guide
- Initial setup and dependencies
- Supabase configuration step-by-step
- Database schema details
- Admin authentication setup
- Mock data insertion
- Deployment to Vercel/Netlify
- Troubleshooting common issues

### For Development & Code Reference
💻 **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Comprehensive developer reference
- Project structure breakdown
- CRUD operations reference
- Admin panel architecture
- Public pages integration
- Code examples and patterns
- Best practices and guidelines
- Data flow diagrams

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework with App Router | 14.2.33 |
| **TypeScript** | Type-safe JavaScript | Latest |
| **Tailwind CSS** | Utility-first styling | Latest |
| **Supabase** | Database, Auth, Backend | Latest |
| **PostgreSQL** | Database engine | via Supabase |
| **React** | UI library | 18+ |

## 📁 Project Structure

```
VGS-2-0/
├── app/                     # Next.js App Router
│   ├── admin/              # Admin panel (protected)
│   ├── updates/            # Public updates page
│   ├── activities/         # Public activities pages
│   ├── tournaments/        # Public tournaments page
│   ├── committee/          # Public committee page
│   └── layout.tsx          # Root layout
├── components/             # Reusable React components
├── lib/                    # Utilities and configurations
│   ├── supabase.ts         # Supabase client
│   ├── supabase-queries.ts # All CRUD functions
│   └── types/database.ts   # TypeScript types
├── public/                 # Static assets
├── db-setup.sql            # Database schema
├── mock-data-insert.sql    # Sample data
├── SETUP_GUIDE.md          # Setup documentation
└── DEVELOPER_GUIDE.md      # Developer reference
```

## 🗄️ Database Tables

- **updates** - News and announcements
- **activities** - Events, workshops, seminars
- **tournaments** - Gaming competitions
- **sponsors** - Sponsor partnerships
- **committee** - Team member profiles

All tables include:
- UUID primary key
- Timestamps (created_at, updated_at)
- Publish status flag (is_published)

## 🎯 Key Features Highlight

### Admin Panel
✅ Complete CRUD for all content  
✅ Publish/unpublish toggle  
✅ Real-time data sync  
✅ Mobile responsive with hamburger menu  
✅ Secure authentication  
✅ Loading states and error handling  

### Public Pages
✅ SEO-optimized server components  
✅ Dynamic content from Supabase  
✅ Responsive design (mobile-first)  
✅ Smooth animations and transitions  
✅ Category filtering (tournaments, committee)  
✅ Year-based organization (committee)  

## 🔗 Important Links

- **Admin Login:** `/admin/login`
- **Admin Dashboard:** `/admin`
- **Public Home:** `/`
- **Supabase Dashboard:** [supabase.com/dashboard](https://supabase.com/dashboard)

## 📝 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

## 🌐 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy automatically

See [SETUP_GUIDE.md](./SETUP_GUIDE.md#deployment) for detailed deployment instructions.

## 🆘 Support & Troubleshooting

Common issues and solutions are documented in [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting).

For code reference and examples, see [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#code-examples).

## 📄 License

This project is for educational purposes.

## 👨‍💻 Developer

Developed with ❤️ for gaming communities

---

**Version:** 2.0  
**Last Updated:** November 2025
