// AutoScroller.js - Handles auto-scrolling during drag
export class AutoScroller {
    constructor(config = {}) {
        this.config = {
            scrollZoneSize: 60,
            scrollSpeed: 5,
            ...config
        };
    }

    handleAutoScroll(mouseY, container) {
        const containerBounds = container.getBoundingClientRect();
        const { scrollZoneSize, scrollSpeed } = this.config;
        
        const distanceFromTop = mouseY - containerBounds.top;
        const distanceFromBottom = containerBounds.bottom - mouseY;
        
        if (distanceFromTop < scrollZoneSize) {
            const scrollIntensity = (scrollZoneSize - distanceFromTop) / scrollZoneSize;
            container.scrollTop -= scrollSpeed * scrollIntensity;
            return 'up';
        } else if (distanceFromBottom < scrollZoneSize) {
            const scrollIntensity = (scrollZoneSize - distanceFromBottom) / scrollZoneSize;
            container.scrollTop += scrollSpeed * scrollIntensity;
            return 'down';
        }
        
        return null;
    }
}