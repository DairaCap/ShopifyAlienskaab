import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {MockShopNotice} from '~/components/MockShopNotice';
import CollectionsShowcase from '~/components/home/CollectionsShowcase';
import type {ShowcaseCollection} from '~/components/home/CollectionsShowcase';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Alienskaab | Hidromieles Artesanales'}];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [{collections}] = await Promise.all([
    storefront.query(FEATURED_COLLECTION_QUERY),
  ]);

  // Obtener colecciones del menú "Mieles"
  let mielesCollections: ShowcaseCollection[] = [];
  try {
    const menuData = await storefront.query(MIELES_MENU_QUERY, {
      variables: {menuHandle: 'mieles'},
    });

    const menuItems = menuData?.menu?.items ?? [];
    const collectionIds = menuItems
      .map((item: {resourceId?: string | null}) => item.resourceId)
      .filter(Boolean) as string[];

    if (collectionIds.length > 0) {
      const collectionsData = await storefront.query(COLLECTIONS_BY_IDS_QUERY, {
        variables: {ids: collectionIds},
      });

      mielesCollections = (collectionsData?.nodes ?? [])
        .filter(
          (node: {__typename?: string} | null) =>
            node && node.__typename === 'Collection',
        )
        .map(
          (col: {
            id: string;
            title: string;
            handle: string;
            image?: {
              url: string;
              altText?: string | null;
              width?: number | null;
              height?: number | null;
            } | null;
          }) => ({
            id: col.id,
            title: col.title,
            handle: col.handle,
            image: col.image ?? null,
          }),
        );
    }
  } catch (error) {
    console.error('Error fetching mieles menu/collections:', error);
  }

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    featuredCollection: collections.nodes[0],
    mielesCollections,
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  const handleCollectionsExit = () => {
    const productsSection = document.getElementById('recommended-products-section');
    productsSection?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  return (
    <div className="home">
      {data.isShopLinked ? null : <MockShopNotice />}
      <FeaturedCollection collection={data.featuredCollection} />
      {data.mielesCollections.length > 0 && (
        <CollectionsShowcase
          collections={data.mielesCollections}
          onExitBottom={handleCollectionsExit}
        />
      )}
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image
            data={image}
            sizes="100vw"
            alt={image.altText || collection.title}
          />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section
      id="recommended-products-section"
      className="recommended-products"
      aria-labelledby="recommended-products"
    >
      <h2 id="recommended-products">Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </section>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;

const MIELES_MENU_QUERY = `#graphql
  query MielesMenu($menuHandle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    menu(handle: $menuHandle) {
      id
      items {
        id
        title
        url
        resourceId
        type
      }
    }
  }
` as const;

const COLLECTIONS_BY_IDS_QUERY = `#graphql
  query CollectionsByIds($ids: [ID!]!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      __typename
      ... on Collection {
        id
        title
        handle
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
` as const;
