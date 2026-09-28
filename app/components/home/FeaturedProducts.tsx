import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./FeaturedProducts.css";
import ScrollReveal from "../ScrollReveal";

// Optimized image imports - these should be WebP versions
import imgSpace from "../../assets/webp/3.webp"; 
import imgTrees from "../../assets/webp/10.webp";  
import imgAliens from "../../assets/webp/8.webp"; 
import imgVase from "../../assets/webp/9.webp";   

import imgSpaceMovil from "../../assets/webp/mobilVersion/3.webp"; 
import imgTreesMovil from "../../assets/webp/mobilVersion/10.webp";  
import imgAliensMovil from "../../assets/webp/mobilVersion/8.webp"; 
import imgVaseMovil from "../../assets/webp/mobilVersion/9.webp";   

// Optimized product images - these should be smaller WebP versions
import botella1 from  "../../assets/webp/productos/A-MARTE@72x.webp";
import botella2 from  "../../assets/webp/productos/BESO-CUANTICO@72x.webp";
import botella3 from  "../../assets/webp/productos/1.webp";
import botella4 from  "../../assets/webp/productos/4.webp";
import botella5 from  "../../assets/webp/productos/5.webp";
import botella6 from  "../../assets/webp/productos/6.webp";
import botella7 from  "../../assets/webp/productos/7.webp";
import botella8 from  "../../assets/webp/productos/8.webp";
import botella9 from  "../../assets/webp/productos/9.webp";
import botella10 from  "../../assets/webp/productos/3.webp";

const hidromieles = [
  { id: 1, name: "Néctar Estelar", abv: "11%", desc: "Fermentada lentamente con miel multifloral y un toque místico de cardamomo.", img: botella1, accent: "yellow" },
  { id: 2, name: "Quásar Oscuro", abv: "14%", desc: "Intensa y especiada, madurada en barricas de roble con moras silvestres.", img: botella2, accent: "purple" },
  { id: 3, name: "Supernova", abv: "12%", desc: "Explosión cítrica con lúpulos tropicales, perfecta para refrescar.", img: botella3, accent: "green" },
  { id: 4, name: "Pulsar", abv: "10%", desc: "Ligera, cristalina y delicada, con notas florales de manzanilla.", img: botella4, accent: "blue" },
  { id: 5, name: "Materia Oscura", abv: "16%", desc: "Cuerpo pesado, rica en cacao y café tostado. Una experiencia profunda.", img: botella5, accent: "shell" },
  { id: 6, name: "Órbita Roja", abv: "9%", desc: "Dulzor perfectamente equilibrado con frambuesa y un toque de romero.", img: botella6, accent: "purple" },
  { id: 7, name: "Eclipse", abv: "13%", desc: "Elaborada con miel de bosque oscuro, profunda, terrosa y misteriosa.", img: botella7, accent: "shell" },
  { id: 8, name: "Vía Láctea", abv: "8%", desc: "Textura cremosa inigualable, con lactosa y vainilla de Madagascar.", img: botella8, accent: "yellow" },
  { id: 9, name: "Meteorito", abv: "15%", desc: "Perfil seco y atrevido, con infusión de chiles ahumados para los valientes.", img: botella9, accent: "green" },
  { id: 10, name: "Gravedad Cero", abv: "11%", desc: "Ultra refrescante y ligera, con menta silvestre y ralladura de lima.", img: botella10, accent: "blue" },
];

export default function FeaturedProducts() {
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const bottlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const navRef = useRef<HTMLDivElement>(null);
  const activeIdxRef = useRef(4);
  
  const lSpaceRef = useRef<HTMLImageElement>(null);
  const lTreesRef = useRef<HTMLImageElement>(null);
  const lAliensRef = useRef<HTMLImageElement>(null);
  const lVaseRef = useRef<HTMLImageElement>(null);

  const isIntroDone = useRef(false);
  const isVisible = useRef(false);

  // Configure ScrollTrigger after component mounts
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    ScrollTrigger.normalizeScroll(true);
    
    return () => {
      ScrollTrigger.normalizeScroll(false);
    };
  }, []);

  const getBottleLayout = (i: number, activeIdx: number, total: number) => {
    let diff = i - activeIdx;
    if (diff > total / 2) diff -= total;
    else if (diff < -total / 2) diff += total;

    const isMobile = window.innerWidth < 768;
    // OPTIMIZED: Reduced radius for less dramatic effect
    const radiusX = isMobile ? window.innerWidth * 0.35 : window.innerWidth * 0.30;
    
    const theta = (diff / total) * Math.PI * 2;
    const x = Math.sin(theta) * radiusX;
    const z = Math.cos(theta); 
    
    const absDiff = Math.abs(diff);
    // OPTIMIZED: Simplified Y positioning
    let y = 0;
    if (absDiff === 0) y = -80;
    else if (absDiff === 1) y = -40;
    else if (absDiff === 2) y = 0;
    else y = absDiff * 20; 
    
    // OPTIMIZED: Simplified scale calculation
    const isCenter = diff === 0;
    const scale = isCenter ? 1.2 : Math.max(0.5, 0.7 + (z * 0.2)); 
    
    // OPTIMIZED: Simplified visibility logic
    const visibleCount = isMobile ? 3 : 4;
    const halfVis = Math.floor(visibleCount / 2); 
    const isMainVisible = Math.abs(diff) <= halfVis;
    
    const opacity = isMainVisible ? 1 : Math.max(0.2, 0.3 + (z * 0.3)); 
    const zIndex = Math.round(z * 50); // OPTIMIZED: Reduced zIndex range

    return { diff, x, y, z, scale, zIndex, opacity };
  };

  const playIntro = () => {
    if (isVisible.current) return;
    isVisible.current = true;
    isIntroDone.current = true; 

    const active = activeIdxRef.current;
    const total = hidromieles.length;

    // OPTIMIZED: Use GSAP's built-in stagger instead of manual delay calculation
    bottlesRef.current.forEach((bottle, i) => {
      if (!bottle) return;
      const layout = getBottleLayout(i, active, total);
      
      gsap.to(bottle, { 
        x: layout.x,                   
        scale: layout.scale,               
        rotation: layout.diff * 3, // OPTIMIZED: Reduced rotation
        opacity: layout.opacity,
        duration: 0.8, // OPTIMIZED: Reduced duration
        ease: "power2.out"
      });

      gsap.to(bottle, {
        y: layout.y, 
        duration: 0.8,
        ease: "back.out(1.2)"
      }, 0);
    });

    gsap.to(navRef.current, { opacity: 1, duration: 0.3 });
  };

  const playOutro = () => {
    if (!isVisible.current) return;
    isVisible.current = false;
    isIntroDone.current = false; 

    gsap.to(bottlesRef.current, { 
      x: 0, 
      y: 100, // OPTIMIZED: Reduced from 400
      scale: 0.3, // OPTIMIZED: Reduced from 0.2
      opacity: 0, 
      duration: 0.5, // OPTIMIZED: Reduced from 0.8
      ease: "power3.in"
    });

    gsap.to(navRef.current, { opacity: 0, duration: 0.2 });
  };

  // OPTIMIZED: Reduced scroll distance and improved GSAP config
  useGSAP(() => {
    if (!pinContainerRef.current) return;

    gsap.set(bottlesRef.current, { 
      x: 0, y: 100, scale: 0.3, opacity: 0, transformOrigin: "bottom center" 
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinContainerRef.current,
        start: "top top",
        // OPTIMIZED: Further reduced from 1000px to 600px
        end: "+=600",
        scrub: 0.8, // OPTIMIZED: Increased scrub for less constant work
        pin: true,
        anticipatePin: 0,
        onUpdate: (self) => {
          // OPTIMIZED: Adjusted threshold for better performance
          if (self.progress > 0.6) {
            playIntro();
          } else {
            playOutro();
          }
        }
      }
    });

    // OPTIMIZED: Simplified background animations
    tl.fromTo(lSpaceRef.current, { scale: 1.05 }, { scale: 1, duration: 0.8 }, 0);
    tl.fromTo(lTreesRef.current, { scale: 1.1, y: "5vh" }, { scale: 1, y: "0vh", duration: 0.8, ease: "power1.out" }, 0);
    tl.fromTo(lAliensRef.current, { scale: 1.1, y: "5vh" }, { scale: 1, y: "0vh", duration: 0.8, ease: "power2.out" }, 0);
    tl.fromTo(lVaseRef.current, { scale: 1, y: "15vh" }, { scale: 1, y: "5vh", duration: 0.8, ease: "back.out(1.2)" }, 0);

  }, { scope: pinContainerRef });

  const rotateCarousel = (direction: "next" | "prev") => {
    if (!isIntroDone.current) return;

    const total = hidromieles.length;
    
    if (direction === "next") {
      activeIdxRef.current = (activeIdxRef.current + 1) % total;
    } else {
      activeIdxRef.current = (activeIdxRef.current - 1 + total) % total;
    }

    const newActive = activeIdxRef.current;

    // OPTIMIZED: Batch GSAP updates
    bottlesRef.current.forEach((bottle, i) => {
      if (!bottle) return;
      const layout = getBottleLayout(i, newActive, total);
      
      gsap.to(bottle, {
        x: layout.x,
        y: layout.y, 
        scale: layout.scale,
        opacity: layout.opacity,
        zIndex: layout.zIndex,
        rotation: 0, 
        duration: 0.4, // OPTIMIZED: Reduced duration
        ease: "power3.out"
      });
    });
  };

  return (
    <section className="section featured-products" id="productos">
      <div className="container" style={{ padding: "12vh 0", backgroundColor: "#060607", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <ScrollReveal as="header" className="section__header">
          <div style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
            <p className="section__eyebrow">Nuestra selección especial</p>
            <h2 className="section__title">Conoce nuestras hidromieles</h2>
          </div>
        </ScrollReveal>
      </div>

      <div ref={pinContainerRef} className="featured-animation-wrapper" style={{ height: "90vh", width: "100%", position: "relative", overflow: "hidden", backgroundColor: "#000", zIndex: 1 }}>
        
        <div className="fp-parallax">
          <picture>
            <source media="(max-width: 767px)" srcSet={imgSpaceMovil} type="image/webp"/>
            <img 
              ref={lSpaceRef} 
              src={imgSpace} 
              className="fp-layer" 
              style={{ zIndex: 1 }} 
              alt="Espacio"
              loading="lazy"
            />
          </picture>
          <picture>
            <source media="(max-width: 767px)" srcSet={imgTreesMovil} type="image/webp"/>
            <img 
              ref={lTreesRef} 
              src={imgTrees} 
              className="fp-layer" 
              style={{ zIndex: 2 }} 
              alt="Árboles"
              loading="lazy"
            />
          </picture>
          <picture>
            <source media="(max-width: 767px)" srcSet={imgAliensMovil} type="image/webp"/>
            <img 
              ref={lAliensRef} 
              src={imgAliens} 
              className="fp-layer" 
              style={{ zIndex: 3 }} 
              alt="Aliens"
              loading="lazy"
            />
          </picture>
          <picture>
            <source media="(max-width: 767px)" srcSet={imgVaseMovil} type="image/webp"/>
            <img 
              ref={lVaseRef} 
              src={imgVase} 
              className="fp-bowl" 
              style={{ zIndex: 6 }} 
              alt="Jarrón"
              loading="lazy"
            />
          </picture>
        </div>

        <div className="bottles-clip-mask">
          <div className="bottles-carousel" style={{ zIndex: 4 }}>
            {hidromieles.map((item, i) => (
              <div 
                key={item.id} 
                className="bottle-wrapper" 
                ref={(el) => { bottlesRef.current[i] = el; }}
              >
                <div className="bottle-inner">
                  {/* OPTIMIZED: Added loading="lazy" and optimized alt text */}
                  <img 
                    src={item.img} 
                    alt={item.name} 
                    className="bottle-img"
                    loading="lazy"
                  />
                  <div className="bottle-info-overlay">
                    <h3 className="bottle-name">{item.name}</h3>
                    <span className="bottle-abv">{item.abv} Alc.</span>
                    <p className="bottle-desc">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="carousel-nav" ref={navRef} style={{ zIndex: 10 }}>
            <button className="carousel-btn prev" onClick={() => rotateCarousel("prev")}>&#10094;</button>
            <button className="carousel-btn next" onClick={() => rotateCarousel("next")}>&#10095;</button>
          </div>
        </div>
      </div>
    </section>
  );
}
