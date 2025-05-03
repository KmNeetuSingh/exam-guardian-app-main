import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Camera, CheckCircle, Clock, Upload, XCircle, Loader2, Info, UserCheck } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useParams, Link } from 'react-router-dom';
import { startSession, submitIdForVerification, verifyFaceMatch } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ExamStart = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [capturedIdUrl, setCapturedIdUrl] = useState<string | null>(null);
  const [liveSnapshotUrl, setLiveSnapshotUrl] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [examDetails] = useState({
    title: "Exam Verification",
    duration: "2 hours",
    instructor: "Dr. Jane Smith",
    startTime: "2025-05-10T14:00:00",
  });

  // Start webcam automatically based on verification status
  useEffect(() => {
    // If ID is not verified, standard 2-step flow (webcam check first)
    if (user && !user.isIdVerified && step === 1 && !webcamActive) {
      startWebcam();
    }
    // If ID *is* verified, start webcam immediately for face verification
    else if (user && user.isIdVerified && !webcamActive) {
      startWebcam();
    }

    // Keep cleanup logic
    return () => {
      if (webcamActive) {
        stopWebcam();
      }
    };
    // Dependencies for automatic start
  }, [user, step, webcamActive]);

  // Auto-capture effect for verified users
  useEffect(() => {
    // Only for verified users with active webcams
    if (user?.isIdVerified && webcamActive && !isLoading && !liveSnapshotUrl) {
      // Add a small delay to ensure webcam is properly initialized
      const timer = setTimeout(() => {
        console.log("[AutoCapture] Starting automatic face verification");
        handleCaptureAndVerifyFace();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [webcamActive, user?.isIdVerified]);

  // Start webcam with improved error handling
  const startWebcam = async () => {
    if (webcamActive) return; // Prevent restarting if already active
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, // Prefer front camera
        audio: false
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        console.log('[startWebcam] videoRef found, assigning srcObject and adding listener.');
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          console.log('[startWebcam] onloadedmetadata event fired!');
          videoRef.current?.play().catch(err => {
            console.error("Video play failed:", err);
          });
          setWebcamActive(true);
          console.log('[startWebcam] setWebcamActive(true) called.');
        };
        videoRef.current.onerror = (e) => {
            console.error('[startWebcam] Video element error:', e);
        };
      } else {
          console.error('[startWebcam] videoRef.current is null.');
      }
      
      toast({
        title: "Webcam active",
        description: user?.isIdVerified ? "Position your face for verification." : "Webcam check successful.",
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
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File Too Large", description: "Please upload an image under 10MB.", variant: "destructive" });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File Type", description: "Please upload an image file (JPG, PNG, etc.).", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedIdUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle next step
  const handleNextStep = async () => { // Make async
    if (step === 1 && !stream) {
      toast({
        title: "Webcam required",
        description: "Please enable your webcam to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 2 && !capturedIdUrl) {
      toast({
        title: "ID required",
        description: "Please upload your ID to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // If moving from step 2 to 3, start the session first
    if (step === 2 && capturedIdUrl) {
      setIsLoading(true);
      try {
        await submitIdForVerification(examId!, capturedIdUrl);
        toast({ title: "ID Submitted", description: "Your ID is submitted for verification. Check dashboard for status.", variant: "default", duration: 5000 });
        navigate('/student/dashboard');
      } catch (error: any) {
        console.error("ID Submission failed:", error);
        toast({ title: "Submission Failed", description: error?.response?.data?.message || "Could not submit ID.", variant: "destructive" });
        setIsLoading(false);
        return; // Don't proceed if submission fails
      }
    } else if (step === 1) {
        setStep(2); // Move from step 1 to 2 normally
    } else if (step === 3) {
        // If already on step 3, proceed to the exam page
        navigate(`/student/exam/${examId}`); 
    }
  };

  // Take snapshot and initiate verification
  const handleCaptureAndVerifyFace = async () => {
    // Check for missing user or profile picture
    if (!user) {
      toast({ title: "Error", description: "User information is missing. Please log in again.", variant: "destructive" });
      return;
    }
    
    // Check if profile picture exists
    if (!user.profilePicture) {
      toast({ 
        title: "Profile Picture Missing", 
        description: "You need to set a profile picture before verification. Update it from the profile menu.",
        variant: "destructive" 
      });
      return;
    }

    // Check if webcam is ready
    if (!videoRef.current || !canvasRef.current || !webcamActive) {
      toast({ title: "Webcam Error", description: "Webcam is not active. Please enable your camera and try again.", variant: "destructive" });
      return;
    }

    console.log("Starting face verification with user:", user);
    console.log("Profile picture path:", user.profilePicture);

    setIsLoading(true);
    setLiveSnapshotUrl(null); // Clear previous attempt

    // Take Snapshot
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
        toast({ title: "Canvas Error", description: "Could not get canvas context.", variant: "destructive" });
        setIsLoading(false);
        return;
    }
    // Draw potentially mirrored image if video CSS transforms it
    const isMirrored = window.getComputedStyle(video).transform !== 'none';
    if (isMirrored) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (isMirrored) {
        // Reset transform to get correct data URL
        context.setTransform(1, 0, 0, 1, 0, 0); 
    }
    const liveSnapshotDataUrl = canvas.toDataURL('image/png');
    setLiveSnapshotUrl(liveSnapshotDataUrl); // Show preview

    // Construct full profile picture URL (handling potential missing base URL)
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, ''); // Get base URL
    const profilePicUrl = `${baseUrl}${user.profilePicture}`; 
    console.log("Full profile picture URL for verification:", profilePicUrl);

    try {
      // Simulate AI Face Match Call
      console.log("Simulating AI face match between live snapshot and profile pic:", profilePicUrl);
      const matchResult = await verifyFaceMatch(liveSnapshotDataUrl, profilePicUrl);

      if (!matchResult.isMatch) {
        // Use message from simulated API if available
        throw new Error(matchResult.message || "Face match failed. Please adjust lighting/position and retry.");
      }

      // --- On Success: Start the exam session and navigate to the exam --- 
      toast({ title: "Face Verification Successful", description: "Starting your exam session...", variant: "default" });
      
      // Check if this is the special verification route
      if (examId === 'verify') {
        // Special case - just redirect to dashboard after successful verification
        toast({ title: "Verification Complete", description: "Redirecting to your dashboard..." });
        setIsLoading(false);
        navigate('/student/dashboard');
        return;
      }
      
      // Normal case - start actual exam session
      console.log(`Starting session for examId: ${examId}`);
      // Assuming startSession only needs examId from student side initially
      const session = await startSession({ examId: examId! }); 
      console.log('Session started:', session.data);
      
      // Navigate to the actual exam-taking page
      // Make sure the route /student/exam/:examId points to your exam component
      toast({ title: "Session Started", description: "Redirecting to your exam..." });
      setIsLoading(false); // Allow navigation
      navigate(`/student/exam/${examId}`); // Navigate to exam interface

      // Remove previous navigation back to dashboard
      // setTimeout(() => {
      //   navigate('/student/dashboard');
      // }, 1500); // Delay to show success

    } catch (error: any) {
      console.error("Face Verification or Session Start failed:", error);
      // Handle specific errors (e.g., session start failure)
      const errorMessage = error?.response?.data?.message || error?.message || "Could not verify face or start session.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      setIsLoading(false); // Allow retry
      setLiveSnapshotUrl(null); // Clear snapshot preview on error
    }
    // No need to set isLoading=false on success path as we navigate away (added above)
  };

  // Helper function to render webcam container with consistent styling
  const renderWebcamContainer = () => (
    <div className="webcam-container relative aspect-video bg-gray-900 flex items-center justify-center rounded-lg overflow-hidden">
      {/* Always render the video element for the ref, hide if not active */} 
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover scale-x-[-1] ${!webcamActive ? 'invisible' : ''}`} // Use invisible to keep layout
      />
      {/* Show placeholder overlay if webcam is not active */} 
      {!webcamActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-8 bg-gray-900 bg-opacity-80">
          <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="mb-6">Webcam check required</p>
          <Button onClick={startWebcam} className="bg-exam-primary hover:bg-exam-accent z-10">
            Enable Camera
          </Button>
        </div>
      )}
    </div>
  );

  // Main return logic
  if (!user) {
    return <div className="container mx-auto max-w-4xl py-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
  }

  // A. ID Verification Flow (if user.isIdVerified is false)
  if (!user.isIdVerified) {
    return (
      <div className="container mx-auto max-w-4xl py-8 animate-fade-in">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Initial ID Verification</CardTitle>
            <CardDescription>
              Submit your ID for verification by a proctor before starting exams.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* For testing only - Debug button */}
              <div className="bg-yellow-100 p-3 rounded-md mb-2">
                <Button onClick={() => {
                  // Force user to be verified for testing
                  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                  storedUser.isIdVerified = true;
                  localStorage.setItem('user', JSON.stringify(storedUser));
                  toast({ title: "Debug", description: "Set isIdVerified=true. Reload the page to see effect." });
                  setTimeout(() => window.location.reload(), 1500);
                }} size="sm" variant="outline" className="bg-yellow-200">
                  DEBUG: Force ID Verified
                </Button>
              </div>
              
              {/* Steps progress - Simplified to 2 steps */}
              <div className="flex justify-between text-sm">
                <div className={`flex flex-col items-center ${step >= 1 ? 'text-exam-primary font-medium' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 1 ? 'bg-exam-primary text-white border-exam-primary' : 'border-gray-200'}`}>
                    1
                  </div>
                  <span className="mt-1">Webcam Check</span>
                </div>
                <Separator className="flex-grow my-4 mx-2" />
                <div className={`flex flex-col items-center ${step >= 2 ? 'text-exam-primary font-medium' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 2 ? 'bg-exam-primary text-white border-exam-primary' : 'border-gray-200'}`}>
                    2
                  </div>
                  <span className="mt-1">Upload ID Photo</span>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                {/* Step 1: Webcam Check */}
                {step === 1 && (
                   <div className="space-y-6">
                     <div>
                       <h3 className="text-xl font-medium mb-2">Webcam Check</h3>
                       <p className="text-gray-600">
                         Please ensure your webcam is working correctly.
                       </p>
                     </div>
                     {renderWebcamContainer()}
                     {webcamActive && (
                       <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                         <div className="flex items-center gap-2 text-green-700">
                           <CheckCircle className="h-5 w-5" />
                           <span>Webcam check successful!</span>
                         </div>
                       </div>
                     )}
                   </div>
                )}
                {/* Step 2: ID Submission */}
                {step === 2 && (
                   <div className="space-y-6">
                     <div>
                       <h3 className="text-xl font-medium mb-2">Upload ID Photo</h3>
                       <p className="text-gray-600">
                         Upload a clear image of your official ID document for proctor verification.
                       </p>
                     </div>
                     <div className="flex-1">
                       {capturedIdUrl ? (
                         <div className="border-2 border-dashed border-exam-primary rounded-lg p-4">
                           <div className="relative">
                             <img
                               src={capturedIdUrl}
                               alt="ID Preview"
                               className="w-full rounded-lg max-h-60 object-contain"
                             />
                             <button
                               onClick={() => setCapturedIdUrl(null)}
                               className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                               aria-label="Remove ID image"
                             >
                               <XCircle className="h-5 w-5 text-red-500" />
                             </button>
                           </div>
                           <div className="mt-4 flex items-center gap-2 text-green-600">
                             <CheckCircle className="h-5 w-5" />
                             <span>ID ready for submission</span>
                           </div>
                         </div>
                       ) : (
                         <div
                           className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-exam-primary transition-colors cursor-pointer"
                           onClick={() => document.getElementById('id-upload')?.click()}
                         >
                           <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                           <p className="mb-2 text-gray-600">Click to upload your ID</p>
                           <p className="text-xs text-gray-500">JPG, PNG (Max 10MB)</p>
                           <input
                             id="id-upload"
                             type="file"
                             accept="image/jpeg, image/png"
                             onChange={handleIdUpload}
                             className="hidden"
                           />
                         </div>
                       )}
                     </div>
                   </div>
                )}
              </div>
              {/* Navigation Buttons for ID Flow */}
              <div className="flex justify-end">
                <Button
                  onClick={handleNextStep}
                  className="bg-exam-primary hover:bg-exam-accent min-w-[120px]"
                  disabled={isLoading || (step === 1 && !webcamActive) || (step === 2 && !capturedIdUrl)}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {step === 1 ? "Continue to ID Upload" : (isLoading ? "Submitting..." : "Submit ID for Verification")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // B. Face Verification Flow (if user.isIdVerified is true)
  return (
    <div className="container mx-auto max-w-2xl py-8 animate-fade-in">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Face Verification</CardTitle>
          <CardDescription>
            {webcamActive && !liveSnapshotUrl ? 
              "Automatic face verification in progress. Please look at the camera..." :
              "Verify your identity by comparing your live image with your profile picture."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Debug Option */}
          <div className="bg-yellow-50 p-2 rounded-md mb-2 text-xs">
            <Button onClick={() => {
              // Force profile picture for testing
              const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
              if (!storedUser.profilePicture) {
                storedUser.profilePicture = '/uploads/profile-pics/default-profile.jpg';
                localStorage.setItem('user', JSON.stringify(storedUser));
                toast({ title: "Debug", description: "Set mock profile picture. Reloading page..." });
                setTimeout(() => window.location.reload(), 1000);
              } else {
                console.log("Current profile picture:", storedUser.profilePicture);
                toast({ title: "Info", description: `Current profile pic: ${storedUser.profilePicture}` });
              }
            }} size="sm" variant="outline" className="bg-yellow-100 text-xs">
              DEBUG: Profile Picture
            </Button>
          </div>
          
          {/* Webcam View */}
          {renderWebcamContainer()}
          {/* Hidden Canvas */} 
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          
          {/* Automatic Verification Progress Indicator */}
          {webcamActive && !liveSnapshotUrl && (
            <div className="flex items-center justify-center gap-2 text-exam-primary">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Automatic face verification in progress...</span>
            </div>
          )}
          
          {/* Snapshot Preview Area */} 
          {liveSnapshotUrl && (
            <div className="mt-4 border p-2 rounded-lg flex flex-col items-center gap-2">
              <img src={liveSnapshotUrl} alt="Live Snapshot" className="max-w-xs rounded"/>
              <p className="text-sm text-gray-600">Captured Image Preview</p>
            </div>
          )}

          {/* Profile Picture Reference */} 
          {user.profilePicture && (
             <div className="mt-4 border p-2 rounded-lg flex flex-col items-center gap-2 bg-gray-50">
                <Avatar className="h-20 w-20">
                   <AvatarImage 
                     src={`${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '')}${user.profilePicture}?v=${Date.now()}`} 
                     alt="Profile Picture"
                   />
                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-sm text-gray-600">Your Profile Picture (for comparison)</p>
            </div>
          )}
          {!user.profilePicture && (
              <p className="text-center text-red-600">Profile picture not found. Cannot perform face verification.</p>
          )}

          {/* Action Button */} 
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleCaptureAndVerifyFace}
              className="bg-green-600 hover:bg-green-700 min-w-[180px]"
              disabled={isLoading || !webcamActive || !user.profilePicture}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserCheck className="h-4 w-4 mr-2"/>}
              {isLoading ? "Verifying..." : "Capture & Verify Face"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamStart;
