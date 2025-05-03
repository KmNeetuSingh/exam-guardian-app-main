import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, File } from 'lucide-react';
import { createExam } from '@/api/api';

const CreateExam = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date in YYYY-MM-DD format
    time: '12:00', // Default time
    duration: 60, // Default duration in minutes
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Combine date and time into a single ISO string
      const dateTimeString = `${formData.date}T${formData.time}:00`;
      const examData = {
        title: formData.title,
        description: formData.description,
        date: dateTimeString,
        duration: Number(formData.duration),
      };
      
      await createExam(examData);
      
      toast({
        title: "Exam Created",
        description: "The exam has been successfully created.",
      });
      
      navigate('/proctor/dashboard');
    } catch (error: any) {
      console.error('Error creating exam:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Create New Exam</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
          <CardDescription>
            Enter the details for the new exam. All fields are required.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">Exam Title</Label>
              <div className="relative">
                <File className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter exam title"
                  value={formData.title}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter exam description, instructions, and requirements"
                value={formData.description}
                onChange={handleChange}
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-base">Exam Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
                
              <div className="space-y-2">
                <Label htmlFor="time" className="text-base">Exam Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-base">Duration (minutes)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="15"
                  max="240"
                  placeholder="Enter duration in minutes"
                  value={formData.duration}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/proctor/dashboard')}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-exam-primary hover:bg-exam-accent"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Exam'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateExam; 