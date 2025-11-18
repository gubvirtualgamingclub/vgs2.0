# VGS 2.0 - Setup & Deployment Guide

**Version:** 3.0.0  
**Last Updated:** November 18, 2025  
**For:** System Administrators, DevOps, Initial Setup

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Running Locally](#running-locally)
7. [Deployment](#deployment)
8. [Production Configuration](#production-configuration)
9. [Troubleshooting](#troubleshooting)

---

## ✅ PREREQUISITES

### Required Software
- **Node.js:** 18.17 or later ([Download](https://nodejs.org/))
- **npm/yarn/pnpm:** Package manager
- **Git:** Version control
- **Supabase Account:** [Create free account](https://supabase.com)

### Knowledge Requirements
- Basic command line operations
- Understanding of environment variables
- Basic database concepts

---

## 🚀 INITIAL SETUP

### 1. Clone or Download Project

```bash
# If using Git
git clone <repository-url>
cd VGS-2-0

# Or download and extract ZIP file
```

### 2. Install Dependencies

```bash
npm install
```

**Expected output:** Dependencies installed successfully without errors.

### 3. Verify Installation

```bash
node --version  # Should show v18.17 or higher
npm --version   # Should show npm version
```

---

## ☁️ SUPABASE CONFIGURATION

### Step 1: Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name:** VGS-2-0 (or your choice)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your target audience
   - **Pricing Plan:** Free tier is sufficient for most use cases
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

### Step 2: Get API Credentials

1. In your project dashboard, click **"Settings"** (gear icon)
2. Go to **"API"** section
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

**⚠️ Important:** Keep these credentials secure. Never commit them to Git.

### Step 3: Disable Email Confirmations (For Development)

1. Go to **Authentication** → **Providers**
2. Click on **Email** provider
3. Toggle **OFF**: "Confirm email"
4. Click **Save**

> This allows immediate admin login without email verification. Re-enable in production if needed.

---

## 🗄️ DATABASE SETUP

### Option 1: Fresh Installation (Recommended)

Use this for a **brand new database**.

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Click **"New query"**
4. Open `DATABASE_COMPLETE_SETUP.sql` from your project
5. Copy **entire contents** and paste into SQL Editor
6. Click **"Run"** or press `Ctrl+Enter`
7. Wait for "Success" message (takes 10-30 seconds)

**What this does:**
- Creates all required tables
- Sets up indexes for performance
- Configures Row Level Security (RLS)
- Adds triggers for updated_at timestamps
- Creates default site settings

### Option 2: Migration for Existing Database

Use this if you're **updating an existing VGS database**.

1. Open Supabase Dashboard → SQL Editor
2. Open `DATABASE_MIGRATION_UPDATE.sql`
3. Run the migration script
4. Verify no errors in console

**⚠️ Warning:** Backup your database before running migrations!

### Verify Database Setup

Run this query in SQL Editor to verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected tables:**
- activities
- committee
- committee_members
- committees
- games
- game_history
- registration_forms
- site_settings
- sponsors
- tournaments
- updates

---

## 🔐 ENVIRONMENT VARIABLES

### Step 1: Create Environment File

```bash
# Copy the example file
cp .env.local.example .env.local
```

### Step 2: Configure Variables

Edit `.env.local` with your text editor:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For server-side operations (if needed)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**How to get values:**
- **SUPABASE_URL:** Supabase Dashboard → Settings → API → Project URL
- **ANON_KEY:** Supabase Dashboard → Settings → API → anon public key
- **SERVICE_ROLE_KEY:** Same page, under "service_role" (keep secret!)

### Step 3: Verify Configuration

Create a test file `test-connection.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  const { data, error } = await supabase.from('updates').select('count');
  if (error) {
    console.error('❌ Connection failed:', error.message);
  } else {
    console.log('✅ Connection successful!');
  }
}

testConnection();
```

Run: `node test-connection.js`

---

## 💻 RUNNING LOCALLY

### Development Server

```bash
npm run dev
```

**Expected output:**
```
  ▲ Next.js 14.2.33
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.5s
```

### Access Points

- **Public Site:** http://localhost:3000
- **Admin Login:** http://localhost:3000/admin/login
- **Admin Dashboard:** http://localhost:3000/admin

### Create First Admin User

1. Go to Supabase Dashboard
2. Click **Authentication** → **Users**
3. Click **"Add user"**
4. Choose **"Create new user"**
5. Enter:
   - **Email:** your-admin@example.com
   - **Password:** Strong password (save it!)
   - **Auto Confirm User:** ✅ Check this
6. Click **"Create user"**

Now login at http://localhost:3000/admin/login with these credentials.

---

## 🌐 DEPLOYMENT

### Vercel (Recommended - Easiest)

#### Prerequisites
- GitHub/GitLab/Bitbucket account
- Code pushed to repository

#### Deployment Steps

1. **Go to [vercel.com](https://vercel.com)**
2. Click **"Add New"** → **"Project"**
3. **Import your repository**
4. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
5. **Add Environment Variables:**
   Click **"Environment Variables"** and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
   ```
6. Click **"Deploy"**
7. Wait 2-5 minutes for build to complete

#### Post-Deployment

- **Your Site:** `https://your-project.vercel.app`
- **Custom Domain:** Settings → Domains → Add your domain
- **Auto Deploy:** Pushes to main branch auto-deploy

---

### Netlify

#### Deployment Steps

1. **Go to [netlify.com](https://netlify.com)**
2. Click **"Add new site"** → **"Import an existing project"**
3. **Connect to Git provider** and select repository
4. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Base directory: (leave empty)
5. **Environment Variables:**
   Go to Site Settings → Environment → Environment Variables
   Add:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
6. Click **"Deploy site"**

---

### VPS/Traditional Hosting

#### Requirements
- Ubuntu 20.04+ or similar Linux server
- Node.js 18+ installed
- Nginx or Apache for reverse proxy
- PM2 for process management

#### Deployment Steps

```bash
# 1. Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PM2
sudo npm install -g pm2

# 3. Clone project
git clone <repository-url>
cd VGS-2-0

# 4. Install dependencies
npm install

# 5. Create .env.local with production values

# 6. Build project
npm run build

# 7. Start with PM2
pm2 start npm --name "vgs-website" -- start

# 8. Configure PM2 to start on boot
pm2 startup
pm2 save
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ⚙️ PRODUCTION CONFIGURATION

### Supabase Security

#### 1. Enable Row Level Security (RLS)

Already configured in setup script, but verify:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`.

#### 2. Configure Allowed URLs

Supabase Dashboard → Authentication → URL Configuration:
- **Site URL:** https://your-domain.com
- **Redirect URLs:** 
  - https://your-domain.com/admin
  - https://your-domain.com/admin/**

### Performance Optimization

#### 1. Enable Caching (Vercel)

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/logos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

#### 2. Database Indexes

Already created in setup script. Verify:

```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Monitoring

#### 1. Supabase Logs

Dashboard → Logs → Filter by table/operation

#### 2. Vercel Analytics

Project → Analytics → Enable Web Analytics

---

## 🐛 TROUBLESHOOTING

### Common Issues

#### Issue: "Failed to connect to Supabase"

**Symptoms:**
- Error: `Failed to fetch`
- Console: `Network request failed`

**Solutions:**
1. Verify `.env.local` values are correct
2. Check Supabase project is running (not paused)
3. Verify no typos in environment variables
4. Restart dev server: `Ctrl+C` then `npm run dev`

```bash
# Test connection
curl https://your-project.supabase.co/rest/v1/
```

---

#### Issue: "Cannot login to admin"

**Symptoms:**
- "Invalid credentials" error
- User exists in Supabase but can't login

**Solutions:**
1. Check email confirmation is disabled (Auth → Providers → Email)
2. Verify user is confirmed in Authentication → Users
3. Check user email is correct (case-sensitive)
4. Reset password in Supabase Dashboard

---

#### Issue: "RLS policy violation"

**Symptoms:**
- Error: `new row violates row-level security policy`
- Can't insert/update data from admin

**Solutions:**
1. Verify you're logged in as admin
2. Check RLS policies exist:
```sql
SELECT * FROM pg_policies WHERE tablename = 'updates';
```
3. Re-run `DATABASE_COMPLETE_SETUP.sql` if policies missing

---

#### Issue: "Build fails on Vercel"

**Symptoms:**
- Deployment fails with TypeScript errors
- Build succeeds locally but fails on Vercel

**Solutions:**
1. Check all environment variables are set in Vercel
2. Verify `package.json` has correct dependencies
3. Check Node.js version matches (Settings → General)
4. Clear build cache: Settings → General → Clear Cache

---

#### Issue: "Images not loading"

**Symptoms:**
- Broken image icons
- Console: `Failed to load resource`

**Solutions:**
1. Check image paths start with `/` for absolute paths
2. Verify images exist in `public/` folder
3. For external URLs, add domain to `next.config.js`:
```javascript
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
  },
};
```

---

#### Issue: "Database tables don't exist"

**Symptoms:**
- Error: `relation "updates" does not exist`
- Admin pages show errors

**Solutions:**
1. Run `DATABASE_COMPLETE_SETUP.sql` in Supabase SQL Editor
2. Verify tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```
3. Check correct database is selected in Supabase URL

---

### Getting Help

1. **Check Logs:**
   - Browser Console (F12)
   - Supabase Dashboard → Logs
   - Vercel → Deployments → [Build] → Build Logs

2. **Verify Configuration:**
   ```bash
   # Print environment variables (remove sensitive data before sharing)
   cat .env.local | sed 's/=.*/=***/'
   ```

3. **Database Status:**
   ```sql
   SELECT NOW(); -- Should return current timestamp
   ```

---

## 📚 NEXT STEPS

After successful setup:

1. ✅ Create admin users in Supabase
2. ✅ Add initial content through admin panel
3. ✅ Upload images to `public/` folders
4. ✅ Configure site settings in admin
5. ✅ Test all pages on mobile and desktop
6. ✅ Set up custom domain (if applicable)

**For Development Guide:** See `DEVELOPER_GUIDE.md`  
**For Admin Panel Usage:** See `ADMIN_PANEL_GUIDE.md`

---

## 🔄 Maintenance

### Regular Tasks

**Weekly:**
- Check Supabase database size (Dashboard → Database)
- Review error logs
- Test admin login

**Monthly:**
- Update dependencies: `npm update`
- Backup database (Supabase → Database → Backup)
- Review and archive old content

**As Needed:**
- Update Next.js: `npm install next@latest`
- Update Supabase client: `npm install @supabase/supabase-js@latest`

---

**Setup Guide maintained by:** VGS Development Team  
**Last updated:** November 18, 2025  
**Version:** 3.0.0
