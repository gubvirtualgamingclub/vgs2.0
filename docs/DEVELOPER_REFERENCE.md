# VGS 2.0 - DEVELOPER REFERENCE

**Last Updated:** November 13, 2025  
**Version:** 3.0.0  
**For:** Developers, Technical Team

---

## 📋 TABLE OF CONTENTS

1. [Project Structure](#project-structure)
2. [Database Schema](#database-schema)
3. [API & CRUD Operations](#api--crud-operations)
4. [Authentication Flow](#authentication-flow)
5. [Component Architecture](#component-architecture)
6. [Routing & Navigation](#routing--navigation)
7. [State Management](#state-management)
8. [Styling Guidelines](#styling-guidelines)
9. [Code Examples](#code-examples)
10. [Extension Guide](#extension-guide)

---

## 📁 PROJECT STRUCTURE

```
VGS-2-0/
├── app/                          # Next.js App Router
│   ├── (public)/                # Public pages (no auth required)
│   │   ├── page.tsx             # Homepage
│   │   ├── updates/             # Updates listing
│   │   ├── activities/          # Activities listing & detail
│   │   ├── tournaments/         # Tournaments/games page
│   │   ├── sponsors/            # Sponsors & collaborators
│   │   ├── committee/           # Committee members
│   │   └── contributors/        # Contributors tribute page
│   ├── admin/                   # Admin panel (auth required)
│   │   ├── login/               # Login page
│   │   ├── dashboard/           # Admin dashboard
│   │   ├── updates/             # Manage updates
│   │   ├── activities/          # Manage activities
│   │   ├── tournaments/         # Manage tournaments
│   │   ├── sponsors/            # Manage sponsors
│   │   ├── committee/           # Manage committee
│   │   └── settings/            # Site settings
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── components/                   # Reusable React components
│   ├── AdminLayout.tsx          # Admin panel layout wrapper
│   ├── Header.tsx               # Public site header
│   ├── Footer.tsx               # Public site footer
│   ├── LayoutContent.tsx        # Client-side layout logic
│   └── [feature-components]/   # Feature-specific components
│
├── lib/                          # Core utilities
│   ├── supabase.ts              # Supabase client initialization
│   ├── supabase-queries.ts      # All database CRUD functions
│   ├── types/
│   │   └── database.ts          # TypeScript interfaces
│   └── utils.ts                 # Helper functions
│
├── public/                       # Static assets
│   ├── logos/                   # Club & university logos
│   ├── members/                 # Committee member photos
│   ├── partners/                # Sponsor/collaborator logos
│   ├── activities/              # Activity images
│   └── contributors/            # Contributor photos
│
├── migrations/                   # Database migration files
│   └── [migration-files].sql
│
├── COMPLETE_DATABASE_SCHEMA.sql # Fresh database setup
├── DATABASE_MIGRATION_LATEST.sql # Update existing database
├── .env.local                   # Environment variables (gitignored)
├── .env.local.example           # Environment template
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies & scripts
```

---

## 🗄️ DATABASE SCHEMA

### Core Tables

#### 1. **updates**
```sql
CREATE TABLE updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT FALSE
);
```

**TypeScript Interface:**
```typescript
interface Update {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  created_at?: string;
  updated_at?: string;
  is_published: boolean;
}
```

---

#### 2. **activities**
```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(100) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    participants VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE
);
```

**TypeScript Interface:**
```typescript
interface Activity {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  participants: string;
  is_published: boolean;
  is_featured: boolean;
}
```

---

#### 3. **sponsors** (Latest Version with Multiple Categories)
```sql
CREATE TABLE sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('sponsor', 'collaborator')),
    sponsor_types TEXT[],           -- ARRAY for multiple categories
    collaborator_types TEXT[],       -- ARRAY for multiple categories
    custom_type_name VARCHAR(100),   -- Custom name when "other" selected
    display_order INTEGER DEFAULT 0, -- Manual ordering
    website TEXT NOT NULL,
    description TEXT NOT NULL,
    events TEXT[] DEFAULT ARRAY[]::TEXT[],
    social_media JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE
);
```

**TypeScript Interface:**
```typescript
interface Sponsor {
  id: string;
  name: string;
  logo: string;
  type: 'sponsor' | 'collaborator';
  sponsor_types?: string[];         // NEW: Array of categories
  collaborator_types?: string[];    // NEW: Array of categories
  custom_type_name?: string;        // NEW: Custom category name
  display_order: number;            // NEW: Manual ordering
  website: string;
  description: string;
  events?: string[];
  social_media?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  is_published: boolean;
  is_featured: boolean;
}
```

---

#### 4. **site_settings** (Latest Addition)
```sql
CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**TypeScript Interface:**
```typescript
interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'text' | 'url' | 'email' | 'phone';
  description?: string;
}
```

**Default Settings:**
- `partnership_brochure_url` - Google Drive brochure link
- `contact_email` - Partnership email
- `contact_phone` - Contact phone number
- `contact_whatsapp` - WhatsApp number

---

### Full Schema Reference

See `COMPLETE_DATABASE_SCHEMA.sql` for:
- All tables (tournaments, committees, committee_members, registration_forms, etc.)
- All indexes
- Row Level Security policies
- Triggers
- Comments

---

## 🔌 API & CRUD OPERATIONS

All database operations are in `/lib/supabase-queries.ts`

### Basic Pattern
```typescript
import { supabase } from '@/lib/supabase';

// CREATE
export async function createItem(data: ItemType) {
  const { data: result, error } = await supabase
    .from('table_name')
    .insert([data])
    .select()
    .single();
  
  if (error) throw error;
  return result;
}

// READ (all published)
export async function getPublishedItems() {
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// READ (single by ID)
export async function getItemById(id: string) {
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// UPDATE
export async function updateItem(id: string, updates: Partial<ItemType>) {
  const { data, error } = await supabase
    .from('table_name')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// DELETE
export async function deleteItem(id: string) {
  const { error } = await supabase
    .from('table_name')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// TOGGLE PUBLISH
export async function togglePublish(id: string, isPublished: boolean) {
  return updateItem(id, { is_published: isPublished });
}
```

### Sponsor-Specific Operations (Latest)

#### Get All Sponsors with Multiple Categories
```typescript
export async function getSponsors() {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });
  
  if (error) throw error;
  return data || [];
}
```

#### Filter by Type
```typescript
export async function getSponsorsByType(type: 'sponsor' | 'collaborator') {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('type', type)
    .eq('is_published', true)
    .order('display_order', { ascending: true });
  
  if (error) throw error;
  return data || [];
}
```

#### Update Sponsor with Multiple Categories
```typescript
export async function updateSponsor(id: string, updates: Partial<Sponsor>) {
  // Ensure arrays are properly formatted
  const formattedUpdates = {
    ...updates,
    sponsor_types: updates.sponsor_types || [],
    collaborator_types: updates.collaborator_types || [],
  };

  const { data, error } = await supabase
    .from('sponsors')
    .update(formattedUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

### Site Settings Operations

#### Get Setting by Key
```typescript
export async function getSiteSetting(key: string): Promise<string> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', key)
    .single();
  
  if (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return '';
  }
  return data?.setting_value || '';
}
```

#### Upsert (Insert or Update) Setting
```typescript
export async function upsertSiteSetting(
  key: string,
  value: string,
  type: string = 'text',
  description: string = ''
) {
  const { error } = await supabase
    .from('site_settings')
    .upsert({
      setting_key: key,
      setting_value: value,
      setting_type: type,
      description: description,
    }, {
      onConflict: 'setting_key'
    });
  
  if (error) throw error;
}
```

---

## 🔐 AUTHENTICATION FLOW

### Login Process
```typescript
// app/admin/login/page.tsx
import { supabase } from '@/lib/supabase';

async function handleLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert('Login failed: ' + error.message);
    return;
  }

  // Redirect to admin dashboard
  router.push('/admin/dashboard');
}
```

### Protected Routes
```typescript
// app/admin/layout.tsx or middleware
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/admin/login');
    }
  }

  return <div>{children}</div>;
}
```

### Logout
```typescript
async function handleLogout() {
  await supabase.auth.signOut();
  router.push('/admin/login');
}
```

---

## 🧩 COMPONENT ARCHITECTURE

### Page Structure Pattern

#### Public Page Example
```typescript
// app/updates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getPublishedUpdates } from '@/lib/supabase-queries';
import type { Update } from '@/lib/types/database';

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
  }, []);

  async function fetchUpdates() {
    try {
      const data = await getPublishedUpdates();
      setUpdates(data);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Latest Updates</h1>
      {updates.map(update => (
        <div key={update.id}>
          <h2>{update.title}</h2>
          <p>{update.summary}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Admin Page Example
```typescript
// app/admin/updates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  getAllUpdates, 
  createUpdate, 
  updateUpdate, 
  deleteUpdate,
  toggleUpdatePublish 
} from '@/lib/supabase-queries';

export default function AdminUpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    date: '',
    is_published: false,
  });

  useEffect(() => {
    fetchUpdates();
  }, []);

  async function fetchUpdates() {
    const data = await getAllUpdates(); // Admin sees all
    setUpdates(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateUpdate(editingId, formData);
      } else {
        await createUpdate(formData);
      }
      
      // Reset and refresh
      resetForm();
      fetchUpdates();
    } catch (error) {
      console.error('Error saving update:', error);
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this update?')) {
      await deleteUpdate(id);
      fetchUpdates();
    }
  }

  async function handleTogglePublish(id: string, currentStatus: boolean) {
    await toggleUpdatePublish(id, !currentStatus);
    fetchUpdates();
  }

  function resetForm() {
    setFormData({
      title: '',
      summary: '',
      content: '',
      date: '',
      is_published: false,
    });
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <div>
      <h1>Manage Updates</h1>
      <button onClick={() => setShowForm(true)}>Add Update</button>
      
      {/* Update List */}
      <div>
        {updates.map(update => (
          <div key={update.id}>
            <h3>{update.title}</h3>
            <span>{update.is_published ? 'Published' : 'Draft'}</span>
            <button onClick={() => handleTogglePublish(update.id, update.is_published)}>
              {update.is_published ? 'Unpublish' : 'Publish'}
            </button>
            <button onClick={() => {/* Edit logic */}}>Edit</button>
            <button onClick={() => handleDelete(update.id)}>Delete</button>
          </div>
        ))}
      </div>
      
      {/* Form Modal */}
      {showForm && (
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
        </form>
      )}
    </div>
  );
}
```

---

## 🛣️ ROUTING & NAVIGATION

### Next.js App Router Structure

#### Public Routes
```
/                     → Homepage
/updates             → Updates listing
/activities          → Activities listing
/activities/[slug]   → Individual activity detail
/tournaments         → Tournaments/games page
/sponsors            → Sponsors & collaborators
/committee           → Committee members
/contributors        → Contributors tribute page
```

#### Admin Routes (Protected)
```
/admin/login         → Login page
/admin/dashboard     → Dashboard overview
/admin/updates       → Manage updates
/admin/activities    → Manage activities
/admin/tournaments   → Manage tournaments
/admin/sponsors      → Manage sponsors
/admin/committee     → Manage committee
/admin/settings      → Site settings
```

### Dynamic Routes Example
```typescript
// app/activities/[slug]/page.tsx
export default function ActivityDetailPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    fetchActivity(params.slug);
  }, [params.slug]);

  async function fetchActivity(slug: string) {
    const data = await getActivityBySlug(slug);
    setActivity(data);
  }

  if (!activity) return <div>Loading...</div>;

  return (
    <div>
      <h1>{activity.title}</h1>
      <p>{activity.description}</p>
      {/* ... */}
    </div>
  );
}
```

---

## 📊 STATE MANAGEMENT

### Local State (useState)
```typescript
const [items, setItems] = useState<Item[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### Form State
```typescript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  date: '',
});

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
}
```

### Checkbox Arrays (Multiple Categories)
```typescript
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

function handleCategoryToggle(category: string) {
  setSelectedCategories(prev => {
    if (prev.includes(category)) {
      return prev.filter(c => c !== category);
    } else {
      return [...prev, category];
    }
  });
}

// In JSX
<input
  type="checkbox"
  checked={selectedCategories.includes('title_sponsor')}
  onChange={() => handleCategoryToggle('title_sponsor')}
/>
```

---

## 🎨 STYLING GUIDELINES

### Tailwind CSS Patterns

#### Layout
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

#### Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

#### Card Component
```tsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  {/* Content */}
</div>
```

#### Gradient Text
```tsx
<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
  Title
</h1>
```

#### Button Styles
```tsx
// Primary
<button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  Save
</button>

// Secondary
<button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
  Cancel
</button>

// Danger
<button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
  Delete
</button>
```

---

## 💻 CODE EXAMPLES

### Complete Sponsor Management Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { 
  getSponsors, 
  createSponsor, 
  updateSponsor, 
  deleteSponsor 
} from '@/lib/supabase-queries';
import type { Sponsor } from '@/lib/types/database';

// Available categories
const SPONSOR_CATEGORIES = [
  'title_sponsor',
  'main_sponsor',
  'co_sponsor',
  'gold_sponsor',
  'silver_sponsor',
  // ... more categories
];

const COLLABORATOR_CATEGORIES = [
  'media_partner',
  'food_partner',
  'logistics_partner',
  // ... more categories
];

export default function SponsorsAdminPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    type: 'sponsor' as 'sponsor' | 'collaborator',
    sponsor_types: [] as string[],
    collaborator_types: [] as string[],
    custom_type_name: '',
    display_order: 0,
    website: '',
    description: '',
    is_published: false,
  });

  useEffect(() => {
    fetchSponsors();
  }, []);

  async function fetchSponsors() {
    const data = await getSponsors();
    setSponsors(data);
  }

  function handleCategoryToggle(category: string) {
    const key = formData.type === 'sponsor' ? 'sponsor_types' : 'collaborator_types';
    
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].includes(category)
        ? prev[key].filter(c => c !== category)
        : [...prev[key], category]
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateSponsor(editingId, formData);
      } else {
        await createSponsor(formData);
      }
      
      resetForm();
      fetchSponsors();
    } catch (error) {
      console.error('Error saving sponsor:', error);
      alert('Failed to save sponsor');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this sponsor?')) return;
    
    try {
      await deleteSponsor(id);
      fetchSponsors();
    } catch (error) {
      console.error('Error deleting sponsor:', error);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      logo: '',
      type: 'sponsor',
      sponsor_types: [],
      collaborator_types: [],
      custom_type_name: '',
      display_order: 0,
      website: '',
      description: '',
      is_published: false,
    });
    setEditingId(null);
    setShowForm(false);
  }

  const categories = formData.type === 'sponsor' 
    ? SPONSOR_CATEGORIES 
    : COLLABORATOR_CATEGORIES;
  
  const selectedCategories = formData.type === 'sponsor'
    ? formData.sponsor_types
    : formData.collaborator_types;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Sponsors</h1>
      
      <button
        onClick={() => setShowForm(true)}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Add Sponsor
      </button>

      {/* Sponsors List */}
      <div className="mt-8 grid gap-4">
        {sponsors.map(sponsor => (
          <div key={sponsor.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={sponsor.logo} 
                alt={sponsor.name}
                className="w-16 h-16 object-contain"
              />
              <div>
                <h3 className="font-bold">{sponsor.name}</h3>
                <p className="text-sm text-gray-600">
                  Order: {sponsor.display_order} | 
                  {sponsor.type === 'sponsor' 
                    ? sponsor.sponsor_types?.join(', ')
                    : sponsor.collaborator_types?.join(', ')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {/* Edit logic */}}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(sponsor.id)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Edit Sponsor' : 'Add Sponsor'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Fields */}
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    type: e.target.value as 'sponsor' | 'collaborator'
                  }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="sponsor">Sponsor</option>
                  <option value="collaborator">Collaborator</option>
                </select>
              </div>

              {/* Categories (Checkboxes) */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Categories (Select Multiple)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {categories.map(category => (
                    <label key={category} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                      />
                      <span className="text-sm">{category.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Type Name (if "other" selected) */}
              {selectedCategories.includes('other') && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Custom Category Name
                  </label>
                  <input
                    type="text"
                    value={formData.custom_type_name}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      custom_type_name: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Educational Partner"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    display_order: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Logo URL</label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    is_published: e.target.checked 
                  }))}
                  id="publish"
                />
                <label htmlFor="publish" className="text-sm font-medium">
                  Publish immediately
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🔧 EXTENSION GUIDE

### Adding a New Content Type

#### Step 1: Create Database Table
```sql
CREATE TABLE new_feature (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT FALSE
);

-- Add RLS
ALTER TABLE new_feature ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published" ON new_feature
    FOR SELECT USING (is_published = true);

CREATE POLICY "Authenticated users can manage" ON new_feature
    FOR ALL USING (auth.role() = 'authenticated');
```

#### Step 2: Add TypeScript Interface
```typescript
// lib/types/database.ts
export interface NewFeature {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  is_published: boolean;
}
```

#### Step 3: Create CRUD Functions
```typescript
// lib/supabase-queries.ts
export async function getPublishedNewFeatures() {
  const { data, error } = await supabase
    .from('new_feature')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createNewFeature(feature: Omit<NewFeature, 'id'>) {
  const { data, error } = await supabase
    .from('new_feature')
    .insert([feature])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Add update, delete functions...
```

#### Step 4: Create Public Page
```typescript
// app/new-feature/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getPublishedNewFeatures } from '@/lib/supabase-queries';

export default function NewFeaturePage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getPublishedNewFeatures();
      setItems(data);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>New Feature</h1>
      {items.map(item => (
        <div key={item.id}>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Step 5: Create Admin Page
```typescript
// app/admin/new-feature/page.tsx
// Use the full admin pattern shown in previous examples
```

#### Step 6: Add to Navigation
```typescript
// components/Header.tsx
const navigation = [
  // ... existing items
  { name: 'New Feature', href: '/new-feature' },
];

// components/AdminLayout.tsx
const adminNavigation = [
  // ... existing items
  { name: 'New Feature', href: '/admin/new-feature', icon: '🆕' },
];
```

---

## 📝 CODING STANDARDS

### TypeScript
- ✅ Always use TypeScript (`.tsx`, `.ts`)
- ✅ Define interfaces for all data types
- ✅ Use strict type checking
- ✅ Avoid `any` type

### Naming Conventions
- **Components:** PascalCase (`UpdateCard.tsx`)
- **Functions:** camelCase (`fetchUpdates()`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_ITEMS`)
- **Interfaces:** PascalCase (`interface Update {}`)

### File Organization
```
feature-name/
├── page.tsx          # Main page component
├── components/       # Feature-specific components
│   ├── FeatureCard.tsx
│   └── FeatureForm.tsx
└── utils.ts          # Helper functions
```

### Error Handling
```typescript
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  console.error('Error:', error);
  setError('Failed to load data');
  // Show user-friendly error message
}
```

### Loading States
```typescript
if (loading) {
  return <div className="animate-pulse">Loading...</div>;
}

if (error) {
  return <div className="text-red-600">{error}</div>;
}

if (!data || data.length === 0) {
  return <div className="text-gray-500">No items found</div>;
}
```

---

## 🚀 PERFORMANCE TIPS

### 1. Use Indexes
```sql
CREATE INDEX idx_table_column ON table_name(column_name);
```

### 2. Limit Query Results
```typescript
const { data } = await supabase
  .from('table')
  .select('*')
  .limit(10);
```

### 3. Select Only Needed Columns
```typescript
const { data } = await supabase
  .from('updates')
  .select('id, title, summary'); // Not *
```

### 4. Use Next.js Image Component
```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // For above-the-fold images
/>
```

### 5. Implement Pagination
```typescript
const ITEMS_PER_PAGE = 10;
const start = page * ITEMS_PER_PAGE;
const end = start + ITEMS_PER_PAGE;

const { data } = await supabase
  .from('table')
  .select('*')
  .range(start, end);
```

---

## 🐛 DEBUGGING TIPS

### 1. Check Supabase Logs
Supabase Dashboard → Logs → Filter by table/operation

### 2. Browser DevTools
- **Console:** Check for errors
- **Network:** Inspect API calls
- **Application:** View localStorage/sessionStorage

### 3. Common Issues

**Problem:** "Failed to fetch"
```typescript
// Check: Is Supabase URL correct in .env.local?
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
```

**Problem:** "Row Level Security policy violation"
```sql
-- Check: Are RLS policies configured correctly?
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

**Problem:** Array fields not saving
```typescript
// Ensure arrays are properly formatted
sponsor_types: formData.sponsor_types || [] // Not undefined
```

---

## 📚 ADDITIONAL RESOURCES

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/handbook/

---

**Happy Coding! 🚀**

*Developer Reference maintained by: MD. Sazib*  
*Last updated: November 13, 2025*
