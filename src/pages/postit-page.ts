/**
 * Page 3 : détail d'un post-it — deux parties : titre et description,
 * toutes deux éditables ici (la création, elle, ne demande qu'un titre).
 */
import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';
import type { Router } from '../router/router.ts';
import { dataStore } from '../store/data-store.ts';
import { createNavLink } from '../utils/nav-link.ts';

/** Affiche la page et retourne une fonction de nettoyage (désabonnement Observer). */
export function renderPostitPage(root: HTMLElement, router: Router, wallId: string, postitId: string): () => void {
  const back = createNavLink(router, `/murs/${wallId}`, '← Retour au mur', 'back-link');

  function render(): void {
    const postit = dataStore.getPostit(postitId);

    if (!postit) {
      root.replaceChildren(back, new TagBuilder('p').withText('Ce post-it est introuvable.').build());
      return;
    }

    const titleInput = TagFactory.create('input', {
      type: 'text',
      value: postit.title,
      attributes: { class: 'postit-detail__title' },
    }).toHtml() as HTMLInputElement;

    const descriptionLabel = new TagBuilder('p')
      .withClass('postit-detail__label')
      .withText('Description')
      .build();

    const descriptionTextarea = document.createElement('textarea');
    descriptionTextarea.className = 'postit-detail__textarea';
    descriptionTextarea.placeholder = 'Ajouter une description…';
    descriptionTextarea.value = postit.description;

    const saveButton = TagFactory.create('button', {
      text: 'Enregistrer',
      attributes: { class: 'toolbar__add' },
      events: {
        click: () =>
          dataStore.updatePostit(postit.id, {
            title: titleInput.value.trim() || postit.title,
            description: descriptionTextarea.value,
          }),
      },
    }).toHtml();

    const deleteButton = TagFactory.create('button', {
      text: 'Supprimer',
      attributes: { class: 'postit-detail__delete' },
      events: {
        click: () => {
          dataStore.removePostit(postit.id);
          router.navigate(`/murs/${wallId}`);
        },
      },
    }).toHtml();

    const card = new TagBuilder('div')
      .withClass('postit-detail')
      .withStyle('background-color', postit.color)
      .withChild(titleInput)
      .withChild(descriptionLabel)
      .withChild(descriptionTextarea)
      .build();

    const actions = new TagBuilder('div')
      .withClass('postit-detail__actions')
      .withChild(saveButton)
      .withChild(deleteButton)
      .build();

    root.replaceChildren(back, card, actions);
  }

  const unsubscribe = dataStore.postits$.subscribe(render);
  render();

  return unsubscribe;
}
