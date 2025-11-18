# Email Management System - Installation Commands

## Run these commands in order:

### 1. Install Required Packages
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 2. Setup Environment Variables
Create or update `.env.local` file with:
```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. Run Database Migration
Go to Supabase Dashboard → SQL Editor and run:
```sql
-- Copy entire content from: migrations/add_email_management.sql
```

### 4. Restart Development Server
```bash
npm run dev
```

### 5. Test the System
1. Navigate to: http://localhost:3000/x-admin-control/emails
2. Try fetching participants from a test Google Sheet
3. Send a test email to yourself

## Quick Test Google Sheet

Create a Google Sheet with this structure:

| Name | Email |
|------|-------|
| Test User | your-email@example.com |

Then:
1. Share → Anyone with link → Viewer
2. Copy the URL
3. Use in admin panel

---

## Verification Checklist

- [ ] Nodemailer installed (check package.json)
- [ ] Email credentials in .env.local
- [ ] Database migration completed
- [ ] Server restarted
- [ ] Email Management appears in admin sidebar
- [ ] Can access /x-admin-control/emails
- [ ] Test email sent successfully
