import { useEffect, useRef, useState } from 'react';
import alienDrinkingVideo from '~/assets/AlienResting.webm';
import './HeroVideo.css';

export default function HeroVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Mostramos el contenedor al segundo 1, los retrasos de CSS (delays) harán el resto
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1000);

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
        <source src={alienDrinkingVideo} type="video/webm" />
        Tu navegador no soporta el video.
      </video>

      {showContent && (
        <div className="hero-video-overlay">
          {/* Título: Aparece de inmediato (0s) */}
          <h1 className="hero-title" style={{ animationDelay: '0s' }}>
            DEJATE ABDUCIR POR<br />
            NUEVAS EXPERIENCIAS
          </h1>

          {/* Contenedor de los 3 textos inferiores */}
          <div className="hero-body-text">
            {/* Exhibición 1: Aparece al segundo 1.5 */}
            <p style={{ animationDelay: '1.5s' }}>
              En Alienskaab buscamos<br />
              inspirar momentos de<br />
              conexión real.
            </p>
            {/* Exhibición 2: Aparece al segundo 3 */}
            <p style={{ animationDelay: '3.0s' }}>
              Volvamos a lo esencial.
            </p>
            {/* Exhibición 3: Aparece al segundo 4.5 */}
            <p style={{ animationDelay: '4.5s' }}>
              Disfrutemos de la<br />
              naturaleza en su forma<br />
              más honesta y pura.
            </p>
          </div>
        </div>
      )}

      {/* Hint de scroll — borde inferior de la pantalla */}
      <div className="hero-scroll-hint" aria-hidden="true">
        <span>Continuar</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}