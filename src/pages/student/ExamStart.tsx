
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Camera, CheckCircle, Clock, Upload, XCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useParams } from 'react-router-dom';

const ExamStart = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [webcamActive, setWebcamActive] = useState(false);
  const [examDetails] = useState({
    title: "Mathematics Final Exam",
    duration: "2 hours",
    instructor: "Dr. Jane Smith",
    startTime: "2025-05-10T14:00:00",
  });

  // Start webcam with improved error handling
  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setWebcamActive(true);
          console.log("Webcam video is now playing");
        };
      }
      
      toast({
        title: "Webcam active",
        description: "Your webcam has been successfully activated. You are now visible.",
      });
    } catch (error) {
      console.error("Error accessing webcam:", error);
      toast({
        title: "Webcam error",
        description: "Could not access your webcam. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setWebcamActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Handle file upload
  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setIdImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (step === 1 && !stream) {
      toast({
        title: "Webcam required",
        description: "Please enable your webcam to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2 && !idImage) {
      toast({
        title: "ID required",
        description: "Please upload your ID to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleStartExam();
    }
  };

  // Handle start exam
  const handleStartExam = async () => {
    setIsLoading(true);
    
    // Simulate verification process
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Exam started",
      description: "Your exam session has been successfully started. The proctor can now see your webcam feed.",
    });
    
    setIsLoading(false);
    // Pass webcam stream information to exam page
    navigate(`/student/exam/${examId}`);
  };

  // Clean up webcam on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  // Helper function to render webcam container with consistent styling
  const renderWebcamContainer = () => (
    <div className="webcam-container aspect-video bg-gray-900 flex items-center justify-center">
      {!webcamActive ? (
        <div className="text-center text-white p-8">
          <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="mb-6">Webcam access is required to take this exam</p>
          <Button onClick={startWebcam} className="bg-exam-primary hover:bg-exam-accent">
            Enable Camera
          </Button>
        </div>
      ) : (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );

  return (
    <div className="container mx-auto max-w-4xl py-8 animate-fade-in">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{examDetails.title}</CardTitle>
          <CardDescription>
            Complete the following steps to start your exam
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-8">
            {/* Steps progress */}
            <div className="flex justify-between text-sm">
              <div className={`flex flex-col items-center ${step >= 1 ? 'text-exam-primary font-medium' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 1 ? 'bg-exam-primary text-white border-exam-primary' : 'border-gray-200'}`}>
                  1
                </div>
                <span className="mt-1">Webcam</span>
              </div>
              <Separator className="flex-grow my-4 mx-2" />
              <div className={`flex flex-col items-center ${step >= 2 ? 'text-exam-primary font-medium' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 2 ? 'bg-exam-primary text-white border-exam-primary' : 'border-gray-200'}`}>
                  2
                </div>
                <span className="mt-1">ID Verification</span>
              </div>
              <Separator className="flex-grow my-4 mx-2" />
              <div className={`flex flex-col items-center ${step >= 3 ? 'text-exam-primary font-medium' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 3 ? 'bg-exam-primary text-white border-exam-primary' : 'border-gray-200'}`}>
                  3
                </div>
                <span className="mt-1">Begin Exam</span>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              {/* Step 1: Webcam Setup */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium mb-2">Webcam Setup</h3>
                    <p className="text-gray-600">
                      Please enable your webcam. You will be monitored throughout the exam.
                    </p>
                  </div>
                  
                  {renderWebcamContainer()}
                  
                  {webcamActive && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        <span>Webcam active - Both you and the proctor can see this feed</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 2: ID Verification */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium mb-2">ID Verification</h3>
                    <p className="text-gray-600">
                      Please upload a clear image of your official identification document.
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      {renderWebcamContainer()}
                    </div>
                    
                    <div className="flex-1">
                      {idImage ? (
                        <div className="border-2 border-dashed border-exam-primary rounded-lg p-4">
                          <div className="relative">
                            <img 
                              src={idImage} 
                              alt="ID" 
                              className="w-full rounded-lg"
                            />
                            <button 
                              onClick={() => setIdImage(null)} 
                              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                            >
                              <XCircle className="h-5 w-5 text-red-500" />
                            </button>
                          </div>
                          <div className="mt-4 flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span>ID uploaded successfully</span>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-exam-primary transition-colors cursor-pointer"
                          onClick={() => document.getElementById('id-upload')?.click()}
                        >
                          <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                          <p className="mb-2 text-gray-600">Click to upload your ID</p>
                          <p className="text-xs text-gray-500">Supported formats: JPG, PNG (Max 10MB)</p>
                          <input 
                            id="id-upload"
                            type="file" 
                            accept="image/*"
                            onChange={handleIdUpload}
                            className="hidden" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 3: Begin Exam */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium mb-2">Begin Exam</h3>
                    <p className="text-gray-600">
                      Verify the details below and start your exam.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      {renderWebcamContainer()}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium text-gray-900">Exam Details</h4>
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Exam:</span>
                            <span className="font-medium">{examDetails.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Duration:</span>
                            <span>{examDetails.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Instructor:</span>
                            <span>{examDetails.instructor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Start Time:</span>
                            <span>{new Date(examDetails.startTime).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium flex items-center gap-2 text-yellow-800">
                          <Clock className="h-5 w-5" />
                          <span>Important Notice</span>
                        </h4>
                        <ul className="mt-2 text-sm space-y-1 text-yellow-800">
                          <li>• Your webcam must remain on during the entire exam</li>
                          <li>• Leaving the exam window may flag your session</li>
                          <li>• Once started, the exam timer cannot be paused</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {isLoading && (
                    <div className="mt-6">
                      <p className="mb-2 text-sm text-gray-600">Verifying identity and setting up exam...</p>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              
              <Button 
                onClick={handleNextStep} 
                className="bg-exam-primary hover:bg-exam-accent"
                disabled={isLoading}
              >
                {step === 3 ? (isLoading ? "Setting Up..." : "Start Exam") : "Continue"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamStart;
