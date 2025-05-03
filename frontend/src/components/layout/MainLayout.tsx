import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LogOut, User, ChevronDown, Moon, Sun, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProfilePicModal from '../modals/ProfilePicModal';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  console.log("VITE_API_BASE_URL loaded as:", import.meta.env.VITE_API_BASE_URL);

  const { user, logout, refreshUserProfile } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Refresh user data on mount
  useEffect(() => {
    if (user) {
      console.log("MainLayout: Refreshing user profile data");
      refreshUserProfile().catch(err => {
        console.error("Failed to refresh profile in MainLayout:", err);
      });
    }
  }, [refreshUserProfile]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Handle dark mode toggle and save preference
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow dark:bg-[#111827]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {user ? (
            <span className="text-xl font-bold text-exam-primary cursor-not-allowed opacity-60 select-none">
              Exam Guardian
            </span>
          ) : (
          <Link to="/">
            <h1 className="text-xl font-bold text-exam-primary">Exam Guardian</h1>
          </Link>
          )}
          <div className="flex items-center gap-4 relative">
            {/* Dark mode toggle */}
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-700" />}
            </button>
          {user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  className="flex items-center gap-2 focus:outline-none"
                  onClick={() => setDropdownOpen((open) => !open)}
                  aria-label="Profile menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.profilePicture ? `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '')}${user.profilePicture}${user.profilePicture.includes('?') ? '&' : '?'}cache=${new Date().getTime()}` : undefined}
                      alt={user.name}
                    />
                    <AvatarFallback className="bg-exam-secondary text-white">
                      {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50 p-4 min-w-[200px] dark:bg-[#1f2937] dark:border-[#374151]">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                           src={user.profilePicture ? `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '')}${user.profilePicture}${user.profilePicture.includes('?') ? '&' : '?'}cache=${new Date().getTime()}` : undefined}
                           alt={user.name}
                        />
                         <AvatarFallback className="bg-exam-secondary text-white">
                            {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white break-words">{user.name}</div>
                        <div className="text-xs text-gray-500 break-all dark:text-gray-300">{user.email || user.id}</div>
                        <div className="text-xs text-exam-primary font-medium mt-1">{user.role}</div>
                      </div>
                    </div>
                    <div className="border-t my-2 dark:border-gray-600"></div>
                    
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-left text-sm text-gray-700 dark:text-gray-200"
                      onClick={() => {
                        setProfileModalOpen(true);
                        setDropdownOpen(false);
                      }}
                    >
                      <ImageIcon className="h-4 w-4" /> Update Profile Picture
                    </button>

                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-left text-sm text-gray-700 dark:text-gray-200 mt-1"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
            </div>
          ) : (
              <>
              <Link to="/login" className="text-exam-primary hover:text-exam-accent">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-exam-primary text-white px-4 py-2 rounded-md hover:bg-exam-accent transition-colors"
              >
                Register
              </Link>
              </>
            )}
            </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children || <Outlet />}
      </main>
      <footer className="bg-gray-100 py-6 dark:bg-[#1f2937]">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
          <p>© {new Date().getFullYear()} Exam Guardian - All rights reserved</p>
        </div>
      </footer>

      {user && (
        <div className="hidden">
          {user.profilePicture ? `${import.meta.env.VITE_API_BASE_URL}${user.profilePicture}` : 'undefined'}
        </div>
      )}

      <ProfilePicModal 
        isOpen={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
      />
    </div>
  );
};

export default MainLayout;
