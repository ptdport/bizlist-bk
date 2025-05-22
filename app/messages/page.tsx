"use client";

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/components/notifications/NotificationsContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Check } from 'lucide-react';

export default function MessagesPage() {
  const router = useRouter();
  const { 
    messages, 
    markMessageAsRead, 
    markAllMessagesAsRead 
  } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');

  const unreadMessages = messages.filter(message => !message.read);
  const readMessages = messages.filter(message => message.read);

  const displayedMessages = 
    activeTab === 'all' ? messages : 
    activeTab === 'unread' ? unreadMessages : 
    readMessages;

  const handleMessageClick = (messageId: string, senderId: string) => {
    markMessageAsRead(messageId);
    router.push(`/messages/${senderId}`);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Messages</h1>
            {unreadMessages.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAllMessagesAsRead()}
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
                  {messages.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                  {unreadMessages.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="read">
                Read
                <span className="ml-2 bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                  {readMessages.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {displayedMessages.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No messages</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'all' ? "You don't have any messages yet." :
                     activeTab === 'unread' ? "You don't have any unread messages." :
                     "You don't have any read messages."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`p-4 rounded-lg border cursor-pointer hover:bg-muted/10 transition-colors ${!message.read ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}
                      onClick={() => handleMessageClick(message.id, message.senderId)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {message.senderAvatar ? (
                            <img 
                              src={message.senderAvatar} 
                              alt={message.senderName || 'User'} 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-medium">
                                {(message.senderName || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium flex items-center gap-2">
                              {message.senderName || 'Unknown User'}
                              {!message.read && (
                                <span className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {message.createdAt ? 
                                formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true }) : 
                                'recently'}
                            </span>
                          </div>
                          <p className="text-muted-foreground line-clamp-2 mt-1">{message.content}</p>
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