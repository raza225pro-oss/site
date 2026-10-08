/**
 * TRADINGSTORE - Customer Portal Controller
 * Clean, Fast, Zero-Lag Architecture
 * 1. 1.8s Splash Screen
 * 2. 4 Main Pages: Bots, Books, Courses, Premium
 * 3. 3-in-a-row App Grid with direct MediaFire / Google Drive links
 * 4. Lock 1: Site Entry Lock with 8-second verification rule & key entry
 * 5. Lock 2: Premium Page Lock with 3 sub-pages (Bots, Books, Courses) & Buy Key Modal (Gmail must)
 */

import { store } from './store.js';
import { gatekeeper } from './gatekeeper.js';

function sanitize(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
  return s.replace(/[&<>"'/]/g, c => map[c]);
}

function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const clean = url.trim();
  if (/^(javascript|vbscript|data:(?!image\/)):/i.test(clean)) {
    return '#';
  }
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('#') || clean.startsWith('/') || clean.startsWith('data:image/')) {
    return clean;
  }
  return '#' + clean;
}

function compressImage(file, maxWidth = 1000, maxHeight = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getPlatformIconSvg(platform) {
  switch (platform) {
    case 'telegram':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>`;
    case 'whatsapp':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.53c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.29 3.8 2.52 1.09 2.52.73 2.98.69.45-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.3z"/></svg>`;
    case 'youtube':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
    case 'facebook':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
    default:
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`;
  }
}

class TradingStoreApp {
  constructor() {
    this.currentTab = 'bots'; // bots, books, courses, premium
    this.currentPremiumSubtab = 'prem-bots'; // prem-bots, prem-books, prem-courses
    this.searchQuery = '';
    this.uploadedScreenshotBase64 = null;
    this.activePaymentMethodId = null;
    this.channelTimers = {}; // { [linkId]: timerInterval }

    this.init();
  }

  async init() {
    // 1. Initialize gatekeeper
    await gatekeeper.init();

    // 2. Setup Splash Screen (1.8 seconds)
    this.initSplashScreen();

    // 3. Setup Brand & WhatsApp settings
    this.renderBrandSettings();

    // 4. Bind DOM events
    this.bindEvents();

    // 5. Initial tab navigation
    const hash = window.location.hash.replace('#', '') || 'bots';
    if (['bots', 'books', 'courses', 'premium'].includes(hash)) {
      this.switchTab(hash);
    } else {
      this.switchTab('bots');
    }

    // 6. Realtime store subscriber
    store.subscribe(() => {
      this.renderBrandSettings();
      this.renderCurrentTab();
    });
  }

  // --- 1. SPLASH SCREEN (1.8s) ---
  initSplashScreen() {
    const splash = document.getElementById('splashScreen');
    if (!splash) return;

    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.style.display = 'none';
        this.checkGatekeeperStatus();
      }, 500);
    }, 1800);
  }

  // --- BRAND SETTINGS ---
  renderBrandSettings() {
    const settings = store.getSiteSettings();
    const logoImg = document.getElementById('headerLogoImg');
    const brandName = document.getElementById('headerBrandName');
    const splashLogoImg = document.getElementById('splashLogoImg');
    const splashBrandName = document.getElementById('splashBrandName');
    const footerAppName = document.getElementById('footerAppName');

    const appName = settings.appName || "TradingStore";
    if (brandName) brandName.innerText = appName;
    if (splashBrandName) splashBrandName.innerText = appName;
    if (footerAppName) footerAppName.innerText = appName;

    const logoSrc = settings.logoUrl || "logo.svg";
    if (logoImg) logoImg.src = logoSrc;
    if (splashLogoImg) splashLogoImg.src = logoSrc;
  }

  // --- LOCK 1: SITE ENTRY LOCK (GATEKEEPER) ---
  checkGatekeeperStatus() {
    const modal = document.getElementById('gatekeeperModal');
    if (!gatekeeper.isAuthorized()) {
      if (modal) {
        modal.classList.add('active');
        this.renderGatekeeperSocialLinks();
      }
    } else {
      if (modal) modal.classList.remove('active');
    }
  }

  renderGatekeeperSocialLinks() {
    const container = document.getElementById('gateSocialLinksContainer');
    if (!container) return;

    const activeLinks = store.getActiveSocialLinks();

    if (!activeLinks || activeLinks.length === 0) {
      container.innerHTML = `
        <div style="background: rgba(0, 242, 152, 0.08); border: 1px solid var(--neon-bull); border-radius: 8px; padding: 14px; text-align: center; color: var(--neon-bull); font-size: 0.9rem;">
          ✓ Direct access enabled. Click 'Confirm & Enter Website' below.
        </div>`;
      return;
    }

    container.innerHTML = activeLinks.map((link, idx) => {
      const status = gatekeeper.getLinkStatus(link.id);
      let badgeText = "Click to Join";
      let badgeClass = "";
      if (status.verified) {
        badgeText = "✓ Verified";
        badgeClass = "verified";
      } else if (status.clicked) {
        badgeText = `Verifying (${status.remainingSeconds}s)`;
        badgeClass = "verifying";
      }

      return `
        <a href="${sanitizeUrl(link.url)}" target="_blank" rel="noopener noreferrer" class="social-join-btn ${sanitize(link.platform)}" data-link-id="${sanitize(link.id)}" id="gate_btn_${sanitize(link.id)}">
          <div style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
            ${getPlatformIconSvg(link.platform)}
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600;">
              ${idx + 1}. ${sanitize(link.title)}
            </span>
          </div>
          <span class="status-badge ${badgeClass}" id="badge_${sanitize(link.id)}">${badgeText}</span>
        </a>
      `;
    }).join('');

    // Attach click handlers for 8-second countdown
    activeLinks.forEach(link => {
      const btn = document.getElementById(`gate_btn_${link.id}`);
      if (!btn) return;

      btn.addEventListener('click', () => {
        gatekeeper.recordLinkClick(link.id);
        const badge = document.getElementById(`badge_${link.id}`);
        if (!badge) return;

        // Clear any existing timer for this link
        if (this.channelTimers[link.id]) {
          clearInterval(this.channelTimers[link.id]);
        }

        // Start countdown
        let remaining = Math.ceil(gatekeeper.getMinEngagementMs() / 1000);
        badge.innerText = `Verifying (${remaining}s)`;
        badge.className = "status-badge verifying";

        this.channelTimers[link.id] = setInterval(() => {
          remaining -= 1;
          if (remaining > 0) {
            badge.innerText = `Verifying (${remaining}s)`;
          } else {
            clearInterval(this.channelTimers[link.id]);
            delete this.channelTimers[link.id];
            badge.innerText = "✓ Verified";
            badge.className = "status-badge verified";
          }
        }, 1000);
      });
    });
  }

  // --- NAVIGATION (4 MAIN TABS) ---
  switchTab(tabName) {
    this.currentTab = tabName;
    window.location.hash = tabName;

    // Update desktop nav buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update mobile bottom nav items
    document.querySelectorAll('.mobile-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update active section
    document.querySelectorAll('.content-page').forEach(page => {
      page.classList.toggle('active', page.id === `page-${tabName}`);
    });

    // Reset search
    this.searchQuery = '';
    const searchInput = document.getElementById('catalogSearchInput');
    const clearBtn = document.getElementById('btnClearSearch');
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';

    this.renderCurrentTab();
  }

  // --- INSIDE PREMIUM: 3 SUB-TABS NAVIGATION ---
  switchPremiumSubtab(subtabId) {
    this.currentPremiumSubtab = subtabId;

    document.querySelectorAll('.prem-subtab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.subtab === subtabId);
    });

    document.querySelectorAll('.prem-subpage').forEach(page => {
      page.classList.toggle('active', page.id === `subpage-${subtabId}`);
    });

    this.renderPremium();
  }

  renderCurrentTab() {
    switch (this.currentTab) {
      case 'bots':
        this.renderBots();
        break;
      case 'books':
        this.renderBooks();
        break;
      case 'courses':
        this.renderCourses();
        break;
      case 'premium':
        this.renderPremium();
        break;
    }
  }

  // --- REUSABLE APP CARDS BUILDER (3 APPS IN A ROW) ---
  renderAppCards(containerId, items, emptyMessage = "No items available yet.") {
    const container = document.getElementById(containerId);
    if (!container) return;

    let filtered = [...items];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item => (item.title || '').toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: var(--text-muted);">
          <p style="font-size: 1rem;">${emptyMessage}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => {
      const logoSrc = sanitize(item.logo || item.cover || item.thumbnail || 'logo.svg');
      const directLink = sanitizeUrl(item.downloadLink || item.tradingViewLink || item.scriptLink || item.accessLink || '#');
      const title = sanitize(item.title);

      return `
        <div class="app-card" data-url="${directLink}">
          <div class="app-card-icon-wrap">
            <img src="${logoSrc}" alt="${title}" class="app-card-icon" loading="lazy" onerror="this.src='logo.svg'" />
          </div>
          <div class="app-card-title">${title}</div>
          <a href="${directLink}" target="_blank" rel="noopener noreferrer" class="app-card-download-btn" onclick="event.stopPropagation()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download / Open
          </a>
        </div>
      `;
    }).join('');

    // Clicking anywhere on card opens the MediaFire/Drive link
    container.querySelectorAll('.app-card').forEach(card => {
      card.addEventListener('click', () => {
        const url = card.dataset.url;
        if (url && url !== '#') {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      });
    });
  }

  // --- PAGE 1: BOTS ---
  renderBots() {
    const items = store.getBots();
    this.renderAppCards('botsGrid', items, 'No Trading Bots found matching your search.');
  }

  // --- PAGE 2: BOOKS ---
  renderBooks() {
    const items = store.getBooks();
    this.renderAppCards('booksGrid', items, 'No Trading Books found matching your search.');
  }

  // --- PAGE 3: COURSES ---
  renderCourses() {
    const items = store.getCourses();
    this.renderAppCards('coursesGrid', items, 'No Trading Courses found matching your search.');
  }

  // --- PAGE 4: PREMIUM (LOCK 2 & 3 SUB-PAGES) ---
  renderPremium() {
    const isUnlocked = store.isPremiumPageUnlocked();
    const lockCard = document.getElementById('premiumLockCard');
    const unlockedContainer = document.getElementById('premiumUnlockedContainer');

    if (lockCard && unlockedContainer) {
      if (isUnlocked) {
        lockCard.style.display = 'none';
        unlockedContainer.style.display = 'block';
      } else {
        lockCard.style.display = 'block';
        unlockedContainer.style.display = 'none';
        return; // Stopped here if locked!
      }
    }

    // Unlocked -> Render the 3 Sub-pages
    // 1. Premium Bots
    const premBots = store.getPremiumBots();
    this.renderAppCards('premiumBotsGrid', premBots, 'No VIP Bots listed yet.');

    // 2. Premium Books
    const premBooks = store.getPremiumBooks();
    this.renderAppCards('premiumBooksGrid', premBooks, 'No VIP Books listed yet.');

    // 3. Premium Courses
    const premCourses = store.getPremiumCourses();
    this.renderAppCards('premiumCoursesGrid', premCourses, 'No VIP Courses listed yet.');
  }

  // --- BUY KEY MODAL CONTROLS (GMAIL MUST, CONTACT, SCREENSHOT) ---
  openBuyKeyModal() {
    const modal = document.getElementById('buyKeyModal');
    if (!modal) return;

    this.renderPaymentAccounts();
    modal.classList.add('active');
  }

  closeBuyKeyModal() {
    const modal = document.getElementById('buyKeyModal');
    if (modal) modal.classList.remove('active');
  }

  renderPaymentAccounts() {
    const tabsContainer = document.getElementById('paymentTabs');
    const detailsContainer = document.getElementById('paymentDetailsBox');
    if (!tabsContainer || !detailsContainer) return;

    const methods = store.getPaymentMethods().filter(m => m.active !== false);

    if (methods.length === 0) {
      tabsContainer.innerHTML = '';
      detailsContainer.innerHTML = '<div style="color:var(--text-muted); padding:10px;">Payment accounts configuration in progress. Please check back shortly.</div>';
      return;
    }

    if (!this.activePaymentMethodId || !methods.some(m => m.id === this.activePaymentMethodId)) {
      this.activePaymentMethodId = methods[0].id;
    }

    tabsContainer.innerHTML = methods.map(method => {
      const activeClass = method.id === this.activePaymentMethodId ? 'active' : '';
      return `
        <button type="button" class="payment-tab-btn ${activeClass}" data-method-id="${sanitize(method.id)}">
          ${sanitize(method.platform)}
        </button>
      `;
    }).join('');

    tabsContainer.querySelectorAll('.payment-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activePaymentMethodId = btn.dataset.methodId;
        this.renderPaymentAccounts();
      });
    });

    const activeMethod = methods.find(m => m.id === this.activePaymentMethodId);
    if (!activeMethod) return;

    detailsContainer.innerHTML = `
      <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
          <span style="font-weight:700; color:var(--neon-gold); font-size:1rem;">${sanitize(activeMethod.platform)}</span>
          <button type="button" class="copy-btn-pill" id="btnCopyAccNumber" data-copy="${sanitize(activeMethod.accountNumber)}">
            📋 Copy Number
          </button>
        </div>
        <div style="font-family:var(--font-mono); font-size:1.1rem; color:#fff; word-break:break-all; font-weight:700; margin-bottom:6px;">
          ${sanitize(activeMethod.accountNumber)}
        </div>
        ${activeMethod.accountTitle && activeMethod.showTitle !== false ? `
          <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:4px;">
            Account Title: <strong style="color:#fff;">${sanitize(activeMethod.accountTitle)}</strong>
          </div>
        ` : ''}
        ${activeMethod.instructions ? `
          <div style="font-size:0.8rem; color:var(--text-muted); margin-top:8px; line-height:1.4;">
            ℹ️ ${sanitize(activeMethod.instructions)}
          </div>
        ` : ''}
      </div>
    `;

    const copyBtn = document.getElementById('btnCopyAccNumber');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(copyBtn.dataset.copy).then(() => {
          copyBtn.innerText = "✓ Copied!";
          setTimeout(() => { copyBtn.innerText = "📋 Copy Number"; }, 2000);
          this.showToast("Account number copied to clipboard!", "info");
        });
      });
    }
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

  // --- EVENT BINDINGS ---
  bindEvents() {
    // 1. Desktop Tab navigation
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // 2. Mobile Tab navigation
    document.querySelectorAll('.mobile-nav-item').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // 3. Premium Subtabs
    document.querySelectorAll('.prem-subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchPremiumSubtab(btn.dataset.subtab));
    });

    // 4. Search bar
    const searchInput = document.getElementById('catalogSearchInput');
    const clearBtn = document.getElementById('btnClearSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        if (clearBtn) clearBtn.style.display = this.searchQuery ? 'block' : 'none';
        this.renderCurrentTab();
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        clearBtn.style.display = 'none';
        this.renderCurrentTab();
      });
    }

    // 5. Dismiss ticker
    const dismissTickerBtn = document.getElementById('btnDismissTicker');
    const tickerBar = document.getElementById('liveTickerBar');
    if (dismissTickerBtn && tickerBar) {
      dismissTickerBtn.addEventListener('click', () => {
        tickerBar.style.display = 'none';
      });
    }

    // 6. Gatekeeper Switcher Tabs (Social vs Password)
    const gateTabSocial = document.getElementById('gateTabSocial');
    const gateTabPassword = document.getElementById('gateTabPassword');
    const gateViewSocial = document.getElementById('gateViewSocial');
    const gateViewPassword = document.getElementById('gateViewPassword');

    if (gateTabSocial && gateTabPassword && gateViewSocial && gateViewPassword) {
      gateTabSocial.addEventListener('click', () => {
        gateTabSocial.classList.add('active');
        gateTabPassword.classList.remove('active');
        gateViewSocial.classList.add('active');
        gateViewPassword.classList.remove('active');
      });

      gateTabPassword.addEventListener('click', () => {
        gateTabPassword.classList.add('active');
        gateTabSocial.classList.remove('active');
        gateViewPassword.classList.add('active');
        gateViewSocial.classList.remove('active');
      });
    }

    // 7. Gatekeeper Social Confirm
    const btnConfirmSocial = document.getElementById('btnConfirmSocialJoin');
    const gateSocialAlert = document.getElementById('gateSocialAlert');
    if (btnConfirmSocial) {
      btnConfirmSocial.addEventListener('click', () => {
        const result = gatekeeper.verifySocialEngagement();
        if (result.verified) {
          const modal = document.getElementById('gatekeeperModal');
          if (modal) modal.classList.remove('active');
          this.showToast(result.message, "success");
        } else {
          if (gateSocialAlert) {
            gateSocialAlert.style.display = 'block';
            gateSocialAlert.innerText = result.message;
          }
        }
      });
    }

    // 8. Gatekeeper Password Form
    const gatePassForm = document.getElementById('gatekeeperPasswordForm');
    const gatePassInput = document.getElementById('gatePasswordInput');
    const gatePassAlert = document.getElementById('gatePasswordAlert');
    if (gatePassForm && gatePassInput) {
      gatePassForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pwd = gatePassInput.value.trim();
        const result = await gatekeeper.unlockWithPassword(pwd);
        if (result.success) {
          const modal = document.getElementById('gatekeeperModal');
          if (modal) modal.classList.remove('active');
          this.showToast(result.message, "success");
        } else {
          if (gatePassAlert) {
            gatePassAlert.style.display = 'block';
            gatePassAlert.innerText = result.message;
          }
        }
      });
    }

    // 9. Premium Key Unlock Form
    const vipKeyForm = document.getElementById('formVipPageKeyUnlock');
    const vipKeyInput = document.getElementById('inputVipPageKey');
    const vipKeyAlert = document.getElementById('vipPageKeyAlert');
    if (vipKeyForm && vipKeyInput) {
      vipKeyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const key = vipKeyInput.value.trim();
        const result = store.verifyPremiumKey(key);
        if (result.success) {
          this.showToast("VIP Premium Page Unlocked! Welcome.", "success");
          this.renderPremium();
        } else {
          if (vipKeyAlert) {
            vipKeyAlert.style.display = 'block';
            vipKeyAlert.innerText = result.reason === 'KEY_REVOKED'
              ? "This VIP key has been revoked by Administrator."
              : "Invalid VIP License Key. Please check the key or click 'Buy Key' below.";
          }
        }
      });
    }

    // 10. Relock Premium Page
    const btnRelock = document.getElementById('btnRelockPremium');
    if (btnRelock) {
      btnRelock.addEventListener('click', () => {
        store.setPremiumPageUnlocked(false);
        this.showToast("Premium page is now locked.", "info");
        this.renderPremium();
      });
    }

    // 11. Buy Key Modal Open / Close
    const btnOpenBuyKey = document.getElementById('btnOpenBuyKeyModal');
    const btnCloseBuyKey = document.getElementById('btnCloseBuyKeyModal');
    if (btnOpenBuyKey) {
      btnOpenBuyKey.addEventListener('click', () => this.openBuyKeyModal());
    }
    if (btnCloseBuyKey) {
      btnCloseBuyKey.addEventListener('click', () => this.closeBuyKeyModal());
    }

    // 12. Screenshot dropzone file selector & preview
    const dropzone = document.getElementById('screenshotDropzone');
    const fileInput = document.getElementById('screenshotFileInput');
    const preview = document.getElementById('screenshotPreview');
    const dropText = document.getElementById('dropzoneText');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          try {
            const base64 = await compressImage(file, 1200, 1200, 0.78);
            this.uploadedScreenshotBase64 = base64;
            if (preview) {
              preview.src = base64;
              preview.style.display = 'block';
            }
            if (dropText) dropText.style.display = 'none';
          } catch (err) {
            console.error("Image compression error, falling back to raw read:", err);
            const reader = new FileReader();
            reader.onload = (event) => {
              this.uploadedScreenshotBase64 = event.target.result;
              if (preview) {
                preview.src = event.target.result;
                preview.style.display = 'block';
              }
              if (dropText) dropText.style.display = 'none';
            };
            reader.readAsDataURL(file);
          }
        }
      });
    }

    // 13. Buy Key Order Form Submission (Gmail must!)
    const orderForm = document.getElementById('buyKeyOrderForm');
    const gmailInput = document.getElementById('userOrderGmail');
    const contactInput = document.getElementById('userContactNumber');
    const notesInput = document.getElementById('userOrderNotes');

    if (orderForm) {
      orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const gmail = gmailInput ? gmailInput.value.trim() : '';
        const contact = contactInput ? contactInput.value.trim() : '';
        const notes = notesInput ? notesInput.value.trim() : '';

        // Validation: Gmail MUST be present!
        if (!gmail || !gmail.includes('@')) {
          this.showToast("Gmail must hai! Meharbani farma kar apna valid Gmail likhein.", "warning");
          if (gmailInput) gmailInput.focus();
          return;
        }

        // Contact Number MUST be present!
        if (!contact) {
          this.showToast("Meharbani farma kar WhatsApp number ya Telegram ID darj karein.", "warning");
          if (contactInput) contactInput.focus();
          return;
        }

        // Screenshot MUST be attached!
        if (!this.uploadedScreenshotBase64) {
          this.showToast("Meharbani farma kar payment receipt / screenshot attach karein.", "warning");
          return;
        }

        const activeMethod = store.getPaymentMethods().find(m => m.id === this.activePaymentMethodId);
        const platformName = activeMethod ? activeMethod.platform : 'Direct Transfer';

        store.addOrder({
          gmail: gmail,
          contactNumber: contact,
          platform: platformName,
          screenshot: this.uploadedScreenshotBase64,
          note: notes
        });

        // Reset form & state
        orderForm.reset();
        this.uploadedScreenshotBase64 = null;
        if (preview) preview.style.display = 'none';
        if (dropText) dropText.style.display = 'block';

        this.closeBuyKeyModal();

        this.showToast(
          "Payment proof submitted successfully! Verification k bad Premium Key aap ki Gmail par send kr di jaye gi.",
          "success"
        );
      });
    }
  }
}

// Global instance
window.tradexApp = new TradingStoreApp();
