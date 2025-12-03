// analytics.ts
import ReactGA from "react-ga4";

const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID || "";

export const initGA4 = (): void => {
  if (!GA_TRACKING_ID) {
    console.warn('Google Analytics tracking ID is not set (REACT_APP_GA_TRACKING_ID)');
    return;
  }
  ReactGA.initialize(GA_TRACKING_ID);
  console.log('Google Analytics initialized with ID:', GA_TRACKING_ID);
};

export const logPageViewGA4 = (page: string): void => {
  if (!GA_TRACKING_ID) return;
  // GA4 API: sử dụng send với page_path
  ReactGA.send({ hitType: "pageview", page_path: page, page_title: document.title });
};

export const logEventGA4 = (category: string, action: string, label?: string): void => {
  if (!GA_TRACKING_ID) return;
  // GA4 API: sử dụng event với category, action, label
  ReactGA.event({
    category,
    action,
    label: label || undefined,
  });
};
