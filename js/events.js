import { setupMobileEvents } from './events/mobileEvents.js';
import { setupDesktopEvents } from './events/desktopEvents.js';

export const setupEventListeners = () => {
    if (window.IS_MOBILE_VIEW) {
        setupMobileEvents();
    } else {
        setupDesktopEvents();
    }
};