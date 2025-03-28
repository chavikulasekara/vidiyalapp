import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../App';

// We're not using Firebase Storage anymore to avoid paid plans
// Instead, we'll convert images to base64 strings and store them directly in Firestore

// Collection name
const FEEDBACK_COLLECTION = 'feedback';

// Direct file upload approach to avoid CORS issues
// We're not using the bytes conversion approach anymore as it causes CORS errors

// Add feedback to Firestore
// export const addFeedback = async (feedbackData, images = []) => {
//   try {
//     // Add timestamp
//     const dataWithTimestamp = {
//       ...feedbackData,
//       createdAt: Timestamp.now(),
//       imageUrls: []
//     };

//     // Add document to Firestore
//     const docRef = await addDoc(collection(db, FEEDBACK_COLLECTION), dataWithTimestamp);

//     // Upload images if any
//     if (images.length > 0) {
//       const imageUrls = [];

//       for (let i = 0; i < images.length; i++) {
//         const file = images[i];
//         const fileBytes = await fileToBytes(file);
//         const storageRef = ref(storage, `feedback/${docRef.id}/${file.name}`);
        
//         // Upload file bytes
//         await uploadBytes(storageRef, fileBytes);
        
//         // Get download URL
//         const downloadURL = await getDownloadURL(storageRef);
//         imageUrls.push(downloadURL);
//       }

//       // Update document with image URLs
//       await updateDoc(doc(db, FEEDBACK_COLLECTION, docRef.id), {
//         imageUrls
//       });
//     }

//     return docRef.id;
//   } catch (error) {
//     console.error('Error adding feedback:', error);
//     throw error;
//   }
// };

// Helper function to convert file to base64 string
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const addFeedback = async (feedbackData, images = []) => {
  try {
    // Ensure we use the date submitted by the user instead of current date
    const submittedDate = feedbackData.dateTime ? new Date(feedbackData.dateTime) : new Date();
    
    const dataWithTimestamp = {
      ...feedbackData,
      createdAt: Timestamp.fromDate(submittedDate),
      imageData: []
    };

    // Convert images to base64 strings if any
    if (images.length > 0) {
      const imageData = [];

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        // Convert file to base64 string
        const base64String = await fileToBase64(file);
        
        // Store image metadata along with base64 data
        imageData.push({
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64String,
          createdAt: new Date().toISOString()
        });
      }

      // Add image data to the document
      dataWithTimestamp.imageData = imageData;
    }

    // Add document to Firestore with image data included
    const docRef = await addDoc(collection(db, FEEDBACK_COLLECTION), dataWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error('Error adding feedback:', error);
    throw error;
  }
};


// Get all feedback from Firestore
export const getAllFeedback = async () => {
  try {
    const q = query(collection(db, FEEDBACK_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting feedback:', error);
    throw error;
  }
};

// Get feedback by ID
export const getFeedbackById = async (id) => {
  try {
    const docRef = doc(db, FEEDBACK_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting feedback by ID:', error);
    throw error;
  }
};

// Update feedback
export const updateFeedback = async (id, data, newImages = []) => {
  try {
    const docRef = doc(db, FEEDBACK_COLLECTION, id);
    
    // Get current feedback data
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Feedback not found');
    }
    
    const currentData = docSnap.data();
    const updatedData = { ...data };
    
    // Add new images if any
    if (newImages.length > 0) {
      const newImageData = [];
      
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        // Convert file to base64 string
        const base64String = await fileToBase64(file);
        
        // Store image metadata along with base64 data
        newImageData.push({
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64String,
          createdAt: new Date().toISOString()
        });
      }
      
      // Combine existing and new image data
      updatedData.imageData = [...(currentData.imageData || []), ...newImageData];
    }
    
    // Update document
    await updateDoc(docRef, updatedData);
    
    return id;
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
};

// Delete feedback
export const deleteFeedback = async (id) => {
  try {
    // No need to delete images from storage since they're stored in Firestore
    // Just delete the document from Firestore
    await deleteDoc(doc(db, FEEDBACK_COLLECTION, id));
    
    return true;
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};

// Filter feedback by date range and location
export const filterFeedback = async (startDate, endDate, location) => {
  try {
    let q = query(collection(db, FEEDBACK_COLLECTION), orderBy('createdAt', 'desc'));
    
    // Apply date range filter if provided
    if (startDate && endDate) {
      const startTimestamp = Timestamp.fromDate(new Date(startDate));
      const endTimestamp = Timestamp.fromDate(new Date(endDate));
      q = query(q, where('createdAt', '>=', startTimestamp), where('createdAt', '<=', endTimestamp));
    }
    
    const querySnapshot = await getDocs(q);
    
    let results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
    
    // Apply location filter if provided (client-side filtering for location)
    if (location && location.trim() !== '') {
      results = results.filter(item => 
        item.location && item.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    return results;
  } catch (error) {
    console.error('Error filtering feedback:', error);
    throw error;
  }
};