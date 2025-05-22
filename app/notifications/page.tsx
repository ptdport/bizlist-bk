"use client";

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/components/notifications/NotificationsContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');

  const unreadNotifications = notifications.filter(notification => !notification.read);
  const readNotifications = notifications.filter(notification => notification.read);

  const displayedNotifications = 
    activeTab === 'all' ? notifications : 
    activeTab === 'unread' ? unreadNotifications : 
    readNotifications;

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadNotifications.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAllNotificationsAsRead()}
                className="flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                All
                <span className="ml-2 bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                  {notifications.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                  {unreadNotifications.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="read">
                Read
                <span className="ml-2 bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                  {readNotifications.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {displayedNotifications.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'all' ? "You don't have any notifications yet." :
                     activeTab === 'unread' ? "You don't have any unread notifications." :
                     "You don't have any read notifications."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-lg border ${!notification.read ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{notification.title}</h3>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {notification.createdAt ? 
                              formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true }) : 
                              'recently'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markNotificationAsRead(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Mark as read</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}