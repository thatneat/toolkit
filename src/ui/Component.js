/**
 * @copyright   2010-2016, The Titon Project
 * @license     http://opensource.org/licenses/BSD-3-Clause
 * @link        http://titon.io
 */

import React, { PropTypes } from 'react';
import Titon from '../Titon';
import assign from 'lodash/object/assign';
import bem from '../ext/utility/bem';
import classBuilder from '../ext/utility/classBuilder';
import generateUID from '../ext/utility/generateUID';
import '../poly/performance/now';

class TitonEvent {
    /**
     * A fake event object that is passed to listeners within `Component`.
     *
     * @param {String} name
     * @param {String} uid
     * @param {String} event
     */
    constructor(name, uid, event) {
        this.uid = uid;
        this.type = event;
        this.component = name;
        this.timestamp = Date.now();
    }
}

export default class Component extends React.Component {
    /**
     * Set the default state and version.
     */
    constructor() {
        super();

        this.state = {};
        this.version = '3.0.0';
    }

    /**
     * Re-bind the context for every supplied method.
     * Will automatically bind all methods that start with "on",
     * assuming they are event handlers.
     */
    autoBind(...methods) {
        // Automatically inject all methods that start with "on"
        methods = methods.concat(
            Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(prop => {
                return (prop.substr(0, 2) === 'on' && typeof this[prop] === 'function');
            })
        );

        // Bind the functions
        methods.forEach(method => this[method] = this[method].bind(this));
    }

    /**
     * Emit a custom event and notify all listeners defined on the property of the same name.
     * If the `debug` property is enabled, print out some helpful information.
     *
     * This *must not* be used for native DOM events, use `handleEvent()` instead.
     *
     * @param {String} type
     * @param {Array} [args]
     */
    emitEvent(type, args = []) {
        let debug = this.props.debug || Titon.options.debug;

        if (debug && window.console) {
            /* eslint no-console: 0 */

            console.log(this.constructor.name + '#' + this.getUID(), performance.now().toFixed(3), type, ...args);

            if (debug === 'verbose') {
                console.dir(this);
            }
        }

        args.unshift(new TitonEvent(this.constructor.name, this.getUID(), type));

        this.notifyEventListeners(type, args);
    }

    /**
     * Format a unique HTML class name based on the passed parameters.
     * Append the CSS namespace if applicable.
     *
     * @param {String} className
     * @returns {String}
     */
    formatClass(className, ...params) {
        return classBuilder(bem(className), ...params);
    }

    /**
     * Format a unique HTML ID based on the passed parameters.
     *
     * @returns {String}
     */
    formatID(...params) {
        return ['titon', this.getUID(), ...params].join('-').trim();
    }

    /**
     * Generate a unique identifier for this instance.
     */
    generateUID() {
        this.uid = generateUID();
    }

    /**
     * Generate a new set of properties based on a specific property from the initial property set.
     * If the value is this property is an object, merge it in, else assume it's a boolean.
     *
     * @param {Object} props
     * @param {String} propName
     * @param {String[]} [listeners]
     * @returns {Object}
     */
    generateNestedProps(props, propName, listeners = []) {
        let obj = {};

        // Merge nested object
        if (typeof props[propName] === 'object') {
            assign(obj, props[propName]);
            obj.enabled = true;
        } else {
            obj.enabled = Boolean(props[propName]);
        }

        // Inherit event listeners
        listeners.forEach(key => {
            if (!obj[key]) {
                obj[key] = [];
            }

            if (Array.isArray(props[key])) {
                obj[key] = obj[key].concat(props[key]);

            } else if (props[key]) {
                obj[key].push(props[key]);
            }
        });

        return obj;
    }

    /**
     * Return the UID for the current component.
     * The UID could either be inherited from the parent, or generate per instance.
     *
     * @returns {String}
     */
    getUID() {
        return this.context.uid || this.uid;
    }

    /**
     * Handle a native/synthetic DOM event and notify all listeners defined on the property of the same name.
     *
     * @param {String} type
     * @param {SyntheticEvent} event
     */
    handleEvent(type, event) {
        this.notifyEventListeners(type, [event]);
    }

    /**
     * Execute a function, or an array of functions, with the defined arguments, for the specified property.
     *
     * @param {String} propName
     * @param {Array} args
     */
    notifyEventListeners(propName, args = []) {
        if (propName.substr(0, 2) !== 'on') {
            propName = 'on' + propName.charAt(0).toUpperCase() + propName.substr(1);
        }

        let listeners = this.props[propName];

        if (!listeners) {
            return;
        } else if (!Array.isArray(listeners)) {
            listeners = [listeners];
        }

        listeners.forEach(func => func(...args));
    }
}

Component.defaultProps = {
    debug: false
};

Component.propTypes = {
    debug: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};
