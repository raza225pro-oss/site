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

    this.init();
  }

  async init() {
    // 1. Initialize Device Fingerprint & Gatekeeper
    await gatekeeper.init();
    this.checkGatekeeperStatus();

    // 2. Setup DOM Event Listeners
    this.bindEvents();

    // 3. Render Brand & Header
    this.renderBrandSettings();

    // 4. Initial Navigation and Render
    const hash = window.location.hash.replace('#', '') || 'bots';
    if (['bots', 'books', 'courses', 'premium'].includes(hash)) {
      this.switchTab(hash);
    } else {
      this.switchTab('bots');
    }

    // 5. Subscribe to store changes (Real-time update)
    store.subscribe(() => {
      this.renderBrandSettings();
      this.renderCurrentTab();
      if (!gatekeeper.isAuthorized()) {
        this.renderGatekeeperSocialLinks();
      }
    });
  }

  // --- BRANDING & LOGO ---
  renderBrandSettings() {
    const settings = store.getSiteSettings();
    const logoImg = document.getElementById('headerLogoImg');
    const brandName = document.getElementById('headerBrandName');
    const footerAppName = document.getElementById('footerAppName');

    if (brandName) brandName.innerText = settings.appName || "TradingStore";
    if (footerAppName) footerAppName.innerText = settings.appName || "TradingStore";

    if (logoImg) {
      if (settings.logoUrl) {
        logoImg.src = settings.logoUrl;
      } else {
        logoImg.src = "logo.svg";
      }
    }
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

  /**
   * Dynamically renders all active Gatekeeper Channel links
   * Supports: 1 link, 2 links together ("dono aik sath"), 3 links ("ya 3 bi lga skoon"),
   * or hiding any link ("aik hide kr skoon")!
   */
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

    // Attach click listener for each dynamic link
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

          // Stealth 8-second verification in background
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

    // Update active nav button
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update visible page section
    document.querySelectorAll('.content-page').forEach(page => {
      page.classList.toggle('active', page.id === `page-${tabName}`);
    });

    // Reset search & filters
    this.searchQuery = '';
    this.activeFilter = 'all';
    const searchInput = document.getElementById('catalogSearchInput');
    if (searchInput) searchInput.value = '';

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

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <h3>No Bots found matching your search.</h3>
        </div>`;
      return;
    }

    container.innerHTML = items.map(bot => `
      <div class="card-item">
        <div class="card-image-wrap">
          <img src="${sanitize(bot.logo || 'logo.svg')}" alt="${sanitize(bot.title)}" loading="lazy" />
          ${bot.badge ? `<span class="card-badge">${sanitize(bot.badge)}</span>` : ''}
          ${bot.winRate ? `<span class="card-winrate">Win: ${sanitize(bot.winRate)}</span>` : ''}
        </div>
        <div class="card-body">
          <div class="card-meta-row">
            <span>Market: <strong>${sanitize(bot.market || 'All')}</strong></span>
            <span>TF: <strong>${sanitize(bot.timeframe || 'Multi')}</strong></span>
          </div>
          <h3 class="card-title">${sanitize(bot.title)}</h3>
          <p class="card-desc">${sanitize(bot.description)}</p>
          <div class="card-tags">
            ${(bot.features || []).map(f => `<span class="tag-pill">${sanitize(f)}</span>`).join('')}
          </div>
          <div class="card-footer">
            <span style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--neon-bull);">
              ${bot.isFree ? 'FREE SCRIPT' : 'VIP ALGO'}
            </span>
            <a href="${sanitize(bot.tradingViewLink || '#')}" target="_blank" rel="noopener noreferrer" class="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              View on TradingView
            </a>
          </div>
        </div>
      </div>
    `).join('');
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

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <h3>No Trading Books found matching your search.</h3>
        </div>`;
      return;
    }

    container.innerHTML = items.map(book => `
      <div class="card-item">
        <div class="card-image-wrap">
          <img src="${sanitize(book.cover || 'logo.svg')}" alt="${sanitize(book.title)}" loading="lazy" />
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
          <div class="card-footer">
            <span class="tag-pill" style="color: var(--neon-bull); border-color: var(--border-glow);">${sanitize(book.category || 'Price Action')}</span>
            <a href="${sanitize(book.downloadLink || '#')}" target="_blank" rel="noopener noreferrer" class="btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download PDF
            </a>
          </div>
        </div>
      </div>
    `).join('');
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

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <h3>No Trading Courses found matching your search.</h3>
        </div>`;
      return;
    }

    container.innerHTML = items.map(course => `
      <div class="card-item">
        <div class="card-image-wrap">
          <img src="${sanitize(course.thumbnail || 'logo.svg')}" alt="${sanitize(course.title)}" loading="lazy" />
          ${course.badge ? `<span class="card-badge">${sanitize(course.badge)}</span>` : ''}
          <span class="card-winrate">${sanitize(course.duration || 'Video Class')}</span>
        </div>
        <div class="card-body">
          <div class="card-meta-row">
            <span>Mentor: <strong>${sanitize(course.instructor || 'Senior Mentor')}</strong></span>
            <span>Level: <strong>${sanitize(course.level || 'All Levels')}</strong></span>
          </div>
          <h3 class="card-title">${sanitize(course.title)}</h3>
          <p class="card-desc">${sanitize(course.description)}</p>
          <div class="card-footer">
            <span style="font-size: 0.8rem; color: var(--text-muted);">Full Syllabus Included</span>
            <a href="${sanitize(course.accessLink || '#')}" target="_blank" rel="noopener noreferrer" class="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
              Watch Course
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  // --- 4. RENDER PREMIUM HUB (UNIFIED VIP PAGE UNLOCK) ---
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

      if (isUnlocked) {
        // UNLOCKED STATE: Full access to private script and setup
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

            <div class="premium-card-actions">
              <a href="${scriptUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="width: 100%; justify-content: center; padding: 14px; text-decoration: none;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                Open / Add to TradingView
              </a>
            </div>
          </div>
        `;
      } else {
        // LOCKED STATE: Preview and purchase / enter key
        return `
          <div class="premium-card">
            <div class="premium-card-header">
              <span class="premium-tag">★ VIP ALGORITHM</span>
              <h3 class="card-title" style="font-size: 1.4rem;">${sanitize(prem.title)}</h3>
              <p style="color: var(--text-secondary); font-size: 0.9rem;">${sanitize(prem.tagline || '')}</p>
              <div class="pricing-box">
                <span class="price-usd">$${sanitize(prem.priceUSD || 49)}</span>
                <span class="price-pkr">/ PKR ${prem.pricePKR ? prem.pricePKR.toLocaleString() : '13,500'}</span>
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
                Buy VIP Access / Send Proof
              </button>
              <button class="btn-unlock-key" data-action="focus-key">
                Already have VIP Password? Enter Key Above ⬆
              </button>
            </div>
          </div>
        `;
      }
    }).join('');

    // Attach event listeners safely
    container.querySelectorAll('[data-action="purchase"]').forEach(btn => {
      btn.addEventListener('click', () => this.openPurchaseModal(btn.dataset.id));
    });
    container.querySelectorAll('[data-action="focus-key"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('inputVipPageKey');
        if (input) {
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          input.focus();
        }
      });
    });
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
    if (priceEl) priceEl.innerText = `$${product.priceUSD} (PKR ${product.pricePKR?.toLocaleString() || ''})`;
    if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }
    if (dropzone) dropzone.querySelector('.dropzone-text').style.display = 'block';
    if (fileInput) fileInput.value = '';
    if (contactInput) contactInput.value = '';

    // Render payment methods tabs
    this.renderPaymentMethodOptions();

    if (modal) modal.classList.add('active');
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
        btn.addEventListener('click', (e) => {
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
    // Navigation Tabs
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Category Filter Chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFilter = chip.dataset.filter || 'all';
        this.renderCurrentTab();
      });
    });

    // Search Input
    const searchInput = document.getElementById('catalogSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderCurrentTab();
      });
    }

    // --- GATEKEEPER MODAL CONTROLS ---
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

    // Stealth 8-Second Confirm Button (NO countdown timer displayed!)
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

    // Modal Close Buttons
    document.querySelectorAll('.modal-close-btn, .modal-backdrop-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });
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
