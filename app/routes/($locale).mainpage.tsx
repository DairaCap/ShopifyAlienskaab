import type { Route } from './+types/($locale).mainpage';
import HomePage from '~/pages/HomePage';
import type { MainPageRecommendedProductsQuery } from 'storefrontapi.generated';
import type { ShowcaseCollection } from '~/components/home/CollectionsShowcase';

export async function loader({ context }: Route.LoaderArgs) {
  const { storefront } = context;

  // Productos recomendados (deferred)
  const recommendedProducts = storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  // 1. Obtener el menú "Mieles" con los IDs de colecciones
  let mielesCollections: ShowcaseCollection[] = [];
  try {
    const menuData = await storefront.query(MIELES_MENU_QUERY, {
      variables: { menuHandle: 'mieles' },
    });

    // Extraer los resourceIds de los items del menú
    const menuItems = menuData?.menu?.items ?? [];
    const collectionIds = menuItems
      .map((item: { resourceId?: string | null }) => item.resourceId)
      .filter(Boolean) as string[];

    if (collectionIds.length > 0) {
      // 2. Consultar las colecciones por sus IDs para obtener imagen, título y handle
      const collectionsData = await storefront.query(COLLECTIONS_BY_IDS_QUERY, {
        variables: { ids: collectionIds },
      });

      mielesCollections = (collectionsData?.nodes ?? [])
        .filter((node: { __typename?: string } | null) => node && node.__typename === 'Collection')
        .map((col: {
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
        }));
    }
  } catch (error) {
    console.error('Error fetching mieles menu/collections:', error);
  }

  return {
    recommendedProducts,
    mielesCollections,
  };
}

export default function MainPageRoute({ loaderData }: Route.ComponentProps) {
  return <HomePage {...loaderData} />;
}

// ---- GraphQL Queries ----

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment MainPageRecommendedProduct on Product {
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
  query MainPageRecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 10, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...MainPageRecommendedProduct
      }
    }
  }
` as const;

// Obtiene los items del menú "Mieles" (cada item apunta a una colección)
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

// Obtiene las colecciones por sus IDs globales de Shopify
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