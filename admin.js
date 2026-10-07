/**
 * TRADINGSTORE - Master Admin Panel Controller
 * Inventory Management, Device-Locked Password Generator, Payment Accounts,
 * Order Inbox with Screenshot Viewer, and Customer Key Dispatch.
 * 
 * SECURITY:
 * - Session-based auth (sessionStorage) - tab-specific
 * - Rate-limited login attempts (max 5 per 10 min)
 * - XSS protection via sanitization
 * - No inline onclick handlers
 */

import { store } from './store.js';

/**
 * SECURITY: HTML sanitizer to prevent XSS attacks
 */
function sanitize(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
  return s.replace(/[&<>"'/]/g, c => map[c]);
}

class AdminPanel {
  constructor() {
    this.currentSection = 'dashboard';
    this.editingItem = null;
    this.activeModalType = null;
    this.sessionKey = 'tradingstore_admin_session';

    // Rate limiting for login
    this.loginAttempts = 0;
    this.loginLockoutUntil = 0;

    this.init();
  }

  init() {
    this.checkAuth();
    this.bindEvents();
    this.renderStats();
    this.renderCurrentSection();

    // Subscribe to store updates
    store.subscribe(() => {
      this.renderStats();
      this.renderCurrentSection();
    });
  }

  // --- AUTHENTICATION ---
  checkAuth() {
    const isAuthed = sessionStorage.getItem(this.sessionKey) === 'true';
    const loginScreen = document.getElementById('adminLoginScreen');
    const adminWrapper = document.getElementById('adminWrapper');

    if (!isAuthed) {
      if (loginScreen) loginScreen.style.display = 'flex';
      if (adminWrapper) adminWrapper.style.display = 'none';
    } else {
      if (loginScreen) loginScreen.style.display = 'none';
      if (adminWrapper) adminWrapper.style.display = 'flex';
    }
  }

  login(username, password) {
    // Rate limiting check
    const now = Date.now();
    if (now < this.loginLockoutUntil) {
      const remaining = Math.ceil((this.loginLockoutUntil - now) / 1000);
      this.showToast(`Too many attempts! Wait ${remaining} seconds.`, "error");
      return false;
    }

    const settings = store.getSiteSettings();
    if (
      username.trim().toLowerCase() === settings.adminUsername.toLowerCase() &&
      password.trim() === settings.adminPassword
    ) {
      sessionStorage.setItem(this.sessionKey, 'true');
      this.loginAttempts = 0;
      this.checkAuth();
      this.showToast("Welcome back, Administrator!", "success");
      return true;
    }

    // Failed attempt
    this.loginAttempts++;
    if (this.loginAttempts >= 5) {
      this.loginLockoutUntil = now + 10 * 60 * 1000; // 10 minute lockout
      this.showToast("Too many failed attempts! Locked for 10 minutes.", "error");
    }
    return false;
  }

  logout() {
    sessionStorage.removeItem(this.sessionKey);
    this.checkAuth();
  }

  // --- SECTION NAVIGATION ---
  switchSection(sectionId) {
    this.currentSection = sectionId;

    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === sectionId);
    });

    document.querySelectorAll('.admin-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `section-${sectionId}`);
    });

    const topbarTitle = document.getElementById('adminTopbarTitle');
    if (topbarTitle) {
      const titles = {
        dashboard: "Executive Overview",
        bots: "Manage TradingView Bots & Scripts",
        books: "Manage Trading Books & PDFs",
        courses: "Manage Trading Courses",
        premium: "Manage VIP Premium Scripts",
        passwords: "Site Access Passwords (Device-Locked)",
        premiumKeys: "VIP Script Unlock Keys",
        payments: "Payment Accounts (JazzCash, Crypto, Bank)",
        orders: "Orders & Payment Screenshot Inbox",
        socialLinks: "Gatekeeper Verification & Channel Links",
        settings: "Site Settings & Admin Security"
      };
      topbarTitle.innerText = titles[sectionId] || "Control Panel";
    }

    this.renderCurrentSection();
  }

  renderCurrentSection() {
    switch (this.currentSection) {
      case 'dashboard':
        this.renderStats();
        this.renderRecentOrdersTable();
        break;
      case 'bots':
        this.renderBotsTable();
        break;
      case 'books':
        this.renderBooksTable();
        break;
      case 'courses':
        this.renderCoursesTable();
        break;
      case 'premium':
        this.renderPremiumTable();
        break;
      case 'socialLinks':
        this.renderSocialLinksSection();
        break;
      case 'passwords':
        this.renderSitePasswordsTable();
        break;
      case 'premiumKeys':
        this.renderPremiumKeysTable();
        break;
      case 'payments':
        this.renderPaymentsTable();
        break;
      case 'orders':
        this.renderOrdersTable();
        break;
      case 'settings':
        this.renderSettingsForm();
        break;
    }
  }

  // --- 1. DASHBOARD & STATS ---
  renderStats() {
    const bots = store.getBots();
    const books = store.getBooks();
    const courses = store.getCourses();
    const premium = store.getPremium();
    const orders = store.getOrders();
    const sitePasswords = store.getSitePasswords();

    const elBots = document.getElementById('statBotsCount');
    const elBooks = document.getElementById('statBooksCount');
    const elCourses = document.getElementById('statCoursesCount');
    const elPremium = document.getElementById('statPremiumCount');
    const elPending = document.getElementById('statPendingOrdersCount');
    const elPasswords = document.getElementById('statPasswordsCount');
    const orderBadge = document.getElementById('navOrdersBadge');

    const pendingCount = orders.filter(o => o.status === 'pending').length;

    if (elBots) elBots.innerText = bots.length;
    if (elBooks) elBooks.innerText = books.length;
    if (elCourses) elCourses.innerText = courses.length;
    if (elPremium) elPremium.innerText = premium.length;
    if (elPending) elPending.innerText = pendingCount;
    if (elPasswords) elPasswords.innerText = sitePasswords.length;

    if (orderBadge) {
      orderBadge.innerText = pendingCount;
      orderBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }
  }

  renderRecentOrdersTable() {
    const container = document.getElementById('recentOrdersTableBody');
    if (!container) return;

    const orders = store.getOrders().slice(0, 5);
    if (orders.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-dim);">No orders received yet.</td></tr>`;
      return;
    }

    container.innerHTML = orders.map(ord => `
      <tr>
        <td><strong style="font-family: var(--font-code); color: var(--admin-cyan);">${sanitize(ord.id)}</strong></td>
        <td>${sanitize(ord.contactNumber)}</td>
        <td>${sanitize(ord.productTitle)}</td>
        <td>${sanitize(ord.platform)}</td>
        <td><span class="badge-tag ${ord.status}">${sanitize(ord.status).toUpperCase()}</span></td>
        <td>
          <button class="btn-sm-view" data-action="view-screenshot" data-id="${sanitize(ord.id)}">
            View Screenshot
          </button>
        </td>
      </tr>
    `).join('');

    // Bind event listeners
    container.querySelectorAll('[data-action="view-screenshot"]').forEach(btn => {
      btn.addEventListener('click', () => this.inspectScreenshot(btn.dataset.id));
    });
  }

  // --- 2. BOTS CRUD ---
  renderBotsTable() {
    const tbody = document.getElementById('botsTableBody');
    if (!tbody) return;

    const list = store.getBots();
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-dim);">No bots created yet. Click "Add New Bot".</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(bot => `
      <tr>
        <td><img src="${sanitize(bot.logo || 'assets/logo.svg')}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;" /></td>
        <td><strong>${sanitize(bot.title)}</strong></td>
        <td>${sanitize(bot.market || 'All')}</td>
        <td>${sanitize(bot.category || 'Scalping')}</td>
        <td><span class="badge-tag active">${bot.isFree ? 'FREE' : 'VIP'}</span></td>
        <td><a href="${sanitize(bot.tradingViewLink)}" target="_blank" style="color:var(--admin-cyan);">Open Link</a></td>
        <td>
          <div class="action-btn-group">
            <button class="btn-sm-edit" data-action="edit-bot" data-id="${sanitize(bot.id)}">Edit</button>
            <button class="btn-sm-del" data-action="delete-bot" data-id="${sanitize(bot.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-action="edit-bot"]').forEach(btn => {
      btn.addEventListener('click', () => this.openEditProductModal('bot', btn.dataset.id));
    });
    tbody.querySelectorAll('[data-action="delete-bot"]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteItem('bot', btn.dataset.id));
    });
  }

  // --- 3. BOOKS CRUD ---
  renderBooksTable() {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;

    const list = store.getBooks();
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-dim);">No books found. Click "Add New Book".</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(book => `
      <tr>
        <td><img src="${sanitize(book.cover || 'assets/logo.svg')}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;" /></td>
        <td><strong>${sanitize(book.title)}</strong></td>
        <td>${sanitize(book.author || 'Author')}</td>
        <td>${sanitize(book.pages || 'N/A')}</td>
        <td>${sanitize(book.category || 'Trading')}</td>
        <td><a href="${sanitize(book.downloadLink)}" target="_blank" style="color:var(--admin-cyan);">View PDF</a></td>
        <td>
          <div class="action-btn-group">
            <button class="btn-sm-edit" data-action="edit-book" data-id="${sanitize(book.id)}">Edit</button>
            <button class="btn-sm-del" data-action="delete-book" data-id="${sanitize(book.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-action="edit-book"]').forEach(btn => {
      btn.addEventListener('click', () => this.openEditProductModal('book', btn.dataset.id));
    });
    tbody.querySelectorAll('[data-action="delete-book"]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteItem('book', btn.dataset.id));
    });
  }

  // --- 4. COURSES CRUD ---
  renderCoursesTable() {
    const tbody = document.getElementById('coursesTableBody');
    if (!tbody) return;

    const list = store.getCourses();
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-dim);">No courses found. Click "Add New Course".</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(c => `
      <tr>
        <td><img src="${sanitize(c.thumbnail || 'assets/logo.svg')}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;" /></td>
        <td><strong>${sanitize(c.title)}</strong></td>
        <td>${sanitize(c.instructor || 'Senior Mentor')}</td>
        <td>${sanitize(c.duration || 'N/A')}</td>
        <td>${sanitize(c.level || 'All Levels')}</td>
        <td><a href="${sanitize(c.accessLink)}" target="_blank" style="color:var(--admin-cyan);">Open Course</a></td>
        <td>
          <div class="action-btn-group">
            <button class="btn-sm-edit" data-action="edit-course" data-id="${sanitize(c.id)}">Edit</button>
            <button class="btn-sm-del" data-action="delete-course" data-id="${sanitize(c.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-action="edit-course"]').forEach(btn => {
      btn.addEventListener('click', () => this.openEditProductModal('course', btn.dataset.id));
    });
    tbody.querySelectorAll('[data-action="delete-course"]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteItem('course', btn.dataset.id));
    });
  }

  // --- 5. PREMIUM SCRIPTS CRUD ---
  renderPremiumTable() {
    const tbody = document.getElementById('premiumTableBody');
    if (!tbody) return;

    const list = store.getPremium();
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-dim);">No premium scripts listed.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(p => `
      <tr>
        <td><img src="${sanitize(p.banner || 'assets/logo.svg')}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;" /></td>
        <td><strong>${sanitize(p.title)}</strong></td>
        <td style="color:var(--admin-gold); font-weight:700;">$${sanitize(p.priceUSD)} / PKR ${p.pricePKR?.toLocaleString() || ''}</td>
        <td>${sanitize(p.winRate || '80%+')}</td>
        <td><span style="font-family:var(--font-code); font-size:0.8rem; color:var(--admin-cyan);">${p.scriptLink ? 'Invite Link Configured' : 'No link'}</span></td>
        <td>
          <div class="action-btn-group">
            <button class="btn-sm-edit" data-action="edit-premium" data-id="${sanitize(p.id)}">Edit</button>
            <button class="btn-sm-del" data-action="delete-premium" data-id="${sanitize(p.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-action="edit-premium"]').forEach(btn => {
      btn.addEventListener('click', () => this.openEditProductModal('premium', btn.dataset.id));
    });
    tbody.querySelectorAll('[data-action="delete-premium"]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteItem('premium', btn.dataset.id));
    });
  }

  // --- 6. SITE ACCESS PASSWORDS ---
  renderSitePasswordsTable() {
    const tbody = document.getElementById('passwordsTableBody');
    if (!tbody) return;

    const list = store.getSitePasswords();
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-dim);">No site access passwords created.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(pwd => {
      const usedCount = (pwd.usedDevices || []).length;
      const maxCount = parseInt(pwd.maxDevices, 10) || 1;
      const isFull = usedCount >= maxCount;

      return `
        <tr>
          <td><strong style="font-family:var(--font-code); color:var(--admin-accent);">${sanitize(pwd.password)}</strong></td>
          <td>${sanitize(pwd.note || 'Site Pass')}</td>
          <td>
            <span class="device-limit-badge" style="${isFull ? 'color:var(--admin-red); border-color:var(--admin-red);' : 'color:var(--admin-accent);'}">
              ${usedCount} / ${maxCount} Device(s)
            </span>
          </td>
          <td>
            ${usedCount > 0 ? `
              <details style="font-size:0.8rem; color:var(--text-dim);">
                <summary style="cursor:pointer; color:var(--admin-cyan);">${usedCount} Active Device(s)</summary>
                <div style="padding:6px; background:rgba(0,0,0,0.3); border-radius:6px; margin-top:4px;">
                  ${pwd.usedDevices.map(d => `
                    <div>• ${sanitize(d.browser)} (${sanitize(d.platform)}) - ${sanitize(d.deviceId.substring(0, 14))}...</div>
                  `).join('')}
                </div>
              </details>
            ` : '<span style="color:var(--text-dim); font-size:0.8rem;">Unused</span>'}
          </td>
          <td><span class="badge-tag ${pwd.status === 'active' ? 'active' : 'rejected'}">${sanitize(pwd.status).toUpperCase()}</span></td>
          <td>
            <div class="action-btn-group">
              <button class="btn-sm-view" data-action="reset-pwd-devices" data-id="${sanitize(pwd.id)}" title="Reset registered devices so new devices can join">
                Reset Devices
              </button>
              <button class="btn-sm-del" data-action="delete-pwd" data-id="${sanitize(pwd.id)}">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-action="reset-pwd-devices"]').forEach(btn => {
      btn.addEventListener('click', () => this.resetPasswordDevices(btn.dataset.id));
    });
    tbody.querySelectorAll('[data-action="delete-pwd"]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteSitePassword(btn.dataset.id));
    });
  }

  // --- 7. PREMIUM VIP PAGE PASSWORDS (UNIFIED FULL PAGE ACCESS) ---
  renderPremiumKeysTable() {
    const tbody = document.getElementById('premiumKeysTableBody');
    if (!tbody) return;

    const list = store.getPremiumPasswords();
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-dim);">No VIP passwords issued yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(k => {
      const cleanContact = (k.assignedTo || '').replace(/[^0-9]/g, '');
      const waLink = cleanContact ? `https://wa.me/${cleanContact}` : '';

      return `
        <tr>
          <td><strong style="font-family:var(--font-code); color:var(--admin-gold); font-size:1.05rem;">${sanitize(k.key)}</strong></td>
          <td>
            ${k.assignedTo ? `
              <div><strong>${sanitize(k.assignedTo)}</strong></div>
              ${cleanContact ? `<a href="${waLink}" target="_blank" style="font-size:0.75rem; color:var(--admin-accent); text-decoration:none;">💬 WhatsApp</a>` : ''}
            ` : '<span style="color:var(--text-dim);">-</span>'}
          </td>
          <td>${sanitize(k.note || 'Full VIP Suite')}</td>
          <td>${k.unlockedCount || 0} times</td>
          <td>
            <span class="badge-tag ${k.status === 'active' ? 'active' : 'rejected'}">
              ${sanitize(k.status || 'active').toUpperCase()}
            </span>
          </td>
          <td>
            <div class="action-btn-group">
              <button class="btn-sm-edit" data-action="copy-key" data-key="${sanitize(k.key)}">Copy</button>
              <button class="btn-sm-view" data-action="toggle-prem-key" data-id="${sanitize(k.id)}" title="Toggle Active / Inactive">
                ${k.status === 'active' ? 'Revoke' : 'Activate'}
              </button>
              <button class="btn-sm-del" data-action="delete-prem-key" data-id="${sanitize(k.id)}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-action="copy-key"]').forEach(btn => {
      btn.addEventListener('click', () => this.copyText(btn.dataset.key));
    });
    tbody.querySelectorAll('[data-action="toggle-prem-key"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = store.getPremiumPasswords().find(p => p.id === btn.dataset.id);
        if (item) {
          item.status = item.status === 'active' ? 'inactive' : 'active';
          store.savePremiumPassword(item);
          this.renderPremiumKeysTable();
          this.showToast(`VIP Password status: ${item.status}`, "info");
        }
      });
    });
    tbody.querySelectorAll('[data-action="delete-prem-key"]').forEach(btn => {
      btn.addEventListener('click', () => this.deletePremiumKey(btn.dataset.id));
    });
  }

  // --- 8. PAYMENT METHODS ---
  renderPaymentsTable() {
    const tbody = document.getElementById('paymentsTableBody');
    if (!tbody) return;

    const list = store.getPaymentMethods();
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-dim);">No payment methods configured.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(m => `
      <tr>
        <td><strong>${sanitize(m.platform)}</strong></td>
        <td><span style="font-family:var(--font-code); color:var(--admin-cyan);">${sanitize(m.accountNumber)}</span></td>
        <td>
          ${m.showTitle && m.accountTitle ? `<span style="color:var(--admin-gold); font-weight:600;">${sanitize(m.accountTitle)}</span>` : '<span style="color:var(--text-dim);">(Hidden / Not Set)</span>'}
        </td>
        <td><span class="badge-tag ${m.active ? 'active' : 'rejected'}">${m.active ? 'ACTIVE' : 'DISABLED'}</span></td>
        <td>
          <div class="action-btn-group">
            <button class="btn-sm-edit" data-action="edit-payment" data-id="${sanitize(m.id)}">Edit</button>
            <button class="btn-sm-del" data-action="delete-payment" data-id="${sanitize(m.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-action="edit-payment"]').forEach(btn => {
      btn.addEventListener('click', () => this.openEditPaymentModal(btn.dataset.id));
    });
    tbody.querySelectorAll('[data-action="delete-payment"]').forEach(btn => {
      btn.addEventListener('click', () => this.deletePaymentMethod(btn.dataset.id));
    });
  }

  // --- 9. ORDERS ---
  renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    const orders = store.getOrders();
    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-dim);">No customer orders received yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(ord => {
      const cleanContact = ord.contactNumber.replace(/[^0-9]/g, '');
      const waLink = `https://wa.me/${cleanContact}`;

      return `
        <tr>
          <td><strong style="font-family:var(--font-code); color:var(--admin-cyan);">${sanitize(ord.id)}</strong></td>
          <td>
            <div style="font-weight:700;">${sanitize(ord.contactNumber)}</div>
            <a href="${waLink}" target="_blank" style="font-size:0.75rem; color:var(--admin-accent); text-decoration:none;">
              💬 Open WhatsApp
            </a>
          </td>
          <td>${sanitize(ord.productTitle)}</td>
          <td>${sanitize(ord.platform)}</td>
          <td>
            <button class="btn-sm-view" data-action="view-screenshot" data-id="${sanitize(ord.id)}">
              🔍 View Screenshot
            </button>
          </td>
          <td>
            <span class="badge-tag ${ord.status}">${sanitize(ord.status).toUpperCase()}</span>
          </td>
          <td>
            ${ord.assignedPassword ? `<span style="font-family:var(--font-code); color:var(--admin-gold); font-weight:700;">${sanitize(ord.assignedPassword)}</span>` : '<span style="color:var(--text-dim);">-</span>'}
          </td>
          <td>
            <div class="action-btn-group">
              <button class="btn-sm-edit" data-action="approve-order" data-id="${sanitize(ord.id)}" title="Approve and generate VIP password for this buyer">
                ✓ Approve & Key
              </button>
              <button class="btn-sm-del" data-action="reject-order" data-id="${sanitize(ord.id)}">
                ✗
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-action="view-screenshot"]').forEach(btn => {
      btn.addEventListener('click', () => this.inspectScreenshot(btn.dataset.id));
    });
    tbody.querySelectorAll('[data-action="approve-order"]').forEach(btn => {
      btn.addEventListener('click', () => this.approveAndGenerateKey(btn.dataset.id));
    });
    tbody.querySelectorAll('[data-action="reject-order"]').forEach(btn => {
      btn.addEventListener('click', () => this.rejectOrder(btn.dataset.id));
    });
  }

  // --- SCREENSHOT INSPECTOR MODAL ---
  inspectScreenshot(orderId) {
    const order = store.getOrders().find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('adminScreenshotModal');
    const img = document.getElementById('adminScreenshotImg');
    const title = document.getElementById('screenshotModalTitle');
    const info = document.getElementById('screenshotModalOrderInfo');

    if (title) title.innerText = `Payment Proof - ${order.id} (${order.productTitle})`;
    if (img) img.src = order.screenshot || 'assets/logo.svg';
    if (info) {
      info.innerHTML = `
        <strong>Customer Contact:</strong> ${sanitize(order.contactNumber)} &nbsp;|&nbsp;
        <strong>Platform:</strong> ${sanitize(order.platform)} &nbsp;|&nbsp;
        <strong>Date:</strong> ${new Date(order.submittedAt).toLocaleString()}
      `;
    }

    if (modal) modal.classList.add('active');
  }

  approveAndGenerateKey(orderId) {
    const order = store.getOrders().find(o => o.id === orderId);
    if (!order) return;

    // Generate random VIP Key
    const randomKey = 'VIP-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
    
    // Save to premium passwords (unlocks entire VIP suite)
    store.savePremiumPassword({
      key: randomKey,
      assignedTo: order.contactNumber,
      note: `${order.productTitle} (${order.id})`,
      status: 'active'
    });

    // Update order
    store.updateOrderStatus(orderId, 'approved', randomKey);

    // Pre-fill WhatsApp message for admin convenience
    const cleanNum = order.contactNumber.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Assalam-o-Alaikum! Aap ka TradingStore VIP payment proof verify ho gya hai.\n\nAap ka VIP Access Password: *${randomKey}*\n\nWebsite par VIP Premium tab par ja kar ye password enter karein aur tamam private TradingView scripts aur systems unlock karein!\nShukriya!`);
    
    const waUrl = `https://wa.me/${cleanNum}?text=${msg}`;

    if (confirm(`Order ${order.id} Approved!\n\nGenerated VIP Password: ${randomKey}\n\nKya aap buyer ko WhatsApp message bhejna chahte hain?`)) {
      window.open(waUrl, '_blank');
    }

    this.showToast("Order approved & VIP key created!", "success");
    this.renderOrdersTable();
    this.renderStats();
  }

  rejectOrder(orderId) {
    if (confirm("Are you sure you want to mark this order as Rejected?")) {
      store.updateOrderStatus(orderId, 'rejected');
      this.showToast("Order rejected.", "info");
      this.renderOrdersTable();
    }
  }

  // --- SITE ACCESS PASSWORDS MANAGEMENT ---
  createNewSitePassword(password, maxDevices, note) {
    if (!password) {
      this.showToast("Password cannot be empty.", "error");
      return;
    }

    store.saveSitePassword({
      password: password.trim(),
      maxDevices: parseInt(maxDevices, 10) || 1,
      note: note.trim() || 'Access Pass',
      usedDevices: [],
      status: 'active'
    });

    this.showToast("Site Access Password created with device limit!", "success");
    this.renderSitePasswordsTable();
  }

  resetPasswordDevices(passwordId) {
    if (confirm("Reset active devices for this password? The user will be able to register fresh devices.")) {
      store.resetPasswordDevices(passwordId);
      this.showToast("Device list cleared for this password.", "success");
      this.renderSitePasswordsTable();
    }
  }

  deleteSitePassword(id) {
    if (confirm("Delete this access password? Users using it will lose access.")) {
      store.deleteSitePassword(id);
      this.showToast("Access password deleted.", "info");
      this.renderSitePasswordsTable();
    }
  }

  deletePremiumKey(id) {
    if (confirm("Delete this VIP key?")) {
      store.deletePremiumPassword(id);
      this.showToast("VIP key deleted.", "info");
      this.renderPremiumKeysTable();
    }
  }

  // --- GATEKEEPER & CHANNEL LINKS MANAGEMENT ---
  renderSocialLinksSection() {
    const tableBody = document.getElementById('socialLinksTableBody');
    const previewContainer = document.getElementById('adminGatekeeperLivePreview');
    const links = store.getSocialLinks();
    const gkConfig = store.getGatekeeperConfig();

    // 1. Populate Gatekeeper Rules form inputs
    const enabledInput = document.getElementById('gkConfigEnabled');
    const socialReqInput = document.getElementById('gkConfigSocialReq');
    const passReqInput = document.getElementById('gkConfigPasswordReq');
    const stealthInput = document.getElementById('gkConfigStealthSec');

    if (enabledInput) enabledInput.checked = gkConfig.enabled !== false;
    if (socialReqInput) socialReqInput.checked = gkConfig.socialVerificationRequired !== false;
    if (passReqInput) passReqInput.checked = gkConfig.passwordUnlockRequired !== false;
    if (stealthInput) stealthInput.value = gkConfig.minEngagementSeconds || 8;

    // 2. Render Channels Table Body
    if (tableBody) {
      if (!links || links.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center; padding:30px; color:var(--text-dim);">
              No channels configured yet. Click <strong>+ Add Channel Link</strong> above to add Telegram, WhatsApp, YouTube, etc.
            </td>
          </tr>
        `;
      } else {
        const platformColors = {
          telegram: { bg: 'rgba(0, 136, 204, 0.2)', border: '#0088cc', text: '#2AABEE', name: 'Telegram' },
          whatsapp: { bg: 'rgba(37, 211, 102, 0.2)', border: '#25d366', text: '#25D366', name: 'WhatsApp' },
          youtube: { bg: 'rgba(255, 0, 0, 0.2)', border: '#ff0000', text: '#ff5555', name: 'YouTube' },
          discord: { bg: 'rgba(88, 101, 242, 0.2)', border: '#5865f2', text: '#7289da', name: 'Discord' },
          instagram: { bg: 'rgba(225, 48, 108, 0.2)', border: '#e1306c', text: '#f56040', name: 'Instagram' },
          twitter: { bg: 'rgba(29, 155, 240, 0.2)', border: '#1d9bf0', text: '#1d9bf0', name: 'Twitter / X' },
          tiktok: { bg: 'rgba(254, 44, 85, 0.2)', border: '#fe2c55', text: '#fe2c55', name: 'TikTok' },
          custom: { bg: 'rgba(0, 242, 152, 0.2)', border: 'var(--admin-accent)', text: 'var(--admin-accent)', name: 'Custom' }
        };

        tableBody.innerHTML = links.map(link => {
          const p = (link.platform || 'custom').toLowerCase();
          const badge = platformColors[p] || platformColors.custom;
          const isActive = link.active !== false;

          return `
            <tr>
              <td>
                <span style="background:${badge.bg}; border:1px solid ${badge.border}; color:${badge.text}; padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">
                  ${badge.name}
                </span>
              </td>
              <td><strong>${sanitize(link.title)}</strong></td>
              <td>
                <div style="display:flex; align-items:center; gap:8px;">
                  <a href="${sanitize(link.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--admin-accent); font-family:var(--font-mono); font-size:0.8rem; text-decoration:none;">
                    ${sanitize(link.url.length > 40 ? link.url.substring(0, 37) + '...' : link.url)}
                  </a>
                  <button type="button" class="btn-copy-small" onclick="window.adminPanel.copyText('${sanitize(link.url)}')">Copy</button>
                </div>
              </td>
              <td>
                <button type="button" class="btn-sm-edit" onclick="window.adminPanel.toggleSocialLink('${sanitize(link.id)}')" 
                  style="${isActive 
                    ? 'background:rgba(0,242,152,0.15); border-color:var(--admin-accent); color:var(--admin-accent);' 
                    : 'background:rgba(255,59,105,0.15); border-color:#ff3b69; color:#ff6b8b;'} padding:4px 10px; font-size:0.78rem; font-weight:700;">
                  ${isActive ? '✓ Shown (Required)' : '✕ Hidden (Skipped)'}
                </button>
              </td>
              <td>
                <div style="display:flex; gap:6px;">
                  <button type="button" class="btn-sm-edit" onclick="window.adminPanel.openEditSocialModal('${sanitize(link.id)}')">Edit</button>
                  <button type="button" class="btn-sm-danger" onclick="window.adminPanel.deleteSocialLink('${sanitize(link.id)}')">Delete</button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // 3. Render Live Gatekeeper Visitor Preview
    if (previewContainer) {
      const activeLinks = store.getActiveSocialLinks();
      previewContainer.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
          <span style="font-size:1.4rem;">🔐</span>
          <div>
            <h4 style="color:#fff; font-family:var(--font-head); font-size:1.1rem; margin:0;">VIP Portal Verification</h4>
            <p style="font-size:0.75rem; color:var(--text-dim); margin-top:2px;">Live Visitor Preview (${activeLinks.length} active channel(s))</p>
          </div>
        </div>

        ${activeLinks.length === 0 ? `
          <div style="background:rgba(255,59,105,0.1); border:1px solid #ff3b69; border-radius:8px; padding:12px; color:#ff8fa3; font-size:0.85rem; text-align:center;">
            ⚠️ All channels are currently hidden! Visitors will enter directly or use password.
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
            ${activeLinks.map((l, i) => `
              <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.04); border:1px solid var(--admin-border); border-radius:8px; padding:10px 14px; font-size:0.88rem; color:#fff;">
                <span>${i + 1}. ${sanitize(l.title)}</span>
                <span style="background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:10px; font-size:0.72rem; color:var(--text-dim);">8s Stealth</span>
              </div>
            `).join('')}
          </div>
          <button type="button" disabled style="width:100%; padding:10px; background:linear-gradient(135deg, var(--admin-accent), #00c97b); border:none; border-radius:6px; color:#000; font-weight:700; font-size:0.88rem; opacity:0.8; cursor:not-allowed;">
            Confirm & Enter Site (${activeLinks.length} Channels Required)
          </button>
        `}
      `;
    }
  }

  toggleSocialLink(linkId) {
    const updated = store.toggleSocialLinkActive(linkId);
    if (updated) {
      this.showToast(`Channel "${updated.title}" is now ${updated.active ? 'Visible & Required' : 'Hidden'}!`, "success");
      this.renderSocialLinksSection();
    }
  }

  deleteSocialLink(linkId) {
    if (!confirm("Are you sure you want to remove this channel link?")) return;
    store.deleteSocialLink(linkId);
    this.showToast("Channel link removed.", "info");
    this.renderSocialLinksSection();
  }

  openEditSocialModal(linkId) {
    this.activeModalType = 'socialLink';
    const item = store.getSocialLinks().find(l => l.id === linkId);
    if (!item) return;
    this.editingItem = item;
    this._showModalForm('socialLink');
  }

  // --- SETTINGS & BRANDING ---
  renderSettingsForm() {
    const settings = store.getSiteSettings();
    const gkConfig = store.getGatekeeperConfig();

    const appNameInput = document.getElementById('settingsAppName');
    const taglineInput = document.getElementById('settingsTagline');
    const logoUrlInput = document.getElementById('settingsLogoUrl');
    const waNumInput = document.getElementById('settingsWhatsAppNumber');
    const currInput = document.getElementById('settingsCurrency');
    const usdToPkrInput = document.getElementById('settingsUsdToPkr');
    const gkModeInput = document.getElementById('settingsGatekeeperMode');
    const adminNewUser = document.getElementById('adminNewUsername');

    if (appNameInput) appNameInput.value = settings.appName || 'TradingStore';
    if (taglineInput) taglineInput.value = settings.tagline || '';
    if (logoUrlInput) logoUrlInput.value = settings.logoUrl || '';
    if (waNumInput) waNumInput.value = settings.whatsappSupportNumber || '923001234567';
    if (currInput) currInput.value = (settings.currency || 'USD').toUpperCase();
    if (usdToPkrInput) usdToPkrInput.value = settings.usdToPkrRate || 280;
    if (gkModeInput) gkModeInput.value = gkConfig.mode || 'soft';
    if (adminNewUser) adminNewUser.value = settings.adminUsername || 'admin';

    // Clear password inputs
    const curPass = document.getElementById('adminCurrentPassword');
    const newPass = document.getElementById('adminNewPassword');
    const confPass = document.getElementById('adminConfirmPassword');
    if (curPass) curPass.value = '';
    if (newPass) newPass.value = '';
    if (confPass) confPass.value = '';
  }

  saveSettingsFromForm() {
    const appName = document.getElementById('settingsAppName')?.value.trim();
    const tagline = document.getElementById('settingsTagline')?.value.trim();
    const logoUrl = document.getElementById('settingsLogoUrl')?.value.trim();
    const waNum = document.getElementById('settingsWhatsAppNumber')?.value.trim() || '923001234567';
    const curr = document.getElementById('settingsCurrency')?.value || 'USD';
    const usdToPkr = parseFloat(document.getElementById('settingsUsdToPkr')?.value) || 280;
    const gkMode = document.getElementById('settingsGatekeeperMode')?.value || 'soft';

    const current = store.getSiteSettings();
    store.saveSiteSettings({
      ...current,
      appName: appName || "TradingStore",
      tagline: tagline || "TradingView Scripts & Academy",
      logoUrl: logoUrl,
      whatsappSupportNumber: waNum,
      currency: curr,
      usdToPkrRate: usdToPkr
    });

    const currentGk = store.getGatekeeperConfig();
    store.saveGatekeeperConfig({
      ...currentGk,
      mode: gkMode,
      guestBrowsingAllowed: gkMode === 'soft' || gkMode === 'disabled',
      enabled: gkMode !== 'disabled'
    });

    this.showToast("Branding, WhatsApp and security settings saved successfully!", "success");
  }

  saveAdminCredentials() {
    const curPassInput = document.getElementById('adminCurrentPassword');
    const newUserInput = document.getElementById('adminNewUsername');
    const newPassInput = document.getElementById('adminNewPassword');
    const confPassInput = document.getElementById('adminConfirmPassword');
    const alertBox = document.getElementById('adminSecurityAlert');

    const curPass = curPassInput.value.trim();
    const newUser = newUserInput.value.trim();
    const newPass = newPassInput.value.trim();
    const confPass = confPassInput.value.trim();

    const settings = store.getSiteSettings();

    // 1. Verify current password
    if (curPass !== settings.adminPassword) {
      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.style.background = 'rgba(255, 59, 105, 0.15)';
        alertBox.style.border = '1px solid #ff3b69';
        alertBox.style.color = '#ff6b8b';
        alertBox.innerText = 'Security Verification Failed: Current password is incorrect!';
      }
      this.showToast("Current password incorrect! Access denied.", "error");
      return false;
    }

    // 2. Validate new password match
    if (!newUser) {
      alert("Admin username cannot be blank!");
      return false;
    }

    if (!newPass || newPass.length < 3) {
      alert("New password must be at least 3 characters long!");
      return false;
    }

    if (newPass !== confPass) {
      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.style.background = 'rgba(255, 59, 105, 0.15)';
        alertBox.style.border = '1px solid #ff3b69';
        alertBox.style.color = '#ff6b8b';
        alertBox.innerText = 'New Password and Confirmation do not match!';
      }
      this.showToast("Passwords do not match!", "error");
      return false;
    }

    // 3. Save new credentials safely
    store.saveSiteSettings({
      ...settings,
      adminUsername: newUser,
      adminPassword: newPass
    });

    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.style.background = 'rgba(0, 242, 152, 0.15)';
      alertBox.style.border = '1px solid var(--admin-accent)';
      alertBox.style.color = 'var(--admin-accent)';
      alertBox.innerText = `Success: Admin username updated to "${newUser}" and new password saved.`;
    }

    curPassInput.value = '';
    newPassInput.value = '';
    confPassInput.value = '';

    this.showToast("Admin credentials updated successfully! Keep your password safe.", "success");
    return true;
  }

  // --- IMAGE UPLOADER COMPONENT HELPER ---
  renderImagePickerControl(inputId, currentVal, label, hint, presets = []) {
    const safeVal = sanitize(currentVal || '');
    const displayImg = safeVal || 'logo.svg';

    return `
      <div class="form-group">
        <label class="form-label">${label}</label>
        <div class="image-uploader-control" id="${inputId}_wrap">
          <div class="image-preview-row">
            <div class="image-preview-thumb">
              <img id="${inputId}_preview" src="${displayImg}" alt="Preview" onerror="this.src='logo.svg'" />
            </div>
            <div class="image-preview-meta">
              <div class="image-preview-status" id="${inputId}_status">
                ${safeVal ? '✓ Active Image Selected' : 'Standard Logo Active'}
              </div>
              <div style="font-size:0.75rem; color:var(--text-dim);">
                Phone gallery / PC se photo select karein ya neeche direct link paste karein.
              </div>
              <div style="display:flex; gap:8px; margin-top:4px; flex-wrap:wrap;">
                <button type="button" class="btn-file-picker" id="${inputId}_btn_file">
                  📁 Device / Gallery Se Pick Karein
                </button>
                <button type="button" class="btn-sm-view" id="${inputId}_btn_clear" style="padding:6px 12px; font-size:0.75rem;">
                  Clear
                </button>
              </div>
              <input type="file" id="${inputId}_file" accept="image/*" style="display:none;" />
            </div>
          </div>

          <div>
            <label style="font-size:0.75rem; color:var(--text-dim); display:block; margin-bottom:4px;">
              Image Web Link (URL) ya Auto-Loaded Base64:
            </label>
            <input type="text" id="${inputId}" class="form-input" 
              placeholder="https://... ya uper diye gaye button se direct image upload karein" 
              value="${safeVal}" />
          </div>

          ${presets && presets.length > 0 ? `
            <div>
              <div style="font-size:0.75rem; color:var(--text-dim); margin-bottom:4px;">
                Curated Presets (1-Click Select):
              </div>
              <div class="preset-pills-wrap">
                ${presets.map(p => {
                  const labelText = p.title || p.label || 'Preset';
                  return `
                    <button type="button" class="preset-pill-btn" data-target="${inputId}" data-url="${sanitize(p.url)}" title="${sanitize(labelText)}">
                      ${sanitize(labelText)}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          ${hint ? `<div class="form-hint">${hint}</div>` : ''}
        </div>
      </div>
    `;
  }

  bindImagePickerEvents(inputId) {
    const wrap = document.getElementById(`${inputId}_wrap`);
    if (!wrap) return;

    const fileInput = document.getElementById(`${inputId}_file`);
    const fileBtn = document.getElementById(`${inputId}_btn_file`);
    const clearBtn = document.getElementById(`${inputId}_btn_clear`);
    const textInput = document.getElementById(inputId);
    const previewImg = document.getElementById(`${inputId}_preview`);
    const statusEl = document.getElementById(`${inputId}_status`);

    // File picker click
    if (fileBtn && fileInput) {
      fileBtn.addEventListener('click', () => fileInput.click());
    }

    // Read selected file as base64
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
          alert("Sirf image files (PNG, JPG, JPEG, WEBP) select karein.");
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert("Image file size maximum 5MB honi chahiye.");
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          if (textInput) textInput.value = base64;
          if (previewImg) previewImg.src = base64;
          if (statusEl) statusEl.innerText = "✓ Device Photo Uploaded!";
          this.showToast("Image loaded from device successfully!", "success");
        };
        reader.readAsDataURL(file);
      });
    }

    // Text input manual typing / paste
    if (textInput) {
      textInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (previewImg) previewImg.src = val || 'logo.svg';
        if (statusEl) statusEl.innerText = val ? "✓ Custom URL Loaded" : "Standard Logo Active";
      });
    }

    // Clear / Reset image
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (textInput) textInput.value = '';
        if (fileInput) fileInput.value = '';
        if (previewImg) previewImg.src = 'logo.svg';
        if (statusEl) statusEl.innerText = "Standard Logo Active";
      });
    }

    // Preset pills click
    wrap.querySelectorAll('.preset-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetUrl = btn.dataset.url;
        if (textInput) textInput.value = targetUrl;
        if (previewImg) previewImg.src = targetUrl;
        if (statusEl) statusEl.innerText = `✓ Preset: ${btn.innerText}`;
      });
    });
  }

  // --- GENERIC CRUD MODAL CONTROLLER ---
  openAddModal(type) {
    this.activeModalType = type;
    this.editingItem = null;
    this._showModalForm(type);
  }

  openEditProductModal(type, itemId) {
    this.activeModalType = type;
    let item = null;

    if (type === 'bot') item = store.getBots().find(b => b.id === itemId);
    else if (type === 'book') item = store.getBooks().find(b => b.id === itemId);
    else if (type === 'course') item = store.getCourses().find(c => c.id === itemId);
    else if (type === 'premium') item = store.getPremium().find(p => p.id === itemId);

    if (!item) return;
    this.editingItem = item;
    this._showModalForm(type);
  }

  openEditPaymentModal(payId) {
    this.activeModalType = 'payment';
    const item = store.getPaymentMethods().find(m => m.id === payId);
    if (!item) return;
    this.editingItem = item;
    this._showModalForm('payment');
  }

  _showModalForm(type) {
    const modal = document.getElementById('adminGenericModal');
    const title = document.getElementById('adminModalTitle');
    const body = document.getElementById('adminModalDynamicBody');
    const item = this.editingItem;
    const isEdit = !!item;
    const presets = store.getCuratedPresets();

    if (modal) modal.classList.add('active');

    if (type === 'bot') {
      title.innerText = isEdit ? "Edit TradingView Bot / Indicator" : "Add New TradingView Bot / Indicator";
      const currentFeatures = (item?.features || ["Non-Repainting Signals", "Dynamic Stop Loss & Take Profit", "TradingView Alert Ready"]).join('\n');

      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Indicator / Bot Title *</label>
          <input type="text" id="m_bot_title" class="form-input" required 
            placeholder="e.g. Apex Scalper v4 Pro (TradingView Indicator)" 
            value="${isEdit ? sanitize(item.title) : ''}" />
          <div class="form-hint">Display title that appears in customer catalog and search results.</div>
        </div>

        <div class="form-group" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label class="form-label">Category</label>
            <select id="m_bot_cat" class="form-input">
              <option value="scalping" ${isEdit && item.category === 'scalping' ? 'selected' : ''}>Scalping</option>
              <option value="smc" ${isEdit && item.category === 'smc' ? 'selected' : ''}>Smart Money Concepts (SMC)</option>
              <option value="swing" ${isEdit && item.category === 'swing' ? 'selected' : ''}>Swing Trading</option>
              <option value="priceaction" ${isEdit && item.category === 'priceaction' ? 'selected' : ''}>Price Action</option>
            </select>
          </div>
          <div>
            <label class="form-label">Display Badge / Tag</label>
            <input type="text" id="m_bot_badge" class="form-input" 
              placeholder="e.g. 🔥 HOT or Scalping Beast or New" 
              value="${isEdit ? sanitize(item.badge || '') : '🔥 Top Rated'}" />
          </div>
        </div>

        <div class="form-group" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label class="form-label">Target Markets</label>
            <input type="text" id="m_bot_market" class="form-input" 
              placeholder="e.g. Crypto & Forex (BTC, ETH, Gold, EURUSD)" 
              value="${isEdit ? sanitize(item.market || '') : 'Crypto, Forex & Gold'}" />
          </div>
          <div>
            <label class="form-label">Recommended Timeframes</label>
            <input type="text" id="m_bot_tf" class="form-input" 
              placeholder="e.g. 1m, 5m, 15m (Scalping & Intraday)" 
              value="${isEdit ? sanitize(item.timeframe || '') : '1m - 5m - 15m'}" />
          </div>
        </div>

        <div class="form-group" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label class="form-label">Win Rate %</label>
            <input type="text" id="m_bot_win" class="form-input" 
              placeholder="e.g. 84.5% Backtested" 
              value="${isEdit ? sanitize(item.winRate || '') : '82.5%'}" />
          </div>
          <div>
            <label class="form-label">Access Model</label>
            <select id="m_bot_isFree" class="form-input">
              <option value="true" ${!isEdit || item.isFree ? 'selected' : ''}>Free Script (Direct TradingView Access)</option>
              <option value="false" ${isEdit && !item.isFree ? 'selected' : ''}>VIP Premium Algo (Requires License)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">TradingView Script URL *</label>
          <input type="url" id="m_bot_link" class="form-input" required 
            placeholder="https://www.tradingview.com/script/xyz-apex-scalper/" 
            value="${isEdit ? sanitize(item.tradingViewLink || '') : ''}" />
          <div class="form-hint">Customer clicking 'Open TradingView' will be redirected to this link.</div>
        </div>

        ${this.renderImagePickerControl(
          'm_bot_logo', 
          isEdit ? item.logo : '', 
          'Indicator Logo / Thumbnail *', 
          'Select from your mobile/laptop gallery, paste an image URL, or choose a curated chart preset.',
          presets
        )}

        <div class="form-group">
          <label class="form-label">Core Features & Signals (1 Feature per line)</label>
          <textarea id="m_bot_features" class="form-input" rows="3" 
            placeholder="Har line me aik feature likhein:&#10;Non-Repainting Real-Time Buy/Sell Signals&#10;Automated Dynamic Stop Loss & Take Profit Levels&#10;Mobile Notification & Sound Alerts">${sanitize(currentFeatures)}</textarea>
          <div class="form-hint">Har line website par alag bullet point / badge ban kar show hogi.</div>
        </div>

        <div class="form-group">
          <label class="form-label">Strategy Overview & Rules</label>
          <textarea id="m_bot_desc" class="form-input" rows="3" 
            placeholder="Strategy k rules, entry criteria, aur confirmation indicators explain karein...">${isEdit ? sanitize(item.description || '') : ''}</textarea>
        </div>
      `;

      this.bindImagePickerEvents('m_bot_logo');

    } else if (type === 'book') {
      title.innerText = isEdit ? "Edit Trading Book / PDF" : "Add New Trading Book / PDF";
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Book Title *</label>
          <input type="text" id="m_book_title" class="form-input" required 
            placeholder="e.g. Price Action Secrets & Candlestick Bible (Urdu/English)" 
            value="${isEdit ? sanitize(item.title) : ''}" />
        </div>

        <div class="form-group" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label class="form-label">Author / Creator</label>
            <input type="text" id="m_book_author" class="form-input" 
              placeholder="e.g. Senior Market Technician" 
              value="${isEdit ? sanitize(item.author || '') : 'Senior Market Technician'}" />
          </div>
          <div>
            <label class="form-label">Pages / Volume</label>
            <input type="text" id="m_book_pages" class="form-input" 
              placeholder="e.g. 185 Pages (High-Definition PDF)" 
              value="${isEdit ? sanitize(item.pages || '') : '180 Pages'}" />
          </div>
        </div>

        <div class="form-group" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label class="form-label">Rating</label>
            <input type="text" id="m_book_rating" class="form-input" 
              placeholder="e.g. 4.9 / 5.0" 
              value="${isEdit ? sanitize(item.rating || '') : '4.9 / 5.0'}" />
          </div>
          <div>
            <label class="form-label">Category</label>
            <input type="text" id="m_book_cat" class="form-input" 
              placeholder="e.g. Price Action, Psychology, SMC" 
              value="${isEdit ? sanitize(item.category || '') : 'Price Action'}" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">PDF Download / Google Drive Link *</label>
          <input type="url" id="m_book_link" class="form-input" required 
            placeholder="https://drive.google.com/file/d/.../view?usp=sharing" 
            value="${isEdit ? sanitize(item.downloadLink || '') : ''}" />
          <div class="form-hint">Ensure Google Drive file permission is set to 'Anyone with the link can view'.</div>
        </div>

        ${this.renderImagePickerControl(
          'm_book_cover', 
          isEdit ? item.cover : '', 
          'Book Cover Image *', 
          'Upload book cover image from your mobile gallery or choose a preset below.',
          presets
        )}

        <div class="form-group">
          <label class="form-label">Book Summary & Overview</label>
          <textarea id="m_book_desc" class="form-input" rows="3" 
            placeholder="Kitab k topics (SMC, Wyckoff, Order Blocks, Liquidity Sweeps) detail se likhein...">${isEdit ? sanitize(item.description || '') : ''}</textarea>
        </div>
      `;

      this.bindImagePickerEvents('m_book_cover');

    } else if (type === 'course') {
      title.innerText = isEdit ? "Edit Trading Mentorship Course" : "Add New Trading Mentorship Course";
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Course Title *</label>
          <input type="text" id="m_course_title" class="form-input" required 
            placeholder="e.g. Institutional ICT & Smart Money Masterclass 2026" 
            value="${isEdit ? sanitize(item.title) : ''}" />
        </div>

        <div class="form-group" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label class="form-label">Instructor / Mentor</label>
            <input type="text" id="m_course_inst" class="form-input" 
              placeholder="e.g. Senior Quantitative Mentor" 
              value="${isEdit ? sanitize(item.instructor || '') : 'Senior Quantitative Mentor'}" />
          </div>
          <div>
            <label class="form-label">Duration / Video Length</label>
            <input type="text" id="m_course_dur" class="form-input" 
              placeholder="e.g. 18 Hours (Full Video Series)" 
              value="${isEdit ? sanitize(item.duration || '') : '16 Hours'}" />
          </div>
        </div>

        <div class="form-group" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label class="form-label">Skill Level</label>
            <select id="m_course_lvl" class="form-input">
              <option value="All Levels" ${!isEdit || item.level === 'All Levels' ? 'selected' : ''}>All Levels (Zero to Hero)</option>
              <option value="Beginner" ${isEdit && item.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
              <option value="Advanced" ${isEdit && item.level === 'Advanced' ? 'selected' : ''}>Advanced / Institutional</option>
            </select>
          </div>
          <div>
            <label class="form-label">Badge</label>
            <input type="text" id="m_course_badge" class="form-input" 
              placeholder="e.g. 🎓 Complete Masterclass" 
              value="${isEdit ? sanitize(item.badge || '') : '🎓 Complete Masterclass'}" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Video Access Link / Playlist URL *</label>
          <input type="url" id="m_course_link" class="form-input" required 
            placeholder="https://youtube.com/playlist?list=... ya Google Drive video folder link" 
            value="${isEdit ? sanitize(item.accessLink || '') : ''}" />
          <div class="form-hint">YouTube Playlist, Google Drive Video Folder ya private hosting link.</div>
        </div>

        ${this.renderImagePickerControl(
          'm_course_thumb', 
          isEdit ? item.thumbnail : '', 
          'Course Thumbnail Image *', 
          'Upload course thumbnail banner from mobile or laptop or choose a preset.',
          presets
        )}

        <div class="form-group">
          <label class="form-label">Course Description & Syllabus</label>
          <textarea id="m_course_desc" class="form-input" rows="3" 
            placeholder="Course syllabus, strategy breakdown, aur students k liye learning path detail karein...">${isEdit ? sanitize(item.description || '') : ''}</textarea>
        </div>
      `;

      this.bindImagePickerEvents('m_course_thumb');

    } else if (type === 'premium') {
      title.innerText = isEdit ? "Edit VIP Premium Script / Suite" : "Add New VIP Premium Script / Suite";
      const currentFeatures = (item?.features || [
        "Private Invite-Only PineScript Access",
        "Non-Repainting Multi-Confluence Algorithm",
        "Automated Dynamic Risk-Reward Levels",
        "Lifetime Access & VIP WhatsApp Support"
      ]).join('\n');

      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">VIP Algorithm Title *</label>
          <input type="text" id="m_prem_title" class="form-input" required 
            placeholder="e.g. APEX ALGO VIP - Institutional Suite (Invite-Only)" 
            value="${isEdit ? sanitize(item.title) : ''}" />
        </div>

        <div class="form-group">
          <label class="form-label">Product Tagline</label>
          <input type="text" id="m_prem_tagline" class="form-input" 
            placeholder="e.g. Automated Multi-Confluence Engine with Proprietary Order Flow" 
            value="${isEdit ? sanitize(item.tagline || '') : ''}" />
        </div>

        <div class="form-group" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label class="form-label">Price in USD ($) *</label>
            <input type="number" id="m_prem_usd" class="form-input" required 
              placeholder="49" 
              value="${isEdit ? item.priceUSD || '' : '49'}" />
          </div>
          <div>
            <label class="form-label">Price in PKR (₨) *</label>
            <input type="number" id="m_prem_pkr" class="form-input" required 
              placeholder="13500" 
              value="${isEdit ? item.pricePKR || '' : '13500'}" />
          </div>
        </div>

        <div class="form-group" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label class="form-label">Backtested Win Rate %</label>
            <input type="text" id="m_prem_win" class="form-input" 
              placeholder="e.g. 88.5% Verified" 
              value="${isEdit ? sanitize(item.winRate || '') : '88.5%'}" />
          </div>
          <div>
            <label class="form-label">License Key Protection</label>
            <select id="m_prem_req_key" class="form-input">
              <option value="true" selected>Protected by VIP Key (Customer receives key on payment)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">TradingView Private Invite Link *</label>
          <input type="url" id="m_prem_link" class="form-input" required 
            placeholder="https://www.tradingview.com/script/... (Private Invite link)" 
            value="${isEdit ? sanitize(item.scriptLink || '') : ''}" />
          <div class="form-hint">This link is revealed ONLY when the customer verifies their VIP Password key.</div>
        </div>

        ${this.renderImagePickerControl(
          'm_prem_banner', 
          isEdit ? item.banner : '', 
          'VIP Product Banner / Mockup *', 
          'Upload screenshot of chart or high-res algorithm banner.',
          presets
        )}

        <div class="form-group">
          <label class="form-label">VIP Feature List (1 Feature per line)</label>
          <textarea id="m_prem_features" class="form-input" rows="4" 
            placeholder="Har line me aik VIP feature likhein:&#10;Private Invite-Only PineScript Access&#10;Zero Repaint Algorithm with Confluence Filters&#10;Lifetime Access & VIP WhatsApp Support">${sanitize(currentFeatures)}</textarea>
          <div class="form-hint">Har line customer k samne green checkmark feature ban kr display hogi.</div>
        </div>
      `;

      this.bindImagePickerEvents('m_prem_banner');

    } else if (type === 'payment') {
      title.innerText = isEdit ? "Edit Payment Method" : "Add Payment Method";
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Payment Platform Name *</label>
          <input type="text" id="m_pay_platform" class="form-input" required 
            placeholder="e.g. JazzCash, EasyPaisa, Binance Pay (USDT TRC20), Nayapay, Bank Alfalah" 
            value="${isEdit ? sanitize(item.platform) : ''}" />
        </div>

        <div class="form-group">
          <label class="form-label">Account Number / Wallet Address *</label>
          <input type="text" id="m_pay_number" class="form-input" required 
            placeholder="e.g. 03001234567 ya TRC20 Wallet Address" 
            value="${isEdit ? sanitize(item.accountNumber) : ''}" />
          <div class="form-hint">Customer can click 'Copy' to copy this number instantly.</div>
        </div>

        <div class="form-group">
          <label class="form-label">Account Title / Beneficiary Name (Optional)</label>
          <input type="text" id="m_pay_title" class="form-input" 
            placeholder="e.g. Muhammad Raza (Customer ko confirm krny k liye)" 
            value="${isEdit ? sanitize(item.accountTitle || '') : ''}" />
        </div>

        <div class="form-group">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" id="m_pay_show_title" ${!isEdit || item.showTitle ? 'checked' : ''} style="accent-color: var(--admin-accent); width:18px; height:18px;" />
            <span style="font-size:0.85rem; color:#fff;">
              <strong>Show Account Title to Buyers</strong> (Uncheck to hide title completely)
            </span>
          </label>
        </div>

        ${this.renderImagePickerControl(
          'm_pay_qr', 
          isEdit ? item.qrCode : '', 
          'Payment QR Code Image (Optional)', 
          'Upload your JazzCash/EasyPaisa/Binance QR Code screenshot from mobile gallery so customers can scan and pay.',
          []
        )}

        <div class="form-group">
          <label class="form-label">Payment Instructions for Buyers</label>
          <textarea id="m_pay_instr" class="form-input" rows="2" 
            placeholder="e.g. Payment send krny k bad screenshot WhatsApp par attach karein. 10 minute k andar VIP password provide kr diya jaye ga.">${isEdit ? sanitize(item.instructions || '') : ''}</textarea>
        </div>
      `;

      this.bindImagePickerEvents('m_pay_qr');

    } else if (type === 'socialLink') {
      title.innerText = isEdit ? "Edit Channel Link" : "Add New Channel Link";
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Platform Type *</label>
          <select id="m_social_platform" class="form-input" style="background:#0d1322; border:1px solid var(--admin-border); color:#fff; padding:10px; width:100%; border-radius:6px;">
            <option value="telegram" ${isEdit && item.platform === 'telegram' ? 'selected' : ''}>Telegram Channel / Group</option>
            <option value="whatsapp" ${isEdit && item.platform === 'whatsapp' ? 'selected' : ''}>WhatsApp VIP Broadcast / Channel</option>
            <option value="youtube" ${isEdit && item.platform === 'youtube' ? 'selected' : ''}>YouTube Channel</option>
            <option value="discord" ${isEdit && item.platform === 'discord' ? 'selected' : ''}>Discord Community</option>
            <option value="instagram" ${isEdit && item.platform === 'instagram' ? 'selected' : ''}>Instagram Profile</option>
            <option value="twitter" ${isEdit && item.platform === 'twitter' ? 'selected' : ''}>Twitter / X</option>
            <option value="tiktok" ${isEdit && item.platform === 'tiktok' ? 'selected' : ''}>TikTok Profile</option>
            <option value="custom" ${isEdit && item.platform === 'custom' ? 'selected' : ''}>Custom Web Link</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Channel Display Name / Title *</label>
          <input type="text" id="m_social_title" class="form-input" required placeholder="e.g. Join Official Telegram VIP Channel" value="${isEdit ? sanitize(item.title) : ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Channel Link / URL *</label>
          <input type="url" id="m_social_url" class="form-input" required placeholder="https://t.me/your_channel" value="${isEdit ? sanitize(item.url) : ''}" />
        </div>
        <div class="form-group">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" id="m_social_active" ${!isEdit || item.active !== false ? 'checked' : ''} style="accent-color: var(--admin-accent); width:18px; height:18px;" />
            <span style="font-size:0.88rem; color:#fff;"><strong>Active (Shown & Required on Gatekeeper)</strong> — Uncheck to hide without deleting ("aik hide kr skoon")</span>
          </label>
        </div>
      `;
    }
  }

  saveGenericModal() {
    const type = this.activeModalType;

    if (type === 'bot') {
      const title = document.getElementById('m_bot_title')?.value.trim();
      if (!title) return alert("Bot / Indicator title is required!");

      const featuresRaw = document.getElementById('m_bot_features')?.value || '';
      const features = featuresRaw
        .split('\n')
        .map(s => s.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);

      store.saveBot({
        id: this.editingItem ? this.editingItem.id : undefined,
        title: title,
        category: document.getElementById('m_bot_cat')?.value || 'scalping',
        badge: document.getElementById('m_bot_badge')?.value.trim() || '🔥 Top Rated',
        market: document.getElementById('m_bot_market')?.value.trim() || 'Crypto, Forex & Gold',
        timeframe: document.getElementById('m_bot_tf')?.value.trim() || 'All Timeframes',
        winRate: document.getElementById('m_bot_win')?.value.trim() || '80%',
        isFree: document.getElementById('m_bot_isFree')?.value === 'true',
        tradingViewLink: document.getElementById('m_bot_link')?.value.trim() || '#',
        logo: document.getElementById('m_bot_logo')?.value.trim() || 'logo.svg',
        features: features.length > 0 ? features : ["Non-Repainting Signals", "TradingView Alert Ready"],
        description: document.getElementById('m_bot_desc')?.value.trim() || 'Professional quantitative TradingView script.'
      });

    } else if (type === 'book') {
      const title = document.getElementById('m_book_title')?.value.trim();
      if (!title) return alert("Book title is required!");

      store.saveBook({
        id: this.editingItem ? this.editingItem.id : undefined,
        title: title,
        author: document.getElementById('m_book_author')?.value.trim() || 'Senior Trader',
        pages: document.getElementById('m_book_pages')?.value.trim() || '150 Pages',
        rating: document.getElementById('m_book_rating')?.value.trim() || '4.9 / 5.0',
        category: document.getElementById('m_book_cat')?.value.trim() || 'Trading',
        downloadLink: document.getElementById('m_book_link')?.value.trim() || '#',
        cover: document.getElementById('m_book_cover')?.value.trim() || 'logo.svg',
        description: document.getElementById('m_book_desc')?.value.trim() || 'Essential trading guide and playbook.',
        fileType: 'PDF eBook'
      });

    } else if (type === 'course') {
      const title = document.getElementById('m_course_title')?.value.trim();
      if (!title) return alert("Course title is required!");

      store.saveCourse({
        id: this.editingItem ? this.editingItem.id : undefined,
        title: title,
        instructor: document.getElementById('m_course_inst')?.value.trim() || 'Senior Mentor',
        duration: document.getElementById('m_course_dur')?.value.trim() || '10 Hours',
        level: document.getElementById('m_course_lvl')?.value || 'All Levels',
        badge: document.getElementById('m_course_badge')?.value.trim() || '🎓 Masterclass',
        accessLink: document.getElementById('m_course_link')?.value.trim() || '#',
        thumbnail: document.getElementById('m_course_thumb')?.value.trim() || 'logo.svg',
        description: document.getElementById('m_course_desc')?.value.trim() || 'Comprehensive trading educational curriculum.'
      });

    } else if (type === 'premium') {
      const title = document.getElementById('m_prem_title')?.value.trim();
      if (!title) return alert("VIP algorithm title is required!");

      const featuresRaw = document.getElementById('m_prem_features')?.value || '';
      const features = featuresRaw
        .split('\n')
        .map(s => s.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);

      store.savePremium({
        id: this.editingItem ? this.editingItem.id : undefined,
        title: title,
        tagline: document.getElementById('m_prem_tagline')?.value.trim() || 'Next-Gen Quantitative Suite',
        priceUSD: parseFloat(document.getElementById('m_prem_usd')?.value) || 49,
        pricePKR: parseFloat(document.getElementById('m_prem_pkr')?.value) || 13500,
        winRate: document.getElementById('m_prem_win')?.value.trim() || '88%',
        scriptLink: document.getElementById('m_prem_link')?.value.trim() || '#',
        banner: document.getElementById('m_prem_banner')?.value.trim() || 'logo.svg',
        features: features.length > 0 ? features : [
          "Private Invite-Only PineScript Access",
          "Zero Repaint Algorithm with Confluence Filters",
          "Lifetime Access & VIP WhatsApp Support"
        ],
        requiresKey: true
      });

    } else if (type === 'payment') {
      const platform = document.getElementById('m_pay_platform')?.value.trim();
      const num = document.getElementById('m_pay_number')?.value.trim();
      const title = document.getElementById('m_pay_title')?.value.trim();
      const showTitle = document.getElementById('m_pay_show_title')?.checked;
      const qrCode = document.getElementById('m_pay_qr')?.value.trim() || '';

      if (!platform || !num) return alert("Platform Name and Account Number are required!");

      store.savePaymentMethod({
        id: this.editingItem ? this.editingItem.id : undefined,
        platform: platform,
        accountNumber: num,
        accountTitle: title,
        showTitle: !!(showTitle && title),
        qrCode: qrCode,
        instructions: document.getElementById('m_pay_instr')?.value.trim() || '',
        active: true
      });

    } else if (type === 'socialLink') {
      const platform = document.getElementById('m_social_platform')?.value;
      const title = document.getElementById('m_social_title')?.value.trim();
      const url = document.getElementById('m_social_url')?.value.trim();
      const active = document.getElementById('m_social_active')?.checked;

      if (!title || !url) return alert("Title and Channel URL are required!");

      store.saveSocialLink({
        id: this.editingItem ? this.editingItem.id : undefined,
        platform: platform || 'telegram',
        title: title,
        url: url,
        active: active !== false
      });
    }

    this.closeModals();
    this.showToast("Item saved successfully with all custom settings!", "success");
    this.renderCurrentSection();
  }

  deleteItem(type, id) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    if (type === 'bot') store.deleteBot(id);
    if (type === 'book') store.deleteBook(id);
    if (type === 'course') store.deleteCourse(id);
    if (type === 'premium') store.deletePremium(id);
    this.showToast("Item deleted.", "info");
    this.renderCurrentSection();
  }

  deletePaymentMethod(id) {
    if (!confirm("Delete this payment method?")) return;
    store.deletePaymentMethod(id);
    this.showToast("Payment method deleted.", "info");
    this.renderPaymentsTable();
  }

  // --- EVENT BINDING ---
  bindEvents() {
    // Login Form Submit
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('adminLoginUser').value;
        const p = document.getElementById('adminLoginPass').value;
        if (!this.login(u, p)) {
          alert("Invalid username or password! (Default: admin / admin)");
        }
      });
    }

    // Logout
    const logoutBtn = document.getElementById('btnAdminLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Sidebar Nav
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchSection(btn.dataset.section);
      });
    });

    // Create Site Access Password Form
    const newPwdForm = document.getElementById('formNewSitePassword');
    if (newPwdForm) {
      newPwdForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = document.getElementById('newSitePasswordVal').value;
        const limit = document.getElementById('newSitePasswordLimit').value;
        const note = document.getElementById('newSitePasswordNote').value;
        this.createNewSitePassword(pwd, limit, note);
        newPwdForm.reset();
      });
    }

    // Generate Random Password Helper
    const genPwdBtn = document.getElementById('btnGenRandomPassword');
    if (genPwdBtn) {
      genPwdBtn.addEventListener('click', () => {
        const input = document.getElementById('newSitePasswordVal');
        if (input) {
          input.value = 'STORE-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.floor(10 + Math.random() * 90);
        }
      });
    }

    // Generate Random VIP Key Helper
    const genPremKeyBtn = document.getElementById('btnGenRandomPremKey');
    if (genPremKeyBtn) {
      genPremKeyBtn.addEventListener('click', () => {
        const input = document.getElementById('newPremKeyVal');
        if (input) {
          input.value = 'VIP-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
        }
      });
    }

    // Create Premium Key Form (Full Page Access)
    const newPremKeyForm = document.getElementById('formNewPremiumKey');
    if (newPremKeyForm) {
      newPremKeyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const key = document.getElementById('newPremKeyVal').value.trim();
        const customer = document.getElementById('newPremKeyCustomer').value.trim();
        const note = document.getElementById('newPremKeyNote')?.value.trim() || '';

        if (!key) return alert("Key is required!");
        store.savePremiumPassword({
          key: key,
          assignedTo: customer,
          note: note,
          status: 'active'
        });

        this.showToast("VIP Premium Password created (Full Page Access)!", "success");
        newPremKeyForm.reset();
        this.renderPremiumKeysTable();
      });
    }

    // Mobile Sidebar Drawer Toggle
    const mobileToggle = document.getElementById('btnAdminMobileNavToggle');
    const adminSidebar = document.querySelector('.admin-sidebar');
    const adminBackdrop = document.getElementById('adminSidebarBackdrop');

    if (mobileToggle && adminSidebar && adminBackdrop) {
      mobileToggle.addEventListener('click', () => {
        adminSidebar.classList.toggle('mobile-open');
        adminBackdrop.classList.toggle('active');
      });

      adminBackdrop.addEventListener('click', () => {
        adminSidebar.classList.remove('mobile-open');
        adminBackdrop.classList.remove('active');
      });

      // Close mobile drawer on nav item click
      document.querySelectorAll('.nav-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          adminSidebar.classList.remove('mobile-open');
          adminBackdrop.classList.remove('active');
        });
      });
    }

    // Gatekeeper Settings Form Submit
    const gkForm = document.getElementById('gatekeeperSettingsForm');
    if (gkForm) {
      gkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enabled = document.getElementById('gkConfigEnabled')?.checked;
        const socialReq = document.getElementById('gkConfigSocialReq')?.checked;
        const passReq = document.getElementById('gkConfigPasswordReq')?.checked;
        const stealthSec = parseInt(document.getElementById('gkConfigStealthSec')?.value, 10) || 8;

        store.saveGatekeeperConfig({
          enabled: enabled !== false,
          socialVerificationRequired: socialReq !== false,
          passwordUnlockRequired: passReq !== false,
          minEngagementSeconds: stealthSec
        });

        this.showToast("Gatekeeper rules saved successfully!", "success");
        this.renderSocialLinksSection();
      });
    }

    // Branding Settings Form Submit
    const settingsForm = document.getElementById('siteSettingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettingsFromForm();
      });
    }

    // Admin Credentials Form Submit (Anti-Hack)
    const credForm = document.getElementById('adminCredentialsForm');
    if (credForm) {
      credForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveAdminCredentials();
      });
    }

    // Add Button Listeners (sidebar buttons call these)
    const addBotBtn = document.getElementById('btnAddBot');
    const addBookBtn = document.getElementById('btnAddBook');
    const addCourseBtn = document.getElementById('btnAddCourse');
    const addPremBtn = document.getElementById('btnAddPremium');
    const addPayBtn = document.getElementById('btnAddPayment');
    const addSocialBtn = document.getElementById('btnAddSocialLink');
    const viewAllOrdersBtn = document.getElementById('btnViewAllOrders');
    const saveModalBtn = document.getElementById('btnSaveModal');

    if (addBotBtn) addBotBtn.addEventListener('click', () => this.openAddModal('bot'));
    if (addBookBtn) addBookBtn.addEventListener('click', () => this.openAddModal('book'));
    if (addCourseBtn) addCourseBtn.addEventListener('click', () => this.openAddModal('course'));
    if (addPremBtn) addPremBtn.addEventListener('click', () => this.openAddModal('premium'));
    if (addPayBtn) addPayBtn.addEventListener('click', () => this.openAddModal('payment'));
    if (addSocialBtn) addSocialBtn.addEventListener('click', () => this.openAddModal('socialLink'));
    if (viewAllOrdersBtn) viewAllOrdersBtn.addEventListener('click', () => this.switchSection('orders'));
    if (saveModalBtn) saveModalBtn.addEventListener('click', () => this.saveGenericModal());

    // Modal Close
    document.querySelectorAll('.modal-close-btn').forEach(b => {
      b.addEventListener('click', () => this.closeModals());
    });
  }

  closeModals() {
    document.querySelectorAll('.admin-modal-overlay, .screenshot-preview-modal').forEach(m => {
      m.classList.remove('active');
    });
  }

  copyText(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.showToast("Copied: " + text, "info");
    }
  }

  showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ️'}</span><span>${sanitize(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.adminPanel = new AdminPanel();
});
