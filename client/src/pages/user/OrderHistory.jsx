import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoBagOutline, IoChevronDown } from 'react-icons/io5';
import { orderApi } from '../../api/order.api';
import { Badge, Button, Loader } from '../../components/ui';

const statusColors = {
  Pending: 'warning',
  Confirmed: 'accent',
  Processing: 'accent',
  Delivered: 'success',
  Cancelled: 'danger',
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const res = await orderApi.getMyOrders();
      if (res.success) {
        setOrders(res.data);
      } else {
        setError(res.message);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-display italic mb-2">My Orders</h1>
        <p className="text-secondary mb-10">Track and manage your orders</p>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-surface2 flex items-center justify-center mx-auto mb-6">
              <IoBagOutline size={40} className="text-muted" />
            </div>
            <h2 className="text-2xl font-display italic mb-3">No orders yet</h2>
            <p className="text-secondary mb-8">Start shopping to see your orders here.</p>
            <Button onClick={() => window.location.href = '/shop'}>Browse Products</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-surface/50 overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-surface2/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-muted">Order #{order._id.slice(-8)}</p>
                      <p className="text-sm mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <Badge variant={statusColors[order.orderStatus] || 'default'}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">₹{order.totalPrice.toLocaleString()}</span>
                    <motion.div
                      animate={{ rotate: expanded === order._id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <IoChevronDown size={18} className="text-muted" />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence>
                  {expanded === order._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-4 border-t border-border pt-4">
                        <div className="space-y-3">
                          {order.orderedProducts?.map((item, idx) => {
                            const prod = item.product;
                            return (
                              <div key={idx} className="flex items-center gap-4">
                                <img
                                  src={prod?.images?.[0]?.url || 'https://via.placeholder.com/60'}
                                  alt=""
                                  className="w-14 h-16 rounded-lg object-cover bg-surface2"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{prod?.name || 'Product'}</p>
                                  <p className="text-xs text-muted">Size: {item.size} | Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-3 border-t border-border grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted uppercase tracking-wider mb-1">Shipping Address</p>
                            <p className="text-secondary">{order.shippingAddress}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted uppercase tracking-wider mb-1">Phone</p>
                            <p className="text-secondary">{order.phone}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
