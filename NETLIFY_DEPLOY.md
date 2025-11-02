# Netlify Deployment Guide

This guide will help you deploy the Want To Watch app to Netlify.

## Prerequisites

1. A Netlify account (sign up at https://www.netlify.com)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Push Your Code to GitHub/GitLab/Bitbucket

Make sure your code is in a Git repository:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository

### 3. Configure Build Settings

Netlify should auto-detect Next.js, but verify these settings:

- **Build command:** `npm run build`
- **Publish directory:** `.next` (or leave empty - Netlify Next.js plugin handles this)
- **Node version:** `20` (or latest LTS)

### 4. Add Environment Variables

In Netlify, go to **Site settings** → **Environment variables** and add all your `.env.local` variables:

#### Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZW5qb3llZC1vYXJmaXNoLTM3LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_Fs4X363ALgvVqMRua9MTiXOKnMr8qzEbTkGZfdvIBI
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

#### Supabase Database
```
NEXT_PUBLIC_SUPABASE_URL=https://hqtfrnttfybbeclpjzbv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxdGZybnR0ZnliYmVjbHBqemJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA4MzMwOSwiZXhwIjoyMDc3NjU5MzA5fQ.BAyO8E2Aqcua7Qd7pvbwukVGqiVwhZo9HHtW0B2-Sn0
```

#### TMDB API
```
TMDB_API_KEY=7ec3be0071a0e916a3ace156b5a03be9
```

**⚠️ Important:** Make sure to set these for **Production** environment (or all environments if you want them for previews too).

### 5. Update Clerk Settings

After deployment, update your Clerk application settings:

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Domains** or **Settings** → **Domains**
4. Add your Netlify domain (e.g., `your-app.netlify.app` or your custom domain)
5. Update the callback URLs if needed

### 6. Deploy

1. Click **Deploy site** in Netlify
2. Wait for the build to complete
3. Your site will be live at `https://your-app-name.netlify.app`

## Troubleshooting

### Build Fails
- Check the build logs in Netlify dashboard
- Verify all environment variables are set correctly
- Make sure Node version is set to 20

### Clerk Authentication Issues
- Ensure your Netlify domain is added in Clerk dashboard
- Check that all Clerk environment variables are set
- Verify callback URLs match your Netlify domain

### Database Connection Issues
- Verify Supabase environment variables are correct
- Check that Supabase allows connections from Netlify IPs (usually automatic)

## Custom Domain

To add a custom domain:
1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Follow the DNS configuration instructions
4. Update your Clerk dashboard with the custom domain

## Continuous Deployment

Once connected, Netlify will automatically deploy:
- New commits to your main branch
- Pull request previews
- Manual deployments can be triggered from the Netlify dashboard

