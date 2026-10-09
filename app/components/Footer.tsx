import { Suspense, useState } from 'react';
import { Await, NavLink, Link } from 'react-router';
import type { FooterQuery, HeaderQuery } from 'storefrontapi.generated';
import footerAlienImg from '~/assets/footerAlien.jpg';
import logoImg from '~/assets/aliensKaab-blanco.png';
import './Footer.css';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="site-footer">
      {/* 1. Fondo de la escena: Alien en el centro y graffiti en el suelo (100% natural, sin overlays invasivos) */}
      <div className="site-footer__bg-container">
        <img
          src={footerAlienImg}
          alt="AliensKaab"
          className="site-footer__bg"
          loading="lazy"
        />
      </div>
      {/* 2. Contenido distribuido orgánicamente en los costados oscuros */}
      <div className="site-footer__content">
        <div className="site-footer__wings">
          {/* ============================================================
              FONDO LATERAL IZQUIERDO (A la izquierda del alien)
             ============================================================ */}
          <div className="site-footer__wing site-footer__wing--left">
            {/* Logo, Eslogan e Iconos Sociales */}
            <div className="site-footer__col site-footer__col--brand">
              <Link to="/" className="site-footer__logo-link" aria-label="AliensKaab Home">
                <img src={logoImg} alt="Aliens Kaab" className="site-footer__logo" />
              </Link>
              <p className="site-footer__tagline">
                El primer hidromiel artesanal de otro mundo. Fermentado con miel pura y botánicos cósmicos.
              </p>
              <div className="site-footer__socials">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__social-link"
                  aria-label="Instagram"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__social-link"
                  aria-label="TikTok"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__social-link"
                  aria-label="Facebook"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* ESPACIO CENTRAL COMPLETAMENTE DESPEJADO PARA EL ALIEN */}
          <div className="site-footer__center-space" aria-hidden="true" />

          {/* ============================================================
              FONDO LATERAL DERECHO (A la derecha del alien)
             ============================================================ */}
          <div className="site-footer__wing site-footer__wing--right">

            {/* Sección EXPLORAR (Movida a la derecha) */}
            <div className="site-footer__col site-footer__col--nav">
              <h4 className="site-footer__heading">EXPLORAR</h4>
              <ul className="site-footer__links">
                <li>
                  <NavLink to="/collections" className="site-footer__link">
                    Colecciones
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/pages/about" className="site-footer__link">
                    Nuestra Historia
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/blogs/journal" className="site-footer__link">
                    Bitácora / Blog
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/account" className="site-footer__link">
                    Mi Cuenta
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Sección POLÍTICAS */}
            <div className="site-footer__col site-footer__col--policies">
              <h4 className="site-footer__heading">POLÍTICAS</h4>
              <Suspense fallback={null}>
                <Await resolve={footerPromise}>
                  {(footer) => (
                    <ul className="site-footer__links">
                      <li>
                        <NavLink to="/search" className="site-footer__link">
                          Search
                        </NavLink>
                      </li>
                      {(footer?.menu || FALLBACK_FOOTER_MENU).items.map((item) => {
                        if (!item.url) return null;
                        const url =
                          item.url.includes('myshopify.com') ||
                            item.url.includes(publicStoreDomain) ||
                            item.url.includes(header.shop.primaryDomain?.url || '')
                            ? new URL(item.url).pathname
                            : item.url;
                        const isExternal = !url.startsWith('/');
                        return (
                          <li key={item.id}>
                            {isExternal ? (
                              <a href={url} className="site-footer__link" target="_blank" rel="noopener noreferrer">
                                {item.title}
                              </a>
                            ) : (
                              <NavLink to={url} className="site-footer__link" prefetch="intent">
                                {item.title}
                              </NavLink>
                            )}
                          </li>
                        );
                      })}
                      <li>
                        <NavLink to="/policies/privacy-policy" className="site-footer__link">
                          Your Privacy Choices
                        </NavLink>
                      </li>
                    </ul>
                  )}
                </Await>
              </Suspense>
            </div>

            {/* Sección CLUB ALIENSKAAB & Formulario
            <div className="site-footer__col site-footer__col--club">
              <h4 className="site-footer__heading">CLUB ALIENSKAAB</h4>
              <p className="site-footer__newsletter-desc">
                Suscríbete para recibir lanzamientos galácticos, recetas y eventos exclusivos.
              </p>
              {subscribed ? (
                <p className="site-footer__subscribed-msg">
                  ¡Te has unido a la tripulación! 🚀
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="site-footer__form">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu correo electrónico..."
                    className="site-footer__input"
                    aria-label="Tu correo electrónico"
                  />
                  <button type="submit" className="site-footer__submit">
                    UNIRME
                  </button>
                </form>
              )}
            </div> */}
          </div>
        </div>

        {/* ============================================================
            FILA DE CIERRE (Borde Inferior Absoluto)
           ============================================================ */}
        <div className="site-footer__bottom">
          <span className="site-footer__copyright">
            © 2026 AliensKaab. Todos los derechos reservados.
          </span>
          <span className="site-footer__disclaimer">
            Bebidas para mayores de 18 años. Disfruta con moderación.
          </span>
        </div>
      </div>
    </footer>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};
