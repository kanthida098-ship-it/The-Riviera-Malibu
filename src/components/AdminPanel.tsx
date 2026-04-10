import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { auth, db, storage, handleFirestoreError, OperationType } from '../firebase';
import { UnitListing, ImageMetadata } from '../types';
import { 
  Upload, 
  Trash2, 
  Plus, 
  LogOut, 
  Image as ImageIcon, 
  Layout, 
  Settings,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminPanel: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [units, setUnits] = useState<UnitListing[]>([]);
  const [activeTab, setActiveTab] = useState<'images' | 'units'>('images');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form states
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitListing | null>(null);
  const [unitForm, setUnitForm] = useState<Partial<UnitListing>>({
    title: '',
    location: 'Pratumnak',
    size: '',
    floor: '',
    price: '',
    status: 'available',
    images: [],
    bedrooms: 1,
    bathrooms: 1,
    highlight: '',
    type: 'sale'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        fetchImages();
        fetchUnits();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchImages = async () => {
    try {
      const q = query(collection(db, 'images'), orderBy('uploadedAt', 'desc'));
      const snapshot = await getDocs(q);
      const imgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImageMetadata));
      setImages(imgs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'images');
    }
  };

  const fetchUnits = async () => {
    try {
      const q = query(collection(db, 'units'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const u = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UnitListing));
      setUnits(u);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'units');
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setStatus({ type: 'success', message: 'URL copied to clipboard!' });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploading(true);
    setStatus(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading ${file.name} directly to Firebase Storage...`);
        console.log(`Storage Bucket: ${storage.app.options.storageBucket}`);
        console.log(`Current User UID: ${user.uid}`);
        
        // 1. Upload to Storage
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `images/${fileName}`);
        console.log(`Storage Ref Path: ${storageRef.fullPath}`);
        
        const uploadResult = await uploadBytes(storageRef, file);
        console.log("Upload successful, getting download URL...");
        const publicUrl = await getDownloadURL(uploadResult.ref);

        // 2. Save metadata to Firestore
        await addDoc(collection(db, 'images'), {
          url: publicUrl,
          name: file.name,
          size: file.size,
          contentType: file.type,
          uploadedAt: serverTimestamp(),
          uploadedBy: user.uid
        });

        console.log(`Upload successful! URL: ${publicUrl}`);
      }
      setStatus({ type: 'success', message: 'Images uploaded successfully!' });
      fetchImages();
    } catch (error: any) {
      console.error('Upload failed:', error);
      setStatus({ type: 'error', message: `Upload failed: ${error.message || 'Unknown error'}` });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (image: ImageMetadata) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      // Delete from Storage
      const storageRef = ref(storage, image.url);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'images', image.id));
      
      setStatus({ type: 'success', message: 'Image deleted.' });
      fetchImages();
    } catch (error) {
      console.error('Delete failed:', error);
      setStatus({ type: 'error', message: 'Failed to delete image.' });
    }
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const data = {
        ...unitForm,
        updatedAt: serverTimestamp(),
      };

      if (editingUnit) {
        await updateDoc(doc(db, 'units', editingUnit.id), data);
        setStatus({ type: 'success', message: 'Unit updated successfully!' });
      } else {
        await addDoc(collection(db, 'units'), {
          ...data,
          createdAt: serverTimestamp(),
        });
        setStatus({ type: 'success', message: 'Unit created successfully!' });
      }

      setShowUnitForm(false);
      setEditingUnit(null);
      setUnitForm({
        title: '',
        location: 'Pratumnak',
        size: '',
        floor: '',
        price: '',
        status: 'available',
        images: [],
        bedrooms: 1,
        bathrooms: 1,
        highlight: '',
        type: 'sale'
      });
      fetchUnits();
    } catch (error) {
      console.error('Save unit failed:', error);
      setStatus({ type: 'error', message: 'Failed to save unit.' });
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) return;
    try {
      await deleteDoc(doc(db, 'units', id));
      setStatus({ type: 'success', message: 'Unit deleted.' });
      fetchUnits();
    } catch (error) {
      console.error('Delete unit failed:', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center"
        >
          <Settings className="mx-auto text-gold-600 mb-6" size={64} />
          <h1 className="text-3xl font-serif mb-4">Admin Access</h1>
          <p className="text-neutral-600 mb-8">Please sign in with your authorized Google account to manage the system.</p>
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-gold-600 text-white rounded-xl font-bold hover:bg-gold-700 transition-all flex items-center justify-center gap-3"
          >
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-900 text-white flex flex-col">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Layout className="text-gold-500" size={24} />
            <span className="font-serif text-xl font-bold">MALIBU CMS</span>
          </div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest">Image Management</p>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('images')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'images' ? 'bg-gold-600 text-white' : 'text-neutral-400 hover:bg-white/5'}`}
          >
            <ImageIcon size={20} />
            <span>Media Library</span>
          </button>
          <button 
            onClick={() => setActiveTab('units')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'units' ? 'bg-gold-600 text-white' : 'text-neutral-400 hover:bg-white/5'}`}
          >
            <Layout size={20} />
            <span>Unit Listings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-4">
            <img src={user.photoURL || ''} className="w-8 h-8 rounded-full" alt="User" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-serif mb-2">
                {activeTab === 'images' ? 'Media Library' : 'Unit Listings'}
              </h2>
              <p className="text-neutral-500">Manage your luxury real estate assets.</p>
            </div>

            {activeTab === 'images' ? (
              <label className="cursor-pointer px-6 py-3 bg-gold-600 text-white rounded-xl font-bold hover:bg-gold-700 transition-all flex items-center gap-2 shadow-lg">
                <Upload size={20} />
                Upload Images
                <input type="file" multiple className="hidden" onChange={handleFileUpload} accept="image/*" />
              </label>
            ) : (
              <button 
                onClick={() => {
                  setEditingUnit(null);
                  setUnitForm({
                    title: '',
                    location: 'Pratumnak',
                    size: '',
                    floor: '',
                    price: '',
                    status: 'available',
                    images: [],
                    bedrooms: 1,
                    bathrooms: 1,
                    highlight: '',
                    type: 'sale'
                  });
                  setShowUnitForm(true);
                }}
                className="px-6 py-3 bg-gold-600 text-white rounded-xl font-bold hover:bg-gold-700 transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                Add New Unit
              </button>
            )}
          </div>

          {status && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-8 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
            >
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span>{status.message}</span>
              <button onClick={() => setStatus(null)} className="ml-auto"><X size={18} /></button>
            </motion.div>
          )}

          {activeTab === 'images' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {uploading && (
                <div className="aspect-square bg-neutral-200 rounded-2xl flex flex-col items-center justify-center animate-pulse">
                  <Upload className="text-neutral-400 mb-2 animate-bounce" />
                  <span className="text-xs font-medium text-neutral-500">Uploading...</span>
                </div>
              )}
              {images.map(img => (
                <div key={img.id} className="group relative aspect-square bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all">
                  <img src={img.url} className="w-full h-full object-cover" alt={img.name} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={() => copyToClipboard(img.url)}
                      title="Copy URL"
                      className="p-2 bg-white text-neutral-900 rounded-lg hover:bg-gold-50 transition-colors"
                    >
                      <Copy size={18} />
                    </button>
                    <a 
                      href={img.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="Open in new tab"
                      className="p-2 bg-white text-neutral-900 rounded-lg hover:bg-gold-50 transition-colors"
                    >
                      <ExternalLink size={18} />
                    </a>
                    <button 
                      onClick={() => handleDeleteImage(img)}
                      title="Delete Image"
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {units.map(unit => (
                <div key={unit.id} className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                  <div className="relative h-48">
                    <img src={unit.images[0] || 'https://picsum.photos/seed/placeholder/800/600'} className="w-full h-full object-cover" alt={unit.title} />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingUnit(unit);
                          setUnitForm(unit);
                          setShowUnitForm(true);
                        }}
                        className="p-2 bg-white text-neutral-900 rounded-lg shadow-md hover:bg-gold-50 transition-colors"
                      >
                        <Settings size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUnit(unit.id)}
                        className="p-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-serif mb-2">{unit.title}</h3>
                    <p className="text-gold-600 font-bold mb-4">{unit.price}</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-neutral-100 text-[10px] uppercase font-bold rounded">{unit.type}</span>
                      <span className="px-2 py-1 bg-neutral-100 text-[10px] uppercase font-bold rounded">{unit.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Unit Form Modal */}
      <AnimatePresence>
        {showUnitForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUnitForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 border-b border-neutral-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-2xl font-serif">{editingUnit ? 'Edit Unit' : 'Add New Unit'}</h3>
                <button onClick={() => setShowUnitForm(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveUnit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-1">Title</label>
                    <input 
                      required
                      value={unitForm.title}
                      onChange={e => setUnitForm({...unitForm, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1">Price</label>
                      <input 
                        required
                        value={unitForm.price}
                        onChange={e => setUnitForm({...unitForm, price: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1">Size</label>
                      <input 
                        value={unitForm.size}
                        onChange={e => setUnitForm({...unitForm, size: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1">Floor</label>
                      <input 
                        value={unitForm.floor}
                        onChange={e => setUnitForm({...unitForm, floor: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
                        placeholder="e.g. 15"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1">Type</label>
                      <select 
                        value={unitForm.type}
                        onChange={e => setUnitForm({...unitForm, type: e.target.value as any})}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
                      >
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1">Status</label>
                      <select 
                        value={unitForm.status}
                        onChange={e => setUnitForm({...unitForm, status: e.target.value as any})}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-1">Highlight</label>
                    <textarea 
                      value={unitForm.highlight}
                      onChange={e => setUnitForm({...unitForm, highlight: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none h-24"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">Select Images</label>
                    <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2 border border-neutral-100 rounded-xl bg-neutral-50">
                      {images.map(img => (
                        <button 
                          key={img.id}
                          type="button"
                          onClick={() => {
                            const current = unitForm.images || [];
                            if (current.includes(img.url)) {
                              setUnitForm({...unitForm, images: current.filter(u => u !== img.url)});
                            } else {
                              setUnitForm({...unitForm, images: [...current, img.url]});
                            }
                          }}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${unitForm.images?.includes(img.url) ? 'border-gold-500 scale-95' : 'border-transparent'}`}
                        >
                          <img src={img.url} className="w-full h-full object-cover" alt="" />
                          <div className="absolute top-1 right-1 flex gap-1">
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(img.url);
                              }}
                              className="p-1 bg-white/90 rounded shadow-sm hover:bg-white transition-colors"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                          {unitForm.images?.includes(img.url) && (
                            <div className="absolute inset-0 bg-gold-500/20 flex items-center justify-center">
                              <CheckCircle2 className="text-gold-600 bg-white rounded-full" size={20} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full py-4 bg-gold-600 text-white rounded-xl font-bold hover:bg-gold-700 transition-all shadow-lg"
                    >
                      {editingUnit ? 'Update Listing' : 'Create Listing'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
