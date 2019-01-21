/**
 * Implements simple, modern event handlers.
 * 
 * Example usage:
 * 
 * class Foo {
 *     private onRender = new SimpleEvent<T>();
 *     public get Rendered() {
 *         return this.onRender.expose();
 *     }
 * 
 *     ...
 *     onRender.trigger(data);
 *     ...
 * }
 */

/**
 * Simple event handler.
 */
export interface ISimpleEvent<T> {
    listen(handler: { (data?: T): void }): void;
    remove(handler: { (data?: T): void }): void;
}

/**
 * Implementation of simple event handler.
 * @template T Data type that listeners receive. If nothing, set to never.
 */
export class SimpleEvent<T> implements ISimpleEvent<T> {
    private handlers: { (data?: T): void; }[] = [];

    public listen(handler: { (data?: T): void }): void {
        this.handlers.push(handler);
    }

    public remove(handler: { (data?: T): void }): void {
        this.handlers = this.handlers.filter(h => h !== handler);
    }

    public trigger(data?: T) {
        this.handlers.slice(0).forEach(h => h(data));
    }

    public expose(): ISimpleEvent<T> {
        return this;
    }
}