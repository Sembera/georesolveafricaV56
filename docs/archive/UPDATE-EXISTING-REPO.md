# Update Existing GitHub Repository

Since you already have a GitHub repository, follow these steps to update it with your latest changes.

## Step 1: Check Your Current Git Status

Open terminal in your project folder and run:

```bash
git status
```

This shows what files have changed since your last commit.

## Step 2: Check Remote Repository

Verify your GitHub repository is connected:

```bash
git remote -v
```

You should see something like:
```
origin  https://github.com/YOUR-USERNAME/repository-name.git (fetch)
origin  https://github.com/YOUR-USERNAME/repository-name.git (push)
```

## Step 3: Add All Your Changes

Add all the updated files:

```bash
git add .
```

This includes:
- Updated `index.html` (with darkened hero image)
- Updated `projects.html`, `resources.html`, `news.html` (with footer-styles.css linked)
- `footer-styles.css` (with horizontal scrolling animation)
- `contentful.js` (with environment variable support)
- New `DEPLOYMENT-GUIDE.md`
- All other files

## Step 4: Commit Your Changes

Create a commit with a descriptive message:

```bash
git commit -m "Update website: fix clients section, add footer animation, darken hero image, add deployment guide"
```

## Step 5: Push to GitHub

Push your changes to GitHub:

```bash
git push origin main
```

**Note**: If your default branch is named `master` instead of `main`, use:
```bash
git push origin master
```

## Step 6: Verify on GitHub

1. Go to your GitHub repository in your browser
2. Refresh the page
3. Check that your latest commit appears at the top
4. Verify the files show your recent changes

## What Happens Next?

### If Already Deployed on Netlify:

✅ **Automatic Deployment**:
- Netlify detects the new commit automatically
- Starts building and deploying your site
- Usually takes 1-3 minutes
- Your live site updates automatically
- **No manual intervention needed!**

You can watch the deployment:
1. Go to Netlify dashboard
2. Click on your site
3. Go to "Deploys" tab
4. You'll see the new deployment in progress

### If NOT Yet Deployed on Netlify:

Follow the deployment guide in `DEPLOYMENT-GUIDE.md` starting from Section 2 (Deploy to Netlify).

## Troubleshooting

### Issue: "Your branch is behind 'origin/main'"

Someone else pushed changes, or you made changes on GitHub directly. Sync first:

```bash
git pull origin main
```

Then try pushing again.

### Issue: "failed to push some refs"

Your local repository is out of sync. Pull first:

```bash
git pull origin main --rebase
git push origin main
```

### Issue: Authentication Failed

If using HTTPS, you may need to use a Personal Access Token instead of password:

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Give it `repo` permissions
4. Copy the token
5. Use it as your password when prompted

**OR** switch to SSH authentication (more permanent):

```bash
git remote set-url origin git@github.com:YOUR-USERNAME/repository-name.git
```

### Issue: Wrong Remote URL

If `git remote -v` shows the wrong repository, update it:

```bash
git remote set-url origin https://github.com/YOUR-USERNAME/correct-repository-name.git
```

## Checking Deployment Status on Netlify

After pushing to GitHub, check Netlify:

1. Log into [Netlify](https://app.netlify.com)
2. Click on your site
3. Go to **Deploys** tab
4. You should see:
   - **Building** → deployment in progress
   - **Published** → deployment successful ✅
   - **Failed** → click for error details

## Summary

**Quick Reference Commands:**

```bash
# 1. Check status
git status

# 2. Add all changes
git add .

# 3. Commit changes
git commit -m "Your descriptive message here"

# 4. Push to GitHub
git push origin main

# 5. Check it worked
git status
```

That's it! Your GitHub repository is now updated, and if connected to Netlify, your live site will update automatically within minutes.
