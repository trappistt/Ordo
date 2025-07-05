import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, Settings, RefreshCw, Link, CheckCircle, AlertCircle } from "lucide-react";
import type { CalendarIntegration } from "@shared/schema";

export default function CalendarIntegration() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const { data: integrations = [], isLoading } = useQuery<CalendarIntegration[]>({
    queryKey: ["/api/calendar/integrations"],
    retry: false,
  });

  const connectMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await fetch(`/api/auth/${provider}`);
      if (!response.ok) throw new Error('Failed to initiate OAuth');
      window.location.href = response.url;
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to calendar provider",
        variant: "destructive",
      });
      setIsConnecting(null);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (integrationId: number) => {
      await apiRequest(`/api/calendar/integrations/${integrationId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/integrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
      toast({
        title: "Calendar Disconnected",
        description: "Calendar integration has been removed",
      });
    },
    onError: () => {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect calendar",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ integrationId, isActive }: { integrationId: number; isActive: boolean }) => {
      await apiRequest(`/api/calendar/integrations/${integrationId}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/integrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update calendar integration",
        variant: "destructive",
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (integrationId: number) => {
      await apiRequest(`/api/calendar/integrations/${integrationId}/sync`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
      toast({
        title: "Sync Complete",
        description: "Calendar events have been synchronized",
      });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync calendar events",
        variant: "destructive",
      });
    },
  });

  const handleConnect = (provider: string) => {
    setIsConnecting(provider);
    connectMutation.mutate(provider);
  };

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'google':
        return {
          name: 'Google Calendar',
          color: 'bg-blue-50 border-blue-200',
          badgeColor: 'bg-blue-100 text-blue-800',
          icon: '🗓️'
        };
      case 'outlook':
        return {
          name: 'Outlook Calendar',
          color: 'bg-purple-50 border-purple-200',
          badgeColor: 'bg-purple-100 text-purple-800',
          icon: '📅'
        };
      case 'apple':
        return {
          name: 'Apple Calendar',
          color: 'bg-gray-50 border-gray-200',
          badgeColor: 'bg-gray-100 text-gray-800',
          icon: '📆'
        };
      default:
        return {
          name: provider,
          color: 'bg-gray-50 border-gray-200',
          badgeColor: 'bg-gray-100 text-gray-800',
          icon: '📅'
        };
    }
  };

  const availableProviders = ['google', 'outlook'];
  const connectedProviders = integrations.map(i => i.provider);
  const unconnectedProviders = availableProviders.filter(p => !connectedProviders.includes(p));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendar Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 animate-pulse rounded" />
                  <div className="w-32 h-4 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="w-16 h-6 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendar Integrations
          </CardTitle>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-1" />
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Connected Calendars */}
          {integrations.map((integration) => {
            const providerInfo = getProviderInfo(integration.provider);
            const lastSync = integration.lastSync ? new Date(integration.lastSync).toLocaleDateString() : 'Never';
            
            return (
              <div key={integration.id} className={`p-4 border rounded-lg ${providerInfo.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{providerInfo.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{providerInfo.name}</h4>
                      <p className="text-sm text-gray-600">
                        Last sync: {lastSync}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={providerInfo.badgeColor}>
                      {integration.isActive ? (
                        <><CheckCircle className="w-3 h-3 mr-1" />Active</>
                      ) : (
                        <><AlertCircle className="w-3 h-3 mr-1" />Inactive</>
                      )}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Enable sync</span>
                      <Switch
                        checked={integration.isActive || false}
                        onCheckedChange={(checked) => 
                          toggleMutation.mutate({ 
                            integrationId: integration.id, 
                            isActive: checked 
                          })
                        }
                        disabled={toggleMutation.isPending}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncMutation.mutate(integration.id)}
                      disabled={syncMutation.isPending || !integration.isActive}
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                      Sync
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnectMutation.mutate(integration.id)}
                      disabled={disconnectMutation.isPending}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Available Providers to Connect */}
          {unconnectedProviders.map((provider) => {
            const providerInfo = getProviderInfo(provider);
            
            return (
              <div key={provider} className="p-4 border border-dashed rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl opacity-50">{providerInfo.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{providerInfo.name}</h4>
                      <p className="text-sm text-gray-600">
                        Connect to sync your calendar events
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleConnect(provider)}
                    disabled={isConnecting === provider || connectMutation.isPending}
                    size="sm"
                  >
                    <Link className="w-4 h-4 mr-1" />
                    {isConnecting === provider ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              </div>
            );
          })}

          {integrations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No calendars connected</p>
              <p className="text-sm">Connect your Google or Outlook calendar to sync events and get AI-powered scheduling suggestions.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}