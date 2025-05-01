
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  // For now we'll mock a logged-in user state
  const user = { name: "Neetu", role: "student" };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/">
            <h1 className="text-xl font-bold text-exam-primary">Exam Guardian</h1>
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-exam-secondary rounded-full p-1">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs bg-exam-primary text-white px-2 py-1 rounded-full">
                  {user.role}
                </span>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <LogOut className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-exam-primary hover:text-exam-accent">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-exam-primary text-white px-4 py-2 rounded-md hover:bg-exam-accent transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {children || <Outlet />}
      </main>
      
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Exam Guardian - All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
