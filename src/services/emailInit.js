import { init } from 'emailjs-com';

// Initialize EmailJS with your public key
// This should be called once when your app starts
export const initEmailJS = () => {
  // Replace with your actual EmailJS Public Key
  const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
  
  // Initialize EmailJS
  init(PUBLIC_KEY);
  console.log('EmailJS initialized');
};