import { mergeSkipUndefined } from './utils/mergeSkipNull';

/**
 * Base class for HasProps property type.
 */
export class BaseProps {

}

/**
 * Base class for all property initialized classes that need
 * property drilling on initialization, where constructor is
 * not suitable.
 * 
 * Example:
 * class Foo extends HasProps<FooProps> {
 *     init(props: Partial<FooProps>): this {
 *         super.init(props);
 *         <your code here>
 *         return this;
 *     }
 * }
 */
export abstract class HasProps<TProps extends BaseProps = BaseProps> {

    public props: TProps;

    /**
     * Override to provide default properties.
     * 
     * Example: defaultProps = () => new Props();
     */
    protected abstract defaultProps: () => TProps;

    /**
     * Override to provide initialization code. Don't forget
     * to call super.init(props) to copy over given properties.
     *
     * Example:
     * class Foo extends HasProps<FooProps> {
     *     init(props: Partial<FooProps>): this {
     *         super.init(props);
     *         <your code here>
     *         return this;
     *     }
     * }
     * @param props Properties
     */
    public init(props: Partial<TProps>): this {
        this.props = mergeSkipUndefined(this.defaultProps(), props);
        return this;
    }
}