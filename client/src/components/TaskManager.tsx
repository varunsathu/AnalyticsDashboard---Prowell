import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MoreHorizontal, Calendar, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";

const categoryColors = {
  work: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  personal: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  learning: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
};

const priorityColors = {
  high: { bg: "bg-red-100", text: "text-red-700" },
  medium: { bg: "bg-amber-100", text: "text-amber-700" },
  low: { bg: "bg-charcoal-100", text: "text-charcoal-700" },
};

export default function TaskManager() {
  const [filter, setFilter] = useState<"all" | "today" | "overdue">("all");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    category: "work",
    priority: "medium",
    dueDate: "",
    estimatedTime: ""
  });
  const [newCategoryName, setNewCategoryName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async (task: Task) => {
      const newStatus = task.status === "completed" ? "pending" : "completed";
      return apiRequest("PUT", `/api/tasks/${task.id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async (taskData: typeof newTaskData) => {
      const payload = {
        title: taskData.title,
        description: taskData.description || undefined,
        category: taskData.category,
        priority: taskData.priority,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
        estimatedTime: taskData.estimatedTime ? Number(taskData.estimatedTime) : undefined,
        status: "pending"
      };
      return apiRequest("POST", "/api/tasks", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsAddTaskOpen(false);
      setNewTaskData({
        title: "",
        description: "",
        category: "work",
        priority: "medium",
        dueDate: "",
        estimatedTime: ""
      });
      toast({
        title: "Task added successfully",
        description: "Your new task has been created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddTask = () => {
    if (!newTaskData.title.trim()) return;
    addTaskMutation.mutate(newTaskData);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    // For now, just show a message since categories are predefined
    toast({
      title: "Category feature",
      description: "Custom categories will be available in a future update. Currently using: Work, Personal, Learning.",
    });
    setNewCategoryName("");
    setIsAddCategoryOpen(false);
  };

  const categoryCounts = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredTasks = tasks.filter(task => {
    if (filter === "today") {
      const today = new Date();
      return task.dueDate && new Date(task.dueDate).toDateString() === today.toDateString();
    }
    if (filter === "overdue") {
      const now = new Date();
      return task.dueDate && new Date(task.dueDate) < now && task.status === "pending";
    }
    return true;
  });

  return (
    <Card className="bg-white border border-charcoal-200">
      <CardHeader className="border-b border-charcoal-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-charcoal-900">Task Management</CardTitle>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Button
                variant={filter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("all")}
                className={filter === "all" ? "bg-teal-100 text-teal-700" : ""}
              >
                All
              </Button>
              <Button
                variant={filter === "today" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("today")}
                className={filter === "today" ? "bg-teal-100 text-teal-700" : ""}
              >
                Today
              </Button>
              <Button
                variant={filter === "overdue" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("overdue")}
                className={filter === "overdue" ? "bg-teal-100 text-teal-700" : ""}
              >
                Overdue
              </Button>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-teal-600"
              onClick={() => setIsAddTaskOpen(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-3 mt-4">
          {Object.entries(categoryCounts).map(([category, count]) => {
            const colors = categoryColors[category as keyof typeof categoryColors] || categoryColors.work;
            return (
              <div
                key={category}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${colors.bg} ${colors.border}`}
              >
                <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                <span className={`text-sm font-medium ${colors.text} capitalize`}>{category}</span>
                <Badge variant="secondary" className={`text-xs ${colors.bg} ${colors.text}`}>
                  {count}
                </Badge>
              </div>
            );
          })}
          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-dashed border-charcoal-300 hover:border-charcoal-400"
              >
                <Plus className="w-3 h-3 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory}>
                    Add Category
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-charcoal-500">
              {filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
            </div>
          ) : (
            filteredTasks.map((task) => {
              const categoryColor = categoryColors[task.category as keyof typeof categoryColors] || categoryColors.work;
              const priorityColor = priorityColors[task.priority as keyof typeof priorityColors];
              
              return (
                <div
                  key={task.id}
                  className={`group p-4 border border-charcoal-200 rounded-lg hover:shadow-md transition-all duration-200 ${
                    task.status === "completed" ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <Checkbox
                      checked={task.status === "completed"}
                      onCheckedChange={() => toggleTaskMutation.mutate(task)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`font-semibold text-charcoal-900 ${
                            task.status === "completed" ? "line-through" : ""
                          }`}
                        >
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${priorityColor.bg} ${priorityColor.text}`}>
                            {task.priority} Priority
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-charcoal-400">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {task.description && (
                        <p
                          className={`text-charcoal-600 text-sm mt-1 ${
                            task.status === "completed" ? "line-through" : ""
                          }`}
                        >
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-4">
                          {task.dueDate && (
                            <span className="flex items-center space-x-1 text-xs text-charcoal-500">
                              <Calendar className="w-3 h-3" />
                              <span>Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
                            </span>
                          )}
                          {task.estimatedTime && (
                            <span className="flex items-center space-x-1 text-xs text-charcoal-500">
                              <Clock className="w-3 h-3" />
                              <span>{task.estimatedTime}m estimated</span>
                            </span>
                          )}
                        </div>
                        <div className={`w-3 h-3 rounded-full ${categoryColor.dot}`} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full mt-6 border-dashed border-charcoal-300 hover:border-charcoal-400"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newTaskData.category} onValueChange={(value) => setNewTaskData({ ...newTaskData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTaskData.priority} onValueChange={(value) => setNewTaskData({ ...newTaskData, priority: value })}>
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date (optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTaskData.dueDate}
                    onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedTime">Est. Time (minutes)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    value={newTaskData.estimatedTime}
                    onChange={(e) => setNewTaskData({ ...newTaskData, estimatedTime: e.target.value })}
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddTask}
                  disabled={!newTaskData.title.trim() || addTaskMutation.isPending}
                >
                  {addTaskMutation.isPending ? "Adding..." : "Add Task"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
