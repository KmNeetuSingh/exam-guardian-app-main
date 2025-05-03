import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { uploadProfilePicture } from '@/api/api'; // Import the API function
import { useAuth } from '@/context/AuthContext'; // Import useAuth to update user state

interface ProfilePicModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ProfilePicModal = ({ isOpen, onOpenChange }: ProfilePicModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, setUser } = useAuth(); // Get user and setUser from context

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation (optional: add more checks like file type/size here)
      if (file.size > 2 * 1024 * 1024) { // Example: Limit to 2MB
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
         toast({
          title: "Invalid File Type",
          description: "Please select an image file (e.g., JPG, PNG, GIF).",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please choose an image file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('profilePic', selectedFile);

    try {
      const updatedUser = await uploadProfilePicture(formData);
      toast({
        title: "Success!",
        description: "Profile picture updated successfully.",
      });
      
      // Update the user context with the new user data (including profilePicture URL)
      if (updatedUser && setUser) {
          // Make sure to store the full user data in context
          console.log("Profile picture updated, new user data:", updatedUser);
          
          // Also update the localStorage directly to ensure persistence
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          storedUser.profilePicture = updatedUser.profilePicture;
          localStorage.setItem('user', JSON.stringify(storedUser));
          
          // Update context
          setUser(updatedUser);
      }
      onOpenChange(false); // Close the modal on success
      // Reset state after successful upload
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error: any) { // Catch specific errors if needed
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to upload profile picture.";
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Reset state when modal closes
  const handleOpenChange = (open: boolean) => {
      if (!open) {
          setSelectedFile(null);
          setPreviewUrl(null);
          setIsUploading(false);
      }
      onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Select an image file (JPG, PNG, GIF, max 2MB) to set as your profile picture.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">Picture</Label>
            <Input
              id="picture"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/gif" // Specify accepted types
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-exam-primary file:text-white hover:file:bg-exam-accent dark:file:bg-exam-accent dark:hover:file:bg-exam-primary cursor-pointer"
            />
             {previewUrl && (
              <div className="mt-4 flex justify-center">
                <img 
                  src={previewUrl} 
                  alt="Selected preview" 
                  className="h-32 w-32 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600" 
                />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePicModal; 