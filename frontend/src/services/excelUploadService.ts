// src/services/excelUploadService.ts

export interface UploadStats {
  totalRows: number;
  processedRows: number;
  failedRows: number;
  skippedRows: number;
  parcelsCreated: number;
  parcelsSkipped: number;
  ownersCreated: number;
  ownersLinked: number;
  encumbrancesCreated: number;
}

export interface FailedRow {
  row: number;
  upin: string;
  errors: string[];
}

export interface SkippedRow {
  row: number;
  upin: string;
  reason: string;
}

export interface SuccessfulRow {
  row: number;
  upin: string;
  message: string;
}

export interface UploadResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  failedRows: number;
  skippedRows: number;
  results: {
    successful: SuccessfulRow[];
    failed: FailedRow[];
    skipped: SkippedRow[];
  };
  summary: {
    parcelsCreated: number;
    parcelsSkipped: number;
    ownersCreated: number;
    ownersLinked: number;
    encumbrancesCreated: number;
  };
}

class ExcelUploadService {
  private readonly baseEndpoint = '/upload/excel';
  private readonly API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Upload an Excel file for bulk processing
   * @param file - The Excel file to upload
   * @returns Promise with the upload result as text report
   */
  async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = this.getAuthToken();
      
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Uploading file to:', `${this.API_BASE_URL}${this.baseEndpoint}`);
      
      const response = await fetch(`${this.API_BASE_URL}${this.baseEndpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Upload failed with status ${response.status}`;
        
        try {
          // Try to parse error response as JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } else {
            // Try to get as text
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        
        throw new Error(errorMessage);
      }

      // Check if response is a text file
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (contentType && contentType.includes('text/plain')) {
        return await response.text();
      } else {
        // If not text, try to get as text anyway or handle appropriately
        const text = await response.text();
        console.warn('Unexpected content type, but got text:', contentType);
        return text;
      }
    } catch (error) {
      console.error('Excel upload service error:', error);
      throw error;
    }
  }

  /**
   * Parse the text report into structured data
   * @param reportText - The raw text report from the server
   * @returns Parsed upload statistics
   */
  parseReport(reportText: string): UploadStats {
    const stats: UploadStats = {
      totalRows: this.extractNumber(reportText, /Total Rows Processed: (\d+)/),
      processedRows: this.extractNumber(reportText, /✅ Successfully Processed: (\d+)/),
      failedRows: this.extractNumber(reportText, /❌ Failed: (\d+)/),
      skippedRows: this.extractNumber(reportText, /⏭️ Skipped: (\d+)/),
      parcelsCreated: this.extractNumber(reportText, /📦 Parcels Created: (\d+)/),
      parcelsSkipped: this.extractNumber(reportText, /⏭️ Parcels Skipped \(Duplicate UPIN\): (\d+)/),
      ownersCreated: this.extractNumber(reportText, /👤 Owners Created: (\d+)/),
      ownersLinked: this.extractNumber(reportText, /🔗 Owner-Parcel Relationships: (\d+)/),
      encumbrancesCreated: this.extractNumber(reportText, /⚖️ Encumbrances Created: (\d+)/),
    };

    return stats;
  }

  /**
   * Extract failed rows from report
   * @param reportText - The raw text report
   * @returns Array of failed rows with their errors
   */
  extractFailedRows(reportText: string): FailedRow[] {
    const failedRows: FailedRow[] = [];
    const failedSection = this.extractSection(reportText, 'FAILED ROWS - ACTION REQUIRED', 'SKIPPED ROWS|RECOMMENDATIONS|=');
    
    if (!failedSection) return failedRows;

    const rowRegex = /Row (\d+): UPIN (.*?)\n\s+Errors:\n([\s\S]*?)(?=\n\nRow|\n\n$)/g;
    let match;

    while ((match = rowRegex.exec(failedSection)) !== null) {
      const row = parseInt(match[1]);
      const upin = match[2];
      const errorsText = match[3];
      
      const errors = errorsText
        .split('\n')
        .map(line => line.replace(/^\s*•\s*/, '').trim())
        .filter(line => line.length > 0);

      failedRows.push({ row, upin, errors });
    }

    return failedRows;
  }

  /**
   * Extract skipped rows from report
   * @param reportText - The raw text report
   * @returns Array of skipped rows with reasons
   */
  extractSkippedRows(reportText: string): SkippedRow[] {
    const skippedRows: SkippedRow[] = [];
    const skippedSection = this.extractSection(reportText, 'SKIPPED ROWS', 'FAILED ROWS|RECOMMENDATIONS|=');
    
    if (!skippedSection) return skippedRows;

    const rowRegex = /Row (\d+): UPIN (.*?)\n\s+Reason: (.*?)(?=\n\nRow|\n\n$)/g;
    let match;

    while ((match = rowRegex.exec(skippedSection)) !== null) {
      skippedRows.push({
        row: parseInt(match[1]),
        upin: match[2],
        reason: match[3].trim()
      });
    }

    return skippedRows;
  }

  /**
   * Extract successful rows from report
   * @param reportText - The raw text report
   * @returns Array of successful rows
   */
  extractSuccessfulRows(reportText: string): SuccessfulRow[] {
    const successfulRows: SuccessfulRow[] = [];
    const successfulSection = this.extractSection(reportText, 'SUCCESSFUL ROWS', 'SKIPPED ROWS|FAILED ROWS|RECOMMENDATIONS|=');
    
    if (!successfulSection) return successfulRows;

    const rowRegex = /Row (\d+): UPIN (.*?) - (.*?)(?=\n|$)/g;
    let match;

    while ((match = rowRegex.exec(successfulSection)) !== null) {
      successfulRows.push({
        row: parseInt(match[1]),
        upin: match[2],
        message: match[3].trim()
      });
    }

    return successfulRows;
  }

  /**
   * Check if the upload had any failures
   * @param stats - Upload statistics
   * @returns boolean indicating if there were failures
   */
  hasFailures(stats: UploadStats): boolean {
    return stats.failedRows > 0;
  }

  /**
   * Check if the upload had any skipped rows
   * @param stats - Upload statistics
   * @returns boolean indicating if there were skipped rows
   */
  hasSkipped(stats: UploadStats): boolean {
    return stats.skippedRows > 0;
  }

  /**
   * Get a summary message based on upload results
   * @param stats - Upload statistics
   * @returns Human-readable summary message
   */
  getSummaryMessage(stats: UploadStats): string {
    if (stats.failedRows === 0 && stats.skippedRows === 0) {
      return '✅ All rows processed successfully!';
    } else if (stats.failedRows === 0 && stats.skippedRows > 0) {
      return `⚠️ File partially processed. ${stats.skippedRows} row(s) were skipped.`;
    } else if (stats.failedRows > 0 && stats.skippedRows === 0) {
      return `❌ ${stats.failedRows} row(s) failed. Please check the report.`;
    } else {
      return `❌ ${stats.failedRows} failed, ⏭️ ${stats.skippedRows} skipped. Please check the report.`;
    }
  }

  /**
   * Validate file before upload
   * @param file - The file to validate
   * @returns Object with validation result and error message
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['xlsx', 'xls'];
    
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)'
      };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    // Check if file is empty
    if (file.size === 0) {
      return {
        valid: false,
        error: 'File is empty'
      };
    }

    return { valid: true };
  }

  /**
   * Extract a number from text using regex
   * @param text - The text to search
   * @param regex - The regex pattern
   * @returns Extracted number or 0
   */
  private extractNumber(text: string, regex: RegExp): number {
    const match = text.match(regex);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Extract a section from the report
   * @param text - The full report text
   * @param startMarker - The start section marker
   * @param endMarker - The end section marker pattern
   * @returns The extracted section or null
   */
  private extractSection(text: string, startMarker: string, endMarker: string): string | null {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return null;

    const endRegex = new RegExp(endMarker);
    const remainingText = text.substring(startIndex + startMarker.length);
    const endMatch = remainingText.match(endRegex);
    
    if (endMatch && endMatch.index !== undefined) {
      return remainingText.substring(0, endMatch.index);
    }
    
    return remainingText;
  }

  /**
   * Download report as text file
   * @param reportContent - The report content
   * @param filename - Optional custom filename
   */
  downloadReport(reportContent: string, filename?: string): void {
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `upload_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get error details for a specific row
   * @param failedRows - Array of failed rows
   * @param rowNumber - The row number to find
   * @returns The failed row data or undefined
   */
  getFailedRowByNumber(failedRows: FailedRow[], rowNumber: number): FailedRow | undefined {
    return failedRows.find(row => row.row === rowNumber);
  }

  /**
   * Group errors by type for analysis
   * @param failedRows - Array of failed rows
   * @returns Object with error types and counts
   */
  groupErrorsByType(failedRows: FailedRow[]): Record<string, number> {
    const errorGroups: Record<string, number> = {};

    failedRows.forEach(row => {
      row.errors.forEach(error => {
        // Simplify error message to group similar errors
        let errorType = 'OTHER';
        
        if (error.toLowerCase().includes('file number') && error.toLowerCase().includes('already exists')) {
          errorType = 'DUPLICATE_FILE_NUMBER';
        } else if (error.toLowerCase().includes('upin') && error.toLowerCase().includes('already exists')) {
          errorType = 'DUPLICATE_UPIN';
        } else if (error.toLowerCase().includes('required')) {
          errorType = 'MISSING_REQUIRED_FIELD';
        } else if (error.toLowerCase().includes('must be a positive number')) {
          errorType = 'INVALID_AREA';
        } else if (error.toLowerCase().includes('must be yes or no')) {
          errorType = 'INVALID_YES_NO_VALUE';
        }

        errorGroups[errorType] = (errorGroups[errorType] || 0) + 1;
      });
    });

    return errorGroups;
  }

  /**
   * Get the full API URL for debugging
   */
  getApiUrl(): string {
    return `${this.API_BASE_URL}${this.baseEndpoint}`;
  }
}

// Create and export a singleton instance
export const excelUploadService = new ExcelUploadService();