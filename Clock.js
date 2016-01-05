/*
    Adapted from three.js Clock
    Original: https://github.com/mrdoob/three.js/blob/master/src/core/Clock.js
 */
var Clock = function ( ) {
    this.oldTime = this.startTime = Clock.time();
};

if (self.performance && self.performance.now) {
    Clock.time = function() {return performance.now();};
}
else if (Date.now) {
    Clock.time = function() {return Date.now();};
}
else {
    Clock.time = function() {return new Date().getTime()};
}

Clock.interval = function(fn, time) {
    var nextAt, wrapper, cancel, timeout;

    nextAt = Clock.time() + time;

    wrapper = function() {
      nextAt += time;
      timeout = setTimeout(wrapper, nextAt - Clock.time());
      return fn();
    };

    cancel = function() {
      return clearTimeout(timeout);
    };

        timeout = setTimeout(wrapper, nextAt - Clock.time());

    return {
      cancel: cancel
    };
};

Clock.timeout = function(fn, time) {
    var cancel, timeout;
    cancel = function() {
        return clearTimeout(timeout);
    };
    timeout = setTimeout(fn, time);
    return {
        cancel: cancel
    }
};

Clock.prototype = {

    constructor: Clock,
    //reuse the constructor, as it has the same behaviour
    reset: Clock, 

    getElapsedTime: function () {
        return ( Clock.time() - this.startTime );
    },

    getDelta: function () {
        var newTime = Clock.time(),
            diff = ( newTime - this.oldTime );
        this.oldTime = newTime;
        return diff;
    }
};