/**
 * Centralized site configuration and contact constants
 */

const isProd = process.env.NODE_ENV === 'production';
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

if (isProd && !configuredApiUrl) {
  console.warn('⚠️ [Configuration Notice] NEXT_PUBLIC_API_URL is unset in production. API calls will resolve relative to origin.');
}

export const SITE_CONFIG = {
  name: 'Shreeya Tours',
  tagline: 'Trusted Indian Travel Partner',
  phone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '916353818605',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'shreeyatours19@gmail.com',
  apiUrl: configuredApiUrl || (isProd ? '' : 'http://localhost:5000'),
  officeState: 'Gujarat',
  
  /**
   * Helper to format a WhatsApp chat URL with an optional pre-filled message
   */
  getWhatsAppUrl(customMessage?: string) {
    const defaultMsg = 'Hi! I want to enquire about tour packages in India.';
    const encoded = encodeURIComponent(customMessage || defaultMsg);
    return `https://wa.me/${this.phone}?text=${encoded}`;
  },

  /**
   * Helper to format standard mailto link
   */
  getMailtoUrl(subject?: string) {
    const sub = subject ? `?subject=${encodeURIComponent(subject)}` : '';
    return `mailto:${this.email}${sub}`;
  }
};
