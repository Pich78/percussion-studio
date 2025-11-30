// DragDropController.js - Main drag and drop coordination
import { CollisionDetector } from './CollisionDetector.js';
import { DragVisualFeedback } from './DragVisualFeedback.js';
import { AutoScroller } from './AutoScroller.js';

export class DragDropController {
    constructor(config = {}) {
        this.collisionDetector = new CollisionDetector(config.collision);
        this.visualFeedback = new DragVisualFeedback(config.visual);
        this.autoScroller = new AutoScroller(config.scroll);
        
        this.dragState = {
            draggedIndex: null,
            startOffset: 0,
            itemHeight: 0,
            lastCollision: null,
            lastMouseY: 0,
            lastDirection: null
        };

        // Bind event handlers
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
    }

    attachTo(element, container, itemsGetter) {
        this.element = element;
        this.container = container;
        this.getItems = itemsGetter;
        
        element.addEventListener('dragstart', this.handleDragStart);
        element.addEventListener('dragover', this.handleDragOver);
        element.addEventListener('drop', this.handleDrop);
        element.addEventListener('dragend', this.handleDragEnd);
    }

    detach() {
        if (this.element) {
            this.element.removeEventListener('dragstart', this.handleDragStart);
            this.element.removeEventListener('dragover', this.handleDragOver);
            this.element.removeEventListener('drop', this.handleDrop);
            this.element.removeEventListener('dragend', this.handleDragEnd);
        }
        this.reset();
    }

    handleDragStart(event) {
        const item = event.target.closest('[draggable="true"]');
        if (!item) return;
        
        const items = this.getItems();
        const draggedIndex = items.indexOf(item);
        
        if (draggedIndex === -1) return;

        // Initialize drag state
        Object.assign(this.dragState, {
            draggedIndex,
            lastMouseY: event.clientY,
            lastDirection: null
        });

        // Calculate item dimensions
        const rect = item.getBoundingClientRect();
        this.dragState.startOffset = event.clientY - rect.top;
        this.dragState.itemHeight = rect.height;

        event.dataTransfer.effectAllowed = 'move';

        // Visual feedback
        requestAnimationFrame(() => {
            this.visualFeedback.showDragStart(item);
        });

        this._emitEvent('drag-start', { draggedElement: item, draggedIndex });
    }

    handleDragOver(event) {
        event.preventDefault();
        
        const placeholder = this.container.querySelector('.drag-placeholder');
        if (!placeholder || this.dragState.draggedIndex === null) return;

        const currentMouseY = event.clientY;
        
        // Handle auto-scrolling
        this.autoScroller.handleAutoScroll(currentMouseY, this.container);
        
        // Update direction
        const directionResult = this.collisionDetector.updateDirection(
            currentMouseY, 
            this.dragState.lastMouseY, 
            this.dragState.lastDirection
        );
        
        if (!directionResult.direction) return;
        
        // Reset collision on direction change
        if (directionResult.changed) {
            this.dragState.lastCollision = null;
        }
        
        this.dragState.lastDirection = directionResult.direction;
        this.dragState.lastMouseY = currentMouseY;

        // Calculate drag bounds
        const dragBounds = this.collisionDetector.calculateDragBounds(
            currentMouseY, 
            this.dragState.startOffset, 
            this.dragState.itemHeight
        );

        // Get resting elements
        const restingElements = this.getItems().filter(el => 
            !el.classList.contains('drag-placeholder')
        );

        // Detect collision
        const collision = this.collisionDetector.detectCollision(
            dragBounds, 
            directionResult.direction, 
            restingElements, 
            this.dragState.itemHeight
        );

        if (collision) {
            // Emit collision event if new
            if (collision.element !== this.dragState.lastCollision) {
                this._emitEvent('drag-collision', {
                    collidedElement: collision.element,
                    collisionDirection: collision.direction
                });
                this.dragState.lastCollision = collision.element;
            }

            // Update placeholder position
            this.visualFeedback.updatePlaceholderPosition(
                placeholder, 
                collision.insertBefore, 
                this.container
            );
        }
    }

    handleDrop(event) {
        event.preventDefault();
        const placeholder = this.container.querySelector('.drag-placeholder');
        
        if (this.dragState.draggedIndex !== null && placeholder) {
            const items = this.getItems();
            const newIndex = items.indexOf(placeholder);
            
            if (this.dragState.draggedIndex !== newIndex) {
                this._emitEvent('item-reorder', {
                    fromIndex: this.dragState.draggedIndex,
                    toIndex: newIndex,
                    draggedElement: placeholder
                });
            }
        }
    }

    handleDragEnd() {
        const placeholder = this.container.querySelector('.drag-placeholder');
        this.visualFeedback.hideDragEnd(placeholder);

        this._emitEvent('drag-end');
        this.reset();
    }

    reset() {
        Object.assign(this.dragState, {
            draggedIndex: null,
            startOffset: 0,
            itemHeight: 0,
            lastCollision: null,
            lastMouseY: 0,
            lastDirection: null
        });
        this.visualFeedback.reset();
    }

    updateConfig(newConfig) {
        if (newConfig.collision) this.collisionDetector.updateConfig(newConfig.collision);
        if (newConfig.visual) Object.assign(this.visualFeedback.config, newConfig.visual);
        if (newConfig.scroll) Object.assign(this.autoScroller.config, newConfig.scroll);
    }

    getCurrentState() {
        return { ...this.dragState };
    }

    _emitEvent(eventType, additionalData = {}) {
        const baseData = {
            draggedIndex: this.dragState.draggedIndex,
            mouseY: this.dragState.lastMouseY,
            direction: this.dragState.lastDirection,
            ...additionalData
        };
        
        this.element.dispatchEvent(new CustomEvent(eventType, {
            detail: baseData,
            bubbles: true
        }));
    }
}