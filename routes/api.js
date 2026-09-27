const express = require('express');
const { Customer, Car, Service, WorkOrder, Payment, Expense } = require('../models');
const router = express.Router();
const nextNumber = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

router.get('/customers', asyncRoute(async (req, res) => {
  const query = req.query.q ? { archivedAt: { $exists: false }, $or: [{ fullName: new RegExp(req.query.q, 'i') }, { phone: new RegExp(req.query.q, 'i') }] } : { archivedAt: { $exists: false } };
  res.json(await Customer.find(query).sort({ createdAt: -1 }).limit(100));
}));
router.post('/customers', asyncRoute(async (req, res) => res.status(201).json(await Customer.create({ ...req.body, number: nextNumber('زبون') }))));
router.get('/customers/:id', asyncRoute(async (req, res) => {
  const customer = await Customer.findById(req.params.id); if (!customer) return res.status(404).json({ message: 'الزبون غير موجود' });
  const cars = await Car.find({ customer: customer._id, archivedAt: { $exists: false } }); const orders = await WorkOrder.find({ customer: customer._id }).populate('car services.service');
  res.json({ customer, cars, orders });
}));
router.patch('/customers/:id', asyncRoute(async (req, res) => res.json(await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));
router.delete('/customers/:id', asyncRoute(async (req, res) => res.json(await Customer.findByIdAndUpdate(req.params.id, { archivedAt: new Date() }, { new: true }))));

router.get('/cars', asyncRoute(async (req, res) => { const query = { archivedAt: { $exists: false } }; if (req.query.q) query.$or = [{ registrationNumber: new RegExp(req.query.q, 'i') }, { brand: new RegExp(req.query.q, 'i') }, { model: new RegExp(req.query.q, 'i') }]; res.json(await Car.find(query).populate('customer').sort({ createdAt: -1 })); }));
router.post('/cars', asyncRoute(async (req, res) => res.status(201).json(await Car.create({ ...req.body, fileNumber: nextNumber('سيارة') }))));
router.patch('/cars/:id', asyncRoute(async (req, res) => res.json(await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));

router.get('/services', asyncRoute(async (_req, res) => res.json(await Service.find({ active: true }).sort({ name: 1 }))));
router.post('/services', asyncRoute(async (req, res) => res.status(201).json(await Service.create(req.body))));
router.patch('/services/:id', asyncRoute(async (req, res) => res.json(await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));
router.delete('/services/:id', asyncRoute(async (req, res) => res.json(await Service.findByIdAndUpdate(req.params.id, { active: false }, { new: true }))));

router.get('/work-orders', asyncRoute(async (req, res) => { const query = req.query.status ? { status: req.query.status } : {}; res.json(await WorkOrder.find(query).populate('customer car employee services.service').sort({ enteredAt: -1 })); }));
router.post('/work-orders', asyncRoute(async (req, res) => res.status(201).json(await WorkOrder.create({ ...req.body, number: nextNumber('أمر') }))));
router.patch('/work-orders/:id/status', asyncRoute(async (req, res) => { const updates = { status: req.body.status }; if (req.body.status === 'working') updates.startedAt = new Date(); if (req.body.status === 'ready') updates.completedAt = new Date(); if (req.body.status === 'delivered') updates.deliveredAt = new Date(); res.json(await WorkOrder.findByIdAndUpdate(req.params.id, updates, { new: true })); }));

router.post('/payments', asyncRoute(async (req, res) => { const payment = await Payment.create({ ...req.body, number: nextNumber('قبض') }); if (payment.customer) await Customer.findByIdAndUpdate(payment.customer, { $inc: { totalPaid: payment.amount } }); res.status(201).json(payment); }));
router.post('/expenses', asyncRoute(async (req, res) => res.status(201).json(await Expense.create(req.body))));
router.get('/dashboard', asyncRoute(async (_req, res) => { const start = new Date(); start.setHours(0, 0, 0, 0); const [income, expenses, carsToday, activeCars] = await Promise.all([Payment.aggregate([{ $match: { date: { $gte: start } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]), Expense.aggregate([{ $match: { date: { $gte: start } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]), WorkOrder.countDocuments({ enteredAt: { $gte: start } }), WorkOrder.countDocuments({ status: { $in: ['waiting', 'working', 'review', 'ready'] } })]); const revenue = income[0]?.total || 0; const cost = expenses[0]?.total || 0; res.json({ income: revenue, expenses: cost, profit: revenue - cost, carsToday, activeCars }); }));

module.exports = router;
