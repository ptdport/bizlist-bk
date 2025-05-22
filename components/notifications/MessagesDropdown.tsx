"use client";

import React from 'react';
import { MessageSquare } from 'lucide-react';
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
import { useNotifications, Message } from './NotificationsContext';

export const MessagesDropdown = () => {
  const router = useRouter();
  const { 
    messages, 
    unreadMessagesCount, 
    markMessageAsRead, 
    markAllMessagesAsRead 
  } = useNotifications();

  const handleMessageClick = async (message: Message) => {
    await markMessageAsRead(message.id);
    router.push(`/messages/${message.senderId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-medium">Messages</h3>
          {unreadMessagesCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllMessagesAsRead()}
              className="text-xs h-7"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p>No messages yet</p>
            </div>
          ) : (
            messages.map((message) => (
              <DropdownMenuItem 
                key={message.id}
                className={`px-4 py-3 cursor-pointer ${!message.read ? 'bg-muted/50' : ''}`}
                onClick={() => handleMessageClick(message)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {message.senderAvatar ? (
                      <img 
                        src={message.senderAvatar} 
                        alt={message.senderName || 'User'} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {(message.senderName || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">
                        {message.senderName || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {message.createdAt ? 
                          formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true }) : 
                          'recently'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{message.content}</p>
                  </div>
                  {!message.read && (
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        {messages.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="text-center px-2 py-1.5">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-primary text-sm"
                onClick={() => router.push('/messages')}
              >
                View all messages
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};