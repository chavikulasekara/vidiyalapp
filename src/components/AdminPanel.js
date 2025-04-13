import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { getAllFeedback, filterFeedback, deleteFeedback } from '../services/firebase';
import { useLanguage } from '../contexts/LanguageContext';

// PDF Report Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row'
  },
  tableColHeader: {
    width: '10%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
    padding: 3,
    fontWeight: 'bold'
  },
  tableCol: {
    width: '10%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 3
  },
  text: {
    fontSize: 10,
    margin: 5
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    color: 'grey'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: 'grey'
  }
});

// PDF Document Component
const FeedbackReport = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Restroom Cleanliness Feedback Report</Text>
      <Text style={styles.header}>Generated on {new Date().toLocaleDateString()}</Text>
      
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.text}>Date & Time</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.text}>Shift</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.text}>Location</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.text}>Floor Condition</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.text}>Overall Cleanliness</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.text}>Bowl Cleanliness</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.text}>Trash Bin</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.text}>Water Supply</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.text}>Lighting</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.text}>Comments</Text>
          </View>
        </View>
        
        {/* Table Data */}
        {data.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}>
              <Text style={styles.text}>{item.createdAt.toLocaleDateString()}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.text}>{item.shift}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.text}>{item.location}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.text}>{item.floorCondition}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.text}>{item.overallCleanliness}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.text}>{item.bowlCleanliness}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.text}>{item.trashBinCondition}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.text}>{item.waterSupply}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.text}>{item.lighting}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.text}>{item.comments || 'No comments'}</Text>
            </View>
          </View>
        ))}
      </View>
      
      <Text style={styles.footer}>Restroom Cleanliness Feedback System</Text>
    </Page>
  </Document>
);

// Image Modal Component
const ImageModal = ({ images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Image {currentIndex + 1} of {images.length}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="relative">
          <img 
            src={images[currentIndex].data} 
            alt={`Feedback image ${currentIndex + 1}`} 
            className="max-h-[60vh] mx-auto"
          />
          
          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between">
              <button 
                onClick={prevImage}
                className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={nextImage}
                className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {images.length > 1 && (
          <div className="mt-4 flex justify-center space-x-2 overflow-x-auto">
            {images.map((img, idx) => (
              <img 
                key={idx}
                src={img.data} 
                alt={`Thumbnail ${idx + 1}`} 
                className={`h-16 w-16 object-cover cursor-pointer border-2 ${idx === currentIndex ? 'border-primary-500' : 'border-transparent'}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Feedback Detail Modal Component
const FeedbackDetailModal = ({ feedback, onClose, t }) => {
  if (!feedback) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{t('admin.modal.viewTitle')}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium">{t('feedback.fields.dateTime')}:</p>
            <p>{feedback.createdAt.toLocaleString()}</p>
          </div>
          
          <div>
            <p className="font-medium">{t('feedback.fields.shift')}:</p>
            <p>{feedback.shift}</p>
          </div>
          
          <div>
            <p className="font-medium">{t('feedback.fields.location')}:</p>
            <p>{feedback.location}</p>
          </div>
          
          <div>
            <p className="font-medium">{t('feedback.fields.floorCondition')}:</p>
            <p>{t(`feedback.ratings.${feedback.floorCondition}`)}</p>
          </div>
          
          <div>
            <p className="font-medium">{t('feedback.fields.overallCleanliness')}:</p>
            <p>{t(`feedback.ratings.${feedback.overallCleanliness}`)}</p>
          </div>
          
          <div>
            <p className="font-medium">{t('feedback.fields.bowlCleanliness')}:</p>
            <p>{t(`feedback.ratings.${feedback.bowlCleanliness}`)}</p>
          </div>
          
          <div>
            <p className="font-medium">{t('feedback.fields.trashBinCondition')}:</p>
            <p>{t(`feedback.trashConditions.${feedback.trashBinCondition}`)}</p>
          </div>
          
          <div>
            <p className="font-medium">{t('feedback.fields.waterSupply')}:</p>
            <p>{t(`feedback.waterSupply.${feedback.waterSupply}`)}</p>
          </div>
          
          <div>
            <p className="font-medium">{t('feedback.fields.lighting')}:</p>
            <p>{t(`feedback.lighting.${feedback.lighting}`)}</p>
          </div>
        </div>
        
        {feedback.comments && (
          <div className="mt-4">
            <p className="font-medium">{t('feedback.fields.comments')}:</p>
            <p className="whitespace-pre-wrap">{feedback.comments}</p>
          </div>
        )}
        
        {feedback.imageData && feedback.imageData.length > 0 && (
          <div className="mt-4">
            <p className="font-medium">{t('feedback.fields.images')}:</p>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {feedback.imageData.map((img, index) => (
                <img
                  key={index}
                  src={img.data}
                  alt={`Feedback image ${index + 1}`}
                  className="h-24 w-full object-cover rounded-md cursor-pointer"
                  onClick={() => {
                    document.getElementById('image-modal-container').innerHTML = '';
                    const modalRoot = document.createElement('div');
                    document.getElementById('image-modal-container').appendChild(modalRoot);
                    // Render image modal
                    const modal = <ImageModal images={feedback.imageData} onClose={() => {
                      document.getElementById('image-modal-container').innerHTML = '';
                    }} />;
                    // Render modal
                    ReactDOM.render(modal, modalRoot);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main AdminPanel Component
const AdminPanel = ({ db, darkMode }) => {
  const { t } = useLanguage();
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    location: ''
  });
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  
  // Fetch feedback data
  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const data = await getAllFeedback();
      setFeedbackData(data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchFeedbackData();
    
    // No automatic refresh to prevent constant refreshing
    // User can manually refresh by using the filter buttons
    
    return () => {};
  }, []);
  
  // Apply filters
  const applyFilters = async () => {
    try {
      setLoading(true);
      const filteredData = await filterFeedback(
        filters.startDate,
        filters.endDate,
        filters.location
      );
      setFeedbackData(filteredData);
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      location: ''
    });
    fetchFeedbackData();
  };
  
  // Handle delete feedback
  const handleDeleteFeedback = async () => {
    if (!feedbackToDelete) return;
    
    try {
      await deleteFeedback(feedbackToDelete.id);
      toast.success(t('common.success'));
      setShowDeleteConfirm(false);
      setFeedbackToDelete(null);
      fetchFeedbackData();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error(t('common.error'));
    }
  };
  
  // View feedback details
  const viewFeedbackDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setShowModal(true);
  };
  
  // Confirm delete
  const confirmDelete = (feedback) => {
    setFeedbackToDelete(feedback);
    setShowDeleteConfirm(true);
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">{t('admin.title')}</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{t('admin.description')}</p>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-medium mb-4">{t('admin.filters.title')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('admin.filters.from')}
            </label>
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => setFilters({ ...filters, startDate: date })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholderText="Select start date"
              dateFormat="yyyy-MM-dd"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('admin.filters.to')}
            </label>
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => setFilters({ ...filters, endDate: date })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholderText="Select end date"
              dateFormat="yyyy-MM-dd"
              minDate={filters.startDate}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('admin.filters.location')}
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter location"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {t('admin.filters.reset')}
          </button>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {t('admin.filters.apply')}
          </button>
        </div>
      </div>
      
      {/* Download Report */}
      <div className="mb-4 flex justify-end">
        {feedbackData.length > 0 && (
          <PDFDownloadLink
            document={<FeedbackReport data={feedbackData} />}
            fileName="restroom-feedback-report.pdf"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
          >
            {({ blob, url, loading, error }) =>
              loading ? t('common.loading') : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('admin.actions.download')}
                </>
              )
            }
          </PDFDownloadLink>
        )}
      </div>
      
      {/* Feedback Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.table.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.table.shift')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.table.location')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.table.overallCleanliness')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.table.images')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : feedbackData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    {t('admin.noData')}
                  </td>
                </tr>
              ) : (
                feedbackData.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {feedback.createdAt.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {feedback.shift}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {feedback.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {t(`feedback.ratings.${feedback.overallCleanliness}`)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {feedback.imageUrls && feedback.imageUrls.length > 0 ? (
                        <div className="flex space-x-1">
                          {feedback.imageUrls.slice(0, 3).map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Thumbnail ${index + 1}`}
                              className="h-10 w-10 object-cover rounded-md cursor-pointer"
                              onClick={() => viewFeedbackDetails(feedback)}
                            />
                          ))}
                          {feedback.imageUrls.length > 3 && (
                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center text-sm font-medium cursor-pointer"
                              onClick={() => viewFeedbackDetails(feedback)}
                            >
                              +{feedback.imageUrls.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewFeedbackDetails(feedback)}
                          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                          title={t('admin.actions.view')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => confirmDelete(feedback)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title={t('admin.actions.delete')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Feedback Detail Modal */}
      {showModal && selectedFeedback && (
        <FeedbackDetailModal 
          feedback={selectedFeedback} 
          onClose={() => setShowModal(false)} 
          t={t} 
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && feedbackToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{t('admin.actions.confirm')}</h3>
            <p className="mb-6">{t('admin.actions.confirm')} {t('admin.actions.delete')}?</p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setFeedbackToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {t('admin.actions.no')}
              </button>
              <button
                onClick={handleDeleteFeedback}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {t('admin.actions.yes')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Image Modal Container */}
      <div id="image-modal-container"></div>
    </div>
  );
};

export default AdminPanel;
