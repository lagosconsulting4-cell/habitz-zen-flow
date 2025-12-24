/**
 * UTMify Tracking Integration
 *
 * Sends rich events to UTMify which forwards to Meta Pixel with Advanced Matching
 */

export interface UTMifyLeadData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  age?: string;
  gender?: string;
  profession?: string;
}

export interface UTMifyEventData extends UTMifyLeadData {
  eventValue?: number;
  currency?: string;
  [key: string]: any;
}

/**
 * Send a custom event to UTMify Pixel
 * UTMify will forward to Meta Pixel with Advanced Matching
 */
export const trackUTMifyEvent = (eventName: string, data?: UTMifyEventData) => {
  // Check if UTMify pixel is loaded
  if (typeof window === 'undefined' || !window.pixelId) {
    console.warn('UTMify pixel not loaded');
    return;
  }

  try {
    // UTMify automatically captures lead data from inputs
    // But we can also manually update lead data before sending event
    if (data) {
      updateUTMifyLead(data);
    }

    // Send event through UTMify's internal tracker
    // @ts-ignore - UTMify exposes these globally
    if (window.Tracker && typeof window.Tracker.track === 'function') {
      window.Tracker.track(eventName);
      console.log(`[UTMify] Event tracked: ${eventName}`, data);
    } else {
      console.warn('UTMify Tracker not available');
    }
  } catch (error) {
    console.error('Error tracking UTMify event:', error);
  }
};

/**
 * Update lead data in UTMify's localStorage
 * This data will be included in all subsequent events
 */
const updateUTMifyLead = (data: UTMifyLeadData) => {
  try {
    // Get current lead from localStorage
    const leadKey = 'lead';
    const currentLead = JSON.parse(localStorage.getItem(leadKey) || '{}');

    // Update with new data
    const updatedLead = {
      ...currentLead,
      email: data.email || currentLead.email,
      phone: data.phone || currentLead.phone,
      firstName: data.firstName || currentLead.firstName,
      lastName: data.lastName || currentLead.lastName,
      // Custom fields for segmentation
      customData: {
        ...currentLead.customData,
        age: data.age,
        gender: data.gender,
        profession: data.profession,
      }
    };

    // Save back to localStorage
    localStorage.setItem(leadKey, JSON.stringify(updatedLead));

    console.log('[UTMify] Lead data updated', updatedLead);
  } catch (error) {
    console.error('Error updating UTMify lead:', error);
  }
};

/**
 * Helper: Track Lead event (quiz completion)
 */
export const trackLead = (data: UTMifyLeadData) => {
  trackUTMifyEvent('Lead', data);
};

/**
 * Helper: Track CompleteRegistration event
 */
export const trackCompleteRegistration = (data: UTMifyLeadData) => {
  // Send to UTMify
  trackUTMifyEvent('CompleteRegistration', data);

  // Send to Meta Pixel natively
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      email: data.email,
      phone: data.phone,
      fn: data.firstName,
      ln: data.lastName,
    });
    console.log('[Meta Pixel] CompleteRegistration tracked');
  }
};

/**
 * Helper: Track InitiateCheckout event
 */
export const trackInitiateCheckout = (value?: number) => {
  trackUTMifyEvent('InitiateCheckout', {
    eventValue: value,
    currency: 'BRL'
  });
};

/**
 * Helper: Track ViewContent event
 */
export const trackViewContent = (contentName: string) => {
  trackUTMifyEvent('ViewContent', {
    content_name: contentName
  });
};

// TypeScript declarations for global UTMify variables
declare global {
  interface Window {
    pixelId?: string;
    Tracker?: {
      track: (eventName: string, data?: any) => void;
      getTruthyLead: () => any;
    };
    fbq?: (action: string, eventName: string, data?: any) => void;
  }
}
