// file: lib/dom.js

/**
 * Dynamically loads a CSS file by injecting a <link> tag into the <head>.
 * Prevents duplicate loads of the same file.
 * @param {string} href The path to the CSS file.
 */
export function loadCSS(href) {
    if (document.querySelector(`link[href="${href}"]`)) {
        return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}