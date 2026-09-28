import HeroVideo from "../components/home/HeroVideo";
import ProductGrid from "../components/home/ProductGrid";
import type { MainPageRecommendedProductsQuery } from 'storefrontapi.generated';

interface HomePageProps {
  recommendedProducts: Promise<MainPageRecommendedProductsQuery | null>;
  // Other props from loader can be added here if needed
}

export default function HomePage({ recommendedProducts }: HomePageProps) {
  return (
    <>
      <HeroVideo />
      <ProductGrid products={recommendedProducts} />
    </>
  );
}