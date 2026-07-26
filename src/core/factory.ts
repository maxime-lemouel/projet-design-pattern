export type ElementType =
  | 'button'
  | 'div'
  | 'img'
  | 'hr'
  | 'input'
  | 'heading'
  | 'span'
  | 'paragraph';

export interface TagConfig {
  text?: string;
  src?: string;
  alt?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: HTMLElement[];
  attributes?: Record<string, string>;
  events?: Record<string, EventListener>;
}

export interface Tag {
  toHtml(): HTMLElement;
}

abstract class BaseTag implements Tag {
  protected constructor(
    protected readonly tagName: string,
    protected readonly config: TagConfig,
  ) {}

  toHtml(): HTMLElement {
    const element = document.createElement(this.tagName);

    if (this.config.text !== undefined) {
      element.textContent = this.config.text;
    }

    if (this.config.attributes) {
      for (const [key, value] of Object.entries(this.config.attributes)) {
        element.setAttribute(key, value);
      }
    }

    if (this.config.events) {
      for (const [event, handler] of Object.entries(this.config.events)) {
        element.addEventListener(event, handler);
      }
    }

    if (this.config.children) {
      for (const child of this.config.children) {
        element.appendChild(child);
      }
    }

    return element;
  }
}

class ButtonTag extends BaseTag {
  constructor(config: TagConfig) {
    super('button', config);
  }
}

class DivTag extends BaseTag {
  constructor(config: TagConfig) {
    super('div', config);
  }
}

class SpanTag extends BaseTag {
  constructor(config: TagConfig) {
    super('span', config);
  }
}

class ParagraphTag extends BaseTag {
  constructor(config: TagConfig) {
    super('p', config);
  }
}

class HorizontalRuleTag extends BaseTag {
  constructor(config: TagConfig) {
    super('hr', config);
  }
}

class HeadingTag extends BaseTag {
  constructor(config: TagConfig) {
    super(`h${config.level ?? 1}`, config);
  }
}

class ImageTag extends BaseTag {
  constructor(config: TagConfig) {
    super('img', config);
  }

  override toHtml(): HTMLElement {
    const element = super.toHtml() as HTMLImageElement;

    if (this.config.src !== undefined) {
      element.src = this.config.src;
    }

    if (this.config.alt !== undefined) {
      element.alt = this.config.alt;
    }

    return element;
  }
}

class InputTag extends BaseTag {
  constructor(config: TagConfig) {
    super('input', config);
  }

  override toHtml(): HTMLElement {
    const element = super.toHtml() as HTMLInputElement;

    if (this.config.type !== undefined) {
      element.type = this.config.type;
    }

    if (this.config.placeholder !== undefined) {
      element.placeholder = this.config.placeholder;
    }

    if (this.config.value !== undefined) {
      element.value = this.config.value;
    }

    return element;
  }
}

const tagCreators: Record<ElementType, (config: TagConfig) => Tag> = {
  button: (config) => new ButtonTag(config),
  div: (config) => new DivTag(config),
  img: (config) => new ImageTag(config),
  hr: (config) => new HorizontalRuleTag(config),
  input: (config) => new InputTag(config),
  heading: (config) => new HeadingTag(config),
  span: (config) => new SpanTag(config),
  paragraph: (config) => new ParagraphTag(config),
};

export class TagFactory {
  static create(type: ElementType, config: TagConfig = {}): Tag {
    return tagCreators[type](config);
  }
}
