/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

/*
  This code specially did not wraped with module pattern/boilerplate
  because it should be used like internal code inside you project by you builder.
*/

"use strict";

var vendors = [
    'Moz',
    'Webkit',
    'MS',
    'O'
  ],
  eventName = 'transitionend',
  eventsMap = {
    "moz": 'transitionend',
    "webkit": 'webkitTransitionEnd',
    'ms': 'MSTransitionEnd',
    'o': 'OTransitionEnd'
  },
  camelToCss = function(str, w) {
    return '-' + w.toLowerCase();
  },
  transitionProperty = 'Transition',
  transitionVendor = '',
  transformProperty = 'Transform',
  transformOrigin,
  style = document.createElement('div').style;

  if (transitionProperty.toLowerCase() in style) {
    transitionProperty = transitionProperty.toLowerCase();
  } else if (!vendors.some(function(vendor) {

    if (vendor + transitionProperty in style) {

      transitionProperty = vendor + transitionProperty;
      transitionVendor = vendor.toLowerCase();
      return true;
    }

    return false;

  })) {
    transitionProperty = null;
  } else if (transitionVendor in eventsMap) {
    eventName = eventsMap[transitionVendor];
  };

  if (transformProperty.toLowerCase() in style) {
    transformProperty = transformProperty.toLowerCase();
  } else if (!vendors.some(function(vendor) {

    if (vendor + transformProperty in style) {
      transformProperty = vendor + transformProperty;
      transformOrigin = transformProperty + 'Origin';
      return true;
    }

    return false;
  })) {
    transformProperty = null;
  }


style = null;

if (!transitionProperty || !transformProperty) {
  throw new Error('Browser does not supported CSS transitions');
}

var TRANSFORM_MAP = {
    translatex: 'px',
    translatey: 'px',
    translate: 'px',
    scale: '',
    rotate: 'deg',
    rotateX: 'deg',
    rotateY: 'deg'
  },
  R_CAMEL_TO_CSS = /([A-Z])(?=[a-z])/g,
  DEFAULT_TRANSITION_DURATION = 300,
  DEFAULT_TRANSITION_FUNCTION = 'linear',
  DEFAULT_TRANSITION_DELAY = 0,
  STYLE_MAP = {
    transition: transitionProperty,
    transform: transformProperty,
    transformOrigin: transformOrigin
  };


  var Transition = function(params, duration, timing, delay) {

    var stack = this.stack = [];

    params || (params = []);

    params.forEach(function(key) {

      key = STYLE_MAP[key] || key;

      stack.push([
        key.replace(R_CAMEL_TO_CSS, camelToCss),
        (duration || DEFAULT_TRANSITION_DURATION) + 'ms',
        (timing || DEFAULT_TRANSITION_FUNCTION),
        (delay || DEFAULT_TRANSITION_DELAY) + 'ms'
      ].join(' '));

    });

  };

  Transition.stop = function(element) {
    element.style[transitionProperty] = 'null';
  };
  Transition.run = function(elem, props, params, callback) {
    var transition = [],
      style = elem.style,
      keys = Object.keys(props),
      count = keys.length,
      cssProps = {};

    if (typeof params === 'function') {
      callback = params;
      params = {};
    }

    params || (params = {});

    keys.forEach(function(key) {
      var newKey = STYLE_MAP[key] || key,
        cssKey = newKey.replace(R_CAMEL_TO_CSS, camelToCss);
      transition.push(newKey);
      style[newKey] = props[key];
      cssProps[cssKey] = 1;
    });

    elem.addEventListener(eventName, function transitionListener(e) {
      if (e.eventPhase !== e.AT_TARGET) return;

      var property = e.propertyName;

      if (property in cssProps && count) {
        delete cssProps[property];
        if (!--count) {
          elem.removeEventListener(eventName, transitionListener, true);
          callback && callback.call(this, e);
          style[transitionProperty] = '';
        }
      }

    }, true);

    style[transitionProperty] = new Transition(
      transition, params.duration, params.timing, params.delay);

  };

  Transition.prototype = {
    toString: function() {
      return this.stack.join(', ');
    }
  };

  // Transform section

  var Transform = function(map) {
    var stack = this.stack = [];

    Object.keys(map).forEach(function(name) {
      stack
        .push(name + '(' + (map[name] + '')
        .replace(/\s*(,)|$\s*/g, TRANSFORM_MAP[name.toLowerCase()] + '$1') + ')');
    });

  };

  Transform.translate = function(x, y) {
    return [
      'translate(',
      x || 0,
      'px,',
      y || 0,
      ')'
    ].join('');
  };

  ['translate', 'rotate', 'scale'].forEach(function(key) {
    Transform.prototype[key] = function() {
      this.stack.push(Transform[key].apply(null, arguments));
      return this;
    }
  });

  Transform.prototype.toString = function() {
    return this.stack.join(' ');
  };


