// FlowList.js - Manages flow-specific item operations
import { ScrollableList } from './ScrollableList.js';
import { DragDropController } from './DragDropController.js';

export class FlowList extends ScrollableList {
    constructor() {
        super();
        this.dragDropController = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.setupDragDrop();
    }

    disconnectedCallback() {
        this.teardownDragDrop();
        super.disconnectedCallback();
    }

    setupDragDrop() {
        this.dragDropController = new DragDropController({
            collision: { overlapThreshold: 0.25 },
            scroll: { scrollZoneSize: 60, scrollSpeed: 5 }
        });
        
        this.dragDropController.attachTo(
            this,
            this.getContainer(),
            () => this.getItems()
        );

        // Forward drag events
        ['drag-start', 'drag-collision', 'drag-end', 'item-reorder'].forEach(eventType => {
            this.addEventListener(eventType, (event) => {
                this.dispatchEvent(new CustomEvent(eventType, {
                    detail: event.detail,
                    bubbles: true
                }));
            });
        });
    }

    teardownDragDrop() {
        if (this.dragDropController) {
            this.dragDropController.detach();
            this.dragDropController = null;
        }
    }

    setOverlapThreshold(threshold) {
        if (this.dragDropController) {
            this.dragDropController.updateConfig({
                collision: { overlapThreshold: threshold }
            });
        }
    }

    getCurrentDragState() {
        return this.dragDropController ? this.dragDropController.getCurrentState() : null;
    }
}

// Register the custom element
customElements.define('flow-list', FlowList);