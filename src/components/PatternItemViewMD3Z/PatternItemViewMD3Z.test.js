import { PatternItemViewMD3Z } from './PatternItemViewMD3Z.js';

export class PatternItemViewMD3ZTestRunner {
  constructor() {
    this.testContainer = null;
    this.testResults = [];
    this.currentTest = null;
  }

  setup() {
    // Create test container
    this.testContainer = document.createElement('div');
    this.testContainer.id = 'test-sandbox';
    this.testContainer.style.position = 'absolute';
    this.testContainer.style.visibility = 'hidden';
    document.body.appendChild(this.testContainer);
    
    // Initialize test results
    this.testResults = [];
  }

  teardown() {
    if (this.testContainer) {
      document.body.removeChild(this.testContainer);
      this.testContainer = null;
    }
  }

  describe(description, testFn) {
    console.log(`\n📋 ${description}`);
    testFn();
  }

  it(description, testFn) {
    this.currentTest = {
      description,
      passed: false,
      error: null
    };
    
    try {
      testFn();
      this.currentTest.passed = true;
      console.log(`✅ ${description}`);
    } catch (error) {
      this.currentTest.passed = false;
      this.currentTest.error = error.message;
      console.log(`❌ ${description}`);
      console.log(`   Error: ${error.message}`);
    }
    
    this.testResults.push(this.currentTest);
  }

  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected}, but got ${actual}`);
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected truthy value, but got ${actual}`);
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected falsy value, but got ${actual}`);
        }
      },
      toContain: (expected) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${actual} to contain ${expected}`);
        }
      },
      toHaveLength: (expected) => {
        if (actual.length !== expected) {
          throw new Error(`Expected length ${expected}, but got ${actual.length}`);
        }
      },
      toBeGreaterThan: (expected) => {
        if (!(actual > expected)) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      },
      toBeLessThan: (expected) => {
        if (!(actual < expected)) {
          throw new Error(`Expected ${actual} to be less than ${expected}`);
        }
      }
    };
  }

  async runAll() {
    console.log('🚀 Starting PatternItemViewMD3Z Test Suite');
    
    this.setup();
    
    try {
      await this.runTests();
    } catch (error) {
      console.error('💥 Test suite failed:', error);
    } finally {
      this.teardown();
    }
    
    this.renderResults();
  }

  async runTests() {
    this.describe('PatternItemViewMD3Z Basic Functionality', () => {
      this.it('should create component instance', () => {
        const component = new PatternItemViewMD3Z();
        this.expect(component).toBeTruthy();
        this.expect(component.itemData).toBeTruthy();
        this.expect(component.globalBPM).toBe(120);
        this.expect(component.isSelected).toBe(false);
      });

      this.it('should render with default state', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        this.expect(component.shadowRoot).toBeTruthy();
        this.expect(component.shadowRoot.querySelector('.flow-item')).toBeTruthy();
        this.expect(component.shadowRoot.querySelector('.pattern-name')).toBeTruthy();
        this.expect(component.shadowRoot.querySelector('.modifiers-box')).toBeTruthy();
      });

      this.it('should handle attribute changes', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        // Test selected attribute
        component.setAttribute('selected', 'true');
        this.expect(component.isSelected).toBe(true);
        
        component.setAttribute('selected', 'false');
        this.expect(component.isSelected).toBe(false);
        
        // Test data-index attribute
        component.setAttribute('data-index', '5');
        this.expect(component.index).toBe(5);
        
        // Test data-pattern-id attribute
        component.setAttribute('data-pattern-id', 'test-pattern');
        this.expect(component.itemData.pattern).toBe('test-pattern');
        
        // Test global-bpm attribute
        component.setAttribute('global-bpm', '140');
        this.expect(component.globalBPM).toBe(140);
      });
    });

    this.describe('PatternItemViewMD3Z Data Management', () => {
      this.it('should set and get item data', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        const testData = {
          pattern: 'Test Pattern',
          repetitions: 8,
          bpm: 140,
          bpm_accel_cents: 105
        };
        
        component.setItemData(testData);
        
        this.expect(component.itemData.pattern).toBe('Test Pattern');
        this.expect(component.itemData.repetitions).toBe(8);
        this.expect(component.itemData.bpm).toBe(140);
        this.expect(component.itemData.bpm_accel_cents).toBe(105);
      });

      this.it('should handle partial item data updates', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        const initialData = {
          pattern: 'Original Pattern',
          repetitions: 4,
          bpm: 120,
          bpm_accel_cents: 100
        };
        
        const updateData = {
          repetitions: 16,
          bpm: 140
        };
        
        component.setItemData(initialData);
        component.setItemData(updateData);
        
        // Should preserve unchanged properties
        this.expect(component.itemData.pattern).toBe('Original Pattern');
        this.expect(component.itemData.bpm_accel_cents).toBe(100);
        
        // Should update changed properties
        this.expect(component.itemData.repetitions).toBe(16);
        this.expect(component.itemData.bpm).toBe(140);
      });

      this.it('should handle default values correctly', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        // Set minimal data
        component.setItemData({ pattern: 'Minimal Pattern' });
        
        this.expect(component.itemData.pattern).toBe('Minimal Pattern');
        this.expect(component.itemData.repetitions).toBe(1); // Default
        this.expect(component.itemData.bpm).toBe(null); // Will use global BPM
        this.expect(component.itemData.bpm_accel_cents).toBe(100); // Default
      });

      it('should set and get global BPM', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setGlobalBPM(160);
        this.expect(component.globalBPM).toBe(160);
        
        component.setGlobalBPM(100);
        this.expect(component.globalBPM).toBe(100);
      });

      it('should set and get selected state', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setSelected(true);
        this.expect(component.isSelected).toBe(true);
        
        component.setSelected(false);
        this.expect(component.isSelected).toBe(false);
      });

      it('should get and set individual properties', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({
          pattern: 'Test Pattern',
          repetitions: 4,
          bpm: 120,
          bpm_accel_cents: 100
        });
        
        // Test getting properties
        this.expect(component.getProperty('pattern')).toBe('Test Pattern');
        this.expect(component.getProperty('repetitions')).toBe(4);
        this.expect(component.getProperty('bpm')).toBe(120);
        this.expect(component.getProperty('bpm_accel_cents')).toBe(100);
        
        // Test setting properties
        component.setProperty('repetitions', 8);
        component.setProperty('bpm', 140);
        
        this.expect(component.itemData.repetitions).toBe(8);
        this.expect(component.itemData.bpm).toBe(140);
      });
    });

    this.describe('PatternItemViewMD3Z Event Handling', () => {
      this.it('should dispatch delete event', (done) => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern' });
        
        component.addEventListener('delete', (e) => {
          this.expect(e.detail.index).toBe(0);
          this.expect(e.detail.patternId).toBe('Test Pattern');
          done();
        });
        
        const deleteButton = component.shadowRoot.querySelector('.delete-btn');
        deleteButton.click();
      });

      this.it('should dispatch property change event for repetitions', (done) => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern' });
        
        component.addEventListener('property-change', (e) => {
          this.expect(e.detail.property).toBe('repetitions');
          this.expect(e.detail.value).toBe(16);
          this.expect(e.detail.index).toBe(0);
          this.expect(e.detail.patternId).toBe('Test Pattern');
          done();
        });
        
        const repsInput = component.shadowRoot.querySelector('input[data-property="repetitions"]');
        repsInput.value = '16';
        repsInput.dispatchEvent(new Event('change', { bubbles: true }));
      });

      this.it('should dispatch property change event for pattern name', (done) => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern' });
        
        component.addEventListener('property-change', (e) => {
          this.expect(e.detail.property).toBe('pattern');
          this.expect(e.detail.value).toBe('New Pattern Name');
          done();
        });
        
        const patternSelect = component.shadowRoot.querySelector('select[data-property="pattern"]');
        patternSelect.value = 'New Pattern Name';
        patternSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });

      this.it('should dispatch property change event for BPM via wheel', (done) => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern' });
        
        component.addEventListener('property-change', (e) => {
          if (e.detail.property === 'bpm') {
            this.expect(e.detail.value).toBe(125);
            done();
          }
        });
        
        const bpmValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm"]');
        bpmValue.click(); // Enter active mode
        
        // Simulate wheel event
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: -1,
          bubbles: true,
          cancelable: true
        });
        
        document.dispatchEvent(wheelEvent);
      });

      this.it('should dispatch property change event for acceleration via wheel', (done) => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern' });
        
        component.addEventListener('property-change', (e) => {
          if (e.detail.property === 'bpm_accel_cents') {
            this.expect(e.detail.value).toBe(101);
            done();
          }
        });
        
        const accelValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm_accel_cents"]');
        accelValue.click(); // Enter active mode
        
        // Simulate wheel event
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: -1,
          bubbles: true,
          cancelable: true
        });
        
        document.dispatchEvent(wheelEvent);
      });
    });

    this.describe('PatternItemViewMD3Z Interaction Handling', () => {
      this.it('should enter active mode on value click', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern' });
        
        const bpmValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm"]');
        bpmValue.click();
        
        this.expect(component.activeProperty).toBe('bpm');
        this.expect(bpmValue.classList.contains('is-active-editing')).toBe(true);
        this.expect(document.body.classList.contains('hide-cursor')).toBe(true);
      });

      this.it('should exit active mode on outside click', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern' });
        
        const bpmValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm"]');
        bpmValue.click();
        
        this.expect(component.activeProperty).toBe('bpm');
        
        // Simulate outside click
        document.body.click();
        
        // Should exit active mode (async)
        setTimeout(() => {
          this.expect(component.activeProperty).toBe(null);
          this.expect(bpmValue.classList.contains('is-active-editing')).toBe(false);
          this.expect(document.body.classList.contains('hide-cursor')).toBe(false);
        }, 10);
      });

      this.it('should handle wheel events for BPM adjustment', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern', bpm: 120 });
        
        const bpmValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm"]');
        bpmValue.click(); // Enter active mode
        
        const initialBpm = component.currentValue;
        
        // Simulate wheel up (increase BPM)
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: -1,
          bubbles: true,
          cancelable: true
        });
        
        document.dispatchEvent(wheelEvent);
        
        this.expect(component.currentValue).toBeGreaterThan(initialBpm);
        this.expect(component.currentValue).toBe(125); // 120 + 5
      });

      it('should handle wheel events for acceleration adjustment', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern', bpm_accel_cents: 100 });
        
        const accelValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm_accel_cents"]');
        accelValue.click(); // Enter active mode
        
        const initialAccel = component.currentValue;
        
        // Simulate wheel down (decrease acceleration)
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: 1,
          bubbles: true,
          cancelable: true
        });
        
        document.dispatchEvent(wheelEvent);
        
        this.expect(component.currentValue).toBeLessThan(initialAccel);
        this.expect(component.currentValue).toBe(99); // 100 - 1
      });

      it('should handle shift key for larger increments', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern', bpm: 120 });
        
        const bpmValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm"]');
        bpmValue.click(); // Enter active mode
        
        const initialBpm = component.currentValue;
        
        // Simulate wheel up with shift key (larger increment)
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: -1,
          shiftKey: true,
          bubbles: true,
          cancelable: true
        });
        
        document.dispatchEvent(wheelEvent);
        
        this.expect(component.currentValue).toBe(initialBpm + 25); // 120 + 25 (5 * 5)
      });

      it('should enforce BPM bounds', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern', bpm: 120 });
        
        const bpmValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm"]');
        bpmValue.click(); // Enter active mode
        
        // Test upper bound
        component.currentValue = 300; // Above max
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: -1,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(wheelEvent);
        this.expect(component.currentValue).toBe(250); // Max value
        
        // Test lower bound
        component.currentValue = 10; // Below min
        const wheelEvent2 = new WheelEvent('wheel', {
          deltaY: 1,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(wheelEvent2);
        this.expect(component.currentValue).toBe(30); // Min value
      });

      it('should enforce acceleration bounds', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern', bpm_accel_cents: 100 });
        
        const accelValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm_accel_cents"]');
        accelValue.click(); // Enter active mode
        
        // Test upper bound
        component.currentValue = 150; // Above max
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: -1,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(wheelEvent);
        this.expect(component.currentValue).toBe(120); // Max value
        
        // Test lower bound
        component.currentValue = 50; // Below min
        const wheelEvent2 = new WheelEvent('wheel', {
          deltaY: 1,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(wheelEvent2);
        this.expect(component.currentValue).toBe(80); // Min value
      });

      it('should handle keyboard navigation', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern', bpm: 120 });
        
        const bpmValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm"]');
        bpmValue.click(); // Enter active mode
        
        const initialBpm = component.currentValue;
        
        // Simulate arrow up key
        const keyUpEvent = new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          bubbles: true,
          cancelable: true
        });
        
        bpmValue.dispatchEvent(keyUpEvent);
        
        this.expect(component.currentValue).toBeGreaterThan(initialBpm);
        this.expect(component.currentValue).toBe(125); // 120 + 5
        
        // Simulate arrow down key
        const keyDownEvent = new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          cancelable: true
        });
        
        bpmValue.dispatchEvent(keyDownEvent);
        
        this.expect(component.currentValue).toBe(120); // Back to original
      });
    });

    this.describe('PatternItemViewMD3Z Rendering', () => {
      this.it('should render with selected state styling', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setSelected(true);
        
        const flowItem = component.shadowRoot.querySelector('.flow-item');
        this.expect(flowItem.classList.contains('selected-state')).toBe(true);
        this.expect(flowItem.classList.contains('default-state')).toBe(false);
      });

      it('should render with default state styling', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setSelected(false);
        
        const flowItem = component.shadowRoot.querySelector('.flow-item');
        this.expect(flowItem.classList.contains('default-state')).toBe(true);
        this.expect(flowItem.classList.contains('selected-state')).toBe(false);
      });

      it('should render correct pattern name', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern Name' });
        
        const patternSelect = component.shadowRoot.querySelector('.pattern-name');
        this.expect(patternSelect.value).toBe('Test Pattern Name');
      });

      it('should render correct repetitions value', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern', repetitions: 16 });
        
        const repsInput = component.shadowRoot.querySelector('input[data-property="repetitions"]');
        this.expect(repsInput.value).toBe('16');
      });

      it('should render correct BPM value (custom)', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern', bpm: 140 });
        
        const bpmValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm"]');
        this.expect(bpmValue.textContent).toBe('140');
      });

      it('should render correct BPM value (global)', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern', bpm: null }); // Use global
        component.setGlobalBPM(160);
        
        const bpmValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm"]');
        this.expect(bpmValue.textContent).toBe('160');
      });

      it('should render correct acceleration value', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern', bpm_accel_cents: 105 });
        
        const accelValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm_accel_cents"]');
        this.expect(accelValue.textContent).toBe('105');
      });

      it('should render drag handle', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        const dragHandle = component.shadowRoot.querySelector('.drag-handle');
        this.expect(dragHandle).toBeTruthy();
        this.expect(dragHandle.querySelector('svg')).toBeTruthy();
      });

      it('should render delete button', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        const deleteButton = component.shadowRoot.querySelector('.delete-btn');
        this.expect(deleteButton).toBeTruthy();
        this.expect(deleteButton.getAttribute('data-action')).toBe('delete');
      });

      it('should render all modifier controls', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        const repsInput = component.shadowRoot.querySelector('input[data-property="repetitions"]');
        const bpmValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm"]');
        const accelValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm_accel_cents"]');
        
        this.expect(repsInput).toBeTruthy();
        this.expect(bpmValue).toBeTruthy();
        this.expect(accelValue).toBeTruthy();
      });
    });

    this.describe('PatternItemViewMD3Z Accessibility', () => {
      it('should have proper ARIA attributes', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern', bpm: 120, bpm_accel_cents: 100 });
        
        const bpmValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm"]');
        const accelValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm_accel_cents"]');
        
        this.expect(bpmValue.getAttribute('role')).toBe('spinbutton');
        this.expect(bpmValue.getAttribute('aria-label')).toBe('Beats per minute');
        this.expect(bpmValue.getAttribute('aria-valuemin')).toBe('30');
        this.expect(bpmValue.getAttribute('aria-valuemax')).toBe('250');
        this.expect(bpmValue.getAttribute('aria-valuenow')).toBe('120');
        
        this.expect(accelValue.getAttribute('role')).toBe('spinbutton');
        this.expect(accelValue.getAttribute('aria-label')).toBe('Acceleration in cents');
        this.expect(accelValue.getAttribute('aria-valuemin')).toBe('80');
        this.expect(accelValue.getAttribute('aria-valuemax')).toBe('120');
        this.expect(accelValue.getAttribute('aria-valuenow')).toBe('100');
      });

      it('should update ARIA values when properties change', () => {
        const component = new PatternItemViewMD3Z();
        this.testContainer.appendChild(component);
        
        component.setItemData({ pattern: 'Test Pattern', bpm: 120 });
        
        const bpmValue = component.shadowRoot.querySelector('.modifier-value[data-property="bpm"]');
        bpmValue.click(); // Enter active mode
        
        // Change value via wheel
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: -1,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(wheelEvent);
        
        this.expect(bpmValue.getAttribute('aria-valuenow')).toBe('125');
      });
    });
  }

  renderResults() {
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    const total = this.testResults.length;
    
    console.log('\n📊 Test Results');
    console.log('================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📝 Total: ${total}`);
    console.log(`🎯 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  • ${r.description}`);
          console.log(`    Error: ${r.error}`);
        });
    }
    
    console.log('\n🏁 Test Suite Complete');
  }
}

// Auto-run tests if this file is loaded directly
if (typeof window !== 'undefined') {
  const runner = new PatternItemViewMD3ZTestRunner();
  runner.runAll().catch(console.error);
}