import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Home, CheckSquare, Bot, Plug, MoreVertical, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Sidebar() {
  const { user } = useAuth();

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Calendar className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">TaskSync AI</h1>
            <p className="text-sm text-gray-500">Smart Productivity</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start bg-blue-50 text-primary hover:bg-blue-100">
          <Home className="w-5 h-5 mr-3" />
          Dashboard
        </Button>
        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">
          <CheckSquare className="w-5 h-5 mr-3" />
          Tasks
        </Button>
        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">
          <Calendar className="w-5 h-5 mr-3" />
          Calendar
        </Button>
        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">
          <Bot className="w-5 h-5 mr-3" />
          AI Assistant
        </Button>
        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">
          <Plug className="w-5 h-5 mr-3" />
          Integrations
        </Button>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-gray-300 text-gray-600">
              {getInitials(user?.firstName, user?.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.email || 'User'
              }
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
