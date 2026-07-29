import type { Router } from '../router/router.ts';

/** Crée un lien qui navigue via le Router (History API) sans recharger la page. */
export function createNavLink(router: Router, path: string, label: string, className?: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = path;
  link.textContent = label;

  if (className) {
    link.className = className;
  }

  link.addEventListener('click', (event) => {
    event.preventDefault();
    router.navigate(path);
  });

  return link;
}
