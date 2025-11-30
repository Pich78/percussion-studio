// CollisionDetector.js - Pure collision detection logic
export class CollisionDetector {
    constructor(config = {}) {
        this.config = {
            overlapThreshold: 0.25,
            hysteresisThreshold: 2,
            ...config
        };
    }

    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
    }

    calculateDragBounds(mouseY, startOffset, itemHeight) {
        return {
            top: mouseY - startOffset,
            bottom: mouseY - startOffset + itemHeight,
            center: mouseY - startOffset + (itemHeight / 2)
        };
    }

    updateDirection(currentMouseY, lastMouseY, lastDirection) {
        const { hysteresisThreshold } = this.config;
        
        if (Math.abs(currentMouseY - lastMouseY) < hysteresisThreshold) {
            return { direction: lastDirection, changed: false };
        }
        
        const newDirection = currentMouseY < lastMouseY ? 'up' : 'down';
        return { 
            direction: newDirection, 
            changed: newDirection !== lastDirection 
        };
    }

    detectCollision(dragBounds, direction, elements, itemHeight) {
        const overlapThreshold = itemHeight * this.config.overlapThreshold;
        const elementsToCheck = direction === 'down' ? [...elements].reverse() : elements;
        
        for (const element of elementsToCheck) {
            const elementBounds = element.getBoundingClientRect();
            let collision = null;
            
            if (direction === 'up') {
                if (dragBounds.top <= (elementBounds.bottom - overlapThreshold)) {
                    collision = { element, direction: 'up', insertBefore: element };
                }
            } else {
                if (dragBounds.bottom >= (elementBounds.top + overlapThreshold)) {
                    const nextSibling = this._getNextValidSibling(element);
                    collision = { element, direction: 'down', insertBefore: nextSibling };
                }
            }
            
            if (collision) return collision;
        }
        
        return null;
    }

    _getNextValidSibling(element) {
        let next = element.nextElementSibling;
        while (next && next.classList.contains('drag-placeholder')) {
            next = next.nextElementSibling;
        }
        return next;
    }
}