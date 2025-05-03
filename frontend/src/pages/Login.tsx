import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { login } from '@/api/api';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await login(email, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      toast({
        title: "Login successful",
        description: `Welcome back! You are logged in as a ${res.data.user.role}.`,
      });
      if (res.data.user.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/proctor/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error?.response?.data?.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-8 shadow-lg animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Login to Exam Guardian</h1>
          <p className="text-gray-600 mt-2">Enter your credentials to access your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" 
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <Label>Login as</Label>
            <RadioGroup defaultValue="student" value={role} onValueChange={setRole} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student" className="cursor-pointer">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="proctor" id="proctor" />
                <Label htmlFor="proctor" className="cursor-pointer">Proctor</Label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" className="w-full bg-exam-primary hover:bg-exam-accent" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <div className="text-center text-sm">
            <Link to="/forgot-password" className="text-exam-primary hover:text-exam-accent">
              Forgot password?
            </Link>
            <p className="mt-2 text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-exam-primary hover:text-exam-accent font-medium">
                Register
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
