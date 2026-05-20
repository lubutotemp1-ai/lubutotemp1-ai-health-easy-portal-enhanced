# NETLIFY DEPLOYMENT FIX GUIDE

## Problem

Backend features (login, register, API calls) are not responding on Netlify deployment.

## Root Causes

1. **Database Issue**: SQLite doesn't persist on Netlify's serverless functions (ephemeral filesystem)
2. **API Configuration**: Frontend may not have correct API base URL
3. **Environment Variables**: Missing FRONTEND_URL for CORS on deployed URL

---

## IMMEDIATE FIXES (Required for Login/Register to Work)

### Step 1: Update Netlify Environment Variables

1. Go to Netlify dashboard
2. Select your site → Settings → Build & Deploy → Environment
3. Add/Update these variables:

```
FRONTEND_URL=https://your-site-name.netlify.app
JWT_SECRET=healthportal_super_secret_key_2024
GEMINI_API_KEY=AIzaSyDqXV4Lb_uglgwG0g0wWgKvm_NWmn5Dg58
```

**For production database (optional but recommended):**

```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/health_easy_portal?retryWrites=true&w=majority
```

### Step 2: Update netlify.toml (if needed)

Ensure your `netlify.toml` looks like this:

```toml
[build]
  base = "frontend"
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server/:splat"
  status = 200

[functions]
  directory = "backend/netlify/functions"
```

### Step 3: Trigger a Rebuild

1. Push changes to GitHub:

   ```bash
   git add .
   git commit -m "Fix: Update environment configuration for Netlify"
   git push
   ```

2. Netlify will automatically rebuild and deploy
3. Check the build logs: Site → Deploys → View deploy log

---

## DATABASE MIGRATION (For Data Persistence)

### Why This Matters

- **SQLite on Netlify**: Database file gets lost after each function execution
- **Solution**: Use MongoDB Atlas (free tier available)

### MongoDB Setup (5 minutes)

1. **Sign Up**: https://www.mongodb.com/cloud/atlas
2. **Create Project** → **Build Database** → **M0 (Free)**
3. **Security Quick Start**:
   - Create database user (save username/password)
   - Click "Add My Current IP Address" or "Allow Access from Anywhere"
4. **Connect**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Add database name: `health_easy_portal`

Example connection string:

```
mongodb+srv://healthuser:mypassword123@cluster.mongodb.net/health_easy_portal?retryWrites=true&w=majority
```

### Update Backend for MongoDB

**File**: `backend/db/database.js`

Replace SQLite usage with MongoDB driver (requires code update):

```bash
npm install mongoose
```

Then update the database.js file to use Mongoose.

---

## TESTING AFTER DEPLOYMENT

### Test 1: Check API Health

```bash
curl https://your-site.netlify.app/.netlify/functions/server/
# Should return: {"message":"✅ Health Easy Portal API running","version":"3.0.0"}
```

### Test 2: Test Registration

1. Visit https://your-site.netlify.app
2. Click "Register"
3. Fill in details and submit
4. Check browser console (F12 → Console) for errors
5. Should redirect to login page

### Test 3: Test Login

1. Click "Login"
2. Use email: `patient@test.com`, password: `password123`
3. Should show dashboard or any errors in console

### Test 4: Check Netlify Logs

1. Netlify Dashboard → Functions
2. Look for any error logs
3. Check deployment build logs for issues

---

## COMMON ERROR MESSAGES & FIXES

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause**: FRONTEND_URL not set correctly in backend .env
**Fix**: Update FRONTEND_URL to your exact Netlify URL in Netlify environment variables

### Error: "Cannot POST /api/auth/login"

**Cause**: Routes not loading or API not deployed
**Fix**:

- Check Netlify Functions: Site → Functions
- Verify `backend/netlify/functions/server.js` exists and has `module.exports.handler`

### Error: "JWT_SECRET is not defined"

**Cause**: Environment variable not set
**Fix**: Add JWT_SECRET to Netlify environment variables

### Error: "EACCES: permission denied" on database file

**Cause**: SQLite trying to write to read-only filesystem
**Fix**: Migrate to MongoDB (required for production)

---

## FRONTEND CONFIGURATION

### .env.local Settings

```env
# Leave empty to use relative paths (connects to same domain)
REACT_APP_API_URL=

# Netlify automatically routes /api/* to /.netlify/functions/server
# Thanks to netlify.toml redirects
```

### How It Works

1. Frontend makes request to `/api/auth/login`
2. Netlify redirect rule: `/api/*` → `/.netlify/functions/server/*`
3. Serverless function handles the request
4. Response sent back to frontend

---

## MONITORING & DEBUGGING

### Check Netlify Functions Logs

1. Site Dashboard → Functions
2. Click on specific function calls to see logs
3. Timestamps show when functions were invoked

### Check Frontend Errors

1. Open deployed site
2. Press F12 to open DevTools
3. Network tab: Check failed requests
4. Console tab: Look for error messages

### Check Backend Health

```bash
# Should respond with version info
curl https://your-site.netlify.app/.netlify/functions/server/

# Should fail with 404 (confirms API is running)
curl https://your-site.netlify.app/.netlify/functions/server/api/invalid-route
```

---

## NEXT STEPS

1. ✅ Update Netlify environment variables
2. ✅ Trigger rebuild (push to GitHub or manually redeploy)
3. ✅ Test API endpoints
4. ✅ Test login/register functionality
5. ⏭️ (Optional) Migrate to MongoDB for data persistence
6. ⏭️ (Optional) Set up CI/CD for automated tests

---

## PRODUCTION CHECKLIST

- [ ] FRONTEND_URL set to correct Netlify domain
- [ ] JWT_SECRET set to random string (not default)
- [ ] GEMINI_API_KEY valid and set
- [ ] netlify.toml has correct redirects
- [ ] Backend functions deployed and working
- [ ] Frontend .env.local configured
- [ ] Test login works
- [ ] Test register works
- [ ] Test health tracker features
- [ ] Check console for no errors
- [ ] Database solution planned (MongoDB or similar)

---

## SUPPORT

If issues persist:

1. Check Netlify deployment logs
2. Check browser DevTools (F12)
3. Verify all environment variables are set
4. Try rebuilding: Netlify → Trigger deploy
5. Check GitHub repo is up to date with all changes
