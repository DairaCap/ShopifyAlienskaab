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

// Tipo de movimiento de la portada
type MotionDirection = 'sube' | 'baja';

export default function CollectionsShowcase({
  collections,
  onExitBottom,
}: CollectionsShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [textExiting, setTextExiting] = useState(false);
  const [imageState, setImageState] = useState<
    'idle' | 'exiting-down' | 'exiting-up' | 'entering-from-top' | 'entering-from-bottom'
  >('idle');

  const containerRef = useRef<HTMLDivElement>(null);
  const transitioning = useRef(false);
  const lastWheelTime = useRef(0);
  const touchStartY = useRef(0);
  const isLeaving = useRef(false);

  // Mantenemos una referencia mutable siempre sincronizada con currentIndex
  const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const goTo = useCallback(
    (nextIndex: number, dir: MotionDirection) => {
      if (transitioning.current) return;

      // Si está en la última colección y vuelve a scrollear hacia adelante → salir a la siguiente sección
      if (nextIndex >= collections.length) {
        isLeaving.current = true;
        onExitBottom?.();
        setTimeout(() => {
          isLeaving.current = false;
        }, 1200);
        return;
      }

      // Si está en la primera colección y scrollear hacia atrás → volver al Hero
      if (nextIndex < 0) {
        isLeaving.current = true;
        const prevSection = containerRef.current?.previousElementSibling as HTMLElement | null;
        if (prevSection) {
          prevSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setTimeout(() => {
          isLeaving.current = false;
        }, 1200);
        return;
      }

      transitioning.current = true;
      setIsTransitioning(true);

      // Transición de textos e imágenes:
      // - dir === 'sube': portada sube (sale hacia arriba, nueva entra desde abajo)
      // - dir === 'baja': portada baja (sale hacia abajo, nueva entra desde arriba)
      setTextExiting(true);
      setImageState(dir === 'sube' ? 'exiting-up' : 'exiting-down');

      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setTextExiting(false);
        setImageState(dir === 'sube' ? 'entering-from-bottom' : 'entering-from-top');
      }, 320);

      setTimeout(() => {
        setImageState('idle');
        setIsTransitioning(false);
        transitioning.current = false;
      }, 680);
    },
    [collections.length, onExitBottom],
  );

  // ---- Autocentrado al invadir la mitad (50%) del área desde arriba o abajo ----
  useEffect(() => {
    let centeringTimeout: NodeJS.Timeout | null = null;
    let isCentering = false;

    const checkAutoCenter = () => {
      const el = containerRef.current;
      if (!el || isLeaving.current) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visibleHeight = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
      const visibleRatio = visibleHeight / Math.max(rect.height, 1);

      // Si la sección queda fuera de vista, reseteamos flags
      if (visibleRatio < 0.15) {
        isLeaving.current = false;
        return;
      }

      // Al invadir el 50% o más del área y no estar ya centrada
      if (visibleRatio >= 0.5 && Math.abs(rect.top) > 15 && !isCentering) {
        isCentering = true;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (centeringTimeout) clearTimeout(centeringTimeout);
        centeringTimeout = setTimeout(() => {
          isCentering = false;
        }, 800);
      }
    };

    window.addEventListener('scroll', checkAutoCenter, { passive: true });
    return () => {
      window.removeEventListener('scroll', checkAutoCenter);
      if (centeringTimeout) clearTimeout(centeringTimeout);
    };
  }, []);

  // ---- Captura y Atrapado del Scroll (Wheel) sobre las categorías ----
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const el = containerRef.current;
      if (!el || isLeaving.current) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visibleHeight = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
      const visibleRatio = visibleHeight / Math.max(rect.height, 1);

      // Si la sección de categorías domina la vista (>= 45%), ATRAPA el scroll
      if (visibleRatio >= 0.45) {
        // Asegurar que la pantalla esté centrada
        if (Math.abs(rect.top) > 10) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Siempre prevenimos el scroll nativo de la página para que pase por todas las categorías
        e.preventDefault();

        const now = Date.now();
        if (now - lastWheelTime.current < 400) return;
        if (Math.abs(e.deltaY) < 15) return;
        lastWheelTime.current = now;

        if (e.deltaY > 0) {
          // Gesto hacia arriba / avance -> portada sube, siguiente categoría
          goTo(currentIndexRef.current + 1, 'sube');
        } else {
          // Gesto hacia abajo / retroceso -> portada baja, categoría anterior
          goTo(currentIndexRef.current - 1, 'baja');
        }
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [goTo]);

  // ---- Captura y Atrapado del Scroll en Pantallas Táctiles (Touch) ----
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      const el = containerRef.current;
      if (!el || isLeaving.current) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visibleHeight = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
      const visibleRatio = visibleHeight / Math.max(rect.height, 1);

      // Si está en la sección de categorías, atrapa el movimiento táctil
      if (visibleRatio >= 0.45 && e.cancelable) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const el = containerRef.current;
      if (!el || isLeaving.current) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visibleHeight = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
      const visibleRatio = visibleHeight / Math.max(rect.height, 1);

      if (visibleRatio < 0.45) return;

      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 30) return;

      if (delta > 0) {
        // Deslizar hacia arriba -> portada sube, siguiente categoría
        goTo(currentIndexRef.current + 1, 'sube');
      } else {
        // Deslizar hacia abajo -> portada baja, categoría anterior
        goTo(currentIndexRef.current - 1, 'baja');
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [goTo]);

  // ---- Navegación por Teclado ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!containerRef.current || isLeaving.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visibleHeight = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
      const visibleRatio = visibleHeight / Math.max(rect.height, 1);

      if (visibleRatio < 0.45) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goTo(currentIndexRef.current + 1, 'sube');
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goTo(currentIndexRef.current - 1, 'baja');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo]);

  if (!collections || collections.length === 0) return null;

  const collection = collections[currentIndex];
  const bgColor = COLLECTION_COLORS[currentIndex % COLLECTION_COLORS.length];
  const [subtitle, mainTitle] = splitTitle(collection.title);
  const isLast = currentIndex === collections.length - 1;

  const imageClass = (() => {
    switch (imageState) {
      case 'exiting-down':          return ' is-exiting-down';
      case 'exiting-up':            return ' is-exiting-up';
      case 'entering-from-top':     return ' is-entering-from-top';
      case 'entering-from-bottom':  return ' is-entering-from-bottom';
      default:                      return '';
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
            onClick={() => goTo(i, i > currentIndex ? 'sube' : 'baja')}
            aria-label={`Ver colección ${col.title}`}
            aria-current={i === currentIndex ? 'true' : undefined}
            disabled={isTransitioning}
          />
        ))}
      </nav>

      {/* Hint en el borde inferior de la pantalla */}
      <div
        className="collections-showcase__scroll-hint"
        aria-hidden="true"
        onClick={() => goTo(currentIndex + 1, 'sube')}
        style={{ cursor: 'pointer', pointerEvents: 'all' }}
      >
        <span>{isLast ? 'Explorar' : 'Siguiente'}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}
