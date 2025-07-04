import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { InsertTask } from "@shared/schema";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const [formData, setFormData] = useState<Partial<InsertTask>>({
    title: "",
    description: "",
    category: "work",
    priority: "medium",
    dueDate: null,
    estimatedDuration: null,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (task: InsertTask) => {
      await apiRequest("POST", "/api/tasks", task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task created",
        description: "Your new task has been added successfully!",
      });
      onClose();
      setFormData({
        title: "",
        description: "",
        category: "work",
        priority: "medium",
        dueDate: null,
        estimatedDuration: null,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      toast({
        title: "Error",
        description: "Task title is required.",
        variant: "destructive",
      });
      return;
    }

    const taskData: InsertTask = {
      title: formData.title.trim(),
      description: formData.description?.trim() || "",
      category: formData.category || "work",
      priority: formData.priority || "medium",
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      estimatedDuration: formData.estimatedDuration || null,
      completed: false,
    };

    createTaskMutation.mutate(taskData);
  };

  const parseDuration = (durationStr: string): number | null => {
    if (!durationStr.trim()) return null;
    
    const match = durationStr.match(/^(\d+(?:\.\d+)?)\s*(h|m|hr|hrs|min|mins|hour|hours|minute|minutes)?$/i);
    if (!match) return null;
    
    const value = parseFloat(match[1]);
    const unit = match[2]?.toLowerCase() || 'm';
    
    if (unit.startsWith('h')) {
      return Math.round(value * 60); // Convert hours to minutes
    } else {
      return Math.round(value); // Already in minutes
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional task description..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category || "work"}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority || "medium"}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  dueDate: e.target.value ? new Date(e.target.value) : null 
                }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Estimated Duration</Label>
            <Input
              id="duration"
              value={formData.estimatedDuration ? `${formData.estimatedDuration}m` : ""}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                estimatedDuration: parseDuration(e.target.value) 
              }))}
              placeholder="e.g., 2h, 30m, 90"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTaskMutation.isPending}>
              {createTaskMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
