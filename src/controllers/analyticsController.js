const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { successResponse } = require('../utils/apiResponse');

// @route GET /api/admin/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const [orders, customers] = await Promise.all([Order.find(), Customer.find()]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const conversionRate = orders.length > 0 ? ((deliveredOrders / orders.length) * 100).toFixed(1) : 0;
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Monthly data for last 12 months
    const now = new Date();
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const monthOrders = orders.filter(o => {
        const od = new Date(o.createdAt);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      });
      const monthCustomers = customers.filter(c => {
        const cd = new Date(c.createdAt);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      });
      return {
        month: d.toLocaleString('en', { month: 'short' }),
        revenue: monthOrders.reduce((sum, o) => sum + o.total, 0),
        orders: monthOrders.length,
        newCustomers: monthCustomers.length,
      };
    });

    const thisMonth = monthlyData[11];
    const lastMonth = monthlyData[10];
    const revenueGrowth = lastMonth.revenue === 0 ? 100 : ((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100;
    const ordersGrowth = lastMonth.orders === 0 ? 100 : ((thisMonth.orders - lastMonth.orders) / lastMonth.orders) * 100;

    // Sales by City
    const citySales = {};
    orders.forEach(o => {
      const city = o.shippingAddress?.city || 'Unknown';
      citySales[city] = (citySales[city] || 0) + o.total;
    });
    const salesByCity = Object.entries(citySales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Sales by Day of Week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const daySales = { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };
    orders.forEach(o => {
      const day = days[new Date(o.createdAt).getDay()];
      daySales[day] += o.total;
    });
    const salesByDay = Object.entries(daySales).map(([day, value]) => ({ day, value }));

    res.json(successResponse({
      totalRevenue,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      averageOrderValue,
      conversionRate: `${conversionRate}%`,
      revenueGrowth,
      ordersGrowth,
      monthlyData,
      salesByCity,
      salesByDay
    }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
