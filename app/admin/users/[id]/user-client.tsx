"use client";

import { db } from '@/lib/firebaseClient';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/auth/UserProvider';
import { useToast } from '@/components/ui/toast-provider';
import Link from 'next/link';

export default function UserDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { user, userRole, loading } = useUser();
  const { showToast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    status: '',
    notes: '',
  });

  // Check if user has admin or moderator role
  useEffect(() => {
    if (!loading && user) {
      if (userRole !== 'admin' && userRole !== 'moderator') {
        showToast({ 
          title: 'Access Denied', 
          description: 'You do not have permission to access this page.' 
        });
        router.push('/');
      } else {
        loadUserData();
      }
    }
  }, [user, userRole, loading, id, router, showToast]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Get user profile
      const userDoc = await getDoc(doc(db, 'profiles', id));
      if (!userDoc.exists()) {
        showToast({ 
          title: 'Error', 
          description: 'User not found.' 
        });
        router.push('/admin');
        return;
      }

      const userData = {
        id: userDoc.id,
        ...userDoc.data()
      };
      setUserData(userData);
      setFormData({
        role: userData.role || 'user',
        status: userData.status || 'active',
        notes: userData.admin_notes || '',
      });

      // Get user's listings
      const listingsQuery = query(
        collection(db, 'listings'),
        where('owner_id', '==', id)
      );
      const listingsSnapshot = await getDocs(listingsQuery);
      const listingsData = listingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserListings(listingsData);
    } catch (error) {
      console.error('Error loading user data:', error);
      showToast({ 
        title: 'Error', 
        description: 'Failed to load user data.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // Don't allow changing own role if admin
      if (id === user?.uid && formData.role !== userRole) {
        showToast({ 
          title: 'Error', 
          description: 'You cannot change your own role.' 
        });
        return;
      }

      await updateDoc(doc(db, 'profiles', id), {
        role: formData.role,
        status: formData.status,
        admin_notes: formData.notes,
        updated_at: new Date().toISOString(),
      });
      
      showToast({ 
        title: 'Success', 
        description: 'User updated successfully.' 
      });
      
      setEditMode(false);
      loadUserData(); // Reload user data
    } catch (error) {
      console.error('Error updating user:', error);
      showToast({ 
        title: 'Error', 
        description: 'Failed to update user.' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Format date for display
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore timestamps or ISO strings
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Render role badge with appropriate color
  const renderRoleBadge = (role: string) => {
    let bgColor = '';
    switch (role) {
      case 'admin':
        bgColor = 'bg-purple-100 text-purple-800 border-purple-200';
        break;
      case 'moderator':
        bgColor = 'bg-blue-100 text-blue-800 border-blue-200';
        break;
      default:
        bgColor = 'bg-green-100 text-green-800 border-green-200';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${bgColor}`}>
        {role}
      </span>
    );
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let bgColor = '';
    switch (status) {
      case 'active':
        bgColor = 'bg-green-100 text-green-800 border-green-200';
        break;
      case 'pending':
        bgColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        break;
      case 'suspended':
        bgColor = 'bg-red-100 text-red-800 border-red-200';
        break;
      default:
        bgColor = 'bg-gray-100 text-gray-800 border-gray-200';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${bgColor}`}>
        {status}
      </span>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || (userRole !== 'admin' && userRole !== 'moderator')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You do not have permission to access this page.</p>
          <Link href="/" className="text-green-600 hover:text-green-700 font-medium">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-4">The requested user could not be found.</p>
          <Link href="/admin" className="text-green-600 hover:text-green-700 font-medium">
            Return to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            </div>
            <div className="flex items-center gap-2">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit User
                </button>
              ) : (
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-20 w-20">
                  {userData.avatar_url ? (
                    <img className="h-20 w-20 rounded-full" src={userData.avatar_url} alt="" />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-xl">
                      {userData.first_name?.[0]}{userData.last_name?.[0]}
                    </div>
                  )}
                </div>
                <div className="ml-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {userData.first_name} {userData.last_name}
                  </h2>
                  <p className="text-sm text-gray-500">{userData.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {renderRoleBadge(userData.role || 'user')}
                    {renderStatusBadge(userData.status || 'active')}
                  </div>
                </div>
              </div>

              {!editMode ? (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userData.phone || 'Not provided'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userData.dob || 'Not provided'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Country</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userData.country || 'Not provided'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">City</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userData.city || 'Not provided'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Created At</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(userData.created_at)}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(userData.last_login)}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Admin Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                        {userData.admin_notes || 'No notes'}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <form onSubmit={handleUpdateUser} className="mt-6 border-t border-gray-200 pt-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                        disabled={id === user?.uid}
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                      {id === user?.uid && (
                        <p className="mt-1 text-xs text-red-500">You cannot change your own role.</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Internal notes about this user..."
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {isUpdating ? 'Updating...' : 'Update User'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* User Listings */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
                <h3 className="text-lg font-medium leading-6 text-gray-900">User Listings</h3>
              </div>
              <div className="p-6">
                {userListings.length > 0 ? (
                  <div className="space-y-4">
                    {userListings.map(listing => (
                      <div key={listing.id} className="border border-gray-200 rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-md font-medium text-gray-900">{listing.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {listing.description?.substring(0, 100)}
                              {listing.description?.length > 100 ? '...' : ''}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {listing.price ? `$${listing.price}` : 'Contact for price'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(listing.created_at)}
                              </span>
                              {renderStatusBadge(listing.status || 'active')}
                            </div>
                          </div>
                          <Link 
                            href={`/admin/listings/${listing.id}`}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">This user has no listings.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset this user\'s password? An email will be sent to them.')) {
                      // Password reset functionality would go here
                      alert('Password reset functionality not implemented in this demo');
                    }
                  }}
                  className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Send Password Reset Email
                </button>
                {userData.status !== 'suspended' ? (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to suspend this user? They will not be able to log in.')) {
                        setFormData({ ...formData, status: 'suspended' });
                        // We would submit the form here
                        handleUpdateUser({ preventDefault: () => {} } as React.FormEvent);
                      }
                    }}
                    className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                    disabled={id === user?.uid}
                  >
                    Suspend User
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reactivate this user?')) {
                        setFormData({ ...formData, status: 'active' });
                        // We would submit the form here
                        handleUpdateUser({ preventDefault: () => {} } as React.FormEvent);
                      }
                    }}
                    className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Reactivate User
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                      // Delete functionality would go here
                      alert('Delete functionality not implemented in this demo');
                    }
                  }}
                  className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  disabled={id === user?.uid}
                >
                  Delete User
                </button>
                {id === user?.uid && (
                  <p className="text-xs text-red-500 text-center">You cannot delete your own account.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}