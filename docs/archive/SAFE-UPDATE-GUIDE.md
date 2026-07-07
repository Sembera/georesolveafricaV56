# Safe GitHub Update Guide
## When You Have a New Folder and Existing Repository

Since you have your updated files in a NEW folder and an EXISTING GitHub repository, follow this guide carefully.

---

## Understanding the Situation

**You have:**
- ✅ Existing GitHub repository (with old website files)
- ✅ New local folder: `D:\GeoResolve\Website\NEW GEORESOLVE _ OK COMPT` (with updated files)
- ❌ New folder is NOT connected to your GitHub repository yet

**Goal:** Replace old files in GitHub with new files, cleanly and safely.

---

## Option A: Clean Replace (RECOMMENDED for Major Updates)

This completely replaces the old files with new files while preserving Git history.

### Step 1: Backup Your Old Repository (Safety First!)

1. Go to your GitHub repository in browser
2. Click **Code** → **Download ZIP**
3. Save it somewhere safe as backup
4. Name it something like `georesolve-backup-2025-12-01.zip`

### Step 2: Clone Your Existing Repository to a NEW Location

Open Command Prompt or Terminal and run:

```bash
# Navigate to a temporary location (NOT your current folders)
cd D:\GeoResolve\Website

# Clone your repository
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git temp-update

# Enter the cloned folder
cd temp-update
```

Replace:
- `YOUR-USERNAME` with your GitHub username
- `YOUR-REPO-NAME` with your repository name

### Step 3: Delete Old Files (Except Git Folder)

**IMPORTANT**: Keep the `.git` folder, delete everything else.

#### On Windows:
```bash
# Delete all files EXCEPT .git folder
# First, make sure you can see hidden files
attrib -h .git

# Then delete everything except .git
for /d %G in (*) do if /i not "%G"==".git" rd /s /q "%G"
del /q * 2>nul
```

#### On Mac/Linux:
```bash
# Delete all files except .git
find . -mindepth 1 -maxdepth 1 -not -name '.git' -exec rm -rf {} +
```

#### Manual Method (Safer for Beginners):
1. Open the `temp-update` folder in File Explorer
2. Show hidden files (View → Hidden items)
3. Select ALL files and folders EXCEPT `.git`
4. Press Delete
5. Verify only `.git` folder remains

### Step 4: Copy All New Files Into the Repository

```bash
# Copy everything from your NEW folder to temp-update folder
xcopy "D:\GeoResolve\Website\NEW GEORESOLVE _ OK COMPT\*" "D:\GeoResolve\Website\temp-update\" /E /H /Y

# Or use File Explorer:
# 1. Open: D:\GeoResolve\Website\NEW GEORESOLVE _ OK COMPT
# 2. Select ALL files and folders (Ctrl+A)
# 3. Copy (Ctrl+C)
# 4. Open: D:\GeoResolve\Website\temp-update
# 5. Paste (Ctrl+V)
# 6. Choose "Replace" if prompted
```

**IMPORTANT**: Make sure you don't copy the `.git` folder from the new location!

### Step 5: Review What Changed

```bash
cd D:\GeoResolve\Website\temp-update

# See what files changed
git status

# See detailed changes (optional)
git diff
```

You should see:
- Modified files (M)
- New files (?)
- Deleted files (D)

### Step 6: Add, Commit, and Push

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "Major update: fix clients/footer sections, add animations, improve SEO, darken hero image

- Fixed clients section display on all pages
- Added horizontal scrolling animation to client logos
- Linked footer-styles.css to projects, resources, news pages
- Darkened hero image to obscure faces (copyright)
- Updated Contentful integration with environment variable support
- Added comprehensive deployment guides
- Optimized footer spacing
- Updated all placeholder images with actual resources"

# Push to GitHub
git push origin main
```

**Note**: If your branch is `master`, use `git push origin master`

### Step 7: Verify on GitHub

1. Go to your GitHub repository
2. Refresh the page
3. Check that files are updated
4. Old files should be replaced with new files

### Step 8: Clean Up

Once verified, you can:
1. Delete the `temp-update` folder (you don't need it anymore)
2. Keep using your original new folder: `D:\GeoResolve\Website\NEW GEORESOLVE _ OK COMPT`

---

## Option B: Initialize Git in Your Current Folder

This connects your current new folder directly to GitHub.

### Step 1: Check if Git is Already Initialized

```bash
cd "D:\GeoResolve\Website\NEW GEORESOLVE _ OK COMPT"

# Check for git
git status
```

**If you see**: "fatal: not a git repository"
- Git is NOT initialized → Continue to Step 2

**If you see**: "On branch main" or file changes
- Git IS initialized → Skip to Step 3

### Step 2: Initialize Git (if needed)

```bash
git init
```

### Step 3: Add Your Existing Repository as Remote

```bash
# Add your GitHub repository
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Verify it's added
git remote -v
```

### Step 4: Fetch Current Repository State

```bash
# Download info about remote repository (doesn't change your files)
git fetch origin

# See what branches exist
git branch -a
```

### Step 5: Force Push Your New Files

**⚠️ WARNING**: This OVERWRITES everything in GitHub with your local files.

```bash
# Add all your files
git add .

# Commit
git commit -m "Complete website update with all improvements"

# Force push (overwrites GitHub)
git push -f origin main
```

**IMPORTANT**:
- Only use `-f` (force) if you're SURE you want to replace everything
- Make sure you have a backup of old files first!
- If branch is `master`, use: `git push -f origin master`

---

## Option C: Manual File Replacement via GitHub Web Interface

If you're not comfortable with command line:

### Step 1: Delete Old Files on GitHub

1. Go to your GitHub repository
2. For each file/folder you want to replace:
   - Click on it
   - Click the trash icon (Delete this file)
   - Commit the deletion
3. Repeat until old files are gone

### Step 2: Upload New Files

1. In your GitHub repository, click **Add file** → **Upload files**
2. Drag all files from `D:\GeoResolve\Website\NEW GEORESOLVE _ OK COMPT`
3. Write commit message: "Upload updated website files"
4. Click **Commit changes**

**Note**: This method works but loses detailed Git history.

---

## What Happens to Old Files?

### With Option A or B:
- ✅ Old files are **replaced** with new files
- ✅ Git history is **preserved** (you can see old versions if needed)
- ✅ GitHub shows a commit with all the changes
- ✅ You can revert to old version if something goes wrong

### With Option C:
- ⚠️ Old files are **deleted** permanently
- ⚠️ Git history shows deletion + new upload (less clean)
- ⚠️ Harder to track what actually changed

---

## What Happens on Netlify?

**If already connected to GitHub:**

1. Netlify detects the push to GitHub
2. Automatically starts new deployment
3. Downloads new files from GitHub
4. Deploys them to your live site
5. Old files are completely replaced
6. Your site updates within 1-3 minutes

**Old files on Netlify are automatically replaced** - no manual action needed!

---

## Summary of File Handling

| Location | What Happens |
|----------|--------------|
| **GitHub Repository** | Old files replaced with new files via push |
| **Your Old Local Folder** | Unchanged (you can delete it later) |
| **Your New Local Folder** | Becomes your working directory |
| **Netlify Deployment** | Automatically rebuilds with new files from GitHub |

---

## Recommended Steps (In Order)

1. ✅ **Backup**: Download ZIP of current GitHub repository
2. ✅ **Clone**: Clone repository to `temp-update` folder
3. ✅ **Clean**: Delete all files except `.git` folder
4. ✅ **Copy**: Copy all files from new folder to `temp-update`
5. ✅ **Commit**: `git add .` → `git commit` → `git push`
6. ✅ **Verify**: Check GitHub shows updated files
7. ✅ **Watch**: Monitor Netlify auto-deploy
8. ✅ **Test**: Visit live site and verify changes
9. ✅ **Cleanup**: Delete `temp-update` folder

---

## Quick Reference Commands

```bash
# 1. Backup (download from GitHub web interface)

# 2. Clone repository
cd D:\GeoResolve\Website
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git temp-update
cd temp-update

# 3. Delete old files (keep .git)
# Use File Explorer - delete everything except .git folder

# 4. Copy new files
xcopy "D:\GeoResolve\Website\NEW GEORESOLVE _ OK COMPT\*" . /E /H /Y

# 5. Commit and push
git add .
git commit -m "Major website update with all improvements"
git push origin main

# 6. Cleanup
cd ..
rmdir /s /q temp-update
```

---

## Need Help?

If you run into issues:
1. Don't panic - your files are safe locally
2. Check the error message carefully
3. Most common issues:
   - Wrong repository URL → Check GitHub for correct URL
   - Authentication failed → Use Personal Access Token
   - Branch name mismatch → Check if it's `main` or `master`

The safest approach is **Option A** - it gives you full control and preserves everything.
