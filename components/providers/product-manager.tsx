"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/components/auth/UserProvider';
import { db, storage } from '@/lib/firebaseClient';
import { collection, query, where, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Pencil, Trash2, Plus, Image, X, Tag, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductManagerProps {
  providerId: string;
}

export default function ProductManager({ providerId }: ProductManagerProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'retail' as 'retail' | 'wholesale',
    price: 0,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!providerId) return;
      
      try {
        setLoading(true);
        const productsQuery = query(
          collection(db, 'products'),
          where('provider_id', '==', providerId),
          where('status', '==', 'active')
        );
        
        const snapshot = await getDocs(productsQuery);
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [providerId, toast]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Ensure price is a valid number
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setFormData(prev => ({
          ...prev,
          [name]: numValue
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle type selection
  const handleTypeChange = (value: 'retail' | 'wholesale') => {
    setFormData(prev => ({
      ...prev,
      type: value
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
      type: 'retail',
      price: 0,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      type: product.type,
      price: product.price,
    });
    setImageFiles([]);
    setImagePreviews([...product.images]);
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Add new product
  const handleAddProduct = async () => {
    if (!user || !providerId) return;
    
    setIsSubmitting(true);
    
    try {
      // Upload images
      const imageUrls: string[] = [];
      
      for (const file of imageFiles) {
        const imageRef = ref(storage, `products/${providerId}/${Date.now()}-${file.name}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }
      
      // Create product document
      const productData = {
        provider_id: providerId,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        price: formData.price,
        images: imageUrls,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        status: 'active',
      };
      
      const docRef = await addDoc(collection(db, 'products'), productData);
      
      // Add to local state
      setProducts(prev => [...prev, {
        id: docRef.id,
        ...productData,
        created_at: new Date(),
        updated_at: new Date(),
      } as Product]);
      
      toast({
        title: 'Product Added',
        description: 'Your product has been added successfully.',
      });
      
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update product
  const handleUpdateProduct = async () => {
    if (!user || !providerId || !currentProduct) return;
    
    setIsSubmitting(true);
    
    try {
      // Determine which images are new and need to be uploaded
      const existingImages = currentProduct.images;
      const newImageFiles = imageFiles;
      const imagesToKeep = imagePreviews.filter(preview => existingImages.includes(preview));
      
      // Upload new images
      const newImageUrls: string[] = [];
      
      for (const file of newImageFiles) {
        const imageRef = ref(storage, `products/${providerId}/${Date.now()}-${file.name}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        newImageUrls.push(url);
      }
      
      // Combine existing and new images
      const allImages = [...imagesToKeep, ...newImageUrls];
      
      // Update product document
      const productRef = doc(db, 'products', currentProduct.id);
      await updateDoc(productRef, {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        price: formData.price,
        images: allImages,
        updated_at: serverTimestamp(),
      });
      
      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === currentProduct.id 
          ? {
              ...product,
              name: formData.name,
              description: formData.description,
              type: formData.type,
              price: formData.price,
              images: allImages,
              updated_at: new Date(),
            }
          : product
      ));
      
      toast({
        title: 'Product Updated',
        description: 'Your product has been updated successfully.',
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    
    setIsSubmitting(true);
    
    try {
      // Delete product document
      const productRef = doc(db, 'products', currentProduct.id);
      await updateDoc(productRef, {
        status: 'inactive',
        updated_at: serverTimestamp(),
      });
      
      // Update local state
      setProducts(prev => prev.filter(product => product.id !== currentProduct.id));
      
      toast({
        title: 'Product Deleted',
        description: 'Your product has been deleted successfully.',
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
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
      ) : products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">You haven't added any products yet.</p>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <Card key={product.id}>
              <div className="relative h-40 bg-gray-100 rounded-t-lg overflow-hidden">
                {product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Image className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <Badge 
                  className="absolute top-2 right-2" 
                  variant={product.type === 'wholesale' ? 'default' : 'secondary'}
                >
                  {product.type === 'wholesale' ? 'Wholesale' : 'Retail'}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <span className="font-medium text-primary">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {product.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 p-4 pt-0">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => openDeleteDialog(product)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add details about a product you offer to your customers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Organic Shampoo, Handmade Candle, Custom T-Shirt"
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
                placeholder="Describe your product, its features, and any other relevant details"
                rows={4}
                required
              />
            </div>
            
            <div>
              <Label>Product Type *</Label>
              <RadioGroup 
                value={formData.type} 
                onValueChange={(value) => handleTypeChange(value as 'retail' | 'wholesale')}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retail" id="retail" />
                  <Label htmlFor="retail" className="font-normal">Retail</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wholesale" id="wholesale" />
                  <Label htmlFor="wholesale" className="font-normal">Wholesale</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="price">Price *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="pl-8"
                  required
                />
              </div>
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
                        id="product-images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => document.getElementById('product-images')?.click()}
                        className="h-full w-full"
                      >
                        <Plus className="h-6 w-6" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add up to 5 images showcasing your product (recommended size: 800x800px)
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddProduct} 
              disabled={!formData.name || !formData.description || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details of your product.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Organic Shampoo, Handmade Candle, Custom T-Shirt"
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
                placeholder="Describe your product, its features, and any other relevant details"
                rows={4}
                required
              />
            </div>
            
            <div>
              <Label>Product Type *</Label>
              <RadioGroup 
                value={formData.type} 
                onValueChange={(value) => handleTypeChange(value as 'retail' | 'wholesale')}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retail" id="edit-retail" />
                  <Label htmlFor="edit-retail" className="font-normal">Retail</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wholesale" id="edit-wholesale" />
                  <Label htmlFor="edit-wholesale" className="font-normal">Wholesale</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="edit-price">Price *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="pl-8"
                  required
                />
              </div>
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
                        id="edit-product-images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => document.getElementById('edit-product-images')?.click()}
                        className="h-full w-full"
                      >
                        <Plus className="h-6 w-6" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add up to 5 images showcasing your product
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProduct} 
              disabled={!formData.name || !formData.description || isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Product'}
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
              This will delete the product "{currentProduct?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Product'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}