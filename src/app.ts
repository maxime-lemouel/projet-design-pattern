/**
 * Point d'entrée de l'application : initialise le store puis le Router,
 * qui affiche l'une des 3 pages (murs / mur / post-it) dans `root`.
 */
import { AppConfig } from './core/singleton.ts';
import { renderPostitPage } from './pages/postit-page.ts';
import { renderWallPage } from './pages/wall-page.ts';
import { renderWallsPage } from './pages/walls-page.ts';
import { Router } from './router/router.ts';
import { dataStore } from './store/data-store.ts';

export async function startApp(root: HTMLElement): Promise<void> {
  AppConfig.getInstance().set('appName', 'Murs de Post-it');
  await dataStore.init();

  let cleanup: (() => void) | undefined;

  /** Nettoie la page précédente (désabonnements) avant d'afficher la nouvelle. */
  function mount(render: () => () => void): void {
    cleanup?.();
    cleanup = render();
  }

  const router = new Router();

  router
    .on('/', () => mount(() => renderWallsPage(root, router)))
    .on('/murs/:wallId', (params) => mount(() => renderWallPage(root, router, params.wallId!)))
    .on('/murs/:wallId/post-it/:postitId', (params) =>
      mount(() => renderPostitPage(root, router, params.wallId!, params.postitId!)),
    )
    .notFound(() => mount(() => renderWallsPage(root, router)));

  router.start();
}
