/**
 * TRADINGSTORE - Device Fingerprinting Engine
 * Generates a unique, tamper-resistant hardware & client fingerprint
 * to strictly enforce Admin-defined per-device limits on access passwords.
 */

export class DeviceFingerprint {
  /**
   * Fast, reliable DJB2 hash generator
   */
  static hashString(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Generates a stable Canvas fingerprint
   */
  static getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'no-canvas';

      ctx.textBaseline = 'top';
      ctx.font = "14px 'Arial', sans-serif";
      ctx.fillStyle = "#00f298";
      ctx.fillRect(10, 10, 80, 40);

      ctx.fillStyle = "#00b8ff";
      ctx.fillText("TRADINGSTORE_FINGERPRINT", 15, 20);

      ctx.strokeStyle = "#ff3b69";
      ctx.arc(150, 30, 20, 0, Math.PI * 2);
      ctx.stroke();

      return DeviceFingerprint.hashString(canvas.toDataURL());
    } catch (e) {
      return 'canvas-fallback-' + Math.random().toString(36).substring(2, 8);
    }
  }

  /**
   * Extracts WebGL GPU & Driver information
   */
  static getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no-webgl';

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return 'no-debug-info';

      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
      return DeviceFingerprint.hashString(`${vendor}__${renderer}`);
    } catch (e) {
      return 'webgl-fallback';
    }
  }

  /**
   * Retrieves or creates a persistent device ID token stored across LocalStorage and Cookies
   */
  static getPersistentUUID() {
    const STORAGE_KEY = 'tradingstore_device_uuid_v3';
    let storedUUID = null;

    try {
      storedUUID = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      // Storage unavailable or restricted
    }

    // Try reading cookie as secondary storage
    if (!storedUUID) {
      const match = document.cookie.match(new RegExp('(^| )' + STORAGE_KEY + '=([^;]+)'));
      if (match) storedUUID = match[2];
    }

    // If still not found, generate new UUID
    if (!storedUUID) {
      storedUUID = 'dev_' + ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
      try {
        localStorage.setItem(STORAGE_KEY, storedUUID);
      } catch (e) {}

      // Write cookie with 5-year expiration
      try {
        const expires = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${STORAGE_KEY}=${storedUUID}; expires=${expires}; path=/; SameSite=Lax`;
      } catch (e) {}
    }

    return storedUUID;
  }

  /**
   * Assembles the complete device fingerprint identifier
   */
  static async getFingerprint() {
    const uuid = this.getPersistentUUID();
    const canvasHash = this.getCanvasFingerprint();
    const webglHash = this.getWebGLFingerprint();

    const screenData = `${screen.width}x${screen.height}x${screen.colorDepth}@${window.devicePixelRatio || 1}`;
    const hardwareConcurrency = navigator.hardwareConcurrency || 'unknown';
    const language = navigator.language || 'en';
    const timezone = (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'unknown';
    const platform = navigator.userAgentData?.platform || navigator.platform || 'unknown';

    // Combine hardware specs into a consistent signature
    const hardwareSignature = `${canvasHash}_${webglHash}_${screenData}_${hardwareConcurrency}_${timezone}_${platform}`;
    const hwHash = this.hashString(hardwareSignature);

    // Final Device ID format: DEV-XXXXXXXX-XXXXXXXX
    const combinedHash = `${hwHash}-${this.hashString(uuid)}`;
    const finalId = `DEV-${combinedHash.toUpperCase()}`;

    return {
      deviceId: finalId,
      platform: platform,
      browser: this.detectBrowser(),
      screen: screenData,
      timezone: timezone,
      lastSeen: new Date().toISOString()
    };
  }

  /**
   * Helper to detect simple browser brand for admin device view
   */
  static detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox/")) return "Firefox";
    if (ua.includes("Edg/")) return "Microsoft Edge";
    if (ua.includes("Chrome/")) return "Chrome";
    if (ua.includes("Safari/")) return "Safari";
    if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera";
    return "Mobile/Desktop Browser";
  }
}
