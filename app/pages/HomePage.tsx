import { useRef } from 'react';
import HeroVideo from '../components/home/HeroVideo';
import CollectionsShowcase from '../components/home/CollectionsShowcase';
import ProductGrid from '../components/home/ProductGrid';
import type { MainPageRecommendedProductsQuery } from 'storefrontapi.generated';
import type { ShowcaseCollection } from '~/components/home/CollectionsShowcase';

interface HomePageProps {
  recommendedProducts: Promise<MainPageRecommendedProductsQuery | null>;
  mielesCollections?: ShowcaseCollection[];
}

export default function HomePage({
  recommendedProducts,
  mielesCollections = [],
}: HomePageProps) {
  const productGridRef = useRef<HTMLDivElement>(null);

  // Cuando el usuario termina las colecciones → scroll al ProductGrid
  const handleCollectionsExit = () => {
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
      <div ref={productGridRef}>
        <ProductGrid products={recommendedProducts} />
      </div>
    </>
  );
}