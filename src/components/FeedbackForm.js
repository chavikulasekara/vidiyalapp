import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { useLanguage } from '../contexts/LanguageContext';
import { addFeedback } from '../services/firebase';
import { sendFeedbackNotification } from '../services/emailService';

// Step indicators component
const StepIndicator = ({ currentStep, totalSteps }) => {
  const { t } = useLanguage();
  
  const steps = [
    t('feedback.steps.basicInfo'),
    t('feedback.steps.cleanliness'),
    t('feedback.steps.additional'),
    t('feedback.steps.review')
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div 
                className={`step-indicator ${
                  index < currentStep ? 'completed' : index === currentStep ? 'active' : ''
                }`}
              >
                {index + 1}
              </div>
              <div className="mt-2 text-xs text-center">{step}</div>
            </div>
            {index < steps.length - 1 && (
              <div 
                className={`step-line ${
                  index < currentStep ? 'completed' : index === currentStep ? 'active' : ''
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Main FeedbackForm component
const FeedbackForm = ({ db }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    dateTime: new Date().toISOString().slice(0, 16),
    shift: 'A',
    location: '',
    floorCondition: '',
    overallCleanliness: '',
    bowlCleanliness: '',
    trashBinCondition: '',
    waterSupply: '',
    lighting: '',
    comments: ''
  });
  
  // Images state
  const [images, setImages] = useState([]);
  const [imageErrors, setImageErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload with react-dropzone
  const onDrop = useCallback(acceptedFiles => {
    // Clear previous errors
    setImageErrors([]);
    
    // Validate files
    const errors = [];
    const validFiles = [];
    
    acceptedFiles.forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: ${t('feedback.validation.imageType')}`);
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: ${t('feedback.validation.imageSize')}`);
        return;
      }
      
      validFiles.push(file);
    });
    
    // Check total number of images
    if (images.length + validFiles.length > 5) {
      errors.push(t('feedback.validation.maxImages'));
      // Only add files up to the limit
      const remainingSlots = Math.max(0, 5 - images.length);
      validFiles.splice(remainingSlots);
    }
    
    // Set errors if any
    if (errors.length > 0) {
      setImageErrors(errors);
    }
    
    // Add valid files to state
    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
    }
  }, [images, t]);
  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 5
  });
  
  // Remove an image from the list
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Navigation between steps
  const nextStep = () => {
    // Validate current step
    if (!validateStep()) {
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Validate current step
  const validateStep = () => {
    let isValid = true;
    let errorMessage = '';
    
    switch (currentStep) {
      case 0: // Basic Info
        if (!formData.dateTime || !formData.shift || !formData.location) {
          errorMessage = t('feedback.validation.required');
          isValid = false;
        }
        break;
      case 1: // Cleanliness Ratings
        // All fields in this step are optional
        isValid = true;
        break;
      case 2: // Additional Info
        // All fields in this step are optional
        isValid = true;
        break;
      default:
        break;
    }
    
    if (!isValid) {
      toast.error(errorMessage);
    }
    
    return isValid;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    if (!validateStep()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add feedback to Firestore
      await addFeedback(formData, images);
      
      // Send email notification to admin
      try {
        await sendFeedbackNotification(formData);
        console.log('Email notification sent successfully');
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Continue with form submission even if email fails
      }
      
      // Show success message
      toast.success(t('common.success'));
      
      // Reset form
      setSubmitted(true);
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form based on current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('feedback.fields.dateTime')} <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('feedback.fields.shift')} <span className="text-red-500">*</span>
              </label>
              <select
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="General">General</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('feedback.fields.location')} <span className="text-red-500">*</span>
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">{t('feedback.fields.selectLocation')}</option>
                <option value="team member ladies">Team Member Ladies</option>
                <option value="team member gents">Team Member Gents</option>
                <option value="near Medical Centre ladies">Near Medical Centre Ladies</option>
                <option value="near Medical Centre gents">Near Medical Centre Gents</option>
                <option value="executive washroom">Executive Washroom</option>
                <option value="operation area ladies">Operation Area Ladies</option>
                <option value="operation area gents">Operation Area Gents</option>
              </select>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('feedback.fields.floorCondition')} 
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {['veryClean', 'clean', 'moderatelyClean', 'dirty'].map((rating) => (
                  <label key={rating} className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="floorCondition"
                      value={rating}
                      checked={formData.floorCondition === rating}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span>{t(`feedback.ratings.${rating}`)}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('feedback.fields.overallCleanliness')} 
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {['veryClean', 'clean', 'moderatelyClean', 'dirty'].map((rating) => (
                  <label key={rating} className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="overallCleanliness"
                      value={rating}
                      checked={formData.overallCleanliness === rating}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span>{t(`feedback.ratings.${rating}`)}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('feedback.fields.bowlCleanliness')} 
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {['veryClean', 'clean', 'moderatelyClean', 'dirty'].map((rating) => (
                  <label key={rating} className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="bowlCleanliness"
                      value={rating}
                      checked={formData.bowlCleanliness === rating}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span>{t(`feedback.ratings.${rating}`)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('feedback.fields.trashBinCondition')} 
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {['empty', 'halfFull', 'full', 'noTrashBin'].map((condition) => (
                  <label key={condition} className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="trashBinCondition"
                      value={condition}
                      checked={formData.trashBinCondition === condition}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span>{t(`feedback.trashConditions.${condition}`)}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('feedback.fields.waterSupply')} 
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {['sufficient', 'insufficient', 'noWater'].map((supply) => (
                  <label key={supply} className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="waterSupply"
                      value={supply}
                      checked={formData.waterSupply === supply}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span>{t(`feedback.waterSupply.${supply}`)}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('feedback.fields.lighting')} 
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {['wellLit', 'sufficient', 'dimLight'].map((lighting) => (
                  <label key={lighting} className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="lighting"
                      value={lighting}
                      checked={formData.lighting === lighting}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span>{t(`feedback.lighting.${lighting}`)}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('feedback.fields.comments')}
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('feedback.fields.images')}
              </label>
              <div 
                {...getRootProps()} 
                className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <input {...getInputProps()} />
                <p>{t('feedback.dropzone.title')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('feedback.dropzone.maxFiles')}<br />
                  {t('feedback.dropzone.fileType')}
                </p>
              </div>
              
              {/* Display image errors */}
              {imageErrors.length > 0 && (
                <div className="mt-2">
                  {imageErrors.map((error, index) => (
                    <p key={index} className="text-red-500 text-sm">{error}</p>
                  ))}
                </div>
              )}
              
              {/* Display uploaded images */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {images.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="h-24 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case 3: // Review & Submit
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('feedback.steps.review')}</h3>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">{t('feedback.fields.dateTime')}:</p>
                  <p>{formData.dateTime}</p>
                </div>
                
                <div>
                  <p className="font-medium">{t('feedback.fields.shift')}:</p>
                  <p>{formData.shift}</p>
                </div>
                
                <div>
                  <p className="font-medium">{t('feedback.fields.location')}:</p>
                  <p>{formData.location}</p>
                </div>
                
                <div>
                  <p className="font-medium">{t('feedback.fields.floorCondition')}:</p>
                  <p>{t(`feedback.ratings.${formData.floorCondition}`)}</p>
                </div>
                
                <div>
                  <p className="font-medium">{t('feedback.fields.overallCleanliness')}:</p>
                  <p>{t(`feedback.ratings.${formData.overallCleanliness}`)}</p>
                </div>
                
                <div>
                  <p className="font-medium">{t('feedback.fields.bowlCleanliness')}:</p>
                  <p>{t(`feedback.ratings.${formData.bowlCleanliness}`)}</p>
                </div>
                
                <div>
                  <p className="font-medium">{t('feedback.fields.trashBinCondition')}:</p>
                  <p>{t(`feedback.trashConditions.${formData.trashBinCondition}`)}</p>
                </div>
                
                <div>
                  <p className="font-medium">{t('feedback.fields.waterSupply')}:</p>
                  <p>{t(`feedback.waterSupply.${formData.waterSupply}`)}</p>
                </div>
                
                <div>
                  <p className="font-medium">{t('feedback.fields.lighting')}:</p>
                  <p>{t(`feedback.lighting.${formData.lighting}`)}</p>
                </div>
                
                {formData.comments && (
                  <div className="md:col-span-2">
                    <p className="font-medium">{t('feedback.fields.comments')}:</p>
                    <p>{formData.comments}</p>
                  </div>
                )}
              </div>
              
              {/* Display uploaded images */}
              {images.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium">{t('feedback.fields.images')}:</p>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {images.map((file, index) => (
                      <div key={index}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="h-24 w-full object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Show thank you message after submission
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('common.success')}</h2>
          <p className="text-lg">{t('feedback.thankYou')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-center">{t('feedback.title')}</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">{t('feedback.description')}</p>
      
      <StepIndicator currentStep={currentStep} totalSteps={4} />
      
      <form onSubmit={handleSubmit}>
        {renderStep()}
        
        <div className="mt-8 flex justify-between">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              {t('common.previous')}
            </button>
          ) : (
            <div></div>
          )}
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isSubmitting}
            >
              {t('common.next')}
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.loading') : t('common.submit')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;
