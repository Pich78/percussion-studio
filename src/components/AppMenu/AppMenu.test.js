// AppMenu.test.js - Unit Tests for AppMenu Web Component

class TestRunner {
    constructor() {
        this.results = [];
    }
    
    async test(name, testFn) {
        try {
            await testFn();
            this.results.push({ name, status: 'pass', message: 'Test passed' });
        } catch (error) {
            this.results.push({ name, status: 'fail', message: error.message });
        }
    }
    
    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, but got ${actual}`);
                }
            },
            toBeNull: () => {
                if (actual !== null) {
                    throw new Error(`Expected null, but got ${actual}`);
                }
            },
            not: {
                toBeNull: () => {
                    if (actual === null) {
                        throw new Error(`Expected not null, but got null`);
                    }
                }
            },
            toContain: (expected) => {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected "${actual}" to contain "${expected}"`);
                }
            }
        };
    }
    
    getResults() {
        return this.results;
    }
}

// Utility function to create a test component
function createTestComponent() {
    const menu = document.createElement('app-menu');
    document.body.appendChild(menu);
    return menu;
}

// Utility function to clean up test component
function cleanupTestComponent(menu) {
    if (menu && menu.parentNode) {
        menu.parentNode.removeChild(menu);
    }
}

// Utility function to wait for component to be ready
async function waitForComponent(menu) {
    return new Promise(resolve => {
        if (menu.shadowRoot) {
            resolve();
        } else {
            setTimeout(() => resolve(), 10);
        }
    });
}

export async function runTests() {
    const runner = new TestRunner();
    
    await runner.test('Component should be defined', async () => {
        runner.expect(customElements.get('app-menu')).not.toBeNull();
    });
    
    await runner.test('Component should render with default state', async () => {
        const menu = createTestComponent();
        await waitForComponent(menu);
        
        try {
            const header = menu.shadowRoot.querySelector('.app-header');
            runner.expect(header).not.toBeNull();
            
            const title = menu.shadowRoot.querySelector('.app-title');
            runner.expect(title.textContent).toBe('Percussion Studio');
        } finally {
            cleanupTestComponent(menu);
        }
    });
    
    await runner.test('isDirty property should work correctly', async () => {
        const menu = createTestComponent();
        await waitForComponent(menu);
        
        try {
            runner.expect(menu.isDirty).toBe(false);
            
            menu.isDirty = true;
            runner.expect(menu.isDirty).toBe(true);
            runner.expect(menu.getAttribute('is-dirty')).toBe('true');
        } finally {
            cleanupTestComponent(menu);
        }
    });
    
    await runner.test('appView property should work correctly', async () => {
        const menu = createTestComponent();
        await waitForComponent(menu);
        
        try {
            runner.expect(menu.appView).toBe('playing');
            
            menu.appView = 'editing';
            runner.expect(menu.appView).toBe('editing');
            runner.expect(menu.getAttribute('app-view')).toBe('editing');
        } finally {
            cleanupTestComponent(menu);
        }
    });
    
    await runner.test('isMenuOpen property should work correctly', async () => {
        const menu = createTestComponent();
        await waitForComponent(menu);
        
        try {
            runner.expect(menu.isMenuOpen).toBe(false);
            
            menu.isMenuOpen = true;
            runner.expect(menu.isMenuOpen).toBe(true);
            runner.expect(menu.getAttribute('is-menu-open')).toBe('true');
        } finally {
            cleanupTestComponent(menu);
        }
    });
    
    await runner.test('Menu should show correct items for playing view', async () => {
        const menu = createTestComponent();
        await waitForComponent(menu);
        
        try {
            menu.appView = 'playing';
            menu.isMenuOpen = true;
            
            await new Promise(resolve => setTimeout(resolve, 10)); // Wait for render
            
            const newButton = menu.shadowRoot.querySelector('[data-action="new"]');
            const loadButton = menu.shadowRoot.querySelector('[data-action="load"]');
            const toggleButton = menu.shadowRoot.querySelector('[data-action="toggle-view"]');
            
            runner.expect(newButton).toBeNull();
            runner.expect(loadButton).not.toBeNull();
            runner.expect(toggleButton).not.toBeNull();
            runner.expect(toggleButton.textContent.trim()).toContain('Editor');
        } finally {
            cleanupTestComponent(menu);
        }
    });
    
    await runner.test('Menu should show correct items for editing view', async () => {
        const menu = createTestComponent();
        await waitForComponent(menu);
        
        try {
            menu.appView = 'editing';
            menu.isMenuOpen = true;
            
            await new Promise(resolve => setTimeout(resolve, 10)); // Wait for render
            
            const newButton = menu.shadowRoot.querySelector('[data-action="new"]');
            const loadButton = menu.shadowRoot.querySelector('[data-action="load"]');
            const saveButton = menu.shadowRoot.querySelector('[data-action="save"]');
            const toggleButton = menu.shadowRoot.querySelector('[data-action="toggle-view"]');
            
            runner.expect(newButton).not.toBeNull();
            runner.expect(loadButton).not.toBeNull();
            runner.expect(saveButton).not.toBeNull();
            runner.expect(toggleButton).not.toBeNull();
            runner.expect(toggleButton.textContent.trim()).toContain('Playback');
        } finally {
            cleanupTestComponent(menu);
        }
    });
    
    await runner.test('Save button should be disabled when not dirty', async () => {
        const menu = createTestComponent();
        await waitForComponent(menu);
        
        try {
            menu.appView = 'editing';
            menu.isDirty = false;
            menu.isMenuOpen = true;
            
            await new Promise(resolve => setTimeout(resolve, 10)); // Wait for render
            
            const saveButton = menu.shadowRoot.querySelector('[data-action="save"]');
            runner.expect(saveButton.disabled).toBe(true);
        } finally {
            cleanupTestComponent(menu);
        }
    });
    
    await runner.test('Save button should be enabled when dirty', async () => {
        const menu = createTestComponent();
        await waitForComponent(menu);
        
        try {
            menu.appView = 'editing';
            menu.isDirty = true;
            menu.isMenuOpen = true;
            
            await new Promise(resolve => setTimeout(resolve, 10)); // Wait for render
            
            const saveButton = menu.shadowRoot.querySelector('[data-action="save"]');
            runner.expect(saveButton.disabled).toBe(false);
        } finally {
            cleanupTestComponent(menu);
        }
    });
    
    await runner.test('Menu toggle button should work', async () => {
        const menu = createTestComponent();
        await waitForComponent(menu);
        
        try {
            let eventFired = false;
            menu.addEventListener('menu-toggle', () => { eventFired = true; });
            
            const toggleButton = menu.shadowRoot.querySelector('[data-action="toggle-menu"]');
            toggleButton.click();
            
            await new Promise(resolve => setTimeout(resolve, 10));
            
            runner.expect(eventFired).toBe(true);
            runner.expect(menu.isMenuOpen).toBe(true);
        } finally {
            cleanupTestComponent(menu);
        }
    });
    
    await runner.test('Menu items should fire correct events', async () => {
        const menu = createTestComponent();
        await waitForComponent(menu);
        
        try {
            menu.appView = 'editing';
            menu.isMenuOpen = true;
            
            await new Promise(resolve => setTimeout(resolve, 50)); // Wait longer for render
            
            let newEventFired = false;
            let loadEventFired = false;
            
            menu.addEventListener('new-project', () => { newEventFired = true; });
            menu.addEventListener('load-project', () => { loadEventFired = true; });
            
            const newButton = menu.shadowRoot.querySelector('[data-action="new"]');
            const loadButton = menu.shadowRoot.querySelector('[data-action="load"]');
            
            runner.expect(newButton).not.toBeNull();
            runner.expect(loadButton).not.toBeNull();
            
            newButton.click();
            await new Promise(resolve => setTimeout(resolve, 50));
            runner.expect(newEventFired).toBe(true);
            
            // Reset menu state since it closes after first click
            menu.isMenuOpen = true;
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const loadButtonAfterReopen = menu.shadowRoot.querySelector('[data-action="load"]');
            loadButtonAfterReopen.click();
            await new Promise(resolve => setTimeout(resolve, 50));
            runner.expect(loadEventFired).toBe(true);
            
        } finally {
            cleanupTestComponent(menu);
        }
    });
    
    await runner.test('Menu should close after selecting an item', async () => {
        const menu = createTestComponent();
        await waitForComponent(menu);
        
        try {
            menu.appView = 'editing';
            menu.isMenuOpen = true;
            
            await new Promise(resolve => setTimeout(resolve, 10)); // Wait for render
            
            const loadButton = menu.shadowRoot.querySelector('[data-action="load"]');
            loadButton.click();
            
            await new Promise(resolve => setTimeout(resolve, 10));
            runner.expect(menu.isMenuOpen).toBe(false);
            
        } finally {
            cleanupTestComponent(menu);
        }
    });
    
    await runner.test('Outside click should close menu', async () => {
        const menu = createTestComponent();
        await waitForComponent(menu);
        
        try {
            menu.isMenuOpen = true;
            
            // Simulate outside click
            const outsideElement = document.createElement('div');
            document.body.appendChild(outsideElement);
            
            outsideElement.click();
            await new Promise(resolve => setTimeout(resolve, 10));
            
            runner.expect(menu.isMenuOpen).toBe(false);
            
            document.body.removeChild(outsideElement);
        } finally {
            cleanupTestComponent(menu);
        }
    });
    
    await runner.test('Component methods should work correctly', async () => {
        const menu = createTestComponent();
        await waitForComponent(menu);
        
        try {
            // Test openMenu method
            menu.openMenu();
            runner.expect(menu.isMenuOpen).toBe(true);
            
            // Test closeMenu method
            menu.closeMenu();
            runner.expect(menu.isMenuOpen).toBe(false);
            
            // Test toggleMenu method
            menu.toggleMenu();
            runner.expect(menu.isMenuOpen).toBe(true);
            
            menu.toggleMenu();
            runner.expect(menu.isMenuOpen).toBe(false);
            
        } finally {
            cleanupTestComponent(menu);
        }
    });
    
    await runner.test('Event details should contain correct data', async () => {
        const menu = createTestComponent();
        await waitForComponent(menu);
        
        try {
            menu.appView = 'editing';
            menu.isDirty = true;
            menu.isMenuOpen = true;
            
            await new Promise(resolve => setTimeout(resolve, 10));
            
            let eventDetail = null;
            menu.addEventListener('new-project', (e) => { eventDetail = e.detail; });
            
            const newButton = menu.shadowRoot.querySelector('[data-action="new"]');
            newButton.click();
            
            await new Promise(resolve => setTimeout(resolve, 10));
            
            runner.expect(eventDetail).not.toBeNull();
            runner.expect(eventDetail.action).toBe('new');
            runner.expect(eventDetail.state.appView).toBe('editing');
            runner.expect(eventDetail.state.isDirty).toBe(true);
            
        } finally {
            cleanupTestComponent(menu);
        }
    });

    return runner.getResults();
}