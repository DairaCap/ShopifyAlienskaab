import { useRef } from 'react';
import HeroVideo from '../components/home/HeroVideo';
import CollectionsShowcase from '../components/home/CollectionsShowcase';
import AwardsSection from '../components/home/AwardsSection';
import ProductGrid from '../components/home/ProductGrid';
import type { MainPageRecommendedProductsQuery } from 'storefrontapi.generated';
import type { ShowcaseCollection } from '~/components/home/CollectionsShowcase';
import type { AwardItem } from '~/components/home/AwardsSection';

interface HomePageProps {
  recommendedProducts: Promise<MainPageRecommendedProductsQuery | null>;
  mielesCollections?: ShowcaseCollection[];
  premios?: AwardItem[];
}

export default function HomePage({
  recommendedProducts,
  mielesCollections = [],
  premios = [],
}: HomePageProps) {
  const awardsRef = useRef<HTMLDivElement>(null);
  const productGridRef = useRef<HTMLDivElement>(null);

  // Cuando el usuario termina las colecciones → scroll a la sección de Premios
  const handleCollectionsExit = () => {
    awardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Cuando el usuario termina el estante de Premios → scroll al ProductGrid
  const handleAwardsExit = () => {
    productGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <HeroVideo />
      {mielesCollections.length > 0 && (
        <CollectionsShowcase
          collections={mielesCollections}
          onExitBottom={handleCollectionsExit}
        />
      )}
      <div ref={awardsRef}>
        <AwardsSection
          premios={premios}
          onExitBottom={handleAwardsExit}
        />
      </div>
      <div ref={productGridRef}>
        <ProductGrid products={recommendedProducts} />
      </div>
    </>
  );
}