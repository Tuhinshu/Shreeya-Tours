/**
 * Centralized site configuration and contact constants
 */

const isProd = process.env.NODE_ENV === 'production';
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
const configuredPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const configuredEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

// Enforce required production configuration without silent dev fallbacks
if (isProd) {
  if (!configuredApiUrl) {
    console.error('⚠️ [CRITICAL CONFIG] NEXT_PUBLIC_API_URL is missing in production environment.');
  }
  if (!configuredPhone) {
    console.error('⚠️ [CRITICAL CONFIG] NEXT_PUBLIC_WHATSAPP_NUMBER is missing in production environment.');
  }
  if (!configuredEmail) {
    console.error('⚠️ [CRITICAL CONFIG] NEXT_PUBLIC_CONTACT_EMAIL is missing in production environment.');
  }
}

export const SITE_CONFIG = {
  name: 'Shreeya Tours',
  tagline: 'Trusted Indian Travel Partner',
  phone: configuredPhone || (isProd ? '' : '916353818605'),
  email: configuredEmail || (isProd ? '' : 'shreeyatours19@gmail.com'),
  apiUrl: configuredApiUrl || (isProd ? '' : 'http://localhost:5000'),
  officeState: 'Gujarat',
  
  /**
   * Helper to format a WhatsApp chat URL with a non-sensitive pre-filled message
   */
  getWhatsAppUrl(customMessage?: string) {
    const defaultMsg = 'Hi! I want to enquire about tour packages with Shreeya Tours.';
    const encoded = encodeURIComponent(customMessage || defaultMsg);
    const phoneToUse = this.phone;
    if (!phoneToUse) {
      return '#';
    }
    return `https://wa.me/${phoneToUse}?text=${encoded}`;
  },

  /**
   * Helper to format standard mailto link
   */
  getMailtoUrl(subject?: string) {
    const sub = subject ? `?subject=${encodeURIComponent(subject)}` : '';
    return `mailto:${this.email}${sub}`;
  }
};
