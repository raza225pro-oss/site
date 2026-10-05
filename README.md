# TradingStore - Algorithmic Scripts, Bots & Trading Academy Platform

> **TradingView Scripts • Premium Bots • Trading Books • Courses • VIP Sales Gateway • Executive Admin Panel**

---

## 🌟 Overview (Urdu / Roman Urdu Summary)

Yeh mukammal working trading website hai jo **single folder** me organized hai aur seedha GitHub par upload kar k Vercel par 1-click me deploy ho sakti hai. Is me 4 main user sections hain:

1. **Bots** (TradingView PineScript Indicators & Automated Scalping Bots)
2. **Books** (Price Action, SMC, ICT aur Technical Analysis PDF eBooks)
3. **Courses** (Video Trading Mentorships aur Institutional Playlists)
4. **Premium** (VIP Private Algorithmic Indicators jahan buyer Buy kar k payment screenshot upload karta hai aur VIP access key hasil karta hai)

Is website ke sath **Executive Admin Command Center** (`admin.html`) diya gaya hai jahan se aap:
- **Gatekeeper & Channel Links Management**:
  - Aap dynamic links manage kar sakte hain: Telegram, WhatsApp, YouTube, Discord, Instagram, etc.
  - **Dono aik sath laga sakte hain**, **aik laga sakte hain**, **aik hide kar sakte hain**, ya **3 ya is se zyada channels bhi laga sakte hain**!
  - **Stealth 8-Second Verification**: Visitor jab channels par 8 second spend karega tabhi unlock hoga, baghair kisi visible countdown timer ke.
- **Site Access Passwords (Device-Locked)**:
  - Passwords bana sakte hain **Device Limit** ke sath (e.g. 1 device, 2 devices). Hardware fingerprinting (Canvas, WebGL GPU, Screen hash) se doosri device automatically block ho jati hai.
- **Payment Methods**:
  - JazzCash, EasyPaisa, Binance USDT TRC20, Bank Transfer add/edit/hide kar sakte hain. **Account Title optional hai** (agar likhein to show hoga, khali chorein to user se mukammal hide ho jaye ga).
- **Orders & Screenshot Inbox**:
  - Customer payment screenshot proofs full zoom me check kar ke **1-click se VIP password issue** kar ke WhatsApp par bhej sakte hain.
- **Anti-Hack Admin Security**:
  - Default credentials: **`admin` / `admin`**
  - Settings me ja kar aap current password verify kar ke apna username aur password kabi bhi tabdeel kar sakte hain.
  - Brute-force protection: 5 ghalat attempts par 10 minute ka automatic lockout!

---

## 🚀 How to Run Locally (Apne Computer Par Kaise Chalayein)

Aap ke computer par Python ya Node mojood hai. Project folder me PowerShell ya Terminal kholein aur ye command chalayein:

```powershell
python -m http.server 3000
```
*(Ya `npx serve .`)*

Browser me ye URLs kholein:
- **Customer Portal**: `http://localhost:3000`
- **Admin Command Center**: `http://localhost:3000/admin.html`

---

## 🔐 Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin`
*(Aap Admin Panel ke 'Settings & Security' tab me ja kar username aur password asani se tabdeel kar sakte hain)*

---

## 🛡️ Key Features & Security Architecture

### 1. Dynamic Gatekeeper (1, 2, ya 3+ Channels Support)
- **Har active channel ki verification**:
  - Admin panel se aap channels add/edit/delete/hide kar sakte hain.
  - Agar 2 channels active hain to dono join karne zaroori hain.
  - Agar 1 channel active hai to sirf 1 channel join karna hoga.
  - Agar 3 ya 4 channels active hain to sab verify karne honge.
  - Har channel link click hone ke baad **8 seconds ka stealth background verification** hota hai baghair kisi countdown timer ke.
- **Device-Locked Access Password**:
  - Agar user ke paas site password hai, to wo direct enter kar sakta hai bashart-e-k us password ki device limit cross na hui ho.

### 2. Premium VIP Hub & Manual Payment Screenshot Workflow
- VIP indicator page par buyer **"Buy Now"** click karta hai.
- Payment Modal khulta hai jisme JazzCash, EasyPaisa, Binance USDT, ya Bank account show hota hai.
- Buyer apna **Contact Number (WhatsApp/Telegram)** likhta hai aur payment receipt ka **Screenshot upload** karta hai.
- Order submit hote hi Admin Panel ke **"Orders Inbox"** me notification ajata hai.
- Admin screenshot inspect kar ke **"Approve & Key"** dabata hai. System foran unique VIP access key banata hai aur buyer ko WhatsApp par send karne ka direct pre-filled link deta hai!

### 3. Anti-Hack Admin Security
- **No default plain text leak**: Session-based login (`sessionStorage`).
- **Brute Force Defense**: 5 continuous failed login attempts par 10 minute automatic cooldown lockout.
- **XSS & Injection Protection**: Tamam incoming customer and product inputs sanitized hain.
- **Password Change Protection**: Naya password set karne ke liye pehle current password verify karna lazmi hai.

---

## ☁️ Deployment Guide (GitHub & Vercel - Single Folder Ready)

Yeh poora project **Single Folder** (`trading site/`) me bana hua hai jisme koi extra backend ya build build step nahi hai.

### Step 1: Push to GitHub
1. [GitHub.com](https://github.com) par new repository banayein (e.g. `TradingStore`).
2. Is folder ke andar PowerShell / Terminal me ye commands chalayein:

```bash
git init
git add .
git commit -m "TradingStore platform initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TradingStore.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. [Vercel.com](https://vercel.com) par login karein.
2. **"Add New Project"** dabayein aur apni `TradingStore` GitHub repository import karein.
3. Framework Preset: **Other** / **Static** (Vercel automatically `vercel.json` detect kar lega).
4. **Deploy** button dabayein!
5. Sirf 10 seconds ke andar aap ki website live ho jaye gi!

### Optional: Realtime Multi-Device Cloud Sync
Website by default local storage + IndexedDB use karti hai. Agar aap chahte hain ke Vercel par alag alag computers/phones par real-time cloud sync ho:
1. [Firebase Console](https://console.firebase.google.com) par free project banayein.
2. Firestore Database create karein (Test mode).
3. Firebase configuration keys ko `js/config.js` me paste karein ya Admin Panel Settings me save karein.
4. Tamam devices live cloud Firestore se sync ho jayein gi!

---

## 📁 Project File Structure (Single Folder)

```
trading site/
├── index.html            # Main Customer Portal (Bots, Books, Courses, VIP, Gatekeeper, Buy Modal)
├── admin.html            # Executive Admin Command Center (Channels, Products, Keys, Orders, Settings)
├── package.json          # Project metadata & npm scripts
├── vercel.json           # Vercel deployment cache and headers configuration
├── .gitignore            # Git ignore rules
├── README.md             # Complete documentation & deployment guide
├── css/
│   ├── style.css         # Dark cyber glassmorphism design system & customer styling
│   └── admin.css         # Executive Admin Dashboard dark theme styling
├── js/
│   ├── config.js         # Configuration, default channels & seed trading data
│   ├── fingerprint.js    # Hardware device fingerprinting engine (Canvas, GPU, UUID)
│   ├── store.js          # Unified State Manager (LocalStorage + Firebase Cloud ready)
│   ├── gatekeeper.js     # Device-limit password checker & stealth 8s dynamic channel verification
│   ├── app.js            # Customer website logic (Live channels renderer, Buy modal, Key unlocker)
│   └── admin.js          # Admin dashboard controller (Channels manager, Passwords, Orders, Security)
└── assets/
    └── logo.svg          # TradingStore cyber candlestick brand logo
```

---

&copy; 2026 **TradingStore**. High-Performance Trading Community & Algorithmic Hub.
