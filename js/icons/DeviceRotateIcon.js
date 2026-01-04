export const DeviceRotateIcon = (className = "w-6 h-6") => `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="${className}">
  <!-- Phone (Original Silhouette from DevicePhoneMobileIcon) -->
  <!-- path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" -->
  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />

  <!-- Left Parenthesis Arrow "(" -->
  <!-- Bulges Left from [4, 8] to [4, 16] -->
  <!-- Phone is at x=6, so x=3.5 gives 2.5px spacing. -->
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.5 7.5c-2 3-2 6 0 9" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.5 16.5l-2.5-1" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.5 16.5l.5-2.5" />

  <!-- Right Parenthesis Arrow ")" -->
  <!-- Bulges Right from [20, 8] to [20, 16] -->
  <!-- Phone ends at x=18, so x=20.5 gives 2.5px spacing. -->
  <path stroke-linecap="round" stroke-linejoin="round" d="M20.5 16.5c2-3 2-6 0-9" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M20.5 7.5l2.5 1" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M20.5 7.5l-.5 2.5" />
</svg>
`;
