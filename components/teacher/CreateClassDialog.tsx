"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClass, updateClass } from "@/lib/supabase/classManagement";
import { Class } from "@/types/game";

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingClass?: Class | null;
}

export function CreateClassDialog({
  open,
  onOpenChange,
  onSuccess,
  editingClass
}: CreateClassDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: editingClass?.name || "",
    description: editingClass?.description || "",
    gradeLevel: editingClass?.gradeLevel || "",
    subject: editingClass?.subject || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please enter a class name");
      return;
    }

    setLoading(true);
    try {
      if (editingClass) {
        await updateClass(editingClass.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          gradeLevel: formData.gradeLevel.trim() || undefined,
          subject: formData.subject.trim() || undefined
        });
        toast.success("Class updated successfully");
      } else {
        await createClass({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          gradeLevel: formData.gradeLevel.trim() || undefined,
          subject: formData.subject.trim() || undefined
        });
        toast.success("Class created successfully");
      }
      
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        gradeLevel: "",
        subject: ""
      });
    } catch (error) {
      console.error("Error saving class:", error);
      toast.error(editingClass ? "Failed to update class" : "Failed to create class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingClass ? "Edit Class" : "Create New Class"}
          </DialogTitle>
          <DialogDescription>
            {editingClass 
              ? "Update the class information below."
              : "Create a new class to organize your game links and vocabulary lists."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Class Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., English 101, Period 3, Advanced Class"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description of the class"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Input
                id="gradeLevel"
                placeholder="e.g., 9th Grade"
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., English, Math"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingClass ? "Update Class" : "Create Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
