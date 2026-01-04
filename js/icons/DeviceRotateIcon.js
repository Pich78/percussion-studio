export const DeviceRotateIcon = (className = "w-6 h-6") => `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="${className}">
  <!-- Phone (Centered D shaped silhouette, but just a rect as requested by "( D )" visualization) -->
  <!-- Reducing width slightly to ensure separation -->
  <rect x="9" y="5" width="6" height="14" rx="1.5" stroke-linecap="round" stroke-linejoin="round" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M11 6h2" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M11 17h2" />
  
  <!-- Left Parenthesis Arrow "(" -->
  <!-- Bulges Left. Points Down for CCW rotation (Left side moves down) -->
  <!-- Path: M 5 7 Q 2 12 5 17 -->
  <!-- Arrow Head at bottom -->
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.5 7.5c-2 3-2 6 0 9" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.5 16.5l-2.5-1" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.5 16.5l.5-2.5" />

  <!-- Right Parenthesis Arrow ")" -->
  <!-- Bulges Right. Points Up for CCW rotation (Right side moves up) -->
  <!-- Path: M 18.5 17 Q 21.5 12 18.5 7 -->
  <!-- Arrow Head at top -->
  <path stroke-linecap="round" stroke-linejoin="round" d="M18.5 16.5c2-3 2-6 0-9" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M18.5 7.5l2.5 1" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M18.5 7.5l-.5 2.5" />
</svg>
`;
