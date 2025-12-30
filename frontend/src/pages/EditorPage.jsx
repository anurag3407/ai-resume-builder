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
  const [content, setContent] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only initialize once
    if (isInitialized) return;

    if (resumeId) {
      // Load existing resume
      fetchResume(resumeId).then((resume) => {
        if (resume) {
          setContent(resume.enhancedText || resume.originalText || '');
          setTitle(resume.title || '');
          setIsInitialized(true);
        }
      });
    } else if (enhancedText) {
      // Use the newly enhanced text
      setContent(enhancedText);
      setTitle(`Resume - ${preferences.jobRole || 'New'}`);
      setIsInitialized(true);
    } else {
      // No content, redirect
      navigate('/upload');
    }
  }, [resumeId, isInitialized]);

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
    if (!content) return;

    setIsGeneratingPdf(true);
    toast.loading('Generating PDF...', { id: 'pdf' });

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let y = margin;

      // Set default font
      const fontFamily = font === 'Times New Roman' ? 'times' : 'helvetica';
      pdf.setFont(fontFamily, 'normal');

      // Helper function to add new page if needed
      const checkPageBreak = (lineHeight = 7) => {
        if (y + lineHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
      };

      // Helper function to render a line with mixed text and links (centered)
      const renderContactLine = (text, centerX, currentY) => {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(text)) !== null) {
          if (match.index > lastIndex) {
            parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
          }
          parts.push({ type: 'link', text: match[1], url: match[2] });
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
          parts.push({ type: 'text', content: text.substring(lastIndex) });
        }

        // Calculate total width
        pdf.setFontSize(10);
        let totalWidth = 0;
        parts.forEach(part => {
          totalWidth += pdf.getTextWidth(part.type === 'link' ? part.text : part.content);
        });

        // Start from center
        let x = (pageWidth - totalWidth) / 2;

        parts.forEach(part => {
          if (part.type === 'link') {
            pdf.setTextColor(37, 99, 235); // blue-600
            pdf.textWithLink(part.text, x, currentY, { url: part.url });
            x += pdf.getTextWidth(part.text);
          } else {
            pdf.setTextColor(55, 65, 81); // gray-700
            pdf.text(part.content, x, currentY);
            x += pdf.getTextWidth(part.content);
          }
        });
        pdf.setTextColor(0, 0, 0);
      };

      // Helper function to render text with inline links
      const renderLineWithLinks = (text, startX, currentY, maxWidth) => {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(text)) !== null) {
          if (match.index > lastIndex) {
            parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
          }
          parts.push({ type: 'link', text: match[1], url: match[2] });
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
          parts.push({ type: 'text', content: text.substring(lastIndex) });
        }

        if (parts.length === 0 || (parts.length === 1 && parts[0].type === 'text')) {
          // No links, simple text
          const lines = pdf.splitTextToSize(text, maxWidth);
          lines.forEach(line => {
            checkPageBreak(5);
            pdf.text(line, startX, y);
            y += 4.5;
          });
          return;
        }

        // Render parts
        let x = startX;
        parts.forEach(part => {
          if (part.type === 'link') {
            pdf.setTextColor(37, 99, 235);
            pdf.textWithLink(part.text, x, y, { url: part.url });
            x += pdf.getTextWidth(part.text);
          } else {
            pdf.setTextColor(55, 65, 81);
            pdf.text(part.content, x, y);
            x += pdf.getTextWidth(part.content);
          }
        });
        pdf.setTextColor(0, 0, 0);
        y += 4.5;
      };

      // Parse markdown content line by line
      const lines = content.split('\n');
      let isContactLine = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line) {
          y += 2;
          continue;
        }

        // H1 - Name (centered, bold, large)
        if (line.startsWith('# ')) {
          checkPageBreak(15);
          pdf.setFont(fontFamily, 'bold');
          pdf.setFontSize(20);
          pdf.setTextColor(17, 24, 39);
          const text = line.substring(2);
          const textWidth = pdf.getTextWidth(text);
          pdf.text(text, (pageWidth - textWidth) / 2, y);
          y += 7;
          isContactLine = true; // Next non-empty line is contact info
          continue;
        }

        // Contact line (contains email/links, centered)
        if (isContactLine && (line.includes('@') || line.includes('](') || line.includes('|'))) {
          checkPageBreak(8);
          pdf.setFont(fontFamily, 'normal');
          pdf.setFontSize(9);
          renderContactLine(line, pageWidth / 2, y);
          y += 5;
          // Add line separator after contact
          pdf.setLineWidth(0.4);
          pdf.setDrawColor(17, 24, 39);
          pdf.line(margin, y, pageWidth - margin, y);
          y += 6;
          isContactLine = false;
          continue;
        }
        isContactLine = false;

        // H2 - Section headers
        if (line.startsWith('## ')) {
          checkPageBreak(12);
          y += 3;
          pdf.setFont(fontFamily, 'bold');
          pdf.setFontSize(11);
          pdf.setTextColor(17, 24, 39);
          const text = line.substring(3).toUpperCase();
          pdf.text(text, margin, y);
          y += 1;
          pdf.setLineWidth(0.2);
          pdf.setDrawColor(100, 100, 100);
          pdf.line(margin, y + 1, pageWidth - margin, y + 1);
          y += 5;
          continue;
        }

        // Bold line (job title, degree, project name)
        if (line.startsWith('**') && line.includes('**')) {
          checkPageBreak(7);
          pdf.setFont(fontFamily, 'bold');
          pdf.setFontSize(parseInt(fontSize));
          pdf.setTextColor(17, 24, 39);
          // Remove ** markers
          const cleanLine = line.replace(/\*\*/g, '');
          const textLines = pdf.splitTextToSize(cleanLine, contentWidth);
          textLines.forEach(tLine => {
            checkPageBreak(5);
            pdf.text(tLine, margin, y);
            y += 4.5;
          });
          continue;
        }

        // Bullet points
        if (line.startsWith('- ') || line.startsWith('* ')) {
          checkPageBreak(6);
          pdf.setFont(fontFamily, 'normal');
          pdf.setFontSize(parseInt(fontSize));
          pdf.setTextColor(55, 65, 81);

          let bulletText = line.substring(2);
          // Remove bold markers
          bulletText = bulletText.replace(/\*\*/g, '');

          // Check for links in bullet
          if (bulletText.includes('](')) {
            pdf.text('•', margin, y);
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            let processedText = bulletText.replace(linkRegex, '$1');
            const bulletLines = pdf.splitTextToSize(processedText, contentWidth - 6);
            bulletLines.forEach((bLine, idx) => {
              checkPageBreak(5);
              pdf.text(bLine, margin + 4, y);
              y += 4.5;
            });
            // Add clickable links overlay - simplified approach
          } else {
            const bulletLines = pdf.splitTextToSize(bulletText, contentWidth - 6);
            bulletLines.forEach((bLine, idx) => {
              checkPageBreak(5);
              if (idx === 0) {
                pdf.text('•', margin, y);
              }
              pdf.text(bLine, margin + 4, y);
              y += 4.5;
            });
          }
          continue;
        }

        // Regular paragraph text
        checkPageBreak(6);
        pdf.setFont(fontFamily, 'normal');
        pdf.setFontSize(parseInt(fontSize));
        pdf.setTextColor(55, 65, 81);

        // Remove bold markers
        let processedLine = line.replace(/\*\*/g, '');

        // Check for links
        if (processedLine.includes('](')) {
          renderLineWithLinks(processedLine, margin, y, contentWidth);
        } else {
          const textLines = pdf.splitTextToSize(processedLine, contentWidth);
          textLines.forEach(tLine => {
            checkPageBreak(5);
            pdf.text(tLine, margin, y);
            y += 4.5;
          });
        }
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
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'edit'
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Edit3 className="h-4 w-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => setMode('preview')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'preview'
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
                  style={{
                    width: '210mm',
                    minHeight: '297mm',
                    padding: '20mm',
                    fontFamily: font,
                    fontSize: `${fontSize}pt`,
                    backgroundColor: '#ffffff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    margin: '0 auto',
                  }}
                >
                  <div style={{ maxWidth: 'none' }}>
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            color: '#111827',
                            marginBottom: '0.25rem',
                            borderBottom: '2px solid #111827',
                            paddingBottom: '0.5rem',
                          }}>
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 style={{
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            color: '#111827',
                            marginTop: '1rem',
                            marginBottom: '0.5rem',
                            borderBottom: '1px solid #9CA3AF',
                            paddingBottom: '0.25rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}>
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#111827',
                            marginTop: '0.75rem',
                            marginBottom: '0.25rem',
                          }}>
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p style={{
                            color: '#374151',
                            marginTop: '0.25rem',
                            marginBottom: '0.25rem',
                            lineHeight: '1.625',
                          }}>
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul style={{
                            listStyleType: 'disc',
                            listStylePosition: 'outside',
                            marginLeft: '1.25rem',
                            marginTop: '0.25rem',
                            marginBottom: '0.25rem',
                          }}>
                            {children}
                          </ul>
                        ),
                        li: ({ children }) => (
                          <li style={{ color: '#374151', marginBottom: '0.125rem' }}>{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong style={{ fontWeight: '600', color: '#111827' }}>
                            {children}
                          </strong>
                        ),
                        a: ({ children, href }) => (
                          <a href={href} style={{ color: '#2563EB', textDecoration: 'none' }}>
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
