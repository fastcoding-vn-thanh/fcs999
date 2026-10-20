/** Site scripts: vanilla TypeScript, no dependencies. */
((): void => {
  const SP_BREAKPOINT = 767.98;

  const isMobile = (): boolean => window.matchMedia(`(max-width: ${SP_BREAKPOINT}px)`).matches;

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

  /** Mobile drawer toggle driven by the .js-drawer-toggle button in the header. */
  const drawer = (): void => {
    const toggle = document.querySelector<HTMLButtonElement>('.js-drawer-toggle');
    const panel = document.querySelector<HTMLElement>('.js-drawer');
    if (!toggle || !panel) {
      return;
    }

    const setOpen = (open: boolean): void => {
      panel.classList.toggle('hidden', !open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    window.addEventListener('resize', () => {
      if (!isMobile()) {
        setOpen(false);
      }
    });
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

  const init = (): void => {
    detectBrowsers();
    drawer();
    headerMenu();
    smoothScroll();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
