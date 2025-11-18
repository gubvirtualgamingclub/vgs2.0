# VGS 2.0 - Admin Panel Complete Guide

**Version:** 3.0.0  
**Last Updated:** November 18, 2025  
**For:** Admin Users, Content Managers

---

## 📋 TABLE OF CONTENTS

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Updates](#managing-updates)
4. [Managing Activities](#managing-activities)
5. [Managing Games](#managing-games)
6. [Managing Tournaments](#managing-tournaments)
7. [Managing Committee](#managing-committee)
8. [Managing Sponsors](#managing-sponsors)
9. [Managing Registration Forms](#managing-registration-forms)
10. [Site Settings](#site-settings)
11. [Best Practices](#best-practices)
12. [Common Tasks](#common-tasks)

---

## 🚪 GETTING STARTED

### Accessing Admin Panel

1. Navigate to: `https://your-domain.com/admin/login`
2. Enter your admin email and password
3. Click **"Sign In"**
4. You'll be redirected to the Dashboard

### First Login

If this is your first time:
1. Admin account must be created in Supabase Dashboard
2. Go to Supabase → Authentication → Users → Add user
3. Use the credentials to login

### Admin Layout

The admin panel consists of:
- **Header:** Logo, View Site button, Logout
- **Sidebar:** Navigation menu (auto-hides on mobile)
- **Main Content Area:** Current page content

---

## 📊 DASHBOARD OVERVIEW

### Dashboard Stats

The dashboard shows at-a-glance statistics:

**Cards Display:**
- 👥 **Committee Members** - Total active members
- 📢 **Updates** - Total published updates
- 🎮 **Activities** - Total activities
- 🏆 **Tournaments** - Total tournaments

### Quick Actions

From dashboard, you can:
- Click any stat card to jump to that section
- View recent activities
- Access all management sections from sidebar

---

## 📢 MANAGING UPDATES

### Creating a New Update

1. Navigate to **Admin → Updates**
2. Click **"Add New Update"** button
3. Fill in the form:

**Required Fields:**
- **Title:** Update headline (e.g., "Workshop Registration Open")
- **Summary:** Brief description (2-3 sentences)
- **Content:** Full update details (supports paragraphs)
- **Date:** Update date (defaults to today)

**Optional:**
- **☑ Publish immediately:** Check to make live instantly

4. Click **"Create Update"**

### Editing an Update

1. In Updates list, find the update
2. Click **"Edit"** button
3. Modify fields as needed
4. Click **"Update Update"**

### Publishing/Unpublishing

**Toggle Publish Status:**
- Click the **toggle switch** next to any update
- Published updates appear on public website
- Unpublished updates are only visible in admin

**Why Unpublish?**
- Update is outdated but you want to keep it
- Temporarily hide content without deleting

### Deleting an Update

1. Click **"Delete"** button on the update
2. Confirm deletion in popup
3. **⚠️ Warning:** This action cannot be undone!

### Tips for Updates

✅ **Do:**
- Write clear, concise summaries
- Use proper grammar and spelling
- Include relevant dates and times
- Publish updates regularly for engagement

❌ **Don't:**
- Leave summary or content empty
- Use all caps or excessive punctuation
- Forget to set the correct date

---

## 🎮 MANAGING ACTIVITIES

### Creating an Activity

1. Go to **Admin → Activities**
2. Click **"Add New Activity"**
3. Fill in all fields:

**Basic Information:**
- **Title:** Activity name
- **Slug:** URL-friendly name (auto-generated from title)
- **Category:** Type of activity (Tournament/Workshop/Seminar/Social/etc.)
- **Status:** upcoming/ongoing/completed

**Details:**
- **Description:** Full activity details
- **Short Description:** Brief summary for cards (NEW)
- **Date:** Event date
- **Time:** Event time (e.g., "10:00 AM - 2:00 PM")
- **Venue:** Location (e.g., "Room 301" or "Google Meet")
- **Participants:** Expected count or "Open to All"

**Visual Elements:**
- **Banner Image URL:** Path or URL (e.g., `/activities/workshop-banner.jpg`) (NEW)
- **Tags:** Keywords for filtering (e.g., online, free, workshop) (NEW)

**Social:**
- **Facebook Post URL:** Link to event's FB post (NEW)

**Guest Speakers (NEW):**
- Click **"Add Guest"** to add speaker profiles
- **Name:** Speaker's name
- **Photo URL:** Speaker photo path
- **Designation:** Role/title

4. **☑ Featured:** Check to highlight on homepage
5. **☑ Publish:** Check to make live
6. Click **"Create Activity"**

### Activity Features

**Status Badges:**
- 🟢 **Upcoming:** Green - Future events
- 🟡 **Ongoing:** Yellow - Currently happening
- 🔴 **Completed:** Red - Past events

**Featured Activities:**
- Appear on homepage carousel
- Get priority in listings
- Highlighted with star badge

### Managing Activity Images

**Banner Images:**
1. Upload image to `/public/activities/` folder
2. Use path: `/activities/your-image.jpg` in form
3. Recommended size: 1200x600px
4. Formats: JPG, PNG, WebP

**Guest Photos:**
- Path: `/members/guest-name.jpg`
- Recommended: 400x400px square
- Use consistent style across all photos

### Tips for Activities

✅ **Best Practices:**
- Update status as event progresses
- Add Facebook post link for social proof
- Use clear, descriptive titles
- Include complete time information
- Feature maximum 3-5 activities on homepage

---

## 🎲 MANAGING GAMES

### Games System Overview

Games represent the different gaming titles your society supports. Each game can have:
- Multiple team modes (team/individual)
- Team sizes (2v2, 3v3, etc.)
- Event history tracking
- Category classification (Casual/Mobile/PC)

### Creating a Game

1. Navigate to **Admin → Games**
2. Click **"Add New Game"**
3. Fill in the form:

**Required Fields:**
- **Game Name:** Title of the game (auto-generates slug)
- **Game Category:** Casual / Mobile / PC
- **Logo URL:** Path or URL to game logo
- **Display Order:** Sorting number (lower = appears first)

**Optional Fields:**
- **Game Mode:** Team or Individual
- **Team Size:** 2v2, 3v3, 4v4, 5v5, 6v6 (if team mode)
- **☑ Publish:** Make visible on public site

4. Click **"Create Game"**

### Managing Game History

Each game can track its tournament/event history:

1. In Games list, click **"Manage History"** for a game
2. Modal opens with history management
3. Click **"Add Event History"**

**Event History Fields:**
- **Event Name:** Tournament or event title
- **Year:** Event year
- **Month:** Event month (dropdown)
- **Participants:** Number of players/teams
- **Prize Pool:** Amount or "No prize pool"
- **Event Link:** URL to event details (optional)

4. Click **"Add History Entry"**

**Managing Existing History:**
- **Edit:** Click edit button on any history entry
- **Delete:** Remove history entry
- History displays on public game modal sorted by date

### Game Categories Explained

**Casual Games:**
- Board games
- Card games
- Casual video games
- Badge Color: Blue

**Mobile Games:**
- PUBG Mobile
- Free Fire
- Mobile Legends
- Badge Color: Purple

**PC Games:**
- Valorant
- CS:GO
- Dota 2
- Badge Color: Orange

### Tips for Games

✅ **Do:**
- Use high-quality logos (PNG with transparency)
- Keep game names consistent with official titles
- Add event history to showcase activity
- Update display order to feature popular games

❌ **Don't:**
- Leave logo URL empty
- Duplicate game entries
- Use low-resolution logos

---

## 🏆 MANAGING TOURNAMENTS

### Creating a Tournament

1. Go to **Admin → Tournaments**
2. Click **"Create New Tournament"**
3. Fill in the form:

**Basic Info:**
- **Name:** Tournament title
- **Slogan:** Catchphrase or subtitle
- **Logo:** Tournament logo URL
- **Category:** Casual / Mobile / PC
- **Icon:** Emoji for the game (e.g., 🎮)

**Details:**
- **Description:** Full tournament information
- **Prize Pool:** Prize amount or description
- **Team Size:** Player count (e.g., "5v5", "Solo")
- **Status:** open / closed / upcoming

**Links:**
- **Registration Link:** URL for signup form
- **Rulebook Link:** URL to rules PDF or page

**Partners (JSONB Arrays):**
- **Organizers:** Main organizing partners
- **Co-organizers:** Supporting organizations
- **Associated With:** Related entities

4. **☑ Publish:** Make live on website
5. Click **"Create Tournament"**

### Partner/Organizer Format

Partners are stored as JSON arrays. Use this format:

```javascript
// In the form, add partners like:
[
  {
    "name": "VGS",
    "logo": "/logos/vgs.png"
  },
  {
    "name": "Partner Name",
    "logo": "/logos/partner.png"
  }
]
```

### Tournament Status

- **🟢 Open:** Registration active, show "Register Now"
- **🔴 Closed:** Registration closed, show "Registration Closed"
- **🟡 Upcoming:** Not yet open, show "Coming Soon"

### Tips for Tournaments

✅ **Best Practices:**
- Create tournament page well before event
- Update status as registration opens/closes
- Include clear rules and guidelines
- Add all organizing partners for transparency
- Keep prize pool information updated

---

## 👥 MANAGING COMMITTEE

### Committee Structure

The committee system has two parts:
1. **Committees:** Yearly teams (e.g., "2025 Committee")
2. **Committee Members:** Individual profiles

### Creating a Committee Year

1. Navigate to **Admin → Committee**
2. Under **"Committee Years"**, click **"Add New Committee"**
3. Fill in:
   - **Year:** Committee year (e.g., 2025)
   - **Description:** Brief overview (optional)
4. Click **"Create Committee"**

### Adding Committee Members

1. In **"Committee Members"** section, click **"Add Member"**
2. Fill in the form:

**Personal Info:**
- **Name:** Full name
- **Photo URL:** Member photo path (e.g., `/members/john-doe.jpg`)
- **Faculty/Department:** Academic info (for Faculty Advisors)

**Contact:**
- **Email:** Member's email
- **Phone:** Contact number (optional)
- **Social Media:** Facebook, LinkedIn, GitHub links (optional)

**Role Assignment:**
- **Year:** Select committee year
- **Role:** Position title (President/Vice President/etc.)
- **Category:** 
  - `executive` for Executive Committee
  - `faculty_advisor` for Faculty Advisors
- **Display Order:** Sorting priority (lower = appears first)

3. **☑ Show on Committee Page:** Check to display publicly
4. Click **"Add Member"**

### Member Categories

**Executive Committee (`executive`):**
- President
- Vice President
- General Secretary
- Treasurer
- Event Coordinator
- Technical Lead
- etc.

**Faculty Advisors (`faculty_advisor`):**
- Faculty members
- Academic supervisors
- Department heads

### Multiple Roles Per Member

A member can have multiple roles across years:
1. Add the member once with initial role
2. To add another role, add a new entry with:
   - Same name and photo
   - Different year and role
3. System automatically groups by person

### Member Photo Guidelines

**Requirements:**
- Format: JPG or PNG
- Size: 400x400px (square)
- Location: `/public/members/`
- Naming: `firstname-lastname.jpg`

**Tips:**
- Use professional photos
- Consistent background style
- Good lighting
- Centered face

### Tips for Committee Management

✅ **Best Practices:**
- Update committee at start of each year
- Use consistent photo styles
- Keep contact information current
- Set appropriate display orders
- Mark inactive members as hidden

---

## 💼 MANAGING SPONSORS

### Sponsor vs Collaborator

**Sponsors:** Financial or resource supporters
- Title Sponsor
- Main Sponsor
- Gold/Silver/Bronze Sponsor

**Collaborators:** Partnership-based support
- Media Partner
- Food Partner
- Logistics Partner
- Venue Partner

### Creating a Sponsor/Collaborator

1. Navigate to **Admin → Sponsors**
2. Click **"Add Sponsor"**
3. Fill in the form:

**Basic Info:**
- **Name:** Organization name
- **Logo URL:** Logo path or URL
- **Type:** Sponsor or Collaborator (radio button)

**Categories (NEW - Multiple Selection):**
- **If Sponsor:** Check all applicable:
  - Title Sponsor
  - Main Sponsor
  - Co-Sponsor
  - Gold/Silver/Bronze Sponsor
  - Platinum Sponsor
  - Other (specify custom name)

- **If Collaborator:** Check all applicable:
  - Media Partner
  - Food Partner
  - Logistics Partner
  - Venue Partner
  - Educational Partner
  - Other (specify custom name)

**Custom Category:**
- If "Other" is checked, provide custom name in "Custom Category Name" field

**Details:**
- **Website:** Organization website URL
- **Description:** About the organization
- **Events:** Associated events (array)
- **Social Media:** Facebook, Twitter, Instagram links (JSON)
- **Display Order:** Sorting number (lower = first)

4. **☑ Featured:** Highlight on homepage
5. **☑ Publish:** Make visible publicly
6. Click **"Create Sponsor"**

### Multiple Categories Feature

Sponsors can have **multiple categories**:
- A sponsor can be both "Gold Sponsor" AND "Media Partner"
- Check all applicable boxes
- Categories display as colored badges on public page

### Display Order Strategy

**Recommended ordering:**
```
0-10: Title/Main Sponsors
11-20: Gold Sponsors
21-30: Silver Sponsors
31-40: Bronze Sponsors
50+: Collaborators
```

### Social Media JSON Format

```json
{
  "facebook": "https://facebook.com/sponsor",
  "twitter": "https://twitter.com/sponsor",
  "instagram": "https://instagram.com/sponsor"
}
```

### Tips for Sponsors

✅ **Best Practices:**
- Use high-quality, transparent logos
- Feature top-tier sponsors prominently
- Update logos when partnerships renew
- Include accurate website links
- Showcase featured sponsors on homepage

---

## 📋 MANAGING REGISTRATION FORMS

The Registration Forms Management system allows you to create custom forms for game tournaments, workshops, and events. All submissions are automatically sent to Google Sheets for easy management.

### Understanding the System

**What You Can Do:**
- Create custom registration forms with any fields you need
- Collect submissions automatically in Google Sheets
- Set registration limits and deadlines
- Track submission counts in real-time
- Enable/disable forms instantly

**Form Structure:**
- **Form Details:** Game name, title, description, settings
- **Form Fields:** Custom input fields (text, email, dropdown, etc.)
- **Google Sheet:** Where submissions are stored
- **Status Control:** Active/Inactive toggle

---

### Creating Your First Registration Form

#### Step 1: Setup Google Sheet

Before creating a form, prepare your Google Sheet:

1. **Create a New Google Sheet**
   - Go to [Google Sheets](https://sheets.google.com)
   - Click **"+ Blank"** to create new sheet
   - Name it (e.g., "PUBG Mobile Tournament Registrations")

2. **Set Up the Sheet Structure**
   ```
   Row 1 (Headers): Timestamp | Team Name | Team Leader Name | Team Leader Email | etc.
   ```
   - First column should always be **"Timestamp"**
   - Add headers **exactly matching your form field labels** (case-sensitive)
   - Example: If form field label is "Team Name", header must be "Team Name"

3. **Get the Sheet URL**
   - Click **"Share"** button
   - Change permissions to: **"Anyone with the link can edit"**
   - Copy the full URL (e.g., `https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit`)

4. **Enable Google Apps Script (Required)**
   - In your Google Sheet, go to **Extensions → Apps Script**
   - Delete any existing code
   - Paste this code:
   
   ```javascript
   function doPost(e) {
     try {
       var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
       var data = JSON.parse(e.postData.contents);
       
       // Get headers from first row
       var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
       
       // Create row with timestamp first
       var row = [new Date()];
       
       // Add values matching header order (skip Timestamp column)
       for (var i = 1; i < headers.length; i++) {
         var header = headers[i];
         // Match header with data key (field label)
         row.push(data[header] || '');
       }
       
       // Append the row
       sheet.appendRow(row);
       
       return ContentService.createTextOutput(JSON.stringify({
         status: 'success',
         message: 'Registration successful'
       })).setMimeType(ContentService.MimeType.JSON);
       
     } catch (error) {
       return ContentService.createTextOutput(JSON.stringify({
         status: 'error',
         message: error.toString()
       })).setMimeType(ContentService.MimeType.JSON);
     }
   }
   ```

5. **Deploy the Script**
   - Click **"Deploy"** → **"New deployment"**
   - Click gear icon → Select **"Web app"**
   - Settings:
     * Description: "Registration Form Handler"
     * Execute as: **"Me"**
     * Who has access: **"Anyone"**
   - Click **"Deploy"**
   - Copy the **Web App URL** (you'll need this later)
   - Click **"Authorize access"** and grant permissions

#### Step 2: Create the Form in Admin Panel

1. **Navigate to Registration Forms**
   - Go to **Admin Panel → Registration Forms**
   - Click **"+ Create New Form"** button

2. **Fill in Basic Information**

   ```
   ┌─────────────────────────────────────────────────┐
   │ Game Name *                                     │
   │ [PUBG Mobile                                  ] │
   ├─────────────────────────────────────────────────┤
   │ URL Slug * (auto-generated)                     │
   │ [pubg-mobile                                  ] │
   ├─────────────────────────────────────────────────┤
   │ Form Title *                                    │
   │ [PUBG Mobile Tournament Registration         ] │
   ├─────────────────────────────────────────────────┤
   │ Description                                     │
   │ [Register your team for the upcoming PUBG    ] │
   │ [Mobile tournament. Limited slots available. ] │
   ├─────────────────────────────────────────────────┤
   │ Google Sheet URL * (Web App URL)                │
   │ [https://script.google.com/macros/s/ABC...  ] │
   ├─────────────────────────────────────────────────┤
   │ Max Registrations        Registration Deadline  │
   │ [100              ]      [2025-12-31 23:59   ] │
   ├─────────────────────────────────────────────────┤
   │ ☑ Make form active (users can submit)          │
   └─────────────────────────────────────────────────┘
   ```

   **Field Explanations:**
   - **Game Name:** Display name (e.g., "PUBG Mobile", "Free Fire")
   - **URL Slug:** Auto-generated from game name (pubg-mobile)
   - **Form Title:** Full form title shown to users
   - **Description:** Brief explanation of the registration
   - **Google Sheet URL:** The **Web App URL** from Apps Script deployment
     * Example: `https://script.google.com/macros/s/AKfycby.../exec`
     * Must end with `/exec`
     * Copy from "Deploy" → "Manage deployments" → Web App URL
   - **Max Registrations:** Optional limit (e.g., 100 teams)
   - **Registration Deadline:** Optional cutoff date/time
   - **Is Active:** Toggle to enable/disable submissions

#### Step 3: Add Form Fields

Now add the input fields users will fill:

1. **Click "+ Add Field"** button

2. **Common Field Examples:**

   **Example 1: Team Name (Text Input)**
   ```
   Field Label:      Team Name
   Field Type:       Text
   Placeholder:      Enter your team name
   Help Text:        Choose a unique team name (max 50 characters)
   ☑ Required Field
   ```

   **Example 2: Captain Email (Email Input)**
   ```
   Field Label:      Captain Email Address
   Field Type:       Email
   Placeholder:      captain@example.com
   Help Text:        We'll send confirmation to this email
   ☑ Required Field
   ```

   **Example 3: Phone Number (Phone Input)**
   ```
   Field Label:      Contact Number
   Field Type:       Phone
   Placeholder:      +880 1XXX-XXXXXX
   Help Text:        Include country code
   ☑ Required Field
   ```

   **Example 4: Team Size (Dropdown)**
   ```
   Field Label:      Number of Players
   Field Type:       Dropdown
   Options:          4 Players
                     5 Players
                     6 Players (with substitute)
   ☑ Required Field
   ```

   **Example 5: Player Experience (Radio Buttons)**
   ```
   Field Label:      Team Experience Level
   Field Type:       Radio Buttons
   Options:          Beginner (New to tournaments)
                     Intermediate (Played 1-3 tournaments)
                     Advanced (Regular tournament players)
                     Professional (Competitive team)
   ☑ Required Field
   ```

   **Example 6: Player IDs (Textarea)**
   ```
   Field Label:      Player In-Game IDs
   Field Type:       Textarea
   Placeholder:      Enter one ID per line
   Help Text:        List all player IDs (one per line)
   ☑ Required Field
   ```

   **Example 7: Availability (Checkboxes)**
   ```
   Field Label:      Available Match Days
   Field Type:       Checkboxes
   Options:          Friday Evening
                     Saturday Morning
                     Saturday Evening
                     Sunday Morning
                     Sunday Evening
   Help Text:        Select all days your team can play
   ☑ Required Field
   ```

3. **Available Field Types:**

   | Type | Use Case | Example |
   |------|----------|---------|
   | **Text** | Short single-line input | Team name, player name |
   | **Email** | Email addresses | captain@example.com |
   | **Phone** | Phone numbers | +880 1XXX-XXXXXX |
   | **Number** | Numeric values | Player count, age |
   | **Textarea** | Multi-line text | Player list, special requests |
   | **Dropdown** | Select one from list | Team size, division |
   | **Radio** | Choose one option | Experience level |
   | **Checkbox** | Select multiple | Available days |
   | **Date** | Date picker | Preferred date |
   | **Time** | Time picker | Preferred time slot |

4. **Field Configuration Tips:**

   ✅ **Do:**
   - Mark essential fields as **Required**
   - Add clear **Placeholder** text
   - Provide **Help Text** for complex fields
   - Use **Dropdown/Radio** for predefined options
   - Group related fields together

   ❌ **Don't:**
   - Make everything required (reduces submissions)
   - Use vague labels ("Input 1", "Field A")
   - Forget placeholder text
   - Skip help text for unclear fields

#### Step 4: Complete Form Creation

1. **Review Your Form Fields**
   - Check all fields are in correct order
   - Verify required fields are marked
   - Test field types match data needs

2. **Save the Form**
   - Click **"Save Form"** button
   - Wait for success message: "Registration form created successfully!"

3. **Verify in Google Sheet**
   - Go back to your Google Sheet
   - Check headers **exactly match** your form field labels
   - First column should be "Timestamp"
   - Header names are **case-sensitive** ("Team Name" ≠ "team name")
   
**Example:**
```
Google Sheet Headers:
Timestamp | Team Name | Team Leader Name | Team Leader Email | Team Leader Phone Number

Form Field Labels (must match exactly):
- Team Name
- Team Leader Name  
- Team Leader Email
- Team Leader Phone Number
```

---

### Complete Registration Form Example

**Full Example: PUBG Mobile Tournament**

```
FORM DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Game Name:              PUBG Mobile
URL Slug:               pubg-mobile
Form Title:             PUBG Mobile Championship 2025
Description:            Register your squad for the biggest 
                        PUBG Mobile tournament. Squad format,
                        Rs. 50,000 prize pool!
Google Sheet URL:       https://script.google.com/macros/s/...
Max Registrations:      32 teams
Registration Deadline:  2025-12-15 23:59
Status:                 ☑ Active

FORM FIELDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Team Information Section:
   ┌────────────────────────────────────────┐
   │ Field 1: Team Name                     │
   │ Type: Text                             │
   │ Required: ✅                            │
   │ Placeholder: Enter your team name      │
   │ Help: Choose unique name (max 50 char) │
   └────────────────────────────────────────┘

   ┌────────────────────────────────────────┐
   │ Field 2: Team Tag                      │
   │ Type: Text                             │
   │ Required: ✅                            │
   │ Placeholder: e.g., VGS, 4AM, TSM       │
   │ Help: 2-5 characters clan tag          │
   └────────────────────────────────────────┘

2. Captain Information:
   ┌────────────────────────────────────────┐
   │ Field 3: Captain Name                  │
   │ Type: Text                             │
   │ Required: ✅                            │
   │ Placeholder: Full name                 │
   └────────────────────────────────────────┘

   ┌────────────────────────────────────────┐
   │ Field 4: Captain Email                 │
   │ Type: Email                            │
   │ Required: ✅                            │
   │ Placeholder: captain@example.com       │
   │ Help: Confirmation sent to this email  │
   └────────────────────────────────────────┘

   ┌────────────────────────────────────────┐
   │ Field 5: Captain Phone                 │
   │ Type: Phone                            │
   │ Required: ✅                            │
   │ Placeholder: +880 1XXX-XXXXXX          │
   │ Help: Include country code             │
   └────────────────────────────────────────┘

   ┌────────────────────────────────────────┐
   │ Field 6: Captain In-Game ID            │
   │ Type: Number                           │
   │ Required: ✅                            │
   │ Placeholder: 1234567890                │
   │ Help: Your PUBG Mobile player ID       │
   └────────────────────────────────────────┘

3. Team Roster:
   ┌────────────────────────────────────────┐
   │ Field 7: Number of Players             │
   │ Type: Dropdown                         │
   │ Required: ✅                            │
   │ Options:                               │
   │   - 4 Players (No substitute)          │
   │   - 5 Players (With substitute)        │
   └────────────────────────────────────────┘

   ┌────────────────────────────────────────┐
   │ Field 8: All Player In-Game IDs        │
   │ Type: Textarea                         │
   │ Required: ✅                            │
   │ Placeholder: Enter one ID per line     │
   │ Help: List all 4-5 player IDs          │
   └────────────────────────────────────────┘

   ┌────────────────────────────────────────┐
   │ Field 9: All Player IGNs               │
   │ Type: Textarea                         │
   │ Required: ✅                            │
   │ Placeholder: Enter one name per line   │
   │ Help: In-game names matching IDs above │
   └────────────────────────────────────────┘

4. Team Details:
   ┌────────────────────────────────────────┐
   │ Field 10: Team Experience Level        │
   │ Type: Radio Buttons                    │
   │ Required: ✅                            │
   │ Options:                               │
   │   ○ New Team (First tournament)        │
   │   ○ Beginner (1-3 tournaments)         │
   │   ○ Intermediate (4-10 tournaments)    │
   │   ○ Advanced (10+ tournaments)         │
   │   ○ Professional (Regular competitors) │
   └────────────────────────────────────────┘

   ┌────────────────────────────────────────┐
   │ Field 11: Previous Tournament Names    │
   │ Type: Textarea                         │
   │ Required: ❌                            │
   │ Placeholder: List previous tournaments │
   │ Help: Optional, helps with seeding     │
   └────────────────────────────────────────┘

5. Schedule Availability:
   ┌────────────────────────────────────────┐
   │ Field 12: Available Match Times        │
   │ Type: Checkboxes                       │
   │ Required: ✅                            │
   │ Options:                               │
   │   ☐ Friday 6-8 PM                      │
   │   ☐ Friday 8-10 PM                     │
   │   ☐ Saturday 2-4 PM                    │
   │   ☐ Saturday 4-6 PM                    │
   │   ☐ Saturday 6-8 PM                    │
   │   ☐ Sunday 2-4 PM                      │
   │   ☐ Sunday 4-6 PM                      │
   │ Help: Select ALL times you can play    │
   └────────────────────────────────────────┘

6. Agreement:
   ┌────────────────────────────────────────┐
   │ Field 13: Terms Acceptance             │
   │ Type: Checkboxes                       │
   │ Required: ✅                            │
   │ Options:                               │
   │   ☐ I agree to tournament rules        │
   │   ☐ I confirm all info is accurate     │
   │   ☐ I accept fair play guidelines      │
   └────────────────────────────────────────┘
```

---

### Managing Existing Forms

#### Viewing Forms

The forms list shows:
- **Game Name & Title**
- **Status:** 🟢 Active / ⚪ Inactive
- **Form Fields Count:** Number of fields
- **Submissions:** Current submission count
- **Max Registrations:** If set
- **Deadline:** If set

#### Editing a Form

1. Find the form in the list
2. Click **"Edit"** button
3. Modify any field:
   - Change form details
   - Add/edit/remove form fields
   - Update settings
4. Click **"Save Form"**

**Note:** Editing form fields after receiving submissions may cause data inconsistency in Google Sheets.

#### Activating/Deactivating Forms

**To Toggle Status:**
- Click the **Active/Inactive** button on form card
- Active forms accept submissions
- Inactive forms show "Registration Closed" message

**Use Cases:**
- Deactivate when registration is full
- Deactivate after deadline passes
- Temporarily disable for maintenance

#### Viewing Form Preview

1. Click **"View"** button on form card
2. Opens in new tab: `/register/[game-slug]`
3. See exactly what users see
4. Test form submission (optional)

#### Copying Registration Link

1. Click the **📋 (clipboard)** button on form card
2. Registration link automatically copied to clipboard
3. Share link with participants via:
   - Email
   - Social media
   - WhatsApp
   - Website
   
**Registration Link Format:**
```
https://your-domain.com/register/game-slug
Example: https://vgs.com/register/pubg-mobile
```

**Share Link Tips:**
- ✅ Use short URLs for social media
- ✅ Include deadline information when sharing
- ✅ Mention available slots
- ✅ Add tournament details in caption

#### Viewing Submissions

All submissions are stored in your Google Sheet:

1. Open the Google Sheet you linked
2. Each row = one submission
3. Columns match your form fields
4. First column shows timestamp

**Google Sheet Features:**
- Sort by any column
- Filter submissions
- Export to Excel/CSV
- Share with team members
- Use Google Forms for analysis

#### Deleting Forms

⚠️ **Warning:** This deletes the form AND all submission records from database.

1. Find the form to delete
2. Click **"Delete"** button
3. Confirm deletion
4. Form and submissions removed

**Note:** This does NOT delete your Google Sheet. Your Google Sheet data is safe.

---

### Best Practices for Registration Forms

#### Form Design

✅ **Do:**
- Start with essential fields only
- Group related fields together
- Use clear, descriptive labels
- Add helpful placeholder text
- Provide help text for complex fields
- Use appropriate field types
- Make only crucial fields required
- Test form before publishing

❌ **Don't:**
- Ask for unnecessary information
- Use technical jargon in labels
- Make everything required
- Forget to set max registrations
- Skip deadline dates
- Use generic field names

#### Google Sheets Setup

✅ **Do:**
- Name sheets descriptively
- Set proper sharing permissions ("Anyone can edit")
- Add column headers matching form fields
- Keep "Timestamp" as first column
- Deploy Apps Script as described
- Test with dummy submission
- Backup sheet regularly

❌ **Don't:**
- Use restricted sharing permissions
- Forget to deploy Apps Script
- Change column order after launch
- Delete timestamp column
- Share edit link publicly

#### Managing Submissions

✅ **Do:**
- Check submissions regularly
- Respond to participants promptly
- Monitor approaching limits
- Close registration when full
- Send confirmation emails
- Keep backup of submissions
- Update form status accordingly

❌ **Don't:**
- Ignore submission limits
- Leave forms open indefinitely
- Forget to notify participants
- Lose access to Google Sheets
- Delete forms with active registrations

#### Troubleshooting Common Issues

**Problem: Submissions not appearing in Google Sheet**
- **Solution:** 
  1. **Check Web App URL:** Must be the deployment URL ending with `/exec`, not the sheet URL
  2. **Verify Headers:** Sheet headers must **exactly match** form field labels (case-sensitive)
     - Example: "Team Name" in form → "Team Name" in sheet header
  3. **Check Sharing:** Google Sheet must be "Anyone with link can edit"
  4. **Test Apps Script:** In Apps Script editor, click **Deploy → Test deployments**
  5. **Redeploy if needed:** Deploy → Manage deployments → Edit (pencil icon) → Version: New version → Deploy
  6. **Check Browser Console:** Open form page, press F12, check Console tab for errors
  7. **Manual Test:** In Apps Script, click **Run → doPost** (might show authorization needed)
  
**Common Mistakes:**
- ❌ Using sheet URL instead of Web App URL
- ❌ Headers don't match field labels exactly
- ❌ Sheet permissions not set to "Anyone can edit"
- ❌ Forgot to authorize Apps Script
- ❌ Field labels have extra spaces or different capitalization

**Problem: Form shows "Registration Closed"**
- **Solution:**
  1. Check form status (must be Active)
  2. Check deadline hasn't passed
  3. Check max registrations not reached
  4. Toggle status off and on again

**Problem: Field options not showing**
- **Solution:**
  1. Edit the field
  2. Ensure options are entered (one per line)
  3. Save field and form again

**Problem: Can't delete form**
- **Solution:**
  1. Ensure you're logged in as admin
  2. Try refreshing page
  3. Check browser console for errors
  4. Contact developer if issue persists

---

### Registration Form Workflow

**Complete Process from Start to Finish:**

```
STEP 1: PREPARATION
├── Create Google Sheet
├── Add column headers
├── Set up Apps Script
├── Deploy as Web App
└── Copy Web App URL

STEP 2: FORM CREATION
├── Go to Admin Panel → Registration Forms
├── Click "Create New Form"
├── Fill in form details
├── Paste Google Sheet Web App URL
├── Set max registrations & deadline
└── Make form active

STEP 3: ADD FORM FIELDS
├── Click "+ Add Field"
├── Configure field (label, type, required)
├── Add placeholder & help text
├── Save field
├── Repeat for all fields
└── Arrange fields in logical order

STEP 4: TESTING
├── Save complete form
├── Click "View Form"
├── Fill in test submission
├── Check data appears in Google Sheet
├── Verify all fields work correctly
└── Test required field validation

STEP 5: LAUNCH
├── Share registration link with students
├── Monitor submission count
├── Check Google Sheet regularly
├── Respond to participants
└── Close when limit reached

STEP 6: POST-REGISTRATION
├── Export Google Sheet data
├── Process participant information
├── Send confirmation emails
├── Deactivate form
└── Keep form for records
```

---

### Quick Reference: Field Types

```
TEXT INPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use for: Names, titles, short text
Example: Team Name, Player Name
Max Length: ~255 characters

EMAIL INPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use for: Email addresses
Validation: Automatic email format check
Example: captain@example.com

PHONE INPUT  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use for: Phone numbers
Example: +880 1XXX-XXXXXX
Note: No automatic validation

NUMBER INPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use for: Numeric values
Example: Age, Player ID
Validation: Numbers only

TEXTAREA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use for: Long text, lists
Example: Player IDs, Comments
Rows: Multi-line input

DROPDOWN (SELECT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use for: Single choice from list
Example: Team Size, Division
Options: Defined in field settings

RADIO BUTTONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use for: Single choice, visible options
Example: Experience Level
Better UX than dropdown for <5 options

CHECKBOXES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use for: Multiple selections
Example: Available days, Terms agreement
Users can select multiple

DATE PICKER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use for: Date selection
Example: Preferred match date
Format: YYYY-MM-DD

TIME PICKER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use for: Time selection
Example: Preferred time slot
Format: HH:MM
```

---

## ⚙️ SITE SETTINGS

### Accessing Settings

1. Navigate to **Admin → Settings**
2. View all site-wide configurations

### Available Settings

**Partnership Information:**
- **Partnership Brochure URL:** Google Drive link to brochure
- **Contact Email:** Partnership email address
- **Contact Phone:** Partnership phone number
- **WhatsApp Number:** WhatsApp contact

**Social Media Links:**
- Facebook page URL
- Instagram profile URL
- Twitter/X handle
- LinkedIn company page
- Discord server invite

**General Settings:**
- Site title
- Site description
- Maintenance mode (coming soon)

### Updating Settings

1. Find the setting you want to change
2. Click **"Edit"**
3. Update the value
4. Click **"Save Changes"**

**Settings take effect immediately** on the public website.

---

## ✅ BEST PRACTICES

### Content Quality

**Writing:**
- Use proper grammar and spelling
- Keep sentences clear and concise
- Proofread before publishing
- Use active voice

**Images:**
- Optimize file sizes (compress images)
- Use consistent dimensions
- Name files descriptively
- Use web-friendly formats (JPG, PNG, WebP)

### Publishing Strategy

**Before Going Live:**
1. Fill in all required fields
2. Preview content if possible
3. Check images load correctly
4. Verify dates and times
5. Test links open correctly

**After Publishing:**
1. View on public website
2. Check on mobile device
3. Share on social media
4. Monitor engagement

### Regular Maintenance

**Weekly:**
- Update upcoming activity statuses
- Check and close expired forms
- Review new registrations
- Update homepage featured content

**Monthly:**
- Archive old updates
- Update committee contact info
- Refresh sponsor information
- Review analytics (if available)

**Yearly:**
- Create new committee year
- Update committee members
- Archive previous year's content
- Plan next year's activities

---

## 🎯 COMMON TASKS

### Task: Announce New Event

1. Create activity in **Activities**
2. Set status to "upcoming"
3. Check "Featured" to highlight
4. Create update in **Updates** with announcement
5. Share on social media

### Task: Open Tournament Registration

1. Create tournament in **Tournaments**
2. Set status to "open"
3. Add registration link
4. Create registration form in **Forms**
5. Create update announcing it

### Task: Update Committee for New Year

1. Create new committee year
2. Add new members with roles
3. Update display orders
4. Mark old members as hidden (optional)
5. Update homepage if needed

### Task: Add New Sponsor

1. Get sponsor logo and information
2. Create sponsor in **Sponsors**
3. Set appropriate category and order
4. Check "Featured" if major sponsor
5. Publish immediately

### Task: Close Registration

1. Go to **Registration Forms**
2. Find the form
3. Change status to "closed"
4. Update in **Activities** or **Tournaments** if linked
5. Create update announcing closure

---

## 🆘 TROUBLESHOOTING

### Can't Login

**Solutions:**
1. Verify email and password
2. Check if email is confirmed in Supabase
3. Try password reset
4. Contact system administrator

### Images Not Showing

**Check:**
1. File exists in `/public/` folder
2. Path starts with `/` (e.g., `/logos/logo.png`)
3. File name matches exactly (case-sensitive)
4. Image format is supported (JPG, PNG, WebP)

### Can't Save Content

**Possible Causes:**
1. Required fields are empty
2. Network connection issue
3. Session expired (logout and login again)
4. Database permission issue

**Solutions:**
- Check browser console for errors (F12)
- Verify all required fields are filled
- Refresh page and try again
- Contact technical support if persists

### Content Not Appearing on Public Site

**Verify:**
1. ☑ "Publish" checkbox is checked
2. Content saved successfully
3. Refresh public page (Ctrl+F5)
4. Check if you're viewing correct page

---

## 📚 ADDITIONAL RESOURCES

**For Technical Issues:** Contact system administrator  
**For Content Guidelines:** Refer to organization style guide  
**For System Updates:** Check `SETUP_AND_DEPLOYMENT.md`  
**For Development:** See `DEVELOPER_GUIDE.md`

---

## 🔒 SECURITY REMINDERS

- 🔐 Never share admin credentials
- 👁️ Always logout when finished
- ⏰ Session expires after inactivity
- 🔄 Change password regularly
- 📱 Use strong, unique passwords
- ✅ Enable two-factor authentication (if available)

---

**Admin Guide maintained by:** VGS Development Team  
**Last updated:** November 18, 2025  
**Version:** 3.0.0

**Need Help?** Contact your technical administrator or refer to technical documentation.
