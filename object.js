/*
    FlatHat Object
*/
FlatHat.object = function Object() {
    this.bufferNeedsUpdate = true;
    this.visible = true;
    this.children = [];
    this.parent = null;
    this.depth = 0;
};

FlatHat.object.prototype = {
    constructor: FlatHat.object,
    add: function(object) {
        if (object.parent) {
            object.parent.remove(object);  
        }
        object.parent = this;
        this.children.push(object);
    },
    sortChildrenByDepth: function() {
        var sortfn = function(a, b) {
            return b.depth - a.depth;   
        }
        return function() {
            this.children.sort(sortfn);
        }
    }(),
    remove: function(object) {
        var i = this.children.indexOf(object);
        if (i > -1) {
            object.parent = null;
            this.children.splice(i, 1);
        }
    },
    shouldUpdateBuffer: function() {
        var i;
        this.bufferNeedsUpdate = true;
        if (this.children && this.children.length) {
            i = this.children.length;
            while (i--) {
                this.children[i].shouldUpdateBuffer();
            } 
        }
    },
    isVisible: function() {
        return this.visible;
    }
};