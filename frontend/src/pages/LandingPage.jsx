import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import {
  FileText,
  Sparkles,
  Download,
  Shield,
  Zap,
  Target,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Enhancement',
    description:
      'Our AI analyzes your resume and optimizes it for your target role using advanced language models.',
  },
  {
    icon: Target,
    title: 'ATS-Optimized',
    description:
      'Get past applicant tracking systems with keyword-optimized resumes that recruiters will see.',
  },
  {
    icon: FileText,
    title: 'Harvard Template',
    description:
      'Professional formatting based on the proven Harvard resume template trusted by top employers.',
  },
  {
    icon: Download,
    title: 'Instant PDF Export',
    description:
      'Download your polished resume as a high-quality PDF ready to submit to employers.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description:
      'Your data is encrypted and never shared. We prioritize your privacy and security.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Get your enhanced resume in seconds, not hours. Save time in your job search.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Upload Your Resume',
    description: 'Simply drag and drop your existing PDF resume to get started.',
  },
  {
    number: '02',
    title: 'Choose Your Target Role',
    description: 'Select the job role you\'re targeting and customize preferences.',
  },
  {
    number: '03',
    title: 'AI Enhancement',
    description: 'Our AI optimizes your resume with powerful action verbs and keywords.',
  },
  {
    number: '04',
    title: 'Download & Apply',
    description: 'Review, edit if needed, and download your ATS-ready resume.',
  },
];

export function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium">Powered by Google Gemini AI</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Build Your Perfect Resume
              <br />
              <span className="text-blue-200">in Minutes with AI</span>
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Transform your resume into an ATS-optimized, professionally formatted
              document tailored to your dream job. Get hired faster with AI-powered
              resume enhancement.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 50L48 45.7C96 41.3 192 32.7 288 35.8C384 39 480 54 576 60.2C672 66.3 768 63.7 864 56.5C960 49.3 1056 37.7 1152 35.8C1248 34 1344 42 1392 46L1440 50V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides all the tools you need to create
              a standout resume that gets results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Four simple steps to transform your resume and accelerate your job search.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="text-5xl font-bold text-blue-600/20 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Resume?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Join thousands of job seekers who have improved their resumes with AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
                  Start Building Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>No credit card required</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
