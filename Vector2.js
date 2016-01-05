/*
    Adapted from three.js Vector2
    Original: https://github.com/mrdoob/three.js/blob/master/src/math/Vector2.js
 */

var Vector2 = function ( x, y ) {

    this.x = x || 0;
    this.y = y || 0;

};

Vector2.prototype = {

    constructor: Vector2,

    copy: function ( v ) {

        this.x = v.x;
        this.y = v.y;

        return this;

    },

    add: function ( v ) {

        this.x += v.x;
        this.y += v.y;

        return this;

    },

    addScalar: function ( s ) {

        this.x += s;
        this.y += s;

        return this;

    },

    addVectors: function ( a, b ) {

        this.x = a.x + b.x;
        this.y = a.y + b.y;

        return this;

    },

    sub: function ( v ) {

        this.x -= v.x;
        this.y -= v.y;

        return this;

    },

    subScalar: function ( s ) {

        this.x -= s;
        this.y -= s;

        return this;

    },

    subVectors: function ( a, b ) {

        this.x = a.x - b.x;
        this.y = a.y - b.y;

        return this;

    },

    multiply: function ( v ) {

        this.x *= v.x;
        this.y *= v.y;

        return this;

    },

    multiplyScalar: function ( s ) {

        this.x *= s;
        this.y *= s;

        return this;

    },

    multiplyVectors: function ( a, b ) {

        this.x = a.x * b.x;
        this.y = a.y * b.y;

        return this;

    },

    divide: function ( v ) {

        this.x /= v.x;
        this.y /= v.y;

        return this;

    },

    divideScalar: function ( scalar ) {

        if ( scalar !== 0 ) {

            var invScalar = 1 / scalar;

            this.x *= invScalar;
            this.y *= invScalar;

        } else {

            this.x = 0;
            this.y = 0;

        }

        return this;

    },

    divideVectors: function ( a, b ) {

        this.x = a.x / b.x;
        this.y = a.y / b.y;

        return this;

    },

    floor: function () {

        this.x = Math.floor( this.x );
        this.y = Math.floor( this.y );

        return this;

    },

    ceil: function () {

        this.x = Math.ceil( this.x );
        this.y = Math.ceil( this.y );

        return this;

    },

    round: function () {

        this.x = Math.round( this.x );
        this.y = Math.round( this.y );

        return this;

    },

    negate: function () {

        this.x = - this.x;
        this.y = - this.y;

        return this;

    },

    dot: function ( v ) {

        return this.x * v.x + this.y * v.y;

    },
    
    getNormal: function() {
        var y = this.y;
        this.y = -this.x;
        this.x = y;
        return this;
        
	},

    lengthSq: function () {

        return this.x * this.x + this.y * this.y;

    },

    length: function () {

        return Math.sqrt( this.x * this.x + this.y * this.y );

    },

    normalize: function () {

        return this.divideScalar( this.length() );

    },

    distanceTo: function ( v ) {

        return Math.sqrt( this.distanceToSquared( v ) );

    },

    distanceToSquared: function ( v ) {

        var dx = this.x - v.x, dy = this.y - v.y;
        return dx * dx + dy * dy;

    },

    setLength: function ( l ) {

        var oldLength = this.length();

        if ( oldLength !== 0 && l !== oldLength ) {

            this.multiplyScalar( l / oldLength );
        }

        return this;

    },

    lerp: function ( v, alpha ) {

        this.x += ( v.x - this.x ) * alpha;
        this.y += ( v.y - this.y ) * alpha;

        return this;

    },

    lerpVectors: function ( v1, v2, alpha ) {

        this.subVectors( v2, v1 ).multiplyScalar( alpha ).add( v1 );

        return this;

    },

    equals: function ( v ) {

        return ( ( v.x === this.x ) && ( v.y === this.y ) );

    },

    fromArray: function ( array, offset ) {

        if ( offset === undefined ) offset = 0;

        this.x = array[ offset ];
        this.y = array[ offset + 1 ];

        return this;

    },

    toArray: function ( array, offset ) {

        if ( array === undefined ) array = [];
        if ( offset === undefined ) offset = 0;

        array[ offset ] = this.x;
        array[ offset + 1 ] = this.y;

        return array;

    },

    clone: function () {

        return new Vector2( this.x, this.y );

    }

};