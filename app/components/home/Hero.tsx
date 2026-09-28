import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./Hero.css";

import imgLayer1 from "../../assets/webp/1.webp";
import imgLayer2 from "../../assets/webp/2.webp";
import imgLayer3 from "../../assets/webp/3.webp";
import imgLayer4 from "../../assets/webp/4.webp";
import imgLayer5 from "../../assets/webp/5.webp";
import imgLayer6 from "../../assets/webp/6.webp";

import imgLayer1Movil from "../../assets/webp/mobilVersion/1.webp";
import imgLayer2Movil from "../../assets/webp/mobilVersion/2.webp";
import imgLayer3Movil from "../../assets/webp/mobilVersion/3.webp";
import imgLayer4Movil from "../../assets/webp/mobilVersion/4.webp";
import imgLayer5Movil from "../../assets/webp/mobilVersion/5.webp";
import imgLayer6Movil from "../../assets/webp/mobilVersion/6.webp";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PHRASES = [
  "En un mundo donde todo se acelera y se industrializa",
  "AliensKaab sigue un camino distinto",
  "Cada botella es única",
  "Fermentada con miel pura",
  "Desarrollando sus matices sin prisas ni atajos."
];

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const phrasesRef = useRef<(HTMLParagraphElement | null)[]>([]);

  const l1Ref = useRef<HTMLImageElement>(null);
  const l2Ref = useRef<HTMLImageElement>(null);
  const l3Ref = useRef<HTMLImageElement>(null);
  const l4Ref = useRef<HTMLImageElement>(null);
  const l5Ref = useRef<HTMLImageElement>(null);
  const l6Ref = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    let mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)"
    }, (context) => {
      let { isMobile } = context.conditions as { isMobile: boolean };

      // OPTIMIZED: Reduced scroll distance from 4000px to 1000px
      // OPTIMIZED: Reduced scrub from 0.7 to 0.5 for less constant work
      // OPTIMIZED: Added limitCallbacks: true
      // OPTIMIZED: anticipatePin set to 0
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=1000", // OPTIMIZED: Was 4000
          scrub: 0.5, // OPTIMIZED: Was 0.7
          pin: true,
          anticipatePin: 0, // OPTIMIZED: Was 1
          limitCallbacks: true // OPTIMIZED: Added
        }
      });

      // OPTIMIZED: Reduced animation values to be less extreme
      const scaleTierra = isMobile ? 1.5 : 2;
      const scaleOvni = isMobile ? 2 : 2.5;
      const scaleSelvaMedio = isMobile ? 2 : 1.5;
      const scaleSelvaFrente = isMobile ? 2 : 2;

      // OPTIMIZED: Simplified animations with less extreme values
      tl.to(l1Ref.current, { 
        scale: scaleTierra, 
        y: "50vh", // OPTIMIZED: Was 100vh
        x: "-25vw", // OPTIMIZED: Was -50vw
        opacity: 0.5, // OPTIMIZED: Was 0
        duration: 3, 
        ease: "power2.in"
      }, 0);
      
      tl.to(l2Ref.current, { 
        scale: scaleOvni, 
        y: "40vh", // OPTIMIZED: Was 80vh
        x: "30vw", // OPTIMIZED: Was 60vw
        opacity: 0.5, // OPTIMIZED: Was 0
        duration: 2.5, 
        ease: "power2.in"
      }, 0);
      
      // OPTIMIZED: Simplified other animations
      tl.to(l3Ref.current, { 
        scale: 1.2, 
        opacity: 0.7, 
        duration: 1.2, 
        ease: "power1.inOut"
      }, 1);
      
      tl.fromTo(l6Ref.current, 
        { scale: 0.9 }, 
        { scale: 1.1, duration: 4, ease: "power1.inOut" }, 
        1
      );
      
      tl.fromTo(l5Ref.current, 
        { scale: 1, y: "0" }, 
        { scale: scaleSelvaMedio, y: "-2vh", duration: 4, ease: "power3.in" }, 
        1
      );
      
      tl.fromTo(l4Ref.current, 
        { scale: 1, y: "0" }, 
        { scale: scaleSelvaFrente, y: "15vh", opacity: 0.5, duration: 4, ease: "power3.in" }, 
        1
      );

      // OPTIMIZED: Simplified text animations
      tl.to(titleRef.current, {
        scale: 1.2, 
        opacity: 0.8, 
        ease: "power1.inOut", 
        duration: 1
      }, 0);

      PHRASES.forEach((_, i) => {
        const phrase = phrasesRef.current[i];
        const startDelay = 0.5 + (i * 0.8); // OPTIMIZED: Was 1.5 + (i * 2)

        // OPTIMIZED: Simplified phrase animations without heavy effects
        tl.fromTo(phrase, 
          { opacity: 0, y: "-5px" },
          { opacity: 1, y: 0, ease: "power2.out", duration: 0.6 },
          startDelay
        );

        tl.to(phrase, 
          { opacity: 0, y: "5px", ease: "power2.in", duration: 0.6 },
          startDelay + 0.4
        );
      });
    });
  }, { scope: containerRef });

  return (
    <section className="hero" ref={containerRef}>
      <div className="hero__sticky">
        <div className="hero-parallax">
          {/* OPTIMIZED: Using WebP images with lazy loading */}
          <picture>
            <source media="(max-width: 767px)" srcSet={imgLayer6Movil} type="image/webp"/>
            <img 
              ref={l6Ref} 
              src={imgLayer6} 
              className="hero-layer" 
              style={{ zIndex: 1 }} 
              alt="Reina Abeja"
              loading="lazy"
            />
          </picture>
          <picture>
            <source media="(max-width: 767px)" srcSet={imgLayer5Movil} type="image/webp"/>
            <img 
              ref={l5Ref} 
              src={imgLayer5} 
              className="hero-layer" 
              style={{ zIndex: 2 }} 
              alt="Selva Medio"
              loading="lazy"
            />
          </picture>
          <picture>
            <source media="(max-width: 767px)" srcSet={imgLayer4Movil} type="image/webp"/>
            <img 
              ref={l4Ref} 
              src={imgLayer4} 
              className="hero-layer" 
              style={{ zIndex: 3 }} 
              alt="Selva Frente"
              loading="lazy"
            />
          </picture>
          <picture>
            <source media="(max-width: 767px)" srcSet={imgLayer3Movil} type="image/webp"/>
            <img 
              ref={l3Ref} 
              src={imgLayer3} 
              className="hero-layer" 
              style={{ zIndex: 4 }} 
              alt="Espacio"
              loading="lazy"
            />
          </picture>
          <picture>
            <source media="(max-width: 767px)" srcSet={imgLayer1Movil} type="image/webp"/>
            <img 
              ref={l1Ref} 
              src={imgLayer1} 
              className="hero-layer" 
              style={{ zIndex: 5 }} 
              alt="Planeta Tierra"
              loading="lazy"
            />
          </picture>
          <picture>
            <source media="(max-width: 767px)" srcSet={imgLayer2Movil} type="image/webp"/>
            <img 
              ref={l2Ref} 
              src={imgLayer2} 
              className="hero-layer" 
              style={{ zIndex: 6 }} 
              alt="OVNI"
              loading="lazy"
            />
          </picture>
        </div>

        <div className="hero__overlay">
          <div className="hero__content" ref={titleRef}>
            <h1 className="hero__title">DÉJATE ABDUCIR</h1>
            <div className="hero__badge">
              <span>por nuevas experiencias</span>
            </div>
            <Link to="/productos" className="btn btn--accent hero__cta">
              Descubre aquí
            </Link>
          </div>

          <div className="hero__phrases-container">
            {PHRASES.map((phrase, index) => (
              <p
                key={index}
                ref={(el) => {
                  phrasesRef.current[index] = el;
                }}
                className="hero__phrase" 
                style={{ opacity: 0 }}
              >
                {phrase}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
