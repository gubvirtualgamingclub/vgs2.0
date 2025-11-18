# 🔐 VGS 2.0 Admin Security - Quick Reference

---

## ⚡ QUICK ACCESS

### Login URL
```
https://your-domain.com/[YOUR-SECRET-PATH]/auth
```

### Default Secret Path
```
x-admin-control
```

⚠️ **CHANGE THIS IMMEDIATELY IN PRODUCTION!**

---

## 🔑 FIRST-TIME SETUP (2 Minutes)

### Step 1: Change Secret Path
Edit `.env.local`:
```bash
ADMIN_SECRET_PATH=your-unique-path-2024
NEXT_PUBLIC_ADMIN_SECRET_PATH=your-unique-path-2024
```

### Step 2: Add Your Email
Edit `.env.local`:
```bash
ADMIN_ALLOWED_EMAILS=youremail@vgs.edu
```

### Step 3: Update robots.txt
Edit `public/robots.txt`:
```
Disallow: /your-unique-path-2024
Disallow: /your-unique-path-2024/*
```

### Step 4: Create Admin User in Supabase
1. Go to Supabase Dashboard
2. Authentication → Users → Add user
3. Enter email & password
4. Save

### Step 5: Deploy & Test
```bash
npm run build
npm run start
```

Visit: `http://localhost:3000/your-unique-path-2024/auth`

---

## 🛡️ SECURITY FEATURES

✅ **Route Obfuscation** - Hidden admin path  
✅ **Old /admin Blocked** - Returns 404  
✅ **Middleware Protection** - Edge-level security  
✅ **Email Whitelist** - Only approved users  
✅ **Failed Login Lockout** - 5 attempts = 5 min lockout  
✅ **Session Management** - Supabase auth  
✅ **SEO Blocking** - No search engine indexing  
✅ **Security Headers** - X-Frame-Options, etc.

---

## 🆘 EMERGENCY: CLEAR LOCKOUT

If locked out after failed attempts, open browser console (F12) and run:

```javascript
localStorage.removeItem('admin_lockout_time');
localStorage.removeItem('admin_login_attempts');
location.reload();
```

---

## 🚀 HOW IT WORKS

```
User tries to access admin
        ↓
Middleware checks route
        ↓
/admin? → Return 404 ❌
        ↓
/secret-path? → Check auth
        ↓
Not logged in? → Redirect to login
        ↓
Logged in? → Check email whitelist
        ↓
Not in list? → Return 404 ❌
        ↓
In list? → Grant access ✅
```

---

## 🔍 TROUBLESHOOTING

### Can't login?
```bash
# Check email is whitelisted
# Check Supabase user exists
# Clear browser cache/cookies
# Try incognito mode
```

### Getting 404?
```bash
# Verify secret path in .env.local matches URL
# Check middleware.ts is deployed
# Verify env vars in production dashboard
```

### Account locked?
```bash
# Wait 5 minutes
# OR clear localStorage: localStorage.clear()
```

---

## 📱 ADMIN ROUTES

All routes use your secret path:

```
/[secret]/              → Dashboard
/[secret]/auth          → Login
/[secret]/updates       → Updates management
/[secret]/activities    → Activities management
/[secret]/games         → Games management
/[secret]/tournaments   → Tournaments management
/[secret]/registration-forms → Forms management
/[secret]/committee     → Committee management
/[secret]/sponsors      → Sponsors management
/[secret]/settings      → Site settings
```

---

## 🔐 ADDING NEW ADMIN

1. **Supabase:** Add user in Authentication
2. **.env.local:** Add email to ADMIN_ALLOWED_EMAILS
3. **Deploy:** Push changes to production
4. **Share:** Send secret URL securely

---

## 🚨 EMERGENCY: Compromised Access

```bash
# 1. Change secret path immediately
ADMIN_SECRET_PATH=emergency-new-path-2024

# 2. Clear whitelist
ADMIN_ALLOWED_EMAILS=only-you@vgs.edu

# 3. Reset passwords in Supabase

# 4. Deploy immediately
git push
```

---

## 📊 MONITORING

**Check these regularly:**
- Failed login attempts (browser console)
- 404 attempts to /admin (Vercel logs)
- Unusual access times (Supabase logs)

---

## 💡 PRO TIPS

1. Use password manager for admin credentials
2. Change secret path every 6 months
3. Remove inactive admins from whitelist
4. Enable 2FA in Supabase (when available)
5. Monitor logs weekly
6. Keep Next.js & dependencies updated

---

## 📚 FULL DOCUMENTATION

See `ADMIN_SECURITY_GUIDE.md` for:
- Complete security implementation details
- Deployment checklist
- Incident response procedures
- Architecture diagrams
- Best practices

---

## 🆘 NEED HELP?

**Security Issue:** Contact admin immediately  
**Access Request:** Email with justification  
**Bug Report:** Create GitHub issue (no security details)

---

**Last Updated:** November 18, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅
