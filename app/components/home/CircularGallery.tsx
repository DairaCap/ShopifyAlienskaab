import { useRef, useEffect, useState } from 'react';
import './CircularGallery.css';

// Simplified version using CSS 3D transforms instead of WebGL/OGL
// Much lighter weight and better performance

interface CircularGalleryProps {
  items?: { image: string; text: string }[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  fontUrl?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  autoRotate?: boolean;
  pauseOnHover?: boolean;
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px Figtree',
  fontUrl,
  scrollSpeed = 1,
  scrollEase = 0.05,
  autoRotate = true,
  pauseOnHover = true,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  const defaultItems = [
    { image: '/assets/webp/gallery/1.webp', text: 'Hidromiel' },
    { image: '/assets/webp/gallery/2.webp', text: 'Fermentado' },
    { image: '/assets/webp/gallery/3.webp', text: 'AlienBlood' },
    { image: '/assets/webp/gallery/4.webp', text: 'Strawberries' },
    { image: '/assets/webp/gallery/5.webp', text: 'Cantinplora' },
    { image: '/assets/webp/gallery/6.webp', text: 'Sello natural' }
  ];
  
  const galleryItems = items && items.length ? items : defaultItems;
  
  // Preload fonts outside of render cycle
  useEffect(() => {
    if (fontUrl || font === 'bold 30px Figtree') {
      const effectiveUrl = fontUrl || 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;700&display=swap';
      // Preconnect and preload fonts
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = 'https://fonts.googleapis.com';
      document.head.appendChild(link);
      
      const link2 = document.createElement('link');
      link2.rel = 'preconnect';
      link2.href = 'https://fonts.gstatic.com';
      link2.crossOrigin = '';
      document.head.appendChild(link2);
      
      const link3 = document.createElement('link');
      link3.rel = 'stylesheet';
      link3.href = effectiveUrl;
      document.head.appendChild(link3);
      
      return () => {
        document.head.removeChild(link);
        document.head.removeChild(link2);
        document.head.removeChild(link3);
      };
    }
  }, [fontUrl, font]);

  // Auto rotation
  useEffect(() => {
    if (!autoRotate || isHovering) return;
    
    const interval = setInterval(() => {
      setRotation(prev => (prev + scrollSpeed) % 360);
    }, 1000 / 60); // 60fps
    
    return () => clearInterval(interval);
  }, [autoRotate, isHovering, scrollSpeed]);

  // Pause on hover
  useEffect(() => {
    if (!pauseOnHover) return;
    
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  // Calculate item positions
  const getItemStyle = (index: number, total: number) => {
    const angle = (index / total) * 360 + rotation;
    const radius = 200; // Fixed radius for consistency
    const bendAmount = bend * 100; // Convert to pixels
    
    // Calculate position
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    
    // Apply bend effect (vertical offset based on horizontal position)
    const bendOffset = Math.sin((angle * Math.PI) / 180) * bendAmount;
    
    // Scale based on distance from center (for 3D effect)
    const scale = 0.6 + Math.abs(Math.cos((angle * Math.PI) / 180)) * 0.4;
    const zIndex = Math.round((scale - 0.6) * 100); // Higher scale = higher zIndex
    
    return {
      transform: `
        translate3d(${x}px, ${y + bendOffset}px, 0)
        scale(${scale})
        rotateY(${angle}deg)
      `,
      opacity: scale > 0.8 ? 1 : 0.6,
      zIndex,
      transition: 'transform 0.1s ease-out, opacity 0.1s ease-out'
    };
  };

  return (
    <div
      className="circular-gallery"
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Circular image gallery. Use Left and Right Arrow keys to navigate."
      style={{ userSelect: 'none' }}
    >
      {galleryItems.map((item, index) => {
        const style = getItemStyle(index, galleryItems.length);
        return (
          <div
            key={item.image}
            className="gallery-item"
            style={{
              ...style,
              backgroundImage: `url(${item.image})`,
              borderRadius: `${borderRadius * 100}%`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              width: '180px',
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: textColor,
              textAlign: 'center',
              fontFamily: "'Figtree', sans-serif",
              fontSize: '18px',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              pointerEvents: 'none'
            }}
          >
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '4px' }}>
              {item.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
