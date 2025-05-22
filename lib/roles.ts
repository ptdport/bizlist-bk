"use client";

import { db } from './firebaseClient';
import { doc, getDoc } from 'firebase/firestore';

// Available roles in the system
export type UserRole = 'user' | 'moderator' | 'admin';

/**
 * Check if a user has a specific role
 * @param userId The user ID to check
 * @param role The role to check for
 * @returns Promise<boolean> True if the user has the role, false otherwise
 */
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      return false;
    }
    
    const userRole = profileSnap.data()?.role;
    return userRole === role;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Get the role of a user
 * @param userId The user ID to check
 * @returns Promise<UserRole | null> The user's role, or null if not found
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      return null;
    }
    
    return profileSnap.data()?.role as UserRole || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Check if a user is an admin
 * @param userId The user ID to check
 * @returns Promise<boolean> True if the user is an admin, false otherwise
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, 'admin');
}

/**
 * Check if a user is a moderator
 * @param userId The user ID to check
 * @returns Promise<boolean> True if the user is a moderator, false otherwise
 */
export async function isModerator(userId: string): Promise<boolean> {
  return hasRole(userId, 'moderator');
}