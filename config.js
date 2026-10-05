/**
 * TRADINGSTORE - Configuration & Initial Data Store
 * Supports dual-mode persistence:
 * 1. LocalStorage & IndexedDB (Instant local & standalone preview)
 * 2. Optional Firebase Firestore (Realtime global sync on Vercel)
 */

export const APP_CONFIG = {
  appName: "TradingStore",
  tagline: "TradingView Scripts • Premium Bots • Trading Academy",
  version: "3.0.0",
  minEngagementSeconds: 8, // Strictly enforces the 8-second stealth rule
  
  // Default Admin Credentials (can be updated in Admin Settings)
  adminDefaults: {
    username: "admin",
    passwordHash: "admin", // default entry password for admin panel
    sessionDurationHours: 24
  },

  // Gatekeeper Channel Verification Links (Admin can add, remove, edit, toggle show/hide)
  // Supports 1 link, 2 links together ("dono aik sath"), 3 links ("ya 3 bi lga skoon"), or custom channels!
  defaultSocialLinks: [
    {
      id: "link_tg",
      platform: "telegram",
      title: "Join Official Telegram VIP Channel",
      url: "https://t.me/tradingstore_vip",
      active: true,
      color: "#2AABEE"
    },
    {
      id: "link_wa",
      platform: "whatsapp",
      title: "Join WhatsApp VIP Broadcast Channel",
      url: "https://whatsapp.com/channel/0029VaTradingStore",
      active: true,
      color: "#25D366"
    },
    {
      id: "link_yt",
      platform: "youtube",
      title: "Subscribe on YouTube for Strategy Tutorials",
      url: "https://youtube.com/@tradingstore",
      active: false, // Default hidden. Admin can turn ON to show 3 channels!
      color: "#FF0000"
    }
  ],

  // Gatekeeper Security Configuration
  gatekeeperConfig: {
    enabled: true,
    socialVerificationRequired: true,
    passwordUnlockRequired: true,
    minEngagementSeconds: 8 // Stealth engagement rule (8 seconds per link)
  },

  // Firebase Configuration (Optional: Paste your Firebase config here for live real-time multi-device sync on Vercel)
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
 * Included so the site looks ultra-premium and fully populated immediately!
 */
export const SEED_DATA = {
  // 1. TradingView Scripts & Trading Bots
  bots: [
    {
      id: "bot_1",
      title: "Sniper Flow Scalper v4.2",
      category: "scalping",
      market: "Crypto / Forex",
      timeframe: "1m - 5m - 15m",
      description: "High-probability algorithmic order block scalper with real-time liquidity sweep signals, auto stop-loss & take-profit dynamic projection lines.",
      features: ["Auto Liquidity Sweeps", "Dynamic TP/SL Bands", "Non-Repainting Signals", "Discord/Telegram Alerts"],
      logo: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=500&auto=format&fit=crop&q=80",
      tradingViewLink: "https://www.tradingview.com/script/sample-sniper-flow/",
      isFree: true,
      badge: "Trending",
      winRate: "78.4%",
      createdAt: "2026-01-10"
    },
    {
      id: "bot_2",
      title: "ICT Silver Bullet Matrix",
      category: "ict",
      market: "Forex & Indices (NQ, ES, XAU)",
      timeframe: "5m - 15m (NY/London)",
      description: "Automated Fair Value Gap (FVG) and Market Structure Shift (MSS) detector tuned for the classic 10:00 AM - 11:00 AM Silver Bullet windows.",
      features: ["Auto FVG Highlighter", "Session Timers Filter", "Killzone High/Low Marker", "Multi-Timeframe Confluence"],
      logo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&auto=format&fit=crop&q=80",
      tradingViewLink: "https://www.tradingview.com/script/sample-silver-bullet/",
      isFree: false,
      badge: "Institutional",
      winRate: "82.1%",
      createdAt: "2026-02-15"
    },
    {
      id: "bot_3",
      title: "Volume Profile & CVD Beast",
      category: "volume",
      market: "Crypto & Futures",
      timeframe: "All Timeframes",
      description: "Cumulative Volume Delta (CVD) divergence engine integrated with Point of Control (POC) migration signals and absorption clusters.",
      features: ["Realtime Delta Divergence", "Dynamic POC Levels", "Whale Absorption Detection", "Custom Audio Alerts"],
      logo: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=500&auto=format&fit=crop&q=80",
      tradingViewLink: "https://www.tradingview.com/script/sample-cvd-beast/",
      isFree: true,
      badge: "Popular",
      winRate: "74.8%",
      createdAt: "2026-02-28"
    },
    {
      id: "bot_4",
      title: "SuperTrend AI Momentum Oscillator",
      category: "momentum",
      market: "Forex & Crypto",
      timeframe: "15m - 1H - 4H",
      description: "Machine-learning weighted trend filter calculating volatility clustering to filter out chop and catch multi-day explosive trend moves.",
      features: ["AI Volatility Weighting", "Zero-Lag EMA Cross", "Chop Filter Engine", "Multi-Asset Ready"],
      logo: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=500&auto=format&fit=crop&q=80",
      tradingViewLink: "https://www.tradingview.com/script/sample-supertrend-ai/",
      isFree: true,
      badge: "Verified",
      winRate: "76.2%",
      createdAt: "2026-03-05"
    }
  ],

  // 2. Books & PDFs
  books: [
    {
      id: "book_1",
      title: "Mastering Smart Money Concepts (SMC) Bible",
      author: "Institutional FX Research Group",
      pages: "284 Pages",
      category: "SMC / ICT",
      description: "Comprehensive blueprint on Order Blocks, Liquidity Sweeps, Inducement, and High-Timeframe institutional delivery algorithms.",
      cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://drive.google.com/file/d/sample-smc-bible/view",
      fileType: "PDF eBook",
      rating: "4.9 / 5.0"
    },
    {
      id: "book_2",
      title: "Price Action & Naked Chart Trading Secret",
      author: "Alex Morgan, CMT",
      pages: "192 Pages",
      category: "Price Action",
      description: "Trade without lagging indicators. Learn pure candlestick behavior, wick rejection dynamics, and multi-session key level mapping.",
      cover: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://drive.google.com/file/d/sample-price-action/view",
      fileType: "PDF eBook",
      rating: "4.8 / 5.0"
    },
    {
      id: "book_3",
      title: "Trading in the Zone: Master Mindset Edition",
      author: "Psychology & Risk Lab",
      pages: "165 Pages",
      category: "Psychology",
      description: "Eliminate emotional revenge trading, fear of missing out (FOMO), and master consistent execution through statistical thinking.",
      cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://drive.google.com/file/d/sample-trading-zone/view",
      fileType: "PDF Guide",
      rating: "5.0 / 5.0"
    },
    {
      id: "book_4",
      title: "Volume Profile & Order Flow Playbook",
      author: "Pro Futures Desk",
      pages: "210 Pages",
      category: "Order Flow",
      description: "How to read Footprint Charts, Market Profile Value Areas (VAH/VAL), and auction market theory for surgical entries.",
      cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=80",
      downloadLink: "https://drive.google.com/file/d/sample-orderflow-playbook/view",
      fileType: "PDF Handbook",
      rating: "4.9 / 5.0"
    }
  ],

  // 3. Courses
  courses: [
    {
      id: "course_1",
      title: "Complete ICT 2026 Mentorship Accelerated",
      instructor: "Senior SMC Analyst",
      duration: "18 Hours • 32 Lessons",
      level: "Intermediate to Advanced",
      description: "Full step-by-step masterclass on Internal/External Range Liquidity, Fair Value Gaps, Daily Bias forecasting, and Silver Bullet setups.",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80",
      accessLink: "https://www.youtube.com/playlist?list=sample-ict-mentorship",
      badge: "Bestseller"
    },
    {
      id: "course_2",
      title: "Algorithmic PineScript v5 & Strategy Automation",
      instructor: "Quantitative Developer",
      duration: "12 Hours • 24 Lessons",
      level: "All Levels",
      description: "Build your own custom indicators, backtest quantitative strategies, and connect TradingView alerts directly to automated brokers and webhooks.",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=80",
      accessLink: "https://www.youtube.com/playlist?list=sample-pinescript-v5",
      badge: "Tech Mastery"
    },
    {
      id: "course_3",
      title: "Crypto Scalping & Orderbook DOM Domination",
      instructor: "Prop Firm Funded Trader",
      duration: "15 Hours • 28 Lessons",
      level: "Advanced",
      description: "Master level 2 order books, spoofing detection, footprint bid/ask delta, and 1-minute execution setups for volatile Bitcoin & Altcoin markets.",
      thumbnail: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&auto=format&fit=crop&q=80",
      accessLink: "https://www.youtube.com/playlist?list=sample-crypto-scalping",
      badge: "High ROI"
    }
  ],

  // 4. Premium TradingView Scripts (VIP Sales Hub)
  premium: [
    {
      id: "prem_1",
      title: "PRO ALGO APEX - Institutional Confluence Suite",
      tagline: "The Holy Grail of Algorithmic Confluence",
      priceUSD: 49,
      pricePKR: 13500,
      description: "Proprietary PineScript v5 script combining real-time liquidity sweep alerts, auto order blocks, institutional multi-timeframe trend ribbons, and dynamic risk-reward TP/SL markers with backtested 86% win rate.",
      banner: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&auto=format&fit=crop&q=80",
      features: [
        "Invite-Only TradingView Script Access",
        "Non-Repainting Signals on 1m, 5m, 15m, 1H",
        "Automated Realtime Telegram Alert Webhook",
        "Risk Calculator with Auto Lot Sizing",
        "Lifetime VIP Discord Strategy Group Access",
        "Free Future Updates & Optimization Tweaks"
      ],
      winRate: "86.4%",
      scriptLink: "https://www.tradingview.com/script/private-apex-algo-invite-only/",
      requiresKey: true
    },
    {
      id: "prem_2",
      title: "QUANTUM SMC - Auto Order Flow Matrix VIP",
      tagline: "Uncover Hidden Institutional Footprints",
      priceUSD: 39,
      pricePKR: 11000,
      description: "Detects institutional accumulation/distribution phases, premium vs discount pricing zones, Fair Value Gap mitigation, and liquidity pools before major market expansions.",
      banner: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
      features: [
        "Zero Lag Structure Shift (MSS) Indicator",
        "Real-Time Premium & Discount Equilibrium Box",
        "High-Probability Breaker Block Highlighting",
        "Forex, Crypto, Gold & US30 Optimized",
        "1-on-1 Setup Assistance via Telegram"
      ],
      winRate: "83.7%",
      scriptLink: "https://www.tradingview.com/script/private-quantum-smc-invite-only/",
      requiresKey: true
    }
  ],

  // Payment Methods Configured by Admin
  paymentMethods: [
    {
      id: "pay_1",
      platform: "JazzCash",
      accountNumber: "03001234567",
      accountTitle: "Muhammad Raza", // Optional - if empty or disabled, will not be shown
      showTitle: true,
      instructions: "JazzCash app se Send Money select karein, number enter karein aur receipt ka screenshot upload karein.",
      active: true
    },
    {
      id: "pay_2",
      platform: "EasyPaisa",
      accountNumber: "03451234567",
      accountTitle: "Muhammad Raza",
      showTitle: true,
      instructions: "EasyPaisa account me transfer kr k screenshot upload karein.",
      active: true
    },
    {
      id: "pay_3",
      platform: "Binance (USDT - TRC20)",
      accountNumber: "TX9K2q7PzSampleTRC20AddressTronNetwork123",
      accountTitle: "", // Left blank or hidden by admin
      showTitle: false,
      instructions: "Please send only USDT via TRC20 network. Double check the address before transferring.",
      active: true
    },
    {
      id: "pay_4",
      platform: "Bank Transfer",
      accountNumber: "PK78MEZN0012345678901234",
      accountTitle: "M RAZA TRADING",
      showTitle: true,
      instructions: "Meezan Bank. Send payment via Raast / IBFT and attach receipt screenshot.",
      active: true
    }
  ],

  // Site Access Passwords (with strict Device Limits)
  sitePasswords: [
    {
      id: "pwd_vip1",
      password: "STORE-VIP-2026",
      maxDevices: 1, // Strictly 1 device
      usedDevices: [], // Array of device fingerprints registered: [ { deviceId, userAgent, activatedAt } ]
      note: "Standard 1-Device VIP Access Key",
      status: "active",
      createdAt: "2026-03-01"
    },
    {
      id: "pwd_multi",
      password: "STORE-TEAM-ACCESS",
      maxDevices: 3, // Allowed on up to 3 devices
      usedDevices: [],
      note: "Team 3-Device Access Pass",
      status: "active",
      createdAt: "2026-03-01"
    }
  ],

  // Premium Script Unlock Passwords (issued by Admin after payment)
  premiumPasswords: [
    {
      id: "prem_key_1",
      key: "APEX-VIP-778899",
      targetScriptId: "prem_1",
      assignedTo: "03009988776",
      unlockedCount: 0,
      maxUses: 1,
      status: "active",
      createdAt: "2026-03-10"
    }
  ],

  // Orders & Payment Proof Submissions (received in Admin Panel)
  orders: [
    {
      id: "ORD-8941",
      contactNumber: "03129876543",
      productTitle: "PRO ALGO APEX - Institutional Confluence Suite",
      platform: "JazzCash",
      screenshot: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80",
      status: "pending", // pending, approved, rejected
      assignedPassword: "",
      submittedAt: "2026-03-31T14:22:00Z"
    }
  ]
};
