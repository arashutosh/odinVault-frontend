# Google OAuth Setup Guide

## Backend Configuration

1. **Set up Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Set authorized redirect URIs:
     - `http://localhost:3000/auth/google/callback` (for development)
     - `https://yourdomain.com/auth/google/callback` (for production)

2. **Configure Backend Environment Variables:**
   ```bash
   # Add to your backend .env file
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
   ```

3. **Run Database Migration:**
   ```bash
   cd backend
   npx prisma migrate dev --name add_google_oauth
   npm run db:seed
   ```

## Frontend Configuration

The frontend is already configured to work with Google OAuth! Here's what's been added:

### New Components:
- `GoogleButton` - A styled Google OAuth button
- `GoogleCallback` - Handles OAuth callback

### Updated Components:
- `Login` - Now includes Google OAuth button
- `Register` - Now includes Google OAuth button
- `Button` - Added outline variant for Google button

### New API Methods:
- `authApi.googleAuth()` - Authenticate with Google ID token
- `authApi.getGoogleAuthUrl()` - Get Google OAuth URL

### Updated Hooks:
- `useAuth` - Now includes Google authentication

## How It Works

1. **User clicks "Continue with Google"**
2. **Frontend requests OAuth URL from backend**
3. **Popup opens with Google OAuth flow**
4. **User authenticates with Google**
5. **Google redirects to callback page**
6. **Callback page stores token and closes popup**
7. **Frontend sends token to backend for verification**
8. **Backend creates/updates user and returns JWT**
9. **User is logged in!**

## Testing

1. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Visit the login page** - You should see the "Continue with Google" button

4. **Click the button** - It should open a popup with Google OAuth

## Troubleshooting

### Button not showing:
- Check that all components are imported correctly
- Verify the build completed successfully

### OAuth popup not working:
- Make sure popups are allowed in your browser
- Check that the Google OAuth credentials are configured correctly
- Verify the redirect URI matches exactly

### Authentication fails:
- Check the browser console for errors
- Verify the backend is running and accessible
- Check that the Google OAuth environment variables are set

## Production Deployment

For production, make sure to:

1. **Update Google OAuth redirect URIs** to your production domain
2. **Set production environment variables** in your backend
3. **Update the frontend API base URL** to point to your production backend
4. **Configure CORS** on your backend to allow your production frontend domain

## Security Notes

- The Google OAuth flow is secure and follows OAuth 2.0 standards
- ID tokens are verified on the backend before creating/updating users
- JWT tokens are used for subsequent API requests
- All sensitive data is handled server-side
