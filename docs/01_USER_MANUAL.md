# VGS 2.0 - User Manual & Admin Guide

**Version:** 4.0.0  
**Last Updated:** December 12, 2025  
**For:** Administrators, Content Managers, & Moderators

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Content Management](#content-management)
   - [Updates](#updates)
   - [Activities](#activities)
   - [Games](#games)
   - [Tournaments](#tournaments)
   - [Committee](#committee)
   - [Sponsors](#sponsors)
4. [Registration Forms](#registration-forms)
5. [Email Management System](#email-management-system)
6. [Security Best Practices](#security-best-practices)

---

## 🚪 Getting Started

### Accessing the Admin Panel

1. Navigate to your site's admin URL (e.g., `https://vgs.green.edu.bd/admin/login`).
2. Enter your authorized email and password.
3. Click **"Sign In"**.

### First Time Setup

If you are the first admin:

1. Ensure the developer has created your account in Supabase.
2. Use the provided temporary credentials.
3. **Immediately change your password** if the option is available, or request a password reset.

---

## 📊 Dashboard Overview

The dashboard provides a real-time snapshot of the society's activities:

- **Quick Stats:** Total active members, published updates, upcoming activities, and open tournaments.
- **Recent Activity:** A log of the latest actions taken by admins.
- **Quick Actions:** Shortcuts to frequently used features like "Add Update" or "Check Registrations".

---

## 📝 Content Management

### Updates

Manage news and announcements ticker.

- **Create:** Click "Add New Update". Provide a title, summary, and content.
- **Publishing:** Toggle the "Publish" switch to make it visible on the homepage.
- **Dates:** Set the display date. Future dates will not show until that day.

### Activities

Manage events, workshops, and seminars.

- **Fields:** Title, Date, Time, Venue, Banner Image.
- **Guests:** Add guest speakers with their photos and designations.
- **Status:** Update status to `Upcoming`, `Ongoing`, or `Completed` to change how it appears.

### Games

Manage the roster of supported games.

- **Categories:** Casual, Mobile, PC.
- **Game Modes:** Team sizes (2v2, 5v5) or Solo.
- **History:** Track past tournaments for each game by clicking "Manage History".

### Tournaments

Create and manage competitive events.

- **Status lifecycle:**
  - `Upcoming`: Visible but no regression.
  - `Open`: Registration buttons are active.
  - `Closed`: Registration disabled, results displayed.
- **Partners:** Add organizers and co-organizers with logos.
- **Glimpses:** Upload photos from previous iterations of the tournament.

### Committee

Manage the executive team and faculty advisors.

- **Yearly Archives:** Create a new "Committee Year" (e.g., 2026) to archive old members and start fresh.
- **Members:** Add comprehensive profiles including social links and photos.
- **Reordering:** Drag and drop members to set their display order on the public page.

### Sponsors

Manage partners and financial supporters.

- **Types:** Sponsor vs. Collaborator.
- **Multiple Roles:** A partner can be both a "Gold Sponsor" and "Venue Partner".
- **Ordering:** Drag and drop to arrange logos (Title sponsors usually go first).

---

## 📋 Registration Forms

Create custom registration forms for any event without coding.

### Creating a Form

1. Go to **Admin → Registration Forms**.
2. Click **Create New Form**.
3. **Game Slug:** Auto-generated from name.
4. **Google Sheet URL:** Paste the Web App URL of your deployed Google Apps Script (see Developer Guide for script setup).
5. **Fields:** Add fields like "Team Name", "Player ID", "Phone Number".
   - _Tip:_ Ensure your Google Sheet headers match these field labels exactly!

### Managing Submissions

- **View:** See submissions directly in the admin panel or the linked Google Sheet.
- **Status:** Mark submissions as `Pending`, `Approved`, or `Rejected`.
- **Export:** Data is always backed up in your Google Sheet.

---

## 📧 Email Management System

A powerful tool to send bulk, personalized emails to participants.

### 1. Fetching Participants

1. Go to **Email Management**.
2. Paste a Google Sheet URL containing `Name` and `Email` columns.
3. Click **Fetch**. The system will list all valid recipients.

### 2. Composing Emails

- **Subject:** Enter a clear subject line.
- **Body:** Use the rich text editor.
- **Variables:** Use `{{name}}` to insert the recipient's name automatically.
  - _Example:_ "Hi {{name}}, your registration is confirmed!"

### 3. Templates

- **Save:** Save frequently used emails (e.g., "Welcome Email", "Rulebook Update") as templates.
- **Load:** Quickly load a template to save time.

### 4. Sending & Logs

- Click **Send** to dispatch emails in batches.
- Check the **History** tab to see who received emails and if any failed.

---

## 🔒 Security Best Practices

1. **Passwords:** Use strong, unique passwords for admin accounts.
2. **Logout:** Always log out when using shared computers.
3. **Role Management:** Only give admin access to trusted executive members.
4. **Phishing:** Be wary of emails asking for admin credentials. VGS system will never ask for your password via email.
5. **Data Privacy:** When exporting registration data, delete it from local devices after use.

---

**Need Help?** Contact the VGS Technical Team or refer to the `DEVELOPER_MANUAL.md` for technical issues.
