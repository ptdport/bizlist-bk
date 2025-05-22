import { db } from '@/lib/firebaseClient';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Gets all admin user IDs from the database
 * @returns Promise with array of admin user IDs
 */
export const getAdminUserIds = async (): Promise<string[]> => {
  try {
    // Query users with admin role
    const adminQuery = query(
      collection(db, 'profiles'),
      where('role', '==', 'admin')
    );
    
    const adminSnapshot = await getDocs(adminQuery);
    const adminUserIds: string[] = [];
    
    adminSnapshot.forEach(doc => {
      adminUserIds.push(doc.id);
    });
    
    return adminUserIds;
  } catch (error) {
    console.error('Error getting admin user IDs:', error);
    return [];
  }
};