import type { Route } from './+types/($locale).mainpage';
import HomePage from '~/pages/HomePage';
import type { MainPageRecommendedProductsQuery } from 'storefrontapi.generated';

export async function loader({ context }: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function MainPageRoute({ loaderData }: Route.ComponentProps) {
  return <HomePage {...loaderData} />;
}

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