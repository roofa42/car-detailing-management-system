const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  number: { type: String, unique: true, index: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, index: true },
  address: String,
  notes: String,
  firstVisit: Date,
  lastVisit: Date,
  visitsCount: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  archivedAt: Date
}, { timestamps: true });

const carSchema = new mongoose.Schema({
  fileNumber: { type: String, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  type: String, brand: String, model: String, manufacturingYear: Number,
  color: String, registrationNumber: { type: String, index: true },
  odometer: Number, notes: String,
  photos: { before: [{ url: String, kind: String }], after: [{ url: String, kind: String }] },
  archivedAt: Date
}, { timestamps: true });

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, description: String,
  price: { type: Number, required: true, min: 0 }, durationMinutes: { type: Number, default: 60 },
  products: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: Number }],
  active: { type: Boolean, default: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, category: String, quantity: { type: Number, default: 0 },
  unit: String, purchasePrice: Number, consumptionPrice: Number, supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  minimumQuantity: { type: Number, default: 0 }, archivedAt: Date
}, { timestamps: true });

const workOrderSchema = new mongoose.Schema({
  number: { type: String, unique: true, index: true }, customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  services: [{ service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' }, name: String, price: Number }],
  products: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: Number }],
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  status: { type: String, enum: ['waiting', 'working', 'review', 'ready', 'delivered'], default: 'waiting' },
  enteredAt: { type: Date, default: Date.now }, startedAt: Date, completedAt: Date, deliveredAt: Date,
  expectedPrice: { type: Number, default: 0 }, discount: { type: Number, default: 0 }, paid: { type: Number, default: 0 }, notes: String,
  photos: { before: [{ url: String, kind: String }], after: [{ url: String, kind: String }] }, archivedAt: Date
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  number: { type: String, unique: true }, customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' }, workOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder' },
  amount: { type: Number, required: true, min: 0 }, discount: { type: Number, default: 0 }, method: { type: String, default: 'cash' },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, date: { type: Date, default: Date.now }
}, { timestamps: true });

const expenseSchema = new mongoose.Schema({ category: { type: String, required: true }, description: String, amount: { type: Number, required: true, min: 0 }, date: { type: Date, default: Date.now }, paidBy: String }, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);
const Car = mongoose.model('Car', carSchema);
const Service = mongoose.model('Service', serviceSchema);
const Product = mongoose.model('Product', productSchema);
const WorkOrder = mongoose.model('WorkOrder', workOrderSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Expense = mongoose.model('Expense', expenseSchema);
module.exports = { Customer, Car, Service, Product, WorkOrder, Payment, Expense };
