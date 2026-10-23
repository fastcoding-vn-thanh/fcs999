/** Site scripts: vanilla TypeScript, no dependencies. */
((): void => {
  /** Tag <html> with the current browser/OS so CSS can special-case it. */
  const detectBrowsers = (): void => {
    const root = document.documentElement;
    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes('mac')) {
      root.classList.add('is-mac');
    }
    if (ua.includes('safari')) {
      root.classList.add(ua.includes('chrome') ? 'is-chrome' : 'is-safari');
    }
    if (ua.includes('firefox')) {
      root.classList.add('is-firefox');
    }
    if (ua.includes('android')) {
      root.classList.add('is-android');
    }
    if (/iphone|ipod|ipad/.test(ua)) {
      root.classList.add('is-ios');
    }
    if (ua.includes('edg/')) {
      root.classList.remove('is-chrome');
      root.classList.add('is-chromium');
    }
  };

  /** Header menu: the .js-header-toggle hamburger opens the panel below the lg breakpoint (1024). */
  const headerMenu = (): void => {
    const header = document.querySelector<HTMLElement>('.js-header');
    const toggle = document.querySelector<HTMLButtonElement>('.js-header-toggle');
    if (!header || !toggle) {
      return;
    }

    const setOpen = (open: boolean): void => {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    header.addEventListener('click', (event) => {
      if ((event.target as HTMLElement).closest('.l-header__menu a')) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
      if (event.matches) {
        setOpen(false);
      }
    });
  };

  /** Smooth-scroll in-page anchors, offset by any sticky header. */
  const smoothScroll = (): void => {
    const header = document.querySelector<HTMLElement>('header');

    const scrollToHash = (hash: string): void => {
      if (!hash || hash === '#') {
        return;
      }
      let target: HTMLElement | null = null;
      try {
        target = document.querySelector<HTMLElement>(hash);
      } catch {
        // invalid selector (#1abc, #/x): no target
        return;
      }
      if (!target) {
        return;
      }
      const offset = header ? header.getBoundingClientRect().height : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    };

    document
      .querySelectorAll<HTMLAnchorElement>('a[href*="#"]:not([href="#"])')
      .forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
          if (anchor.classList.contains('js-no-scroll')) {
            return;
          }
          const [pathPart, hashPart] = (anchor.getAttribute('href') ?? '').split('#');
          const samePage = !pathPart || pathPart === window.location.pathname;
          if (!samePage || !hashPart) {
            return;
          }
          event.preventDefault();
          scrollToHash(`#${hashPart}`);
        });
      });

    if (window.location.hash) {
      window.setTimeout(() => scrollToHash(window.location.hash), 100);
    }
  };

  /** FAQ accordion: each .js-faq-toggle flips is-open on its own .c-faq-item; the slide is CSS (JS-07). */
  const faqAccordion = (): void => {
    document.querySelectorAll<HTMLButtonElement>('.js-faq-toggle').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const item = toggle.closest<HTMLElement>('.c-faq-item');
        if (!item) {
          return;
        }
        const open = !item.classList.contains('is-open');
        item.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
      });
    });
  };

  const init = (): void => {
    detectBrowsers();
    headerMenu();
    smoothScroll();
    faqAccordion();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
