// Document type display names
export const getDocumentTypeDisplay = (docType: string): string => {
  const types: Record<string, string> = {
    'ID_COPY': 'ID Copy',
    'SUPPORTING_DOCUMENT': 'Supporting Document',
    'PASSPORT': 'Passport',
    'DRIVERS_LICENSE': "Driver's License",
    'BIRTH_CERTIFICATE': 'Birth Certificate',
    'MARRIAGE_CERTIFICATE': 'Marriage Certificate',
    'TITLE_DEED': 'Title Deed',
    'SURVEY_PLAN': 'Survey Plan',
    'POWER_OF_ATTORNEY': 'Power of Attorney',
    'CONTRACT': 'Contract',
    'INVOICE': 'Invoice',
    'RECEIPT': 'Receipt',
    'CERTIFICATE': 'Certificate',
    'PERMIT': 'Permit',
    'LICENSE': 'License',
    'LETTER': 'Letter',
    'FORM': 'Form',
    'PHOTO': 'Photo',
    'OTHER': 'Other'
  };
  return types[docType] || docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format date
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
};

// Get document icon based on type or mime
export const getDocumentIcon = (docType?: string, mimeType?: string): string => {
  if (mimeType) {
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📘';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📗';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📙';
  }
  
  if (docType) {
    if (docType.includes('ID')) return '🆔';
    if (docType.includes('PASSPORT')) return '🛂';
    if (docType.includes('LICENSE')) return '📋';
    if (docType.includes('CERTIFICATE')) return '📜';
    if (docType.includes('CONTRACT')) return '⚖️';
    if (docType.includes('INVOICE')) return '💰';
    if (docType.includes('RECEIPT')) return '🧾';
    if (docType.includes('SURVEY')) return '🗺️';
    if (docType.includes('DEED')) return '🏠';
  }
  
  return '📄';
};

// Get badge color based on document type
export const getDocumentBadgeColor = (docType: string): { bg: string; text: string } => {
  const colors: Record<string, { bg: string; text: string }> = {
    'ID_COPY': { bg: '#e3f2fd', text: '#0d47a1' },
    'PASSPORT': { bg: '#e8eaf6', text: '#1a237e' },
    'DRIVERS_LICENSE': { bg: '#e0f2f1', text: '#004d40' },
    'BIRTH_CERTIFICATE': { bg: '#fce4ec', text: '#880e4f' },
    'MARRIAGE_CERTIFICATE': { bg: '#f3e5f5', text: '#4a148c' },
    'TITLE_DEED': { bg: '#fff3e0', text: '#bf360c' },
    'SURVEY_PLAN': { bg: '#e8f5e9', text: '#1b5e20' },
    'POWER_OF_ATTORNEY': { bg: '#efebe9', text: '#3e2723' },
    'CONTRACT': { bg: '#ffebee', text: '#b71c1c' },
    'SUPPORTING_DOCUMENT': { bg: '#f3e5f5', text: '#4a148c' },
  };
  
  return colors[docType] || { bg: '#f5f5f5', text: '#616161' };
};

// Document interface
export interface Document {
  id?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  document_type?: string;
  document_name?: string;
  document_number?: string;
  issue_date?: string;
  expiry_date?: string;
  issuing_authority?: string;
  metadata?: {
    uploaded_at?: string;
    uploaded_by?: string;
    uploaded_by_role?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Check if object is a document
export const isDocument = (obj: any): obj is Document => {
  return obj && (
    obj.file_url !== undefined || 
    obj.file_name !== undefined || 
    obj.document_type !== undefined ||
    obj.document_name !== undefined
  );
};