"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/components/auth/UserProvider';
import { db, storage } from '@/lib/firebaseClient';
import { collection, query, where, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Service } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Image, X, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceManagerProps {
  providerId: string;
}

export default function ServiceManager({ providerId }: ServiceManagerProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      if (!providerId) return;
      
      try {
        setLoading(true);
        const servicesQuery = query(
          collection(db, 'services'),
          where('provider_id', '==', providerId),
          where('status', '==', 'active')
        );
        
        const snapshot = await getDocs(servicesQuery);
        const servicesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Service[];
        
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: 'Error',
          description: 'Failed to load services. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [providerId, toast]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Limit to 5 images total
      const newFiles = files.slice(0, 5 - imagePreviews.length);
      
      setImageFiles(prev => [...prev, ...newFiles]);
      
      // Create previews
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreviews(prev => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove image preview
  const handleRemoveImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Open add dialog
  const openAddDialog = () => {
    setFormData({
      name: '',
      description: '',
      tags: [],
    });
    setImageFiles([]);
    setImagePreviews([]);
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (service: Service) => {
    setCurrentService(service);
    setFormData({
      name: service.name,
      description: service.description,
      tags: [...service.tags],
    });
    setImageFiles([]);
    setImagePreviews([...service.images]);
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (service: Service) => {
    setCurrentService(service);
    setIsDeleteDialogOpen(true);
  };

  // Add new service
  const handleAddService = async () => {
    if (!user || !providerId) return;
    
    setIsSubmitting(true);
    
    try {
      // Upload images
      const imageUrls: string[] = [];
      
      for (const file of imageFiles) {
        const imageRef = ref(storage, `services/${providerId}/${Date.now()}-${file.name}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }
      
      // Create service document
      const serviceData = {
        provider_id: providerId,
        name: formData.name,
        description: formData.description,
        tags: formData.tags,
        images: imageUrls,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        status: 'active',
      };
      
      const docRef = await addDoc(collection(db, 'services'), serviceData);
      
      // Add to local state
      setServices(prev => [...prev, {
        id: docRef.id,
        ...serviceData,
        created_at: new Date(),
        updated_at: new Date(),
      } as Service]);
      
      toast({
        title: 'Service Added',
        description: 'Your service has been added successfully.',
      });
      
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: 'Error',
        description: 'Failed to add service. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update service
  const handleUpdateService = async () => {
    if (!user || !providerId || !currentService) return;
    
    setIsSubmitting(true);
    
    try {
      // Determine which images are new and need to be uploaded
      const existingImages = currentService.images;
      const newImageFiles = imageFiles;
      const imagesToKeep = imagePreviews.filter(preview => existingImages.includes(preview));
      
      // Upload new images
      const newImageUrls: string[] = [];
      
      for (const file of newImageFiles) {
        const imageRef = ref(storage, `services/${providerId}/${Date.now()}-${file.name}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        newImageUrls.push(url);
      }
      
      // Combine existing and new images
      const allImages = [...imagesToKeep, ...newImageUrls];
      
      // Update service document
      const serviceRef = doc(db, 'services', currentService.id);
      await updateDoc(serviceRef, {
        name: formData.name,
        description: formData.description,
        tags: formData.tags,
        images: allImages,
        updated_at: serverTimestamp(),
      });
      
      // Update local state
      setServices(prev => prev.map(service => 
        service.id === currentService.id 
          ? {
              ...service,
              name: formData.name,
              description: formData.description,
              tags: formData.tags,
              images: allImages,
              updated_at: new Date(),
            }
          : service
      ));
      
      toast({
        title: 'Service Updated',
        description: 'Your service has been updated successfully.',
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: 'Error',
        description: 'Failed to update service. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete service
  const handleDeleteService = async () => {
    if (!currentService) return;
    
    setIsSubmitting(true);
    
    try {
      // Delete service document
      const serviceRef = doc(db, 'services', currentService.id);
      await updateDoc(serviceRef, {
        status: 'inactive',
        updated_at: serverTimestamp(),
      });
      
      // Update local state
      setServices(prev => prev.filter(service => service.id !== currentService.id));
      
      toast({
        title: 'Service Deleted',
        description: 'Your service has been deleted successfully.',
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete service. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Services</h2>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">You haven't added any services yet.</p>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(service => (
            <Card key={service.id}>
              <div className="relative h-40 bg-gray-100 rounded-t-lg overflow-hidden">
                {service.images.length > 0 ? (
                  <img 
                    src={service.images[0]} 
                    alt={service.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Image className="h-12 w-12 text-gray-300" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-1">{service.name}</h3>
                <div className="flex flex-wrap gap-1 mb-3">
                  {service.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {service.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 p-4 pt-0">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(service)}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => openDeleteDialog(service)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Service Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Add details about a service you offer to your customers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Plumbing Repair, Hair Styling, Tax Consultation"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your service, what it includes, and any other relevant details"
                rows={4}
                required
              />
            </div>
            
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags to help customers find your service"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Tag className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Add up to 5 tags that describe your service (e.g., "emergency", "residential", "commercial")
              </p>
            </div>
            
            <div>
              <Label>Images</Label>
              <div className="mt-2">
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {imagePreviews.length < 5 && (
                    <div className="aspect-square rounded-md border border-dashed flex items-center justify-center">
                      <Input
                        id="service-images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => document.getElementById('service-images')?.click()}
                        className="h-full w-full"
                      >
                        <Plus className="h-6 w-6" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add up to 5 images showcasing your service (recommended size: 800x600px)
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddService} 
              disabled={!formData.name || !formData.description || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update the details of your service.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Service Name *</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Plumbing Repair, Hair Styling, Tax Consultation"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your service, what it includes, and any other relevant details"
                rows={4}
                required
              />
            </div>
            
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags to help customers find your service"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Tag className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Add up to 5 tags that describe your service
              </p>
            </div>
            
            <div>
              <Label>Images</Label>
              <div className="mt-2">
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {imagePreviews.length < 5 && (
                    <div className="aspect-square rounded-md border border-dashed flex items-center justify-center">
                      <Input
                        id="edit-service-images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => document.getElementById('edit-service-images')?.click()}
                        className="h-full w-full"
                      >
                        <Plus className="h-6 w-6" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add up to 5 images showcasing your service
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateService} 
              disabled={!formData.name || !formData.description || isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the service "{currentService?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteService}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Service'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}