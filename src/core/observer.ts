export type Subscriber<Value> = (value: Value) => void;

export class Observable<Value> {
  private subscribers: Array<Subscriber<Value>> = [];

  constructor(private value: Value) {}

  subscribe(subscriber: Subscriber<Value>): () => void {
    this.subscribers.push(subscriber);
    return () => {
      this.subscribers = this.subscribers.filter((existing) => existing !== subscriber);
    };
  }

  next(value: Value): void {
    this.value = value;
    this.subscribers.forEach((subscriber) => subscriber(value));
  }

  getValue(): Value {
    return this.value;
  }
}
