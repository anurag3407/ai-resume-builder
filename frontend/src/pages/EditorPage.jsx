import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Loading';
import { generateFilename } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Download,
  Save,
  Eye,
  Edit3,
  ArrowLeft,
  FileText,
  Settings,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const FONTS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Calibri', label: 'Calibri' },
  { value: 'Georgia', label: 'Georgia' },
];

const FONT_SIZES = [
  { value: '10', label: '10pt' },
  { value: '11', label: '11pt' },
  { value: '12', label: '12pt' },
];

export function EditorPage() {
  const navigate = useNavigate();
  const { resumeId } = useParams();
  const { user } = useAuthStore();
  const {
    enhancedText,
    preferences,
    currentResume,
    setEnhancedText,
    fetchResume,
    saveResume,
    updateResume,
    loading,
  } = useResumeStore();

  const [mode, setMode] = useState('preview'); // 'edit' | 'preview'
  const [title, setTitle] = useState('');
  const [font, setFont] = useState('Arial');
  const [fontSize, setFontSize] = useState('11');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const previewRef = useRef(null);
  const editorRef = useRef(null);

  // Local state for the editor content
  const [content, setContent] = useState(enhancedText || '');

  useEffect(() => {
    if (resumeId) {
      // Load existing resume
      fetchResume(resumeId).then((resume) => {
        if (resume) {
          setContent(resume.enhancedText || resume.originalText || '');
          setTitle(resume.title || '');
        }
      });
    } else if (enhancedText) {
      // Use the newly enhanced text
      setContent(enhancedText);
      setTitle(`Resume - ${preferences.jobRole || 'New'}`);
    } else {
      // No content, redirect
      navigate('/upload');
    }
  }, [resumeId, enhancedText, preferences.jobRole, fetchResume, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (resumeId) {
        await updateResume(resumeId, {
          enhancedText: content,
          title,
        });
      } else {
        const saved = await saveResume(title);
        // Navigate to the saved resume
        navigate(`/editor/${saved.id}`, { replace: true });
      }
      toast.success('Resume saved successfully!');
    } catch (err) {
      toast.error('Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;

    setIsGeneratingPdf(true);
    toast.loading('Generating PDF...', { id: 'pdf' });

    try {
      const element = previewRef.current;
      
      // Create canvas from the preview
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Calculate dimensions for A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight,
        '',
        'FAST'
      );
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight,
          '',
          'FAST'
        );
        heightLeft -= pageHeight;
      }

      // Generate filename
      const filename = generateFilename(
        user?.displayName || 'User',
        preferences.jobRole || currentResume?.jobRole || 'Resume'
      );

      pdf.save(filename);
      toast.success('PDF downloaded successfully!', { id: 'pdf' });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF', { id: 'pdf' });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resume Title"
                className="w-64 border-0 bg-transparent focus:ring-0 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setMode('edit')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    mode === 'edit'
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Edit3 className="h-4 w-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => setMode('preview')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    mode === 'preview'
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  Preview
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleSave}
                loading={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>

              <Button
                size="sm"
                onClick={handleDownloadPdf}
                loading={isGeneratingPdf}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Font:</label>
                <Select
                  options={FONTS}
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Size:</label>
                <Select
                  options={FONT_SIZES}
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className={mode === 'preview' ? 'hidden lg:block' : ''}>
            <Card className="h-full">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-medium text-gray-900 flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Editor (Markdown)
                </h2>
              </div>
              <div className="p-4">
                <textarea
                  ref={editorRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setEnhancedText(e.target.value);
                  }}
                  className="w-full h-[calc(100vh-300px)] p-4 font-mono text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Your resume content in Markdown format..."
                />
              </div>
            </Card>
          </div>

          {/* Preview */}
          <div className={mode === 'edit' ? 'hidden lg:block' : ''}>
            <Card className="h-full">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-medium text-gray-900 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview (Harvard Template)
                </h2>
              </div>
              <div className="p-4 overflow-auto">
                <div
                  ref={previewRef}
                  className="bg-white shadow-lg mx-auto"
                  style={{
                    width: '210mm',
                    minHeight: '297mm',
                    padding: '20mm',
                    fontFamily: font,
                    fontSize: `${fontSize}pt`,
                  }}
                >
                  <div className="prose prose-sm max-w-none resume-content">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold text-center text-gray-900 mb-1 border-b-2 border-gray-900 pb-2">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2 border-b border-gray-400 pb-1 uppercase tracking-wide">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-semibold text-gray-900 mt-3 mb-1">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-gray-700 my-1 leading-relaxed">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-outside ml-5 my-1 space-y-0.5">
                            {children}
                          </ul>
                        ),
                        li: ({ children }) => (
                          <li className="text-gray-700">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-900">
                            {children}
                          </strong>
                        ),
                        a: ({ children, href }) => (
                          <a href={href} className="text-blue-600 hover:underline">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
