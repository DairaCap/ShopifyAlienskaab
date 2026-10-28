import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import './AwardsSection.css';

export interface AwardItem {
  id: string;
  handle: string;
  nombre: string;
  descripcion: string;
  imagen?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
}

interface AwardsSectionProps {
  premios?: AwardItem[];
  onExitBottom?: () => void;
}

// 10 Premios locales de respaldo si Shopify aún no tiene registros en el metaobjeto
const FALLBACK_AWARDS: AwardItem[] = [
  {
    id: 'premio-1',
    handle: 'copa-cervecera-mexico-oro',
    nombre: 'Copa Cervecera México — Medalla de Oro',
    descripcion:
      'Medalla de oro en la categoría de hidromiel tradicional. Máximo reconocimiento a la pureza y técnica en el fermentado de miel virgen de abeja melipona y agua de manantial.',
    imagen: { url: '/awards/1.png', altText: 'Copa Cervecera México Oro' },
  },
  {
    id: 'premio-2',
    handle: 'copa-latinoamericana-hidromiel',
    nombre: 'Copa Latinoamericana de Hidromiel — Mejor en su Clase',
    descripcion:
      'Galardón internacional destacando la complejidad aromática, bouquet floral y el balance perfecto entre acidez natural y dulzor residual.',
    imagen: { url: '/awards/2.png', altText: 'Copa Latinoamericana de Hidromiel' },
  },
  {
    id: 'premio-3',
    handle: 'certificado-excelencia-apicola',
    nombre: 'Certificado de Excelencia Apícola Maya',
    descripcion:
      'Distinción de honor por las prácticas de cosecha sustentable y preservación activa de la abeja nativa melipona en la selva de la península de Yucatán.',
    imagen: { url: '/awards/3.png', altText: 'Certificado de Excelencia Apícola' },
  },
  {
    id: 'premio-4',
    handle: 'gran-oro-hidromieles-nuevo-mundo',
    nombre: 'Gran Medalla de Oro — Hidromieles del Nuevo Mundo',
    descripcion:
      'Premio a la innovación sensorial y cuerpo aterciopelado. Evaluada con puntuación perfecta por jueces internacionales certificados BJCP.',
    imagen: { url: '/awards/4.png', altText: 'Gran Medalla de Oro Nuevo Mundo' },
  },
  {
    id: 'premio-5',
    handle: 'innovacion-bebidas-ancestrales',
    nombre: 'Premio a la Innovación en Fermentados Ancestrales',
    descripcion:
      'Homenaje a la unión entre la cosmovisión y sabiduría milenaria de los antiguos mayas con procesos contemporáneos de vinificación de alta gama.',
    imagen: { url: '/awards/5.png', altText: 'Innovación en Bebidas Ancestrales' },
  },
  {
    id: 'premio-6',
    handle: 'copa-mitad-del-mundo-plata',
    nombre: 'Copa Mitad del Mundo — Plata Hidromiel de Autor',
    descripcion:
      'Reconocimiento a nuestra edición especial infusionada con botánicos silvestres y notas cítricas cosechadas en temporada lunar.',
    imagen: { url: '/awards/6.png', altText: 'Copa Mitad del Mundo Plata' },
  },
  {
    id: 'premio-7',
    handle: 'mencion-honor-world-mead-challenge',
    nombre: 'Mención de Honor — World Mead Challenge',
    descripcion:
      'Calificación sobresaliente en cata a ciegas internacional, elogiando la claridad cristalina, efervescencia delicada y persistencia en paladar.',
    imagen: { url: '/awards/7.png', altText: 'Mención de Honor World Mead' },
  },
  {
    id: 'premio-8',
    handle: 'pureza-origen-melipona',
    nombre: 'Sello de Pureza y Origen Melipona',
    descripcion:
      'Aval oficial de trazabilidad biológica por la conservación del néctar puro de floraciones endémicas de la selva maya.',
    imagen: { url: '/awards/8.png', altText: 'Pureza y Origen Melipona' },
  },
  {
    id: 'premio-9',
    handle: 'seleccion-especial-del-jurado',
    nombre: 'Premio Selección Especial del Jurado',
    descripcion:
      'Otorgado unánimemente por el panel de sommeliers como la propuesta más audaz, elegante y cautivadora del certamen anual.',
    imagen: { url: '/awards/9.png', altText: 'Selección Especial del Jurado' },
  },
  {
    id: 'premio-10',
    handle: 'trofeo-maximo-legado-cosmos',
    nombre: 'Trofeo Máximo Alienskaab — Legado del Cosmos',
    descripcion:
      'Emblema de la devoción, la ciencia y la pasión artesanal que define cada lote producido en nuestro santuario apícola.',
    imagen: { url: '/awards/10.png', altText: 'Trofeo Máximo Alienskaab' },
  },
];

export default function AwardsSection({
  premios = [],
  onExitBottom,
}: AwardsSectionProps) {
  // Lista final combinando los datos reales de Shopify con el fallback
  const awardsList = useMemo(() => {
    return premios && premios.length > 0 ? premios : FALLBACK_AWARDS;
  }, [premios]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Estado del premio seleccionado (modal de detalle)
  const [selectedAward, setSelectedAward] = useState<AwardItem | null>(null);

  // Tooltip al hacer hover en 3D
  const [hoveredAward, setHoveredAward] = useState<AwardItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Progreso del scroll en la sección (0 a 1)
  const [timelineProgress, setTimelineProgress] = useState(0);

  // Abrir detalle y sincronizar URL (?premio=handle)
  const openAward = useCallback((award: AwardItem) => {
    setSelectedAward(award);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('premio', award.handle || award.id);
      window.history.pushState({ premio: award.handle || award.id }, '', url.toString());
    }
  }, []);

  // Cerrar detalle y restaurar URL
  const closeAward = useCallback(() => {
    setSelectedAward(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('premio')) {
        url.searchParams.delete('premio');
        window.history.pushState({}, '', url.toString());
      }
    }
  }, []);

  // Escuchar el evento popstate (botón atrás del navegador o gesto móvil)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const premioHandle = params.get('premio');
      if (premioHandle) {
        const found = awardsList.find(
          (a) => a.handle === premioHandle || a.id === premioHandle,
        );
        if (found) {
          setSelectedAward(found);
        } else {
          setSelectedAward(null);
        }
      } else {
        setSelectedAward(null);
      }
    };

    // Verificar si al cargar la página ya venía con ?premio=
    const initialParams = new URLSearchParams(window.location.search);
    const initialHandle = initialParams.get('premio');
    if (initialHandle) {
      const found = awardsList.find(
        (a) => a.handle === initialHandle || a.id === initialHandle,
      );
      if (found) setSelectedAward(found);
    }

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [awardsList]);

  // Manejar teclado (Escape para cerrar modal)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedAward) {
        closeAward();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedAward, closeAward]);

  // ----------------------------------------------------
  // ESCENA 3D CON THREE.JS
  // ----------------------------------------------------
  useEffect(() => {
    const canvasContainer = canvasContainerRef.current;
    if (!canvasContainer || typeof window === 'undefined') return;

    let width = canvasContainer.clientWidth || window.innerWidth;
    let height = canvasContainer.clientHeight || window.innerHeight;

    // 1. Escena, Cámara y Renderer sobre fondo #f8f7f4
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Correcto espacio de color para que las texturas PBR del GLB se vean bien
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasContainer.appendChild(renderer.domElement);

    // 2. Mapa de entorno neutro (RoomEnvironment) para que los materiales PBR
    //    del GLB reflejen correctamente metalness / roughness sin sobreescribir nada
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = roomEnv.texture; // solo se usa para reflejo PBR, no como fondo
    pmremGenerator.dispose();

    // 3. Iluminación limpia de estudio / museo para respetar texturas reales PBR
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbf0, 1.8);
    keyLight.position.set(5, 10, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf0f4f8, 1.0);
    fillLight.position.set(-5, 6, 4);
    scene.add(fillLight);

    const shelfSpotlight = new THREE.SpotLight(0xffffff, 1.6, 16, Math.PI / 3.5, 0.5, 1.2);
    shelfSpotlight.position.set(0, 5, 6);
    scene.add(shelfSpotlight);

    // 3. Grupos principales
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const trophyPivot = new THREE.Group();
    mainGroup.add(trophyPivot);

    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(0, -9.5, 0);
    shelfGroup.scale.set(1.2, 1.2, 1.2);
    mainGroup.add(shelfGroup);

    // Array de cuadros con sus posiciones base para aplicar parallax del cursor
    const awardMeshes: {
      frame: THREE.Object3D;
      canvasMesh: THREE.Mesh;
      baseX: number;
      baseY: number;
      baseRotX: number;
      baseRotY: number;
      award: AwardItem;
    }[] = [];

    const gltfLoader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    let trophyMesh: THREE.Object3D | null = null;
    let isTrophyLoaded = false;
    let isShelfLoaded = false;

    // Velocidad de giro del trofeo (se acelera rápido al mover cursor/dedo sobre él)
    let trophySpinVelocity = 0;
    let isOverTrophy = false;

    // 4. Cargar Trofeo (golden_trophy.glb)
    // RESPETAMOS 100% sus texturas y materiales originales del archivo
    gltfLoader.load(
      '/3d/golden_trophy.glb',
      (gltf) => {
        trophyMesh = gltf.scene;

        // Centrar pivot del trofeo exactamente en su eje
        const box = new THREE.Box3().setFromObject(trophyMesh);
        const center = new THREE.Vector3();
        box.getCenter(center);
        trophyMesh.position.sub(center);

        // Habilitar sombras sin sobreescribir ninguna propiedad de material original
        trophyMesh.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        trophyPivot.add(trophyMesh);
        trophyPivot.scale.set(0.95, 0.95, 0.95);
        trophyPivot.position.set(0, -0.2, 0);
        isTrophyLoaded = true;
      },
      undefined,
      (err) => console.error('Error cargando golden_trophy.glb:', err),
    );

    // 5. Cargar Shelf (shelf.glb) y colocar los premios en cuadros
    // RESPETAMOS 100% sus texturas y materiales originales del archivo
    gltfLoader.load(
      '/3d/shelf.glb',
      (gltf) => {
        const shelfMesh = gltf.scene;
        shelfGroup.add(shelfMesh);

        shelfMesh.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.receiveShadow = true;
          }
        });

        // Niveles físicos de la repisa
        const shelfLevelsY = [4.56, 3.44, 2.33, 1.24, 0.11];

        // Crear cuadros (lienzos con marco) para cada premio
        awardsList.forEach((award, index) => {
          const levelIndex = Math.min(Math.floor(index / 2), shelfLevelsY.length - 1);
          const y = shelfLevelsY[levelIndex];
          const isLeft = index % 2 === 0;
          const x = isLeft ? -0.74 : 0.74;

          const frameGroup = new THREE.Group();

          // Marco exterior sobrio estilo galería
          const frameGeo = new THREE.BoxGeometry(0.82, 1.05, 0.05);
          const frameMat = new THREE.MeshStandardMaterial({
            color: 0x181818,
            roughness: 0.5,
            metalness: 0.3,
          });
          const frameMesh = new THREE.Mesh(frameGeo, frameMat);
          frameGroup.add(frameMesh);

          // Borde dorado sutil
          const borderGeo = new THREE.BoxGeometry(0.74, 0.96, 0.052);
          const borderMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.3,
            metalness: 0.6,
          });
          const borderMesh = new THREE.Mesh(borderGeo, borderMat);
          frameGroup.add(borderMesh);

          // Lienzo con la imagen del premio
          const canvasGeo = new THREE.PlaneGeometry(0.7, 0.92);
          const canvasMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.45,
            metalness: 0.1,
          });

          // Cargar textura de la imagen
          const imgUrl = award.imagen?.url || '/awards/1.png';
          textureLoader.load(imgUrl, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            canvasMat.map = texture;
            canvasMat.needsUpdate = true;
          });

          const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
          canvasMesh.position.z = 0.028;
          canvasMesh.userData = { award, frameGroup };
          frameGroup.add(canvasMesh);

          // Posicionar apoyado en el estante y recargado hacia atrás
          const basePosY = y + 0.53;
          const baseRotX = -0.16;
          const baseRotY = isLeft ? 0.08 : -0.08;

          frameGroup.position.set(x, basePosY, 0.08);
          frameGroup.rotation.x = baseRotX;
          frameGroup.rotation.y = baseRotY;

          shelfGroup.add(frameGroup);

          awardMeshes.push({
            frame: frameGroup,
            canvasMesh,
            baseX: x,
            baseY: basePosY,
            baseRotX,
            baseRotY,
            award,
          });
        });

        isShelfLoaded = true;
      },
      undefined,
      (err) => console.error('Error cargando shelf.glb:', err),
    );

    // 6. Raycaster y Seguimiento de Cursor / Touch
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1000, -1000);
    const smoothPointer = new THREE.Vector2(0, 0);

    let prevPointerX = 0;
    let prevPointerY = 0;
    let currentHoveredMesh: THREE.Mesh | null = null;

    const handlePointerMove = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const newX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const newY = -((clientY - rect.top) / rect.height) * 2 + 1;

      mouse.x = newX;
      mouse.y = newY;

      // Calcular velocidad de desplazamiento del cursor / dedo
      const deltaX = clientX - prevPointerX;
      const deltaY = clientY - prevPointerY;
      const pointerSpeed = Math.hypot(deltaX, deltaY);

      prevPointerX = clientX;
      prevPointerY = clientY;

      // Detectar si el cursor está sobre la zona del trofeo para hacerlo rotar rápido
      if (Math.hypot(newX, newY) < 0.45 || isOverTrophy) {
        // Al mover el cursor/dedo sobre el trofeo, da vueltas rápido para notar el movimiento
        const boost = Math.min(pointerSpeed * 0.09, 3.5);
        trophySpinVelocity = (deltaX >= 0 ? 1 : -1) * (boost + 6.0);
      }

      setTooltipPos({ x: clientX, y: clientY });
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isTouchScrolling = false;

    const onPointerMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isTouchScrolling = false;
        handlePointerMove(touchStartX, touchStartY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const clientX = e.touches[0].clientX;
        const clientY = e.touches[0].clientY;
        const dist = Math.hypot(clientX - touchStartX, clientY - touchStartY);
        if (dist > 8) {
          isTouchScrolling = true;
        }
        handlePointerMove(clientX, clientY);
      }
    };

    const handleInteractionClick = (clientX: number, clientY: number) => {
      if (selectedAward) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const clickMouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );

      raycaster.setFromCamera(clickMouse, camera);
      const interactiveCanvases = awardMeshes.map((m) => m.canvasMesh);
      const intersects = raycaster.intersectObjects(interactiveCanvases, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const award = hit.userData.award as AwardItem;
        if (award) {
          openAward(award);
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const elapsed = Date.now() - touchStartTime;
      // Solo si fue un tap deliberado (< 350ms y sin desplazamiento significativo de scroll)
      if (!isTouchScrolling && elapsed < 350 && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        handleInteractionClick(touch.clientX, touch.clientY);
      }
    };

    const onClick = (e: MouseEvent) => {
      handleInteractionClick(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    renderer.domElement.addEventListener('click', onClick);

    // 7. Scroll / Timeline Scrubbing
    let targetProgress = 0;
    let smoothProgress = 0;

    const onScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollable = container.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;

      // Calcular porcentaje de avance a través del contenedor
      const currentScroll = -rect.top;
      const progress = Math.min(Math.max(currentScroll / totalScrollable, 0), 1);
      targetProgress = progress;
      setTimelineProgress(progress);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 8. Bucle de Renderizado Continuo con Parallax
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Suavizado del progreso mediante interpolación (lerp)
      smoothProgress += (targetProgress - smoothProgress) * 0.085;

      // Suavizado del pointer para efectos de inclinación / parallax
      smoothPointer.x += (mouse.x - smoothPointer.x) * 0.08;
      smoothPointer.y += (mouse.y - smoothPointer.y) * 0.08;

      // ---- INTERACCIÓN CON EL TROFEO (ROTACIÓN RÁPIDA CON EL CURSOR/DEDO) ----
      if (isTrophyLoaded && trophyPivot) {
        // El trofeo gira en base a la velocidad inducida por el movimiento del cursor
        if (Math.abs(trophySpinVelocity) > 0.01) {
          trophyPivot.rotation.y += trophySpinVelocity * delta;
          // Fricción suave para desacelerar
          trophySpinVelocity *= Math.pow(0.88, delta * 60);
        }

        // Inclinación 3D del trofeo siguiendo la posición del cursor/dedo
        trophyPivot.rotation.x = THREE.MathUtils.lerp(trophyPivot.rotation.x, -smoothPointer.y * 0.22, 0.08);
        trophyPivot.rotation.z = THREE.MathUtils.lerp(trophyPivot.rotation.z, -smoothPointer.x * 0.18, 0.08);
      }

      // ---- PARALLAX DE LOS CUADROS DE LAS MEDALLAS ----
      // Los cuadros se mueven e inclinan sutilmente conforme a la posición del cursor/dedo
      awardMeshes.forEach((item, idx) => {
        const offsetMultiplier = idx % 2 === 0 ? 1 : 0.8;
        const targetX = item.baseX + smoothPointer.x * 0.12 * offsetMultiplier;
        const targetY = item.baseY + smoothPointer.y * 0.08 * offsetMultiplier;
        const targetRotY = item.baseRotY + smoothPointer.x * 0.14;
        const targetRotX = item.baseRotX - smoothPointer.y * 0.1;

        item.frame.position.x += (targetX - item.frame.position.x) * 0.1;
        item.frame.position.y += (targetY - item.frame.position.y) * 0.1;
        item.frame.rotation.y += (targetRotY - item.frame.rotation.y) * 0.1;
        item.frame.rotation.x += (targetRotX - item.frame.rotation.x) * 0.1;
      });

      // ---- CONTROL DE LA LÍNEA TEMPORAL (SCROLL) ----
      if (isTrophyLoaded && isShelfLoaded) {
        const p = smoothProgress;

        if (p < 0.25) {
          // Fase 1: Transición Trofeo hacia la cima de la repisa
          const t1 = p / 0.25;

          const trophyScale = THREE.MathUtils.lerp(0.95, 0.26, t1);
          trophyPivot.scale.set(trophyScale, trophyScale, trophyScale);

          const shelfY = THREE.MathUtils.lerp(-9.5, -2.5, t1);
          shelfGroup.position.y = shelfY;

          const targetTrophyY = shelfY + 5.67 * 1.2 + 0.38;
          trophyPivot.position.y = THREE.MathUtils.lerp(-0.2, targetTrophyY, t1);
          trophyPivot.position.z = THREE.MathUtils.lerp(0, 0.1, t1);

          camera.position.set(0, 0, 7.2);
          shelfSpotlight.position.set(0, 5, 6);
        } else {
          // Fase 2: El estante sube a lo largo de la línea temporal
          const t2 = (p - 0.25) / 0.75;

          const shelfY = THREE.MathUtils.lerp(-2.5, 4.3, t2);
          shelfGroup.position.y = shelfY;

          trophyPivot.scale.set(0.26, 0.26, 0.26);
          trophyPivot.position.y = shelfY + 5.67 * 1.2 + 0.38;
          trophyPivot.position.z = 0.1;

          shelfSpotlight.position.y = -shelfY + 3.0;
        }
      }

      // ---- RAYCASTING (HOVER & HIGHLIGHT) ----
      raycaster.setFromCamera(mouse, camera);

      // Verificar si el cursor está sobre el trofeo
      if (trophyMesh) {
        const trophyIntersects = raycaster.intersectObject(trophyPivot, true);
        isOverTrophy = trophyIntersects.length > 0;
      }

      const interactiveCanvases = awardMeshes.map((m) => m.canvasMesh);
      const intersects = raycaster.intersectObjects(interactiveCanvases, false);

      if (intersects.length > 0 && !selectedAward) {
        const hit = intersects[0].object as THREE.Mesh;
        if (currentHoveredMesh !== hit) {
          currentHoveredMesh = hit;
          const hitAward = hit.userData.award as AwardItem;
          setHoveredAward(hitAward);
          document.body.style.cursor = 'pointer';

          // Resaltar el premio enfocado y atenuar ligeramente los demás
          awardMeshes.forEach((item) => {
            const mat = item.canvasMesh.material as THREE.MeshStandardMaterial;
            if (item.canvasMesh === hit) {
              item.frame.scale.set(1.08, 1.08, 1.08);
              mat.opacity = 1.0;
            } else {
              item.frame.scale.set(0.96, 0.96, 0.96);
              mat.opacity = 0.5;
              mat.transparent = true;
            }
          });
        }
      } else {
        if (currentHoveredMesh) {
          currentHoveredMesh = null;
          setHoveredAward(null);
          document.body.style.cursor = 'default';

          awardMeshes.forEach((item) => {
            const mat = item.canvasMesh.material as THREE.MeshStandardMaterial;
            mat.opacity = 1.0;
            mat.transparent = false;
            item.frame.scale.set(1.0, 1.0, 1.0);
          });
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Responsive
    const onResize = () => {
      if (!canvasContainer) return;
      const newWidth = canvasContainer.clientWidth || window.innerWidth;
      const newHeight = canvasContainer.clientHeight || window.innerHeight;
      camera.aspect = newWidth / newHeight;

      if (newWidth < 768) {
        camera.fov = 58;
        shelfGroup.scale.set(0.95, 0.95, 0.95);
      } else {
        camera.fov = 46;
        shelfGroup.scale.set(1.2, 1.2, 1.2);
      }

      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', onResize);
    onResize();

    // Limpieza al desmontar
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('click', onClick);
      document.body.style.cursor = 'default';

      if (canvasContainer.contains(renderer.domElement)) {
        canvasContainer.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [awardsList, openAward, selectedAward]);

  // Opacidad del título superior: visible al inicio, se desvanece al hacer scroll
  const heroTextOpacity = Math.max(0, 1 - timelineProgress * 4.5);
  const heroTextTransform = `translateY(${-timelineProgress * 60}px)`;

  return (
    <section
      ref={containerRef}
      className="awards-section"
      id="premios-alienskaab"
      aria-label="Premios y reconocimientos de Alienskaab"
    >
      {/* Transición suave desde la sección oscura anterior a blanco marfil */}
      <div className="awards-section__top-transition" />

      <div className="awards-section__sticky">
        {/* Fondo sutil de galería */}
        <div className="awards-section__background-glow" />

        {/* Canvas de Three.js */}
        <div
          ref={canvasContainerRef}
          className="awards-section__canvas-container"
        />

        {/* Título arriba del trofeo en Negro Sólido con tipografía Mont / Arial */}
        <div
          className="awards-section__hero-text"
          style={{
            opacity: heroTextOpacity,
            transform: heroTextTransform,
            pointerEvents: heroTextOpacity > 0.3 ? 'auto' : 'none',
          }}
        >
          <p className="awards-section__eyebrow">Reconocimientos de clase mundial</p>
          <h2 className="awards-section__title">
            Alienskaab ha sido ganador de muchos premios
          </h2>
          <p className="awards-section__subtitle">
            Cada hidromiel es el resultado de la perfección apícola y la pasión cósmica
          </p>
        </div>

        {/* Indicador de scroll inicial hacia el estante */}
        <div
          className="awards-section__scroll-hint"
          style={{ opacity: heroTextOpacity }}
          aria-hidden="true"
        >
          <span>Desliza para explorar la línea temporal</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Tooltip flotante al pasar cursor por un cuadro */}
        {hoveredAward && !selectedAward && (
          <div
            className={`awards-section__hover-tooltip${hoveredAward ? ' is-visible' : ''}`}
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <span>{hoveredAward.nombre}</span>
          </div>
        )}
      </div>

      {/* =============================================
          MODAL DE DETALLE EXPANDIDO CON BLUR DE FONDO
          ============================================= */}
      {selectedAward && (
        <div
          className="awards-modal"
          role="dialog"
          aria-modal="true"
          aria-label={selectedAward.nombre}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAward();
          }}
        >
          {/* Flecha para retroceder en la esquina */}
          <button
            type="button"
            className="awards-modal__back-button"
            onClick={closeAward}
            aria-label="Volver a la repisa"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Volver a la repisa</span>
          </button>

          {/* Contenido centrado del premio */}
          <div className="awards-modal__content">
            {/* Arriba del premio está su nombre en Negro Sólido Mont */}
            <div className="awards-modal__header">
              <span className="awards-modal__tag">Galardón Oficial</span>
              <h3 className="awards-modal__title">{selectedAward.nombre}</h3>
            </div>

            {/* Lienzo agrandado con marco */}
            <div className="awards-modal__image-wrapper">
              <img
                src={selectedAward.imagen?.url || '/awards/1.png'}
                alt={selectedAward.imagen?.altText || selectedAward.nombre}
                className="awards-modal__image"
                loading="eager"
              />
            </div>

            {/* Debajo del premio está su descripción en Negro Sólido Mont */}
            <p className="awards-modal__description">
              {selectedAward.descripcion}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
