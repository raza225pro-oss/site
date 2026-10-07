/**
 * TRADINGSTORE - Main Customer Application Controller
 * Handles Navigation, Rendering 4 Hubs, Gatekeeper, Payment Proof Intake, and Premium Script Unlocking
 */

import { store } from './store.js';
import { gatekeeper } from './gatekeeper.js';

/**
 * SECURITY: HTML sanitizer to prevent XSS attacks
 * Escapes all HTML special characters in user-provided content
 */
function sanitize(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
  return s.replace(/[&<>"'/]/g, c => map[c]);
}

/**
 * Returns SVG icons for Telegram, WhatsApp, YouTube, Discord, Instagram, Twitter, TikTok, and Custom
 */
function getPlatformIconSvg(platform) {
  switch (platform) {
    case 'telegram':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>`;
    case 'whatsapp':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.53c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.29 3.8 2.52 1.09 2.52.73 2.98.69.45-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.3z"/></svg>`;
    case 'youtube':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
    case 'discord':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`;
    case 'instagram':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`;
    case 'twitter':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
    case 'tiktok':
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.51-.03 2.85-.97 3.34-2.4.21-.54.26-1.12.26-1.7-.02-5.96-.01-11.92-.01-17.88z"/></svg>`;
    default:
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`;
  }
}

class TradingStoreApp {
  constructor() {
    this.currentTab = 'bots';
    this.selectedProductForPurchase = null;
    this.uploadedScreenshotBase64 = null;
    this.activePaymentMethod = null;
    this.searchQuery = '';
    this.activeFilter = 'all';
    this.currentSort = 'featured';
    this.currentCurrency = (store.getSiteSettings().currency || 'USD').toUpperCase();

    // Quantitative Terminal & Simulator State
    this.soundEnabled = false;
    this.chartSymbol = 'BTC/USDT';
    this.chartTimeframe = '5m';
    this.activeBotStrategy = 'Sniper Flow Scalper v4.2';
    this.chartOverlays = { orderBlocks: true, signals: true, ema: true, tpSl: true };
    this.candles = [];
    this.chartHoverX = -1;
    this.chartHoverY = -1;
    this.priceDecimals = 2;

    this.init();
  }

  async init() {
    // 1. Initialize Device Fingerprint & Gatekeeper
    await gatekeeper.init();
    this.checkGatekeeperStatus();

    // 2. Setup DOM Event Listeners
    this.bindEvents();

    // 3. Render Brand, Header & Currency
    this.renderBrandSettings();
    this.updateCurrencyUI();

    // 4. Initialize Quantitative Simulator, Streamer, ROI Calculator & Pine Studio
    this.initLiveChartStudio();
    this.initSignalStreamer();
    this.initRoiCalculator();
    this.initPineStudio();

    // 5. Initial Navigation and Render
    const hash = window.location.hash.replace('#', '') || 'bots';
    if (['bots', 'books', 'courses', 'premium'].includes(hash)) {
      this.switchTab(hash);
    } else {
      this.switchTab('bots');
    }

    // 6. Subscribe to store changes (Real-time update)
    store.subscribe(() => {
      this.renderBrandSettings();
      this.renderCurrentTab();
      if (!gatekeeper.isAuthorized()) {
        this.renderGatekeeperSocialLinks();
      }
    });
  }

  // --- CURRENCY UTILITIES ---
  toggleCurrency() {
    this.currentCurrency = this.currentCurrency === 'USD' ? 'PKR' : 'USD';
    this.updateCurrencyUI();
    this.renderCurrentTab();
    if (this.selectedProductForPurchase) {
      this.updatePurchaseModalPrice();
    }
    this.updateRoiCalculator();
    this.updatePriceHud();
    this.showToast(`Currency switched to ${this.currentCurrency}`, "info");
  }

  updateCurrencyUI() {
    const label = document.getElementById('headerCurrencyLabel');
    const icon = document.querySelector('#btnToggleCurrency .curr-icon');
    if (label) label.innerText = this.currentCurrency;
    if (icon) icon.innerText = this.currentCurrency === 'PKR' ? '₨' : '$';
  }

  formatPrice(usd, pkr) {
    if (this.currentCurrency === 'PKR') {
      const val = pkr || Math.round((usd || 0) * 280);
      return `PKR ${val.toLocaleString()}`;
    }
    return `$${usd || 0}`;
  }

  // --- WHATSAPP SUPPORT LINK BUILDER ---
  getWhatsAppUrl(message = '') {
    const settings = store.getSiteSettings();
    const cleanNum = (settings.whatsappSupportNumber || '923001234567').replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message || 'Assalam-o-Alaikum! Mujhe TradingStore k bare me maloomat chahiye.');
    return `https://wa.me/${cleanNum}?text=${encoded}`;
  }

  // --- BRANDING & LOGO ---
  renderBrandSettings() {
    const settings = store.getSiteSettings();
    const logoImg = document.getElementById('headerLogoImg');
    const brandName = document.getElementById('headerBrandName');
    const footerAppName = document.getElementById('footerAppName');
    const headerWa = document.getElementById('headerWaLink');
    const floatingWa = document.getElementById('floatingWaBtn');

    if (brandName) brandName.innerText = settings.appName || "TradingStore";
    if (footerAppName) footerAppName.innerText = settings.appName || "TradingStore";

    if (logoImg) {
      logoImg.src = settings.logoUrl || "logo.svg";
    }

    // Update WhatsApp Support links
    const waUrl = this.getWhatsAppUrl("Assalam-o-Alaikum! TradingStore customer support please.");
    if (headerWa) headerWa.href = waUrl;
    if (floatingWa) floatingWa.href = waUrl;
  }

  // --- GATEKEEPER CHECK & MODAL CONTROLS ---
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
          ✓ Direct access enabled. Click 'Confirm & Enter Site' below to enter.
        </div>`;
      return;
    }

    container.innerHTML = activeLinks.map((link, idx) => {
      const status = gatekeeper.getLinkStatus(link.id);
      let badgeText = "Click to Open";
      let badgeClass = "";
      if (status.verified) {
        badgeText = "Verified ✓";
        badgeClass = "verified";
      } else if (status.clicked) {
        badgeText = "Verifying...";
        badgeClass = "verifying";
      }

      return `
        <a href="${sanitize(link.url)}" target="_blank" rel="noopener noreferrer" class="social-join-btn ${sanitize(link.platform)}" data-link-id="${sanitize(link.id)}" id="gate_btn_${sanitize(link.id)}">
          <div style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
            ${getPlatformIconSvg(link.platform)}
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${idx + 1}. ${sanitize(link.title)}
            </span>
          </div>
          <span class="status-badge ${badgeClass}" id="badge_${sanitize(link.id)}">${badgeText}</span>
        </a>
      `;
    }).join('');

    activeLinks.forEach(link => {
      const btn = document.getElementById(`gate_btn_${link.id}`);
      if (btn) {
        btn.addEventListener('click', () => {
          gatekeeper.recordLinkClick(link.id);
          const badge = document.getElementById(`badge_${link.id}`);
          if (badge) {
            badge.innerText = "Verifying...";
            badge.className = "status-badge verifying";
          }

          const minMs = gatekeeper.getMinEngagementMs();
          setTimeout(() => {
            const currentStatus = gatekeeper.getLinkStatus(link.id);
            if (currentStatus.verified) {
              const b = document.getElementById(`badge_${link.id}`);
              if (b) {
                b.innerText = "Verified ✓";
                b.className = "status-badge verified";
              }
            }
          }, minMs);
        });
      }
    });
  }

  // --- TAB NAVIGATION ---
  switchTab(tabName) {
    this.currentTab = tabName;
    window.location.hash = tabName;

    // Update active nav button (desktop & mobile)
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.mobile-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update visible page section
    document.querySelectorAll('.content-page').forEach(page => {
      page.classList.toggle('active', page.id === `page-${tabName}`);
    });

    // Reset search query
    this.searchQuery = '';
    const searchInput = document.getElementById('catalogSearchInput');
    const clearBtn = document.getElementById('btnClearSearch');
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';

    this.renderCurrentTab();
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

  // --- SORTING HELPER ---
  sortItems(items) {
    const list = [...items];
    switch (this.currentSort) {
      case 'winrate':
        return list.sort((a, b) => {
          const rateA = parseFloat((a.winRate || '0').replace(/[^0-9.]/g, '')) || 0;
          const rateB = parseFloat((b.winRate || '0').replace(/[^0-9.]/g, '')) || 0;
          return rateB - rateA;
        });
      case 'popular':
        return list.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
      case 'newest':
        return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      case 'title':
        return list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      default:
        return list;
    }
  }

  // --- 1. RENDER BOTS HUB ---
  renderBots() {
    const container = document.getElementById('botsGrid');
    if (!container) return;

    let items = store.getBots();

    // Filter
    if (this.activeFilter !== 'all') {
      items = items.filter(b => b.category === this.activeFilter);
    }

    // Search
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(b => b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || (b.market || '').toLowerCase().includes(q));
    }

    items = this.sortItems(items);

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <h3>No Bots found matching your filter or search.</h3>
        </div>`;
      return;
    }

    container.innerHTML = items.map(bot => {
      const waText = `Assalam-o-Alaikum! Mujhe TradingStore se "${bot.title}" indicator k bare me maloomat chahiye.`;
      const waUrl = this.getWhatsAppUrl(waText);
      const sparklineSvg = this.generateMiniSparklineSvg(bot.winRate || '78%');

      return `
        <div class="card-item" id="card_bot_${sanitize(bot.id)}">
          <div class="card-image-wrap">
            <img src="${sanitize(bot.logo || 'logo.svg')}" alt="${sanitize(bot.title)}" loading="lazy" onerror="this.src='logo.svg'" />
            ${bot.badge ? `<span class="card-badge">🔥 ${sanitize(bot.badge)}</span>` : ''}
            ${bot.winRate ? `<span class="card-winrate">Win: ${sanitize(bot.winRate)}</span>` : ''}
            <div class="card-sparkline-wrap" title="Backtested Momentum">
              ${sparklineSvg}
            </div>
          </div>
          <div class="card-body">
            <div class="card-meta-row">
              <span>Market: <strong>${sanitize(bot.market || 'All')}</strong></span>
              <span>TF: <strong>${sanitize(bot.timeframe || 'Multi')}</strong></span>
            </div>
            <h3 class="card-title">${sanitize(bot.title)}</h3>
            <p class="card-desc">${sanitize(bot.description)}</p>
            <div class="card-tags">
              <span class="tag-pill" style="color:var(--neon-bull); border-color:rgba(0,242,152,0.3); font-weight:700;">⚡ No-Repaint v5</span>
              ${(bot.features || []).slice(0, 2).map(f => `<span class="tag-pill">${sanitize(f)}</span>`).join('')}
            </div>
            <div class="card-actions-row">
              <button type="button" class="btn-test-chart" data-action="test-chart" data-id="${sanitize(bot.id)}" title="Simulate this bot on live chart terminal above">
                ⚡ Test on Chart
              </button>
              <button type="button" class="btn-quick-view" data-action="quick-view" data-type="bot" data-id="${sanitize(bot.id)}">
                🔍 Specs
              </button>
              <a href="${sanitize(bot.tradingViewLink || '#')}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="flex: 1; justify-content: center; text-decoration: none;">
                ${bot.isFree ? 'TradingView' : 'VIP Algo'}
              </a>
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-wa" title="Inquire on WhatsApp">
                💬
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-action="quick-view"]').forEach(btn => {
      btn.addEventListener('click', () => this.openQuickView(btn.dataset.type, btn.dataset.id));
    });

    container.querySelectorAll('[data-action="test-chart"]').forEach(btn => {
      btn.addEventListener('click', () => this.testBotOnChart(btn.dataset.id));
    });
  }

  generateMiniSparklineSvg(rateStr) {
    const rate = parseFloat(String(rateStr).replace(/[^0-9.]/g, '')) || 78;
    const isHigh = rate >= 78;
    const stroke = isHigh ? '#00f298' : '#00b8ff';
    const path = isHigh
      ? "M 0,22 Q 18,24 34,16 T 58,12 T 74,4 T 90,2"
      : "M 0,22 Q 22,20 40,24 T 64,10 T 78,8 T 90,4";
    return `
      <svg class="card-sparkline-svg" viewBox="0 0 90 28" fill="none">
        <path d="${path}" stroke="${stroke}" stroke-width="2" stroke-linecap="round" fill="none" filter="drop-shadow(0 0 4px ${stroke})" />
      </svg>
    `;
  }

  // --- 2. RENDER BOOKS HUB ---
  renderBooks() {
    const container = document.getElementById('booksGrid');
    if (!container) return;

    let items = store.getBooks();

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(b => b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q));
    }

    items = this.sortItems(items);

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <h3>No Trading Books found matching your search.</h3>
        </div>`;
      return;
    }

    container.innerHTML = items.map(book => {
      const waText = `Assalam-o-Alaikum! Mujhe TradingStore se "${book.title}" PDF trading book chahiye.`;
      const waUrl = this.getWhatsAppUrl(waText);

      return `
        <div class="card-item">
          <div class="card-image-wrap">
            <img src="${sanitize(book.cover || 'logo.svg')}" alt="${sanitize(book.title)}" loading="lazy" onerror="this.src='logo.svg'" />
            <span class="card-badge" style="color: var(--neon-cyan); border-color: var(--neon-cyan);">${sanitize(book.fileType || 'PDF eBook')}</span>
            ${book.rating ? `<span class="card-winrate" style="color: var(--neon-gold); border-color: var(--neon-gold);">★ ${sanitize(book.rating)}</span>` : ''}
          </div>
          <div class="card-body">
            <div class="card-meta-row">
              <span>By: <strong>${sanitize(book.author || 'Pro Analyst')}</strong></span>
              <span>${sanitize(book.pages || 'Full Guide')}</span>
            </div>
            <h3 class="card-title">${sanitize(book.title)}</h3>
            <p class="card-desc">${sanitize(book.description)}</p>
            <div class="card-actions-row">
              <button type="button" class="btn-quick-view" data-action="quick-view" data-type="book" data-id="${sanitize(book.id)}">
                🔍 Overview
              </button>
              <a href="${sanitize(book.downloadLink || '#')}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="flex: 1; justify-content: center; text-decoration: none;">
                Download PDF
              </a>
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-wa" title="Inquire on WhatsApp">
                💬
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-action="quick-view"]').forEach(btn => {
      btn.addEventListener('click', () => this.openQuickView(btn.dataset.type, btn.dataset.id));
    });
  }

  // --- 3. RENDER COURSES HUB ---
  renderCourses() {
    const container = document.getElementById('coursesGrid');
    if (!container) return;

    let items = store.getCourses();

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || (c.instructor || '').toLowerCase().includes(q));
    }

    items = this.sortItems(items);

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <h3>No Trading Courses found matching your search.</h3>
        </div>`;
      return;
    }

    container.innerHTML = items.map(course => {
      const waText = `Assalam-o-Alaikum! Mujhe TradingStore se "${course.title}" trading mentorship course join krna hai.`;
      const waUrl = this.getWhatsAppUrl(waText);

      return `
        <div class="card-item">
          <div class="card-image-wrap">
            <img src="${sanitize(course.thumbnail || 'logo.svg')}" alt="${sanitize(course.title)}" loading="lazy" onerror="this.src='logo.svg'" />
            ${course.badge ? `<span class="card-badge">🎓 ${sanitize(course.badge)}</span>` : ''}
            <span class="card-winrate">${sanitize(course.duration || 'Video Class')}</span>
          </div>
          <div class="card-body">
            <div class="card-meta-row">
              <span>Mentor: <strong>${sanitize(course.instructor || 'Senior Mentor')}</strong></span>
              <span>Level: <strong>${sanitize(course.level || 'All Levels')}</strong></span>
            </div>
            <h3 class="card-title">${sanitize(course.title)}</h3>
            <p class="card-desc">${sanitize(course.description)}</p>
            <div class="card-actions-row">
              <button type="button" class="btn-quick-view" data-action="quick-view" data-type="course" data-id="${sanitize(course.id)}">
                🔍 Syllabus
              </button>
              <a href="${sanitize(course.accessLink || '#')}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="flex: 1; justify-content: center; text-decoration: none;">
                Watch Course
              </a>
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-wa" title="Inquire on WhatsApp">
                💬
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-action="quick-view"]').forEach(btn => {
      btn.addEventListener('click', () => this.openQuickView(btn.dataset.type, btn.dataset.id));
    });
  }

  // --- 4. RENDER PREMIUM HUB ---
  renderPremium() {
    const container = document.getElementById('premiumGrid');
    const lockCard = document.getElementById('premiumLockCard');
    const unlockedBar = document.getElementById('premiumUnlockedBar');
    if (!container) return;

    const isUnlocked = store.isPremiumPageUnlocked();
    const items = store.getPremium();

    if (lockCard && unlockedBar) {
      if (isUnlocked) {
        lockCard.style.display = 'none';
        unlockedBar.style.display = 'flex';
      } else {
        lockCard.style.display = 'block';
        unlockedBar.style.display = 'none';
      }
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <h3>No VIP Scripts currently listed. Check back soon!</h3>
        </div>`;
      return;
    }

    container.innerHTML = items.map(prem => {
      const scriptUrl = sanitize(prem.scriptLink || 'https://www.tradingview.com');
      const formattedPrice = this.formatPrice(prem.priceUSD, prem.pricePKR);
      const waText = `Assalam-o-Alaikum! Mujhe TradingStore se "${prem.title}" (${formattedPrice}) buy karna hai. Proof details provide karein.`;
      const waUrl = this.getWhatsAppUrl(waText);

      if (isUnlocked) {
        return `
          <div class="premium-card unlocked-card">
            <div class="premium-card-header">
              <span class="premium-tag unlocked">✓ VIP ACCESS ACTIVE</span>
              <h3 class="card-title" style="font-size: 1.4rem;">${sanitize(prem.title)}</h3>
              <p style="color: var(--text-secondary); font-size: 0.9rem;">${sanitize(prem.tagline || '')}</p>
              <div class="pricing-box">
                <span class="unlocked-status-pill">👑 Full License Granted</span>
                ${prem.winRate ? `<span class="card-winrate" style="margin-left: auto;">Win: ${sanitize(prem.winRate)}</span>` : ''}
              </div>
            </div>

            <ul class="premium-features-list">
              ${(prem.features || []).map(f => `
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ${sanitize(f)}
                </li>
              `).join('')}
            </ul>

            <div class="card-actions-row">
              <a href="${scriptUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="flex: 1; justify-content: center; padding: 14px; text-decoration: none;">
                Open in TradingView
              </a>
              <button type="button" class="btn-quick-view" data-action="quick-view" data-type="premium" data-id="${sanitize(prem.id)}">
                🔍 Specs
              </button>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="premium-card">
            <div class="premium-card-header">
              <span class="premium-tag">★ VIP ALGORITHM</span>
              <h3 class="card-title" style="font-size: 1.4rem;">${sanitize(prem.title)}</h3>
              <p style="color: var(--text-secondary); font-size: 0.9rem;">${sanitize(prem.tagline || '')}</p>
              <div class="pricing-box">
                <span class="price-usd" style="font-size: 1.4rem; color: var(--neon-gold); font-weight: 800;">${formattedPrice}</span>
                ${prem.winRate ? `<span class="card-winrate" style="margin-left: auto;">Win: ${sanitize(prem.winRate)}</span>` : ''}
              </div>
            </div>

            <ul class="premium-features-list">
              ${(prem.features || []).map(f => `
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ${sanitize(f)}
                </li>
              `).join('')}
            </ul>

            <div class="premium-card-actions">
              <button class="btn-buy-gold" data-action="purchase" data-id="${sanitize(prem.id)}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                Buy VIP Access / Submit Proof
              </button>
              <div style="display: flex; gap: 8px; width: 100%;">
                <button type="button" class="btn-quick-view" data-action="quick-view" data-type="premium" data-id="${sanitize(prem.id)}" style="flex: 1; justify-content: center;">
                  🔍 Quick View
                </button>
                <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-wa" style="justify-content: center; padding: 10px 16px;">
                  💬 Order via WhatsApp
                </a>
              </div>
            </div>
          </div>
        `;
      }
    }).join('');

    container.querySelectorAll('[data-action="purchase"]').forEach(btn => {
      btn.addEventListener('click', () => this.openPurchaseModal(btn.dataset.id));
  // ==========================================================================
  // QUANTITATIVE TERMINAL & LIVE CANDLESTICK SIMULATOR
  // ==========================================================================
  initLiveChartStudio() {
    this.chartCanvas = document.getElementById('heroCandleCanvas');
    if (!this.chartCanvas) return;
    this.chartCtx = this.chartCanvas.getContext('2d');

    // Generate Initial Simulated Candlesticks
    this.generateCandles(this.chartSymbol, this.chartTimeframe);

    // Responsive Canvas Resize
    const resizeCanvas = () => {
      const rect = this.chartCanvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.chartCanvas.width = rect.width * dpr;
      this.chartCanvas.height = rect.height * dpr;
      this.chartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.chartWidth = rect.width;
      this.chartHeight = rect.height;
      this.drawCanvasChart();
    };
    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 60);

    // Canvas Mouse Events (Crosshair & Hover HUD)
    this.chartCanvas.addEventListener('mousemove', (e) => {
      const rect = this.chartCanvas.getBoundingClientRect();
      this.chartHoverX = e.clientX - rect.left;
      this.chartHoverY = e.clientY - rect.top;
      this.drawCanvasChart();
    });

    this.chartCanvas.addEventListener('mouseleave', () => {
      this.chartHoverX = -1;
      this.chartHoverY = -1;
      this.drawCanvasChart();
    });

    // Asset Switcher Tabs
    document.querySelectorAll('#chartAssetTabs .asset-tab-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#chartAssetTabs .asset-tab-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.chartSymbol = btn.dataset.symbol || 'BTC/USDT';
        const titleEl = document.getElementById('terminalCurrentAssetTitle');
        if (titleEl) titleEl.innerText = `${this.chartSymbol} • PERP ALGO SIMULATOR`;
        this.generateCandles(this.chartSymbol, this.chartTimeframe);
        this.drawCanvasChart();
        this.showToast(`Switched terminal chart to ${this.chartSymbol}`, "info");
      });
    });

    // Timeframe Selector Buttons
    document.querySelectorAll('#chartTimeframeGroup .tf-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#chartTimeframeGroup .tf-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.chartTimeframe = btn.dataset.tf || '5m';
        this.generateCandles(this.chartSymbol, this.chartTimeframe);
        this.drawCanvasChart();
      });
    });

    // Overlay Toggles
    const obChk = document.getElementById('chkOverlayOB');
    const sigChk = document.getElementById('chkOverlaySignals');
    const emaChk = document.getElementById('chkOverlayEMA');
    const tpslChk = document.getElementById('chkOverlayTPSL');

    if (obChk) obChk.addEventListener('change', (e) => { this.chartOverlays.orderBlocks = e.target.checked; this.drawCanvasChart(); });
    if (sigChk) sigChk.addEventListener('change', (e) => { this.chartOverlays.signals = e.target.checked; this.drawCanvasChart(); });
    if (emaChk) emaChk.addEventListener('change', (e) => { this.chartOverlays.ema = e.target.checked; this.drawCanvasChart(); });
    if (tpslChk) tpslChk.addEventListener('change', (e) => { this.chartOverlays.tpSl = e.target.checked; this.drawCanvasChart(); });

    // Reset Live Mode Button
    const resetBtn = document.getElementById('btnChartResetView');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.generateCandles(this.chartSymbol, this.chartTimeframe);
        this.drawCanvasChart();
        this.showToast("Refreshed live terminal candles.", "info");
      });
    }

    // Start Live Market Ticker Loop
    this.startChartTicker();
  }

  generateCandles(symbol, tf) {
    const configMap = {
      'BTC/USDT': { base: 94820, vol: 220, dec: 2 },
      'ETH/USDT': { base: 3480, vol: 15, dec: 2 },
      'XAU/USD': { base: 2684.3, vol: 4.2, dec: 2 },
      'EUR/USD': { base: 1.0842, vol: 0.0012, dec: 4 },
      'SOL/USDT': { base: 214.6, vol: 2.4, dec: 2 }
    };
    const cfg = configMap[symbol] || configMap['BTC/USDT'];
    this.priceDecimals = cfg.dec;

    this.candles = [];
    const count = 32;
    let curr = cfg.base - (cfg.vol * 3.5);
    const now = Date.now();
    const tfMs = tf === '1m' ? 60000 : tf === '15m' ? 900000 : tf === '1H' ? 3600000 : 300000;

    for (let i = count; i >= 0; i--) {
      const time = new Date(now - i * tfMs);
      const delta = (Math.random() - 0.47) * cfg.vol;
      const open = curr;
      const close = curr + delta;
      const high = Math.max(open, close) + Math.random() * (cfg.vol * 0.55);
      const low = Math.min(open, close) - Math.random() * (cfg.vol * 0.55);
      const volume = Math.round(150 + Math.random() * 850);

      this.candles.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        open, high, low, close, volume,
        isBull: close >= open
      });
      curr = close;
    }

    // Assign realistic algorithmic signal swing markers
    if (this.candles.length > 15) {
      this.candles[this.candles.length - 8].signal = 'BUY';
      this.candles[this.candles.length - 8].signalLabel = 'BUY 🟢';
      this.candles[this.candles.length - 18].signal = 'SELL';
      this.candles[this.candles.length - 18].signalLabel = 'SELL 🔴';
    }

    this.updatePriceHud();
  }

  drawCanvasChart() {
    if (!this.chartCtx || !this.chartCanvas) return;
    const ctx = this.chartCtx;
    const w = this.chartWidth || this.chartCanvas.getBoundingClientRect().width;
    const h = this.chartHeight || this.chartCanvas.getBoundingClientRect().height;

    ctx.clearRect(0, 0, w, h);

    if (!this.candles || this.candles.length === 0) return;

    // Price scaling
    let minP = Infinity;
    let maxP = -Infinity;
    this.candles.forEach(c => {
      if (c.low < minP) minP = c.low;
      if (c.high > maxP) maxP = c.high;
    });

    const padTop = 30;
    const padBottom = 35;
    const padRight = 68; // Space for right price axis
    const padLeft = 14;

    const priceSpan = (maxP - minP) || 1;
    const chartH = h - padTop - padBottom;
    const chartW = w - padLeft - padRight;

    const priceToY = (p) => padTop + chartH - ((p - minP) / priceSpan) * chartH;
    const yToPrice = (y) => minP + ((padTop + chartH - y) / chartH) * priceSpan;

    // 1. Draw Background Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padTop + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();

      // Right axis price label
      const pVal = yToPrice(y);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(pVal.toFixed(this.priceDecimals), w - padRight + 8, y + 3);
    }

    // 2. Draw Order Blocks (SMC Institutional Liquidity Zones)
    if (this.chartOverlays.orderBlocks) {
      // Bullish Order Block Demand Zone (near bottom)
      const obLowY = priceToY(minP + priceSpan * 0.12);
      const obHighY = priceToY(minP + priceSpan * 0.24);
      ctx.fillStyle = 'rgba(0, 242, 152, 0.07)';
      ctx.fillRect(padLeft, obHighY, chartW, obLowY - obHighY);
      ctx.strokeStyle = 'rgba(0, 242, 152, 0.35)';
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(padLeft, obHighY, chartW, obLowY - obHighY);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(0, 242, 152, 0.7)';
      ctx.font = '9px "Outfit", sans-serif';
      ctx.fillText('+OB DEMAND (SMC LIQUIDITY)', padLeft + 8, obHighY + 12);

      // Bearish Order Block Supply Zone (near top)
      const supLowY = priceToY(maxP - priceSpan * 0.22);
      const supHighY = priceToY(maxP - priceSpan * 0.10);
      ctx.fillStyle = 'rgba(255, 59, 105, 0.06)';
      ctx.fillRect(padLeft, supHighY, chartW, supLowY - supHighY);
      ctx.strokeStyle = 'rgba(255, 59, 105, 0.3)';
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(padLeft, supHighY, chartW, supLowY - supHighY);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255, 59, 105, 0.65)';
      ctx.font = '9px "Outfit", sans-serif';
      ctx.fillText('-OB SUPPLY (STOP HUNT ZONE)', padLeft + 8, supHighY + 12);
    }

    // 3. Draw EMA Ribbon Curves (20 & 50 period smooth curves)
    if (this.chartOverlays.ema) {
      const stepX = chartW / this.candles.length;
      
      // Fast EMA 20 (Cyan)
      ctx.strokeStyle = 'rgba(0, 184, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      this.candles.forEach((c, i) => {
        const x = padLeft + i * stepX + stepX / 2;
        const emaPrice = c.close * 0.7 + c.open * 0.3;
        const y = priceToY(emaPrice);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Slow EMA 50 (Purple)
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      this.candles.forEach((c, i) => {
        const x = padLeft + i * stepX + stepX / 2;
        const emaSlow = c.close * 0.5 + minP * 0.2 + maxP * 0.3;
        const y = priceToY(emaSlow);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // 4. Draw Candlesticks & Volumes
    const candleCount = this.candles.length;
    const colWidth = chartW / candleCount;
    const bodyWidth = Math.max(3, colWidth * 0.68);

    let hoveredCandle = null;

    this.candles.forEach((c, i) => {
      const xCenter = padLeft + i * colWidth + colWidth / 2;
      const yOpen = priceToY(c.open);
      const yClose = priceToY(c.close);
      const yHigh = priceToY(c.high);
      const yLow = priceToY(c.low);

      const isBull = c.close >= c.open;
      const color = isBull ? '#00f298' : '#ff3b69';

      // Check if mouse hovers this candle
      if (this.chartHoverX >= (xCenter - colWidth / 2) && this.chartHoverX <= (xCenter + colWidth / 2)) {
        hoveredCandle = c;
      }

      // Draw Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(xCenter, yHigh);
      ctx.lineTo(xCenter, yLow);
      ctx.stroke();

      // Draw Candle Body
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
      ctx.fillStyle = color;
      ctx.fillRect(xCenter - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);

      // Volume Bar below candle
      const maxVolH = 30;
      const volH = Math.min(maxVolH, (c.volume / 1000) * maxVolH);
      ctx.fillStyle = isBull ? 'rgba(0, 242, 152, 0.18)' : 'rgba(255, 59, 105, 0.18)';
      ctx.fillRect(xCenter - bodyWidth / 2, h - padBottom - volH, bodyWidth, volH);

      // 5. Draw Buy / Sell Signal Markers
      if (this.chartOverlays.signals && c.signal) {
        if (c.signal === 'BUY') {
          // Green Triangle pointing up below candle
          const triY = yLow + 8;
          ctx.fillStyle = '#00f298';
          ctx.beginPath();
          ctx.moveTo(xCenter, triY);
          ctx.lineTo(xCenter - 5, triY + 8);
          ctx.lineTo(xCenter + 5, triY + 8);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#00f298';
          ctx.font = 'bold 9px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('BUY', xCenter, triY + 18);
        } else if (c.signal === 'SELL') {
          // Red Triangle pointing down above candle
          const triY = yHigh - 8;
          ctx.fillStyle = '#ff3b69';
          ctx.beginPath();
          ctx.moveTo(xCenter, triY);
          ctx.lineTo(xCenter - 5, triY - 8);
          ctx.lineTo(xCenter + 5, triY - 8);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ff3b69';
          ctx.font = 'bold 9px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('SELL', xCenter, triY - 12);
        }
      }
    });

    // 6. Draw Take Profit / Stop Loss Projections from last signal
    if (this.chartOverlays.tpSl) {
      const lastCandle = this.candles[this.candles.length - 1];
      const tpY = priceToY(lastCandle.close * 1.034);
      const slY = priceToY(lastCandle.close * 0.988);

      ctx.setLineDash([4, 4]);

      // Take Profit line (Gold)
      ctx.strokeStyle = 'rgba(255, 184, 0, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft + chartW * 0.75, tpY);
      ctx.lineTo(w - padRight, tpY);
      ctx.stroke();
      ctx.fillStyle = 'var(--neon-gold)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('TP1 +3.4%', padLeft + chartW * 0.77, tpY - 4);

      // Stop Loss line (Red)
      ctx.strokeStyle = 'rgba(255, 59, 105, 0.7)';
      ctx.beginPath();
      ctx.moveTo(padLeft + chartW * 0.75, slY);
      ctx.lineTo(w - padRight, slY);
      ctx.stroke();
      ctx.fillStyle = 'var(--neon-bear)';
      ctx.fillText('SL -1.2%', padLeft + chartW * 0.77, slY - 4);

      ctx.setLineDash([]);
    }

    // 7. Live Pulsing Current Price Line
    const latest = this.candles[this.candles.length - 1];
    const latestY = priceToY(latest.close);
    const isBullLast = latest.close >= latest.open;
    const accentColor = isBullLast ? '#00f298' : '#ff3b69';

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padLeft, latestY);
    ctx.lineTo(w - padRight, latestY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Right Axis Live Price Badge
    ctx.fillStyle = accentColor;
    ctx.fillRect(w - padRight + 2, latestY - 9, padRight - 4, 18);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(latest.close.toFixed(this.priceDecimals), w - padRight / 2, latestY + 4);

    // 8. Crosshair & Hover Overlay
    if (this.chartHoverX >= padLeft && this.chartHoverX <= (w - padRight)) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      // Vertical cursor line
      ctx.beginPath();
      ctx.moveTo(this.chartHoverX, padTop);
      ctx.lineTo(this.chartHoverX, h - padBottom);
      ctx.stroke();

      // Horizontal cursor line
      if (this.chartHoverY >= padTop && this.chartHoverY <= (h - padBottom)) {
        ctx.beginPath();
        ctx.moveTo(padLeft, this.chartHoverY);
        ctx.lineTo(w - padRight, this.chartHoverY);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Update Floating HUD Overlay
      if (hoveredCandle) {
        const timeEl = document.getElementById('crosshairTime');
        const oEl = document.getElementById('crosshairOpen');
        const hEl = document.getElementById('crosshairHigh');
        const lEl = document.getElementById('crosshairLow');
        const cEl = document.getElementById('crosshairClose');

        if (timeEl) timeEl.innerText = hoveredCandle.time;
        if (oEl) oEl.innerText = hoveredCandle.open.toFixed(this.priceDecimals);
        if (hEl) hEl.innerText = hoveredCandle.high.toFixed(this.priceDecimals);
        if (lEl) lEl.innerText = hoveredCandle.low.toFixed(this.priceDecimals);
        if (cEl) cEl.innerText = hoveredCandle.close.toFixed(this.priceDecimals);
      }
    }
  }

  startChartTicker() {
    if (this.chartTickerInterval) clearInterval(this.chartTickerInterval);

    let tickCount = 0;
    this.chartTickerInterval = setInterval(() => {
      if (!this.candles || this.candles.length === 0) return;

      const last = this.candles[this.candles.length - 1];
      const delta = (Math.random() - 0.49) * (this.priceDecimals === 4 ? 0.0003 : 18);
      last.close += delta;
      if (last.close > last.high) last.high = last.close;
      if (last.close < last.low) last.low = last.close;
      last.isBull = last.close >= last.open;

      tickCount++;
      // Roll to new candle periodically
      if (tickCount >= 22) {
        tickCount = 0;
        const now = new Date();
        const newCandle = {
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          open: last.close,
          high: last.close + Math.random() * (this.priceDecimals === 4 ? 0.0004 : 15),
          low: last.close - Math.random() * (this.priceDecimals === 4 ? 0.0004 : 15),
          close: last.close,
          volume: Math.round(150 + Math.random() * 500),
          isBull: true
        };
        this.candles.push(newCandle);
        if (this.candles.length > 34) this.candles.shift();
      }

      this.updatePriceHud();
      this.drawCanvasChart();
    }, 850);
  }

  updatePriceHud() {
    if (!this.candles || this.candles.length === 0) return;
    const last = this.candles[this.candles.length - 1];
    const prev = this.candles[0];
    const priceEl = document.getElementById('chartLastPrice');
    const chgEl = document.getElementById('chart24hChange');

    const prefix = this.chartSymbol.includes('EUR') ? '€' : '$';
    if (priceEl) {
      priceEl.innerText = `${prefix}${last.close.toLocaleString(undefined, { minimumFractionDigits: this.priceDecimals, maximumFractionDigits: this.priceDecimals })}`;
      priceEl.style.color = last.close >= last.open ? 'var(--neon-bull)' : 'var(--neon-bear)';
    }

    const pct = (((last.close - prev.open) / prev.open) * 100).toFixed(2);
    if (chgEl) {
      const isUp = pct >= 0;
      chgEl.innerText = `${isUp ? '+' : ''}${pct}% ${isUp ? '▲' : '▼'}`;
      chgEl.className = `hud-val ${isUp ? 'text-neon-bull' : 'text-neon-bear'}`;
    }
  }

  testBotOnChart(botId) {
    const bots = store.getBots();
    const bot = bots.find(b => b.id === botId);
    if (!bot) return;

    // Smooth scroll up to terminal studio
    const term = document.getElementById('chartTerminalWindow');
    if (term) {
      term.scrollIntoView({ behavior: 'smooth', block: 'center' });
      term.style.borderColor = 'var(--neon-bull)';
      term.style.boxShadow = '0 0 50px rgba(0, 242, 152, 0.45)';
      setTimeout(() => {
        term.style.borderColor = 'rgba(0, 242, 152, 0.28)';
        term.style.boxShadow = '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 242, 152, 0.08)';
      }, 1600);
    }

    // Update active bot badge & signal pill
    const badgeEl = document.getElementById('chartActiveBotName');
    const signalEl = document.getElementById('chartActiveSignal');
    const winRateEl = document.getElementById('chartAlgoWinRate');

    if (badgeEl) badgeEl.innerText = `${bot.title} Active`;
    if (winRateEl) winRateEl.innerText = bot.winRate || '82.4%';
    if (signalEl) {
      signalEl.innerHTML = `<span class="signal-dot"></span> 🟢 STRONG BUY [${sanitize(bot.title.split(' ')[0])}]`;
    }

    // Plot instant buy trigger on the latest candle
    if (this.candles && this.candles.length > 0) {
      this.candles[this.candles.length - 1].signal = 'BUY';
      this.candles[this.candles.length - 1].signalLabel = `ALGO ${bot.title.split(' ')[0]} 🟢`;
      this.drawCanvasChart();
    }

    this.showToast(`Simulated "${bot.title}" on Live Terminal (Win Rate: ${bot.winRate || '82%'})!`, "success");
    this.playSignalChime();
  }

  // ==========================================================================
  // REAL-TIME ALGORITHMIC SIGNAL STREAMER
  // ==========================================================================
  initSignalStreamer() {
    const track = document.getElementById('signalStreamTrack');
    const soundBtn = document.getElementById('btnToggleSignalSound');
    const soundIcon = document.getElementById('soundToggleIcon');

    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        soundBtn.classList.toggle('active', this.soundEnabled);
        if (soundIcon) soundIcon.innerText = this.soundEnabled ? '🔊' : '🔇';
        this.showToast(`Signal audio chime ${this.soundEnabled ? 'enabled' : 'muted'}`, "info");
        if (this.soundEnabled) this.playSignalChime();
      });
    }

    if (!track) return;

    this.streamSignals = [
      { sym: 'BTC/USDT', action: 'LONG', px: '$94,850', tp: '+3.4%', algo: 'Sniper Flow v4.2', time: '1m ago' },
      { sym: 'XAU/USD', action: 'SHORT', px: '$2,684.2', tp: '+180 pips', algo: 'ICT Silver Bullet', time: '3m ago' },
      { sym: 'ETH/USDT', action: 'LONG', px: '$3,482.0', tp: '+5.1%', algo: 'SuperTrend AI', time: '7m ago' },
      { sym: 'EUR/USD', action: 'LONG', px: '1.0842', tp: '+42 pips', algo: 'Sniper Flow v4.2', time: '11m ago' },
      { sym: 'SOL/USDT', action: 'LONG', px: '$214.60', tp: '+8.4%', algo: 'Volume Profile CVD', time: '14m ago' },
      { sym: 'NAS100', action: 'SHORT', px: '20,410', tp: '+115 pts', algo: 'VIP Apex Suite', time: '18m ago' }
    ];

    const renderStream = () => {
      const fullList = [...this.streamSignals, ...this.streamSignals];
      track.innerHTML = fullList.map(s => `
        <div class="stream-pill">
          <span class="pill-symbol">${s.sym}</span>
          <span class="pill-action ${s.action === 'LONG' ? 'bull' : 'bear'}">${s.action === 'LONG' ? '🟢 LONG' : '🔴 SHORT'}</span>
          <span>@ ${s.px}</span>
          <span class="pill-pnl">${s.tp}</span>
          <span style="color:var(--text-muted); font-size:0.7rem;">[${s.algo}]</span>
          <span style="color:var(--text-muted); font-size:0.68rem;">• ${s.time}</span>
        </div>
      `).join('');
    };
    renderStream();

    // Rotate new signals every 24 seconds
    setInterval(() => {
      const symbols = ['BTC/USDT', 'ETH/USDT', 'XAU/USD', 'SOL/USDT', 'EUR/USD'];
      const algos = ['Sniper Flow v4.2', 'ICT Silver Bullet', 'CVD Beast', 'VIP Apex Suite'];
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      const algo = algos[Math.floor(Math.random() * algos.length)];
      const isLong = Math.random() > 0.35;
      const newSignal = {
        sym,
        action: isLong ? 'LONG' : 'SHORT',
        px: sym === 'BTC/USDT' ? '$' + (94700 + Math.floor(Math.random() * 300)) : sym === 'ETH/USDT' ? '$' + (3470 + Math.floor(Math.random() * 25)) : '$' + (2680 + Math.floor(Math.random() * 8)),
        tp: isLong ? `+${(2.2 + Math.random() * 4).toFixed(1)}%` : `+${(1.8 + Math.random() * 3).toFixed(1)}%`,
        algo,
        time: 'Just now'
      };
      this.streamSignals.unshift(newSignal);
      if (this.streamSignals.length > 8) this.streamSignals.pop();
      renderStream();
      this.playSignalChime();
    }, 24000);
  }

  playSignalChime() {
    if (!this.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, this.audioCtx.currentTime + 0.15); // E6
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch (e) {}
  }

  // ==========================================================================
  // INTERACTIVE ALGORITHMIC ROI CALCULATOR
  // ==========================================================================
  initRoiCalculator() {
    const rangeCap = document.getElementById('rangeCapital');
    const rangeTrades = document.getElementById('rangeTrades');
    const rangeRisk = document.getElementById('rangeRisk');
    const selectBot = document.getElementById('selectCalcBot');
    const btnGet = document.getElementById('btnCalcGetStrategy');

    if (!rangeCap || !rangeTrades || !rangeRisk || !selectBot) return;

    const onInput = () => this.updateRoiCalculator();
    rangeCap.addEventListener('input', onInput);
    rangeTrades.addEventListener('input', onInput);
    rangeRisk.addEventListener('input', onInput);
    selectBot.addEventListener('change', onInput);

    if (btnGet) {
      btnGet.addEventListener('click', () => {
        this.switchTab('bots');
        const botId = selectBot.value === 'sniper' ? 'bot_1' : selectBot.value === 'ict' ? 'bot_2' : selectBot.value === 'cvd' ? 'bot_3' : 'bot_1';
        const card = document.getElementById(`card_bot_${botId}`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.style.borderColor = 'var(--neon-bull)';
          card.style.boxShadow = '0 0 35px rgba(0,242,152,0.45)';
          setTimeout(() => {
            card.style.borderColor = '';
            card.style.boxShadow = '';
          }, 2000);
        }
      });
    }

    this.updateRoiCalculator();
  }

  updateRoiCalculator() {
    const rangeCap = document.getElementById('rangeCapital');
    const rangeTrades = document.getElementById('rangeTrades');
    const rangeRisk = document.getElementById('rangeRisk');
    const selectBot = document.getElementById('selectCalcBot');

    if (!rangeCap || !rangeTrades || !rangeRisk || !selectBot) return;

    const capitalUSD = parseFloat(rangeCap.value) || 1000;
    const trades = parseInt(rangeTrades.value) || 24;
    const riskPct = parseFloat(rangeRisk.value) || 2.0;

    const opt = selectBot.selectedOptions[0];
    const winRate = parseFloat(opt ? opt.dataset.winrate : 80) || 80;
    const rr = parseFloat(opt ? opt.dataset.rr : 2.5) || 2.5;

    // Display Badges
    const isPkr = this.currentCurrency === 'PKR';
    const rate = 280;
    const capDisplay = document.getElementById('valCapitalDisplay');
    const tradesDisplay = document.getElementById('valTradesDisplay');
    const riskDisplay = document.getElementById('valRiskDisplay');

    if (capDisplay) {
      capDisplay.innerText = isPkr ? `PKR ${(capitalUSD * rate).toLocaleString()}` : `$${capitalUSD.toLocaleString()}`;
    }
    if (tradesDisplay) tradesDisplay.innerText = `${trades} Trades`;
    if (riskDisplay) riskDisplay.innerText = `${riskPct.toFixed(1)}%`;

    // Mathematical projection
    const wins = Math.round(trades * (winRate / 100));
    const losses = trades - wins;
    const riskPerTradeUSD = capitalUSD * (riskPct / 100);
    const winProfitUSD = wins * (riskPerTradeUSD * rr);
    const lossCostUSD = losses * riskPerTradeUSD;
    const netProfitUSD = winProfitUSD - lossCostUSD;
    const profitFactor = (winProfitUSD / Math.max(1, lossCostUSD)).toFixed(2);
    const projectedBalanceUSD = capitalUSD + netProfitUSD;
    const roiPct = ((netProfitUSD / capitalUSD) * 100).toFixed(1);

    // Outputs
    const profEl = document.getElementById('calcProjectedProfit');
    const roiEl = document.getElementById('calcRoiPercent');
    const wlEl = document.getElementById('calcWinLossCount');
    const pfEl = document.getElementById('calcProfitFactor');
    const balEl = document.getElementById('calcProjectedBalance');

    const profitVal = isPkr ? Math.round(netProfitUSD * rate) : Math.round(netProfitUSD);
    const balVal = isPkr ? Math.round(projectedBalanceUSD * rate) : Math.round(projectedBalanceUSD);

    if (profEl) {
      profEl.innerText = `${netProfitUSD >= 0 ? '+' : ''}${isPkr ? 'PKR ' + profitVal.toLocaleString() : '$' + profitVal.toLocaleString()}`;
      profEl.style.color = netProfitUSD >= 0 ? 'var(--neon-bull)' : 'var(--neon-bear)';
    }
    if (roiEl) roiEl.innerText = `${roiPct >= 0 ? '+' : ''}${roiPct}% Est. Monthly ROI`;
    if (wlEl) wlEl.innerText = `${wins} Wins / ${losses} Losses`;
    if (pfEl) pfEl.innerText = `${profitFactor}x`;
    if (balEl) balEl.innerText = isPkr ? `PKR ${balVal.toLocaleString()}` : `$${balVal.toLocaleString()}`;
  }

  // ==========================================================================
  // PINESCRIPT V5 ARCHITECTURE STUDIO
  // ==========================================================================
  initPineStudio() {
    document.querySelectorAll('#sectionPineExplorer .pine-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#sectionPineExplorer .pine-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('#sectionPineExplorer .pine-tab-pane').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const tab = btn.dataset.tab;
        const pane = document.getElementById(tab === 'strategy' ? 'paneStrategy' : tab === 'code' ? 'paneCode' : 'paneBacktest');
        if (pane) pane.classList.add('active');
      });
    });

    const copyBtn = document.getElementById('btnCopyPineCode');
    const codeSnippet = document.getElementById('pineCodeSnippet');
    if (copyBtn && codeSnippet) {
      copyBtn.addEventListener('click', () => {
        this.copyToClipboard(codeSnippet.innerText);
        this.showToast("PineScript v5 source copied to clipboard! Paste directly into TradingView Pine Editor.", "success");
      });
    }
  }

  // --- PRODUCT DETAIL / QUICK VIEW MODAL ---
  openQuickView(type, id) {
    const modal = document.getElementById('productDetailModal');
    const badge = document.getElementById('detailBadgeTag');
    const title = document.getElementById('detailModalTitle');
    const body = document.getElementById('detailModalBody');
    if (!modal || !body) return;

    let item = null;
    let typeName = 'BOT';

    if (type === 'bot') {
      item = store.getBots().find(b => b.id === id);
      typeName = 'PINESCRIPT BOT';
    } else if (type === 'book') {
      item = store.getBooks().find(b => b.id === id);
      typeName = 'TRADING BOOK';
    } else if (type === 'course') {
      item = store.getCourses().find(c => c.id === id);
      typeName = 'COURSE';
    } else if (type === 'premium') {
      item = store.getPremium().find(p => p.id === id);
      typeName = 'VIP ALGORITHM';
    }

    if (!item) return;

    if (badge) badge.innerText = typeName;
    if (title) title.innerText = item.title;

    const imgUrl = item.banner || item.thumbnail || item.cover || item.logo || 'logo.svg';
    const waText = `Assalam-o-Alaikum! Mujhe "${item.title}" (${typeName}) k bare me details chahiye.`;
    const waUrl = this.getWhatsAppUrl(waText);

    body.innerHTML = `
      <div class="detail-banner-wrap">
        <img src="${sanitize(imgUrl)}" alt="${sanitize(item.title)}" onerror="this.src='logo.svg'" />
      </div>

      <div class="detail-spec-grid">
        ${item.winRate ? `
          <div class="detail-spec-item">
            <div class="detail-spec-label">Win Rate</div>
            <div class="detail-spec-val" style="color: var(--neon-bull);">${sanitize(item.winRate)}</div>
          </div>` : ''}
        ${item.market ? `
          <div class="detail-spec-item">
            <div class="detail-spec-label">Market</div>
            <div class="detail-spec-val">${sanitize(item.market)}</div>
          </div>` : ''}
        ${item.timeframe ? `
          <div class="detail-spec-item">
            <div class="detail-spec-label">Timeframe</div>
            <div class="detail-spec-val">${sanitize(item.timeframe)}</div>
          </div>` : ''}
        ${item.author ? `
          <div class="detail-spec-item">
            <div class="detail-spec-label">Author</div>
            <div class="detail-spec-val">${sanitize(item.author)}</div>
          </div>` : ''}
        ${item.instructor ? `
          <div class="detail-spec-item">
            <div class="detail-spec-label">Instructor</div>
            <div class="detail-spec-val">${sanitize(item.instructor)}</div>
          </div>` : ''}
        ${item.pages ? `
          <div class="detail-spec-item">
            <div class="detail-spec-label">Pages</div>
            <div class="detail-spec-val">${sanitize(item.pages)}</div>
          </div>` : ''}
        ${item.duration ? `
          <div class="detail-spec-item">
            <div class="detail-spec-label">Duration</div>
            <div class="detail-spec-val">${sanitize(item.duration)}</div>
          </div>` : ''}
        ${item.priceUSD ? `
          <div class="detail-spec-item">
            <div class="detail-spec-label">Price</div>
            <div class="detail-spec-val" style="color: var(--neon-gold);">${this.formatPrice(item.priceUSD, item.pricePKR)}</div>
          </div>` : ''}
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="font-family: var(--font-heading); font-size: 1.1rem; margin-bottom: 6px;">Overview & Rules</h4>
        <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6;">${sanitize(item.description || item.tagline || 'Professional quantitative trading material.')}</p>
      </div>

      ${item.features && item.features.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h4 style="font-family: var(--font-heading); font-size: 1.05rem; margin-bottom: 10px;">Core Features & Signals</h4>
          <div class="detail-feature-list">
            ${item.features.map(f => `
              <div class="detail-feature-row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>${sanitize(f)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div style="display: flex; gap: 10px; flex-wrap: wrap; border-top: 1px solid var(--border-subtle); padding-top: 18px;">
        ${type === 'premium' ? `
          <button type="button" class="btn-buy-gold" id="btnDetailBuyNow" style="flex: 1; justify-content: center; min-height: 46px;">
            Buy VIP License
          </button>
        ` : `
          <a href="${sanitize(item.tradingViewLink || item.downloadLink || item.accessLink || '#')}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="flex: 1; justify-content: center; text-decoration: none; min-height: 46px;">
            Open Material
          </a>
        `}
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-wa" style="justify-content: center; padding: 12px 20px;">
          💬 Inquire on WhatsApp
        </a>
      </div>
    `;

    const detailBuyBtn = document.getElementById('btnDetailBuyNow');
    if (detailBuyBtn) {
      detailBuyBtn.addEventListener('click', () => {
        this.closeModals();
        this.openPurchaseModal(item.id);
      });
    }

    modal.classList.add('active');
  }

  // --- MANUAL PAYMENT MODAL & SCREENSHOT PROOF ---
  openPurchaseModal(productId) {
    const product = store.getPremium().find(p => p.id === productId);
    if (!product) return;

    this.selectedProductForPurchase = product;
    this.uploadedScreenshotBase64 = null;

    const modal = document.getElementById('purchaseModal');
    const titleEl = document.getElementById('modalProductTitle');
    const priceEl = document.getElementById('modalProductPrice');
    const previewImg = document.getElementById('screenshotPreview');
    const dropzone = document.getElementById('screenshotDropzone');
    const fileInput = document.getElementById('screenshotFileInput');
    const contactInput = document.getElementById('userContactNumber');

    if (titleEl) titleEl.innerText = product.title;
    if (priceEl) priceEl.innerText = this.formatPrice(product.priceUSD, product.pricePKR);
    if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }
    if (dropzone) dropzone.querySelector('.dropzone-text').style.display = 'block';
    if (fileInput) fileInput.value = '';
    if (contactInput) contactInput.value = '';

    // Render payment methods tabs
    this.renderPaymentMethodOptions();

    if (modal) modal.classList.add('active');
  }

  updatePurchaseModalPrice() {
    if (!this.selectedProductForPurchase) return;
    const priceEl = document.getElementById('modalProductPrice');
    if (priceEl) {
      priceEl.innerText = this.formatPrice(
        this.selectedProductForPurchase.priceUSD,
        this.selectedProductForPurchase.pricePKR
      );
    }
  }

  renderPaymentMethodOptions() {
    const tabsContainer = document.getElementById('paymentTabs');
    const detailsContainer = document.getElementById('paymentDetailsBox');
    const methods = store.getPaymentMethods().filter(m => m.active);

    if (!methods || methods.length === 0) {
      if (detailsContainer) detailsContainer.innerHTML = '<p style="color:var(--text-muted)">No active payment method configured by admin.</p>';
      return;
    }

    this.activePaymentMethod = methods[0];

    // Render Tabs
    if (tabsContainer) {
      tabsContainer.innerHTML = methods.map((m, idx) => `
        <button type="button" class="payment-tab-btn ${idx === 0 ? 'active' : ''}" data-pay-id="${sanitize(m.id)}">
          ${sanitize(m.platform)}
        </button>
      `).join('');

      tabsContainer.querySelectorAll('.payment-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          tabsContainer.querySelectorAll('.payment-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.activePaymentMethod = methods.find(m => m.id === btn.dataset.payId);
          this.renderSelectedPaymentDetails();
        });
      });
    }

    this.renderSelectedPaymentDetails();
  }

  /**
   * Renders payment details:
   * CRITICAL REQUIREMENT: Account Title / Username is OPTIONAL!
   * If admin has provided it AND showTitle is true, show it.
   * If empty or false, do NOT show it at all!
   */
  renderSelectedPaymentDetails() {
    const container = document.getElementById('paymentDetailsBox');
    if (!container || !this.activePaymentMethod) return;

    const m = this.activePaymentMethod;
    const accNum = sanitize(m.accountNumber);

    container.innerHTML = `
      <div class="account-row">
        <span style="color: var(--text-secondary); font-size: 0.85rem;">Platform:</span>
        <strong style="color: #fff; font-family: var(--font-heading);">${sanitize(m.platform)}</strong>
      </div>

      <div class="account-row">
        <span style="color: var(--text-secondary); font-size: 0.85rem;">Account Number / Address:</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="account-val" id="copyAccVal">${accNum}</span>
          <button type="button" class="btn-copy-small" id="btnCopyAccNum">
            Copy
          </button>
        </div>
      </div>

      ${m.showTitle && m.accountTitle ? `
        <div class="account-row" style="border-top: 1px dashed var(--border-subtle); padding-top: 8px;">
          <span style="color: var(--text-secondary); font-size: 0.85rem;">Account Title:</span>
          <strong style="color: var(--neon-gold);">${sanitize(m.accountTitle)}</strong>
        </div>
      ` : ''}

      ${m.qrCode ? `
        <div class="payment-qr-container" style="text-align: center; margin: 12px 0; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px dashed var(--border-subtle);">
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px;">Scan QR Code to Pay:</div>
          <img src="${sanitize(m.qrCode)}" alt="Payment QR Code" style="max-width: 160px; max-height: 160px; border-radius: 6px; border: 2px solid var(--border-medium); display: inline-block;" />
        </div>
      ` : ''}

      ${m.instructions ? `
        <div style="margin-top: 12px; font-size: 0.8rem; color: var(--text-muted); background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px;">
          ℹ️ ${sanitize(m.instructions)}
        </div>
      ` : ''}
    `;

    // Safe copy button
    const copyBtn = document.getElementById('btnCopyAccNum');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyToClipboard(m.accountNumber));
    }
  }

  // --- UNLOCK SCRIPT VIA PREMIUM KEY MODAL ---
  openUnlockModal(scriptId) {
    const modal = document.getElementById('unlockKeyModal');
    const input = document.getElementById('unlockKeyInput');
    const resultBox = document.getElementById('unlockResultBox');

    if (modal) modal.classList.add('active');
    if (input) { input.value = ''; input.dataset.scriptId = scriptId; }
    if (resultBox) { resultBox.innerHTML = ''; resultBox.style.display = 'none'; }
  }

  submitPremiumKeyUnlock() {
    const input = document.getElementById('unlockKeyInput');
    const resultBox = document.getElementById('unlockResultBox');
    if (!input || !resultBox) return;

    const key = input.value.trim();
    const scriptId = input.dataset.scriptId;

    if (!key) {
      this.showToast("Please enter a valid VIP License Key.", "error");
      return;
    }

    const res = store.verifyPremiumKey(key, scriptId);

    if (res.success) {
      const script = store.getPremium().find(p => p.id === scriptId) || store.getPremium()[0];
      const scriptLink = sanitize(script?.scriptLink || '#');
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="background: rgba(0, 242, 152, 0.1); border: 1px solid var(--neon-bull); border-radius: 12px; padding: 18px; margin-top: 16px;">
          <h4 style="color: var(--neon-bull); font-family: var(--font-heading); margin-bottom: 8px;">
            🎉 Key Verified! Script Access Unlocked
          </h4>
          <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 12px;">
            Here is your exclusive invite-only TradingView link & setup instructions:
          </p>
          <div style="background: rgba(0,0,0,0.4); padding: 10px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.85rem; color: var(--neon-cyan); word-break: break-all; margin-bottom: 12px;">
            ${scriptLink}
          </div>
          <a href="${scriptLink}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="width: 100%; justify-content: center;">
            Open TradingView Script
          </a>
        </div>
      `;
      this.showToast("Script unlocked successfully!", "success");
    } else {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="background: rgba(255, 59, 105, 0.1); border: 1px solid var(--neon-bear); border-radius: 12px; padding: 14px; margin-top: 16px; color: var(--neon-bear); font-size: 0.9rem;">
          ❌ Ghalat VIP Password! Meharbani farma kr sahi key likhein ya support se rabta karein.
        </div>
      `;
    }
  }

  // --- EVENT BINDINGS ---
  bindEvents() {
    // Navigation Tabs (Desktop)
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Navigation Tabs (Mobile Docked Bottom Bar)
    document.querySelectorAll('#mobileBottomNav .mobile-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.tab) {
          this.switchTab(btn.dataset.tab);
        }
      });
    });

    // Currency Switcher Button (USD / PKR)
    const currBtn = document.getElementById('btnToggleCurrency');
    if (currBtn) {
      currBtn.addEventListener('click', () => this.toggleCurrency());
    }

    // Dismissible Announcement Ticker Bar
    const dismissTickerBtn = document.getElementById('btnDismissTicker');
    const tickerBar = document.getElementById('tickerBar');
    if (dismissTickerBtn && tickerBar) {
      if (sessionStorage.getItem('ticker_dismissed') === 'true') {
        tickerBar.style.display = 'none';
      }
      dismissTickerBtn.addEventListener('click', () => {
        tickerBar.style.display = 'none';
        sessionStorage.setItem('ticker_dismissed', 'true');
      });
    }

    // Category Filter Chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFilter = chip.dataset.filter || 'all';
        this.renderCurrentTab();
      });
    });

    // Catalog Sort Dropdown
    const sortSelect = document.getElementById('catalogSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.renderCurrentTab();
      });
    }

    // Search Input & Clear Search Button
    const searchInput = document.getElementById('catalogSearchInput');
    const clearSearchBtn = document.getElementById('btnClearSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (clearSearchBtn) {
          clearSearchBtn.style.display = this.searchQuery ? 'block' : 'none';
        }
        this.renderCurrentTab();
      });
    }
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        clearSearchBtn.style.display = 'none';
        this.renderCurrentTab();
      });
    }

    // --- GATEKEEPER MODAL CONTROLS ---
    // Non-Irritating Guest Access Handlers
    const grantGuest = () => {
      gatekeeper.grantGuestAccess();
      const modal = document.getElementById('gatekeeperModal');
      if (modal) modal.classList.remove('active');
      this.showToast("Guest Mode Active - You can browse free indicators & books!", "info");
    };

    const closeGateBtn = document.getElementById('btnCloseGatekeeper');
    const guestBrowseBtn = document.getElementById('btnGatekeeperGuestBrowse');
    if (closeGateBtn) closeGateBtn.addEventListener('click', grantGuest);
    if (guestBrowseBtn) guestBrowseBtn.addEventListener('click', grantGuest);

    // Gatekeeper Tab Switching (Password vs Social Join)
    const gateTabPass = document.getElementById('gateTabPassword');
    const gateTabSocial = document.getElementById('gateTabSocial');
    const gateViewPass = document.getElementById('gateViewPassword');
    const gateViewSocial = document.getElementById('gateViewSocial');

    if (gateTabPass && gateTabSocial) {
      gateTabPass.addEventListener('click', () => {
        gateTabPass.classList.add('active');
        gateTabSocial.classList.remove('active');
        gateViewPass.classList.add('active');
        gateViewSocial.classList.remove('active');
      });

      gateTabSocial.addEventListener('click', () => {
        gateTabSocial.classList.add('active');
        gateTabPass.classList.remove('active');
        gateViewSocial.classList.add('active');
        gateViewPass.classList.remove('active');
      });
    }

    // Gatekeeper Password Form Submit
    const gatePassForm = document.getElementById('gatekeeperPasswordForm');
    if (gatePassForm) {
      gatePassForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('gatePasswordInput');
        const alertBox = document.getElementById('gatePasswordAlert');
        const btn = document.getElementById('btnSubmitGatePassword');

        const pwd = input.value.trim();
        if (!pwd) return;

        btn.innerText = "Verifying...";
        btn.disabled = true;

        const res = await gatekeeper.unlockWithPassword(pwd);

        btn.innerText = "Unlock Access";
        btn.disabled = false;

        if (res.success) {
          alertBox.style.display = 'none';
          this.showToast(res.message, "success");
          this.checkGatekeeperStatus();
        } else {
          alertBox.style.display = 'block';
          alertBox.innerText = res.message;
        }
      });
    }

    // Gatekeeper Dynamic Social Confirm Button
    const confirmSocialBtn = document.getElementById('btnConfirmSocialJoin');
    const socialAlertBox = document.getElementById('gateSocialAlert');

    if (confirmSocialBtn) {
      confirmSocialBtn.addEventListener('click', () => {
        confirmSocialBtn.innerText = "Verifying Membership...";
        confirmSocialBtn.disabled = true;

        setTimeout(() => {
          confirmSocialBtn.innerText = "Confirm & Enter Site";
          confirmSocialBtn.disabled = false;

          const verification = gatekeeper.verifySocialEngagement();

          if (verification.verified) {
            socialAlertBox.style.display = 'none';
            this.showToast(verification.message, "success");
            this.checkGatekeeperStatus();
          } else {
            socialAlertBox.style.display = 'block';
            socialAlertBox.innerText = verification.message;
          }
        }, 500);
      });
    }

    // --- PURCHASE / PAYMENT MODAL DROPZONE & FILE INPUT ---
    const dropzone = document.getElementById('screenshotDropzone');
    const fileInput = document.getElementById('screenshotFileInput');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.processScreenshotFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.processScreenshotFile(e.target.files[0]);
        }
      });
    }

    // Direct WhatsApp Order Button in Purchase Modal
    const waOrderBtn = document.getElementById('btnOrderViaWhatsApp');
    if (waOrderBtn) {
      waOrderBtn.addEventListener('click', () => {
        if (!this.selectedProductForPurchase) {
          this.showToast("Please select a product first.", "error");
          return;
        }
        const prod = this.selectedProductForPurchase;
        const contactVal = document.getElementById('userContactNumber')?.value?.trim() || '';
        const notesVal = document.getElementById('userOrderNotes')?.value?.trim() || '';
        const method = this.activePaymentMethod?.platform || 'Direct Bank/Crypto';
        const priceStr = this.formatPrice(prod.priceUSD, prod.pricePKR);

        let msg = `Assalam-o-Alaikum! Mujhe TradingStore se yeh VIP product buy karna hai:\n\n`;
        msg += `📦 Product: ${prod.title}\n`;
        msg += `💰 Price: ${priceStr}\n`;
        msg += `💳 Selected Payment: ${method}\n`;
        if (contactVal) msg += `📱 Contact: ${contactVal}\n`;
        if (notesVal) msg += `📝 TradingView/Note: ${notesVal}\n`;
        msg += `\nPayment proof send kr raha/rahi hu. Kindly check and share VIP access key.`;

        const waUrl = this.getWhatsAppUrl(msg);
        window.open(waUrl, '_blank');
      });
    }

    // Payment Form Submit (User sends screenshot & contact number)
    const purchaseForm = document.getElementById('purchaseOrderForm');
    if (purchaseForm) {
      purchaseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const contactInput = document.getElementById('userContactNumber');
        const contact = contactInput ? contactInput.value.trim() : '';

        if (!contact) {
          this.showToast("Please enter your WhatsApp or Contact Number.", "error");
          return;
        }

        if (!this.uploadedScreenshotBase64) {
          this.showToast("Please attach payment proof screenshot.", "error");
          return;
        }

        // Add order to store
        const newOrder = store.addOrder({
          contactNumber: contact,
          productId: this.selectedProductForPurchase.id,
          productTitle: this.selectedProductForPurchase.title,
          platform: this.activePaymentMethod ? this.activePaymentMethod.platform : 'Direct',
          screenshot: this.uploadedScreenshotBase64,
          note: document.getElementById('userOrderNotes')?.value || ''
        });

        // Close modal
        this.closeModals();

        // Show Success Alert
        alert(`✅ Order Wasool Ho Gya Hai! (Order ID: ${newOrder.id})\n\nAap k diye gaye contact number (${contact}) par verification k bad Admin aap ko VIP Password send kr de ga.`);
        this.showToast("Order submitted successfully to Admin!", "success");
      });
    }

    // VIP Page Single Key Unlock Form
    const vipPageForm = document.getElementById('formVipPageKeyUnlock');
    if (vipPageForm) {
      vipPageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('inputVipPageKey');
        const alertBox = document.getElementById('vipPageKeyAlert');
        const key = input ? input.value.trim() : '';
        if (!key) return;

        const res = store.verifyPremiumKey(key);
        if (res.success) {
          if (alertBox) { alertBox.style.display = 'none'; }
          this.showToast("👑 VIP Suite Unlocked Successfully!", "success");
          this.renderPremium();
        } else {
          if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.style.background = 'rgba(255, 59, 105, 0.12)';
            alertBox.style.border = '1px solid var(--neon-bear)';
            alertBox.style.color = '#ff6b8b';
            alertBox.innerText = "❌ Ghalat VIP Password / Key! Meharbani farma kr sahi key likhein ya WhatsApp par support se rabta karein.";
          }
        }
      });
    }

    // VIP Page Relock Button
    const relockBtn = document.getElementById('btnRelockPremium');
    if (relockBtn) {
      relockBtn.addEventListener('click', () => {
        store.setPremiumPageUnlocked(false);
        this.showToast("VIP Page Locked.", "info");
        this.renderPremium();
      });
    }

    // Open VIP Purchase Modal Button
    const openVipBuyBtn = document.getElementById('btnOpenVipPurchaseModal');
    if (openVipBuyBtn) {
      openVipBuyBtn.addEventListener('click', () => {
        const premList = store.getPremium();
        const defaultProduct = premList[0] || { id: 'vip_suite', title: 'TradingStore VIP Suite', priceUSD: 49, pricePKR: 13500 };
        this.openPurchaseModal(defaultProduct.id);
      });
    }

    // Unlock Key Modal (from script modal or legacy trigger)
    const unlockBtn = document.getElementById('btnSubmitUnlockKey');
    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => this.submitPremiumKeyUnlock());
    }

    // Close Detail / Quick View Modal Button
    const closeDetailBtn = document.getElementById('btnCloseDetailModal');
    if (closeDetailBtn) {
      closeDetailBtn.addEventListener('click', () => {
        const modal = document.getElementById('productDetailModal');
        if (modal) modal.classList.remove('active');
      });
    }

    // General Modal Close Buttons
    document.querySelectorAll('.modal-close-btn, .modal-backdrop-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });

    // Hero Section Quick Action Buttons
    const heroExploreBtn = document.getElementById('btnHeroExploreAlgos');
    if (heroExploreBtn) {
      heroExploreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTab('bots');
        const botsSec = document.getElementById('page-bots');
        if (botsSec) botsSec.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const heroVipBtn = document.getElementById('btnHeroOpenVip');
    if (heroVipBtn) {
      heroVipBtn.addEventListener('click', () => {
        this.switchTab('premium');
        const premSec = document.getElementById('page-premium');
        if (premSec) premSec.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const heroCalcBtn = document.getElementById('btnHeroScrollCalc');
    if (heroCalcBtn) {
      heroCalcBtn.addEventListener('click', () => {
        const calcSec = document.getElementById('sectionRoiCalculator');
        if (calcSec) calcSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }

  processScreenshotFile(file) {
    if (!file.type.startsWith('image/')) {
      this.showToast("Please upload an image file (PNG, JPG, JPEG).", "error");
      return;
    }

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      this.showToast("File size too large. Maximum 5MB allowed.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedScreenshotBase64 = e.target.result;
      const previewImg = document.getElementById('screenshotPreview');
      const dropzone = document.getElementById('screenshotDropzone');
      if (previewImg && dropzone) {
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
        dropzone.querySelector('.dropzone-text').style.display = 'none';
      }
    };
    reader.readAsDataURL(file);
  }

  closeModals() {
    document.querySelectorAll('.modal-overlay:not(#gatekeeperModal)').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast("Copied to clipboard!", "info");
      });
    } else {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.showToast("Copied to clipboard!", "info");
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
    toast.innerHTML = `
      <span>${type === 'error' ? '⚠️' : type === 'success' ? '✓' : 'ℹ️'}</span>
      <span>${sanitize(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.tradingStoreApp = new TradingStoreApp();
  window.tradexApp = window.tradingStoreApp;
});
