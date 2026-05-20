# 404 ERROR TROUBLESHOOTING GUIDE

## What Does 404 Mean?

**"Failed to load resource: the server responded with a status of 404"**

This means the resource (API endpoint or file) was not found on the server.

---

## Step 1: Identify WHICH Request is Failing 🎯

### Check Browser Developer Tools

1. **Open DevTools**: Press `F12`
2. **Go to Network tab**
3. **Reload the page** (Ctrl+R or Cmd+R)
4. **Look for failed requests** (red text)
5. **Find the 404 request** and click on it
6. **Check the URL** that was requested

### Common 404 URLs to Check

| URL                          | Meaning                    |
| ---------------------------- | -------------------------- |
| `/.netlify/functions/server` | Backend API not responding |
| `/api/auth/register`         | Registration endpoint 404  |
| `/api/auth/login`            | Login endpoint 404         |
| `/static/css/...`            | CSS file missing           |
| `/static/js/...`             | JavaScript file missing    |

---

## Step 2: Is It a Frontend File or API Call? 🔍

### If URL starts with `/static/...`

**Problem**: Frontend build files missing
**Solution**:

1. Netlify Dashboard → Deploys
2. Click latest deploy
3. Check build logs for errors
4. Look for: "npm run build" success/failure
5. If failed: Check React/npm errors

### If URL starts with `/api/...`

**Problem**: Backend API not found
**Solution**: See Steps 3-5 below

---

## Step 3: Test API Health Check 🏥

### Test 1: Is the API running?

**Local**:

```bash
curl http://localhost:5001/
```

**Production**:

```bash
curl https://your-site.netlify.app/.netlify/functions/server/
```

**Expected response**:

```json
{ "message": "✅ Health Easy Portal API running", "version": "3.0.0" }
```

**If 404**: Backend not deployed or routes not loading

### Test 2: Check Netlify Functions

1. Go to Netlify Dashboard
2. Select your site
3. Go to **Functions** tab
4. Look for `server` function listed
5. Click on it to see logs

**If not listed**: Functions directory not found or not built

---

## Step 4: Check Netlify Configuration 📋

### Verify netlify.toml

File should have:

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
  node_bundler = "esbuild"
```

**If missing or wrong**: Update netlify.toml and push

### Verify File Exists

- ✅ File: `backend/netlify/functions/server.js` should exist
- ✅ It should export: `module.exports.handler = ...`

---

## Step 5: Check Build Logs 🔧

### View Netlify Build Log

1. Netlify Dashboard
2. **Deploys** tab
3. Click most recent deploy
4. Look for errors:

**Look for these patterns**:

✅ **Good**:

```
npm run build
✓ npm
✓ npm run build
Deploying functions
```

❌ **Bad**:

```
Command failed
npm ERR!
Cannot find module
ENOENT: no such file or directory
```

---

## Step 6: Common 404 Causes & Fixes ⚙️

### Cause 1: Routes Not Importing

**Error in logs**: `Cannot find module` or `ENOENT`

**Fix**:

```bash
cd backend
npm install
```

Then push:

```bash
git add .
git commit -m "Fix: Install dependencies"
git push
```

### Cause 2: Database Initialization Error

**Error in logs**: `EACCES: permission denied` or `database is locked`

**Fix**: Already applied - database won't block API startup

### Cause 3: Environment Variables Missing

**Error in logs**: `JWT_SECRET is not defined`

**Fix**:

1. Netlify Dashboard → Settings
2. Build & Deploy → Environment
3. Add these variables:
   - `FRONTEND_URL=https://your-site.netlify.app`
   - `JWT_SECRET=healthportal_super_secret_key_2024`
   - `GEMINI_API_KEY=your_api_key`

### Cause 4: Function Timeout

**Error in logs**: `Function timeout` or takes >10 seconds

**Fix**:

- Check database operations are efficient
- Consider increasing function timeout in netlify.toml:
  ```toml
  [functions.server]
    timeout = 30
  ```

### Cause 5: CORS Issues

**Error in browser**: `CORS policy blocked`

**Fix**:

1. Update `FRONTEND_URL` environment variable
2. Ensure it's your exact Netlify URL

---

## Step 7: Local vs Production Testing 🧪

### Test Locally First

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Should show: ✅ Connected to SQLite database
# Should show: 🏥 Health Easy Portal Server on http://localhost:5001

# Terminal 2: Frontend
cd frontend
npm start
# Should show: Compiled successfully
```

**Test API**:

```bash
curl http://localhost:5001/
# Should return: {"message":"✅ Health Easy Portal API running"...}
```

If local 404: Issue is in code
If local works but production 404: Issue is in deployment config

---

## Step 8: Debug Checklist ✅

### Before Pushing to Production

- [ ] Backend runs locally: `npm run dev` works
- [ ] Frontend runs locally: `npm start` works
- [ ] API responds locally: `curl http://localhost:5001/` works
- [ ] No errors in local terminal
- [ ] All files exist: `backend/netlify/functions/server.js`
- [ ] netlify.toml is correct
- [ ] All routes can be imported (no module errors)

### After Pushing to Production

- [ ] Netlify build completes (no red X)
- [ ] Functions shows `server` function
- [ ] API health check: `curl https://your-site/.netlify/functions/server/` works
- [ ] No CORS errors in browser console
- [ ] Specific API endpoints respond

---

## Step 9: Specific API Endpoint Tests 🔗

### Test Registration Endpoint

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123"}'
```

**Expected**: 201 or 400 (not 404)

### Test Login Endpoint

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

**Expected**: 200 or 401 (not 404)

### If Getting 404 on These

- Routes not loaded in `server.js`
- Module imports failing
- Check `backend/netlify/functions/server.js` routes list

---

## Emergency Fixes (Try These First) 🚨

### Fix 1: Reinstall Dependencies

```bash
cd backend
rm -r node_modules package-lock.json
npm install
git add .
git commit -m "Fix: Reinstall dependencies"
git push
```

### Fix 2: Rebuild Frontend

```bash
cd frontend
npm run build
git add .
git commit -m "Fix: Rebuild frontend"
git push
```

### Fix 3: Make Repo Public

1. GitHub → Settings → Visibility → Public
2. Netlify auto-rebuilds

### Fix 4: Trigger Manual Deploy

1. Netlify Dashboard → Deploys
2. Click "Trigger deploy"
3. Wait for build to complete

---

## Getting Help 💡

### Share This Information

When asking for help, provide:

1. **Exact error from browser console** (copy/paste)
2. **URL of the failing request** (from Network tab)
3. **Netlify build log errors** (last 10 lines)
4. **Local test result** (does `curl http://localhost:5001/` work?)

### Check Files

- [ ] `backend/netlify/functions/server.js` exists
- [ ] `netlify.toml` has correct configuration
- [ ] `backend/package.json` has all dependencies
- [ ] Environment variables set in Netlify

---

## Success Indicators ✅

You know it's fixed when:

- ✅ `curl https://your-site/.netlify/functions/server/` returns API message
- ✅ No 404 errors in browser Network tab
- ✅ Registration/Login buttons work
- ✅ Dashboard loads after login
- ✅ No console errors (F12 → Console)

---

**Last Updated**: May 20, 2026
**Next Step**: Run the diagnostic commands above and share the results
