# 📧 Email Management System - Complete Setup Guide

## Overview

The VGS 2.0 Email Management System allows admins to:
1. **Fetch participants** from Google Sheets
2. **Create email templates** with HTML and variables
3. **Send personalized emails** to selected participants
4. **Track email history** and delivery status

---

## 📋 Prerequisites

### 1. Install Nodemailer

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 2. Database Migration

Run the migration to add email tables:

**Option A: In Supabase Dashboard**
1. Go to SQL Editor
2. Open `migrations/add_email_management.sql`
3. Copy and paste entire content
4. Click "Run"

**Option B: Update Complete Setup**
If starting fresh, `DATABASE_COMPLETE_SETUP.sql` already includes email tables.

---

## ⚙️ Configuration

### 1. Email Provider Setup

#### Using Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Visit https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Update .env.local**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # App password (no spaces)
   ```

#### Using Other Providers

**Outlook/Office 365:**
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

**Yahoo Mail:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

**Custom SMTP:**
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_USER=your-username
EMAIL_PASSWORD=your-password
```

---

## 📊 Google Sheets Setup

### Sheet Requirements

Your Google Sheet **must**:
1. Be **publicly accessible** (Share → Anyone with link → Viewer)
2. Have columns named **"Name"** (or "Participant", "Leader")
3. Have column named **"Email"** (or "Mail")

### Example Sheet Structure

| Name          | Email                | Student ID | Phone       |
|---------------|----------------------|------------|-------------|
| John Doe      | john@example.com     | 2019001    | 01712345678 |
| Jane Smith    | jane@example.com     | 2019002    | 01723456789 |

**✅ Valid column names for Name:** Name, Participant Name, Leader Name, Participant, Leader  
**✅ Valid column names for Email:** Email, Email Address, Mail, E-mail

### How to Get Sheet URL

1. Open your Google Sheet
2. Click "Share" → Set to "Anyone with the link"
3. Copy the entire URL (https://docs.google.com/spreadsheets/d/...)
4. Paste in admin panel

---

## 🎨 Email Template Variables

Use these variables in your HTML templates:

- `{{name}}` - Replaced with participant's name
- `{{email}}` - Replaced with participant's email

### Example Template

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9fafb; }
        .button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎮 Welcome to VGS Tournament!</h1>
    </div>
    <div class="content">
        <h2>Hello {{name}},</h2>
        <p>Thank you for registering for our upcoming gaming tournament!</p>
        <p>Your registration has been confirmed for: <strong>{{name}}</strong></p>
        <p>We will send further details to: <strong>{{email}}</strong></p>
        
        <p style="margin-top: 30px;">
            <a href="https://vgs.example.com/tournament-details" class="button">
                View Tournament Details
            </a>
        </p>
        
        <p style="color: #666; margin-top: 30px;">
            Best regards,<br>
            VGS Team
        </p>
    </div>
</body>
</html>
```

---

## 🚀 How to Use

### Step 1: Access Email Management

1. Login to admin panel
2. Navigate to **Email Management** (📧)

### Step 2: Compose & Send Email

#### A. Load Participants

1. Go to **"Compose"** tab
2. Paste Google Sheet URL
3. Click **"Fetch"**
4. System will load all participants with Name and Email

#### B. Select Recipients

- Click **"Select All"** to choose everyone
- Or manually check individual participants
- Counter shows: `Selected (5/10)`

#### C. Compose Email

**Option 1: Use Template**
1. Select a saved template from dropdown
2. Template content will be loaded automatically

**Option 2: Write Custom Email**
1. Enter **Subject** (e.g., "Tournament Registration Confirmed")
2. Write **HTML Content** using the textarea
3. Use `{{name}}` placeholder for personalization
4. Click **"👁️ Preview"** to see how it looks

#### D. Send Emails

1. Click **"🚀 Send to X Participants"**
2. System will send personalized emails
3. Success message shows: "Sent 8 of 10 emails successfully"
4. Check **History** tab for delivery status

### Step 3: Manage Templates

#### Save Template

1. After composing email, click **"💾 Save as Template"**
2. Enter template name
3. Template saved for future use

#### Use Template

1. Go to **"Templates"** tab
2. Click **"Use"** on any template
3. Switch to **"Compose"** tab - template loaded

#### Delete Template

1. Go to **"Templates"** tab
2. Click **"Delete"** on unwanted template
3. Confirm deletion

### Step 4: Track History

1. Go to **"History"** tab
2. View all sent emails with:
   - Subject and recipient count
   - Status: Success / Failed / Partial
   - Timestamp
   - Error messages (if any)

---

## 🔍 Troubleshooting

### Problem: "Failed to fetch participants"

**Solution:**
- Ensure Google Sheet is publicly accessible
- Check if sheet has "Name" and "Email" columns
- Verify URL is complete (starts with https://docs.google.com)

### Problem: "Failed to send emails"

**Solution:**
- Check `.env.local` has correct EMAIL_* variables
- For Gmail: Use App Password, not regular password
- Verify SMTP settings for your provider
- Check if email service is not blocking Node.js apps

### Problem: "All emails failed to send"

**Solution:**
- Test SMTP connection:
  ```javascript
  // Run in terminal
  node -e "console.log(process.env.EMAIL_USER)"
  ```
- Verify email credentials are correct
- Check server logs for specific error messages

### Problem: Email arrives in spam folder

**Solution:**
- Use a verified domain email (not gmail.com for sending)
- Add SPF and DKIM records to your domain
- Warm up your email account (send gradually)
- Add "unsubscribe" link in templates

---

## 📦 Database Structure

### email_templates Table

| Column       | Type    | Description                      |
|--------------|---------|----------------------------------|
| id           | UUID    | Primary key                      |
| name         | TEXT    | Template name                    |
| subject      | TEXT    | Email subject line               |
| html_content | TEXT    | HTML email body                  |
| category     | TEXT    | Template category                |
| is_active    | BOOLEAN | Active status                    |
| created_at   | TIMESTAMP | Creation time                  |
| updated_at   | TIMESTAMP | Last update                    |

### email_logs Table

| Column           | Type    | Description                      |
|------------------|---------|----------------------------------|
| id               | UUID    | Primary key                      |
| template_id      | UUID    | FK to email_templates            |
| google_sheet_url | TEXT    | Source sheet URL                 |
| subject          | TEXT    | Email subject                    |
| recipients_count | INTEGER | Total recipients                 |
| recipients_data  | JSONB   | Array of sent emails with status |
| status           | TEXT    | success/failed/partial           |
| sent_at          | TIMESTAMP | Send time                      |

---

## 🎯 Best Practices

### Email Content

1. **Always include:**
   - Clear subject line
   - Greeting with {{name}}
   - Main message
   - Call to action
   - Unsubscribe option (for marketing)

2. **Avoid:**
   - All caps in subject
   - Too many links
   - Large images (>1MB)
   - Spam trigger words ("FREE", "CLICK NOW")

### Google Sheets

1. Keep sheets organized and up-to-date
2. Remove duplicate emails
3. Validate email formats
4. Archive old registration sheets

### Templates

1. Name templates clearly ("Tournament Registration", "Event Reminder")
2. Test templates with preview before sending
3. Save templates for recurring communications
4. Update templates seasonally

### Security

1. Never commit `.env.local` to git
2. Rotate email passwords periodically
3. Use separate email account for sending
4. Monitor email logs for unusual activity

---

## 📊 API Endpoints

### Fetch Participants
```
POST /api/emails/fetch-participants
Body: { sheetUrl: "https://..." }
Response: { participants: [{name, email}], count: 10 }
```

### Templates CRUD
```
GET    /api/emails/templates
POST   /api/emails/templates
PUT    /api/emails/templates
DELETE /api/emails/templates?id=uuid
```

### Send Emails
```
POST /api/emails/send
Body: {
  recipients: [{name, email}],
  subject: "...",
  htmlContent: "...",
  templateId: "uuid",
  googleSheetUrl: "..."
}
```

### Email Logs
```
GET /api/emails/logs?limit=50
Response: { logs: [...] }
```

---

## 🔐 Security Notes

1. **Email credentials** are server-side only (not exposed to client)
2. **RLS policies** ensure only authenticated admins can access email features
3. **Rate limiting** should be implemented for production
4. **Email logs** track all sends for audit purposes

---

## 📝 Testing Checklist

- [ ] Install nodemailer package
- [ ] Run database migration
- [ ] Configure .env.local with email settings
- [ ] Create test Google Sheet with sample data
- [ ] Make sheet publicly accessible
- [ ] Test fetching participants
- [ ] Create a test email template
- [ ] Send test email to yourself
- [ ] Verify email delivery
- [ ] Check email logs in History tab
- [ ] Save template for reuse
- [ ] Test loading saved template

---

## 🎉 You're All Set!

Your email management system is ready to send personalized emails to participants. For support or questions, check the admin panel help buttons on each page.
