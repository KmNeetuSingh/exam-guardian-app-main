
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Eye, FileText } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-[calc(100vh-14rem)]">
      {/* Hero Section */}
      <div className="py-12 md:py-20 text-center animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-exam-primary to-exam-accent bg-clip-text text-transparent">
          Exam Guardian
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
          Secure online exam monitoring and proctoring for educational institutions
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/login" className="inline-flex">
            <Button size="lg" className="bg-exam-primary hover:bg-exam-accent text-white">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/about" className="inline-flex">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50 rounded-xl my-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            <Card className="p-6 card-hover">
              <div className="mb-4 bg-exam-primary bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center">
                <Camera className="h-6 w-6 text-exam-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Webcam Monitoring</h3>
              <p className="text-gray-600">
                Real-time webcam monitoring ensures students are supervised throughout their exam session.
              </p>
            </Card>
            
            <Card className="p-6 card-hover">
              <div className="mb-4 bg-exam-secondary bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-exam-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ID Verification</h3>
              <p className="text-gray-600">
                Students can upload their identification documents for easy verification before exams.
              </p>
            </Card>
            
            <Card className="p-6 card-hover">
              <div className="mb-4 bg-exam-accent bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-exam-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Proctor Dashboard</h3>
              <p className="text-gray-600">
                Comprehensive dashboard for proctors to monitor multiple students simultaneously.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to secure your exams?</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Join educational institutions worldwide using Exam Guardian for secure, reliable online exam proctoring.
        </p>
        <Link to="/register" className="inline-flex">
          <Button size="lg" className="bg-exam-primary hover:bg-exam-accent text-white">
            Create an Account
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
