import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Task } from "@shared/schema";

export default function QuickStats() {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    retry: false,
  });

  const today = new Date();
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  });

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const overdueTasks = tasks.filter(task => {
    if (task.completed || !task.dueDate) return false;
    return new Date(task.dueDate) < today;
  });

  const completedToday = todayTasks.filter(task => task.completed).length;
  const totalToday = todayTasks.length;
  const progressPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{completedTasks.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{pendingTasks.length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{overdueTasks.length}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Daily Goal Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-xs text-gray-500 mt-2">
            {completedToday} of {totalToday} tasks completed today
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
