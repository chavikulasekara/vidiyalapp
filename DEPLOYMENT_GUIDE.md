# Deployment Guide for Separate User and Admin Panels

This guide explains how to deploy the user panel and admin panel separately, ensuring that the admin panel is not accessible from the user panel.

## Prerequisites

- Node.js and npm installed
- Two separate hosting environments (e.g., two GitHub Pages repositories, two Firebase hosting sites, etc.)

## Building the Panels

### 1. Build the User Panel

```bash
npm run build:user
```

This will create a build in the `build` directory with the following characteristics:
- The admin panel link will be hidden from the navigation
- The admin route will not be accessible
- The title will be set to "Restroom Cleanliness Feedback System"

### 2. Build the Admin Panel

```bash
npm run build:admin
```

This will create a build in the `build` directory with the following characteristics:
- The panel will be configured as an admin panel
- The title will be set to "Restroom Cleanliness Admin Panel"

## Deployment Options

### Option 1: GitHub Pages

1. Create two separate GitHub repositories:
   - One for the user panel (e.g., `restroom-feedback-user`)
   - One for the admin panel (e.g., `restroom-feedback-admin`)

2. Deploy the user panel:
   ```bash
   # After building the user panel
   cd build
   git init
   git add .
   git commit -m "Deploy user panel"
   git remote add origin https://github.com/yourusername/restroom-feedback-user.git
   git push -u origin master
   ```

3. Deploy the admin panel:
   ```bash
   # After building the admin panel
   cd build
   git init
   git add .
   git commit -m "Deploy admin panel"
   git remote add origin https://github.com/yourusername/restroom-feedback-admin.git
   git push -u origin master
   ```

4. Enable GitHub Pages for both repositories in the repository settings.

### Option 2: Firebase Hosting

1. Create two Firebase hosting sites:
   ```bash
   # Initialize Firebase (if not already done)
   firebase init hosting
   ```

2. Configure multiple sites in `firebase.json`:
   ```json
   {
     "hosting": [
       {
         "target": "user",
         "public": "build",
         "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
       },
       {
         "target": "admin",
         "public": "build",
         "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
       }
     ]
   }
   ```

3. Add the hosting targets:
   ```bash
   firebase target:apply hosting user your-project-id-user
   firebase target:apply hosting admin your-project-id-admin
   ```

4. Deploy the user panel:
   ```bash
   npm run build:user
   firebase deploy --only hosting:user
   ```

5. Deploy the admin panel:
   ```bash
   npm run build:admin
   firebase deploy --only hosting:admin
   ```

### Option 3: Netlify/Vercel

1. Create two separate projects in Netlify or Vercel
2. Configure the build commands for each:
   - User panel: `npm run build:user`
   - Admin panel: `npm run build:admin`
3. Set the publish directory to `build` for both

## Securing the Admin Panel

To add an extra layer of security to the admin panel:

1. Consider adding authentication to the admin panel
2. For Firebase hosting, you can use Firebase Authentication and add security rules
3. For other hosting providers, consider using a service like Auth0 or implementing a password protection

## Troubleshooting

- If you encounter routing issues with React Router, make sure to configure your hosting provider to handle client-side routing by redirecting all requests to `index.html`
- For GitHub Pages, you may need to use HashRouter instead of BrowserRouter
- For Firebase, add a rewrite rule in `firebase.json`:
  ```json
  "rewrites": [{
    "source": "**",
    "destination": "/index.html"
  }]
  ```