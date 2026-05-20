# QUICK START - FIXING BACKEND API ON NETLIFY

## What's Wrong?

Your app deployed but login/register and backend API aren't working. This is because:

1. SQLite database doesn't persist on serverless functions
2. Frontend API URL needs configuration
3. Environment variables aren't set in Netlify

## 5-Minute Fix ⚡

### Step 1: Push Code Changes (Already Done ✅)

```bash
git add .
git commit -m "Fix: Configure backend for Netlify deployment"
git push
```

### Step 2: Configure Netlify Environment Variables (5 min)

1. Open Netlify Dashboard
2. Select your site
3. Go to **Settings** → **Build & Deploy** → **Environment**
4. Click **Edit variables**
5. Add these 3 variables:

| Variable         | Value                                     |
| ---------------- | ----------------------------------------- |
| `FRONTEND_URL`   | `https://your-site-name.netlify.app`      |
| `JWT_SECRET`     | `healthportal_super_secret_key_2024`      |
| `GEMINI_API_KEY` | `AIzaSyDqXV4Lb_uglgwG0g0wWgKvm_NWmn5Dg58` |

**Replace `your-site-name` with your actual Netlify site name!**

### Step 3: Trigger Rebuild (1 min)

Option A: Push to GitHub

```bash
git push
```

Option B: Rebuild in Netlify

- Netlify Dashboard → **Deploys** → **Trigger deploy** → **Deploy site**

### Step 4: Test (2 min)

1. Wait for deploy to complete
2. Visit your Netlify URL
3. Try to register a new account
4. If it works, you're done! ✅

---

## If It Still Doesn't Work 😞

### Troubleshooting Steps

**Step 1: Check API Health**

```bash
# Replace with your URL
curl https://your-site.netlify.app/.netlify/functions/server/
```

Should respond with:

```json
{ "message": "✅ Health Easy Portal API running", "version": "3.0.0" }
```

**Step 2: Check Netlify Logs**

1. Netlify Dashboard
2. **Functions** tab
3. Look for error messages
4. **Deploys** → View deploy log

**Step 3: Check Browser Console**

1. Visit your site
2. Press F12 (DevTools)
3. Go to **Console** tab
4. Try to register/login
5. Look for red error messages

**Step 4: Verify Environment Variables**

1. Netlify Dashboard → Settings → Environment
2. Confirm all 3 variables are set
3. Values should exactly match requirements

---

## For Production (Database Persistence) 📊

**Optional but Recommended**: Migrate from SQLite to MongoDB

This requires additional setup but ensures data persists:

1. **Create MongoDB Account**: https://www.mongodb.com/cloud/atlas
2. **Get Connection String**: (See NETLIFY_FIX_GUIDE.md for full steps)
3. **Add to Netlify Environment**:
   ```
   DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/health_easy_portal
   ```
4. **Update backend code** to use MongoDB (requires code changes)

---

## Files Updated/Created 📁

✅ `backend/.env` - Environment configuration
✅ `frontend/.env.local` - Frontend configuration  
✅ `README.md` - Complete setup documentation
✅ `NETLIFY_FIX_GUIDE.md` - Detailed troubleshooting guide
✅ `.gitignore` - Protection for sensitive files

---

## Next Steps

1. Update Netlify environment variables
2. Trigger rebuild
3. Test login/register
4. If working: celebrate! 🎉
5. If not: Check troubleshooting guide or NETLIFY_FIX_GUIDE.md

---

## Quick Reference - Your Environment Variables

**For Netlify Settings:**

```
FRONTEND_URL: https://YOUR-SITE.netlify.app
JWT_SECRET: healthportal_super_secret_key_2024
GEMINI_API_KEY: AIzaSyDqXV4Lb_uglgwG0g0wWgKvm_NWmn5Dg58
```

**For Production (Optional):**

```
DATABASE_URL: mongodb+srv://username:password@cluster.mongodb.net/health_easy_portal
```

---

**Need more help?** See `NETLIFY_FIX_GUIDE.md` or `README.md`
