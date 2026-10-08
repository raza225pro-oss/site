/**
 * TRADINGSTORE - Master Admin Panel Controller
 * Free & Premium Catalog Management (MediaFire & Google Drive Links)
 * Lock 1: Site Entry Lock (Passcodes & 8s Community Channels)
 * Lock 2: Premium Page Lock (VIP Keys & Lock Toggle)
 * Payment Accounts & Customer Orders Inbox (Gmail Must & Screenshot Inspector)
 */

import { store } from './store.js';

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

    this.loginAttempts++;
    if (this.loginAttempts >= 5) {
      this.loginLockoutUntil = now + 10 * 60 * 1000;
      this.showToast("Too many failed attempts! Locked for 10 minutes.", "error");
    } else {
      this.showToast("Invalid username or password.", "error");
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
        bots: "Manage Free Trading Bots",
        books: "Manage Free Trading Books",
        courses: "Manage Free Courses",
        premBots: "Manage Premium Bots (VIP)",
        premBooks: "Manage Premium Books (VIP)",
        premCourses: "Manage Premium Courses (VIP)",
        siteEntryLock: "Lock 1: Site Entry Lock (Gatekeeper)",
        premiumPageLock: "Lock 2: Premium Page Lock",
        payments: "Payment Accounts (JazzCash, EasyPaisa, TRC20, Bank)",
        orders: "Customer Orders & Payment Proof Inbox",
        settings: "Site Settings & Admin Security"
      };
      topbarTitle.innerText = titles[sectionId] || "Control Panel";
    }

    // Close mobile menu if open
    const sidebar = document.querySelector('.admin-sidebar');
    const backdrop = document.getElementById('adminSidebarBackdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');

    this.renderCurrentSection();
  }

  renderCurrentSection() {
    switch (this.currentSection) {
      case 'dashboard':
        this.renderStats();
        this.renderRecentOrdersTable();
        break;
      case 'bots':
        this.renderCatalogTable('bots', 'botsTableBody', 'bot');
        break;
      case 'books':
        this.renderCatalogTable('books', 'booksTableBody', 'book');
        break;
      case 'courses':
        this.renderCatalogTable('courses', 'coursesTableBody', 'course');
        break;
      case 'premBots':
        this.renderCatalogTable('premiumBots', 'premBotsTableBody', 'premBot');
        break;
      case 'premBooks':
        this.renderCatalogTable('premiumBooks', 'premBooksTableBody', 'premBook');
        break;
      case 'premCourses':
        this.renderCatalogTable('premiumCourses', 'premCoursesTableBody', 'premCourse');
        break;
      case 'siteEntryLock':
        this.renderSiteEntryLockSection();
        break;
      case 'premiumPageLock':
        this.renderPremiumPageLockSection();
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

  // --- STATS OVERVIEW ---
  renderStats() {
    const bots = store.getBots();
    const books = store.getBooks();
    const courses = store.getCourses();
    const premBots = store.getPremiumBots();
    const premBooks = store.getPremiumBooks();
    const premCourses = store.getPremiumCourses();
    const orders = store.getOrders();
    const sitePasswords = store.getSitePasswords();
    const premPasswords = store.getPremiumPasswords();

    const elBots = document.getElementById('statBotsCount');
    const elBooks = document.getElementById('statBooksCount');
    const elCourses = document.getElementById('statCoursesCount');
    const elPremBots = document.getElementById('statPremBotsCount');
    const elPremBooks = document.getElementById('statPremBooksCount');
    const elPremCourses = document.getElementById('statPremCoursesCount');
    const elPending = document.getElementById('statPendingOrdersCount');
    const elPasswords = document.getElementById('statPasswordsCount');
    const elPremKeys = document.getElementById('statPremKeysCount');
    const orderBadge = document.getElementById('navOrdersBadge');

    const pendingCount = orders.filter(o => o.status === 'pending').length;

    if (elBots) elBots.innerText = bots.length;
    if (elBooks) elBooks.innerText = books.length;
    if (elCourses) elCourses.innerText = courses.length;
    if (elPremBots) elPremBots.innerText = premBots.length;
    if (elPremBooks) elPremBooks.innerText = premBooks.length;
    if (elPremCourses) elPremCourses.innerText = premCourses.length;
    if (elPending) elPending.innerText = pendingCount;
    if (elPasswords) elPasswords.innerText = sitePasswords.length;
    if (elPremKeys) elPremKeys.innerText = premPasswords.length;

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
      container.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-dim); padding:20px;">No customer orders received yet.</td></tr>`;
      return;
    }

    container.innerHTML = orders.map(ord => `
      <tr>
        <td><strong style="font-family: var(--font-code); color: var(--admin-cyan);">${sanitize(ord.id)}</strong></td>
        <td><span style="color:var(--admin-gold); font-weight:600;">${sanitize(ord.gmail || 'N/A')}</span></td>
        <td>${sanitize(ord.contactNumber)}</td>
        <td>${sanitize(ord.platform)}</td>
        <td><span class="badge-tag ${ord.status}">${sanitize(ord.status).toUpperCase()}</span></td>
        <td>
          <button class="btn-sm-view" data-action="view-screenshot" data-id="${sanitize(ord.id)}">
            🔍 Screenshot
          </button>
        </td>
      </tr>
    `).join('');

    container.querySelectorAll('[data-action="view-screenshot"]').forEach(btn => {
      btn.addEventListener('click', () => this.inspectScreenshot(btn.dataset.id));
    });
  }

  // --- REUSABLE CATALOG TABLE RENDERER (BOTS, BOOKS, COURSES, PREM BOTS, PREM BOOKS, PREM COURSES) ---
  renderCatalogTable(storeKey, tableBodyId, type) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;

    let items = [];
    if (storeKey === 'bots') items = store.getBots();
    else if (storeKey === 'books') items = store.getBooks();
    else if (storeKey === 'courses') items = store.getCourses();
    else if (storeKey === 'premiumBots') items = store.getPremiumBots();
    else if (storeKey === 'premiumBooks') items = store.getPremiumBooks();
    else if (storeKey === 'premiumCourses') items = store.getPremiumCourses();

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-dim); padding:24px;">No items in this category yet. Click the Add button above to add one!</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(item => {
      const logoSrc = sanitize(item.logo || item.cover || item.thumbnail || 'logo.svg');
      const directLink = sanitize(item.downloadLink || item.tradingViewLink || item.accessLink || '#');
      const title = sanitize(item.title);
      const cat = sanitize(item.category || 'General');

      return `
        <tr>
          <td>
            <img src="${logoSrc}" alt="${title}" style="width:42px; height:42px; border-radius:8px; object-fit:cover; background:#000; border:1px solid var(--admin-border);" onerror="this.src='logo.svg'" />
          </td>
          <td>
            <strong style="color:#fff; font-size:0.95rem;">${title}</strong>
          </td>
          <td>
            <span style="background:rgba(255,255,255,0.06); padding:3px 8px; border-radius:6px; font-size:0.75rem; color:var(--text-dim);">${cat}</span>
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <a href="${directLink}" target="_blank" rel="noopener noreferrer" style="color:var(--admin-accent); font-family:var(--font-code); font-size:0.8rem; text-decoration:none;">
                ${directLink.length > 36 ? directLink.substring(0, 33) + '...' : directLink}
              </a>
              <button type="button" class="btn-copy-small" data-action="copy-url" data-url="${directLink}">Copy</button>
            </div>
          </td>
          <td>
            <div class="action-btn-group">
              <button class="btn-sm-edit" data-action="edit-item" data-type="${type}" data-id="${sanitize(item.id)}">Edit</button>
              <button class="btn-sm-del" data-action="delete-item" data-type="${type}" data-id="${sanitize(item.id)}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('[data-action="copy-url"]').forEach(btn => {
      btn.addEventListener('click', () => this.copyText(btn.dataset.url));
    });
    tbody.querySelectorAll('[data-action="edit-item"]').forEach(btn => {
      btn.addEventListener('click', () => this.openEditItemModal(btn.dataset.type, btn.dataset.id));
    });
    tbody.querySelectorAll('[data-action="delete-item"]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteItem(btn.dataset.type, btn.dataset.id));
    });
  }

  // --- LOCK 1: SITE ENTRY LOCK SECTION ---
  renderSiteEntryLockSection() {
    const gkConfig = store.getGatekeeperConfig();
    const toggleMaster = document.getElementById('toggleSiteEntryLockMaster');
    const labelMaster = document.getElementById('labelSiteEntryLockState');
    const socialReq = document.getElementById('gkConfigSocialReq');
    const passReq = document.getElementById('gkConfigPasswordReq');
    const stealthSec = document.getElementById('gkConfigStealthSec');

    const isEnabled = gkConfig.enabled !== false && gkConfig.mode !== 'disabled';
    if (toggleMaster) toggleMaster.checked = isEnabled;
    if (labelMaster) {
      labelMaster.innerText = isEnabled ? "Enabled (Active)" : "Disabled (Open Access)";
      labelMaster.style.color = isEnabled ? "var(--admin-accent)" : "var(--admin-red)";
    }
    if (socialReq) socialReq.checked = gkConfig.socialVerificationRequired !== false;
    if (passReq) passReq.checked = gkConfig.passwordUnlockRequired !== false;
    if (stealthSec) stealthSec.value = gkConfig.minEngagementSeconds || 8;

    this.renderSocialLinksTable();
    this.renderSitePasswordsTable();
  }

  renderSocialLinksTable() {
    const tbody = document.getElementById('socialLinksTableBody');
    if (!tbody) return;

    const links = store.getSocialLinks();
    if (!links || links.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-dim); padding:20px;">No community channels configured. Click "+ Add Channel Link" above.</td></tr>`;
      return;
    }

    const platformLabels = {
      telegram: { name: 'Telegram', color: '#2AABEE' },
      whatsapp: { name: 'WhatsApp', color: '#25D366' },
      youtube: { name: 'YouTube', color: '#FF0000' },
      facebook: { name: 'Facebook', color: '#1877F2' },
      custom: { name: 'Custom', color: 'var(--admin-accent)' }
    };

    tbody.innerHTML = links.map(link => {
      const p = (link.platform || 'custom').toLowerCase();
      const meta = platformLabels[p] || platformLabels.custom;
      const isActive = link.active !== false;

      return `
        <tr>
          <td>
            <span style="background:rgba(255,255,255,0.06); border:1px solid ${meta.color}; color:${meta.color}; padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">
              ${meta.name}
            </span>
          </td>
          <td><strong>${sanitize(link.title)}</strong></td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <a href="${sanitize(link.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--admin-accent); font-family:var(--font-code); font-size:0.8rem; text-decoration:none;">
                ${sanitize(link.url.length > 36 ? link.url.substring(0, 33) + '...' : link.url)}
              </a>
              <button type="button" class="btn-copy-small" onclick="window.adminPanel.copyText('${sanitize(link.url)}')">Copy</button>
            </div>
          </td>
          <td>
            <button type="button" class="btn-sm-edit" onclick="window.adminPanel.toggleSocialLink('${sanitize(link.id)}')" 
              style="${isActive 
                ? 'background:rgba(0,242,152,0.15); border-color:var(--admin-accent); color:var(--admin-accent);' 
                : 'background:rgba(255,59,105,0.15); border-color:#ff3b69; color:#ff6b8b;'} padding:4px 10px; font-size:0.78rem; font-weight:700;">
              ${isActive ? '✓ Shown (8s Timer Required)' : '✕ Hidden (Optional)'}
            </button>
          </td>
          <td>
            <div class="action-btn-group">
              <button type="button" class="btn-sm-edit" onclick="window.adminPanel.openEditSocialModal('${sanitize(link.id)}')">Edit</button>
              <button type="button" class="btn-sm-del" onclick="window.adminPanel.deleteSocialLink('${sanitize(link.id)}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderSitePasswordsTable() {
    const tbody = document.getElementById('passwordsTableBody');
    if (!tbody) return;

    const list = store.getSitePasswords();
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-dim); padding:20px;">No site access keys created yet.</td></tr>`;
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
            <span style="font-size:0.8rem; color:var(--text-dim);">${usedCount} device(s) registered</span>
          </td>
          <td><span class="badge-tag ${pwd.status === 'active' ? 'active' : 'rejected'}">${sanitize(pwd.status).toUpperCase()}</span></td>
          <td>
            <div class="action-btn-group">
              <button class="btn-sm-view" data-action="reset-pwd-devices" data-id="${sanitize(pwd.id)}" title="Reset device counter">
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
      btn.addEventListener('click', () => {
        store.resetPasswordDevices(btn.dataset.id);
        this.showToast("Registered devices reset for key.", "success");
        this.renderSitePasswordsTable();
      });
    });
    tbody.querySelectorAll('[data-action="delete-pwd"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm("Delete this site access key?")) {
          store.deleteSitePassword(btn.dataset.id);
          this.showToast("Key deleted.", "info");
          this.renderSitePasswordsTable();
        }
      });
    });
  }

  // --- LOCK 2: PREMIUM PAGE LOCK SECTION ---
  renderPremiumPageLockSection() {
    const isEnabled = store.isPremiumLockEnabled();
    const toggleMaster = document.getElementById('togglePremiumLockMaster');
    const labelMaster = document.getElementById('labelPremiumLockState');

    if (toggleMaster) toggleMaster.checked = isEnabled;
    if (labelMaster) {
      labelMaster.innerText = isEnabled ? "Enabled (VIP Key Required)" : "Disabled (Open VIP Page)";
      labelMaster.style.color = isEnabled ? "var(--admin-gold)" : "var(--admin-accent)";
    }

    this.renderPremiumKeysTable();
  }

  renderPremiumKeysTable() {
    const tbody = document.getElementById('premiumKeysTableBody');
    if (!tbody) return;

    const list = store.getPremiumPasswords();
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-dim); padding:20px;">No VIP premium keys issued yet. Use the form above to generate one.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(k => {
      const cleanContact = (k.assignedTo || '').replace(/[^0-9]/g, '');
      const waLink = cleanContact ? `https://wa.me/${cleanContact}` : '';
      const isEmail = (k.assignedTo || '').includes('@');

      return `
        <tr>
          <td><strong style="font-family:var(--font-code); color:var(--admin-gold); font-size:1.05rem;">${sanitize(k.key)}</strong></td>
          <td>
            ${k.assignedTo ? `
              <div><strong>${sanitize(k.assignedTo)}</strong></div>
              ${cleanContact && !isEmail ? `<a href="${waLink}" target="_blank" style="font-size:0.75rem; color:var(--admin-accent); text-decoration:none;">💬 WhatsApp</a>` : ''}
              ${isEmail ? `<a href="mailto:${sanitize(k.assignedTo)}" style="font-size:0.75rem; color:var(--admin-cyan); text-decoration:none;">✉️ Email</a>` : ''}
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
              <button class="btn-sm-view" data-action="toggle-prem-key" data-id="${sanitize(k.id)}">
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
          this.showToast(`VIP Key status: ${item.status}`, "info");
        }
      });
    });
    tbody.querySelectorAll('[data-action="delete-prem-key"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm("Delete this VIP license key?")) {
          store.deletePremiumPassword(btn.dataset.id);
          this.showToast("VIP key deleted.", "info");
          this.renderPremiumKeysTable();
        }
      });
    });
  }

  // --- PAYMENT METHODS CRUD ---
  renderPaymentsTable() {
    const tbody = document.getElementById('paymentsTableBody');
    if (!tbody) return;

    const list = store.getPaymentMethods();
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-dim); padding:20px;">No payment methods configured. Click "+ Add Payment Method" above.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(m => `
      <tr>
        <td><strong style="color:var(--admin-gold);">${sanitize(m.platform)}</strong></td>
        <td><span style="font-family:var(--font-code); color:var(--admin-cyan); font-weight:700;">${sanitize(m.accountNumber)}</span></td>
        <td>
          ${m.accountTitle ? `<span style="color:#fff; font-weight:600;">${sanitize(m.accountTitle)}</span>` : '<span style="color:var(--text-dim);">(Hidden / Not Set)</span>'}
        </td>
        <td><span class="badge-tag ${m.active !== false ? 'active' : 'rejected'}">${m.active !== false ? 'ACTIVE' : 'DISABLED'}</span></td>
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
      btn.addEventListener('click', () => {
        if (confirm("Delete this payment account?")) {
          store.deletePaymentMethod(btn.dataset.id);
          this.showToast("Payment method deleted.", "info");
          this.renderPaymentsTable();
        }
      });
    });
  }

  // --- ORDERS INBOX (GMAIL MUST, WHATSAPP, SCREENSHOT ZOOM, 1-CLICK APPROVE & KEY) ---
  renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    const orders = store.getOrders();
    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-dim); padding:24px;">No customer orders received yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(ord => {
      const cleanContact = (ord.contactNumber || '').replace(/[^0-9]/g, '');
      const waLink = cleanContact ? `https://wa.me/${cleanContact}` : '';
      const gmail = sanitize(ord.gmail || '');

      return `
        <tr>
          <td><strong style="font-family:var(--font-code); color:var(--admin-cyan);">${sanitize(ord.id)}</strong></td>
          <td>
            ${gmail ? `
              <div style="font-weight:700; color:#fff;">
                <span style="background:rgba(255, 184, 0, 0.15); color:var(--admin-gold); padding:2px 6px; border-radius:4px; font-size:0.7rem; margin-right:4px;">GMAIL</span>
                ${gmail}
              </div>
              <a href="mailto:${gmail}" style="font-size:0.75rem; color:var(--admin-cyan); text-decoration:none;">✉️ Mailto Buyer</a>
            ` : '<span style="color:var(--admin-red);">Missing</span>'}
          </td>
          <td>
            <div style="font-weight:700;">${sanitize(ord.contactNumber)}</div>
            ${cleanContact ? `
              <a href="${waLink}" target="_blank" style="font-size:0.75rem; color:var(--admin-accent); text-decoration:none;">
                💬 Open WhatsApp
              </a>
            ` : ''}
          </td>
          <td><span style="color:var(--admin-gold); font-weight:600;">${sanitize(ord.platform)}</span></td>
          <td>
            <button class="btn-sm-view" data-action="view-screenshot" data-id="${sanitize(ord.id)}">
              🔍 Inspect Proof
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
              ${ord.status !== 'approved' ? `
                <button class="btn-sm-edit" data-action="approve-order" data-id="${sanitize(ord.id)}" style="background:rgba(0,242,152,0.15); border-color:var(--admin-accent); color:var(--admin-accent);" title="Approve payment & issue VIP key">
                  ✓ Approve & Key
                </button>
              ` : `
                <button class="btn-sm-view" data-action="resend-key" data-id="${sanitize(ord.id)}" title="Re-send key details">
                  Send Key
                </button>
              `}
              <button class="btn-sm-del" data-action="reject-order" data-id="${sanitize(ord.id)}" title="Reject order">
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
    tbody.querySelectorAll('[data-action="resend-key"]').forEach(btn => {
      btn.addEventListener('click', () => this.openDispatchPrompt(btn.dataset.id));
    });
    tbody.querySelectorAll('[data-action="reject-order"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm("Reject this order?")) {
          store.updateOrderStatus(btn.dataset.id, 'rejected');
          this.showToast("Order marked as rejected.", "info");
          this.renderOrdersTable();
        }
      });
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

    if (title) title.innerText = `Payment Receipt - ${order.id} (${order.platform})`;
    if (img) img.src = order.screenshot || 'logo.svg';
    if (info) {
      info.innerHTML = `
        <strong>Gmail:</strong> ${sanitize(order.gmail)} &nbsp;|&nbsp;
        <strong>Contact:</strong> ${sanitize(order.contactNumber)} &nbsp;|&nbsp;
        <strong>Payment Platform:</strong> ${sanitize(order.platform)} &nbsp;|&nbsp;
        <strong>Date:</strong> ${new Date(order.submittedAt).toLocaleString()}
        ${order.note ? `<div style="margin-top:6px; color:#fff;"><em>Note:</em> ${sanitize(order.note)}</div>` : ''}
      `;
    }

    if (modal) modal.classList.add('active');
  }

  // --- 1-CLICK APPROVE ORDER & GENERATE VIP KEY ---
  approveAndGenerateKey(orderId) {
    const order = store.getOrders().find(o => o.id === orderId);
    if (!order) return;

    // Generate clean VIP Key
    const randomKey = 'VIP-KEY-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

    // Save key in premium passwords
    store.savePremiumPassword({
      key: randomKey,
      assignedTo: order.gmail || order.contactNumber,
      note: `Order ${order.id} (${order.platform})`,
      status: 'active'
    });

    // Update order status
    store.updateOrderStatus(orderId, 'approved', randomKey);

    this.showToast(`Order approved! Generated VIP Key: ${randomKey}`, "success");
    this.renderOrdersTable();
    this.renderStats();

    // Open dispatch prompt
    this.openDispatchPrompt(orderId);
  }

  openDispatchPrompt(orderId) {
    const order = store.getOrders().find(o => o.id === orderId);
    if (!order || !order.assignedPassword) return;

    const key = order.assignedPassword;
    const cleanNum = (order.contactNumber || '').replace(/[^0-9]/g, '');
    const gmail = order.gmail || '';

    const msgText = `Assalam-o-Alaikum!\n\nAap ka payment proof verify ho gya hai.\n\nAap ka VIP Premium Access Key: *${key}*\n\nWebsite par Premium tab open kr k yeh key enter karein aur تمام VIP Bots, Books aur Courses unlock karein!\nShukriya!`;

    const waUrl = cleanNum ? `https://wa.me/${cleanNum}?text=${encodeURIComponent(msgText)}` : '';
    const mailUrl = gmail ? `mailto:${gmail}?subject=${encodeURIComponent("TradingStore VIP Premium Access Key")}&body=${encodeURIComponent(msgText)}` : '';

    let actionPrompt = `Order ${order.id} Approved!\n\nGenerated VIP Key:\n${key}\n\n`;
    if (cleanNum) actionPrompt += `1. WhatsApp to: ${cleanNum}\n`;
    if (gmail) actionPrompt += `2. Gmail to: ${gmail}\n`;

    if (confirm(actionPrompt + `\nKya aap buyer ko WhatsApp ya Email par message send krna chahte hain?`)) {
      if (cleanNum) {
        window.open(waUrl, '_blank');
      } else if (gmail) {
        window.open(mailUrl, '_blank');
      }
    }
  }

  // --- GENERIC ITEM MODAL CONTROLLER (BOTS, BOOKS, COURSES, PREM BOTS, PREM BOOKS, PREM COURSES) ---
  openAddModal(type) {
    this.activeModalType = type;
    this.editingItem = null;
    this._showModalForm(type);
  }

  openEditItemModal(type, itemId) {
    this.activeModalType = type;
    let item = null;

    if (type === 'bot') item = store.getBots().find(b => b.id === itemId);
    else if (type === 'book') item = store.getBooks().find(b => b.id === itemId);
    else if (type === 'course') item = store.getCourses().find(c => c.id === itemId);
    else if (type === 'premBot') item = store.getPremiumBots().find(b => b.id === itemId);
    else if (type === 'premBook') item = store.getPremiumBooks().find(b => b.id === itemId);
    else if (type === 'premCourse') item = store.getPremiumCourses().find(c => c.id === itemId);

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

  openEditSocialModal(linkId) {
    this.activeModalType = 'socialLink';
    const item = store.getSocialLinks().find(l => l.id === linkId);
    if (!item) return;
    this.editingItem = item;
    this._showModalForm('socialLink');
  }

  _showModalForm(type) {
    const modal = document.getElementById('adminGenericModal');
    const title = document.getElementById('adminModalTitle');
    const body = document.getElementById('adminModalDynamicBody');
    const item = this.editingItem;
    const isEdit = !!item;
    const presets = store.getCuratedPresets();

    if (modal) modal.classList.add('active');

    // 1. CONTENT ITEMS (BOT, BOOK, COURSE, PREM BOT, PREM BOOK, PREM COURSE)
    if (['bot', 'book', 'course', 'premBot', 'premBook', 'premCourse'].includes(type)) {
      const typeTitles = {
        bot: "Free Trading Bot / Script",
        book: "Free Trading Book (PDF)",
        course: "Free Video Course / Zip",
        premBot: "👑 VIP Premium Bot / Script",
        premBook: "👑 VIP Premium Book (PDF)",
        premCourse: "👑 VIP Premium Video Course"
      };

      title.innerText = (isEdit ? "Edit " : "Add New ") + typeTitles[type];

      const currentLogo = item ? (item.logo || item.cover || item.thumbnail || '') : '';
      const currentLink = item ? (item.downloadLink || item.tradingViewLink || item.accessLink || '') : '';

      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Item Title / Name *</label>
          <input type="text" id="m_item_title" class="form-input" required 
            placeholder="e.g. ICT Silver Bullet Matrix Bot ya SMC Bible PDF" 
            value="${isEdit ? sanitize(item.title) : ''}" />
          <div class="form-hint">Yeh title customer k samne readable font me card par show hoga.</div>
        </div>

        <div class="form-group">
          <label class="form-label">Download / Open Link (MediaFire ya Google Drive URL) *</label>
          <input type="url" id="m_item_link" class="form-input" required 
            placeholder="https://www.mediafire.com/file/... ya https://drive.google.com/file/..." 
            value="${sanitize(currentLink)}" />
          <div class="form-hint">Card par click krny se customer direct is MediaFire / Google Drive link par redirect ho jaye ga.</div>
        </div>

        ${this.renderImagePickerControl(
          'm_item_logo',
          currentLogo,
          'Logo / Image *',
          'Phone gallery ya computer se photo upload karein, web link paste karein, ya curated trading chart presets me se pick karein.',
          presets
        )}

        <div class="form-group">
          <label class="form-label">Category / Tag (Optional)</label>
          <input type="text" id="m_item_category" class="form-input" 
            placeholder="e.g. Scalping, SMC / ICT, Price Action, Psychology, Mentorship" 
            value="${isEdit ? sanitize(item.category || '') : 'General'}" />
        </div>
      `;

      this.bindImagePickerEvents('m_item_logo');

    } else if (type === 'payment') {
      title.innerText = isEdit ? "Edit Payment Account" : "Add Payment Account";
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Network / Platform Name *</label>
          <input type="text" id="m_pay_platform" class="form-input" required 
            placeholder="e.g. JazzCash, EasyPaisa, Binance (USDT TRC20), Meezan Bank" 
            value="${isEdit ? sanitize(item.platform) : ''}" />
        </div>

        <div class="form-group">
          <label class="form-label">Account Number / Wallet Address *</label>
          <input type="text" id="m_pay_number" class="form-input" required 
            placeholder="e.g. 03001234567 ya TRC20 Wallet Address" 
            value="${isEdit ? sanitize(item.accountNumber) : ''}" />
        </div>

        <div class="form-group">
          <label class="form-label">Account Name / Title (Optional)</label>
          <input type="text" id="m_pay_title" class="form-input" 
            placeholder="e.g. Muhammad Raza" 
            value="${isEdit ? sanitize(item.accountTitle || '') : ''}" />
        </div>

        <div class="form-group">
          <label class="form-label">Instructions for Buyer (Optional)</label>
          <textarea id="m_pay_instr" class="form-input" rows="2" 
            placeholder="e.g. Transfer kr k screenshot attach karein.">${isEdit ? sanitize(item.instructions || '') : ''}</textarea>
        </div>
      `;

    } else if (type === 'socialLink') {
      title.innerText = isEdit ? "Edit Channel Link" : "Add New Channel Link";
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Platform Type *</label>
          <select id="m_social_platform" class="form-input" style="background:#0d1322; border:1px solid var(--admin-border); color:#fff; padding:10px; width:100%; border-radius:6px;">
            <option value="telegram" ${isEdit && item.platform === 'telegram' ? 'selected' : ''}>Telegram Channel / Group</option>
            <option value="whatsapp" ${isEdit && item.platform === 'whatsapp' ? 'selected' : ''}>WhatsApp Channel / Group</option>
            <option value="youtube" ${isEdit && item.platform === 'youtube' ? 'selected' : ''}>YouTube Channel</option>
            <option value="facebook" ${isEdit && item.platform === 'facebook' ? 'selected' : ''}>Facebook Page</option>
            <option value="custom" ${isEdit && item.platform === 'custom' ? 'selected' : ''}>Custom Channel Link</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Channel Display Name / Title *</label>
          <input type="text" id="m_social_title" class="form-input" required placeholder="e.g. Join Official WhatsApp Channel" value="${isEdit ? sanitize(item.title) : ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Target Link / URL *</label>
          <input type="url" id="m_social_url" class="form-input" required placeholder="https://..." value="${isEdit ? sanitize(item.url) : ''}" />
        </div>
        <div class="form-group">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" id="m_social_active" ${!isEdit || item.active !== false ? 'checked' : ''} style="accent-color: var(--admin-accent); width:18px; height:18px;" />
            <span style="font-size:0.88rem; color:#fff;"><strong>Active (Shown on Site Entry Gate)</strong></span>
          </label>
        </div>
      `;
    }
  }

  saveGenericModal() {
    const type = this.activeModalType;

    // 1. Catalog items
    if (['bot', 'book', 'course', 'premBot', 'premBook', 'premCourse'].includes(type)) {
      const title = document.getElementById('m_item_title')?.value.trim();
      const link = document.getElementById('m_item_link')?.value.trim();
      const logo = document.getElementById('m_item_logo')?.value.trim() || 'logo.svg';
      const category = document.getElementById('m_item_category')?.value.trim() || 'General';

      if (!title) return alert("Title / Name is required!");
      if (!link) return alert("Download Link (MediaFire / Google Drive) is required!");

      const itemPayload = {
        id: this.editingItem ? this.editingItem.id : undefined,
        title: title,
        downloadLink: link,
        logo: logo,
        category: category
      };

      if (type === 'bot') store.saveBot(itemPayload);
      else if (type === 'book') store.saveBook(itemPayload);
      else if (type === 'course') store.saveCourse(itemPayload);
      else if (type === 'premBot') store.savePremiumBot(itemPayload);
      else if (type === 'premBook') store.savePremiumBook(itemPayload);
      else if (type === 'premCourse') store.savePremiumCourse(itemPayload);

      this.closeGenericModal();
      this.showToast("Item saved successfully!", "success");
      this.renderCurrentSection();

    } else if (type === 'payment') {
      const platform = document.getElementById('m_pay_platform')?.value.trim();
      const num = document.getElementById('m_pay_number')?.value.trim();
      const title = document.getElementById('m_pay_title')?.value.trim();
      const instr = document.getElementById('m_pay_instr')?.value.trim();

      if (!platform || !num) return alert("Platform Name and Account Number are required!");

      store.savePaymentMethod({
        id: this.editingItem ? this.editingItem.id : undefined,
        platform: platform,
        accountNumber: num,
        accountTitle: title,
        showTitle: !!title,
        instructions: instr,
        active: true
      });

      this.closeGenericModal();
      this.showToast("Payment method saved!", "success");
      this.renderPaymentsTable();

    } else if (type === 'socialLink') {
      const platform = document.getElementById('m_social_platform')?.value || 'custom';
      const title = document.getElementById('m_social_title')?.value.trim();
      const url = document.getElementById('m_social_url')?.value.trim();
      const active = document.getElementById('m_social_active')?.checked;

      if (!title || !url) return alert("Title and URL are required!");

      store.saveSocialLink({
        id: this.editingItem ? this.editingItem.id : undefined,
        platform: platform,
        title: title,
        url: url,
        active: active
      });

      this.closeGenericModal();
      this.showToast("Channel link saved!", "success");
      this.renderSocialLinksTable();
    }
  }

  closeGenericModal() {
    const modal = document.getElementById('adminGenericModal');
    if (modal) modal.classList.remove('active');
    this.editingItem = null;
    this.activeModalType = null;
  }

  deleteItem(type, itemId) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    if (type === 'bot') store.deleteBot(itemId);
    else if (type === 'book') store.deleteBook(itemId);
    else if (type === 'course') store.deleteCourse(itemId);
    else if (type === 'premBot') store.deletePremiumBot(itemId);
    else if (type === 'premBook') store.deletePremiumBook(itemId);
    else if (type === 'premCourse') store.deletePremiumCourse(itemId);

    this.showToast("Item deleted.", "info");
    this.renderCurrentSection();
  }

  toggleSocialLink(linkId) {
    const updated = store.toggleSocialLinkActive(linkId);
    if (updated) {
      this.showToast(`Channel is now ${updated.active ? 'Visible & Required' : 'Hidden'}!`, "success");
      this.renderSocialLinksTable();
    }
  }

  deleteSocialLink(linkId) {
    if (!confirm("Delete this channel link?")) return;
    store.deleteSocialLink(linkId);
    this.showToast("Channel removed.", "info");
    this.renderSocialLinksTable();
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
                ${safeVal ? '✓ Image Loaded' : 'Default Logo Active'}
              </div>
              <div style="display:flex; gap:8px; margin-top:6px; flex-wrap:wrap;">
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

          <div style="margin-top:10px;">
            <label style="font-size:0.75rem; color:var(--text-dim); display:block; margin-bottom:4px;">
              Image Web Link (URL) ya Auto-Loaded Base64:
            </label>
            <input type="text" id="${inputId}" class="form-input" 
              placeholder="https://... ya uper diye gaye button se direct photo upload karein" 
              value="${safeVal}" />
          </div>

          ${presets && presets.length > 0 ? `
            <div style="margin-top:10px;">
              <div style="font-size:0.75rem; color:var(--text-dim); margin-bottom:4px;">
                Curated Presets (1-Click Select):
              </div>
              <div class="preset-pills-wrap">
                ${presets.map(p => `
                  <button type="button" class="preset-pill-btn" data-target="${inputId}" data-url="${sanitize(p.url)}" title="${sanitize(p.label)}">
                    ${sanitize(p.label)}
                  </button>
                `).join('')}
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

    if (fileBtn && fileInput) {
      fileBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
          alert("Sirf image files (PNG, JPG, WEBP) select karein.");
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          if (textInput) textInput.value = base64;
          if (previewImg) previewImg.src = base64;
          if (statusEl) statusEl.innerText = "✓ Photo Loaded from Device!";
          this.showToast("Image selected successfully!", "success");
        };
        reader.readAsDataURL(file);
      });
    }

    if (textInput) {
      textInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (previewImg) previewImg.src = val || 'logo.svg';
        if (statusEl) statusEl.innerText = val ? "✓ Custom URL Loaded" : "Default Logo Active";
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (textInput) textInput.value = '';
        if (fileInput) fileInput.value = '';
        if (previewImg) previewImg.src = 'logo.svg';
        if (statusEl) statusEl.innerText = "Default Logo Active";
      });
    }

    wrap.querySelectorAll('.preset-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetUrl = btn.dataset.url;
        if (textInput) textInput.value = targetUrl;
        if (previewImg) previewImg.src = targetUrl;
        if (statusEl) statusEl.innerText = `✓ Preset: ${btn.innerText}`;
      });
    });
  }

  // --- SETTINGS & BRANDING ---
  renderSettingsForm() {
    const settings = store.getSiteSettings();
    const appNameInput = document.getElementById('settingsAppName');
    const taglineInput = document.getElementById('settingsTagline');
    const logoUrlInput = document.getElementById('settingsLogoUrl');
    const waNumInput = document.getElementById('settingsWhatsAppNumber');
    const adminNewUser = document.getElementById('adminNewUsername');

    if (appNameInput) appNameInput.value = settings.appName || 'TradingStore';
    if (taglineInput) taglineInput.value = settings.tagline || '';
    if (logoUrlInput) logoUrlInput.value = settings.logoUrl || '';
    if (waNumInput) waNumInput.value = settings.whatsappSupportNumber || '923001234567';
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

    const current = store.getSiteSettings();
    store.saveSiteSettings({
      ...current,
      appName: appName || "TradingStore",
      tagline: tagline || "Trading Bots, Books, Courses & VIP Academy",
      logoUrl: logoUrl,
      whatsappSupportNumber: waNum
    });

    this.showToast("Branding settings saved successfully!", "success");
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

    if (curPass !== settings.adminPassword) {
      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.style.background = 'rgba(255, 59, 105, 0.15)';
        alertBox.style.border = '1px solid #ff3b69';
        alertBox.style.color = '#ff6b8b';
        alertBox.innerText = 'Current password is incorrect!';
      }
      this.showToast("Current password incorrect!", "error");
      return false;
    }

    if (!newUser) return alert("Admin username cannot be blank!");
    if (!newPass || newPass.length < 3) return alert("New password must be at least 3 characters long!");
    if (newPass !== confPass) return alert("Passwords do not match!");

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

    this.showToast("Admin credentials updated successfully!", "success");
    return true;
  }

  // --- UTILITIES ---
  copyText(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.showToast("Copied to clipboard!", "info");
    });
  }

  showToast(message, type = "info") {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // --- BIND ALL EVENTS ---
  bindEvents() {
    // 1. Login Form
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('adminLoginUser')?.value || '';
        const pass = document.getElementById('adminLoginPass')?.value || '';
        this.login(user, pass);
      });
    }

    // 2. Logout Button
    const logoutBtn = document.getElementById('btnAdminLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // 3. Navigation Sidebar Items
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchSection(btn.dataset.section));
    });

    // 4. Mobile Nav Toggle
    const mobileToggle = document.getElementById('btnAdminMobileNavToggle');
    const sidebar = document.querySelector('.admin-sidebar');
    const backdrop = document.getElementById('adminSidebarBackdrop');

    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (backdrop) backdrop.classList.toggle('active');
      });
    }

    if (backdrop && sidebar) {
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      });
    }

    // 5. Close generic modal buttons
    document.querySelectorAll('#adminGenericModal .modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeGenericModal());
    });

    // 6. Close screenshot modal buttons
    document.querySelectorAll('#adminScreenshotModal .modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = document.getElementById('adminScreenshotModal');
        if (modal) modal.classList.remove('active');
      });
    });

    // 7. Lock 1: Master Toggle
    const toggleSiteLock = document.getElementById('toggleSiteEntryLockMaster');
    if (toggleSiteLock) {
      toggleSiteLock.addEventListener('change', (e) => {
        const current = store.getGatekeeperConfig();
        const enabled = e.target.checked;
        store.saveGatekeeperConfig({
          ...current,
          enabled: enabled,
          mode: enabled ? 'strict' : 'disabled'
        });
        const label = document.getElementById('labelSiteEntryLockState');
        if (label) {
          label.innerText = enabled ? "Enabled (Active)" : "Disabled (Open Access)";
          label.style.color = enabled ? "var(--admin-accent)" : "var(--admin-red)";
        }
        this.showToast(`Lock 1 (Site Entry Lock) is now ${enabled ? 'Enabled' : 'Disabled'}!`, "info");
      });
    }

    // 8. Lock 1: Settings Form
    const siteLockSettingsForm = document.getElementById('formSiteEntryLockSettings');
    if (siteLockSettingsForm) {
      siteLockSettingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const current = store.getGatekeeperConfig();
        const socReq = document.getElementById('gkConfigSocialReq')?.checked;
        const pwdReq = document.getElementById('gkConfigPasswordReq')?.checked;
        const stealth = parseInt(document.getElementById('gkConfigStealthSec')?.value, 10) || 8;

        store.saveGatekeeperConfig({
          ...current,
          socialVerificationRequired: socReq,
          passwordUnlockRequired: pwdReq,
          minEngagementSeconds: stealth
        });
        this.showToast("Lock 1 settings saved!", "success");
      });
    }

    // 9. Lock 1: Create Password Form
    const formNewSitePass = document.getElementById('formNewSitePassword');
    const btnGenPass = document.getElementById('btnGenRandomPassword');
    if (btnGenPass) {
      btnGenPass.addEventListener('click', () => {
        const input = document.getElementById('newSitePasswordVal');
        if (input) input.value = 'ENTRY-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
      });
    }
    if (formNewSitePass) {
      formNewSitePass.addEventListener('submit', (e) => {
        e.preventDefault();
        const passVal = document.getElementById('newSitePasswordVal')?.value.trim();
        const limitVal = document.getElementById('newSitePasswordLimit')?.value;
        const noteVal = document.getElementById('newSitePasswordNote')?.value.trim();

        if (!passVal) return alert("Password cannot be empty!");

        store.saveSitePassword({
          password: passVal,
          maxDevices: parseInt(limitVal, 10) || 1,
          note: noteVal || 'Site Access Key',
          usedDevices: [],
          status: 'active'
        });

        formNewSitePass.reset();
        this.showToast("Site access key created!", "success");
        this.renderSitePasswordsTable();
      });
    }

    // 10. Lock 2: Master Toggle
    const togglePremLock = document.getElementById('togglePremiumLockMaster');
    if (togglePremLock) {
      togglePremLock.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        store.savePremiumLockConfig({
          title: "Premium Page Lock",
          enabled: enabled
        });
        const label = document.getElementById('labelPremiumLockState');
        if (label) {
          label.innerText = enabled ? "Enabled (VIP Key Required)" : "Disabled (Open VIP Page)";
          label.style.color = enabled ? "var(--admin-gold)" : "var(--admin-accent)";
        }
        this.showToast(`Lock 2 (Premium Page Lock) is now ${enabled ? 'Enabled' : 'Disabled'}!`, "info");
      });
    }

    // 11. Lock 2: Issue VIP Key Form
    const formNewPremKey = document.getElementById('formNewPremiumKey');
    const btnGenPremKey = document.getElementById('btnGenRandomPremKey');
    if (btnGenPremKey) {
      btnGenPremKey.addEventListener('click', () => {
        const input = document.getElementById('newPremKeyVal');
        if (input) input.value = 'VIP-KEY-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
      });
    }
    if (formNewPremKey) {
      formNewPremKey.addEventListener('submit', (e) => {
        e.preventDefault();
        const keyVal = document.getElementById('newPremKeyVal')?.value.trim();
        const custVal = document.getElementById('newPremKeyCustomer')?.value.trim();
        const noteVal = document.getElementById('newPremKeyNote')?.value.trim();

        if (!keyVal) return alert("VIP key cannot be empty!");

        store.savePremiumPassword({
          key: keyVal,
          assignedTo: custVal,
          note: noteVal,
          status: 'active'
        });

        formNewPremKey.reset();
        this.showToast("VIP license key issued successfully!", "success");
        this.renderPremiumKeysTable();
      });
    }

    // 12. Settings Form Submit
    const siteSettingsForm = document.getElementById('siteSettingsForm');
    if (siteSettingsForm) {
      siteSettingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettingsFromForm();
      });
    }

    // 13. Admin Credentials Form Submit
    const adminCredsForm = document.getElementById('adminCredentialsForm');
    if (adminCredsForm) {
      adminCredsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveAdminCredentials();
      });
    }
  }
}

// Global instance
window.adminPanel = new AdminPanel();
