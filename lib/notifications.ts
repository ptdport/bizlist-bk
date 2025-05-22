import { db } from '@/lib/firebaseClient';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

/**
 * Creates a notification for a user
 * @param params Notification parameters
 * @returns Promise with the notification ID
 */
export const createNotification = async (params: CreateNotificationParams): Promise<string> => {
  try {
    const notificationRef = await addDoc(collection(db, 'notifications'), {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      read: false,
      createdAt: serverTimestamp(),
      link: params.link || null
    });
    
    return notificationRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Creates notifications for multiple users with the same content
 * @param userIds Array of user IDs
 * @param title Notification title
 * @param message Notification message
 * @param type Notification type
 * @param link Optional link
 * @returns Promise with array of notification IDs
 */
export const createNotificationForMultipleUsers = async (
  userIds: string[],
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error',
  link?: string
): Promise<string[]> => {
  try {
    const notificationPromises = userIds.map(userId => 
      createNotification({
        userId,
        title,
        message,
        type,
        link
      })
    );
    
    return await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating notifications for multiple users:', error);
    throw error;
  }
};

/**
 * Creates a notification for admin users
 * @param adminUserIds Array of admin user IDs
 * @param title Notification title
 * @param message Notification message
 * @param type Notification type
 * @param link Optional link
 * @returns Promise with array of notification IDs
 */
export const createAdminNotification = async (
  adminUserIds: string[],
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error',
  link?: string
): Promise<string[]> => {
  return createNotificationForMultipleUsers(
    adminUserIds,
    title,
    message,
    type,
    link
  );
};