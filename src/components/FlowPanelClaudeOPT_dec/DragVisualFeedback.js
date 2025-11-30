// DragVisualFeedback.js - Handles drag visual states
export class DragVisualFeedback {
    constructor(config = {}) {
        this.config = {
            placeholderClass: 'drag-placeholder',
            ...config
        };
        this.lastAfterElement = null;
    }

    createPlaceholder(draggedElement) {
        const placeholder = draggedElement.cloneNode(true);
        placeholder.classList.add(this.config.placeholderClass);
        return placeholder;
    }

    showDragStart(element) {
        element.classList.add(this.config.placeholderClass);
    }

    updatePlaceholderPosition(placeholder, afterElement, container) {
        if (afterElement !== this.lastAfterElement) {
            this.lastAfterElement = afterElement;
            
            if (afterElement === null) {
                container.appendChild(placeholder);
            } else {
                container.insertBefore(placeholder, afterElement);
            }
        }
    }

    hideDragEnd(element) {
        element?.classList.remove(this.config.placeholderClass);
        this.lastAfterElement = null;
    }

    reset() {
        this.lastAfterElement = null;
    }
}