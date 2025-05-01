
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Camera, Search, Settings, User, Users } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';

const ProctorDashboard = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeExams] = useState([
    {
      id: '1',
      title: 'Mathematics Final',
      student: 'Emma Wilson',
      startTime: new Date('2025-04-30T13:00:00'),
      duration: '2 hours',
      status: 'active',
      flagged: false,
    },
    {
      id: '2',
      title: 'English Literature',
      student: 'James Brown',
      startTime: new Date('2025-04-30T13:30:00'),
      duration: '3 hours',
      status: 'active',
      flagged: true,
    },
    {
      id: '3',
      title: 'Computer Science',
      student: 'Sophia Miller',
      startTime: new Date('2025-04-30T14:00:00'),
      duration: '2.5 hours',
      status: 'active',
      flagged: false,
    }
  ]);
  
  const [pendingVerifications] = useState([
    {
      id: '4',
      title: 'Physics Midterm',
      student: 'David Clark',
      startTime: new Date('2025-04-30T15:00:00'),
      idSubmitted: true,
    },
    {
      id: '5',
      title: 'Chemistry Final',
      student: 'Olivia Johnson',
      startTime: new Date('2025-04-30T15:30:00'),
      idSubmitted: true,
    }
  ]);
  
  const getTimeElapsed = (startTime: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };
  
  const handleFlagExam = (examId: string) => {
    toast({
      title: "Exam Flagged",
      description: "This exam has been flagged for suspicious activity.",
      variant: "destructive",
    });
  };
  
  const handleVerifyId = (examId: string) => {
    toast({
      title: "ID Verified",
      description: "Student ID has been successfully verified.",
    });
  };
  
  const filteredActiveExams = activeExams.filter(
    exam => exam.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            exam.student.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredVerifications = pendingVerifications.filter(
    exam => exam.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            exam.student.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proctor Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor exams and verify student identities</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <Link to="/proctor/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Link to="/proctor/notifications">
            <Button variant="outline" className="relative">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </Link>
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
              filteredVerifications.map((exam) => (
                <Card key={exam.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{exam.title}</h3>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <User className="h-4 w-4" />
                          <span>{exam.student}</span>
                        </div>
                      </div>
                      <Badge className="bg-yellow-500">Pending</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Scheduled for</p>
                        <p className="font-medium">
                          {exam.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
                        <p className="text-sm">ID Image</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-exam-primary hover:bg-exam-accent"
                        onClick={() => handleVerifyId(exam.id)}
                      >
                        Verify ID
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
    </div>
  );
};

export default ProctorDashboard;
