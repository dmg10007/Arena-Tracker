# How to push this project to GitHub

## 1. Create the repo on GitHub

Go to https://github.com/new and create a new repo named `mtg-arena-webapp`.
- Leave it empty (no README, no .gitignore — we have those already)

## 2. Initialize and push from your local machine

```bash
# From the project root
git init
git add .
git commit -m "feat: initial scaffold — deck builder, collection, draft, meta dashboard"

# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/mtg-arena-webapp.git
git branch -M main
git push -u origin main
```

## 3. Install dependencies and run locally

```bash
npm install
npm start
```

The app will open at http://localhost:3000
