/**
 * Store applicatif : murs et post-it.
 *
 * Combine trois patterns :
 * - Singleton (AppStore) : point d'accès unique à l'état, persisté via une Strategy
 * - Strategy  : le backend de stockage (localStorage ici) est interchangeable
 * - Observer  : `walls$` et `postits$` notifient les pages abonnées à chaque changement
 */
import { Observable } from '../core/observer.ts';
import { AppStore } from '../core/singleton.ts';
import { LocalStorageAdapter } from '../core/strategy.ts';

export interface Wall {
  id: string;
  name: string;
}

export interface Postit {
  id: string;
  wallId: string;
  /** Affiché dans la grille du mur : renseigné à la création. */
  title: string;
  /** Renseigné/édité uniquement depuis la page de détail. */
  description: string;
  color: string;
}

const WALLS_KEY = 'walls';
const POSTITS_KEY = 'postits';

/** Génère un identifiant simple, sur le même principe que `conn_${Date.now()}` vu en cours. */
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
}

class DataStore {
  private readonly appStore = AppStore.getInstance();
  readonly walls$ = new Observable<Wall[]>([]);
  readonly postits$ = new Observable<Postit[]>([]);

  /** Configure la Strategy de persistance et recharge l'état sauvegardé. */
  async init(): Promise<void> {
    this.appStore.setStrategy(new LocalStorageAdapter('postit-wall:'));

    const walls = await this.appStore.restoreState<Wall[]>(WALLS_KEY);
    const postits = await this.appStore.restoreState<Postit[]>(POSTITS_KEY);

    this.walls$.next(walls ?? []);
    this.postits$.next(postits ?? []);
  }

  createWall(name: string): Wall {
    const wall: Wall = { id: generateId('wall'), name };
    const next = [...this.walls$.getValue(), wall];
    this.walls$.next(next);
    this.appStore.setState(WALLS_KEY, next);
    return wall;
  }

  getWall(id: string): Wall | undefined {
    return this.walls$.getValue().find((wall) => wall.id === id);
  }

  postitsForWall(wallId: string): Postit[] {
    return this.postits$.getValue().filter((postit) => postit.wallId === wallId);
  }

  getPostit(id: string): Postit | undefined {
    return this.postits$.getValue().find((postit) => postit.id === id);
  }

  addPostit(wallId: string, title: string, color: string): Postit {
    const postit: Postit = { id: generateId('postit'), wallId, title, description: '', color };
    const next = [...this.postits$.getValue(), postit];
    this.postits$.next(next);
    this.appStore.setState(POSTITS_KEY, next);
    return postit;
  }

  updatePostit(id: string, updates: { title: string; description: string }): void {
    const next = this.postits$.getValue().map((postit) => (postit.id === id ? { ...postit, ...updates } : postit));
    this.postits$.next(next);
    this.appStore.setState(POSTITS_KEY, next);
  }

  removePostit(id: string): void {
    const next = this.postits$.getValue().filter((postit) => postit.id !== id);
    this.postits$.next(next);
    this.appStore.setState(POSTITS_KEY, next);
  }
}

/** Instance unique du store applicatif (le Singleton sous-jacent garantit l'unicité de l'état). */
export const dataStore = new DataStore();
