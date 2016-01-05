/*
    FlatHat Object
*/
FlatHat.polygon = function Polygon(properties) {
    properties = properties || {};
    this.geometry = properties.geometry || [];
    this.closePath = properties.closePath || true;
    this.strokeStyle = properties.strokeStyle || null;
    this.fillStyle = properties.fillStyle || null;
    this.lineWidth = properties.lineWidth || 1;
    this.visible = true;
    this.bufferNeedsUpdate = true;
    this.buffer = [];
    this.depth = 0;
    this.position = new Vector2();
    this.parent = null;
    this.center = new Vector2();
    this.sceneposition = new Vector2();
    this.radius = 0;
    if (properties.parent) {
        parent.add(this);   
    }
};

FlatHat.polygon.prototype = {
    constructor: FlatHat.Polygon,
    shouldUpdateBuffer: function() {
        this.bufferNeedsUpdate = true;
    },
    updateScenePosition: function() {
        this.sceneposition.addVectors(this.center, this.position);  
    },
    setPosition: function(x, y){
        this.position.x = x;
        this.position.y = y;
        this.updateScenePosition();
        this.shouldUpdateBuffer();
    },
    isVisible: function() {
        return this.visible;
    },
    copyGeometryToBuffer: function() {
        var i = this.geometry.length;
        this.buffer.length = i;
        while (i--) {
            this.buffer[i] = [
                this.geometry[i].x + this.position.x,
                this.geometry[i].y + this.position.y
            ];
        }
    },
    createFromArrays: function(array) {
        var i = array.length;
        var length = 0;
        var maxlength = 0;
        this.geometry.length = i;
        this.center.x = this.center.y = 0;
    	while (i--) {
    		this.geometry[i] = new Vector2(array[i][0], array[i][1]);
            this.center.add(this.geometry[i]);
    	}
        i = this.geometry.length;
        this.center.divideScalar(i); //get center using mean average
        while (i--) {
            length = this.center.distanceToSquared(this.geometry[i]);
            if (length > maxlength) {
                maxlength = length;   
            }
        }
        this.radius = Math.sqrt(maxlength);
        this.updateScenePosition();
    },
    createFromVectors: function(array) {  
        var i = array.length;
        var length = 0;
        var maxlength = 0;
        this.geometry = array; 
        this.center.x = this.center.y = 0;
    	while (i--) {
            this.center.add(this.geometry[i]);
    	}
        i = this.geometry.length;
        this.center.divideScalar(i); //get center using mean average
        while (i--) {
            length = this.center.distanceToSquared(this.geometry[i]);
            if (length > maxlength) {
                maxlength = length;   
            }
        }
        this.radius = Math.sqrt(maxlength);
        this.updateScenePosition();
    }
};