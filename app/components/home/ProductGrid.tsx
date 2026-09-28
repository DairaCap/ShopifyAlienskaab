import { Suspense } from 'react';
import { Await, Link } from 'react-router';
import { Image, Money } from '@shopify/hydrogen';
import type { MainPageRecommendedProductsQuery } from 'storefrontapi.generated';
import './ProductGrid.css';

type RecommendedProduct =
  MainPageRecommendedProductsQuery['products']['nodes'][number];

export default function ProductGrid({
  products,
}: {
  products: Promise<MainPageRecommendedProductsQuery | null>;
}) {
  return (
    <section className="product-grid">
      <h2 className="product-grid-title">Productos Destacados</h2>
      <Suspense
        fallback={<div className="product-grid-loading">Cargando productos...</div>}
      >
        <Await
          resolve={products}
          errorElement={
            <div className="product-grid-error">Error al cargar productos</div>
          }
        >
          {(response) => (
            <div className="product-grid-container">
              {response?.products?.nodes?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </Await>
      </Suspense>
    </section>
  );
}

function ProductCard({ product }: { product: RecommendedProduct }) {
  if (!product) return null;

  return (
    <Link to={`/products/${product.handle}`} className="product-card-link">
      <div className="product-card">
        {product.featuredImage && (
          <div className="product-card-image">
            <Image
              data={product.featuredImage}
              alt={product.featuredImage.altText || product.title}
              sizes="(min-width: 64em) 20vw, (min-width: 48em) 33vw, 50vw"
              className="product-image"
            />
          </div>
        )}
        <div className="product-card-info">
          <h3 className="product-card-title">{product.title}</h3>
          <div className="product-card-price">
            {product.priceRange?.minVariantPrice && (
              <Money data={product.priceRange.minVariantPrice} />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}