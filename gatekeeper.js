/**
 * TRADINGSTORE - Dynamic Gatekeeper Engine
 * 1. Device-Locked Access Passwords (with strict per-device hardware limits)
 * 2. Dynamic Stealth Social Verification (1, 2, 3, or more links: Telegram, WhatsApp, YouTube, etc.)
 *    with NO visible countdown (stealth engagement verification rule).
 */

import { store } from './store.js';
import { DeviceFingerprint } from './fingerprint.js';
import { APP_CONFIG } from './config.js';

export class Gatekeeper {
  constructor() {
    this.sessionKey = 'tradingstore_access_v3';
    this.deviceInfo = null;
    
    // Dynamic tracking map: { [linkId]: { clicked: boolean, timestamp: number } }
    this.linkTracking = {};
  }

  async init() {
    this.deviceInfo = await DeviceFingerprint.getFingerprint();
    return this.deviceInfo;
  }

  /**
   * Returns configured stealth engagement time in ms (default 8s)
   */
  getMinEngagementMs() {
    const config = store.getGatekeeperConfig();
    const sec = (config && config.minEngagementSeconds) || APP_CONFIG.minEngagementSeconds || 8;
    return sec * 1000;
  }

  /**
   * Checks if gatekeeper security is enabled globally
   */
  isEnabled() {
    const config = store.getGatekeeperConfig();
    return config && config.enabled !== false;
  }

  /**
   * Checks if this device currently has an authorized, active session
   */
  isAuthorized() {
    if (!this.isEnabled()) return true;

    try {
      const authData = localStorage.getItem(this.sessionKey);
      if (!authData) return false;
      const parsed = JSON.parse(authData);
      
      if (parsed && parsed.authorized === true) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Grant session authorization to this device
   */
  grantAccess(type = 'social', meta = {}) {
    const authRecord = {
      authorized: true,
      type: type,
      grantedAt: new Date().toISOString(),
      deviceId: this.deviceInfo ? this.deviceInfo.deviceId : 'unknown',
      ...meta
    };
    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(authRecord));
    } catch (e) {}
    return true;
  }

  /**
   * Revoke access (forces gatekeeper modal to reopen)
   */
  revokeAccess() {
    try {
      localStorage.removeItem(this.sessionKey);
    } catch (e) {}
  }

  /**
   * Attempt unlock using an Admin-issued password
   * Strictly enforces device limits!
   */
  async unlockWithPassword(passwordInput) {
    if (!this.deviceInfo) {
      await this.init();
    }

    const result = store.verifyAndActivateSitePassword(passwordInput, this.deviceInfo);
    
    if (result.success) {
      this.grantAccess('password', {
        passwordId: result.target.id,
        passwordLabel: result.target.note || 'VIP Access Pass'
      });
      return {
        success: true,
        message: result.alreadyRegistered 
          ? "Welcome back! Device verified." 
          : "Access password accepted! Device successfully registered."
      };
    }

    // Specific error handling
    if (result.reason === "DEVICE_LIMIT_REACHED") {
      return {
        success: false,
        reason: "DEVICE_LIMIT_REACHED",
        message: `Security Alert: This password has reached its maximum allowed limit of ${result.maxDevices} device(s). Access is locked on new devices.`
      };
    } else if (result.reason === "PASSWORD_INACTIVE") {
      return {
        success: false,
        reason: "PASSWORD_INACTIVE",
        message: "This access key has been deactivated or expired by administrator."
      };
    } else {
      return {
        success: false,
        reason: "INVALID_PASSWORD",
        message: "Invalid access password. Please enter a valid password or verify via official channels below."
      };
    }
  }

  /**
   * Called when user clicks any specific channel link (by ID)
   */
  recordLinkClick(linkId) {
    if (!linkId) return;
    this.linkTracking[linkId] = {
      clicked: true,
      timestamp: Date.now()
    };
  }

  // Backward compatibility
  recordTelegramClick() {
    this.recordLinkClick('link_tg');
  }

  recordWhatsappClick() {
    this.recordLinkClick('link_wa');
  }

  /**
   * Get status of a single link
   */
  getLinkStatus(linkId) {
    const item = this.linkTracking[linkId];
    if (!item || !item.clicked) {
      return { clicked: false, verified: false, elapsed: 0 };
    }
    const elapsed = Date.now() - item.timestamp;
    const verified = elapsed >= this.getMinEngagementMs();
    return { clicked: true, verified, elapsed };
  }

  /**
   * DYNAMIC STEALTH VERIFICATION CHECK:
   * Dynamically checks ALL active configured links!
   * Supports: 1 link, 2 links together ("dono aik sath"), 3 links ("ya 3 bi lga skoon"),
   * or hiding any link ("aik hide kr skoon").
   * Absolutely NO visible countdown timer is shown to the user!
   */
  verifySocialEngagement() {
    const activeLinks = store.getActiveSocialLinks();

    // If no active links configured by admin, bypass
    if (!activeLinks || activeLinks.length === 0) {
      this.grantAccess('social', { method: 'no_channels_required' });
      return {
        verified: true,
        message: "Access granted! Welcome to TradingStore."
      };
    }

    const minEngagementMs = this.getMinEngagementMs();
    const now = Date.now();

    // 1. Check if all active channels were opened
    const unclickedLinks = activeLinks.filter(link => {
      const tracking = this.linkTracking[link.id];
      return !tracking || !tracking.clicked;
    });

    if (unclickedLinks.length > 0) {
      if (unclickedLinks.length === activeLinks.length) {
        return {
          verified: false,
          reason: "NONE_CLICKED",
          message: activeLinks.length === 1 
            ? "Meharbani farma kar pehle channel ko join karein."
            : "Meharbani farma kar pehle tamam official channels ko join karein."
        };
      }

      const missingTitles = unclickedLinks.map(l => l.title || l.platform).join(', ');
      return {
        verified: false,
        reason: "SOME_MISSING",
        message: `Aap ne abhi tak ye channel(s) open nahi kiye: ${missingTitles}. Pehle join karein.`
      };
    }

    // 2. Check time spent on each channel (must be at least minEngagementMs for every active channel)
    const pendingLinks = activeLinks.filter(link => {
      const tracking = this.linkTracking[link.id];
      const elapsed = now - (tracking.timestamp || 0);
      return elapsed < minEngagementMs;
    });

    if (pendingLinks.length > 0) {
      // Do NOT reveal the exact 8-second countdown timer! (Stealth rule)
      return {
        verified: false,
        reason: "PENDING_VERIFICATION",
        message: "Channel membership check in progress. Please ensure you have pressed 'Join / Subscribe' in each channel, then click Confirm."
      };
    }

    // ALL active channels were opened and >= minEngagement elapsed!
    this.grantAccess('social', {
      method: 'multi_channel_verified',
      verifiedChannelsCount: activeLinks.length
    });

    return {
      verified: true,
      message: "Channel membership verified successfully! Unlocking VIP TradingStore portal..."
    };
  }
}

export const gatekeeper = new Gatekeeper();
