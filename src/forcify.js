/**
 *  forcify.js
 *
 *  Core of forcify.js
 *  created by @huxpro
 */


// uuid
let _uid = 0;


// polyfill
Object.extend = Object.assign ? Object.assign : (function(copy, src){
    for(let prop in src){
        copy[prop] = src[prop];
    }
    return copy;
})


/**
 * @class Forcify
 */
export default class Forcify{

    /**
     * @constructor                     create a new Forcify Object.
     * @param  {Node}   element         TODO: support Selector
     * @param  {Object} options         customize options
     * @return {Forcify}                Instance of Forcify, you can call it 'Forcify Object'
     */
    constructor(element, options){
        this.uid = ++_uid;              // uid
        this.element = element;         // cache element
        this.handlers = {};             // event handlers
        this.touch = null;              // unique touch id
        this.timer = null;              // unique press timer
        this._pressTimeStamp = 0;       // unique press-time stamp

        // Merge Instance Options.
        let _temp = Object.extend({}, Forcify.defaults)
        this.options = Object.extend(_temp, options);

        // Set uid to DOM object for cache use. Decrease time complexity
        this.element.__fuid__ = this.uid;

        // Cache forcify instance (this)
        let caches = Forcify.cache;
        caches[this.uid] = this;
    }

    /**
     * Bind event
     * @param  {String} event           Type of event
     * @param  {fn}     handler         Event handlers, TODO: support fn[]
     * @return {Forcify}
     */
    on(event, handler){
        let handlers = this.handlers;

        handlers[event] = handlers[event] || [];
        handlers[event].push(handler);

        return this;
    }

    /**
     * Invoke event handlers
     * @param  {Forcify} _instance
     * @param  {Object}  e              Forcify custom event object
     * @return {null}
     */
    invokeHandlers(_instance, e){
        //console.log(_instance);
        console.log(e);
        _instance.handlers['force'].forEach((fn) => {
            fn(e);
        })
    }
}


// Static Members
Forcify.emitEvent = function(_instance, nativeEvent){
    let force = 0;
    let type = nativeEvent.type;

    console.log('type: ' + type);
    console.log(nativeEvent);
    nativeEvent.preventDefault();           // !important

    // Event Recognizer
    if(type == "touchend" || type == "touchmove" || type == "touchstart"){
        _instance.handleTouch(_instance, nativeEvent);
    }

    if(type == 'webkitmouseforcewillbegin' || type == 'webkitmouseforcechanged'){
        Forcify.detection.OSXFORCE = true;       // if these event triggered, this is OSX.
        _instance.handleMouseForce(_instance, nativeEvent);
    }
    if(type == 'mousedown' || type == 'mouseup'){
        if(Forcify.detection.OSXFORCE) return;   // OSX should skip this
        _instance.handlePress(_instance, nativeEvent);
    }
}


/**
 * Forcify global coniguration
 * @param  {object} _config
 */
Forcify.config = function(_config){
    // Merge config.defaults into Forcify.defaults
    if(_config.defaults){
        Forcify.defaults = Object.extend(Forcify.defaults, _config.defaults)
    }
}


// Cache elements reference
Forcify.cache = {}


// whether event bobble, globally
// inner options for now.
Forcify.__EVENT_BOBBLE__ = false;


// Default Options
Forcify.defaults = {
    /**
     * Delay to trigger fake Force Touch
     * @type {Number}
     * @default 200(ms)
     */
    LONG_PRESS_DELAY : 200,

    /**
     * Duration from MIN to MAX of the fake Force Touch
     * @type {Number}
     * @default 1000(ms)
     */
    LONG_PRESS_DURATION: 100,

    /**
     * if Forcify fallback to long press on unsupport devices
     * if set false, Forcify will not fallback 'force' to 'long press'
     * @type {Boolean}
     * @default true
     */
    FALLBACK_TO_LONGPRESS: true,

    /**
     * Some browser, such as Chrome, provide a very weird force value.
     * if set false, Forcify would not try to find and ignore those weird
     * behavior.
     * Which means your "Force Actions" may
     *   - be triggered just by a click in some 'force: 1' devices.
     *   - be influenced in device like Nexus5 to give a force in (0,1)
     * @type {Boolean}
     * @default true
     */
    SHIM_WEIRD_BROWSER: true
}


// Detections
Forcify.detection = {
    /**
     * Unfortunately there is not a feature detection for 3DTouch so far, so Forcify use a dynamic detection to detect it
     * If Forcify detects that force is support, all hacking stop
     *
     * @type {Boolean}
     * @default false
     */
    TOUCH3D: false,

    /**
     * OSX support real webkit force touch
     *
     * @type {Boolean}
     * @default false
     */
    OSXFORCE: false,

    /**
     * Chrome Mobile give any touchevent a 'force' property with value: 1.
     * Forcify has to hack it.
     * Forcify not detect Chrome by UA but behaviors.
     *
     * @type {Boolean}
     * @default false
     */
    WEIRD_CHROME: false,

    /**
     * Android performs really odd, which performs different in diff devices.
     * Forcify has to use UA detection to handle them.
     *
     * @type {Boolean}
     * @default false
     */
    ANDROID: navigator.userAgent.match(/(Android);?[\s\/]+([\d.]+)?/),
}


// import modules
new (require('./touch'))(Forcify)
new (require('./mouse'))(Forcify)
new (require('./press'))(Forcify)
new (require('./delegate'))(Forcify)

// debugging use.
// window.Forcify = Forcify;
