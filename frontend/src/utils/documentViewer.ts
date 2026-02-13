// src/utils/documentViewer.ts
const VITE_API_PDF_URL = import.meta.env.VITE_API_PDF_URL ;

export const getDocumentUrl = (file_url: string): string => {
    console.log("here on console log")
  if (!file_url) return '';
  console.log("file_url",file_url)
  // If it's already a full URL, return as is
  if (file_url.startsWith('http://') || file_url.startsWith('https://')) {
    return file_url;
  }
  
  const baseUrl = VITE_API_PDF_URL.endsWith('/') ? VITE_API_PDF_URL.slice(0, -1) : VITE_API_PDF_URL;
  const urlPath = file_url.startsWith('/') ? file_url : `/${file_url}`;
 console.log("urlpath", `${baseUrl}${urlPath}`)
  return `${baseUrl}${urlPath}`;
};

export const openDocument = (file_url: string) => {
  const url = getDocumentUrl(file_url);
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};