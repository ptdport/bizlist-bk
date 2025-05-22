"use client";

import React from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNotifications, Notification } from './NotificationsContext';

export const NotificationsDropdown = () => {
  const router = useRouter();
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    await markNotificationAsRead(notification.id);
    
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadNotificationsCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllNotificationsAsRead()}
              className="text-xs h-7"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`px-4 py-3 cursor-pointer flex flex-col items-start gap-1 ${!notification.read ? 'bg-muted/50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between w-full">
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {notification.createdAt ? 
                      formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true }) : 
                      'recently'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                {!notification.read && (
                  <span className="w-2 h-2 rounded-full bg-primary mt-1" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="text-center px-2 py-1.5">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-primary text-sm"
                onClick={() => router.push('/notifications')}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};