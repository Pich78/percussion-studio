/*
  js/components/modals/rhythmModal.js
  Renders the load rhythm modal with folder tree.
  Extracted from tubsGrid.js for modularity.
*/

import { dataLoader } from '../../services/dataLoader.js';

// Icons
import { XMarkIcon } from '../../icons/xMarkIcon.js';
import { FolderOpenIcon } from '../../icons/folderOpenIcon.js';
import { MusicalNoteIcon } from '../../icons/musicalNoteIcon.js';
import { ChevronRightIcon } from '../../icons/chevronRightIcon.js';
import { ChevronDownIcon } from '../../icons/chevronDownIcon.js';
import { ComputerDesktopIcon } from '../../icons/computerDesktopIcon.js';

/**
 * Build a tree structure from rhythm IDs
 * @param {string[]} ids - Array of rhythm IDs
 * @returns {object} Tree structure
 */
const buildTree = (ids) => {
    const tree = {};
    ids.forEach(id => {
        const parts = id.split('/');
        let current = tree;
        parts.forEach((part, idx) => {
            if (!current[part]) {
                current[part] = idx === parts.length - 1 ? id : {};
            }
            if (typeof current[part] === 'object') {
                current = current[part];
            }
        });
    });
    return tree;
};

/**
 * Recursively render the tree (with collapsible folders)
 * @param {object} node - Tree node
 * @param {number} depth - Current depth
 * @param {string} parentPath - Parent folder path
 * @param {Set} expandedFolders - Set of expanded folder paths
 * @returns {string} HTML string
 */
const renderTree = (node, depth = 0, parentPath = '', expandedFolders) => {
    return Object.entries(node).map(([key, value]) => {
        const isLeaf = typeof value === 'string';
        const paddingLeft = depth * 1.5;
        const folderPath = parentPath ? `${parentPath}/${key}` : key;

        if (isLeaf) {
            // It's a rhythm button
            const name = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return `
              <button
                  data-action="select-rhythm-confirm"
                  data-rhythm-id="${value}"
                  class="
                      flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-700 bg-gray-900/50 hover:bg-gray-800 transition-all text-left group w-full mb-2
                  "
                  style="margin-left: ${paddingLeft}rem; width: calc(100% - ${paddingLeft}rem);"
              >
                  ${MusicalNoteIcon('w-5 h-5 text-amber-500 group-hover:text-amber-400')}
                  <span class="font-medium text-gray-200 pointer-events-none group-hover:text-white">${name}</span>
              </button>
            `;
        } else {
            // It's a Folder
            const folderName = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const isExpanded = expandedFolders.has(folderPath);
            const chevronIcon = isExpanded
                ? ChevronDownIcon('w-4 h-4 text-gray-500 transition-transform')
                : ChevronRightIcon('w-4 h-4 text-gray-500 transition-transform');

            return `
              <div class="mb-2">
                <button 
                  data-action="toggle-folder"
                  data-folder-path="${folderPath}"
                  class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2 hover:text-gray-200 transition-colors cursor-pointer w-full text-left py-1 rounded hover:bg-gray-800/50"
                  style="margin-left: ${paddingLeft}rem;"
                >
                  ${chevronIcon}
                  ${FolderOpenIcon('w-4 h-4 text-amber-600')}
                  ${folderName}
                </button>
                ${isExpanded ? renderTree(value, depth + 1, folderPath, expandedFolders) : ''}
              </div>
            `;
        }
    }).join('');
};

/**
 * Render the rhythm load modal
 * @param {object} uiState - UI state object
 * @param {boolean} isMobile - Whether on mobile
 * @returns {string} HTML string
 */
export const RhythmModal = (uiState, isMobile = false) => {
    const rhythms = dataLoader.manifest && dataLoader.manifest.rhythms
        ? renderTree(buildTree(Object.keys(dataLoader.manifest.rhythms)), 0, '', uiState.expandedFolders)
        : '<div class="text-center text-gray-500 py-8">No rhythms found.</div>';

    const content = `
        <div id="rhythm-modal-scroll" class="p-6 overflow-y-auto max-h-[60vh]">
            ${rhythms}
        </div>
    `;

    return `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" data-action="close-modal-bg">
          <div class="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                  <h3 class="text-lg font-bold text-white">
                      Load Rhythm
                  </h3>
                  <button data-action="close-modal" class="text-gray-500 hover:text-white">
                      ${XMarkIcon('w-6 h-6')}
                  </button>
              </div>
              
              ${content}
              
              <div class="p-4 border-t border-gray-800 bg-gray-950 flex justify-end items-center gap-3">
                ${!isMobile ? `
                <input 
                    type="file" 
                    id="rhythm-file-input" 
                    accept=".yaml,.yml" 
                    class="hidden"
                    data-action="load-rhythm-file"
                />
                <button 
                    data-action="trigger-file-input"
                    class="px-4 py-2 rounded font-medium transition-all flex items-center gap-2 bg-cyan-600/20 text-cyan-400 border border-cyan-600/50 hover:bg-cyan-600/30 hover:border-cyan-500"
                >
                    ${ComputerDesktopIcon('w-4 h-4 pointer-events-none')}
                    Load from PC
                </button>
                ` : ''}
                <button 
                    data-action="close-modal"
                    class="px-4 py-2 text-gray-400 hover:text-white font-medium"
                >
                    Cancel
                </button>
              </div>
          </div>
      </div>
    `;
};
