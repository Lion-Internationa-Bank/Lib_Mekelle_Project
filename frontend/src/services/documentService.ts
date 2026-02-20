// services/documentService.ts
const VITE_API_PDF_URL = import.meta.env.VITE_API_PDF_URL;

export const openDocument = async (filename: string) => {
  console.log('🔍 Opening document:', { filename, VITE_API_PDF_URL });
  
  const token = localStorage.getItem('authToken');
  console.log('🔍 Auth token present:', !!token);
  
  if (!token) {
    console.error('❌ No auth token found in localStorage');
    alert('Please log in again');
    return;
  }

  // Log first 10 chars of token for debugging (never log full token)
  console.log('🔍 Token preview:', token.substring(0, 10) + '...');
  
  // ENCODE THE FILENAME HERE
  const encodedFilename = encodeURIComponent(filename);
  const url = `${VITE_API_PDF_URL}${encodedFilename}`;
  console.log('🔍 Full request URL:', url);
  
  try {
    console.log('🔍 Making fetch request...');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('🔍 Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ Unauthorized - Token might be invalid or expired');
        alert('Your session has expired. Please log in again.');
      } else if (response.status === 404) {
        console.error('❌ Document not found:', filename);
        alert('Document not found');
      } else {
        console.error(`❌ HTTP error ${response.status}: ${response.statusText}`);
        throw new Error(`Failed to load document: ${response.statusText}`);
      }
      return;
    }

    console.log('🔍 Response OK, getting blob...');
    const blob = await response.blob();
    console.log('🔍 Blob created:', {
      type: blob.type,
      size: blob.size + ' bytes'
    });

    // Check if blob is valid
    if (blob.size === 0) {
      console.error('❌ Blob is empty');
      alert('Document is empty');
      return;
    }

    const blobUrl = URL.createObjectURL(blob);
    console.log('🔍 Blob URL created:', blobUrl);
    
    console.log('🔍 Opening new window...');
    const newWindow = window.open(blobUrl, '_blank');
    
    if (!newWindow) {
      console.warn('⚠️ Popup blocked - opening in same window');
      // Fallback: open in same window
      window.location.href = blobUrl;
    } else {
      console.log('✅ Window opened successfully');
    }

    // Clean up blob URL after a delay (to ensure the new tab has loaded it)
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      console.log('🔍 Blob URL cleaned up');
    }, 1000);

  } catch (error) {
    console.error('❌ Error in openDocument:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    alert('Failed to open document. Check console for details.');
  }
};