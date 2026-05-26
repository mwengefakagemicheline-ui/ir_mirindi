import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Package, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import ProductForm from './ProductForm';

type Product = Database['public']['Tables']['products']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchProducts();
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (!error) {
      fetchOrders();
    }
  };

  const handleProductFormClose = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    revenue: orders
      .filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.total), 0),
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Produits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <Package className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Commandes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <ShoppingBag className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
            <ShoppingBag className="w-10 h-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus</p>
              <p className="text-2xl font-bold text-gray-900">{stats.revenue.toFixed(2)} €</p>
            </div>
            <div className="text-green-600 text-2xl font-bold">€</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'products'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Produits
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'orders'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Commandes
            </button>
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Gestion des produits</h2>
              <button
                onClick={() => setShowProductForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nouveau produit
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Image</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nom</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Prix</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">SKU</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {Number(product.price).toFixed(2)} €
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{product.sku}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Gestion des commandes</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.customer_email}</p>
                      <p className="text-sm text-gray-600">{order.shipping_address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">
                        {Number(order.total).toFixed(2)} €
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">En attente</option>
                      <option value="paid">Payée</option>
                      <option value="shipped">Expédiée</option>
                      <option value="delivered">Livrée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleProductFormClose}
        />
      )}
    </div>
  );
}
