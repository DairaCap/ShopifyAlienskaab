import type { Route } from './+types/($locale).mainpage';
import HomePage from '~/pages/HomePage';
import type { MainPageRecommendedProductsQuery } from 'storefrontapi.generated';
import type { ShowcaseCollection } from '~/components/home/CollectionsShowcase';
import type { AwardItem } from '~/components/home/AwardsSection';

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

    const menuItems = menuData?.menu?.items ?? [];
    const collectionIds = menuItems
      .map((item: { resourceId?: string | null }) => item.resourceId)
      .filter(Boolean) as string[];

    if (collectionIds.length > 0) {
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

  // 2. Obtener metaobjetos "premios"
  let premios: AwardItem[] = [];
  try {
    const premiosData = await storefront.query(PREMIOS_QUERY);
    const nodes = (premiosData?.metaobjects?.nodes ?? []) as any[];
    if (nodes.length > 0) {
      premios = nodes.map((node) => ({
        id: node.id,
        handle: node.handle,
        nombre: node.nombre?.value || '',
        descripcion: node.descripcion?.value || '',
        imagen: node.imagen?.reference?.image ?? null,
      }));
    }
  } catch (error) {
    console.error('Error fetching premios metaobjects:', error);
  }

  return {
    recommendedProducts,
    mielesCollections,
    premios,
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

// Obtiene los premios desde el metaobjeto "premios"
const PREMIOS_QUERY = `#graphql
  query Premios($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    metaobjects(type: "premios", first: 20) {
      nodes {
        id
        handle
        nombre: field(key: "nombre") {
          value
        }
        descripcion: field(key: "descripcion") {
          value
        }
        imagen: field(key: "imagen") {
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
` as const;