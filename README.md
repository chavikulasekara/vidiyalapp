<<<<<<< HEAD
# vidiyalapp
=======
# Restroom Cleanliness Feedback System

This application provides separate user and admin panels for a restroom cleanliness feedback system.

## Setup

1. Install dependencies:
   ```
   npm install
   npm install env-cmd --save-dev
   ```

2. Run the application:
   - For user panel: `npm run start:user`
   - For admin panel: `npm run start:admin`

## Deployment

To deploy the application with separate user and admin panels:

1. Build the user panel:
   ```
   npm run build:user
   ```
   Deploy the build folder to your user panel hosting service.

2. Build the admin panel:
   ```
   npm run build:admin
   ```
   Deploy the build folder to your admin panel hosting service with restricted access.

## Environment Configuration

- `.env.user`: Configuration for the user panel
- `.env.admin`: Configuration for the admin panel

You can modify these files to customize the behavior of each panel.
>>>>>>> 3f91908 (Initial commit)
