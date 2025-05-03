import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Camera, Clock, FileText, User, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Link, useNavigate } from 'react-router-dom';
import { getExams, getSessions, getUsers, startSession } from '@/api/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/AuthContext';
import { Input } from "@/components/ui/input";
import { useNotifications } from '@/context/NotificationContext';

const StudentDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
  const [pastExams, setPastExams] = useState<any[]>([]);
  const [allExams, setAllExams] = useState<any[]>([]);
  const [proctors, setProctors] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedProctorId, setSelectedProctorId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [mySessions, setMySessions] = useState<any[]>([]);
  const [selectedProfilePic, setSelectedProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchExamsData = async () => {
      try {
        const examsRes = await getExams();
        setAllExams(examsRes.data);
        const now = new Date();
        setUpcomingExams(examsRes.data.filter((exam: any) => new Date(exam.date) > now));
        setPastExams(examsRes.data.filter((exam: any) => new Date(exam.date) <= now));
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch exams', variant: 'destructive' });
      }
    };
    const fetchSessionsData = async () => {
      try {
        const sessionsRes = await getSessions();
        setMySessions(sessionsRes.data);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch exam sessions', variant: 'destructive' });
      }
    };
    fetchExamsData();
    fetchSessionsData();
  }, [toast]);

  const fetchProctors = async () => {
    try {
      const proctorsRes = await getUsers('proctor');
      setProctors(proctorsRes.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch proctors', variant: 'destructive' });
      setIsModalOpen(false);
    }
  };

  const handleStartExamClick = (examId: string) => {
    console.log(`handleStartExamClick called with examId: ${examId}`);
    // Log the entire user object to inspect its properties
    console.log('Current user object:', JSON.stringify(user, null, 2)); 
    console.log(`Explicitly checking user.isIdVerified: ${user?.isIdVerified}`);

    // CHECK 1: Is the user's ID verified?
    // Use a stricter check: explicitly check for false. Treat undefined or true as verified.
    if (user?.isIdVerified === false) { 
      console.log('User ID IS FALSE. Navigating to start-exam page...');
      // If not verified, guide them to the ExamStart page to complete verification steps
      toast({
        title: "ID Verification Required",
        description: "Please complete the ID verification steps on the next page before starting.",
        variant: "default", 
      });
      
      // Add notification for demonstration purposes (in a real app, this would be sent to proctors)
      addNotification({
        type: 'verification',
        title: 'ID Verification Started',
        message: `You started the ID verification process.`
      });
      
      navigate(`/student/start-exam/${examId}`);
      return; // Stop here
    }

    // -- User ID IS verified --- 
    // Navigate to the ExamStart page which will handle the face verification flow
    console.log(`User ID IS verified. Navigating to start-exam page for face verification...`);
    
    // Add notification that the user is starting an exam
    addNotification({
      type: 'session',
      title: 'Exam Session Started',
      message: `You started the exam verification process.`
    });
    
    navigate(`/student/start-exam/${examId}`);
  };

  const handleConfirmStartExam = async () => {
    // This function remains mostly the same - it's called *after* ID is verified and proctor is selected
    if (!selectedExamId || !selectedProctorId) {
      toast({ title: 'Error', description: 'Please select a proctor', variant: 'destructive' });
      return;
    }
    setIsStartingSession(true);
    try {
      const sessionData = { examId: selectedExamId!, proctorId: selectedProctorId! };
      // NOTE: This startSession call now correctly includes the proctorId
      await startSession(sessionData); 
      toast({ title: 'Success', description: 'Exam session requested. Waiting for proctor.' });
      
      // Add notification about the exam session request
      const selectedExam = allExams.find(exam => exam._id === selectedExamId);
      const selectedProctor = proctors.find(proctor => proctor._id === selectedProctorId);
      
      addNotification({
        type: 'session',
        title: 'Exam Session Requested',
        message: `You requested a session for ${selectedExam?.title || 'an exam'} with proctor ${selectedProctor?.name || 'Unknown'}.`,
      });
      
      setIsModalOpen(false);
      // Consider if navigation is needed here, or if the proctor dashboard handles the next step
      // For now, let's assume we stay on the dashboard or navigate elsewhere based on proctor action
      // navigate(`/student/start-exam/${selectedExamId}`); // Removed navigation for now
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to start exam session', variant: 'destructive' });
    } finally {
      setIsStartingSession(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCheckSystem = () => {
    toast({
      title: "System Check",
      description: "Your system meets all requirements for online exams.",
    });
  };

  // Function to get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'outline';
      case 'flagged': return 'destructive';
      default: return 'secondary';
    }
  };

  // Handler for profile picture selection
  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedProfilePic(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedProfilePic(null);
      setProfilePicPreview(null);
    }
  };

  // Handler for uploading the profile picture (simulated)
  const handleProfilePicUpload = async () => {
    if (!selectedProfilePic) {
      toast({ title: "No File Selected", description: "Please select a picture first.", variant: "destructive" });
      return;
    }
    toast({ title: "Uploading...", description: "Simulating profile picture upload..." });
    console.log("Simulating upload of:", selectedProfilePic.name);

    // --- TODO: Actual API Call ---
    // const formData = new FormData();
    // formData.append('profilePicture', selectedProfilePic);
    // try {
    //   await uploadProfilePicture(formData); // Replace with actual API call
    //   toast({ title: "Success", description: "Profile picture updated!" });
    //   setSelectedProfilePic(null); // Clear selection after upload
    //   setProfilePicPreview(null);
    //   // Optionally refresh user data in context
    // } catch (error) {
    //   toast({ title: "Upload Failed", description: "Could not upload profile picture.", variant: "destructive" });
    // }
    // --- End of Simulation ---

    // Simulate success after a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Success (Simulated)", description: "Profile picture updated!" });
    setSelectedProfilePic(null); // Clear selection after simulated upload
    setProfilePicPreview(null);
    // In a real app, you might need to update the user object in AuthContext here
    // or trigger a refresh to show the new picture from the user.profilePictureUrl field.
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your exams and monitor your progress</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <Button variant="outline" onClick={handleCheckSystem}>
            System Check
          </Button>
          {/* Logout button removed, handled by main navbar */}
          {/* <Button variant="destructive" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button> */}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-exam-primary" />
              <span>Upcoming Exams</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{upcomingExams.length}</p>
            <p className="text-gray-500 text-sm">Next: {upcomingExams.length > 0 ? formatDate(upcomingExams[0].date) : 'None scheduled'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5 text-exam-secondary" />
              <span>Past Exams</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pastExams.length}</p>
            <p className="text-gray-500 text-sm">Last: {pastExams.length > 0 ? formatDate(pastExams[0].date) : 'None completed'}</p>
          </CardContent>
        </Card>

        {/* --- New ID Verification Status Card --- */}
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-600" /> 
                    <span>ID Verification</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {user?.isIdVerified ? (
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Verified</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-start gap-3">
                         <div className="flex items-center gap-2 text-yellow-600">
                             <XCircle className="h-5 w-5" />
                            <span className="font-medium">Not Verified</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Verification required before starting exams.</p>
                        <Button asChild size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                            <Link to={`/student/start-exam/verify`}>Start Verification</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Exams</h2>
          <div className="space-y-4">
            {upcomingExams.length > 0 ? (
              upcomingExams.map((exam) => (
                <Card key={exam.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-medium">{exam.title}</h3>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{formatDate(exam.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Duration: {exam.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Link to={`/student/exam-info/${exam.id}`}>
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </Link>
                        <Link to={`/student/start-exam/${exam.id}`}>
                          <Button size="sm" className="bg-exam-primary hover:bg-exam-accent">
                            Start Exam
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500">No upcoming exams.</p>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Exams</h2>
          <div className="space-y-4">
            {pastExams.length > 0 ? (
              pastExams.map((exam) => (
                <Card key={exam.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-medium">{exam.title}</h3>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{formatDate(exam.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600 mt-1">
                          <span className="font-medium">Score: {exam.score}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Link to={`/student/exam-results/${exam.id}`}>
                          <Button variant="outline" size="sm">
                            View Results
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500">No past exams.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">All Available Exams</h2>
          <div className="space-y-4">
            {allExams.length > 0 ? (
              allExams.map((exam) => (
                <Card key={exam._id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-medium">{exam.title}</h3>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{formatDate(exam.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Duration: {exam.duration} minutes</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button 
                          size="sm" 
                          className="bg-exam-primary hover:bg-exam-accent"
                          onClick={() => handleStartExamClick(exam._id)} 
                        >
                          Start Exam with Proctor
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500">No exams available.</p>
            )}
          </div>
        </div>

        {/* --- New Section: My Exam Sessions --- */}
        <div>
          <h2 className="text-xl font-semibold mb-4">My Exam Sessions</h2>
          <div className="space-y-4">
            {mySessions.length > 0 ? (
              mySessions.map((session) => (
                <Card key={session._id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-medium">{session.exam?.title || 'Exam Title Missing'}</h3>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <User className="h-4 w-4" />
                          <span className="text-sm">Proctor: {session.proctor?.name || 'Not Assigned'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={getStatusBadgeVariant(session.status)}>
                          {session.status}
                        </Badge>
                        {/* Add link to view session details if needed */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500">You have no active or past exam sessions.</p>
            )}
          </div>
        </div>
      </div>

      {/* Proctor Selection Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Proctor</DialogTitle>
            <DialogDescription>
              Choose an available proctor to monitor your exam session.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 mb-6">
            <Label htmlFor="proctor-select">Available Proctors</Label>
            <Select onValueChange={setSelectedProctorId} value={selectedProctorId ?? ''}>
              <SelectTrigger id="proctor-select">
                <SelectValue placeholder="Select a proctor..." />
              </SelectTrigger>
              <SelectContent>
                {proctors.length > 0 ? (
                  proctors.map((proctor) => (
                    <SelectItem key={proctor._id} value={proctor._id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{proctor.name} ({proctor.email})</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">Loading proctors...</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmStartExam}
              disabled={!selectedProctorId || isStartingSession}
              className="bg-exam-primary hover:bg-exam-accent"
            >
              {isStartingSession ? 'Starting...' : 'Confirm & Start'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
