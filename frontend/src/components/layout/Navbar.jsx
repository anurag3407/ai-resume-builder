import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { 
  FileText, 
  Home, 
  Upload, 
  User, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/upload', label: 'New Resume', icon: Upload },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-black/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
              <FileText className="h-7 w-7 text-blue-400" />
              <span className="text-xl font-bold text-white">
                AI Resume Builder
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive(path)
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="h-9 w-9 rounded-full ring-2 ring-white/10"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center ring-2 ring-white/10">
                      <span className="text-blue-400 font-medium text-sm">
                        {(user.displayName || user.email)?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden md:flex text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-sm">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(path)
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 w-full"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
