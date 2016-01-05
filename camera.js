/*
    FlatHat Camera
*/
FlatHat.camera = function Camera() {
    this.position = new Vector2();
    this.boundingRect = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        poly: [
            [0, 0], //topleft
            [0, 0], //topright
            [0, 0], //bottomright
            [0, 0] //bottomleft
        ],
        radius: 0
    };
    this.scale = 1;
    this.size = new Vector2();
    this.boundsDidChange = true;
};

FlatHat.camera.prototype = {
    constructor: FlatHat.Camera,
    setSize: function(x, y) {
        this.size.x = x;
        this.size.y = y;
        this.recalculateBoundingRect();
    },
    setScale: function(s) {
        this.scale = s;
        this.recalculateBoundingRect();
    },
    setPosition: function(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.recalculateBoundingRect();
    },
    recalculateBoundingRect: function() {
        var halfwidth   = (this.size.x / 2) / this.scale,
            halfheight  = (this.size.y / 2) / this.scale;
        var box = this.boundingRect;
        box.left    = this.position.x - halfwidth;
        box.right   = this.position.x + halfwidth;
        box.bottom  = this.position.y + halfheight;
        box.top     = this.position.y - halfheight;
        box.poly[0][0] = box.poly[3][0] = box.left;
        box.poly[1][0] = box.poly[2][0] = box.right;
        box.poly[0][1] = box.poly[1][1] = box.top;
        box.poly[3][1] = box.poly[2][1] = box.bottom;
        box.radius = Math.sqrt(
            Math.pow(halfwidth, 2) + Math.pow(halfheight, 2)
        );
        this.boundsDidChange = true;
    }
};