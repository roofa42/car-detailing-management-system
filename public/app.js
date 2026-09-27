class API {
  constructor(baseURL = '/api') { this.baseURL = baseURL; }
  async request(method, endpoint, data = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (data) options.body = JSON.stringify(data);
    const res = await fetch(`${this.baseURL}${endpoint}`, options);
    if (!res.ok) { const err = await res.json(); throw new Error(err.message || `خطأ ${res.status}`); }
    return res.json();
  }
  async getCustomers(q = '') { return this.request('GET', `/customers?q=${q}`); }
  async getCustomer(id) { return this.request('GET', `/customers/${id}`); }
  async createCustomer(data) { return this.request('POST', '/customers', data); }
  async updateCustomer(id, data) { return this.request('PATCH', `/customers/${id}`, data); }
  async deleteCustomer(id) { return this.request('DELETE', `/customers/${id}`); }
  async getCars(q = '') { return this.request('GET', `/cars?q=${q}`); }
  async createCar(data) { return this.request('POST', '/cars', data); }
  async updateCar(id, data) { return this.request('PATCH', `/cars/${id}`, data); }
  async getServices() { return this.request('GET', '/services'); }
  async createService(data) { return this.request('POST', '/services', data); }
  async updateService(id, data) { return this.request('PATCH', `/services/${id}`, data); }
  async deleteService(id) { return this.request('DELETE', `/services/${id}`); }
  async getWorkOrders(status = null) { return this.request('GET', `/work-orders${status ? `?status=${status}` : ''}`); }
  async createWorkOrder(data) { return this.request('POST', '/work-orders', data); }
  async updateWorkOrderStatus(id, status) { return this.request('PATCH', `/work-orders/${id}/status`, { status }); }
  async createPayment(data) { return this.request('POST', '/payments', data); }
  async createExpense(data) { return this.request('POST', '/expenses', data); }
  async getDashboard() { return this.request('GET', '/dashboard'); }
}

const api = new API();

class UI {
  constructor() { this.currentPage = 'dashboard'; this.customers = []; this.cars = []; this.services = []; this.workOrders = []; }
  async init() {
    this.setupEventListeners();
    await this.loadDashboard();
  }
  setupEventListeners() {
    document.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('href').replace('#', '');
        this.navigateTo(page);
      });
    });
    document.querySelector('.mobile-menu')?.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('active');
    });
  }
  navigateTo(page) {
    location.hash = page;
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(page)?.classList.remove('hidden');
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    document.querySelector(`nav a[href="#${page}"]`)?.classList.add('active');
    this.currentPage = page;
    if (page === 'dashboard') this.loadDashboard();
    else if (page === 'customers') this.loadCustomers();
    else if (page === 'cars') this.loadCars();
    else if (page === 'services') this.loadServices();
    else if (page === 'work-orders') this.loadWorkOrders();
  }
  async loadDashboard() {
    try {
      const data = await api.getDashboard();
      document.querySelectorAll('.stat-card strong')[0].textContent = `${data.income.toLocaleString('ar')} دج`;
      document.querySelectorAll('.stat-card strong')[1].textContent = `${data.profit.toLocaleString('ar')} دج`;
      document.querySelectorAll('.stat-card strong')[2].textContent = data.carsToday;
      document.querySelectorAll('.stat-card strong')[3].textContent = data.activeCars;
    } catch (error) { console.error('خطأ في تحميل لوحة التحكم:', error); }
  }
  async loadCustomers() {
    try {
      this.customers = await api.getCustomers();
      this.renderCustomers();
    } catch (error) { this.showError('خطأ في تحميل الزبائن'); }
  }
  renderCustomers() {
    const container = document.getElementById('customers-list') || this.createCustomersContainer();
    if (this.customers.length === 0) {
      container.innerHTML = '<div class="empty-large"><span>👥</span><h3>لا يوجد زبائن بعد</h3></div>';
      return;
    }
    container.innerHTML = this.customers.map(c => `
      <div class="customer-card" onclick="ui.showCustomerDetail('${c._id}')">
        <div class="card-header">
          <strong>${c.fullName}</strong>
          <span class="phone">📞 ${c.phone}</span>
        </div>
        <div class="card-body">
          <p>عدد الزيارات: ${c.visitsCount}</p>
          <p>المبلغ المدفوع: ${c.totalPaid.toLocaleString('ar')} دج</p>
        </div>
      </div>
    `).join('');
  }
  createCustomersContainer() {
    const page = document.getElementById('customers');
    const container = document.createElement('div');
    container.id = 'customers-list';
    container.className = 'customers-grid';
    page.appendChild(container);
    return container;
  }
  async showCustomerDetail(id) {
    try {
      const data = await api.getCustomer(id);
      const html = `
        <div class="modal-overlay" onclick="ui.closeModal()">
          <div class="modal" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h2>${data.customer.fullName}</h2>
              <button class="close-btn" onclick="ui.closeModal()">✕</button>
            </div>
            <div class="modal-body">
              <div class="info-section">
                <h3>معلومات الزبون</h3>
                <p>رقم الزبون: ${data.customer.number}</p>
                <p>الهاتف: ${data.customer.phone}</p>
                <p>عنوان: ${data.customer.address || '-'}</p>
                <p>عدد الزيارات: ${data.customer.visitsCount}</p>
                <p>المبلغ المدفوع: ${data.customer.totalPaid.toLocaleString('ar')} دج</p>
              </div>
              <div class="info-section">
                <h3>السيارات</h3>
                <div class="list">
                  ${data.cars.map(car => `
                    <div class="item">
                      <strong>${car.brand} ${car.model} (${car.manufacturingYear})</strong>
                      <small>التسجيل: ${car.registrationNumber}</small>
                    </div>
                  `).join('') || '<p class="empty">لا توجد سيارات</p>'}
                </div>
              </div>
              <div class="info-section">
                <h3>سجل الخدمات</h3>
                <div class="list">
                  ${data.orders.map(order => `
                    <div class="item">
                      <strong>${order.number}</strong>
                      <small>الحالة: ${this.getStatusLabel(order.status)}</small>
                      <small>التاريخ: ${new Date(order.createdAt).toLocaleDateString('ar')}</small>
                    </div>
                  `).join('') || '<p class="empty">لا توجد خدمات</p>'}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) { this.showError('خطأ في تحميل بيانات الزبون'); }
  }
  async loadCars() {
    try {
      this.cars = await api.getCars();
      const container = document.getElementById('cars-list') || this.createCarsContainer();
      if (this.cars.length === 0) {
        container.innerHTML = '<div class="empty-large"><span>🚗</span><h3>لا توجد سيارات مسجلة</h3></div>';
        return;
      }
      container.innerHTML = this.cars.map(car => `
        <div class="car-card">
          <div class="card-header">
            <strong>${car.brand} ${car.model}</strong>
            <span class="year">${car.manufacturingYear}</span>
          </div>
          <div class="card-body">
            <p>الرقم: ${car.registrationNumber}</p>
            <p>الصاحب: ${car.customer?.fullName || 'غير معروف'}</p>
            <p>الحالة: ${car.color}</p>
          </div>
        </div>
      `).join('');
    } catch (error) { this.showError('خطأ في تحميل السيارات'); }
  }
  createCarsContainer() {
    const page = document.getElementById('cars');
    const container = document.createElement('div');
    container.id = 'cars-list';
    container.className = 'cars-grid';
    page.appendChild(container);
    return container;
  }
  async loadServices() {
    try {
      this.services = await api.getServices();
      const container = document.getElementById('services-list') || this.createServicesContainer();
      if (this.services.length === 0) {
        container.innerHTML = '<div class="empty-large"><span>✨</span><h3>لا توجد خدمات بعد</h3></div>';
        return;
      }
      container.innerHTML = this.services.map(s => `
        <div class="service-card">
          <div class="card-header">
            <strong>${s.name}</strong>
            <span class="price">${s.price.toLocaleString('ar')} دج</span>
          </div>
          <div class="card-body">
            <p>${s.description || '-'}</p>
            <p>المدة: ${s.durationMinutes} دقيقة</p>
          </div>
        </div>
      `).join('');
    } catch (error) { this.showError('خطأ في تحميل الخدمات'); }
  }
  createServicesContainer() {
    const page = document.getElementById('services');
    const container = document.createElement('div');
    container.id = 'services-list';
    container.className = 'services-grid';
    page.appendChild(container);
    return container;
  }
  async loadWorkOrders() {
    try {
      this.workOrders = await api.getWorkOrders();
      this.renderWorkOrders();
    } catch (error) { this.showError('خطأ في تحميل أوامر العمل'); }
  }
  renderWorkOrders() {
    const columns = document.querySelectorAll('.status-columns > div');
    const statuses = ['waiting', 'working', 'ready'];
    statuses.forEach((status, index) => {
      const orders = this.workOrders.filter(o => o.status === status);
      columns[index].querySelector('.dropzone').innerHTML = orders.map(o => `
        <div class="work-order-card" data-id="${o._id}">
          <strong>${o.number}</strong>
          <p>${o.customer?.fullName || 'غير معروف'}</p>
          <small>${o.car?.brand} ${o.car?.model}</small>
        </div>
      `).join('') || '<p class="empty-text">لا توجد أوامر</p>';
      columns[index].querySelector('b').textContent = orders.length;
    });
  }
  getStatusLabel(status) {
    const labels = {
      'waiting': '🟡 في الانتظار',
      'working': '🔵 قيد العمل',
      'review': '🟠 في انتظار المراجعة',
      'ready': '🟢 جاهزة للتسليم',
      'delivered': '⚫ تم التسليم'
    };
    return labels[status] || status;
  }
  closeModal() { document.querySelector('.modal-overlay')?.remove(); }
  showError(message) { alert(message); }
}

const ui = new UI();
document.addEventListener('DOMContentLoaded', () => ui.init());
