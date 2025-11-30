import { FlowPanelMD3Z } from './FlowPanelMD3Z.js';

export class FlowPanelMD3ZTestRunner {
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
      }
    };
  }

  async runAll() {
    console.log('🚀 Starting FlowPanelMD3Z Test Suite');
    
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
    this.describe('FlowPanelMD3Z Basic Functionality', () => {
      this.it('should create component instance', () => {
        const component = new FlowPanelMD3Z();
        this.expect(component).toBeTruthy();
        this.expect(component.state).toBeTruthy();
      });

      this.it('should render with default state', () => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        this.expect(component.shadowRoot).toBeTruthy();
        this.expect(component.shadowRoot.querySelector('.editor-panel')).toBeTruthy();
        this.expect(component.shadowRoot.querySelector('.vertical-text')).toBeTruthy();
      });

      this.it('should handle pin state changes', () => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        // Test initial state
        this.expect(component.state.isPinned).toBe(false);
        
        // Test pin toggle
        component.togglePin();
        this.expect(component.state.isPinned).toBe(true);
        
        component.togglePin();
        this.expect(component.state.isPinned).toBe(false);
      });

      this.it('should respond to attribute changes', () => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        // Test is-pinned attribute
        component.setAttribute('is-pinned', 'true');
        this.expect(component.state.isPinned).toBe(true);
        
        component.setAttribute('is-pinned', 'false');
        this.expect(component.state.isPinned).toBe(false);
        
        // Test global-bpm attribute
        component.setAttribute('global-bpm', '140');
        this.expect(component.state.globalBPM).toBe(140);
      });
    });

    this.describe('FlowPanelMD3Z Pattern Management', () => {
      this.it('should add patterns to flow', () => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        const initialLength = component.state.flow.length;
        component.addPattern('Test Pattern');
        
        this.expect(component.state.flow.length).toBe(initialLength + 1);
        this.expect(component.state.flow[initialLength].pattern).toBe('Test Pattern');
        this.expect(component.state.flow[initialLength].repetitions).toBe(1);
      });

      this.it('should remove patterns from flow', () => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        component.addPattern('Pattern 1');
        component.addPattern('Pattern 2');
        component.addPattern('Pattern 3');
        
        const initialLength = component.state.flow.length;
        component.removePattern(1); // Remove middle pattern
        
        this.expect(component.state.flow.length).toBe(initialLength - 1);
        this.expect(component.state.flow[0].pattern).toBe('Pattern 1');
        this.expect(component.state.flow[1].pattern).toBe('Pattern 3');
      });

      this.it('should reorder patterns in flow', () => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        component.addPattern('Pattern 1');
        component.addPattern('Pattern 2');
        component.addPattern('Pattern 3');
        
        component.reorderFlow(0, 2); // Move first to last
        
        this.expect(component.state.flow[0].pattern).toBe('Pattern 2');
        this.expect(component.state.flow[1].pattern).toBe('Pattern 3');
        this.expect(component.state.flow[2].pattern).toBe('Pattern 1');
      });

      this.it('should update pattern properties', () => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        component.addPattern('Test Pattern');
        component.updatePatternProperty(0, 'repetitions', 8);
        component.updatePatternProperty(0, 'bpm', 140);
        
        this.expect(component.state.flow[0].repetitions).toBe(8);
        this.expect(component.state.flow[0].bpm).toBe(140);
      });

      this.it('should select patterns', () => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        component.addPattern('Pattern 1');
        component.addPattern('Pattern 2');
        
        component.selectPattern('Pattern 2');
        this.expect(component.state.currentPatternId).toBe('Pattern 2');
        
        component.selectPattern('Pattern 1');
        this.expect(component.state.currentPatternId).toBe('Pattern 1');
      });
    });

    this.describe('FlowPanelMD3Z Event Handling', () => {
      this.it('should dispatch events when patterns are added', (done) => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        component.addEventListener('pattern-added', (e) => {
          this.expect(e.detail.pattern).toBe('Test Pattern');
          this.expect(e.detail.flow).toBeTruthy();
          done();
        });
        
        component.addPattern('Test Pattern');
      });

      this.it('should dispatch events when patterns are removed', (done) => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        component.addPattern('Test Pattern');
        
        component.addEventListener('pattern-removed', (e) => {
          this.expect(e.detail.index).toBe(0);
          this.expect(e.detail.flow).toBeTruthy();
          done();
        });
        
        component.removePattern(0);
      });

      this.it('should dispatch events when flow is reordered', (done) => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        component.addPattern('Pattern 1');
        component.addPattern('Pattern 2');
        
        component.addEventListener('flow-reordered', (e) => {
          this.expect(e.detail.from).toBe(0);
          this.expect(e.detail.to).toBe(1);
          this.expect(e.detail.flow).toBeTruthy();
          done();
        });
        
        component.reorderFlow(0, 1);
      });

      this.it('should dispatch events when pattern properties change', (done) => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        component.addPattern('Test Pattern');
        
        component.addEventListener('pattern-property-changed', (e) => {
          this.expect(e.detail.property).toBe('repetitions');
          this.expect(e.detail.value).toBe(16);
          this.expect(e.detail.index).toBe(0);
          done();
        });
        
        component.updatePatternProperty(0, 'repetitions', 16);
      });

      this.it('should dispatch events when patterns are selected', (done) => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        component.addPattern('Test Pattern');
        
        component.addEventListener('pattern-selected', (e) => {
          this.expect(e.detail.patternId).toBe('Test Pattern');
          done();
        });
        
        component.selectPattern('Test Pattern');
      });

      this.it('should dispatch events when pin is toggled', (done) => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        component.addEventListener('pin-toggled', (e) => {
          this.expect(e.detail.isPinned).toBe(true);
          done();
        });
        
        component.togglePin();
      });
    });

    this.describe('FlowPanelMD3Z State Management', () => {
      this.it('should set and get flow data', () => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        const testFlow = [
          { pattern: 'Pattern 1', repetitions: 4 },
          { pattern: 'Pattern 2', repetitions: 8 }
        ];
        
        component.setFlow(testFlow);
        const retrievedFlow = component.getFlow();
        
        this.expect(retrievedFlow).toHaveLength(2);
        this.expect(retrievedFlow[0].pattern).toBe('Pattern 1');
        this.expect(retrievedFlow[1].pattern).toBe('Pattern 2');
      });

      this.it('should merge state updates correctly', () => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        const initialState = { ...component.state };
        
        component.setState({
          globalBPM: 140,
          isPinned: true
        });
        
        this.expect(component.state.globalBPM).toBe(140);
        this.expect(component.state.isPinned).toBe(true);
        // Other properties should remain unchanged
        this.expect(component.state.flow).toEqual(initialState.flow);
      });

      this.it('should handle empty flow state', () => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        component.setFlow([]);
        this.expect(component.state.flow).toHaveLength(0);
        
        // Should not throw errors when manipulating empty flow
        component.removePattern(0);
        component.reorderFlow(0, 1);
        component.updatePatternProperty(0, 'repetitions', 4);
      });
    });

    this.describe('FlowPanelMD3Z Rendering', () => {
      this.it('should render correct number of pattern items', () => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        component.addPattern('Pattern 1');
        component.addPattern('Pattern 2');
        component.addPattern('Pattern 3');
        
        const flowList = component.shadowRoot.querySelector('.flow-list');
        const patternItems = flowList.querySelectorAll('pattern-item-view-md3z');
        
        this.expect(patternItems).toHaveLength(3);
      });

      this.it('should apply correct CSS classes for pin state', () => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        const editorPanel = component.shadowRoot.querySelector('.editor-panel');
        
        // Test unpinned state
        this.expect(editorPanel.classList.contains('is-pinned')).toBe(false);
        
        // Test pinned state
        component.togglePin();
        this.expect(editorPanel.classList.contains('is-pinned')).toBe(true);
      });

      it('should render vertical text correctly', () => {
        const component = new FlowPanelMD3Z();
        this.testContainer.appendChild(component);
        
        const verticalText = component.shadowRoot.querySelector('.vertical-text');
        this.expect(verticalText).toBeTruthy();
        this.expect(verticalText.textContent).toBe('Rhythm Flow');
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
  const runner = new FlowPanelMD3ZTestRunner();
  runner.runAll().catch(console.error);
}