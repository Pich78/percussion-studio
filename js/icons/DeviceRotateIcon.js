export const DeviceRotateIcon = (className = "w-6 h-6") => `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="${className}">
  <!-- Phone (centered) -->
  <rect x="8" y="4" width="8" height="16" rx="2" stroke-linecap="round" stroke-linejoin="round" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5h2" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M11 18h2" />
  
  <!-- Right Arrow (Curving down) -->
  <path stroke-linecap="round" stroke-linejoin="round" d="M19 10c0-2-1-4-3-5" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M19 10l-2.5-1" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M19 10l1-2.5" />

  <!-- Left Arrow (Curving up) -->
  <path stroke-linecap="round" stroke-linejoin="round" d="M5 14c0 2 1 4 3 5" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M5 14l2.5 1" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M5 14l-1 2.5" />
</svg>
`;
