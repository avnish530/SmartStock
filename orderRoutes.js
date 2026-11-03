const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const router = express.Router();

function validId(id) { return mongoose.isValidObjectId(id); }
async function restoreStock(items) {
  for (const item of items) await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
}
async function reserveItems(items) {
  const reserved = [];
  try {
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!validId(item.productId) || !Number.isInteger(quantity) || quantity < 1) throw new Error('Invalid product or quantity.');
      const product = await Product.findOneAndUpdate({ _id: item.productId, stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { new: true });
      if (!product) throw new Error('Product not found or available stock is insufficient.');
      reserved.push({ product: product._id, name: product.name, sku: product.sku, quantity, price: product.price });
    }
    return reserved;
  } catch (error) {
    await restoreStock(reserved);
    throw error;
  }
}
router.get('/', async (_req, res, next) => {
  try { const orders = await Order.find().populate('customer', 'name email phone').sort({ createdAt: -1 }); res.json(orders.map(o => ({ ...o.toObject(), customerName: o.customer?.name || 'Unknown', orderStatus: o.status }))); } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try { const order = await Order.findById(req.params.id).populate('customer', 'name email phone'); if (!order) return res.status(404).json({ message: 'Order not found.' }); res.json({ ...order.toObject(), customerName: order.customer?.name || 'Unknown', orderStatus: order.status }); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  let reserved = [];
  try {
    const { customerId, items, paymentStatus, paymentMethod, notes } = req.body;
    if (!validId(customerId)) return res.status(400).json({ message: 'Please select a valid customer.' });
    if (!(await Customer.exists({ _id: customerId }))) return res.status(404).json({ message: 'Customer not found.' });
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Please select at least one product.' });
    reserved = await reserveItems(items);
    const totalAmount = reserved.reduce((sum, item) => sum + item.price * item.quantity, 0);
    try {
      const order = await Order.create({ orderNumber: `SS-${Date.now()}-${Math.floor(Math.random()*1000)}`, customer: customerId, items: reserved, subtotal: totalAmount, totalAmount, paymentStatus: ['Paid','Partial','Unpaid'].includes(paymentStatus) ? paymentStatus : 'Unpaid', paymentMethod: ['Cash','UPI','Card','Bank Transfer'].includes(paymentMethod) ? paymentMethod : 'Cash', notes: notes || '' });
      const populated = await order.populate('customer', 'name email phone');
      res.status(201).json({ message: 'Order created successfully!', order: populated });
    } catch (createError) { await restoreStock(reserved); reserved = []; throw createError; }
  } catch (e) { next(e); }
});
router.patch('/:id/status', async (req, res, next) => {
  try { const allowed = ['Pending','Processing','Completed','Cancelled']; if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status.' }); const order = await Order.findById(req.params.id); if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.status !== 'Cancelled' && req.body.status === 'Cancelled') await restoreStock(order.items);
    if (order.status === 'Cancelled' && req.body.status !== 'Cancelled') return res.status(400).json({ message: 'Cancelled orders cannot be reopened. Create a new order instead.' });
    order.status = req.body.status; await order.save(); res.json(order);
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try { const order = await Order.findById(req.params.id); if (!order) return res.status(404).json({ message: 'Order not found.' }); if (order.status !== 'Cancelled') await restoreStock(order.items); await order.deleteOne(); res.json({ message: 'Order deleted and stock restored.' }); } catch (e) { next(e); }
});
module.exports = router;
