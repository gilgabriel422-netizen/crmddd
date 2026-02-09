import React from 'react'

const WaveDivider = () => {
  return (
    <div className="relative w-full h-24 overflow-hidden">
      {/* Wave SVG */}
      <svg 
        className="absolute bottom-0 left-0 w-full h-full" 
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none"
      >
        {/* First wave layer */}
        <path 
          d="M0,60 C300,120 600,0 900,60 C1050,90 1200,30 1200,60 L1200,120 L0,120 Z" 
          fill="#1e3a8a" 
          opacity="0.8"
        />
        {/* Second wave layer */}
        <path 
          d="M0,80 C200,40 400,100 600,80 C800,60 1000,100 1200,80 L1200,120 L0,120 Z" 
          fill="#3b82f6" 
          opacity="0.6"
        />
        {/* Third wave layer */}
        <path 
          d="M0,100 C150,60 300,120 450,100 C600,80 750,120 900,100 C1050,80 1200,120 1200,100 L1200,120 L0,120 Z" 
          fill="#60a5fa" 
          opacity="0.4"
        />
        {/* Fourth wave layer */}
        <path 
          d="M0,110 C100,90 200,110 300,110 C500,110 700,90 900,110 C1000,110 1100,90 1200,110 L1200,120 L0,120 Z" 
          fill="#93c5fd" 
          opacity="0.3"
        />
      </svg>
      
      {/* Additional decorative elements */}
      <div className="absolute inset-0">
        {/* Small circles for texture */}
        <div className="absolute top-4 left-1/4 w-2 h-2 bg-white/20 rounded-full"></div>
        <div className="absolute top-8 right-1/3 w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute top-6 left-2/3 w-1.5 h-1.5 bg-white/25 rounded-full"></div>
        <div className="absolute top-10 right-1/4 w-1 h-1 bg-white/20 rounded-full"></div>
      </div>
    </div>
  )
}

export default WaveDivider
