# Deployment Workflow Guide

This document explains how to use the staging/preview workflow for VocaBarena.

## Overview

We use a **two-branch workflow** to ensure changes are tested before going live:

- **`dev` branch**: Development and testing
- **`main` branch**: Production (live website)

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│  1. Make changes in 'dev' branch                        │
│     ↓                                                    │
│  2. Netlify auto-creates preview deployment             │
│     ↓                                                    │
│  3. Test on preview URL                                 │
│     ↓                                                    │
│  4. If approved → Merge to 'main' → Goes live          │
│     If issues → Fix in 'dev' → Test again              │
└─────────────────────────────────────────────────────────┘
```

## Branch Structure

### Dev Branch (Testing)
- **Purpose**: All new changes and features are made here first
- **URL**: `https://dev--vocabarena.netlify.app` (or similar)
- **Safe to break**: Issues here don't affect the live site

### Main Branch (Production)
- **Purpose**: The stable, live version of your website
- **URL**: Your main domain (e.g., `https://vocabarena.netlify.app`)
- **Always stable**: Only receives tested and approved changes

## Workflow Steps

### Step 1: Making Changes (Development)

All changes are made in the `dev` branch:

```bash
# Ensure you're on dev branch
git checkout dev

# Make your changes to files
# (Henosia will do this for you)

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin dev
```

### Step 2: Automatic Preview Deployment

Once pushed to GitHub:
- Netlify automatically detects the push
- Builds and deploys to the dev preview URL
- You'll receive a notification with the preview URL

### Step 3: Testing

Visit your preview URL to test:
- Check all functionality works correctly
- Test on different devices if needed
- Verify no bugs or issues

### Step 4: Deploying to Production

If everything looks good:

```bash
# Switch to main branch
git checkout main

# Merge dev into main
git merge dev

# Push to production
git push origin main
```

Netlify will automatically deploy to your live site.

### Step 5: If Issues Found

If you find problems during testing:

```bash
# Stay on dev branch
git checkout dev

# Make fixes
# (Henosia will do this)

# Commit and push
git add .
git commit -m "Fix: description of fix"
git push origin dev

# Test again on preview URL
```

## Quick Reference Commands

```bash
# Check current branch
git branch

# Switch to dev branch
git checkout dev

# Switch to main branch
git checkout main

# See what changed
git status

# View commit history
git log --oneline

# Undo last commit (if needed)
git reset --soft HEAD~1
```

## Netlify Configuration

The `netlify.toml` file is configured to:
- Build both `main` and `dev` branches
- Create automatic preview deployments
- Use the Next.js plugin for optimal performance

## Important Notes

⚠️ **Never commit directly to `main`**: Always work in `dev` first

✅ **Always test before merging**: Use the preview URL to verify changes

🔄 **Keep branches in sync**: Regularly merge `main` back into `dev` if needed

## Troubleshooting

### Preview not updating?
- Check Netlify dashboard for build status
- Ensure changes were pushed to GitHub
- Wait a few minutes for build to complete

### Merge conflicts?
```bash
git checkout dev
git pull origin main
# Resolve conflicts in files
git add .
git commit -m "Resolve merge conflicts"
git push origin dev
```

### Need to rollback production?
```bash
git checkout main
git revert HEAD
git push origin main
```

## Support

If you encounter issues with the deployment workflow, check:
1. Netlify build logs
2. GitHub repository status
3. This documentation

---

**Last Updated**: November 3, 2025
