/**
 * TRADINGSTORE - Configuration & Initial Data Store
 * Supports dual-mode persistence:
 * 1. LocalStorage & IndexedDB (Instant local & standalone preview)
 * 2. Optional Firebase Firestore (Realtime global sync on Vercel)
 */

export const APP_CONFIG = {
  appName: "TradingStore",
  tagline: "Trading Bots, Books, Courses & VIP Academy",
  version: "4.0.0",
  minEngagementSeconds: 8, // Enforces the 8-second verification rule for social links
  
  // WhatsApp Support Number (Click-to-chat & Direct Inquiries)
  whatsappSupportNumber: "923001234567",
  
  // Default Currency & Exchange Rate
  currency: "USD",
  usdToPkrRate: 280,
  
  // Default Admin Credentials (can be updated in Admin Settings)
  adminDefaults: {
    username: "admin",
    passwordHash: "admin",
    sessionDurationHours: 24
  },

  // Lock 1: Site Entry Lock (First gate on site open)
  gatekeeperConfig: {
    title: "Site Entry Lock",
    enabled: true,
    mode: "strict",
    socialVerificationRequired: true,
    passwordUnlockRequired: true,
    minEngagementSeconds: 8,
    guestBrowsingAllowed: false
  },

  // Lock 2: Premium Page Lock (Lock on VIP Premium Page)
  premiumLockConfig: {
    title: "Premium Page Lock",
    enabled: true
  },

  // Gatekeeper Channel Verification Links (Admin can add, remove, edit, toggle show/hide)
  defaultSocialLinks: [
    {
      id: "link_tg",
      platform: "telegram",
      title: "Join Official Telegram Channel",
      url: "https://t.me/tradingstore_vip",
      active: true,
      color: "#2AABEE"
    },
    {
      id: "link_wa_channel",
      platform: "whatsapp",
      title: "Join WhatsApp Official Channel",
      url: "https://whatsapp.com/channel/0029VaTradingStore",
      active: true,
      color: "#25D366"
    },
    {
      id: "link_wa_group",
      platform: "whatsapp",
      title: "Join WhatsApp Discussion Group",
      url: "https://chat.whatsapp.com/sampleTradingGroup123",
      active: true,
      color: "#128C7E"
    },
    {
      id: "link_yt",
      platform: "youtube",
      title: "Subscribe on YouTube Channel",
      url: "https://youtube.com/@tradingstore",
      active: true,
      color: "#FF0000"
    },
    {
      id: "link_fb",
      platform: "facebook",
      title: "Follow Official Facebook Page",
      url: "https://facebook.com/tradingstore",
      active: false,
      color: "#1877F2"
    }
  ],

  // Curated High-Definition Trading Image Presets for 1-Click Selection in Admin
  imagePresets: [
    { label: "Candlestick Chart", url: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80" },
    { label: "SMC Order Blocks", url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80" },
    { label: "Crypto Delta CVD", url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80" },
    { label: "Gold & Trend AI", url: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&auto=format&fit=crop&q=80" },
    { label: "VIP Algo Matrix", url: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&auto=format&fit=crop&q=80" },
    { label: "Trading Book Cover", url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80" },
    { label: "Masterclass Video", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80" }
  ],

  // Firebase Configuration (Optional)
  firebaseConfig: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  }
};

/**
 * Rich Initial Seed Data
 * Stored with direct MediaFire / Google Drive links for items
 */
export const SEED_DATA = {
  // 1. Free Trading Bots / Scripts
  bots: [
    {
      id: "bot_1",
      title: "Sniper Flow Scalper v4.2",
      logo: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/sample_bot1/Sniper_Flow_Scalper.zip/file",
      category: "scalping",
      createdAt: "2026-01-10"
    },
    {
      id: "bot_2",
      title: "ICT Silver Bullet Matrix Bot",
      logo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/sample_bot2/ICT_Silver_Bullet.zip/file",
      category: "ict",
      createdAt: "2026-02-15"
    },
    {
      id: "bot_3",
      title: "Volume Profile & CVD Beast Script",
      logo: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/sample_bot3/CVD_Beast_Script.zip/file",
      category: "volume",
      createdAt: "2026-02-28"
    },
    {
      id: "bot_4",
      title: "SuperTrend AI Momentum Oscillator",
      logo: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://drive.google.com/file/d/sample_supertrend_ai/view",
      category: "momentum",
      createdAt: "2026-03-05"
    },
    {
      id: "bot_5",
      title: "Auto Liquidity Grab Pro",
      logo: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/sample_bot5/Auto_Liquidity_Pro.zip/file",
      category: "scalping",
      createdAt: "2026-03-12"
    },
    {
      id: "bot_6",
      title: "Breakout Sniper Engine",
      logo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://drive.google.com/file/d/sample_breakout_sniper/view",
      category: "momentum",
      createdAt: "2026-03-20"
    }
  ],

  // 2. Free Trading Books & PDFs
  books: [
    {
      id: "book_1",
      title: "Smart Money Concepts (SMC) Bible",
      logo: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/sample_book1/SMC_Bible.pdf/file",
      category: "SMC / ICT",
      createdAt: "2026-01-12"
    },
    {
      id: "book_2",
      title: "Price Action & Naked Chart Trading Secret",
      logo: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://drive.google.com/file/d/sample_priceaction_book/view",
      category: "Price Action",
      createdAt: "2026-01-25"
    },
    {
      id: "book_3",
      title: "Trading in the Zone (Master Mindset)",
      logo: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/sample_book3/Trading_In_Zone.pdf/file",
      category: "Psychology",
      createdAt: "2026-02-10"
    },
    {
      id: "book_4",
      title: "Volume Profile & Order Flow Playbook",
      logo: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://drive.google.com/file/d/sample_volume_playbook/view",
      category: "Order Flow",
      createdAt: "2026-02-22"
    },
    {
      id: "book_5",
      title: "ICT 2026 Core Content Handbook",
      logo: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/sample_book5/ICT_Handbook.pdf/file",
      category: "SMC / ICT",
      createdAt: "2026-03-01"
    },
    {
      id: "book_6",
      title: "Japanese Candlestick Mastery Guide",
      logo: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://drive.google.com/file/d/sample_candlestick/view",
      category: "Price Action",
      createdAt: "2026-03-15"
    }
  ],

  // 3. Free Trading Courses & Mentorships
  courses: [
    {
      id: "course_1",
      title: "Complete ICT 2026 Mentorship Full Course",
      logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/sample_course1/ICT_Mentorship_Full.zip/file",
      category: "Mentorship",
      createdAt: "2026-01-18"
    },
    {
      id: "course_2",
      title: "PineScript v5 & TradingView Automation",
      logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://drive.google.com/drive/folders/sample_pinescript_course",
      category: "Coding",
      createdAt: "2026-02-05"
    },
    {
      id: "course_3",
      title: "Crypto Scalping & Orderbook DOM Secrets",
      logo: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/sample_course3/Crypto_DOM_Scalping.zip/file",
      category: "Crypto",
      createdAt: "2026-02-18"
    },
    {
      id: "course_4",
      title: "Forex Institutional Supply & Demand",
      logo: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://drive.google.com/drive/folders/sample_forex_snd",
      category: "Forex",
      createdAt: "2026-03-02"
    },
    {
      id: "course_5",
      title: "Gold (XAUUSD) Scalping Strategy Blueprint",
      logo: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/sample_course5/Gold_Scalping_Course.zip/file",
      category: "Gold",
      createdAt: "2026-03-14"
    },
    {
      id: "course_6",
      title: "Risk Management & Prop Firm Evaluation Pass",
      logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://drive.google.com/drive/folders/sample_propfirm_pass",
      category: "Risk",
      createdAt: "2026-03-25"
    }
  ],

  // 4. Premium Section Sub-Pages (Unlocked via Premium Key)
  // Sub-Page 1: Premium Bots
  premiumBots: [
    {
      id: "prem_bot_1",
      title: "VIP Sniper Apex Algo Bot (91% WinRate)",
      logo: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/vip_bot1/VIP_Sniper_Apex.zip/file",
      category: "vip-bot",
      createdAt: "2026-03-01"
    },
    {
      id: "prem_bot_2",
      title: "Institutional Order Block Matrix Pro",
      logo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/vip_bot2/Order_Block_Matrix.zip/file",
      category: "vip-bot",
      createdAt: "2026-03-05"
    },
    {
      id: "prem_bot_3",
      title: "Gold 1-Minute Hyper Scalper Bot",
      logo: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://drive.google.com/file/d/vip_gold_scalper/view",
      category: "vip-bot",
      createdAt: "2026-03-10"
    }
  ],

  // Sub-Page 2: Premium Books
  premiumBooks: [
    {
      id: "prem_book_1",
      title: "Institutional Bank Order Flow Secrets (Unreleased)",
      logo: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/vip_book1/Bank_Orderflow_Secrets.pdf/file",
      category: "vip-book",
      createdAt: "2026-03-01"
    },
    {
      id: "prem_book_2",
      title: "Prop Firm VIP Pass Strategy Bible",
      logo: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://drive.google.com/file/d/vip_propfirm_bible/view",
      category: "vip-book",
      createdAt: "2026-03-08"
    },
    {
      id: "prem_book_3",
      title: "High-Frequency Algorithmic Architecture PDF",
      logo: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/vip_book3/HFT_Architecture.pdf/file",
      category: "vip-book",
      createdAt: "2026-03-15"
    }
  ],

  // Sub-Page 3: Premium Courses
  premiumCourses: [
    {
      id: "prem_course_1",
      title: "Private Funded Trader 1-on-1 Mentorship Vault",
      logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/vip_course1/Funded_Trader_Vault.zip/file",
      category: "vip-course",
      createdAt: "2026-03-01"
    },
    {
      id: "prem_course_2",
      title: "Dark Pool Liquidity & Market Maker Algorithms",
      logo: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://drive.google.com/drive/folders/vip_darkpool_course",
      category: "vip-course",
      createdAt: "2026-03-09"
    },
    {
      id: "prem_course_3",
      title: "Full Automated Bot Farm Setup Masterclass",
      logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://www.mediafire.com/file/vip_course3/Automated_Bot_Farm.zip/file",
      category: "vip-course",
      createdAt: "2026-03-18"
    }
  ],

  // Payment Accounts Configured by Admin for "Buy Key"
  paymentMethods: [
    {
      id: "pay_1",
      platform: "JazzCash",
      accountNumber: "03001234567",
      accountTitle: "Muhammad Raza",
      showTitle: true,
      instructions: "JazzCash app se payment send karein aur receipt ka screenshot attach karein.",
      active: true
    },
    {
      id: "pay_2",
      platform: "EasyPaisa",
      accountNumber: "03451234567",
      accountTitle: "Muhammad Raza",
      showTitle: true,
      instructions: "EasyPaisa account me transfer kr k screenshot attach karein.",
      active: true
    },
    {
      id: "pay_3",
      platform: "Binance (USDT - TRC20)",
      accountNumber: "TX9K2q7PzSampleTRC20AddressTronNetwork123",
      accountTitle: "TRC20 Wallet",
      showTitle: true,
      instructions: "Sirf USDT TRC20 network par send karein. TxID / Receipt ka screenshot attach karein.",
      active: true
    },
    {
      id: "pay_4",
      platform: "Bank Transfer",
      accountNumber: "PK78MEZN0012345678901234",
      accountTitle: "M RAZA TRADING",
      showTitle: true,
      instructions: "Meezan Bank. Raast / IBFT se payment send karein aur receipt upload karein.",
      active: true
    }
  ],

  // Lock 1: Site Entry Passwords (Entry Gate Keys)
  sitePasswords: [
    {
      id: "pwd_entry1",
      password: "TRADING-ENTRY-2026",
      maxDevices: 1,
      usedDevices: [],
      note: "Standard Site Entry Key",
      status: "active",
      createdAt: "2026-03-01"
    },
    {
      id: "pwd_entry2",
      password: "FREE-PASS-777",
      maxDevices: 5,
      usedDevices: [],
      note: "Community Access Key",
      status: "active",
      createdAt: "2026-03-01"
    }
  ],

  // Lock 2: Premium Page Passwords (VIP Page Keys)
  premiumPasswords: [
    {
      id: "prem_key_1",
      key: "PREMIUM-VIP-8899",
      assignedTo: "user@gmail.com",
      note: "Full VIP Hub License",
      unlockedCount: 0,
      status: "active",
      createdAt: "2026-03-10"
    },
    {
      id: "prem_key_2",
      key: "VIP-PASS-101",
      assignedTo: "03001234567",
      note: "Special VIP Key",
      unlockedCount: 0,
      status: "active",
      createdAt: "2026-03-15"
    }
  ],

  // Orders & Payment Proof Submissions (received in Admin Panel)
  orders: [
    {
      id: "ORD-8941",
      gmail: "customer@gmail.com",
      contactNumber: "03129876543",
      paymentMethod: "JazzCash",
      screenshot: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80",
      status: "pending",
      assignedPassword: "",
      submittedAt: "2026-03-31T14:22:00Z"
    }
  ]
};
