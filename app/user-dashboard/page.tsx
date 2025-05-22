"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useUser } from '@/components/auth/UserProvider';
import { useProfile } from '@/components/auth/ProfileContext';
import { db } from '@/lib/firebaseClient';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, Bell, User, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast-provider';
import { formatDistanceToNow } from 'date-fns';

export default function UserDashboard() {
  return (
    <ProtectedRoute>
      <UserDashboardContent />
    </ProtectedRoute>
  );
}

function UserDashboardContent() {
  const router = useRouter();
  const { user } = useUser();
  const { profile } = useProfile();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch user's bookings
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('user_id', '==', user.uid),
          orderBy('created_at', 'desc'),
          limit(5)
        );
        
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsData = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate() || new Date()
        }));
        
        setBookings(bookingsData);
        
        // Fetch user's messages
        const messagesQuery = query(
          collection(db, 'messages'),
          where('recipient_id', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        
        const messagesSnapshot = await getDocs(messagesQuery);
        const messagesData = messagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        
        setMessages(messagesData);
        
        // Fetch user's notifications
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('user_id', '==', user.uid),
          orderBy('created_at', 'desc'),
          limit(5)
        );
        
        const notificationsSnapshot = await getDocs(notificationsQuery);
        const notificationsData = notificationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate() || new Date()
        }));
        
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        showToast({
          title: 'Error',
          description: 'There was an error loading your dashboard. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, showToast]);

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">User Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your bookings, messages, and account settings
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                View Profile
              </Link>
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-48"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList className="mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* User Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Welcome, {profile?.first_name || 'User'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{profile?.first_name} {profile?.last_name}</h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      {profile?.has_provider && (
                        <Badge className="mt-2">Provider Account</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recent Bookings */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Recent Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookings.length > 0 ? (
                      <ul className="space-y-3">
                        {bookings.slice(0, 3).map((booking) => (
                          <li key={booking.id} className="flex items-start gap-2">
                            {getStatusIcon(booking.status)}
                            <div className="flex-1 text-sm">
                              <p className="font-medium">{booking.service_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {booking.date ? new Date(booking.date).toLocaleDateString() : 'No date'}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent bookings</p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href="/user-dashboard/bookings">View All Bookings</Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Recent Messages */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Recent Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {messages.length > 0 ? (
                      <ul className="space-y-3">
                        {messages.slice(0, 3).map((message) => (
                          <li key={message.id} className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {message.sender_avatar ? (
                                <img 
                                  src={message.sender_avatar} 
                                  alt="Sender" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 text-sm">
                              <p className="font-medium">{message.sender_name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {message.content}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent messages</p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href="/messages">View All Messages</Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Recent Notifications */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Bell className="mr-2 h-4 w-4" />
                      Recent Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {notifications.length > 0 ? (
                      <ul className="space-y-3">
                        {notifications.slice(0, 3).map((notification) => (
                          <li key={notification.id} className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              {notification.type === 'message' ? (
                                <MessageSquare className="h-4 w-4 text-primary" />
                              ) : notification.type === 'booking' ? (
                                <Calendar className="h-4 w-4 text-primary" />
                              ) : (
                                <Bell className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 text-sm">
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(notification.created_at, { addSuffix: true })}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent notifications</p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href="/notifications">View All Notifications</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="bookings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Bookings</CardTitle>
                  <CardDescription>
                    Manage your service bookings and appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <Card key={booking.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold">{booking.service_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Provider: {booking.provider_name}
                                </p>
                              </div>
                              <Badge variant={
                                booking.status === 'completed' ? 'default' : 
                                booking.status === 'cancelled' ? 'destructive' : 
                                'outline'
                              }>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p>{booking.date ? new Date(booking.date).toLocaleDateString() : 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Time</p>
                                <p>{booking.time || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Location</p>
                                <p>{booking.location || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Price</p>
                                <p>${booking.price?.toFixed(2) || 'Not specified'}</p>
                              </div>
                            </div>
                            <div className="flex justify-end items-center mt-4">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/bookings/${booking.id}`}>
                                  <ExternalLink className="mr-2 h-3 w-3" />
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        You don't have any bookings yet.
                      </p>
                      <Button asChild>
                        <Link href="/categories">
                          Browse Services
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="messages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Messages</CardTitle>
                  <CardDescription>
                    Communicate with service providers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <Card key={message.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {message.sender_avatar ? (
                                  <img 
                                    src={message.sender_avatar} 
                                    alt="Sender" 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h3 className="font-semibold">{message.sender_name || 'Unknown'}</h3>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm mt-1">{message.content}</p>
                              </div>
                            </div>
                            <div className="flex justify-end items-center mt-4">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/messages/${message.conversation_id}`}>
                                  Reply
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        You don't have any messages yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Notifications</CardTitle>
                  <CardDescription>
                    Stay updated with important information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <Card key={notification.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {notification.type === 'message' ? (
                                  <MessageSquare className="h-5 w-5 text-primary" />
                                ) : notification.type === 'booking' ? (
                                  <Calendar className="h-5 w-5 text-primary" />
                                ) : (
                                  <Bell className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h3 className="font-semibold">{notification.title}</h3>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(notification.created_at, { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm mt-1">{notification.message}</p>
                              </div>
                            </div>
                            {notification.action_url && (
                              <div className="flex justify-end items-center mt-4">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={notification.action_url}>
                                    {notification.action_text || 'View'}
                                  </Link>
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        You don't have any notifications yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
}