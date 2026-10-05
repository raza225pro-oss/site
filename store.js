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
    const keys = ['bots', 'books', 'courses', 'premium', 'paymentMethods', 'sitePasswords', 'premiumPasswords', 'orders', 'socialLinks', 'siteSettings', 'gatekeeperConfig'];
    
    keys.forEach(key => {
      const stored = localStorage.getItem(this.storageKeyPrefix + key);
      if (!stored) {
        if (key === 'socialLinks') {
          this.setLocal(key, APP_CONFIG.defaultSocialLinks);
        } else if (key === 'gatekeeperConfig') {
          this.setLocal(key, APP_CONFIG.gatekeeperConfig || {
            enabled: true,
            socialVerificationRequired: true,
            passwordUnlockRequired: true,
            minEngagementSeconds: 8
          });
        } else if (key === 'siteSettings') {
          this.setLocal(key, {
            appName: APP_CONFIG.appName,
            tagline: APP_CONFIG.tagline,
            logoUrl: "", // blank uses default svg
            adminPassword: APP_CONFIG.adminDefaults.passwordHash,
            adminUsername: APP_CONFIG.adminDefaults.username
          });
        } else if (SEED_DATA[key]) {
          this.setLocal(key, SEED_DATA[key]);
        }
      }
    });

    // Listen for storage changes across different browser tabs/windows
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith(this.storageKeyPrefix)) {
        this.notifyListeners();
      }
    });

    // Attempt Firebase setup if configuration is provided
    this.initFirebase();
  }

  /**
   * Optional Firebase Cloud Firestore live connection
   */
  async initFirebase() {
    const config = this.getFirebaseConfig();
    if (!config || !config.projectId || !config.apiKey) {
      return;
    }

    try {
      // Dynamic ESM import from Google Firebase CDN
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const { getFirestore, collection, doc, onSnapshot, setDoc, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      
      const app = initializeApp(config);
      this.db = getFirestore(app);
      this.isFirebaseReady = true;

      // Realtime listener for all collections
      ['bots', 'books', 'courses', 'premium', 'paymentMethods', 'sitePasswords', 'orders'].forEach(colName => {
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
      console.warn("Firebase initialization skipped or failed, using local/offline storage:", err);
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

  // --- CRUD: BOTS ---
  getBots() { return this.getLocal('bots', []); }
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

  // --- CRUD: BOOKS ---
  getBooks() { return this.getLocal('books', []); }
  saveBook(book) {
    const list = this.getBooks();
    const index = list.findIndex(b => b.id === book.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...book };
    } else {
      book.id = book.id || 'book_' + Date.now();
      list.unshift(book);
    }
    this.setLocal('books', list);
    return book;
  }
  deleteBook(id) {
    const list = this.getBooks().filter(b => b.id !== id);
    this.setLocal('books', list);
  }

  // --- CRUD: COURSES ---
  getCourses() { return this.getLocal('courses', []); }
  saveCourse(course) {
    const list = this.getCourses();
    const index = list.findIndex(c => c.id === course.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...course };
    } else {
      course.id = course.id || 'course_' + Date.now();
      list.unshift(course);
    }
    this.setLocal('courses', list);
    return course;
  }
  deleteCourse(id) {
    const list = this.getCourses().filter(c => c.id !== id);
    this.setLocal('courses', list);
  }

  // --- CRUD: PREMIUM SCRIPTS ---
  getPremium() { return this.getLocal('premium', []); }
  savePremium(item) {
    const list = this.getPremium();
    const index = list.findIndex(p => p.id === item.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...item };
    } else {
      item.id = item.id || 'prem_' + Date.now();
      list.unshift(item);
    }
    this.setLocal('premium', list);
    return item;
  }
  deletePremium(id) {
    const list = this.getPremium().filter(p => p.id !== id);
    this.setLocal('premium', list);
  }

  // --- CRUD: PAYMENT METHODS ---
  getPaymentMethods() { return this.getLocal('paymentMethods', []); }
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

  // --- SITE ACCESS PASSWORDS & DEVICE LIMIT ENFORCEMENT ---
  getSitePasswords() { return this.getLocal('sitePasswords', []); }
  
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

  /**
   * CRITICAL SECURITY CHECK:
   * Validates access password and enforces max device limits.
   * If current device is already registered, grants entry.
   * If not registered and devices count < maxDevices, registers this device and grants entry.
   * If devices count >= maxDevices, strictly rejects access!
   */
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
    const deviceId = deviceFingerprint.deviceId;

    // Check if this device is already in the authorized list for this password
    const existingIndex = target.usedDevices.findIndex(d => d.deviceId === deviceId);
    if (existingIndex >= 0) {
      // Already authorized on this device!
      target.usedDevices[existingIndex].lastSeen = new Date().toISOString();
      this.setLocal('sitePasswords', list);
      return { success: true, target, alreadyRegistered: true };
    }

    // Check device limit
    const maxAllowed = parseInt(target.maxDevices, 10) || 1;
    if (target.usedDevices.length >= maxAllowed) {
      return {
        success: false,
        reason: "DEVICE_LIMIT_REACHED",
        maxDevices: maxAllowed,
        currentCount: target.usedDevices.length
      };
    }

    // Register this new device
    target.usedDevices.push({
      deviceId: deviceId,
      platform: deviceFingerprint.platform,
      browser: deviceFingerprint.browser,
      screen: deviceFingerprint.screen,
      activatedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    });

    this.setLocal('sitePasswords', list);
    return { success: true, target, newRegistration: true };
  }

  // --- PREMIUM SCRIPT KEYS ---
  getPremiumPasswords() { return this.getLocal('premiumPasswords', []); }
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

  verifyPremiumKey(inputKey, scriptId) {
    if (!inputKey) return { success: false, reason: "EMPTY_KEY" };
    const cleanKey = inputKey.trim().toUpperCase();
    const list = this.getPremiumPasswords();
    
    const found = list.find(k => k.key.trim().toUpperCase() === cleanKey);
    if (!found) {
      return { success: false, reason: "INVALID_KEY" };
    }

    if (found.status !== 'active') {
      return { success: false, reason: "KEY_REVOKED" };
    }

    if (found.targetScriptId && found.targetScriptId !== 'all' && scriptId && found.targetScriptId !== scriptId) {
      return { success: false, reason: "KEY_FOR_DIFFERENT_SCRIPT" };
    }

    found.unlockedCount = (found.unlockedCount || 0) + 1;
    found.lastUsedAt = new Date().toISOString();
    this.setLocal('premiumPasswords', list);

    return { success: true, keyData: found };
  }

  // --- ORDERS & PAYMENT PROOF SUBMISSIONS ---
  getOrders() { return this.getLocal('orders', []); }
  
  addOrder(orderData) {
    const list = this.getOrders();
    const newOrder = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      contactNumber: orderData.contactNumber.trim(),
      productId: orderData.productId,
      productTitle: orderData.productTitle,
      platform: orderData.platform,
      screenshot: orderData.screenshot, // Base64 encoded image or URL
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

  // --- SOCIAL LINKS & GATEKEEPER CHANNELS ---
  getSocialLinks() {
    const data = this.getLocal('socialLinks', APP_CONFIG.defaultSocialLinks);
    // Migration: If data is old object format with telegramUrl, migrate to array!
    if (!Array.isArray(data)) {
      const migrated = [
        {
          id: "link_tg",
          platform: "telegram",
          title: data.telegramLabel || "Join Official Telegram VIP Channel",
          url: data.telegramUrl || "https://t.me/tradingstore_vip",
          active: true,
          color: "#2AABEE"
        },
        {
          id: "link_wa",
          platform: "whatsapp",
          title: data.whatsappLabel || "Join WhatsApp VIP Broadcast Channel",
          url: data.whatsappUrl || "https://whatsapp.com/channel/0029VaTradingStore",
          active: true,
          color: "#25D366"
        },
        {
          id: "link_yt",
          platform: "youtube",
          title: "Subscribe on YouTube for Strategy Tutorials",
          url: "https://youtube.com/@tradingstore",
          active: false,
          color: "#FF0000"
        }
      ];
      this.setLocal('socialLinks', migrated);
      return migrated;
    }
    return data;
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

  // --- GATEKEEPER SETTINGS ---
  getGatekeeperConfig() {
    return this.getLocal('gatekeeperConfig', APP_CONFIG.gatekeeperConfig || {
      enabled: true,
      socialVerificationRequired: true,
      passwordUnlockRequired: true,
      minEngagementSeconds: 8
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
      adminPassword: APP_CONFIG.adminDefaults.passwordHash,
      adminUsername: APP_CONFIG.adminDefaults.username
    });
  }

  saveSiteSettings(settings) {
    this.setLocal('siteSettings', settings);
  }

  // Restore factory seed data
  resetAll() {
    Object.keys(SEED_DATA).forEach(key => {
      this.setLocal(key, SEED_DATA[key]);
    });
    this.setLocal('socialLinks', APP_CONFIG.defaultSocialLinks);
    this.setLocal('gatekeeperConfig', APP_CONFIG.gatekeeperConfig);
    this.notifyListeners();
  }
}

export const store = new DataStore();
