import { useEffect, useRef, useState } from 'react';
import alienDrinkingVideo from '~/assets/AlienDrinking.mp4';
import './HeroVideo.css';

export default function HeroVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Show text at second 3
    const timer = setTimeout(() => {
      setShowText(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleVideoEnded = () => {
    // Scroll smoothly to the next section (or below the hero video container)
    const nextSection = containerRef.current?.nextElementSibling;
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (containerRef.current) {
      const topOffset = containerRef.current.offsetTop + containerRef.current.offsetHeight;
      window.scrollTo({
        top: topOffset,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="hero-video-container"
      style={{
        opacity: isMounted ? 1 : 0,
        transition: 'opacity 1s ease-in-out'
      }}
    >
      <video
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnded}
        className="hero-video"
      >
        <source src={alienDrinkingVideo} type="video/mp4" />
        Tu navegador no soporta el video.
      </video>

      {showText && (
        <div className="hero-video-overlay">
          DÉJATE ABDUCIR POR NUEVAS EXPERIENCIAS
        </div>
      )}
    </div>
  );
}