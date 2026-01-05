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
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
              Welcome back, {user?.displayName || 'there'}! 👋
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your resumes and create new ones
            </p>
          </div>
          <Link to="/upload">
            <Button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/30">
              <Plus className="h-5 w-5 mr-2" />
              New Resume
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="flex items-center gap-6 py-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
              <div className="h-14 w-14 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <FileText className="h-7 w-7 text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{resumes.length}</p>
                <p className="text-sm text-gray-400 mt-1">Total Resumes</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-6 py-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
              <div className="h-14 w-14 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Briefcase className="h-7 w-7 text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {new Set(resumes.map((r) => r.jobRole).filter(Boolean)).size}
                </p>
                <p className="text-sm text-gray-400 mt-1">Job Roles Targeted</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-6 py-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
              <div className="h-14 w-14 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Calendar className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {resumes.length > 0
                    ? formatDate(resumes[0]?.createdAt || new Date())
                    : 'N/A'}
                </p>
                <p className="text-sm text-gray-400 mt-1">Last Updated</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumes List */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-6">Your Resumes</h2>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : resumes.length === 0 ? (
            <Card>
              <CardContent className="py-24 text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <FileText className="h-20 w-20 text-gray-600 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-white mb-3">
                  No resumes yet
                </h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Create your first AI-optimized resume to get started
                </p>
                <Link to="/upload">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg transition-all duration-200">
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
                    <Card className="hover:border-white/20 transition-all cursor-pointer h-full group">
                      <CardContent className="py-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                        <div className="flex items-start justify-between mb-6">
                          <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <FileText className="h-6 w-6 text-blue-400" />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleDelete(resume.id, e)}
                              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-white mb-2 truncate text-lg">
                          {resume.title || 'Untitled Resume'}
                        </h3>
                        
                        {resume.jobRole && (
                          <p className="text-sm text-blue-400 mb-4">
                            {resume.jobRole}
                          </p>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
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
    </div>
  );
}
