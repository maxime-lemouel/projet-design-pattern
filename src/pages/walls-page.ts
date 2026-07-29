/**
 * Page 1 : liste des murs.
 * Permet de créer un mur et d'accéder à chacun d'eux.
 */
import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';
import type { Router } from '../router/router.ts';
import type { Wall } from '../store/data-store.ts';
import { dataStore } from '../store/data-store.ts';
import { createNavLink } from '../utils/nav-link.ts';

/** Affiche la page et retourne une fonction de nettoyage (désabonnement Observer). */
export function renderWallsPage(root: HTMLElement, router: Router): () => void {
  const title = TagFactory.create('heading', { level: 1, text: 'Mes murs de post-it' }).toHtml();

  const input = TagFactory.create('input', {
    type: 'text',
    placeholder: 'Nom du mur…',
    attributes: { class: 'toolbar__input' },
  }).toHtml() as HTMLInputElement;

  function createWall(): void {
    const name = input.value.trim();
    if (!name) {
      return;
    }
    const wall = dataStore.createWall(name);
    input.value = '';
    router.navigate(`/murs/${wall.id}`);
  }

  input.addEventListener('keydown', (event) => {
    if ((event as KeyboardEvent).key === 'Enter') {
      createWall();
    }
  });

  const addButton = TagFactory.create('button', {
    text: 'Créer le mur',
    attributes: { class: 'toolbar__add' },
    events: { click: () => createWall() },
  }).toHtml();

  const toolbar = new TagBuilder('div').withClass('toolbar').withChild(input).withChild(addButton).build();

  const list = new TagBuilder('div').withClass('wall-list').build();

  function renderList(walls: Wall[]): void {
    if (walls.length === 0) {
      list.replaceChildren(
        new TagBuilder('p').withClass('empty-state').withText('Aucun mur pour le moment — créez-en un !').build(),
      );
      return;
    }

    list.replaceChildren(...walls.map((wall) => createNavLink(router, `/murs/${wall.id}`, wall.name, 'wall-card')));
  }

  const unsubscribe = dataStore.walls$.subscribe(renderList);
  renderList(dataStore.walls$.getValue());

  root.replaceChildren(title, toolbar, list);

  return unsubscribe;
}
