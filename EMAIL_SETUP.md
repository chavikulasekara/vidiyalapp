# Email Notification Setup Guide

This guide will help you set up email notifications for form submissions using EmailJS.

## Setting up EmailJS

1. **Create an EmailJS Account**
   - Go to [EmailJS](https://www.emailjs.com/) and sign up for a free account
   - The free plan allows 200 emails per month

2. **Create an Email Service**
   - In your EmailJS dashboard, go to "Email Services"
   - Click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the instructions to connect your email account
   - Note the Service ID (e.g., `service_feedback`)

3. **Create an Email Template**
   - Go to "Email Templates"
   - Click "Create New Template"
   - Design your email template with the following variables:
     - `{{to_email}}`: The recipient's email address
     - `{{feedback_date}}`: The date and time of the feedback
     - `{{feedback_location}}`: The location from the feedback
     - `{{feedback_shift}}`: The shift from the feedback
     - `{{feedback_comments}}`: Any comments from the feedback
   - Save the template and note the Template ID (e.g., `template_feedback`)

4. **Get Your Public Key**
   - Go to "Account" > "API Keys"
   - Copy your Public Key

5. **Update the Code**
   - Open `/src/services/emailInit.js`
   - Replace `YOUR_PUBLIC_KEY` with your actual Public Key
   - Open `/src/services/emailService.js`
   - Replace `service_feedback` with your actual Service ID
   - Replace `template_feedback` with your actual Template ID
   - Replace `YOUR_PUBLIC_KEY` with your actual Public Key

## Testing

1. Submit a form on the website
2. Check if an email notification is sent to `masvidiyal58@gmail.com`
3. If there are any issues, check the browser console for error messages

## Troubleshooting

- Make sure your email service is properly connected in EmailJS
- Verify that your template contains all the required variables
- Check if your EmailJS account is active and within the free tier limits
- Ensure your domain is allowed in the EmailJS settings (for production use)

## Security Note

The EmailJS Public Key is safe to use in client-side code as it's designed for this purpose. EmailJS provides domain restrictions to prevent unauthorized use of your account.