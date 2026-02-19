// src/routes/admin/ExcelUploadPage.tsx

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { excelUploadService,type UploadStats, type FailedRow,type  SkippedRow,type  SuccessfulRow } from '../../services/excelUploadService';

const ExcelUploadPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const [failedRows, setFailedRows] = useState<FailedRow[]>([]);
  const [skippedRows, setSkippedRows] = useState<SkippedRow[]>([]);
  const [successfulRows, setSuccessfulRows] = useState<SuccessfulRow[]>([]);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [errorGroups, setErrorGroups] = useState<Record<string, number>>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Validate file using the service
      const validation = excelUploadService.validateFile(selectedFile);
      
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid file');
        return;
      }
      
      setFile(selectedFile);
      toast.success(`File "${selectedFile.name}" selected`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setShowReport(false);
    setReportContent(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      // Upload file using the service
      const reportText = await excelUploadService.uploadFile(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Parse report data using the service
      const stats = excelUploadService.parseReport(reportText);
      const failed = excelUploadService.extractFailedRows(reportText);
      const skipped = excelUploadService.extractSkippedRows(reportText);
      const successful = excelUploadService.extractSuccessfulRows(reportText);
      const errorGroups = excelUploadService.groupErrorsByType(failed);

      setUploadStats(stats);
      setFailedRows(failed);
      setSkippedRows(skipped);
      setSuccessfulRows(successful);
      setErrorGroups(errorGroups);
      setReportContent(reportText);
      setShowReport(true);

      // Show summary toast
      const summaryMessage = excelUploadService.getSummaryMessage(stats);
      if (excelUploadService.hasFailures(stats)) {
        toast.error(summaryMessage);
      } else if (excelUploadService.hasSkipped(stats)) {
        toast.warning(summaryMessage);
      } else {
        toast.success(summaryMessage);
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const downloadReport = () => {
    if (reportContent) {
      excelUploadService.downloadReport(reportContent);
    }
  };

  const handleNewUpload = () => {
    setFile(null);
    setUploadStats(null);
    setFailedRows([]);
    setSkippedRows([]);
    setSuccessfulRows([]);
    setErrorGroups({});
    setReportContent(null);
    setShowReport(false);
    setUploadProgress(0);
  };

  // Get error type display name
  const getErrorTypeDisplay = (errorType: string): string => {
    const displays: Record<string, string> = {
      'DUPLICATE_FILE_NUMBER': 'Duplicate File Numbers',
      'DUPLICATE_UPIN': 'Duplicate UPINs',
      'MISSING_REQUIRED_FIELD': 'Missing Required Fields',
      'INVALID_AREA': 'Invalid Area Values',
      'INVALID_YES_NO_VALUE': 'Invalid YES/NO Values',
      'OTHER': 'Other Errors'
    };
    return displays[errorType] || errorType;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Excel Upload</h1>
          <p className="text-gray-600 mt-2">
            Upload an Excel file with land parcel data. The system will process each row and create records.
          </p>
        </div>

        {/* Upload Area */}
        {!showReport ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : file
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                {file ? (
                  <>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="mt-4 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove file
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900">
                      {isDragActive ? 'Drop your file here' : 'Drag & drop your Excel file here'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">or click to browse</p>
                    <p className="text-xs text-gray-400 mt-4">
                      Supported formats: .xlsx, .xls (Max size: 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Template Download */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => window.open('/templates/excel-template.xlsx', '_blank')}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Excel Template
              </button>
            </div>

            {/* Upload Button */}
            {file && (
              <div className="mt-8">
                {uploading ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="text-gray-900 font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleUpload}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Upload and Process File
                  </button>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                File Requirements
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  File must be in .xlsx or .xls format
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Data should start from row 3 (rows 1-2 are headers)
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Required columns: UPIN, File Number
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Encumbrance fields must be "YES" or "NO"
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Area must be a positive number
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Maximum file size: 10MB
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-6">
            {/* Stats Cards */}
            {uploadStats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total Rows</p>
                        <p className="text-2xl font-bold text-gray-900">{uploadStats.totalRows}</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xl">📊</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Successful</p>
                        <p className="text-2xl font-bold text-green-600">{uploadStats.processedRows}</p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xl">✅</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Failed</p>
                        <p className="text-2xl font-bold text-red-600">{uploadStats.failedRows}</p>
                      </div>
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-xl">❌</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Skipped</p>
                        <p className="text-2xl font-bold text-yellow-600">{uploadStats.skippedRows}</p>
                      </div>
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 text-xl">⏭️</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Database Operations Stats */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Operations</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-1">📦</div>
                      <div className="text-sm font-medium text-gray-900">{uploadStats.parcelsCreated}</div>
                      <div className="text-xs text-gray-500">Parcels Created</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-1">⏭️</div>
                      <div className="text-sm font-medium text-gray-900">{uploadStats.parcelsSkipped}</div>
                      <div className="text-xs text-gray-500">Parcels Skipped</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-1">👤</div>
                      <div className="text-sm font-medium text-gray-900">{uploadStats.ownersCreated}</div>
                      <div className="text-xs text-gray-500">Owners Created</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-1">🔗</div>
                      <div className="text-sm font-medium text-gray-900">{uploadStats.ownersLinked}</div>
                      <div className="text-xs text-gray-500">Relationships</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-1">⚖️</div>
                      <div className="text-sm font-medium text-gray-900">{uploadStats.encumbrancesCreated}</div>
                      <div className="text-xs text-gray-500">Encumbrances</div>
                    </div>
                  </div>
                </div>

                {/* Error Analysis */}
                {Object.keys(errorGroups).length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Error Analysis</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(errorGroups).map(([errorType, count]) => (
                        <div key={errorType} className="bg-red-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-red-800">
                              {getErrorTypeDisplay(errorType)}
                            </span>
                            <span className="text-lg font-bold text-red-600">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Failed Rows List */}
                {failedRows.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Failed Rows - Action Required</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {failedRows.map((row) => (
                        <div key={row.row} className="bg-red-50 rounded-lg p-4">
                          <div className="flex items-start">
                            <span className="text-red-600 font-medium mr-3">Row {row.row}:</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 mb-2">UPIN: {row.upin}</p>
                              <ul className="space-y-1">
                                {row.errors.map((error, index) => (
                                  <li key={index} className="text-sm text-red-700 flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{error}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skipped Rows List */}
                {skippedRows.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Skipped Rows</h2>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {skippedRows.map((row) => (
                        <div key={row.row} className="bg-yellow-50 rounded-lg p-3">
                          <p className="text-sm">
                            <span className="font-medium">Row {row.row}:</span> UPIN {row.upin} - {row.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Report Preview */}
            {reportContent && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Full Report</h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={downloadReport}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Report
                    </button>
                    <button
                      onClick={handleNewUpload}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Upload Another File
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-auto max-h-96">
                  <pre className="whitespace-pre-wrap">{reportContent}</pre>
                </div>
              </div>
            )}

            {/* Action Buttons for Failed/Skipped Rows */}
            {uploadStats && (uploadStats.failedRows > 0 || uploadStats.skippedRows > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Action Required</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        {uploadStats.failedRows} row(s) failed and {uploadStats.skippedRows} row(s) were skipped.
                        Please review the errors above, fix the issues, and upload the corrected rows.
                      </p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={handleNewUpload}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200"
                      >
                        Upload Corrected File
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelUploadPage;