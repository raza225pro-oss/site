/**
 * TRADINGSTORE - Dynamic Gatekeeper Engine (Lock 1: Site Entry Lock)
 * 1. Entry Access Passwords
 * 2. 8-Second Verification Rule for Social / Community Channels (Telegram, WhatsApp Channel, WhatsApp Group, YT, FB)
 *    Ensures user doesn't just click & immediately close before 8 seconds.
 */

import { store } from './store.js';
import { DeviceFingerprint } from './fingerprint.js';
import { APP_CONFIG } from './config.js';

export class Gatekeeper {
  constructor() {
    this.sessionKey = 'tradingstore_site_entry_access_v4';
    this.trackingKey = 'tradingstore_link_tracking_v4';
    this.deviceInfo = null;
    this.linkTracking = this._loadTracking();
  }

  _loadTracking() {
    try {
      const data = sessionStorage.getItem(this.trackingKey);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  _saveTracking() {
    try {
      sessionStorage.setItem(this.trackingKey, JSON.stringify(this.linkTracking));
    } catch (e) {}
  }

  async init() {
    this.deviceInfo = await DeviceFingerprint.getFingerprint();
    return this.deviceInfo;
  }

  getMinEngagementMs() {
    const config = store.getGatekeeperConfig();
    const sec = (config && config.minEngagementSeconds) || APP_CONFIG.minEngagementSeconds || 8;
    return sec * 1000;
  }

  isEnabled() {
    const config = store.getGatekeeperConfig();
    return config && config.enabled !== false && config.mode !== 'disabled';
  }

  isAuthorized() {
    if (!this.isEnabled()) return true;

    const config = store.getGatekeeperConfig();
    if (config && (config.mode === 'disabled' || config.enabled === false)) {
      return true;
    }

    try {
      const authData = localStorage.getItem(this.sessionKey);
      if (!authData) return false;
      const parsed = JSON.parse(authData);
      return parsed && parsed.authorized === true;
    } catch (e) {
      return false;
    }
  }

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

  revokeAccess() {
    try {
      localStorage.removeItem(this.sessionKey);
    } catch (e) {}
  }

  async unlockWithPassword(passwordInput) {
    if (!this.deviceInfo) {
      await this.init();
    }

    const result = store.verifyAndActivateSitePassword(passwordInput, this.deviceInfo);
    
    if (result.success) {
      this.grantAccess('password', {
        passwordId: result.target.id,
        passwordLabel: result.target.note || 'Site Access Pass'
      });
      return {
        success: true,
        message: result.alreadyRegistered 
          ? "Welcome back! Device verified." 
          : "Access key accepted! Website successfully unlocked."
      };
    }

    if (result.reason === "DEVICE_LIMIT_REACHED") {
      return {
        success: false,
        reason: "DEVICE_LIMIT_REACHED",
        message: `Security Alert: This key has reached its maximum allowed limit of ${result.maxDevices} device(s).`
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
        message: "Invalid access key. Enter a valid key or verify by joining the official channels below."
      };
    }
  }

  recordLinkClick(linkId) {
    if (!linkId) return;
    this.linkTracking[linkId] = {
      clicked: true,
      timestamp: Date.now()
    };
    this._saveTracking();
  }

  getLinkStatus(linkId) {
    const item = this.linkTracking[linkId];
    const minEngagementMs = this.getMinEngagementMs();
    if (!item || !item.clicked) {
      return {
        clicked: false,
        verified: false,
        elapsed: 0,
        remainingSeconds: Math.ceil(minEngagementMs / 1000)
      };
    }
    const elapsed = Date.now() - item.timestamp;
    const verified = elapsed >= minEngagementMs;
    const remainingSeconds = Math.max(0, Math.ceil((minEngagementMs - elapsed) / 1000));
    return { clicked: true, verified, elapsed, remainingSeconds };
  }

  /**
   * 8-SECOND VERIFICATION CHECK:
   * Visitor clicks link -> must wait 8 seconds -> Verified!
   */
  verifySocialEngagement() {
    const activeLinks = store.getActiveSocialLinks();

    if (!activeLinks || activeLinks.length === 0) {
      this.grantAccess('social', { method: 'no_channels_required' });
      return {
        verified: true,
        message: "Access granted! Welcome to TradingStore."
      };
    }

    const minEngagementMs = this.getMinEngagementMs();
    const now = Date.now();

    // 1. Check if all active channels were clicked
    const unclickedLinks = activeLinks.filter(link => {
      const tracking = this.linkTracking[link.id];
      return !tracking || !tracking.clicked;
    });

    if (unclickedLinks.length > 0) {
      const missingTitles = unclickedLinks.map(l => l.title || l.platform).join(', ');
      return {
        verified: false,
        reason: "SOME_MISSING",
        message: `Meharbani farma kar pehle tamam official channels open karein: (${missingTitles}).`
      };
    }

    // 2. Check if 8 seconds have elapsed on each link
    const pendingLinks = activeLinks.filter(link => {
      const tracking = this.linkTracking[link.id];
      const elapsed = now - (tracking.timestamp || 0);
      return elapsed < minEngagementMs;
    });

    if (pendingLinks.length > 0) {
      const maxRemaining = Math.max(...pendingLinks.map(l => {
        const tracking = this.linkTracking[l.id];
        return Math.max(1, Math.ceil((minEngagementMs - (now - (tracking.timestamp || 0))) / 1000));
      }));

      return {
        verified: false,
        reason: "PENDING_VERIFICATION",
        remainingSeconds: maxRemaining,
        message: `8 second verification jari hai (${maxRemaining}s baki). Meharbani farma kar channel join karein aur wait karein.`
      };
    }

    // All active channels opened and >= 8 seconds elapsed!
    this.grantAccess('social', {
      method: 'multi_channel_verified',
      verifiedChannelsCount: activeLinks.length
    });

    return {
      verified: true,
      message: "Channel verification complete! Website unlock ho chuki hai."
    };
  }
}

export const gatekeeper = new Gatekeeper();
