import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckSquare, Send } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { getExamById, submitExamAnswers } from '@/api/api'; // Use actual API functions

// Placeholder types - replace with actual data structure from your API
type Option = { // Assuming options might be objects if they have IDs
  _id: string;
  text: string;
};
type Question = {
  _id: string; // Use _id if coming from MongoDB
  text: string;
  options: Option[]; // Use Option type
};

type Exam = {
  _id: string; // Use _id if coming from MongoDB
  title: string;
  duration: number; // in minutes
  questions: Question[];
};

const ExamTakingPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate(); // Hook for navigation
  const { toast } = useToast();
  const [exam, setExam] = useState<Exam | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitExam = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log("Submitting answers:", answers);
    try {
      await submitExamAnswers(examId!, answers);
      toast({ title: "Success", description: "Exam submitted successfully!" });
      navigate('/student/dashboard');
    } catch (error: any) {
      console.error("Failed to submit exam:", error);
      toast({ title: "Submission Error", description: error?.response?.data?.message || "Failed to submit exam.", variant: "destructive" });
      setIsSubmitting(false);
    }
  }, [examId, answers, isSubmitting, navigate, toast]);

  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) return;
      setIsLoading(true);
      try {
        console.log(`Fetching exam data for examId: ${examId}`);
        const response = await getExamById(examId);
        const examData: Exam = response.data;

        if (!examData || !examData.questions || examData.questions.length === 0) {
          throw new Error("Exam data is invalid or contains no questions.");
        }

        setExam(examData);
        setTimeLeft(examData.duration * 60);
        const initialAnswers = examData.questions.reduce((acc, q) => {
          acc[q._id] = '';
          return acc;
        }, {} as { [key: string]: string });
        setAnswers(initialAnswers);

      } catch (error) {
        console.error("Failed to fetch exam:", error);
        toast({ title: "Error fetching exam", description: (error as Error).message || "Could not load exam details.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchExam();
  }, [examId, toast, navigate]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isSubmitting) return;
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime !== null ? Math.max(0, prevTime - 1) : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitting]);

  useEffect(() => {
    if (timeLeft === 0) {
      toast({ title: "Time's Up!", description: "Submitting your exam automatically.", variant: "default" });
      submitExam();
    }
  }, [timeLeft, submitExam]);

  const handleAnswerChange = (questionId: string, answerOptionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerOptionId }));
  };

  const handleNextQuestion = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (totalSeconds: number | null): string => {
    if (totalSeconds === null) return "--:--";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center">Loading Exam...</div>;
  }

  if (!exam) {
    return <div className="container mx-auto p-8 text-center">Error loading exam.</div>;
  }

  if (currentQuestionIndex < 0 || currentQuestionIndex >= exam.questions.length) {
    console.error("Invalid currentQuestionIndex:", currentQuestionIndex);
    setCurrentQuestionIndex(0);
    return <div className="container mx-auto p-8 text-center">Error finding question...</div>;
  }
  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
      <Card className="flex-grow flex flex-col shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <CardTitle className="text-2xl">{exam.title}</CardTitle>
              <CardDescription>Question {currentQuestionIndex + 1} of {exam.questions.length}</CardDescription>
            </div>
            <div className="flex items-center gap-2 p-2 border rounded-md bg-secondary text-secondary-foreground">
              <Clock className="h-5 w-5" />
              <span className="font-mono text-lg font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-lg font-medium">{currentQuestion.text}</p>
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <div key={option._id} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted transition-colors">
                  <input
                    type="radio"
                    id={`q${currentQuestion._id}-opt${option._id}`}
                    name={`question-${currentQuestion._id}`}
                    value={option._id}
                    checked={answers[currentQuestion._id] === option._id}
                    onChange={() => handleAnswerChange(currentQuestion._id, option._id)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor={`q${currentQuestion._id}-opt${option._id}`} className="text-base flex-1 cursor-pointer">
                    {option.text}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <div className="flex justify-between items-center p-4 border-t bg-muted/40">
          <Button 
            variant="outline" 
            onClick={handlePreviousQuestion} 
            disabled={currentQuestionIndex === 0 || isSubmitting}
          >
            Previous
          </Button>
          <div className="flex gap-2">
            {currentQuestionIndex < exam.questions.length - 1 ? (
              <Button 
                onClick={handleNextQuestion} 
                disabled={isSubmitting}
              >
                Next Question
              </Button>
            ) : (
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={submitExam} 
                disabled={isSubmitting}
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Exam"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExamTakingPage; 