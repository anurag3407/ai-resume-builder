import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Spinner } from '../components/ui/Loading';
import { formatDate } from '../lib/utils';
import {
  Plus,
  FileText,
  Calendar,
  Briefcase,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { resumes, loading, fetchResumes, deleteResume } = useResumeStore();

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleDelete = async (resumeId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await deleteResume(resumeId);
        toast.success('Resume deleted successfully');
      } catch {
        toast.error('Failed to delete resume');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.displayName || 'there'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your resumes and create new ones
          </p>
        </div>
        <Link to="/upload">
          <Button>
            <Plus className="h-5 w-5 mr-2" />
            New Resume
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{resumes.length}</p>
              <p className="text-sm text-gray-600">Total Resumes</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(resumes.map((r) => r.jobRole).filter(Boolean)).size}
              </p>
              <p className="text-sm text-gray-600">Job Roles Targeted</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {resumes.length > 0
                  ? formatDate(resumes[0]?.createdAt || new Date())
                  : 'N/A'}
              </p>
              <p className="text-sm text-gray-600">Last Updated</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumes List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Resumes</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : resumes.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No resumes yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first AI-optimized resume to get started
              </p>
              <Link to="/upload">
                <Button>
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Resume
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume, index) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/editor/${resume.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="py-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleDelete(resume.id, e)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {resume.title || 'Untitled Resume'}
                      </h3>
                      
                      {resume.jobRole && (
                        <p className="text-sm text-blue-600 mb-3">
                          {resume.jobRole}
                        </p>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(resume.createdAt)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
