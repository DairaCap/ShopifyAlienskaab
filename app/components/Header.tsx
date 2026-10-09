import { Suspense } from 'react';
import { Await, NavLink, useAsyncValue, Link } from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type { HeaderQuery, CartApiQueryFragment } from 'storefrontapi.generated';
import { useAside } from '~/components/Aside';
import './Header.css';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const { shop, menu } = header;
  const { type, open, close } = useAside();
  const isMenuOpen = type === 'mobile';

  const toggleMobileMenu = () => {
    if (isMenuOpen) {
      close();
    } else {
      open('mobile');
    }
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* 1. Mobile Menu Button (Left on mobile, hidden on desktop) */}
        <div className="site-header__mobile-menu">
          <button
            className={`mobile-menu-btn reset ${isMenuOpen ? 'is-active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>

        {/* 2. Logo (Left on desktop, Center on mobile) */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `site-header__link${isActive ? " site-header__link--active" : ""}`
          }
          aria-label={`${shop.name} home`}
          prefetch="intent"
        >
          <img src="../app/assets/alienskaab-blanco.png" alt="Alienskaab" className="site-header__logo-img" />
        </NavLink>

        {/* 3. Main Navigation (Center on desktop, hidden on mobile) */}
        <nav className="site-header__nav" aria-label="Principal">
          {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
            if (!item.url) return null;

            // if the url is internal, we strip the domain
            const url =
              item.url.includes('myshopify.com') ||
                item.url.includes(publicStoreDomain) ||
                item.url.includes(header.shop.primaryDomain.url)
                ? new URL(item.url).pathname
                : item.url;

            return (
              <NavLink
                key={item.id}
                to={url}
                className={({ isActive }) =>
                  `site-header__link${isActive ? " site-header__link--active" : ""}`
                }
                end={url === "/"}
                prefetch="intent"
              >
                {item.title}
              </NavLink>
            );
          })}
        </nav>

        {/* 4. Actions: Account (desktop only), Search and Cart */}
        <div className="header-ctas">
          {/* Account CTA (Desktop only) */}
          <div className="desktop-account-btn">
            <Suspense fallback={<span className="btn btn--shell">Sign in</span>}>
              <Await resolve={isLoggedIn} errorElement={<span className="btn btn--shell">Sign in</span>}>
                {(isLoggedIn) => (
                  <Link
                    to="/account"
                    className="btn btn--shell"
                    prefetch="intent"
                  >
                    {isLoggedIn ? 'Account' : 'Sign in'}
                  </Link>
                )}
              </Await>
            </Suspense>
          </div>

          <SearchToggle />
          <CartToggle cart={cart} />
        </div>
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
  isLoggedIn,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
  isLoggedIn?: Promise<boolean>;
}) {
  const className = `header-menu-${viewport}`;
  const { close } = useAside();

  return (
    <nav className={className} role="navigation">
      {/* Mobile view: Account information at the top of the menu */}
      {viewport === 'mobile' && isLoggedIn && (
        <div className="mobile-menu-account">
          <Suspense fallback={<div className="mobile-menu-account__fallback">Sign in</div>}>
            <Await resolve={isLoggedIn} errorElement={<div className="mobile-menu-account__fallback">Sign in</div>}>
              {(isLoggedIn) => (
                <NavLink
                  to="/account"
                  className="btn btn--shell mobile-menu-account__btn"
                  onClick={close}
                  prefetch="intent"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mobile-menu-account__icon"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>{isLoggedIn ? 'Account' : 'Sign in'}</span>
                </NavLink>
              )}
            </Await>
          </Suspense>
        </div>
      )}

      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          className={({ isActive }) =>
            `header-menu-item${isActive ? ' header-menu-item--active' : ''}`
          }
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className={({ isActive }) =>
              `header-menu-item${isActive ? ' header-menu-item--active' : ''}`
            }
            end={url === '/'}
            key={item.id}
            onClick={close}
            prefetch="intent"
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function SearchToggle() {
  const { open } = useAside();
  return (
    <button
      className="site-header__icon-btn reset"
      onClick={() => open('search')}
      aria-label="Search"
    >
      <svg
        className="header-icon search-icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </button>
  );
}

function CartBadge({ count }: { count: number }) {
  const { open } = useAside();
  const { publish, shop, cart, prevCart } = useAnalytics();

  return (
    <a
      href="/cart"
      className="site-header__icon-btn site-header__cart-link"
      aria-label={`Cart (${count} items)`}
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <svg
        className="header-icon cart-icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
      <span className="cart-badge-count" aria-label={`(items: ${count})`}>
        {count}
      </span>
    </a>
  );
}

function CartToggle({ cart }: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};