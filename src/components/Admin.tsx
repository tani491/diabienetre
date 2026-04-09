'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Star,
  Loader2,
  Package,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAppStore, type Page } from '@/lib/store';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  featured: boolean;
  active: boolean;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: string;
  totalAmount: number;
  waveRef: string | null;
  status: string;
  createdAt: string;
}

export default function Admin({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // Form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'cheveux',
    stock: '50',
    featured: false,
  });

  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);

  const handleLogin = () => {
    if (password === 'admin2024') {
      setAuthenticated(true);
      toast.success('Bienvenue administrateur !');
    } else {
      toast.error('Mot de passe incorrect');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch {
      toast.error('Erreur lors du chargement des produits');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: 'Bearer admin-diabienetre' },
      });
      const data = await res.json();
      setOrders(data);
    } catch {
      toast.error('Erreur lors du chargement des commandes');
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchProducts();
      fetchOrders();
    }
  }, [authenticated]);

  const openNewForm = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'cheveux',
      stock: '50',
      featured: false,
    });
    setFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      stock: product.stock.toString(),
      featured: product.featured,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.image) {
      toast.error('Remplissez les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const url = editingProduct
        ? '/api/admin/products'
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const body = editingProduct
        ? { ...form, id: editingProduct.id }
        : form;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-diabienetre',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed');

      toast.success(
        editingProduct
          ? 'Produit mis à jour avec succès'
          : 'Produit créé avec succès'
      );
      setFormOpen(false);
      fetchProducts();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer admin-diabienetre' },
      });
      if (!res.ok) throw new Error('Failed');

      toast.success('Produit supprimé');
      fetchProducts();
      // Refresh catalog category
      setSelectedCategory('all');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Login Screen
  if (!authenticated) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-sage-100/60 p-8 text-center"
          >
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-sage-500" />
            </div>
            <h1 className="text-2xl font-bold text-sage-800 mb-2">
              Espace Administrateur
            </h1>
            <p className="text-sage-500 text-sm mb-8">
              Entrez le mot de passe pour accéder au tableau de bord
            </p>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="border-sage-200 focus:border-sage-400 focus:ring-sage-400/20 pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button
                onClick={handleLogin}
                className="w-full bg-sage-400 hover:bg-sage-500 text-white rounded-xl"
              >
                Se connecter
              </Button>
            </div>

            <button
              onClick={() => onNavigate('home')}
              className="mt-6 text-sm text-sage-400 hover:text-sage-600 transition-colors cursor-pointer"
            >
              Retour à l&apos;accueil
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  // Admin Dashboard
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-sage-800">
              Tableau de bord
            </h1>
            <p className="text-sage-500 text-sm">
              Gérez vos produits et commandes
            </p>
          </div>
          <Button
            onClick={openNewForm}
            className="bg-sage-400 hover:bg-sage-500 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau produit
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-sage-100/60 shadow-sm">
            <div className="flex items-center gap-2 text-sage-500 text-xs mb-1">
              <Package className="w-3.5 h-3.5" />
              Produits
            </div>
            <span className="text-2xl font-bold text-sage-800">{products.length}</span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-sage-100/60 shadow-sm">
            <div className="flex items-center gap-2 text-sage-500 text-xs mb-1">
              <Star className="w-3.5 h-3.5" />
              Vedettes
            </div>
            <span className="text-2xl font-bold text-sage-800">
              {products.filter((p) => p.featured).length}
            </span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-sage-100/60 shadow-sm">
            <div className="flex items-center gap-2 text-sage-500 text-xs mb-1">
              <Package className="w-3.5 h-3.5" />
              Commandes
            </div>
            <span className="text-2xl font-bold text-sage-800">{orders.length}</span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-sage-100/60 shadow-sm">
            <div className="flex items-center gap-2 text-sage-500 text-xs mb-1">
              <Package className="w-3.5 h-3.5" />
              En attente
            </div>
            <span className="text-2xl font-bold text-gold">
              {orders.filter((o) => o.status === 'pending').length}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'products' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('products')}
            className={`rounded-full ${activeTab === 'products' ? 'bg-sage-400 text-white hover:bg-sage-500 hover:text-white' : 'text-sage-600 hover:bg-sage-50'}`}
          >
            Produits
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'default' : 'ghost'}
            onClick={() => { setActiveTab('orders'); fetchOrders(); }}
            className={`rounded-full ${activeTab === 'orders' ? 'bg-sage-400 text-white hover:bg-sage-500 hover:text-white' : 'text-sage-600 hover:bg-sage-50'}`}
          >
            Commandes
            {orders.filter((o) => o.status === 'pending').length > 0 && (
              <Badge className="ml-2 bg-gold text-white h-5 px-1.5 text-xs">
                {orders.filter((o) => o.status === 'pending').length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-sm border border-sage-100/60 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-sage-50/50 hover:bg-sage-50/50">
                    <TableHead className="text-sage-600 font-semibold">Produit</TableHead>
                    <TableHead className="text-sage-600 font-semibold">Prix</TableHead>
                    <TableHead className="text-sage-600 font-semibold hidden sm:table-cell">Catégorie</TableHead>
                    <TableHead className="text-sage-600 font-semibold hidden md:table-cell">Stock</TableHead>
                    <TableHead className="text-sage-600 font-semibold hidden lg:table-cell">Vedette</TableHead>
                    <TableHead className="text-sage-600 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-sage-50 shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium text-sage-800 text-sm truncate max-w-[150px]">
                            {product.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sage-700 font-medium text-sm">
                        {product.price.toLocaleString('fr-FR')} CFA
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="outline"
                          className={`text-xs ${product.category === 'cheveux' ? 'border-sage-300 text-sage-600' : 'border-amber-300 text-amber-600'}`}
                        >
                          {product.category === 'cheveux' ? 'Cheveux' : 'Peau'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sage-600 text-sm">
                        {product.stock}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {product.featured && <Star className="w-4 h-4 text-gold fill-gold" />}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditForm(product)}
                            className="text-sage-400 hover:text-sage-600 hover:bg-sage-50 h-8 w-8"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-sage-100/60 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-sage-50/50 hover:bg-sage-50/50">
                    <TableHead className="text-sage-600 font-semibold">Client</TableHead>
                    <TableHead className="text-sage-600 font-semibold hidden sm:table-cell">Téléphone</TableHead>
                    <TableHead className="text-sage-600 font-semibold">Montant</TableHead>
                    <TableHead className="text-sage-600 font-semibold hidden md:table-cell">Wave Ref</TableHead>
                    <TableHead className="text-sage-600 font-semibold">Statut</TableHead>
                    <TableHead className="text-sage-600 font-semibold hidden lg:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-sage-400">
                        Aucune commande pour le moment
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-sage-800 text-sm">
                          {order.customerName}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sage-600 text-sm">
                          {order.customerPhone}
                        </TableCell>
                        <TableCell className="text-sage-700 font-medium text-sm">
                          {order.totalAmount.toLocaleString('fr-FR')} CFA
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sage-600 text-sm font-mono">
                          {order.waveRef || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs ${
                              order.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : order.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-sage-100 text-sage-700'
                            }`}
                          >
                            {order.status === 'pending'
                              ? 'En attente'
                              : order.status === 'confirmed'
                                ? 'Confirmée'
                                : order.status === 'shipped'
                                  ? 'Expédiée'
                                  : 'Livrée'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sage-500 text-xs">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-sage-800">
              {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-sage-700">Nom *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nom du produit"
                className="mt-1 border-sage-200 focus:border-sage-400"
              />
            </div>
            <div>
              <Label className="text-sage-700">Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description du produit"
                rows={3}
                className="mt-1 w-full rounded-lg border border-sage-200 px-3 py-2 text-sm focus:border-sage-400 focus:ring-sage-400/20 focus:outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sage-700">Prix (CFA) *</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                  className="mt-1 border-sage-200 focus:border-sage-400"
                />
              </div>
              <div>
                <Label className="text-sage-700">Stock</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="50"
                  className="mt-1 border-sage-200 focus:border-sage-400"
                />
              </div>
            </div>
            <div>
              <Label className="text-sage-700">URL de l&apos;image *</Label>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="/product-name.png"
                className="mt-1 border-sage-200 focus:border-sage-400"
              />
            </div>
            <div>
              <Label className="text-sage-700">Catégorie</Label>
              <div className="flex gap-2 mt-1">
                {['cheveux', 'peau'].map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant={form.category === cat ? 'default' : 'outline'}
                    onClick={() => setForm({ ...form, category: cat })}
                    className={
                      form.category === cat
                        ? 'bg-sage-400 text-white hover:bg-sage-500 hover:text-white rounded-lg'
                        : 'border-sage-200 text-sage-600 hover:bg-sage-50 rounded-lg'
                    }
                  >
                    {cat === 'cheveux' ? 'Cheveux' : 'Peau'}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sage-700">Produit vedette</Label>
              <Switch
                checked={form.featured}
                onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              className="rounded-xl border-sage-200 text-sage-600 hover:bg-sage-50"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="rounded-xl bg-sage-400 hover:bg-sage-500 text-white"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingProduct ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
