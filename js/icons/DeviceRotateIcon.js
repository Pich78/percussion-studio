export const DeviceRotateIcon = (className = "w-6 h-6") => `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="${className}">
  <!-- Phone (centered, slightly smaller to allow space) -->
  <rect x="9" y="5" width="6" height="14" rx="1.5" stroke-linecap="round" stroke-linejoin="round" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M11 6h2" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M11 17h2" />
  
  <!-- Counter-Clockwise Rotation Arrows -->
  
  <!-- Top/Right Arrow (Starts right, curves up and left) -->
  <!-- Trying to emulate a large circular motion around the phone -->
  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 0 0-9-9" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3l2.5-2.5" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3l2.5 2.5" />

  <!-- Bottom/Left Arrow (Starts left, curves down and right) -->
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 12a9 9 0 0 0 9 9" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 21l-2.5-2.5" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 21l-2.5 2.5" />
</svg>
`;
