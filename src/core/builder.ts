export class TagBuilder {
  private text: string | undefined;
  private classes: string[] = [];
  private styles: Record<string, string> = {};
  private events: Record<string, EventListener> = {};
  private children: HTMLElement[] = [];

  constructor(private readonly tag: string) {}

  withText(text: string): this {
    this.text = text;
    return this;
  }

  withClass(className: string): this {
    if (!this.classes.includes(className)) {
      this.classes.push(className);
    }
    return this;
  }

  withoutClass(className: string): this {
    this.classes = this.classes.filter((existing) => existing !== className);
    return this;
  }

  withStyle(property: string, value: string): this {
    this.styles[property] = value;
    return this;
  }

  withEvent(event: string, handler: EventListener): this {
    this.events[event] = handler;
    return this;
  }

  withoutEvent(event: string): this {
    delete this.events[event];
    return this;
  }

  withChild(child: HTMLElement): this {
    this.children.push(child);
    return this;
  }

  build(): HTMLElement {
    const element = document.createElement(this.tag);

    if (this.text !== undefined) {
      element.textContent = this.text;
    }

    if (this.classes.length > 0) {
      element.className = this.classes.join(' ');
    }

    for (const [property, value] of Object.entries(this.styles)) {
      element.style.setProperty(property, value);
    }

    for (const [event, handler] of Object.entries(this.events)) {
      element.addEventListener(event, handler);
    }

    for (const child of this.children) {
      element.appendChild(child);
    }

    return element;
  }
}
