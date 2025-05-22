"use client";

import { db } from '@/lib/firebaseClient';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/auth/UserProvider';
import { useToast } from '@/components/ui/toast-provider';
import Link from 'next/link';

export default function ReportDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { user, userRole, loading } = useUser();
  const { showToast } = useToast();
  const [reportData, setReportData] = useState<any>(null);
  const [reporterData, setReporterData] = useState<any>(null);
  const [reportedItemData, setReportedItemData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    admin_notes: '',
    admin_response: '',
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
        loadReportData();
      }
    }
  }, [user, userRole, loading, id, router, showToast]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      // Get report data
      const reportDoc = await getDoc(doc(db, 'reports', id));
      if (!reportDoc.exists()) {
        showToast({ 
          title: 'Error', 
          description: 'Report not found.' 
        });
        router.push('/admin');
        return;
      }

      const reportData = {
        id: reportDoc.id,
        ...reportDoc.data()
      };
      setReportData(reportData);
      setFormData({
        status: reportData.status || 'pending',
        admin_notes: reportData.admin_notes || '',
        admin_response: reportData.admin_response || '',
      });

      // Get reporter data if available
      if (reportData.reporter_id) {
        const reporterDoc = await getDoc(doc(db, 'profiles', reportData.reporter_id));
        if (reporterDoc.exists()) {
          setReporterData({
            id: reporterDoc.id,
            ...reporterDoc.data()
          });
        }
      }

      // Get reported item data if available
      if (reportData.reported_item_id && reportData.reported_item_type) {
        const itemDoc = await getDoc(doc(db, reportData.reported_item_type + 's', reportData.reported_item_id));
        if (itemDoc.exists()) {
          setReportedItemData({
            id: itemDoc.id,
            type: reportData.reported_item_type,
            ...itemDoc.data()
          });
        }
      }
    } catch (error) {
      console.error('Error loading report data:', error);
      showToast({ 
        title: 'Error', 
        description: 'Failed to load report data.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      await updateDoc(doc(db, 'reports', id), {
        status: formData.status,
        admin_notes: formData.admin_notes,
        admin_response: formData.admin_response,
        updated_at: new Date().toISOString(),
        resolved_by: formData.status === 'resolved' ? user?.uid : null,
        resolved_at: formData.status === 'resolved' ? new Date().toISOString() : null,
      });
      
      showToast({ 
        title: 'Success', 
        description: 'Report updated successfully.' 
      });
      
      setEditMode(false);
      loadReportData(); // Reload report data
    } catch (error) {
      console.error('Error updating report:', error);
      showToast({ 
        title: 'Error', 
        description: 'Failed to update report.' 
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
      case 'pending':
        bgColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        break;
      case 'investigating':
        bgColor = 'bg-blue-100 text-blue-800 border-blue-200';
        break;
      case 'resolved':
        bgColor = 'bg-green-100 text-green-800 border-green-200';
        break;
      case 'rejected':
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

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
          <p className="text-gray-600 mb-4">The requested report could not be found.</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Report Details</h1>
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
                  Update Report
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
          {/* Report Details */}
          <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{reportData.title || 'Untitled Report'}</h2>
                <div>
                  {renderStatusBadge(reportData.status || 'pending')}
                </div>
              </div>

              {!editMode ? (
                <div className="space-y-6">
                  {/* Report Details */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Report Details</h3>
                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Report Type</dt>
                        <dd className="mt-1 text-sm text-gray-900">{reportData.type || 'General'}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Reported Item Type</dt>
                        <dd className="mt-1 text-sm text-gray-900">{reportData.reported_item_type || 'Unknown'}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Created At</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(reportData.created_at)}</dd>
                      </div>
                      {reportData.status === 'resolved' && (
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Resolved At</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatDate(reportData.resolved_at)}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Report Description */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Description</h3>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                      {reportData.description || 'No description provided.'}
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Admin Notes</h3>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                      {reportData.admin_notes || 'No admin notes.'}
                    </div>
                  </div>

                  {/* Admin Response */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Response to Reporter</h3>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                      {reportData.admin_response || 'No response has been sent.'}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateReport} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                    >
                      <option value="pending">Pending</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Notes (Internal)</label>
                    <textarea
                      value={formData.admin_notes}
                      onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Internal notes about this report..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Response to Reporter</label>
                    <textarea
                      value={formData.admin_response}
                      onChange={(e) => setFormData({ ...formData, admin_response: e.target.value })}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="This response will be visible to the reporter..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {isUpdating ? 'Updating...' : 'Update Report'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Info */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Reporter Information</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                {reporterData ? (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {reporterData.avatar_url ? (
                          <img className="h-10 w-10 rounded-full" src={reporterData.avatar_url} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            {reporterData.first_name?.[0]}{reporterData.last_name?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {reporterData.first_name} {reporterData.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reporterData.email}
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={`/admin/users/${reporterData.id}`}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      View Reporter Profile
                    </Link>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {reportData.reporter_id ? 'Reporter information not available' : 'Anonymous report'}
                  </div>
                )}
              </div>
            </div>

            {/* Reported Item */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Reported Item</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                {reportedItemData ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {reportedItemData.title || reportedItemData.business_name || 'Untitled'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Type: {reportedItemData.type}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-3">
                      {reportedItemData.description || 'No description available.'}
                    </div>
                    <Link 
                      href={`/admin/${reportedItemData.type}s/${reportedItemData.id}`}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      View Reported Item
                    </Link>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {reportData.reported_item_id ? 'Reported item not found or has been removed' : 'No specific item reported'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}