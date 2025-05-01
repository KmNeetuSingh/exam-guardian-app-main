
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Camera, Clock, FileText } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { toast } = useToast();
  const [upcomingExams] = useState([
    {
      id: '1',
      title: 'Mathematics Final',
      date: '2025-05-10T14:00:00',
      duration: '2 hours',
      status: 'pending',
    },
    {
      id: '2',
      title: 'English Literature',
      date: '2025-05-12T10:00:00',
      duration: '3 hours',
      status: 'pending',
    },
    {
      id: '3',
      title: 'Computer Science',
      date: '2025-05-15T09:00:00',
      duration: '2.5 hours',
      status: 'pending',
    }
  ]);
  
  const [pastExams] = useState([
    {
      id: '4',
      title: 'Biology Midterm',
      date: '2025-04-20T11:00:00',
      duration: '1.5 hours',
      status: 'completed',
      score: '85%',
    }
  ]);

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
          <Link to="/student/profile">
            <Button variant="outline">My Profile</Button>
          </Link>
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
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-exam-accent" />
              <span>ID Verification</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 rounded-full p-2">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">Pending Verification</p>
                <p className="text-sm text-gray-500">Upload your ID to verify</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/student/verification">
                <Button size="sm" variant="outline" className="w-full">
                  Verify Now
                </Button>
              </Link>
            </div>
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
      </div>
    </div>
  );
};

export default StudentDashboard;
