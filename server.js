const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { connectDatabase } = require('./config/database');
const api = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors()); app.use(express.json({ limit: '10mb' })); app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', api);
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ message: 'حدث خطأ في الخادم', detail: process.env.NODE_ENV === 'development' ? err.message : undefined }); });
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

if (require.main === module) connectDatabase().then(() => app.listen(PORT, () => console.log(`الخادم يعمل على المنفذ ${PORT}`))).catch((error) => { console.error('تعذر الاتصال بقاعدة البيانات', error); process.exit(1); });
module.exports = app;
