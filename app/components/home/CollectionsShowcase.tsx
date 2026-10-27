import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router';
import './CollectionsShowcase.css';

const COLLECTION_COLORS = [
  '#0d0d0d',   // 0 — Negro profundo
  '#2d0a12',   // 1 — Vino oscuro
  '#0a1a2d',   // 2 — Azul noche
  '#0d1f0d',   // 3 — Verde bosque
  '#1a0d2d',   // 4 — Púrpura oscuro
  '#1f1400',   // 5 — Ámbar oscuro
  '#001a1a',   // 6 — Verde azulado
  '#200010',   // 7 — Magenta oscuro
];

export interface ShowcaseCollection {
  id: string;
  title: string;
  handle: string;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
}

interface CollectionsShowcaseProps {
  collections: ShowcaseCollection[];
  onExitBottom?: () => void; // Callback al pasar de la última colección hacia abajo
}

// "Hidromieles TRADICIONALES" → ["Hidromieles", "TRADICIONALES"]
function splitTitle(title: string): [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length === 1) return ['', words[0].toUpperCase()];
  const last = words.pop()!;
  return [words.join(' '), last.toUpperCase()];
}

// Tipo de dirección del gesto
type Direction = 'down' | 'up';

export default function CollectionsShowcase({
  collections,
  onExitBottom,
}: CollectionsShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [textExiting, setTextExiting] = useState(false);
  // Incluimos la dirección en el estado de imagen para usar la animación correcta
  const [imageState, setImageState] = useState<
    'idle' | 'exiting-down' | 'exiting-up' | 'entering-from-top' | 'entering-from-bottom'
  >('idle');

  const containerRef = useRef<HTMLDivElement>(null);
  const transitioning = useRef(false);
  const lastWheelTime = useRef(0);
  const touchStartY = useRef(0);

  const goTo = useCallback(
    (nextIndex: number, dir: Direction) => {
      if (transitioning.current) return;

      // Scroll abajo en la última → salir por abajo
      if (nextIndex >= collections.length) {
        onExitBottom?.();
        return;
      }

      // Scroll arriba en la primera → volver al Hero (elemento previo en el DOM)
      if (nextIndex < 0) {
        const prevSection = containerRef.current?.previousElementSibling as HTMLElement | null;
        if (prevSection) {
          prevSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      transitioning.current = true;
      setIsTransitioning(true);

      // 1. Iniciar fade-out del texto + imagen sale en la dirección del gesto
      //    Scroll abajo → imagen actual baja (exit-down), nueva entra desde arriba (from-top)
      //    Scroll arriba → imagen actual sube (exit-up), nueva entra desde abajo (from-bottom)
      setTextExiting(true);
      setImageState(dir === 'down' ? 'exiting-down' : 'exiting-up');

      // 2. Tras 420ms: cambiar slide + datos
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setTextExiting(false);
        setImageState(dir === 'down' ? 'entering-from-top' : 'entering-from-bottom');
      }, 420);

      // 3. Liberar tras completar entrada
      setTimeout(() => {
        setImageState('idle');
        setIsTransitioning(false);
        transitioning.current = false;
      }, 1050);
    },
    [collections.length, onExitBottom],
  );

  // ---- Wheel ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelTime.current < 900) return;
      if (Math.abs(e.deltaY) < 30) return;
      lastWheelTime.current = now;

      if (e.deltaY > 0) {
        goTo(currentIndex + 1, 'down');
      } else {
        goTo(currentIndex - 1, 'up');
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [currentIndex, goTo]);

  // ---- Touch ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 40) return;
      if (delta > 0) {
        goTo(currentIndex + 1, 'down');
      } else {
        goTo(currentIndex - 1, 'up');
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [currentIndex, goTo]);

  // ---- Keyboard ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top > 100 || rect.bottom < 0) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goTo(currentIndex + 1, 'down');
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goTo(currentIndex - 1, 'up');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIndex, goTo]);

  if (!collections || collections.length === 0) return null;

  const collection = collections[currentIndex];
  const bgColor = COLLECTION_COLORS[currentIndex % COLLECTION_COLORS.length];
  const [subtitle, mainTitle] = splitTitle(collection.title);
  const isLast = currentIndex === collections.length - 1;

  // Clase CSS de la imagen según el estado
  const imageClass = (() => {
    switch (imageState) {
      case 'exiting-down':      return ' is-exiting-down';
      case 'exiting-up':        return ' is-exiting-up';
      case 'entering-from-top': return ' is-entering-from-top';
      case 'entering-from-bottom': return ' is-entering-from-bottom';
      default:                  return '';
    }
  })();

  return (
    <div
      ref={containerRef}
      className="collections-showcase"
      id="collections-showcase"
      aria-label="Nuestras colecciones"
    >
      {/* Fondo */}
      <div
        className="collections-showcase__bg"
        style={{ backgroundColor: bgColor }}
      />

      {/* Overlay */}
      <div className="collections-showcase__overlay" />

      {/* Textos + CTA agrupados */}
      <div className={`collections-showcase__text${textExiting ? ' is-exiting' : ''}`}>
        <p className="collections-showcase__section-label" key={`label-${currentIndex}`}>
          Nuestras colecciones
        </p>
        {subtitle && (
          <p className="collections-showcase__collection-subtitle" key={`subtitle-${currentIndex}`}>
            {subtitle}
          </p>
        )}
        <h2
          className="collections-showcase__collection-title"
          key={`title-${currentIndex}`}
        >
          {mainTitle}
        </h2>

        {/* CTA justo bajo el título */}
        <Link
          to={`/collections/${collection.handle}`}
          className="collections-showcase__cta"
          key={`cta-${currentIndex}`}
        >
          Ver colección
        </Link>
      </div>

      {/* Portada */}
      <div className="collections-showcase__image-stage">
        {collection.image ? (
          <div
            className={`collections-showcase__image-slot${imageClass}`}
            key={`img-${currentIndex}`}
          >
            <img
              src={collection.image.url}
              alt={collection.image.altText || collection.title}
              width={collection.image.width ?? 500}
              height={collection.image.height ?? 900}
              loading="eager"
            />
          </div>
        ) : (
          <div
            className={`collections-showcase__image-slot${imageClass}`}
            key={`placeholder-${currentIndex}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}
          >
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Indicadores */}
      <nav className="collections-showcase__dots" aria-label="Colecciones">
        {collections.map((col, i) => (
          <button
            key={col.id}
            className={`collections-showcase__dot${i === currentIndex ? ' is-active' : ''}`}
            onClick={() => goTo(i, i > currentIndex ? 'down' : 'up')}
            aria-label={`Ver colección ${col.title}`}
            aria-current={i === currentIndex ? 'true' : undefined}
            disabled={isTransitioning}
          />
        ))}
      </nav>

      {/* Hint en el borde inferior de la pantalla */}
      <div className="collections-showcase__scroll-hint" aria-hidden="true">
        <span>{isLast ? 'Explorar' : 'Siguiente'}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}
