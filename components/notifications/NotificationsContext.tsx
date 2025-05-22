"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@/components/auth/UserProvider';
import { db } from '@/lib/firebaseClient';
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc, Timestamp } from 'firebase/firestore';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Timestamp;
  link?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Timestamp;
  senderName?: string;
  senderAvatar?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  messages: Message[];
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  markAllMessagesAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Listen for notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadNotificationsCount(0);
      return;
    }

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsList: Notification[] = [];
      let unreadCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Notification, 'id'>;
        const notification: Notification = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt as Timestamp
        };
        
        notificationsList.push(notification);
        if (!notification.read) {
          unreadCount++;
        }
      });

      setNotifications(notificationsList);
      setUnreadNotificationsCount(unreadCount);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for messages
  useEffect(() => {
    if (!user) {
      setMessages([]);
      setUnreadMessagesCount(0);
      return;
    }

    const messagesQuery = query(
      collection(db, 'messages'),
      where('receiverId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList: Message[] = [];
      let unreadCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Message, 'id'>;
        const message: Message = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt as Timestamp
        };
        
        messagesList.push(message);
        if (!message.read) {
          unreadCount++;
        }
      });

      setMessages(messagesList);
      setUnreadMessagesCount(unreadCount);
    });

    return () => unsubscribe();
  }, [user]);

  // Mark a notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      
      // Update each unread notification
      const updatePromises = unreadNotifications.map(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        return updateDoc(notificationRef, { read: true });
      });
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Mark a message as read
  const markMessageAsRead = async (messageId: string) => {
    if (!user) return;
    
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, { read: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Mark all messages as read
  const markAllMessagesAsRead = async () => {
    if (!user || messages.length === 0) return;
    
    try {
      const unreadMessages = messages.filter(m => !m.read);
      
      // Update each unread message
      const updatePromises = unreadMessages.map(message => {
        const messageRef = doc(db, 'messages', message.id);
        return updateDoc(messageRef, { read: true });
      });
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        messages,
        unreadNotificationsCount,
        unreadMessagesCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        markMessageAsRead,
        markAllMessagesAsRead
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};