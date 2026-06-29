import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoGrid, IoCube, IoBagHandle, IoPeople, IoAdd, IoTrash, IoCreate, IoClose, IoArrowUp, IoBarChart, IoEye, IoTrendingUp, IoList } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { analyticsApi } from '../../api/analytics.api';
import { productApi } from '../../api/product.api';
import { orderApi } from '../../api/order.api';
import { userApi } from '../../api/user.api';
import { categoryApi } from '../../api/category.api';
import { Button, Badge, Modal } from '../../components/ui';

const tabs = [
  { id: 'overview', label: 'Overview', icon: IoGrid },
  { id: 'analytics', label: 'Analytics', icon: IoBarChart },
  { id: 'products', label: 'Products', icon: IoCube },
  { id: 'orders', label: 'Orders', icon: IoBagHandle },
  { id: 'customers', label: 'Customers', icon: IoPeople },
  { id: 'categories', label: 'Categories', icon: IoList },
];

const statusOptions = ['Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productModal, setProductModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', discount: '0', category: '', stock: '10', sizes: ['S', 'M', 'L'] });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  const allSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    (async () => {
      const res = await categoryApi.getAll();
      if (res.success) setCategories(res.data);
    })();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview' || activeTab === 'analytics') {
        const res = await analyticsApi.getDashboardAnalytics();
        if (res.success) setAnalytics(res.data);
      } else if (activeTab === 'products') {
        const res = await productApi.getProducts({ limit: 100 });
        if (res.success) setProducts(res.data.products);
      } else if (activeTab === 'categories') {
        const res = await categoryApi.getAll();
        if (res.success) setCategories(res.data);
      } else if (activeTab === 'orders') {
        const res = await orderApi.getAllOrders();
        if (res.success) setOrders(res.data.orders || []);
      } else if (activeTab === 'customers') {
        const res = await userApi.adminGetUsers();
        if (res.success) setCustomers(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(false);
    setEditId(null);
    setForm({ name: '', description: '', price: '', discount: '0', category: categories[0]?.name || '', stock: '10', sizes: ['S', 'M', 'L'] });
    setFiles([]);
    setProductModal(true);
  };

  const openEdit = (prod) => {
    setEditing(true);
    setEditId(prod._id);
    setForm({
      name: prod.name, description: prod.description, price: prod.price,
      discount: prod.discount || '0', category: prod.category || categories[0]?.name || '',
      stock: prod.stock, sizes: prod.sizes || [],
    });
    setFiles([]);
    setProductModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Name and price required'); return; }
    if (form.sizes.length === 0) { toast.error('Select at least one size'); return; }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'sizes') formData.append(k, JSON.stringify(v));
      else formData.append(k, v);
    });
    files.forEach(f => formData.append('images', f));

    setSubmitting(true);
    const res = editing
      ? await productApi.updateProduct(editId, formData)
      : await productApi.createProduct(formData);
    setSubmitting(false);

    if (res.success) {
      toast.success(editing ? 'Product updated' : 'Product created');
      setProductModal(false);
      fetchData();
    } else {
      toast.error(res.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    const res = await productApi.deleteProduct(id);
    if (res.success) { toast.success('Deleted'); fetchData(); }
    else toast.error(res.message);
  };

  const handleOrderStatus = async (id, status) => {
    const res = await orderApi.updateOrderStatus(id, status);
    if (res.success) { toast.success('Status updated'); fetchData(); }
    else toast.error(res.message);
  };

  const handleToggleUser = async (id) => {
    const res = await userApi.adminToggleDisableUser(id);
    if (res.success) { toast.success('User status toggled'); fetchData(); }
    else toast.error(res.message);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    const res = await userApi.adminDeleteUser(id);
    if (res.success) { toast.success('User deleted'); fetchData(); }
    else toast.error(res.message);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) { toast.error('Enter a category name'); return; }
    const res = await categoryApi.create(newCategory.trim());
    if (res.success) {
      toast.success('Category added');
      setNewCategory('');
      fetchData();
    } else {
      toast.error(res.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    const res = await categoryApi.delete(id);
    if (res.success) { toast.success('Category deleted'); fetchData(); }
    else toast.error(res.message);
  };

  const stats = [
    { label: 'Revenue', value: `₹${(analytics?.summary?.monthlyRevenueEstimate || 0).toLocaleString()}`, change: '+12%', icon: IoArrowUp, color: 'text-success' },
    { label: 'Orders', value: analytics?.summary?.totalOrders || 0, change: '+8%', icon: IoBagHandle, color: 'text-accent' },
    { label: 'Products', value: analytics?.summary?.totalProducts || 0, change: '+3', icon: IoCube, color: 'text-accent' },
    { label: 'Customers', value: analytics?.summary?.totalUsers || 0, change: '+5%', icon: IoPeople, color: 'text-accent' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display italic">Admin</h1>
            <p className="text-secondary text-sm mt-1">Manage your store</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1.5 bg-surface2 rounded-2xl border border-border w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'accent-gradient text-white shadow-lg'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 rounded-2xl border border-border bg-surface/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <s.icon size={22} className={s.color} />
                      </div>
                      <span className="text-xs text-success font-medium">{s.change}</span>
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-sm text-secondary">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Analytics */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-10">
                {/* Summary row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-5 rounded-2xl border border-border bg-surface/50"
                    >
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-xs text-secondary mt-1">{s.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Monthly Sales Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl border border-border bg-surface/50"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <IoTrendingUp size={20} className="text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Monthly Revenue</h3>
                        <p className="text-xs text-muted">Last 6 months</p>
                      </div>
                    </div>
                    {analytics.monthlySales?.length > 0 ? (
                      <div className="space-y-4">
                        {analytics.monthlySales.map((item, i) => {
                          const maxRevenue = Math.max(...analytics.monthlySales.map(s => s.revenue), 1);
                          const barWidth = (item.revenue / maxRevenue) * 100;
                          return (
                            <div key={i} className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary">{item.month}</span>
                                <span className="font-medium">₹{item.revenue.toLocaleString()}</span>
                              </div>
                              <div className="h-2.5 rounded-full bg-surface2 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${barWidth}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                                  className="h-full rounded-full accent-gradient"
                                />
                              </div>
                              <p className="text-xs text-muted">{item.orders} orders</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted py-8 text-center">No sales data yet</p>
                    )}
                  </motion.div>

                  {/* Daily Sales (Last 7 Days) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl border border-border bg-surface/50"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <IoGrid size={20} className="text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Daily Sales</h3>
                        <p className="text-xs text-muted">Last 7 days</p>
                      </div>
                    </div>
                    {analytics.dailySales?.length > 0 ? (
                      <div className="space-y-4">
                        {/* Bar chart */}
                        <div className="flex items-end gap-2 h-40 pt-4">
                          {analytics.dailySales.map((day, i) => {
                            const maxOrders = Math.max(...analytics.dailySales.map(d => d.ordersCount), 1);
                            const height = (day.ordersCount / maxOrders) * 100;
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                <span className="text-xs font-medium">{day.ordersCount}</span>
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${Math.max(height, 4)}%` }}
                                  transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                                  className="w-full rounded-lg accent-gradient"
                                  style={{ maxHeight: '90%' }}
                                />
                                <span className="text-[10px] text-muted">
                                  {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {/* Daily breakdown */}
                        <div className="space-y-2 pt-4 border-t border-border">
                          {analytics.dailySales.map((day, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-secondary">
                                {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </span>
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-muted">{day.ordersCount} orders</span>
                                <span className="font-medium w-20 text-right">₹{day.revenue.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted py-8 text-center">No daily data yet</p>
                    )}
                  </motion.div>
                </div>

                {/* Most Viewed Products */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl border border-border bg-surface/50"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <IoEye size={20} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Most Viewed Products</h3>
                      <p className="text-xs text-muted">Top 5 products by views</p>
                    </div>
                  </div>
                  {analytics.mostViewedProducts?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left pb-3 text-xs text-muted uppercase tracking-wider font-medium">Product</th>
                            <th className="text-left pb-3 text-xs text-muted uppercase tracking-wider font-medium">Price</th>
                            <th className="text-right pb-3 text-xs text-muted uppercase tracking-wider font-medium">Views</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.mostViewedProducts.map((p, i) => (
                            <motion.tr
                              key={p._id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="border-b border-border/50"
                            >
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-muted w-5">{i + 1}.</span>
                                  {(p.images?.[0]?.url || p.images?.[0]) && (
                                  <img src={p.images[0]?.url || p.images[0]} alt="" className="w-8 h-10 rounded-lg object-cover bg-surface2" />
                                  )}
                                  <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                                </div>
                              </td>
                              <td className="py-3 text-secondary">
                                {p.discount > 0 ? (
                                  <span>₹{(p.price - p.discount).toLocaleString()}</span>
                                ) : (
                                  <span>₹{p.price.toLocaleString()}</span>
                                )}
                              </td>
                              <td className="py-3 text-right">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                                  <IoEye size={12} />
                                  {p.views}
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted py-8 text-center">No product view data yet</p>
                  )}
                </motion.div>
              </div>
            )}

            {/* Products */}
            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-secondary">{products.length} products</p>
                  <Button size="sm" onClick={openCreate}>
                    <IoAdd size={16} className="mr-1" /> Add Product
                  </Button>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface2/50">
                        <th className="text-left p-4 text-xs text-muted uppercase tracking-wider font-medium">Product</th>
                        <th className="text-left p-4 text-xs text-muted uppercase tracking-wider font-medium">Category</th>
                        <th className="text-left p-4 text-xs text-muted uppercase tracking-wider font-medium">Price</th>
                        <th className="text-left p-4 text-xs text-muted uppercase tracking-wider font-medium">Stock</th>
                        <th className="text-right p-4 text-xs text-muted uppercase tracking-wider font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => (
                        <motion.tr
                          key={p._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-border hover:bg-surface2/30 transition-all"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={p.images?.[0]?.url || p.images?.[0]} alt="" className="w-10 h-12 rounded-lg object-cover bg-surface2" />
                              <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-secondary">{p.category}</td>
                          <td className="p-4">
                            {p.discount > 0 ? (
                              <span>₹{(p.price - p.discount).toLocaleString()} <span className="text-xs text-muted line-through">₹{p.price}</span></span>
                            ) : (
                              <span>₹{p.price}</span>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge variant={p.stock > 0 ? 'success' : 'danger'}>{p.stock > 0 ? `${p.stock} left` : 'Out of Stock'}</Badge>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-surface2 text-secondary hover:text-accent transition-all" title="Edit">
                              <IoCreate size={16} />
                            </button>
                            <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg hover:bg-surface2 text-secondary hover:text-danger transition-all" title="Delete">
                              <IoTrash size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface2/50">
                      <th className="text-left p-4 text-xs text-muted uppercase tracking-wider font-medium">Order</th>
                      <th className="text-left p-4 text-xs text-muted uppercase tracking-wider font-medium">Customer</th>
                      <th className="text-left p-4 text-xs text-muted uppercase tracking-wider font-medium">Total</th>
                      <th className="text-left p-4 text-xs text-muted uppercase tracking-wider font-medium">Status</th>
                      <th className="text-right p-4 text-xs text-muted uppercase tracking-wider font-medium">Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, i) => (
                      <motion.tr
                        key={o._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border hover:bg-surface2/30 transition-all"
                      >
                        <td className="p-4 font-mono text-xs text-muted">#{o._id.slice(-8)}</td>
                        <td className="p-4">
                          <p className="font-medium">{o.user?.name || 'Guest'}</p>
                          <p className="text-xs text-muted">{o.user?.email || ''}</p>
                        </td>
                        <td className="p-4 font-semibold">₹{o.totalPrice.toLocaleString()}</td>
                        <td className="p-4">
                          <Badge variant={
                            o.orderStatus === 'Delivered' ? 'success' :
                            o.orderStatus === 'Cancelled' ? 'danger' : 'warning'
                          }>
                            {o.orderStatus}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <select
                            value={o.orderStatus}
                            onChange={e => handleOrderStatus(o._id, e.target.value)}
                            className="bg-surface2 border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-primary focus:outline-none focus:border-accent cursor-pointer"
                          >
                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Customers */}
            {activeTab === 'customers' && (
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface2/50">
                      <th className="text-left p-4 text-xs text-muted uppercase tracking-wider font-medium">User</th>
                      <th className="text-left p-4 text-xs text-muted uppercase tracking-wider font-medium">Email</th>
                      <th className="text-left p-4 text-xs text-muted uppercase tracking-wider font-medium">Role</th>
                      <th className="text-left p-4 text-xs text-muted uppercase tracking-wider font-medium">Status</th>
                      <th className="text-right p-4 text-xs text-muted uppercase tracking-wider font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <motion.tr
                        key={c._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border hover:bg-surface2/30 transition-all"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={c.avatar || c.avtar || 'https://via.placeholder.com/32'} alt="" className="w-8 h-8 rounded-full object-cover" />
                            <span className="font-medium">{c.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-secondary">{c.email}</td>
                        <td className="p-4">
                          <Badge variant={c.role === 'admin' ? 'accent' : 'default'}>{c.role}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={c.isDisabled ? 'danger' : 'success'}>{c.isDisabled ? 'Disabled' : 'Active'}</Badge>
                        </td>
                        <td className="p-4 text-right">
                          {c.role !== 'admin' && (
                            <>
                              <button onClick={() => handleToggleUser(c._id)} className={c.isDisabled ? "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all mr-2 border-success/30 text-success hover:bg-success/5" : "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all mr-2 border-warning/30 text-warning hover:bg-warning/5"}>
                                {c.isDisabled ? 'Enable' : 'Disable'}
                              </button>
                              <button onClick={() => handleDeleteUser(c._id)} className="p-2 rounded-lg hover:bg-surface2 text-secondary hover:text-danger transition-all">
                                <IoTrash size={15} />
                              </button>
                            </>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Categories */}
            {activeTab === 'categories' && (
              <div className="max-w-lg space-y-6">
                <div className="flex items-center gap-3">
                  <input
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                    placeholder="New category name..."
                    className="flex-1 bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent"
                  />
                  <Button onClick={handleAddCategory} size="sm">
                    <IoAdd size={16} className="mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {categories.map(c => (
                    <div key={c._id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface2/50 border border-border">
                      <span className="text-sm font-medium">{c.name}</span>
                      <button onClick={() => handleDeleteCategory(c._id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-all">
                        <IoTrash size={15} />
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-sm text-muted text-center py-8">No categories yet. Add one above.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Modal */}
      <Modal isOpen={productModal} onClose={() => setProductModal(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted uppercase tracking-wider">Name</label>
              <input name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-accent" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-muted uppercase tracking-wider">Category</label>
                <button
                  type="button"
                  onClick={async () => {
                    const name = prompt("Enter new category name:");
                    if (name && name.trim()) {
                      const res = await categoryApi.create(name.trim());
                      if (res.success) {
                        toast.success("Category created successfully");
                        const catRes = await categoryApi.getAll();
                        if (catRes.success) {
                          setCategories(catRes.data);
                          setForm(f => ({ ...f, category: name.trim() }));
                        }
                      } else {
                        toast.error(res.message);
                      }
                    }
                  }}
                  className="text-xs text-accent hover:underline flex items-center gap-0.5"
                >
                  <IoAdd size={12} /> Add Custom
                </button>
              </div>
              <select name="category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-accent">
                {categories.map(c => <option key={c._id || c.name || c} value={c.name || c}>{c.name || c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted uppercase tracking-wider">Price (₹)</label>
              <input type="number" name="price" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-accent" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted uppercase tracking-wider">Discount (₹)</label>
              <input type="number" name="discount" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-accent" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted uppercase tracking-wider">Stock</label>
              <input type="number" name="stock" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-accent" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted uppercase tracking-wider">Images</label>
              <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))} className="w-full text-sm text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-surface3 file:text-primary hover:file:bg-surface3/80 cursor-pointer" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted uppercase tracking-wider">Description</label>
            <textarea name="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3} className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-accent resize-none" />
          </div>

          <div>
            <label className="text-xs text-muted uppercase tracking-wider block mb-2">Sizes</label>
            <div className="flex gap-3">
              {allSizes.map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.sizes.includes(s)} onChange={() => setForm(f => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s] }))} className="w-4 h-4 rounded border-border bg-surface2 text-accent focus:ring-accent/30" />
                  <span className="text-sm">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full accent-gradient text-white border-0" loading={submitting}>
            {editing ? 'Update Product' : 'Create Product'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
