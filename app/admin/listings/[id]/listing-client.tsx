"use client";

import { db } from '@/lib/firebaseClient';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/auth/UserProvider';
import { useToast } from '@/components/ui/toast-provider';
import Link from 'next/link';

interface Listing {
  id: string;
  title?: string;
  status?: string;
  featured?: boolean;
  admin_notes?: string;
  owner_id?: string;
  images?: string[];
  price?: string;
  category?: string;
  location?: string;
  created_at?: any; // Firestore Timestamps or ISO strings
  description?: string;
  [key: string]: any; // For other potential properties from listingDoc.data()
}

export default function ListingDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { user, userRole, loading } = useUser();
  const { showToast } = useToast();
  const [listingData, setListingData] = useState<Listing | null>(null);
  const [ownerData, setOwnerData] = useState<any>(null); // Assuming ownerData might have a different structure or is less critical for this fix
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    featured: false,
    admin_notes: '',
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
        loadListingData();
      }
    }
  }, [user, userRole, loading, id, router, showToast]);

  const loadListingData = async () => {
    setIsLoading(true);
    try {
      // Get listing data
      const listingDoc = await getDoc(doc(db, 'listings', id));
      if (!listingDoc.exists()) {
        showToast({ 
          title: 'Error', 
          description: 'Listing not found.' 
        });
        router.push('/admin');
        return;
      }

      const listingFromDb = {
        id: listingDoc.id,
        ...listingDoc.data()
      } as Listing;
      setListingData(listingFromDb);
      setFormData({
        status: listingFromDb.status || 'active',
        featured: listingFromDb.featured || false,
        admin_notes: listingFromDb.admin_notes || '',
      });

      // Get owner data if available
      if (listingFromDb.owner_id) {
        const ownerDoc = await getDoc(doc(db, 'profiles', listingFromDb.owner_id));
        if (ownerDoc.exists()) {
          setOwnerData({
            id: ownerDoc.id,
            ...ownerDoc.data()
          });
        }
      }
    } catch (error) {
      console.error('Error loading listing data:', error);
      showToast({ 
        title: 'Error', 
        description: 'Failed to load listing data.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      await updateDoc(doc(db, 'listings', id), {
        status: formData.status,
        featured: formData.featured,
        admin_notes: formData.admin_notes,
        updated_at: new Date().toISOString(),
      });
      
      showToast({ 
        title: 'Success', 
        description: 'Listing updated successfully.' 
      });
      
      setEditMode(false);
      loadListingData(); // Reload listing data
    } catch (error) {
      console.error('Error updating listing:', error);
      showToast({ 
        title: 'Error', 
        description: 'Failed to update listing.' 
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

  if (!listingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h1>
          <p className="text-gray-600 mb-4">The requested listing could not be found.</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Listing Details</h1>
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
                  Edit Listing
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
          {/* Listing Details */}
          <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{listingData.title || 'Untitled Listing'}</h2>
                <div className="flex items-center gap-2">
                  {renderStatusBadge(listingData.status || 'active')}
                  {listingData.featured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Listing Images */}
              {listingData.images && listingData.images.length > 0 ? (
                <div className="mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {listingData.images.map((image: string, index: number) => (
                      <div key={index} className="aspect-w-1 aspect-h-1">
                        <img 
                          src={image} 
                          alt={`Listing image ${index + 1}`} 
                          className="object-cover w-full h-40 rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-6 bg-gray-100 h-40 rounded-md flex items-center justify-center text-gray-500">
                  No images available
                </div>
              )}

              {!editMode ? (
                <div className="space-y-6">
                  {/* Listing Details */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Details</h3>
                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Price</dt>
                        <dd className="mt-1 text-sm text-gray-900">{listingData.price ? `$${listingData.price}` : 'Not specified'}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Category</dt>
                        <dd className="mt-1 text-sm text-gray-900">{listingData.category || 'Uncategorized'}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                        <dd className="mt-1 text-sm text-gray-900">{listingData.location || 'Not specified'}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Created At</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(listingData.created_at)}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Listing Description */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Description</h3>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                      {listingData.description || 'No description provided.'}
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Admin Notes</h3>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                      {listingData.admin_notes || 'No admin notes.'}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateListing} className="space-y-6">
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
                  <div className="flex items-center">
                    <input
                      id="featured"
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      Featured Listing
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                    <textarea
                      value={formData.admin_notes}
                      onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Internal notes about this listing..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {isUpdating ? 'Updating...' : 'Update Listing'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Owner Information</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                {ownerData ? (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {ownerData.avatar_url ? (
                          <img className="h-10 w-10 rounded-full" src={ownerData.avatar_url} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            {ownerData.first_name?.[0]}{ownerData.last_name?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {ownerData.first_name} {ownerData.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ownerData.email}
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={`/admin/users/${ownerData.id}`}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      View Owner Profile
                    </Link>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Owner information not available
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Actions</h3>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-3">
                <Link 
                  href={`/listings/${listingData.id}`}
                  className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  target="_blank"
                >
                  View Public Listing
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
                      // Delete functionality would go here
                      alert('Delete functionality not implemented in this demo');
                    }
                  }}
                  className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Delete Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}