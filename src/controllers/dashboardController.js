const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const { successResponse } = require('../utils/apiResponse');

// @route GET /api/admin/dashboard/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const [orders, customers, products] = await Promise.all([
      Order.find(),
      Customer.find(),
      Product.find(),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Monthly revenue for last 12 months
    const now = new Date();
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const monthOrders = orders.filter(o => {
        if (!o.createdAt) return false;
        const od = new Date(o.createdAt);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      });
      return {
        month: d.toLocaleString('en', { month: 'short' }),
        revenue: monthOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
        orders: monthOrders.length,
      };
    });

    // Growth calculation (This month vs Last month)
    const thisMonth = monthlyRevenue[11] || { revenue: 0, orders: 0 };
    const lastMonth = monthlyRevenue[10] || { revenue: 0, orders: 0 };
    const revenueGrowth = lastMonth.revenue === 0 ? (thisMonth.revenue > 0 ? 100 : 0) : ((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100;
    const ordersGrowth = lastMonth.orders === 0 ? (thisMonth.orders > 0 ? 100 : 0) : ((thisMonth.orders - lastMonth.orders) / lastMonth.orders) * 100;

    // Top Selling Products
    const productSales = {};
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!item) return;
          const pid = item.productId ? item.productId.toString() : (item.productName || 'unknown');
          if (!productSales[pid]) {
            productSales[pid] = { name: item.productName || 'Product', sold: 0, revenue: 0, image: item.image || '' };
          }
          const qty = Number(item.quantity) || 1;
          const price = Number(item.price) || 0;
          productSales[pid].sold += qty;
          productSales[pid].revenue += price * qty;
        });
      }
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 4);

    // Low Stock Products
    const lowStockProducts = products
      .filter(p => (Number(p.stock) || 0) < 15)
      .map(p => ({ id: p._id, name: p.name, stock: p.stock || 0, image: p.image || p.images?.[0] || '' }))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 4);

    // Sales by Category
    const categorySales = {};
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!item) return;
          const product = products.find(p => p._id && item.productId && p._id.toString() === item.productId.toString());
          const category = product?.category || 'Uncategorized';
          if (!categorySales[category]) {
            categorySales[category] = 0;
          }
          const qty = Number(item.quantity) || 1;
          const price = Number(item.price) || 0;
          categorySales[category] += price * qty;
        });
      }
    });
    
    // Format category sales for pie chart
    const salesByCategory = Object.entries(categorySales)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
      .sort((a, b) => b.value - a.value);

    // Customer Insights
    const returningCustomersCount = customers.filter(c => (Number(c.ordersCount) || 0) > 1).length;
    const newCustomersCount = Math.max(0, customers.length - returningCustomersCount);
    
    // Recent Customers
    const recentCustomers = [...customers]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4)
      .map(c => ({ id: c._id, name: c.name || 'Anonymous', email: c.email || '', spent: c.totalSpent || 0 }));

    res.json(successResponse({
      totalRevenue,
      activeOrders,
      totalCustomers: customers.length,
      totalProducts: products.length,
      averageOrderValue,
      revenueGrowth,
      ordersGrowth,
      monthlyRevenue,
      topProducts,
      lowStockProducts,
      salesByCategory,
      customerStats: { new: newCustomersCount, returning: returningCustomersCount },
      recentCustomers,
      recentOrders: [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5),
    }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
