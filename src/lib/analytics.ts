declare global {
  interface Window {
    umamiBeforeSend?: (type: string, payload: { url?: string }) => { url?: string } | false;
  }
}

/**
 * Loads Umami (privacy-friendly, cookie-free visit statistics) when both
 * VITE_UMAMI_SCRIPT_URL and VITE_UMAMI_WEBSITE_ID are set. Admin and login pages are never counted.
 */
export function initAnalytics() {
  const src = import.meta.env.VITE_UMAMI_SCRIPT_URL as string | undefined;
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined;
  if (!src || !websiteId || import.meta.env.DEV) return;

  window.umamiBeforeSend = (_type, payload) => (/^\/(admin|login)/.test(payload.url ?? '') ? false : payload);

  const script = document.createElement('script');
  script.defer = true;
  script.src = src;
  script.dataset.websiteId = websiteId;
  script.dataset.beforeSend = 'umamiBeforeSend';
  document.head.appendChild(script);
}
