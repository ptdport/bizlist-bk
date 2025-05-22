"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/auth/UserProvider';
import { db } from '@/lib/firebaseClient';
import { collection, getDocs, doc, updateDoc, query, orderBy, limit, startAfter, where, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/toast-provider';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Eye, Trash, XCircle } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Admin dashboard tabs
type TabType = 'dashboard' | 'users' | 'providers' | 'reports';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, userRole, loading } = useUser();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [providerStatusFilter, setProviderStatusFilter] = useState('pending');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalProviders: 0,
    pendingProviders: 0,
    approvedProviders: 0,
    rejectedProviders: 0,
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Check if user has admin or moderator role
  useEffect(() => {
    if (!loading && user) {
      if (userRole !== 'admin' && userRole !== 'moderator') {
        showToast({ 
          title: 'Access Denied', 
          description: 'You do not have permission to access this page.' 
        });
        router.push('/');
      }
    }
  }, [user, userRole, loading, router, showToast]);

  // Load data based on active tab
  useEffect(() => {
    if (user && (userRole === 'admin' || userRole === 'moderator')) {
      if (activeTab === 'dashboard') {
        fetchStatistics();
      } else if (activeTab === 'providers') {
        fetchProviders(providerStatusFilter);
      } else {
        loadData();
      }
    }
  }, [activeTab, user, userRole, providerStatusFilter]);
  
  // Fetch dashboard statistics and recent activity
  const fetchStatistics = async () => {
    try {
      // Get current date at midnight for today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISOString = today.toISOString();
      
      // Fetch recent activity
      await fetchRecentActivity();
      
      // Fetch total users count
      const totalUsersQuery = query(collection(db, 'profiles'));
      const totalUsersSnapshot = await getDocs(totalUsersQuery);
      const totalUsers = totalUsersSnapshot.size;
      
      // Fetch active users count
      const activeUsersQuery = query(collection(db, 'profiles'), where('status', '==', 'active'));
      const activeUsersSnapshot = await getDocs(activeUsersQuery);
      const activeUsers = activeUsersSnapshot.size;
      
      // Fetch new users today
      const newUsersTodayQuery = query(
        collection(db, 'profiles'), 
        where('created_at', '>=', todayISOString)
      );
      const newUsersTodaySnapshot = await getDocs(newUsersTodayQuery);
      const newUsersToday = newUsersTodaySnapshot.size;
      
      // Fetch provider statistics
      const totalProvidersQuery = query(collection(db, 'providers'));
      const totalProvidersSnapshot = await getDocs(totalProvidersQuery);
      const totalProviders = totalProvidersSnapshot.size;
      
      const pendingProvidersQuery = query(collection(db, 'providers'), where('status', '==', 'pending'));
      const pendingProvidersSnapshot = await getDocs(pendingProvidersQuery);
      const pendingProviders = pendingProvidersSnapshot.size;
      
      const approvedProvidersQuery = query(collection(db, 'providers'), where('status', '==', 'approved'));
      const approvedProvidersSnapshot = await getDocs(approvedProvidersQuery);
      const approvedProviders = approvedProvidersSnapshot.size;
      
      const rejectedProvidersQuery = query(collection(db, 'providers'), where('status', '==', 'rejected'));
      const rejectedProvidersSnapshot = await getDocs(rejectedProvidersQuery);
      const rejectedProviders = rejectedProvidersSnapshot.size;
      
      // Fetch total reports count
      const totalReportsQuery = query(collection(db, 'reports'));
      const totalReportsSnapshot = await getDocs(totalReportsQuery);
      const totalReports = totalReportsSnapshot.size;
      
      // Fetch pending reports count
      const pendingReportsQuery = query(collection(db, 'reports'), where('status', '==', 'pending'));
      const pendingReportsSnapshot = await getDocs(pendingReportsQuery);
      const pendingReports = pendingReportsSnapshot.size;
      
      // Fetch resolved reports count
      const resolvedReportsQuery = query(collection(db, 'reports'), where('status', '==', 'resolved'));
      const resolvedReportsSnapshot = await getDocs(resolvedReportsQuery);
      const resolvedReports = resolvedReportsSnapshot.size;
      
      // Update stats state
      setStats({
        totalUsers,
        activeUsers,
        newUsersToday,
        totalProviders,
        pendingProviders,
        approvedProviders,
        rejectedProviders,
        totalReports,
        pendingReports,
        resolvedReports
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const loadData = async (loadMore = false) => {
    setIsLoading(true);
    try {
      let q;
      const pageSize = 10;

      switch (activeTab) {
        case 'users':
          q = loadMore && lastVisible
            ? query(collection(db, 'profiles'), orderBy('created_at', 'desc'), startAfter(lastVisible), limit(pageSize))
            : query(collection(db, 'profiles'), orderBy('created_at', 'desc'), limit(pageSize));
          
          const userSnapshot = await getDocs(q);
          const userData = userSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setUsers(loadMore ? [...users, ...userData] : userData);
          setLastVisible(userSnapshot.docs[userSnapshot.docs.length - 1] || null);
          setHasMore(userSnapshot.docs.length === pageSize);
          break;

        case 'reports':
          q = loadMore && lastVisible
            ? query(collection(db, 'reports'), orderBy('created_at', 'desc'), startAfter(lastVisible), limit(pageSize))
            : query(collection(db, 'reports'), orderBy('created_at', 'desc'), limit(pageSize));
          
          const reportSnapshot = await getDocs(q);
          const reportData = reportSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setReports(loadMore ? [...reports, ...reportData] : reportData);
          setLastVisible(reportSnapshot.docs[reportSnapshot.docs.length - 1] || null);
          setHasMore(reportSnapshot.docs.length === pageSize);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast({ 
        title: 'Error', 
        description: 'Failed to load data. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadData(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality based on active tab
    // This would require more complex Firestore queries
  };

  // Fetch recent activity across all collections
  const fetchRecentActivity = async () => {
    try {
      const activityItems = [];
      const itemLimit = 5; // Limit to 5 most recent items from each collection
      
      // Fetch recent users
      const recentUsersQuery = query(
        collection(db, 'profiles'),
        orderBy('created_at', 'desc'),
        limit(itemLimit)
      );
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      const recentUsers = recentUsersSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'user',
        action: 'joined',
        data: doc.data(),
        timestamp: doc.data().created_at
      }));
      activityItems.push(...recentUsers);
      
      // Fetch recent listings
      const recentListingsQuery = query(
        collection(db, 'listings'),
        orderBy('created_at', 'desc'),
        limit(itemLimit)
      );
      const recentListingsSnapshot = await getDocs(recentListingsQuery);
      const recentListings = recentListingsSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'listing',
        action: 'created',
        data: doc.data(),
        timestamp: doc.data().created_at
      }));
      activityItems.push(...recentListings);
      
      // Fetch recent reports
      const recentReportsQuery = query(
        collection(db, 'reports'),
        orderBy('created_at', 'desc'),
        limit(itemLimit)
      );
      const recentReportsSnapshot = await getDocs(recentReportsQuery);
      const recentReports = recentReportsSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'report',
        action: 'submitted',
        data: doc.data(),
        timestamp: doc.data().created_at
      }));
      activityItems.push(...recentReports);
      
      // Fetch recent provider applications
      const recentProvidersQuery = query(
        collection(db, 'providers'),
        orderBy('created_at', 'desc'),
        limit(itemLimit)
      );
      const recentProvidersSnapshot = await getDocs(recentProvidersQuery);
      const recentProviders = recentProvidersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'provider',
          action: 'registered',
          data: {
            ...data,
            business_name: data.business_name || 'Unknown Business'
          },
          timestamp: data.created_at
        };
      });
      activityItems.push(...recentProviders);
      
      // Sort all activity items by timestamp
      activityItems.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
        const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Take only the 10 most recent items
      setRecentActivity(activityItems.slice(0, 10));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setLastVisible(null);
    setHasMore(true);
    setSearchTerm('');
  };
  
  // Provider management functions
  const fetchProviders = async (status: string) => {
    try {
      setIsLoading(true);
      
      // Build query based on status
      const providersQuery = query(
        collection(db, 'providers'),
        where('status', '==', status),
        orderBy('created_at', 'desc')
      );
      
      const snapshot = await getDocs(providersQuery);
      
      // Map the documents to our state
      const providerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProviders(providerData);
    } catch (error) {
      console.error('Error fetching providers:', error);
      showToast({ 
        title: 'Error', 
        description: 'Failed to load providers. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveProvider = async (providerId: string) => {
    try {
      await updateDoc(doc(db, 'providers', providerId), {
        status: 'active',
        updated_at: new Date().toISOString()
      });
      
      showToast({ 
        title: 'Success', 
        description: 'Provider approved successfully.' 
      });
      
      // Refresh the list
      fetchProviders(providerStatusFilter);
    } catch (error) {
      console.error('Error approving provider:', error);
      showToast({ 
        title: 'Error', 
        description: 'Failed to approve provider.' 
      });
    }
  };

  const handleRejectProvider = async (providerId: string) => {
    try {
      await updateDoc(doc(db, 'providers', providerId), {
        status: 'rejected',
        updated_at: new Date().toISOString()
      });
      
      showToast({ 
        title: 'Success', 
        description: 'Provider rejected successfully.' 
      });
      
      // Refresh the list
      fetchProviders(providerStatusFilter);
    } catch (error) {
      console.error('Error rejecting provider:', error);
      showToast({ 
        title: 'Error', 
        description: 'Failed to reject provider.' 
      });
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    try {
      await deleteDoc(doc(db, 'providers', providerId));
      
      showToast({ 
        title: 'Success', 
        description: 'Provider deleted successfully.' 
      });
      
      // Refresh the list
      fetchProviders(providerStatusFilter);
    } catch (error) {
      console.error('Error deleting provider:', error);
      showToast({ 
        title: 'Error', 
        description: 'Failed to delete provider.' 
      });
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'profiles', userId), {
        role: newRole,
        updated_at: new Date().toISOString()
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      showToast({ 
        title: 'Success', 
        description: `User role updated to ${newRole}.` 
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      showToast({ 
        title: 'Error', 
        description: 'Failed to update user role.' 
      });
    }
  };

  const handleUpdateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: newStatus,
        updated_at: new Date().toISOString()
      });
      
      // Update local state
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status: newStatus } : report
      ));
      
      showToast({ 
        title: 'Success', 
        description: `Report status updated to ${newStatus}.` 
      });
    } catch (error) {
      console.error('Error updating report status:', error);
      showToast({ 
        title: 'Error', 
        description: 'Failed to update report status.' 
      });
    }
  };

  const handleDeleteItem = async (itemId: string, itemType: 'user' | 'listing' | 'report') => {
    if (!confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`)) {
      return;
    }

    try {
      let collectionName = '';
      switch (itemType) {
        case 'user':
          collectionName = 'profiles';
          break;
        case 'listing':
          collectionName = 'listings';
          break;
        case 'report':
          collectionName = 'reports';
          break;
      }

      await deleteDoc(doc(db, collectionName, itemId));
      
      // Update local state
      switch (itemType) {
        case 'user':
          setUsers(users.filter(user => user.id !== itemId));
          break;
        case 'listing':
          setListings(listings.filter(listing => listing.id !== itemId));
          break;
        case 'report':
          setReports(reports.filter(report => report.id !== itemId));
          break;
      }
      
      showToast({ 
        title: 'Success', 
        description: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully.` 
      });
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
      showToast({ 
        title: 'Error', 
        description: `Failed to delete ${itemType}.` 
      });
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
      case 'rejected':
        bgColor = 'bg-red-100 text-red-800 border-red-200';
        break;
      case 'resolved':
        bgColor = 'bg-blue-100 text-blue-800 border-blue-200';
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

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Logged in as:</span>
              {renderRoleBadge(userRole || 'user')}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as TabType)} className="w-full">
          <TabsList className="mb-6 w-full justify-start">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {/* Statistics Dashboard */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Dashboard Overview</h2>
                <button 
                  onClick={fetchStatistics}
                  className="flex items-center text-sm text-green-600 hover:text-green-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Stats
                </button>
              </div>
              
              {/* Quick Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-10 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm text-gray-500">Platform Health</p>
                      <p className="font-semibold text-gray-900">
                        {stats.pendingReports > 5 ? 'Needs Attention' : 'Good'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2 sm:mt-0">
                    <div className="w-2 h-10 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm text-gray-500">User Activity</p>
                      <p className="font-semibold text-gray-900">
                        {stats.newUsersToday > 0 ? 'Growing' : 'Stable'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2 sm:mt-0">
                    <div className="w-2 h-10 bg-purple-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm text-gray-500">Provider Status</p>
                      <p className="font-semibold text-gray-900">
                        {stats.pendingProviders > 0 ? `${stats.pendingProviders} Pending` : 'All Reviewed'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2 sm:mt-0">
                    <div className="w-2 h-10 bg-yellow-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm text-gray-500">Reports Status</p>
                      <p className="font-semibold text-gray-900">
                        {stats.pendingReports === 0 ? 'All Clear' : `${stats.pendingReports} Pending`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Users Stats */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-4">Users</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Users</span>
                      <div className="flex items-center">
                        <span className="text-xl font-bold text-gray-900">{stats.totalUsers}</span>
                        <svg className="w-4 h-4 ml-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <div className="flex items-center">
                        <span className="text-xl font-bold text-gray-900">{stats.activeUsers}</span>
                        <span className="ml-1 text-xs text-gray-500">
                          ({stats.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">New Today</span>
                      <div className="flex items-center">
                        <span className="text-xl font-bold text-green-600">{stats.newUsersToday}</span>
                        <svg className="w-4 h-4 ml-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Providers Stats */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-4">Providers</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Providers</span>
                      <div className="flex items-center">
                        <span className="text-xl font-bold text-gray-900">{stats.totalProviders}</span>
                        <svg className="w-4 h-4 ml-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending Applications</span>
                      <div className="flex items-center">
                        <span className="text-xl font-bold text-orange-600">{stats.pendingProviders}</span>
                        <button 
                          onClick={() => {
                            setActiveTab('providers');
                            setProviderStatusFilter('pending');
                          }} 
                          className="ml-2 text-xs text-blue-600 hover:underline"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approved Providers</span>
                      <div className="flex items-center">
                        <span className="text-xl font-bold text-green-600">{stats.approvedProviders}</span>
                        <svg className="w-4 h-4 ml-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reports Stats */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-4">Reports</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Reports</span>
                      <div className="flex items-center">
                        <span className="text-xl font-bold text-gray-900">{stats.totalReports}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending Reports</span>
                      <div className="flex items-center">
                        <span className="text-xl font-bold text-orange-600">{stats.pendingReports}</span>
                        {stats.pendingReports > 0 && (
                          <button 
                            onClick={() => setActiveTab('reports')} 
                            className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full hover:bg-orange-200"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Resolved Reports</span>
                      <div className="flex items-center">
                        <span className="text-xl font-bold text-green-600">{stats.resolvedReports}</span>
                        <span className="ml-1 text-xs text-gray-500">
                          ({stats.totalReports ? Math.round((stats.resolvedReports / stats.totalReports) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6 border border-gray-100 mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Recent Activity</h3>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={`${activity.type}-${activity.id}-${index}`} className="flex items-start">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                          activity.type === 'user' ? 'bg-blue-100 text-blue-600' : 
                          activity.type === 'listing' ? 'bg-green-100 text-green-600' : 
                          activity.type === 'provider' ? 'bg-indigo-100 text-indigo-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {activity.type === 'user' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          ) : activity.type === 'listing' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          ) : activity.type === 'provider' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.type === 'user' && `${activity.data.first_name || 'User'} ${activity.data.last_name || ''}`}
                            {activity.type === 'listing' && `${activity.data.title || 'Listing'}`}
                            {activity.type === 'report' && `Report #${activity.id.substring(0, 6)}`}
                            {activity.type === 'provider' && `${activity.data.business_name || 'Provider'} Registration`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.type === 'user' && `New user ${activity.action}`}
                            {activity.type === 'listing' && `New listing ${activity.action}`}
                            {activity.type === 'report' && `New report ${activity.action}`}
                            {activity.type === 'provider' && `Provider ${activity.action}`}
                            {activity.timestamp && ` • ${formatDate(activity.timestamp)}`}
                          </p>
                        </div>
                        <div className="ml-2">
                          <button 
                            onClick={() => {
                              if (activity.type === 'user') {
                                setActiveTab('users');
                              } else if (activity.type === 'provider') {
                                setActiveTab('providers');
                              } else if (activity.type === 'report') {
                                setActiveTab('reports');
                              }
                            }}
                            className="text-xs text-green-600 hover:text-green-700 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No recent activity found.</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            {/* Search and filters */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Users content */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {user.avatar_url ? (
                                  <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt="" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.first_name} {user.last_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderRoleBadge(user.role || 'user')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(user.status || 'active')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <select
                                value={user.role || 'user'}
                                onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                                disabled={userRole !== 'admin' || user.id === user?.uid}
                              >
                                <option value="user">User</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                              </select>
                              <button
                                onClick={() => handleDeleteItem(user.id, 'user')}
                                className="text-red-600 hover:text-red-900"
                                disabled={userRole !== 'admin' || user.id === user?.uid}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          {isLoading ? 'Loading users...' : 'No users found.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {hasMore && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="providers">
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Provider Management</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setProviderStatusFilter('pending')}
                    className={`px-3 py-1 text-sm rounded-md ${providerStatusFilter === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                      : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                  >
                    Pending
                  </button>
                  <button 
                    onClick={() => setProviderStatusFilter('active')}
                    className={`px-3 py-1 text-sm rounded-md ${providerStatusFilter === 'active' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                  >
                    Active
                  </button>
                  <button 
                    onClick={() => setProviderStatusFilter('rejected')}
                    className={`px-3 py-1 text-sm rounded-md ${providerStatusFilter === 'rejected' 
                      ? 'bg-red-100 text-red-800 border border-red-200' 
                      : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                  >
                    Rejected
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {providers.length > 0 ? (
                      providers.map((provider) => (
                        <tr key={provider.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{provider.business_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {provider.business_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{provider.business_email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(provider.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <Link 
                                href={`/provider/${provider.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </Link>
                              
                              {providerStatusFilter === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveProvider(provider.id)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Approve
                                  </button>
                                  
                                  <button
                                    onClick={() => handleRejectProvider(provider.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
                                    handleDeleteProvider(provider.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          {isLoading ? 'Loading providers...' : `No ${providerStatusFilter} providers found.`}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            {/* Search and filters */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search reports..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Reports content */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reported By
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.length > 0 ? (
                      reports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {report.title || 'Untitled Report'}
                            </div>
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {report.description || 'No description'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{report.reporter_name || report.reporter_id || 'Anonymous'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{report.type || 'General'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(report.status || 'pending')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(report.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <select
                                value={report.status || 'pending'}
                                onChange={(e) => handleUpdateReportStatus(report.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="pending">Pending</option>
                                <option value="investigating">Investigating</option>
                                <option value="resolved">Resolved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                              <button
                                onClick={() => handleDeleteItem(report.id, 'report')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          {isLoading ? 'Loading reports...' : 'No reports found.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {hasMore && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}