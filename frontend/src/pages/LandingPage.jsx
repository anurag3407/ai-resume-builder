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
    <div className="overflow-hidden bg-black">
      {/* Hero Section */}
      <section className="relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Powered by Google Gemini AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
              Build Your Perfect Resume
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">in Minutes with AI</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Transform your resume into an ATS-optimized, professionally formatted
              document tailored to your dream job. Get hired faster with AI-powered
              resume enhancement.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button 
                  size="lg" 
                  className="bg-blue-600 text-white hover:bg-blue-700 px-10 py-6 text-base font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/5 bg-transparent px-10 py-6 text-base font-medium rounded-lg transition-all duration-200"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
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
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10 group"
              >
                <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-gradient-to-b from-black to-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
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
                <div className="text-6xl font-bold text-blue-500/20 mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-b from-black via-blue-950/20 to-black border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to Transform Your Resume?
            </h2>
            <p className="text-lg text-gray-400 mb-12">
              Join thousands of job seekers who have improved their resumes with AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/signup">
                <Button 
                  size="lg" 
                  className="bg-blue-600 text-white hover:bg-blue-700 px-10 py-6 text-base font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/50"
                >
                  Start Building Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-12 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-400" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-400" />
                <span>No credit card required</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
