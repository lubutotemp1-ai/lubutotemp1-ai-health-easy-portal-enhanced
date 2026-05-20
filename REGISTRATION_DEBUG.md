# REGISTRATION DEBUGGING GUIDE

## Problem: "Registration failed. Please try again."

This error can have multiple causes. Use this guide to identify and fix the issue.

---

## Step 1: Check Browser Console (🔴 Start Here)

1. **Open Developer Tools**:
   - Press `F12` or right-click → "Inspect"

2. **Go to Console Tab**
   - Look for red error messages
   - Look for network errors

3. **Common Errors You Might See**:

### ❌ Error: "Failed to fetch" or "Network Error"

**Cause**: Backend API not responding
**Fix**:

- Ensure backend is running locally: `npm run dev` in backend folder
- For Netlify: Check if environment variables are set correctly

### ❌ Error: "CORS policy: No 'Access-Control-Allow-Origin'"

**Cause**: Backend CORS not configured for your domain
**Fix**:

- Netlify: Set `FRONTEND_URL=https://your-site.netlify.app` in environment
- Local: Ensure backend is running on `http://localhost:5001`

### ❌ Error: "Server error during registration: ..."

**Cause**: Backend is responding with error details (this is good!)
**Fix**: Read the error message and check Step 3

---

## Step 2: Check Network Tab

1. **In DevTools, go to Network tab**

2. **Fill registration form and click Submit**

3. **Look for request to** `/api/auth/register`

4. **Check the response**:

   **Good Response (Status 201)**:

   ```json
   {
     "message": "Account created!",
     "token": "eyJhbGc...",
     "user": {
       "id": 1,
       "name": "John",
       "email": "john@example.com",
       "role": "patient"
     }
   }
   ```

   **Bad Response**:
   - Status 400: Check error message (missing required field)
   - Status 409: Email already exists
   - Status 500: Server error (check backend logs)

---

## Step 3: Check Backend Logs

### Local Development

When you run `npm run dev` in backend folder, logs appear in the terminal:

**What to look for**:

```
📝 Registration attempt for: john@example.com
🔐 Password hashed, inserting user...
✅ User created with ID: 1
```

**Or errors**:

```
❌ Registration error: ENOENT: no such file or directory
❌ Registration error: database is locked
```

### Production (Netlify)

1. Go to **Netlify Dashboard**
2. Select your site
3. Go to **Functions** tab
4. Look at the logs for `/api/auth/register` calls
5. Check for error messages

---

## Step 4: Check API Endpoint

### Test 1: API Health Check

```bash
# Local
curl http://localhost:5001/

# Production (replace with your URL)
curl https://your-site.netlify.app/.netlify/functions/server/
```

**Should respond with**:

```json
{ "message": "✅ Health Easy Portal API running", "version": "3.0.0" }
```

**If not responding**: Backend is not running or not deployed correctly

### Test 2: Test Registration Directly

```bash
# Local
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "password":"password123",
    "phone":"+1234567890"
  }'

# Production
curl -X POST https://your-site.netlify.app/.netlify/functions/server/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "password":"password123",
    "phone":"+1234567890"
  }'
```

---

## Step 5: Validate Form Data

### Required Fields

- ✅ **Name**: Not empty
- ✅ **Email**: Valid email format
- ✅ **Password**: At least 6 characters

### Optional Fields

- Phone: Any format (combined with country code)
- Date of Birth: Any valid date
- Blood Type: A+, A-, B+, B-, AB+, AB-, O+, O-

### Common Issues

**Issue**: "Password must be at least 6 characters"
**Fix**: Enter a password with 6+ characters

**Issue**: "Name, email, and password are required"
**Fix**: Fill in all required fields (marked with \*)

**Issue**: "An account with this email already exists"
**Fix**: Use a different email address

---

## Step 6: Check Environment Configuration

### Frontend (.env.local)

```env
REACT_APP_API_URL=
```

- Should be **empty** for production (uses relative paths)
- Should be **empty** for local development (axios will use default baseURL)

### Backend (.env)

```env
PORT=5001
JWT_SECRET=healthportal_super_secret_key_2024
GEMINI_API_KEY=your_api_key
FRONTEND_URL=http://localhost:3000  # or https://your-site.netlify.app
```

**Netlify Environment Variables** (Settings → Build & Deploy → Environment):

- `FRONTEND_URL`: Your deployed Netlify URL
- `JWT_SECRET`: Secret key for JWT tokens
- `GEMINI_API_KEY`: Your Gemini API key

---

## Step 7: Database Issues

### Issue: "database is locked"

**Cause**: SQLite database file is being accessed by multiple processes
**Fix**:

- Local: Delete `backend/db/health_portal.db` and restart backend
- Production: Netlify serverless can't use SQLite - migrate to MongoDB

### Issue: "no such table: users"

**Cause**: Database not initialized
**Fix**:

- Local: Restart backend - it will create tables automatically
- Production: Ensure database initialization runs

---

## Troubleshooting Checklist

### For Local Development

- [ ] Backend running: `npm run dev` in `backend` folder
- [ ] Frontend running: `npm start` in `frontend` folder
- [ ] No network errors in console (F12 → Network)
- [ ] API responds: `curl http://localhost:5001/`
- [ ] Database file exists: `backend/db/health_portal.db`
- [ ] Form has name, email, password (6+ chars)

### For Netlify Production

- [ ] Build logs show no errors
- [ ] Environment variables set (FRONTEND_URL, JWT_SECRET, GEMINI_API_KEY)
- [ ] API responds: `curl https://your-site.netlify.app/.netlify/functions/server/`
- [ ] Netlify Functions logs show no errors
- [ ] No CORS errors in browser console
- [ ] Deployed site is public or properly authenticated

---

## Error Messages & Solutions

| Error                            | Cause               | Solution                               |
| -------------------------------- | ------------------- | -------------------------------------- |
| "Network error"                  | Backend not running | Start backend with `npm run dev`       |
| "CORS policy error"              | CORS not configured | Set FRONTEND_URL in environment        |
| "Cannot POST /api/auth/register" | Wrong API URL       | Check REACT_APP_API_URL setting        |
| "database is locked"             | SQLite conflict     | Restart backend or delete DB file      |
| "email already exists"           | Email in use        | Use different email                    |
| "password too short"             | < 6 characters      | Use password with 6+ characters        |
| "Server error: ..."              | Backend error       | Read error message, check backend logs |

---

## Success Test

1. ✅ Fill registration form with unique email
2. ✅ Click Register
3. ✅ No errors in browser console
4. ✅ Redirects to login page
5. ✅ Can login with registered credentials
6. ✅ Dashboard shows after login

---

## Getting Help

1. **Check this guide** for your specific error
2. **Check browser console** (F12 → Console) for error details
3. **Check backend logs** for server-side errors
4. **Check Netlify logs** for deployment issues
5. **Test API directly** with curl commands above

---

## Debug Commands

### Check Backend Status

```bash
cd backend
npm run dev
# Should show: ✅ Connected to SQLite database
# Should show: 🏥 Health Easy Portal Server on http://localhost:5001
```

### Test API Manually

```bash
# Check API is running
curl http://localhost:5001/

# Try registration
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'

# Try login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### Check Database

```bash
# Local - verify database file exists
ls -la backend/db/health_portal.db

# Check tables
sqlite3 backend/db/health_portal.db ".tables"
```

---

**Last Updated**: May 20, 2026
**For errors not listed**: Check browser console and backend logs for detailed error messages
