import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useResumeStore } from '../store/resumeStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Spinner } from '../components/ui/Loading';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function UploadPage() {
  const navigate = useNavigate();
  const { uploadResume, extractedText, loading, error, resetWorkflow } = useResumeStore();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadedFile(file);

    try {
      await uploadResume(file);
      setUploadComplete(true);
      toast.success('Resume uploaded and text extracted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload resume');
    }
  }, [uploadResume]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: loading,
  });

  const handleReset = () => {
    setUploadedFile(null);
    setUploadComplete(false);
    resetWorkflow();
  };

  const handleContinue = () => {
    navigate('/preferences');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <span className="text-sm font-medium text-blue-600">Upload</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <span className="text-sm text-gray-500">Preferences</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span className="text-sm text-gray-500">Enhance</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Upload Your Resume</CardTitle>
          <CardDescription>
            Upload your existing resume as a PDF to get started
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Dropzone */}
          {!uploadComplete ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              
              {loading ? (
                <div className="flex flex-col items-center">
                  <Spinner size="lg" />
                  <p className="mt-4 text-gray-600">Extracting text from PDF...</p>
                </div>
              ) : uploadedFile ? (
                <div className="flex flex-col items-center">
                  <FileText className="h-12 w-12 text-blue-600 mb-4" />
                  <p className="text-lg font-medium text-gray-900">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive
                      ? 'Drop your resume here'
                      : 'Drag & drop your resume here'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    or click to browse files
                  </p>
                  <p className="text-xs text-gray-400 mt-4">
                    PDF only, max 5MB
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="border border-green-200 bg-green-50 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-green-800">
                    Resume uploaded successfully!
                  </h3>
                  <p className="text-sm text-green-600 mt-1">
                    {uploadedFile?.name}
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Extracted Text Preview */}
          {uploadComplete && extractedText && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Extracted Text Preview
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {extractedText.slice(0, 2000)}
                  {extractedText.length > 2000 && '...'}
                </pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {extractedText.length} characters extracted
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!uploadComplete}
            >
              Continue to Preferences
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
