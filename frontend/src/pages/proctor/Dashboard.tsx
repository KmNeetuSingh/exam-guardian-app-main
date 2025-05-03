import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Camera, Search, Settings, User, Users, CheckCircle, XCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { getExams, getSessions, updateSessionStatus, verifyStudentId } from '@/api/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import NotificationsPanel from '@/components/NotificationsPanel';
import { useNotifications } from '@/context/NotificationContext';

const ProctorDashboard = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeExams, setActiveExams] = useState<any[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead,
    addNotification 
  } = useNotifications();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const examsRes = await getExams();
        setActiveExams(examsRes.data.filter((exam: any) => exam.status === 'active'));
        const sessionsRes = await getSessions();
        setSessions(sessionsRes.data);
        setPendingVerifications(sessionsRes.data.filter((s: any) => s.status === 'pending' && s.idVerified));
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch data from backend', variant: 'destructive' });
      }
    };
    fetchData();
  }, [toast]);
  
  const getTimeElapsed = (startTime: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(startTime).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };
  
  const handleFlagExam = async (sessionId: string) => {
    try {
      await updateSessionStatus(sessionId, 'flagged');
      toast({ title: 'Exam Flagged', description: 'This exam has been flagged for suspicious activity.', variant: 'destructive' });
      // Optionally refresh sessions
    } catch (error) {
      toast({ title: 'Error', description: 'Could not flag the exam.', variant: 'destructive' });
    }
  };
  
  const handleVerifyId = async (sessionId: string) => {
    try {
      // Get the session to find the associated student ID
      const sessionData = sessions.find(s => s.id === sessionId);
      if (!sessionData || !sessionData.student || !sessionData.student._id) {
        throw new Error('Could not find student information for this session');
      }
      
      // First, verify the student's ID (sets their account status)
      await verifyStudentId(sessionData.student._id);
      
      // Then, update the session status to active
      await updateSessionStatus(sessionId, 'active');
      
      toast({ title: 'ID Verified', description: 'Student ID has been successfully verified.' });
      
      // Add a notification about the verification
      addNotification({
        type: 'verification',
        title: 'ID Verification Completed',
        message: `You've verified ${sessionData.student?.name || 'a student'}'s ID for ${sessionData.exam?.title || 'an exam'}.`
      });
      
      // Refresh data
      const sessionsRes = await getSessions();
      setSessions(sessionsRes.data);
      setPendingVerifications(sessionsRes.data.filter((s: any) => s.status === 'pending' && s.idVerified));
    } catch (error) {
      console.error('ID verification error:', error);
      toast({ title: 'Error', description: 'Could not verify ID.', variant: 'destructive' });
    }
  };
  
  const handleRejectId = async (sessionId: string) => {
    try {
      // Update the session status to rejected
      await updateSessionStatus(sessionId, 'rejected');
      
      toast({ 
        title: 'Verification Rejected', 
        description: 'Student has been notified to submit a clearer ID photo.',
        variant: 'default'
      });
      
      // Refresh data
      const sessionsRes = await getSessions();
      setSessions(sessionsRes.data);
      setPendingVerifications(sessionsRes.data.filter((s: any) => s.status === 'pending' && s.idVerified));
    } catch (error) {
      console.error('ID rejection error:', error);
      toast({ title: 'Error', description: 'Could not reject verification.', variant: 'destructive' });
    }
  };
  
  const handleOpenVerificationDialog = (session: any) => {
    setSelectedSession(session);
    setVerificationDialogOpen(true);
  };
  
  const filteredActiveExams = activeExams.filter(
    exam => exam.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredVerifications = pendingVerifications.filter(
    session => session.exam.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proctor Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor exams and verify student identities</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <Link to="/proctor/create-exam">
            <Button className="bg-exam-primary hover:bg-exam-accent">
              Create Exam
            </Button>
          </Link>
          <Link to="/proctor/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <NotificationsPanel 
            notifications={notifications} 
            onMarkAsRead={markAsRead} 
            onMarkAllAsRead={markAllAsRead}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Camera className="h-5 w-5 text-exam-primary" />
              <span>Active Exams</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeExams.length}</p>
            <p className="text-gray-500 text-sm">
              {activeExams.filter(e => e.flagged).length} flagged for suspicious activity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <User className="h-5 w-5 text-exam-secondary" />
              <span>Pending Verifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingVerifications.length}</p>
            <p className="text-gray-500 text-sm">
              Waiting for your verification
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-exam-accent" />
              <span>Today's Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">8</p>
            <p className="text-gray-500 text-sm">
              Total exams scheduled for today
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search exams or students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>
      
      <Tabs defaultValue="active" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="relative">
            Active Exams
            {activeExams.filter(e => e.flagged).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeExams.filter(e => e.flagged).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Verification
            <span className="ml-2 bg-exam-primary bg-opacity-10 text-exam-primary text-xs py-0.5 px-2 rounded-full">
              {pendingVerifications.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="all">All Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActiveExams.length > 0 ? (
              filteredActiveExams.map((exam) => (
                <Card key={exam.id} className={`card-hover ${exam.flagged ? 'border-red-300' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{exam.title}</h3>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <User className="h-4 w-4" />
                          <span>{exam.student}</span>
                        </div>
                      </div>
                      <div>
                        {exam.flagged ? (
                          <Badge variant="destructive">Flagged</Badge>
                        ) : (
                          <Badge className="bg-green-500">Active</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Elapsed time</p>
                        <p className="font-medium">{getTimeElapsed(exam.startTime)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-medium">{exam.duration}</p>
                      </div>
                    </div>
                    
                    <div className="webcam-container aspect-video mb-4 bg-gray-900">
                      <div className="flex items-center justify-center h-full text-white">
                        <p>Webcam Preview</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        variant={exam.flagged ? "outline" : "default"}
                        onClick={() => handleFlagExam(exam.id)}
                      >
                        {exam.flagged ? "Unflag" : "Flag Issue"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-gray-500">
                <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No active exams match your search</p>
                <p className="mt-1">Try adjusting your search query</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVerifications.length > 0 ? (
              filteredVerifications.map((session) => (
                <Card key={session.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{session.exam.title}</h3>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <User className="h-4 w-4" />
                          <span>{session.exam.student}</span>
                        </div>
                      </div>
                      <Badge className="bg-yellow-500">Pending</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Scheduled for</p>
                        <p className="font-medium">
                          {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ID Submitted</p>
                        <p className="font-medium text-green-600">Yes</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mb-4">
                      <div className="flex-1 border rounded-lg aspect-video bg-gray-100 flex items-center justify-center text-gray-500">
                        <p className="text-sm">Webcam Image</p>
                      </div>
                      <div className="flex-1 border rounded-lg aspect-video bg-gray-100 flex items-center justify-center text-gray-500">
                        {session.student?.idImage ? (
                          <img 
                            src={`${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '')}${session.student.idImage}`} 
                            alt="Student ID" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <p className="text-sm">ID Image Not Available</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4 bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium mb-2">Verification Information:</h4>
                      <ul className="text-xs space-y-1">
                        <li><strong>Student:</strong> {session.student?.name || 'Unknown'}</li>
                        <li><strong>Email:</strong> {session.student?.email || 'Unknown'}</li>
                        <li><strong>Submitted:</strong> {new Date(session.createdAt).toLocaleString()}</li>
                      </ul>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleOpenVerificationDialog(session)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-exam-primary hover:bg-exam-accent"
                        onClick={() => handleVerifyId(session.id)}
                      >
                        Verify ID
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleRejectId(session.id)}
                      >
                        Reject ID
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No pending verifications</p>
                <p className="mt-1">All IDs have been verified</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="all">
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">All exam sessions</p>
            <p className="mt-1">View all past and upcoming exam sessions</p>
            <Button className="mt-4 bg-exam-primary hover:bg-exam-accent">
              View All Sessions
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Verification Dialog */}
      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Student ID Verification</DialogTitle>
            <DialogDescription>
              Verify the student's identity by comparing their ID with their profile picture
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">ID Document</h3>
                  <div className="border rounded-lg overflow-hidden bg-gray-50 aspect-video">
                    {selectedSession.student?.idImage ? (
                      <img 
                        src={`${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '')}${selectedSession.student.idImage}`} 
                        alt="Student ID" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No ID image available</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Profile Picture</h3>
                  <div className="border rounded-lg overflow-hidden bg-gray-50 aspect-video">
                    {selectedSession.student?.profilePicture ? (
                      <img 
                        src={`${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '')}${selectedSession.student.profilePicture}`} 
                        alt="Profile" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No profile picture available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Student Information</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{selectedSession.student?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{selectedSession.student?.email || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Exam</p>
                    <p className="font-medium">{selectedSession.exam?.title || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Submission Time</p>
                    <p className="font-medium">{new Date(selectedSession.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 justify-end">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50" 
                  onClick={() => {
                    handleRejectId(selectedSession.id);
                    setVerificationDialogOpen(false);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Verification
                </Button>
                <Button 
                  className="bg-exam-primary hover:bg-exam-accent"
                  onClick={() => {
                    handleVerifyId(selectedSession.id);
                    setVerificationDialogOpen(false);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify ID
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProctorDashboard;
