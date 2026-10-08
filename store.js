/**
 * TRADINGSTORE - Unified State Management & Persistence Engine
 * Supports local instant storage + Realtime Firebase Cloud Firestore sync for Vercel
 */

import { APP_CONFIG, SEED_DATA } from './config.js';

class DataStore {
  constructor() {
    this.storageKeyPrefix = 'tradingstore_';
    this.listeners = new Set();
    this.isFirebaseReady = false;
    this.db = null;
    this.init();
  }

  /**
   * Initializes store with seed data if empty, and sets up cross-tab synchronization
   */
  init() {
    const keys = [
      'bots', 'books', 'courses',
      'premiumBots', 'premiumBooks', 'premiumCourses',
      'paymentMethods', 'sitePasswords', 'premiumPasswords',
      'orders', 'socialLinks', 'siteSettings',
      'gatekeeperConfig', 'premiumLockConfig'
    ];
    
    keys.forEach(key => {
      const stored = localStorage.getItem(this.storageKeyPrefix + key);
      if (!stored) {
        if (key === 'socialLinks') {
          this.setLocal(key, APP_CONFIG.defaultSocialLinks);
        } else if (key === 'gatekeeperConfig') {
          this.setLocal(key, APP_CONFIG.gatekeeperConfig || {
            title: "Site Entry Lock",
            enabled: true,
            mode: "strict",
            socialVerificationRequired: true,
            passwordUnlockRequired: true,
            minEngagementSeconds: 8,
            guestBrowsingAllowed: false
          });
        } else if (key === 'premiumLockConfig') {
          this.setLocal(key, APP_CONFIG.premiumLockConfig || {
            title: "Premium Page Lock",
            enabled: true
          });
        } else if (key === 'siteSettings') {
          this.setLocal(key, {
            appName: APP_CONFIG.appName,
            tagline: APP_CONFIG.tagline,
            logoUrl: "",
            whatsappSupportNumber: APP_CONFIG.whatsappSupportNumber || "923001234567",
            currency: APP_CONFIG.currency || "USD",
            usdToPkrRate: APP_CONFIG.usdToPkrRate || 280,
            adminPassword: APP_CONFIG.adminDefaults.passwordHash,
            adminUsername: APP_CONFIG.adminDefaults.username
          });
        } else if (SEED_DATA[key]) {
          this.setLocal(key, SEED_DATA[key]);
        }
      }
    });

    // Cross-tab synchronization
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith(this.storageKeyPrefix)) {
        this.notifyListeners();
      }
    });

    // Attempt Firebase setup if configuration is provided
    this.initFirebase();
  }

  async initFirebase() {
    const config = this.getFirebaseConfig();
    if (!config || !config.projectId || !config.apiKey) {
      return;
    }

    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const { getFirestore, collection, doc, onSnapshot, setDoc, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      
      const app = initializeApp(config);
      this.db = getFirestore(app);
      this.isFirebaseReady = true;

      ['bots', 'books', 'courses', 'premiumBots', 'premiumBooks', 'premiumCourses', 'paymentMethods', 'sitePasswords', 'premiumPasswords', 'orders'].forEach(colName => {
        onSnapshot(collection(this.db, colName), (snapshot) => {
          const items = [];
          snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
          if (items.length > 0) {
            this.setLocal(colName, items);
            this.notifyListeners();
          }
        });
      });
    } catch (err) {
      console.warn("Firebase initialization skipped, using local storage:", err);
    }
  }

  getFirebaseConfig() {
    const custom = localStorage.getItem(this.storageKeyPrefix + 'firebaseConfig');
    if (custom) {
      try { return JSON.parse(custom); } catch (e) {}
    }
    return APP_CONFIG.firebaseConfig;
  }

  saveFirebaseConfig(config) {
    localStorage.setItem(this.storageKeyPrefix + 'firebaseConfig', JSON.stringify(config));
    this.initFirebase();
  }

  getLocal(key, fallback = []) {
    try {
      const data = localStorage.getItem(this.storageKeyPrefix + key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  setLocal(key, value) {
    try {
      localStorage.setItem(this.storageKeyPrefix + key, JSON.stringify(value));
      this.notifyListeners();
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(); } catch (e) { console.error(e); }
    });
  }

  // =========================================================================
  // FREE ITEMS: BOTS, BOOKS, COURSES (MediaFire / Google Drive Links)
  // =========================================================================

  // 1. FREE BOTS
  getBots() { return this.getLocal('bots', SEED_DATA.bots || []); }
  saveBot(bot) {
    const list = this.getBots();
    const index = list.findIndex(b => b.id === bot.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...bot };
    } else {
      bot.id = bot.id || 'bot_' + Date.now();
      bot.createdAt = new Date().toISOString();
      list.unshift(bot);
    }
    this.setLocal('bots', list);
    return bot;
  }
  deleteBot(id) {
    const list = this.getBots().filter(b => b.id !== id);
    this.setLocal('bots', list);
  }

  // 2. FREE BOOKS
  getBooks() { return this.getLocal('books', SEED_DATA.books || []); }
  saveBook(book) {
    const list = this.getBooks();
    const index = list.findIndex(b => b.id === book.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...book };
    } else {
      book.id = book.id || 'book_' + Date.now();
      book.createdAt = new Date().toISOString();
      list.unshift(book);
    }
    this.setLocal('books', list);
    return book;
  }
  deleteBook(id) {
    const list = this.getBooks().filter(b => b.id !== id);
    this.setLocal('books', list);
  }

  // 3. FREE COURSES
  getCourses() { return this.getLocal('courses', SEED_DATA.courses || []); }
  saveCourse(course) {
    const list = this.getCourses();
    const index = list.findIndex(c => c.id === course.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...course };
    } else {
      course.id = course.id || 'course_' + Date.now();
      course.createdAt = new Date().toISOString();
      list.unshift(course);
    }
    this.setLocal('courses', list);
    return course;
  }
  deleteCourse(id) {
    const list = this.getCourses().filter(c => c.id !== id);
    this.setLocal('courses', list);
  }

  // =========================================================================
  // PREMIUM VIP SUB-PAGES: BOTS, BOOKS, COURSES (Inside Premium Hub)
  // =========================================================================

  // 1. PREMIUM BOTS
  getPremiumBots() {
    let list = this.getLocal('premiumBots', null);
    if (!list || list.length === 0) {
      list = SEED_DATA.premiumBots || [];
      this.setLocal('premiumBots', list);
    }
    return list;
  }
  savePremiumBot(bot) {
    const list = this.getPremiumBots();
    const index = list.findIndex(b => b.id === bot.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...bot };
    } else {
      bot.id = bot.id || 'prem_bot_' + Date.now();
      bot.createdAt = new Date().toISOString();
      list.unshift(bot);
    }
    this.setLocal('premiumBots', list);
    return bot;
  }
  deletePremiumBot(id) {
    const list = this.getPremiumBots().filter(b => b.id !== id);
    this.setLocal('premiumBots', list);
  }

  // 2. PREMIUM BOOKS
  getPremiumBooks() {
    let list = this.getLocal('premiumBooks', null);
    if (!list || list.length === 0) {
      list = SEED_DATA.premiumBooks || [];
      this.setLocal('premiumBooks', list);
    }
    return list;
  }
  savePremiumBook(book) {
    const list = this.getPremiumBooks();
    const index = list.findIndex(b => b.id === book.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...book };
    } else {
      book.id = book.id || 'prem_book_' + Date.now();
      book.createdAt = new Date().toISOString();
      list.unshift(book);
    }
    this.setLocal('premiumBooks', list);
    return book;
  }
  deletePremiumBook(id) {
    const list = this.getPremiumBooks().filter(b => b.id !== id);
    this.setLocal('premiumBooks', list);
  }

  // 3. PREMIUM COURSES
  getPremiumCourses() {
    let list = this.getLocal('premiumCourses', null);
    if (!list || list.length === 0) {
      list = SEED_DATA.premiumCourses || [];
      this.setLocal('premiumCourses', list);
    }
    return list;
  }
  savePremiumCourse(course) {
    const list = this.getPremiumCourses();
    const index = list.findIndex(c => c.id === course.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...course };
    } else {
      course.id = course.id || 'prem_course_' + Date.now();
      course.createdAt = new Date().toISOString();
      list.unshift(course);
    }
    this.setLocal('premiumCourses', list);
    return course;
  }
  deletePremiumCourse(id) {
    const list = this.getPremiumCourses().filter(c => c.id !== id);
    this.setLocal('premiumCourses', list);
  }

  // Backward compatibility helper
  getPremium() {
    return this.getPremiumBots();
  }

  // =========================================================================
  // LOCK 1: SITE ENTRY LOCK & PASSWORDS
  // =========================================================================
  getSitePasswords() { return this.getLocal('sitePasswords', SEED_DATA.sitePasswords || []); }
  
  saveSitePassword(passwordObj) {
    const list = this.getSitePasswords();
    const index = list.findIndex(p => p.id === passwordObj.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...passwordObj };
    } else {
      passwordObj.id = passwordObj.id || 'pwd_' + Date.now();
      passwordObj.usedDevices = passwordObj.usedDevices || [];
      passwordObj.status = passwordObj.status || 'active';
      passwordObj.createdAt = new Date().toISOString();
      list.unshift(passwordObj);
    }
    this.setLocal('sitePasswords', list);
    return passwordObj;
  }

  deleteSitePassword(id) {
    const list = this.getSitePasswords().filter(p => p.id !== id);
    this.setLocal('sitePasswords', list);
  }

  resetPasswordDevices(passwordId) {
    const list = this.getSitePasswords();
    const pwd = list.find(p => p.id === passwordId);
    if (pwd) {
      pwd.usedDevices = [];
      this.setLocal('sitePasswords', list);
      return true;
    }
    return false;
  }

  verifyAndActivateSitePassword(inputPassword, deviceFingerprint) {
    if (!inputPassword) return { success: false, reason: "EMPTY_PASSWORD" };
    
    const cleanInput = inputPassword.trim();
    const list = this.getSitePasswords();
    
    const target = list.find(p => p.password.trim().toLowerCase() === cleanInput.toLowerCase());
    
    if (!target) {
      return { success: false, reason: "INVALID_PASSWORD" };
    }

    if (target.status !== 'active') {
      return { success: false, reason: "PASSWORD_INACTIVE" };
    }

    target.usedDevices = target.usedDevices || [];
    const deviceId = (deviceFingerprint && deviceFingerprint.deviceId) || 'browser_dev_' + Math.random().toString(36).substring(2, 9);

    const existingIndex = target.usedDevices.findIndex(d => d.deviceId === deviceId);
    if (existingIndex >= 0) {
      target.usedDevices[existingIndex].lastSeen = new Date().toISOString();
      this.setLocal('sitePasswords', list);
      return { success: true, target, alreadyRegistered: true };
    }

    const maxAllowed = parseInt(target.maxDevices, 10) || 1;
    if (target.usedDevices.length >= maxAllowed) {
      return {
        success: false,
        reason: "DEVICE_LIMIT_REACHED",
        maxDevices: maxAllowed,
        currentCount: target.usedDevices.length
      };
    }

    target.usedDevices.push({
      deviceId: deviceId,
      platform: (deviceFingerprint && deviceFingerprint.platform) || 'web',
      activatedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    });

    this.setLocal('sitePasswords', list);
    return { success: true, target, newRegistration: true };
  }

  // =========================================================================
  // LOCK 2: PREMIUM PAGE LOCK & VIP LICENSE KEYS
  // =========================================================================
  getPremiumLockConfig() {
    return this.getLocal('premiumLockConfig', APP_CONFIG.premiumLockConfig || {
      title: "Premium Page Lock",
      enabled: true
    });
  }

  savePremiumLockConfig(config) {
    this.setLocal('premiumLockConfig', config);
  }

  isPremiumLockEnabled() {
    const config = this.getPremiumLockConfig();
    return config && config.enabled !== false;
  }

  getPremiumPasswords() { return this.getLocal('premiumPasswords', SEED_DATA.premiumPasswords || []); }

  savePremiumPassword(keyObj) {
    const list = this.getPremiumPasswords();
    const index = list.findIndex(k => k.id === keyObj.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...keyObj };
    } else {
      keyObj.id = keyObj.id || 'prem_key_' + Date.now();
      keyObj.status = keyObj.status || 'active';
      keyObj.unlockedCount = 0;
      keyObj.createdAt = new Date().toISOString();
      list.unshift(keyObj);
    }
    this.setLocal('premiumPasswords', list);
    return keyObj;
  }

  deletePremiumPassword(id) {
    const list = this.getPremiumPasswords().filter(k => k.id !== id);
    this.setLocal('premiumPasswords', list);
  }

  verifyPremiumKey(inputKey) {
    if (!inputKey) return { success: false, reason: "EMPTY_KEY" };
    const cleanKey = inputKey.trim().toUpperCase();
    const list = this.getPremiumPasswords();
    
    const found = list.find(k => k.key && k.key.trim().toUpperCase() === cleanKey);
    if (!found) {
      return { success: false, reason: "INVALID_KEY" };
    }

    if (found.status !== 'active') {
      return { success: false, reason: "KEY_REVOKED" };
    }

    found.unlockedCount = (found.unlockedCount || 0) + 1;
    found.lastUsedAt = new Date().toISOString();
    this.setLocal('premiumPasswords', list);

    this.setPremiumPageUnlocked(true, cleanKey);
    return { success: true, keyData: found };
  }

  isPremiumPageUnlocked() {
    if (!this.isPremiumLockEnabled()) return true;
    try {
      const unlocked = localStorage.getItem('tradingstore_premium_unlocked') === 'true';
      if (!unlocked) return false;
      const activeKey = (localStorage.getItem('tradingstore_premium_active_key') || '').trim().toUpperCase();
      if (activeKey) {
        const list = this.getPremiumPasswords();
        const found = list.find(k => k.key && k.key.trim().toUpperCase() === activeKey);
        if (!found || found.status !== 'active') {
          // Key was revoked or deleted by admin! Auto-lock!
          this.setPremiumPageUnlocked(false);
          return false;
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  setPremiumPageUnlocked(status, activeKey = '') {
    try {
      if (status) {
        localStorage.setItem('tradingstore_premium_unlocked', 'true');
        if (activeKey) localStorage.setItem('tradingstore_premium_active_key', activeKey);
      } else {
        localStorage.removeItem('tradingstore_premium_unlocked');
        localStorage.removeItem('tradingstore_premium_active_key');
      }
    } catch (e) {}
    this.notifyListeners();
  }

  // =========================================================================
  // PAYMENT METHODS (JazzCash, EasyPaisa, TRC20, Bank)
  // =========================================================================
  getPaymentMethods() { return this.getLocal('paymentMethods', SEED_DATA.paymentMethods || []); }

  savePaymentMethod(method) {
    const list = this.getPaymentMethods();
    const index = list.findIndex(m => m.id === method.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...method };
    } else {
      method.id = method.id || 'pay_' + Date.now();
      list.push(method);
    }
    this.setLocal('paymentMethods', list);
    return method;
  }

  deletePaymentMethod(id) {
    const list = this.getPaymentMethods().filter(m => m.id !== id);
    this.setLocal('paymentMethods', list);
  }

  // =========================================================================
  // ORDERS & PAYMENT PROOF SUBMISSIONS (GMAIL MUST, CONTACT, SCREENSHOT)
  // =========================================================================
  getOrders() { return this.getLocal('orders', SEED_DATA.orders || []); }
  
  addOrder(orderData) {
    const list = this.getOrders();
    const newOrder = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      gmail: (orderData.gmail || '').trim(), // Gmail is mandatory
      contactNumber: (orderData.contactNumber || '').trim(), // WhatsApp or Telegram
      platform: orderData.platform || 'JazzCash',
      screenshot: orderData.screenshot || '', // Base64 or URL
      note: orderData.note || '',
      status: 'pending', // pending, approved, rejected
      assignedPassword: '',
      submittedAt: new Date().toISOString()
    };
    list.unshift(newOrder);
    this.setLocal('orders', list);
    return newOrder;
  }

  updateOrderStatus(orderId, status, assignedPassword = '') {
    const list = this.getOrders();
    const order = list.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (assignedPassword) order.assignedPassword = assignedPassword;
      order.updatedAt = new Date().toISOString();
      this.setLocal('orders', list);
      return true;
    }
    return false;
  }

  deleteOrder(orderId) {
    const list = this.getOrders().filter(o => o.id !== orderId);
    this.setLocal('orders', list);
  }

  // =========================================================================
  // SOCIAL LINKS & CHANNEL VERIFICATION
  // =========================================================================
  getSocialLinks() {
    return this.getLocal('socialLinks', APP_CONFIG.defaultSocialLinks);
  }

  getActiveSocialLinks() {
    return this.getSocialLinks().filter(l => l.active !== false);
  }

  saveSocialLinks(links) {
    this.setLocal('socialLinks', links);
  }

  saveSocialLink(linkObj) {
    const list = this.getSocialLinks();
    if (linkObj.id) {
      const idx = list.findIndex(l => l.id === linkObj.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...linkObj };
      } else {
        list.push(linkObj);
      }
    } else {
      linkObj.id = 'link_' + Date.now();
      if (linkObj.active === undefined) linkObj.active = true;
      list.push(linkObj);
    }
    this.setLocal('socialLinks', list);
    return linkObj;
  }

  toggleSocialLinkActive(id) {
    const list = this.getSocialLinks();
    const target = list.find(l => l.id === id);
    if (target) {
      target.active = !target.active;
      this.setLocal('socialLinks', list);
      return target;
    }
    return null;
  }

  deleteSocialLink(id) {
    const list = this.getSocialLinks().filter(l => l.id !== id);
    this.setLocal('socialLinks', list);
  }

  // =========================================================================
  // GATEKEEPER (LOCK 1: SITE ENTRY LOCK) & SITE SETTINGS
  // =========================================================================
  getGatekeeperConfig() {
    return this.getLocal('gatekeeperConfig', APP_CONFIG.gatekeeperConfig || {
      title: "Site Entry Lock",
      enabled: true,
      mode: "strict",
      socialVerificationRequired: true,
      passwordUnlockRequired: true,
      minEngagementSeconds: 8,
      guestBrowsingAllowed: false
    });
  }

  saveGatekeeperConfig(config) {
    this.setLocal('gatekeeperConfig', config);
  }

  getSiteSettings() {
    return this.getLocal('siteSettings', {
      appName: APP_CONFIG.appName,
      tagline: APP_CONFIG.tagline,
      logoUrl: "",
      whatsappSupportNumber: APP_CONFIG.whatsappSupportNumber || "923001234567",
      currency: APP_CONFIG.currency || "USD",
      usdToPkrRate: APP_CONFIG.usdToPkrRate || 280,
      adminPassword: APP_CONFIG.adminDefaults.passwordHash,
      adminUsername: APP_CONFIG.adminDefaults.username
    });
  }

  saveSiteSettings(settings) {
    this.setLocal('siteSettings', settings);
  }

  getCuratedPresets() {
    return APP_CONFIG.imagePresets || [];
  }

  resetAll() {
    Object.keys(SEED_DATA).forEach(key => {
      this.setLocal(key, SEED_DATA[key]);
    });
    this.setLocal('socialLinks', APP_CONFIG.defaultSocialLinks);
    this.setLocal('gatekeeperConfig', APP_CONFIG.gatekeeperConfig);
    this.setLocal('premiumLockConfig', APP_CONFIG.premiumLockConfig);
    this.notifyListeners();
  }
}

export const store = new DataStore();
