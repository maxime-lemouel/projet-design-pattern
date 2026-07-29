/**
 * Page 2 : post-it d'un mur, affichés dans une grille fixe (4 colonnes).
 * Permet d'ajouter un post-it, de le supprimer, ou d'ouvrir son détail.
 */
import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';
import type { Router } from '../router/router.ts';
import type { Postit } from '../store/data-store.ts';
import { dataStore } from '../store/data-store.ts';
import { createNavLink } from '../utils/nav-link.ts';

const COLORS = ['#fff59d', '#a5d8ff', '#b2f2bb', '#ffc9c9', '#ffd8a8', '#d0bfff'];

/** Affiche la page et retourne une fonction de nettoyage (désabonnement Observer). */
export function renderWallPage(root: HTMLElement, router: Router, wallId: string): () => void {
  const wall = dataStore.getWall(wallId);
  const back = createNavLink(router, '/', '← Retour aux murs', 'back-link');

  if (!wall) {
    root.replaceChildren(back, new TagBuilder('p').withText('Ce mur est introuvable.').build());
    return () => {};
  }

  let selectedColor: string = COLORS[0] ?? '#fff59d';

  const title = TagFactory.create('heading', { level: 1, text: wall.name }).toHtml();

  function addPostit(postitTitle: string): void {
    const trimmed = postitTitle.trim();
    if (!trimmed) {
      return;
    }
    dataStore.addPostit(wallId, trimmed, selectedColor);
  }

  const input = TagFactory.create('input', {
    type: 'text',
    placeholder: 'Titre du post-it…',
    attributes: { class: 'toolbar__input' },
    events: {
      keydown: (event) => {
        if ((event as KeyboardEvent).key === 'Enter') {
          const target = event.target as HTMLInputElement;
          addPostit(target.value);
          target.value = '';
        }
      },
    },
  }).toHtml() as HTMLInputElement;

  const addButton = TagFactory.create('button', {
    text: 'Ajouter',
    attributes: { class: 'toolbar__add' },
    events: {
      click: () => {
        addPostit(input.value);
        input.value = '';
        input.focus();
      },
    },
  }).toHtml();

  const swatches: HTMLElement[] = COLORS.map((color) => {
    const swatch = new TagBuilder('button').withClass('swatch').withStyle('background-color', color).build();

    if (color === selectedColor) {
      swatch.classList.add('swatch--active');
    }

    swatch.addEventListener('click', () => {
      selectedColor = color;
      swatches.forEach((element) => element.classList.remove('swatch--active'));
      swatch.classList.add('swatch--active');
    });

    return swatch;
  });

  const palette = new TagBuilder('div').withClass('toolbar__palette').build();
  swatches.forEach((swatch) => palette.appendChild(swatch));

  const toolbar = new TagBuilder('div')
    .withClass('toolbar')
    .withChild(input)
    .withChild(palette)
    .withChild(addButton)
    .build();

  const grid = new TagBuilder('div').withClass('postit-grid').build();

  function renderCard(postit: Postit): HTMLElement {
    const deleteButton = TagFactory.create('button', {
      text: '✕',
      attributes: { class: 'postit__delete', 'aria-label': 'Supprimer le post-it' },
      events: {
        click: (event) => {
          event.stopPropagation();
          dataStore.removePostit(postit.id);
        },
      },
    }).toHtml();

    return new TagBuilder('div')
      .withClass('postit')
      .withStyle('background-color', postit.color)
      .withText(postit.title)
      .withChild(deleteButton)
      .withEvent('click', () => router.navigate(`/murs/${wallId}/post-it/${postit.id}`))
      .build();
  }

  function renderGrid(): void {
    const postits = dataStore.postitsForWall(wallId);

    if (postits.length === 0) {
      grid.replaceChildren(
        new TagBuilder('p').withClass('empty-state').withText('Aucun post-it — ajoutez-en un !').build(),
      );
      return;
    }

    grid.replaceChildren(...postits.map(renderCard));
  }

  const unsubscribe = dataStore.postits$.subscribe(renderGrid);
  renderGrid();

  root.replaceChildren(back, title, toolbar, grid);

  return unsubscribe;
}
