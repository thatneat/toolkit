/**
 * @copyright   2010-2016, The Titon Project
 * @license     http://opensource.org/licenses/BSD-3-Clause
 * @link        http://titon.io
 */

import React, { PropTypes } from 'react';
import Component from '../../Component';
import cssClass from '../../prop-types/cssClass';

export default class Static extends Component {
    static defaultProps = {
        elementClassName: ['input', 'static']
    };

    static propTypes = {
        children: PropTypes.node,
        className: cssClass,
        elementClassName: cssClass.isRequired,
        large: PropTypes.bool,
        small: PropTypes.bool
    };

    /**
     * Render a static text input element.
     *
     * @returns {ReactElement}
     */
    render() {
        let props = this.props;

        return (
            <span
                className={this.formatClass(props.elementClassName, props.className, {
                    '@large': Boolean(props.large),
                    '@small': Boolean(props.small)
                })}
                {...this.inheritNativeProps(props)}>

                {props.children}
            </span>
        );
    }
}