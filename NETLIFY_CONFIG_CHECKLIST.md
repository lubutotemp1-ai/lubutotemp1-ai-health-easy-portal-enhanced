# NETLIFY CONFIGURATION VERIFICATION CHECKLIST

## Before Deployment ✓

- [ ] Git repository pushed to GitHub with all changes
- [ ] `netlify.toml` exists in project root
- [ ] `backend/netlify/functions/server.js` exists
- [ ] All necessary dependencies in `package.json`

---

## Netlify Dashboard Configuration

### Step 1: Environment Variables

**Settings → Build & Deploy → Environment → Edit variables**

Add these 3 variables:

```
FRONTEND_URL = https://YOUR-SITE-NAME.netlify.app
JWT_SECRET = healthportal_super_secret_key_2024
GEMINI_API_KEY = AIzaSyDqXV4Lb_uglgwG0g0wWgKvm_NWmn5Dg58
```

**⚠️ IMPORTANT**: Replace `YOUR-SITE-NAME` with your actual Netlify site name!

**To find your site name**:

- Netlify Dashboard
- Your site is listed under "Sites"
- Site name is shown at the top (format: `site-name.netlify.app`)
- Or check Site settings → General → Site name

### Step 2: Build Settings

**Settings → Build & Deploy → Build command**

Should automatically be:

```
npm run build
```

**Base directory**: `frontend`
**Publish directory**: `frontend/build`

### Step 3: Functions

**Settings → Build & Deploy → Functions**

Directory should be: `backend/netlify/functions`

### Step 4: Domain

**Settings → Domain management**

- Site can be accessed at `your-site-name.netlify.app`
- Add custom domain if you have one

---

## Verification Testing

### Test 1: Build Logs

1. **Deploys** → Click most recent deploy
2. Look for:
   - ✅ "npm run build" completes successfully
   - ✅ "Netlify Lambda" builds functions
   - ✅ No red error messages

### Test 2: API Health

```bash
# Replace your-site-name with your actual site
curl https://your-site-name.netlify.app/.netlify/functions/server/
```

Expected response:

```json
{ "message": "✅ Health Easy Portal API running", "version": "3.0.0" }
```

### Test 3: Register

1. Open `https://your-site-name.netlify.app`
2. Click "Register"
3. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Country: Select any
4. Click Register
5. Expected: Redirects to login page with success message

### Test 4: Login

1. Email: `test@example.com` (or your registered email)
2. Password: `password123`
3. Click Login
4. Expected: Shows dashboard

### Test 5: Functions Logs

1. **Functions** tab
2. Look for function calls:
   - Should show `/api/auth/register` calls
   - Should show `/api/auth/login` calls
   - No red error messages

---

## Common Configuration Issues

### Issue: Functions Not Deploying

**Check**:

- `backend/netlify/functions/server.js` exists
- `netlify.toml` has `functions` directory set
- `backend/package.json` has correct dependencies

**Fix**:

- Rebuild: Netlify → Trigger deploy
- Check deploy logs for errors

### Issue: Environment Variables Not Working

**Check**:

- Variables exactly spelled in Netlify dashboard
- No extra spaces in values
- Special characters properly escaped

**Test**:

```bash
# In build logs, should see variables
curl https://your-site/.netlify/functions/server/
```

### Issue: CORS Errors

**Check**:

- `FRONTEND_URL` set to exact Netlify URL
- Includes `https://` prefix
- No trailing slash

**Fix**:

- Update FRONTEND_URL in Netlify environment
- Redeploy site

---

## Monitoring After Deployment

### Check Daily

- [ ] Deploy logs for errors
- [ ] Functions tab for crashes
- [ ] User reports of issues

### Check Weekly

- [ ] Function performance metrics
- [ ] Error rates trending up/down
- [ ] Database size (if using MongoDB)

### Monitor Features

- Netlify Dashboard → Site Analytics
- Netlify Dashboard → Functions → Invocations
- Backend logs in Functions tab

---

## Rollback Plan

If deployment fails:

1. **Revert to previous commit**

   ```bash
   git revert HEAD
   git push
   ```

2. **Netlify auto-redeploys** from GitHub

3. **Or manually**:
   - Netlify Dashboard → Deploys
   - Find last successful deploy
   - Click "Trigger deploy" on that version

---

## Performance Optimization

### Netlify Functions

- Cold starts: ~5 seconds first time
- Warm starts: ~100ms after
- Consider: Pre-warm functions or upgrade plan

### Frontend

- Production build: ~2-5 seconds
- Caching: Browser caches JS/CSS automatically
- Consider: Use CDN for images

### Database

- SQLite: Can't use (no persistence)
- MongoDB: Free tier sufficient for development
- Consider: Upgrade if users > 1000/month

---

## Security Checklist

- [ ] No `.env` files committed to Git
- [ ] All secrets in Netlify environment variables
- [ ] `FRONTEND_URL` exact domain (no wildcards)
- [ ] JWT_SECRET changed from default
- [ ] API keys limited in scope where possible
- [ ] HTTPS enabled (automatic on netlify.app)

---

## Support Resources

- Netlify Docs: https://docs.netlify.com
- Build Logs: Check Netlify Dashboard → Deploys
- Function Logs: Check Netlify Dashboard → Functions
- Error Messages: Google the error + Netlify
- Community: https://answers.netlify.com

---

## Quick Reference

| Setting             | Value                        |
| ------------------- | ---------------------------- |
| Build Command       | `npm run build`              |
| Base Directory      | `frontend`                   |
| Publish Directory   | `frontend/build`             |
| Functions Directory | `backend/netlify/functions`  |
| Framework           | React                        |
| Backend             | Node.js/Express (serverless) |

---

## Success Indicators ✅

You'll know it's working when:

- ✅ Deploy logs show no errors
- ✅ `https://your-site.netlify.app` loads
- ✅ Register form works
- ✅ Login works
- ✅ Dashboard shows after login
- ✅ Browser console has no red errors
- ✅ Health tracker can save data
- ✅ Chat messages send/receive

---

**Version**: 1.0
**Last Updated**: May 20, 2026
