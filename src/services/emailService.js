import emailjs from 'emailjs-com';

// EmailJS service configuration
// Using public keys is safe with EmailJS as they use domain restrictions
const SERVICE_ID = 'service_pm7hnzw'; // You'll get this when you create a service in EmailJS
const TEMPLATE_ID = 'template_kuf4x6l'; // You'll get this when you create a template in EmailJS
const PUBLIC_KEY = 'ikpD4NxzkyRCzozDV'; // You'll get this from your EmailJS account

/**
 * Sends an email notification when a new feedback is submitted
 * @param {Object} feedbackData - The feedback data submitted by the user
 * @returns {Promise} - Promise that resolves when the email is sent
 */
export const sendFeedbackNotification = async (feedbackData) => {
  try {
    // Prepare template parameters
    const templateParams = {
      to_email: 'masvidiyal58@gmail.com',
      feedback_date: new Date(feedbackData.dateTime).toLocaleString(),
      feedback_location: feedbackData.location,
      feedback_shift: feedbackData.shift,
      feedback_comments: feedbackData.comments || 'No comments provided'
    };

    // Send the email
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    console.log('Email notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};