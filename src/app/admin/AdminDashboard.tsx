"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Star,
  Loader2,
  Package,
  LogOut,
  User,
  ArrowLeft,
  RefreshCw,
  Eye,
  Users,
  TrendingUp,
  Upload,
  Lock,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const ORDER_STATUSES = [
  { value: "pending", label: "En attente", color: "bg-amber-100 text-amber-700" },
  { value: "whatsapp_pending", label: "WhatsApp", color: "bg-green-100 text-green-700" },
  { value: "confirmed", label: "Confirmée", color: "bg-blue-100 text-blue-700" },
  { value: "shipped", label: "Expédiée", color: "bg-purple-100 text-purple-700" },
  { value: "delivered", label: "Livrée", color: "bg-emerald-100 text-emerald-700" },
  { value: "cancelled", label: "Annulée", color: "bg-red-100 text-red-700" },
];

export default function AdminDashboard() {
  // All hooks MUST be declared first, before any conditional returns
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State declarations - must come before conditional returns
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "analytics" | "settings">("products");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "cheveux",
    stock: "50",
    featured: false,
  });

  // Order detail dialog
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);

  // Fetch functions
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products || data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      toast.error("Erreur lors du chargement des produits");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      // Ensure data is an array
      setOrders(Array.isArray(data) ? data : data.orders || data.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      toast.error("Erreur lors du chargement des commandes");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch {
      toast.error("Erreur lors du chargement des analytics");
    }
  };

  // Handle redirects in useEffect (not during render)
  useEffect(() => {
    if (status === "loading") return; // Still loading, don't redirect yet
    
    if (status === "unauthenticated" || !session) {
      router.push("/admin/login");
      return;
    }
    
    if (session.user?.role !== "admin") {
      router.push("/");
      return;
    }
    
    // Only fetch if authenticated as admin
    fetchProducts();
    fetchOrders();
    fetchAnalytics();
  }, [status, session, router]);
  
  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-sage-50 to-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-sage-600 mx-auto mb-4" />
          <p className="text-sage-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }
  
  // Unauthenticated or not admin - will redirect via useEffect
  if (status === "unauthenticated" || !session || session.user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-linear-to-br from-sage-50 to-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-sage-600 mx-auto mb-4" />
          <p className="text-sage-600">Redirection...</p>
        </div>
      </div>
    );
  }

  const openNewForm = () => {
    setEditingProduct(null);
    setForm({ name: "", description: "", price: "", image: "", category: "cheveux", stock: "50", featured: false });
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
    setImagePreview(product.image);
    setFormOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setForm({ ...form, image: data.url });
      setImagePreview(data.url);
      toast.success("Image téléchargée avec succès");
    } catch (error) {
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.image) {
      toast.error("Remplissez les champs obligatoires");
      return;
    }
    setLoading(true);
    try {
      const url = editingProduct ? "/api/admin/products" : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const body = editingProduct ? { ...form, id: editingProduct.id } : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");

      toast.success(editingProduct ? "Produit mis à jour" : "Produit créé");
      setFormOpen(false);
      fetchProducts();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Produit supprimé");
      fetchProducts();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Statut de la commande mis à jour");
      fetchOrders();
    } catch {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const getOrderItems = (itemsJson: string) => {
    try {
      return JSON.parse(itemsJson);
    } catch {
      return [];
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    // Validation
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("Tous les champs sont obligatoires");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Le nouveau mot de passe doit faire au moins 6 caractères");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Erreur lors du changement de mot de passe");
        return;
      }

      setPasswordSuccess(true);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Mot de passe changé avec succès");
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      setPasswordError("Erreur lors du changement de mot de passe");
      toast.error("Erreur lors du changement de mot de passe");
    } finally {
      setChangingPassword(false);
    }
  };

  if (!session) return null;

  const pendingCount = Array.isArray(orders) 
    ? orders.filter((o) => o.status === "pending" || o.status === "whatsapp_pending").length 
    : 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-sage-50 to-cream">
      {/* Admin Header */}
      <header className="bg-sage-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">DiaBienEtre Admin</h1>
                <p className="text-[10px] text-white/50">Tableau de bord</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                <User className="w-3.5 h-3.5 text-white/60" />
                <span className="text-xs text-white/80">{session.user?.name}</span>
              </div>
              <Button
                onClick={() => window.location.href = "/"}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg h-8"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline text-xs">Site</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-lg h-8"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline text-xs">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-sage-800">Tableau de bord</h2>
            <p className="text-sage-500 text-sm">Gérez vos produits et commandes</p>
          </div>
          <Button onClick={openNewForm} className="bg-sage-500 hover:bg-sage-600 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau produit
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Produits", value: Array.isArray(products) ? products.length : 0, icon: Package, color: "text-sage-600" },
            { label: "Vedettes", value: Array.isArray(products) ? products.filter((p) => p.featured).length : 0, icon: Star, color: "text-gold" },
            { label: "Commandes", value: Array.isArray(orders) ? orders.length : 0, icon: Package, color: "text-sage-600" },
            { label: "En attente", value: Array.isArray(orders) ? orders.filter((o) => o.status === "pending").length : 0, icon: Package, color: "text-amber-600" },
            { label: "WhatsApp", value: Array.isArray(orders) ? orders.filter((o) => o.status === "whatsapp_pending").length : 0, icon: Package, color: "text-green-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-sage-100/60 shadow-sm">
              <div className={`flex items-center gap-2 text-sage-500 text-xs mb-1`}>
                <stat.icon className="w-3.5 h-3.5" />
                {stat.label}
              </div>
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={activeTab === "products" ? "default" : "ghost"}
            onClick={() => setActiveTab("products")}
            className={`rounded-full ${activeTab === "products" ? "bg-sage-500 text-white hover:bg-sage-600 hover:text-white" : "text-sage-600 hover:bg-sage-50"}`}
          >
            Produits
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            onClick={() => { setActiveTab("orders"); fetchOrders(); }}
            className={`rounded-full ${activeTab === "orders" ? "bg-sage-500 text-white hover:bg-sage-600 hover:text-white" : "text-sage-600 hover:bg-sage-50"}`}
          >
            Commandes
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-gold text-white h-5 px-1.5 text-xs">{pendingCount}</Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "ghost"}
            onClick={() => { setActiveTab("analytics"); fetchAnalytics(); }}
            className={`rounded-full ${activeTab === "analytics" ? "bg-sage-500 text-white hover:bg-sage-600 hover:text-white" : "text-sage-600 hover:bg-sage-50"}`}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Analytics
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            onClick={() => setActiveTab("settings")}
            className={`rounded-full ${activeTab === "settings" ? "bg-sage-500 text-white hover:bg-sage-600 hover:text-white" : "text-sage-600 hover:bg-sage-50"}`}
          >
            <Lock className="w-4 h-4 mr-1" />
            Paramètres
          </Button>
        </div>

        {/* Products Table */}
        {activeTab === "products" && (
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
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="font-medium text-sage-800 text-sm truncate max-w-[150px]">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sage-700 font-medium text-sm">{product.price.toLocaleString("fr-FR")} CFA</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className={`text-xs ${product.category === "cheveux" ? "border-sage-300 text-sage-600" : "border-amber-300 text-amber-600"}`}>
                          {product.category === "cheveux" ? "Cheveux" : "Peau"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sage-600 text-sm">{product.stock}</TableCell>
                      <TableCell className="hidden lg:table-cell">{product.featured && <Star className="w-4 h-4 text-gold fill-gold" />}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditForm(product)} className="text-sage-400 hover:text-sage-600 hover:bg-sage-50 h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl shadow-sm border border-sage-100/60 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-sage-50/50 hover:bg-sage-50/50">
                    <TableHead className="text-sage-600 font-semibold">Client</TableHead>
                    <TableHead className="text-sage-600 font-semibold hidden sm:table-cell">Téléphone</TableHead>
                    <TableHead className="text-sage-600 font-semibold">Montant</TableHead>
                    <TableHead className="text-sage-600 font-semibold hidden md:table-cell">Paiement</TableHead>
                    <TableHead className="text-sage-600 font-semibold">Statut</TableHead>
                    <TableHead className="text-sage-600 font-semibold hidden lg:table-cell">Date</TableHead>
                    <TableHead className="text-sage-600 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-sage-400">Aucune commande</TableCell></TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-sage-800 text-sm">{order.customerName}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sage-600 text-sm">{order.customerPhone}</TableCell>
                        <TableCell className="text-sage-700 font-medium text-sm">{order.totalAmount.toLocaleString("fr-FR")} CFA</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className={`text-xs ${order.paymentMethod === 'whatsapp' ? 'border-green-300 text-green-700' : 'border-blue-300 text-blue-700'}`}>
                            {order.paymentMethod === 'whatsapp' ? 'WhatsApp' : 'Wave'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-[130px] h-7 text-xs border-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sage-500 text-xs">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOrderDetail(order)}
                            className="text-sage-400 hover:text-sage-600 hover:bg-sage-50 h-8 w-8"
                          >
                            <Package className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>

      {/* Product Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-sage-800">{editingProduct ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-sage-700">Nom *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom du produit" className="mt-1 border-sage-200 focus:border-sage-400" />
            </div>
            <div>
              <Label className="text-sage-700">Description</Label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="mt-1 w-full rounded-lg border border-sage-200 px-3 py-2 text-sm focus:border-sage-400 focus:ring-sage-400/20 focus:outline-none resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sage-700">Prix (CFA) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" className="mt-1 border-sage-200 focus:border-sage-400" />
              </div>
              <div>
                <Label className="text-sage-700">Stock</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="50" className="mt-1 border-sage-200 focus:border-sage-400" />
              </div>
            </div>
            <div>
              <Label className="text-sage-700">Image du produit *</Label>
              {imagePreview && (
                <div className="mt-2 mb-3 w-20 h-20 rounded-lg overflow-hidden border border-sage-200">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="relative mt-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="border-sage-200 focus:border-sage-400"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded">
                    <Loader2 className="w-4 h-4 animate-spin text-sage-600" />
                  </div>
                )}
              </div>
              <p className="text-xs text-sage-500 mt-1">Format : JPG, PNG (max 5MB)</p>
            </div>
            <div>
              <Label className="text-sage-700">Catégorie</Label>
              <div className="flex gap-2 mt-1">
                {["cheveux", "peau"].map((cat) => (
                  <Button key={cat} type="button" variant={form.category === cat ? "default" : "outline"} onClick={() => setForm({ ...form, category: cat })} className={form.category === cat ? "bg-sage-500 text-white hover:bg-sage-600 hover:text-white rounded-lg" : "border-sage-200 text-sage-600 hover:bg-sage-50 rounded-lg"}>
                    {cat === "cheveux" ? "Cheveux" : "Peau"}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sage-700">Produit vedette</Label>
              <Switch checked={form.featured} onCheckedChange={(checked) => setForm({ ...form, featured: checked })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setFormOpen(false)} className="rounded-xl border-sage-200 text-sage-600 hover:bg-sage-50"><X className="w-4 h-4 mr-2" />Annuler</Button>
            <Button onClick={handleSave} disabled={loading} className="rounded-xl bg-sage-500 hover:bg-sage-600 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {editingProduct ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={!!orderDetail} onOpenChange={() => setOrderDetail(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-sage-800">Détails de la commande</DialogTitle>
          </DialogHeader>
          {orderDetail && (
            <div className="space-y-4 mt-4">
              {/* Client Info */}
              <div className="bg-sage-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-sage-800 text-sm">Informations client</h3>
                <div className="text-sm text-sage-600 space-y-1">
                  <p><span className="font-medium">Nom:</span> {orderDetail.customerName}</p>
                  <p><span className="font-medium">Téléphone:</span> {orderDetail.customerPhone}</p>
                  <p><span className="font-medium">Adresse:</span> {orderDetail.customerAddress}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-sage-800 text-sm">Paiement</h3>
                <div className="text-sm text-sage-600 space-y-1">
                  <p><span className="font-medium">Mode:</span> {orderDetail.paymentMethod === 'whatsapp' ? 'WhatsApp' : 'Wave'}</p>
                  {orderDetail.waveRef && (
                    <p><span className="font-medium">Référence Wave:</span> <span className="font-mono">{orderDetail.waveRef}</span></p>
                  )}
                  <p><span className="font-medium">Montant:</span> <span className="font-bold text-sage-800">{orderDetail.totalAmount.toLocaleString("fr-FR")} CFA</span></p>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sage-800 text-sm">Changer le statut</h3>
                <Select
                  value={orderDetail.status}
                  onValueChange={(value) => {
                    handleUpdateOrderStatus(orderDetail.id, value);
                    setOrderDetail({ ...orderDetail, status: value });
                  }}
                >
                  <SelectTrigger className="border-sage-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sage-800 text-sm">Articles commandés</h3>
                <div className="space-y-2">
                  {getOrderItems(orderDetail.items).map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border border-sage-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-sage-50 shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-sage-800 text-sm">{item.name}</p>
                          <p className="text-xs text-sage-400">Qté: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-sage-800 text-sm">
                        {(item.price * item.quantity).toLocaleString("fr-FR")} CFA
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date */}
              <p className="text-xs text-sage-400">
                Commande passée le {new Date(orderDetail.createdAt).toLocaleString("fr-FR")}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Analytics Section */}
      {activeTab === "analytics" && analytics && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-sage-100/60 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-sage-100 rounded-lg">
                  <Eye className="w-5 h-5 text-sage-600" />
                </div>
                <p className="text-sage-500 text-sm">Vues totales</p>
              </div>
              <p className="text-3xl font-bold text-sage-800">{analytics.totalViews}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-sage-100/60 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sage-500 text-sm">Vues (30 jours)</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">{analytics.recentViews}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-sage-100/60 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-sage-500 text-sm">Visiteurs uniques</p>
              </div>
              <p className="text-3xl font-bold text-amber-600">{analytics.uniqueVisitors}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-sage-100/60 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-sage-500 text-sm">Moy. vues/jour</p>
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                {analytics.recentViews > 0 ? Math.round(analytics.recentViews / 30) : 0}
              </p>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-2xl p-6 border border-sage-100/60 shadow-sm">
            <h3 className="text-lg font-semibold text-sage-800 mb-4">Pages les plus visitées</h3>
            <div className="space-y-3">
              {analytics.viewsByPage?.map((page: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-sage-50/50 rounded-lg">
                  <span className="text-sm text-sage-700">{page.page || "/"}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-sage-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-sage-500 h-full"
                        style={{
                          width: `${Math.min((page._count * 100) / Math.max(...analytics.viewsByPage.map((p: any) => p._count)), 100)}%`,
                        }}
                      />
                    </div>
                    <span className="font-semibold text-sage-700 w-12 text-right">{page._count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Referrers */}
          {analytics.topReferrers?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-sage-100/60 shadow-sm">
              <h3 className="text-lg font-semibold text-sage-800 mb-4">Principales sources de trafic</h3>
              <div className="space-y-3">
                {analytics.topReferrers?.map((ref: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-sage-50/50 rounded-lg">
                    <span className="text-sm text-sage-700 truncate">{ref.referrer || "Direct"}</span>
                    <span className="font-semibold text-sage-700">{ref._count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Section */}
      {activeTab === "settings" && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-2xl shadow-sm border border-sage-100/60 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-sage-800 mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-sage-600" />
              Changer le mot de passe
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Error Message */}
              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                >
                  {passwordError}
                </motion.div>
              )}

              {/* Success Message */}
              {passwordSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm"
                >
                  Mot de passe changé avec succès!
                </motion.div>
              )}

              {/* Old Password */}
              <div>
                <Label className="text-sage-700 font-medium">Ancien mot de passe *</Label>
                <div className="relative mt-1.5">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        oldPassword: e.target.value,
                      })
                    }
                    placeholder="Entrez votre ancien mot de passe"
                    className="w-full px-4 py-2.5 border border-sage-200 rounded-lg focus:border-sage-400 focus:ring-sage-400/20 focus:ring-2 focus:outline-none text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600"
                  >
                    {showOldPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <Label className="text-sage-700 font-medium">Nouveau mot de passe *</Label>
                <div className="relative mt-1.5">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Entrez votre nouveau mot de passe (min 6 caractères)"
                    className="w-full px-4 py-2.5 border border-sage-200 rounded-lg focus:border-sage-400 focus:ring-sage-400/20 focus:ring-2 focus:outline-none text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <Label className="text-sage-700 font-medium">Confirmer le nouveau mot de passe *</Label>
                <div className="relative mt-1.5">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirmez votre nouveau mot de passe"
                    className="w-full px-4 py-2.5 border border-sage-200 rounded-lg focus:border-sage-400 focus:ring-sage-400/20 focus:ring-2 focus:outline-none text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-sage-500 hover:bg-sage-600 text-white rounded-xl"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changement en cours...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Changer le mot de passe
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Security Note */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Conseil de sécurité:</span> Utilisez un mot de passe fort contenant des majuscules, des minuscules, des chiffres et des caractères spéciaux.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
