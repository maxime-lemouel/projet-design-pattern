/**
 * Router (History API)
 *
 * Permet de définir des routes avec des segments dynamiques (`:id`) et de
 * naviguer entre elles sans recharger la page, en gardant l'URL du
 * navigateur synchronisée via `history.pushState` / l'événement `popstate`.
 *
 * Hors du périmètre "core" (Factory/Builder/Singleton/Strategy/Observer),
 * ce Router s'appuie sur eux : chaque page qu'il affiche utilise le
 * Builder/Factory pour son DOM et s'abonne à des Observable pour rester
 * réactive.
 */
export type RouteParams = Record<string, string>;
export type RouteHandler = (params: RouteParams) => void;

interface Route {
  segments: string[];
  handler: RouteHandler;
}

export class Router {
  private readonly routes: Route[] = [];
  private notFoundHandler: RouteHandler = () => {};

  /** Enregistre une route, ex: '/murs/:wallId'. */
  on(pattern: string, handler: RouteHandler): this {
    this.routes.push({ segments: this.splitPath(pattern), handler });
    return this;
  }

  /** Handler appelé quand aucune route ne correspond à l'URL courante. */
  notFound(handler: RouteHandler): this {
    this.notFoundHandler = handler;
    return this;
  }

  /** Démarre le routeur : écoute la navigation navigateur et résout l'URL initiale. */
  start(): void {
    window.addEventListener('popstate', () => this.resolve());
    this.resolve();
  }

  /** Navigue vers `path` en poussant une nouvelle entrée d'historique. */
  navigate(path: string): void {
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path);
    }
    this.resolve();
  }

  private splitPath(path: string): string[] {
    return path.split('/').filter((segment) => segment.length > 0);
  }

  private resolve(): void {
    const currentSegments = this.splitPath(window.location.pathname);

    for (const route of this.routes) {
      const params = this.match(route.segments, currentSegments);
      if (params) {
        route.handler(params);
        return;
      }
    }

    this.notFoundHandler({});
  }

  private match(routeSegments: string[], currentSegments: string[]): RouteParams | null {
    if (routeSegments.length !== currentSegments.length) {
      return null;
    }

    const params: RouteParams = {};

    for (let index = 0; index < routeSegments.length; index++) {
      const routeSegment = routeSegments[index]!;
      const currentSegment = currentSegments[index]!;

      if (routeSegment.startsWith(':')) {
        params[routeSegment.slice(1)] = decodeURIComponent(currentSegment);
      } else if (routeSegment !== currentSegment) {
        return null;
      }
    }

    return params;
  }
}
