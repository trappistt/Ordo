import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckSquare, Brain, Zap, Users, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="text-white text-xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">TaskSync AI</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The AI-powered productivity app that syncs your to-dos with your calendar and intelligently optimizes your day for maximum efficiency.
          </p>
          <Button 
            size="lg"
            className="px-8 py-4 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CheckSquare className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Smart Task Management</CardTitle>
              <CardDescription>
                Create, prioritize, and organize tasks with intelligent categorization and deadline tracking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="w-10 h-10 text-green-500 mb-2" />
              <CardTitle>Multi-Calendar Sync</CardTitle>
              <CardDescription>
                Connect Google, Outlook, and Apple calendars for a unified view of your schedule.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="w-10 h-10 text-purple-500 mb-2" />
              <CardTitle>AI-Powered Planning</CardTitle>
              <CardDescription>
                Let ChatGPT analyze your workload and suggest optimal scheduling for maximum productivity.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-10 h-10 text-yellow-500 mb-2" />
              <CardTitle>Intelligent Optimization</CardTitle>
              <CardDescription>
                Automatic task scheduling based on priorities, deadlines, and your energy patterns.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-10 h-10 text-indigo-500 mb-2" />
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>
                Share schedules and coordinate with team members for better collaboration.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="w-10 h-10 text-red-500 mb-2" />
              <CardTitle>Time Tracking</CardTitle>
              <CardDescription>
                Monitor how you spend your time and get insights to improve productivity.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Transform Your Productivity?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of professionals who have revolutionized their workflow with TaskSync AI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg"
                className="px-8 py-4 text-lg"
                onClick={() => window.location.href = '/api/login'}
              >
                Start Your Free Trial
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
