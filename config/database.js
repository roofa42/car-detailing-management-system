const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('لم يتم تحديد رابط قاعدة البيانات؛ سيعمل الخادم دون تخزين دائم.');
    return false;
  }
  await mongoose.connect(uri);
  console.log('تم الاتصال بقاعدة البيانات');
  return true;
}

module.exports = { connectDatabase };
