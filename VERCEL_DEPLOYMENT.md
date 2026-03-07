# Vercel Deployment Guide

This guide will help you deploy VocabArena to Vercel, the optimal platform for Next.js applications.

## Why Vercel?

- **Built by Next.js creators** - First-class Next.js support
- **Zero configuration** - Automatic detection and optimization
- **Better performance** - Optimized for SSR, API routes, middleware, and edge functions
- **Seamless Supabase integration** - Works perfectly with your database
- **Free tier** - Generous limits for development and small projects

## Prerequisites

1. A GitHub account with your VocabArena repository
2. A Vercel account (sign up at [vercel.com](https://vercel.com))
3. Your Supabase environment variables from `.env.local`

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select your VocabArena repository from the list
4. Vercel will automatically detect that it's a Next.js application

### 2. Configure Environment Variables

Before deploying, add your environment variables:

1. In the Vercel project setup, scroll to **"Environment Variables"**
2. Add the following variables from your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important:** Make sure to add these for all environments (Production, Preview, Development)

### 3. Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Build your Next.js application
   - Deploy to a production URL
   - Set up automatic deployments for future commits

### 4. Configure Supabase Redirect URLs

After deployment, update your Supabase authentication settings:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > URL Configuration**
3. Add your Vercel URLs to the allowed redirect URLs:
   - `https://your-project.vercel.app/auth/callback`
   - `https://your-project.vercel.app/auth/confirm`
   - `https://your-project.vercel.app/**` (wildcard for all auth routes)

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to your main/master branch
- **Preview**: Every pull request gets its own preview URL
- **Development**: Optional branch deployments

## Custom Domain (Optional)

To add a custom domain:

1. Go to your Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Follow the DNS configuration instructions
5. Update Supabase redirect URLs to include your custom domain

## Environment Variables Management

To update environment variables after deployment:

1. Go to your Vercel project
2. Navigate to **Settings > Environment Variables**
3. Add, edit, or delete variables
4. Redeploy for changes to take effect

## Monitoring and Logs

Vercel provides:
- **Real-time logs** - View deployment and runtime logs
- **Analytics** - Track performance and usage
- **Error tracking** - Monitor and debug issues

Access these from your Vercel project dashboard.

## Troubleshooting

### Build Failures

If your build fails:
1. Check the build logs in Vercel dashboard
2. Ensure all environment variables are set correctly
3. Verify your `package.json` scripts are correct
4. Test the build locally: `npm run build`

### Authentication Issues

If authentication doesn't work:
1. Verify Supabase redirect URLs include your Vercel domain
2. Check that environment variables are set for production
3. Ensure `NEXT_PUBLIC_` prefix is used for client-side variables

### API Route Errors

If API routes fail:
1. Check that `SUPABASE_SERVICE_ROLE_KEY` is set
2. Verify API routes have `export const dynamic = 'force-dynamic'`
3. Review function logs in Vercel dashboard

## Performance Optimization

Vercel automatically optimizes:
- Image optimization via Next.js Image component
- Automatic code splitting
- Edge caching
- Serverless function deployment

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

## Next Steps

After successful deployment:
1. Test all authentication flows
2. Verify game links work correctly
3. Test teacher and student dashboards
4. Monitor performance in Vercel analytics
5. Set up custom domain (optional)

Your VocabArena application is now live and will automatically deploy with every code push!
