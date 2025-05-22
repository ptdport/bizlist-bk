"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/auth/UserProvider';
import { db } from '@/lib/firebaseClient';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { createNotification } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { CheckCircle, Clock, Eye, Trash, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminProvidersPage() {
  const router = useRouter();
  const { user, userRole, loading: userLoading } = useUser();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    // Redirect if not admin or moderator
    if (!userLoading && (!user || (userRole !== 'admin' && userRole !== 'moderator'))) {
      router.push('/');
    }
  }, [user, userRole, userLoading, router]);

  useEffect(() => {
    fetchProviders(activeTab);
  }, [activeTab]);

  const fetchProviders = async (status: string) => {
    try {
      setLoading(true);
      
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
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (providerId: string) => {
    try {
      // Get the provider data to access user_id and business name
      const providerDoc = await getDoc(doc(db, 'providers', providerId));
      if (!providerDoc.exists()) {
        console.error('Provider document not found');
        return;
      }
      
      const providerData = providerDoc.data();
      const userId = providerData.user_id;
      const businessName = providerData.business_name || 'Your business';
      
      // Update provider status
      await updateDoc(doc(db, 'providers', providerId), {
        status: 'active',
        updated_at: new Date().toISOString()
      });
      
      // Update user profile
      if (userId) {
        await updateDoc(doc(db, 'profiles', userId), {
          provider_status: 'active',
          updated_at: new Date().toISOString()
        });
        
        // Send notification to the user
        await createNotification({
          userId: userId,
          title: 'Provider Application Approved',
          message: `Congratulations! Your provider application for ${businessName} has been approved. You can now edit your profile and create listings.`,
          type: 'success',
          link: '/dashboard/business-profile'
        });
      }
      
      // Refresh the list
      fetchProviders(activeTab);
    } catch (error) {
      console.error('Error approving provider:', error);
    }
  };

  const handleReject = async (providerId: string) => {
    try {
      // Get the provider data to access user_id and business name
      const providerDoc = await getDoc(doc(db, 'providers', providerId));
      if (!providerDoc.exists()) {
        console.error('Provider document not found');
        return;
      }
      
      const providerData = providerDoc.data();
      const userId = providerData.user_id;
      const businessName = providerData.business_name || 'Your business';
      
      // Update provider status
      await updateDoc(doc(db, 'providers', providerId), {
        status: 'rejected',
        updated_at: new Date().toISOString()
      });
      
      // Update user profile
      if (userId) {
        await updateDoc(doc(db, 'profiles', userId), {
          provider_status: 'rejected',
          updated_at: new Date().toISOString()
        });
        
        // Send notification to the user
        await createNotification({
          userId: userId,
          title: 'Provider Application Rejected',
          message: `We're sorry, but your provider application for ${businessName} has been rejected. Please contact support for more information.`,
          type: 'error',
          link: '/dashboard/business-profile'
        });
      }
      
      // Refresh the list
      fetchProviders(activeTab);
    } catch (error) {
      console.error('Error rejecting provider:', error);
    }
  };

  const handleDelete = async (providerId: string) => {
    try {
      // Get the provider data to access user_id and business name
      const providerDoc = await getDoc(doc(db, 'providers', providerId));
      if (!providerDoc.exists()) {
        console.error('Provider document not found');
        return;
      }
      
      const providerData = providerDoc.data();
      const userId = providerData.user_id;
      const businessName = providerData.business_name || 'Your business';
      
      // Delete the provider document
      await deleteDoc(doc(db, 'providers', providerId));
      
      // Update user profile if user exists
      if (userId) {
        await updateDoc(doc(db, 'profiles', userId), {
          has_provider: false,
          provider_status: null,
          updated_at: new Date().toISOString()
        });
        
        // Send notification to the user
        await createNotification({
          userId: userId,
          title: 'Provider Profile Deleted',
          message: `Your provider profile for ${businessName} has been deleted by an administrator. Please contact support if you have any questions.`,
          type: 'warning',
          link: '/dashboard/business-profile'
        });
      }
      
      // Refresh the list
      fetchProviders(activeTab);
    } catch (error) {
      console.error('Error deleting provider:', error);
    }
  };

  // If user is not admin or moderator, don't render anything (will redirect in useEffect)
  if (userLoading || (!user || (userRole !== 'admin' && userRole !== 'moderator'))) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Provider Management</h1>
          <p className="text-muted-foreground">
            Review and manage provider applications
          </p>
        </div>
        
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'pending' ? 'Pending Applications' : 
                 activeTab === 'active' ? 'Active Providers' : 'Rejected Applications'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'pending' ? 'Review and approve provider applications' : 
                 activeTab === 'active' ? 'Manage active provider accounts' : 'Review rejected applications'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : providers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Business Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell className="font-medium">{provider.business_name}</TableCell>
                        <TableCell>
                          {provider.business_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </TableCell>
                        <TableCell>{provider.business_email}</TableCell>
                        <TableCell>
                          {provider.created_at ? new Date(provider.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/provider/${provider.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            
                            {activeTab === 'pending' && (
                              <>
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={() => handleApprove(provider.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleReject(provider.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the provider account and cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(provider.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No {activeTab} providers found
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </main>
  );
}