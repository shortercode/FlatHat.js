/*
    Animation helper class
    Iterates from 0 to 1 over a specified duration with a given timing function
    Set Animator->loop to repeat iteration indefinitely
*/
var Animator = function(fn, duration){
    var that = this;
    this.duration = duration;
    this.clock = new Clock();
    this.update = function () {
        if (that.running) {
            requestAnimationFrame(that.update);
            that.alpha = that.clock.getElapsedTime() / that.duration;
            if (that.alpha >= 1) {
                if (that.loop) {
                    that.alpha = that.alpha % 1; //allow that due to variable frame rate we may go much higher than 1, but still keep the rough position
                } else {
                    that.running = false;
                    that.alpha = 1;
                }
            }
            that.alpha = that.timingFunction(that.alpha);
            fn(that.alpha);
        }
    }
};
// linear, no acceleration
Animator.TIMING_LINEAR = function (t) { return t }
// quad, slowest accelaration
Animator.TIMING_EASE_IN_QUAD = function (t) { return t*t }
Animator.TIMING_EASE_OUT_QUAD = function (t) { return t*(2-t) }
Animator.TIMING_EASE_IN_OUT_QUAD = function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t }
// cubic, slow accelaration
Animator.TIMING_EASE_IN_CUBIC = function (t) { return t*t*t }
Animator.TIMING_EASE_OUT_CUBIC = function (t) { return (--t)*t*t+1 }
Animator.TIMING_EASE_IN_OUT_CUBIC = function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 }
// quart, fast accelaration
Animator.TIMING_EASE_IN_QUART = function (t) { return t*t*t*t }
Animator.TIMING_EASE_OUT_QUART = function (t) { return 1-(--t)*t*t*t }
Animator.TIMING_EASE_IN_OUT_QUART = function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t }
// quint, fastest accelaration
Animator.TIMING_EASE_IN_QUINT = function (t) { return t*t*t*t*t }
Animator.TIMING_EASE_OUT_QUINT = function (t) { return 1+(--t)*t*t*t*t }
Animator.TIMING_EASE_IN_OUT_QUINT = function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
Animator.prototype = {
    running: false,
    loop: false,
    alpha: 0,
    timingFunction: Animator.TIMING_LINEAR,
    run: function () {
        this.running = true;
        this.clock.reset();
        this.update();
    },
    cancel: function () {
        this.running = false;
    }
};