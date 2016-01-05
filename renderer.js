/*
    FlatHat Renderer
*/
FlatHat.renderer = function Renderer() {
    this.element = document.createElement('canvas');
    this.context = this.element.getContext('2d');
};

FlatHat.renderer.prototype = {
    constructor: FlatHat.renderer,
    resize: function(x, y) {
        this.element.width = x;
        this.element.height = y;
    },
    render: function(object, camera) {
        if (camera.boundsDidChange === true) {
            object.shouldUpdateBuffer();
            camera.boundsDidChange = false;
        }
        this.context.clearRect(0, 0, this.element.width, this.element.height);
        this.renderObject(object, camera);
    },
    renderObject: function(object, camera) {
        var i;
        if (object.isVisible()) {
            if (object.children && object.children.length > 0) { // is container
                i = object.children.length;
                while(i--) {
                    this.renderObject(object.children[i], camera);
                }
            }
            else if(object.buffer) { // is drawable
                if (object.bufferNeedsUpdate) {
                    this.regenerateBuffer(object, camera);
                }
                if (object.buffer.length > 1) {
                    this.renderBuffer(object);
                }
            }
        }
    },
    regenerateBuffer: function(polygon, camera) {
        polygon.copyGeometryToBuffer();
        polygon.buffer = this.clipToCamera(polygon, camera);
        var i = polygon.buffer.length;
        while (i--) {
            polygon.buffer[i][0] = (polygon.buffer[i][0] - camera.boundingRect.left) * camera.scale;
            polygon.buffer[i][1] = (polygon.buffer[i][1] - camera.boundingRect.top) * camera.scale;
        }
        polygon.bufferNeedsUpdate = false;
    },
    renderBuffer: function(polygon) {
        var i, l;
        this.context.beginPath();
        this.context.moveTo(
            polygon.buffer[0][0],
            polygon.buffer[0][1]
        ); 
        for (i = 1, l = polygon.buffer.length; i < l; i++) {
            this.context.lineTo(
                polygon.buffer[i][0],
                polygon.buffer[i][1]
            );
        }
        if (polygon.closePath === true) {
            this.context.lineTo(
                polygon.buffer[0][0],
                polygon.buffer[0][1]
            ); 
        }
        if (polygon.strokeStyle) {
            this.context.lineWidth = polygon.lineWidth || 1;
            this.context.strokeStyle = polygon.strokeStyle;
            this.context.stroke();
        }
        if (polygon.fillStyle) {
            this.context.fillStyle = polygon.fillStyle;
            this.context.fill();
        }
    },
    clipToCamera: function(){
        function intersection(cp1, cp2, s, e) {
    		var dc = [cp1[0] - cp2[0], cp1[1] - cp2[1]],
				dp = [s[0] - e[0], s[1] - e[1]],
				n1 = cp1[0] * cp2[1] - cp1[1] * cp2[0],
				n2 = s[0] * e[1] - s[1] * e[0],
				n3 = 1.0 / (dc[0] * dp[1] - dc[1] * dp[0]);
			return [(n1 * dp[0] - n2 * dc[0]) * n3, (n1 * dp[1] - n2 * dc[1]) * n3];
    	}
    	function inside(cp1, cp2, p) {
    		return (cp2[0] - cp1[0]) * (p[1] - cp1[1]) > (cp2[1] - cp1[1]) * (p[0] - cp1[0]);
    	}
    	function shouldClip(a, b, poly) {
    		var i = poly.length;
    		while (i--) {
    			if (
                    a[0] > poly[i][0] ||
                    poly[i][0] > b[0] ||
                    a[1] > poly[i][1] ||
                    poly[i][1] > b[1]
                ) {
    				return true;
    			}
    		}
    		return false;
    	}
        function isVisible(object, camera) {
            return camera.position.distanceTo(object.sceneposition) - camera.boundingRect.radius - object.radius < 0;
        }
        return function(object, camera) {
            var subjectPolygon = object.buffer;
            var clipPolygon = camera.boundingRect.poly;
            var cp1, cp2, s, e;
			var i, j, li, lj;
			var inputList, outputList;
            if (!isVisible(object, camera)) {
				return []; //offscreen, draw nothing
			}
            if (!shouldClip(clipPolygon[0], clipPolygon[2], subjectPolygon)) {
				return subjectPolygon; //completely onscreen, don't clip
			}
            outputList = subjectPolygon
			cp1 = clipPolygon[clipPolygon.length - 1];
			for (j = 0, lj = clipPolygon.length; j < lj; j++) {
				cp2 = clipPolygon[j];
				inputList = outputList;
				outputList = [];
				s = inputList[inputList.length - 1]; //last on the input list
				for (i = 0, li = inputList.length; i < li; i++) {
					e = inputList[i];
					if (inside(cp1, cp2, e)) {
						if (!inside(cp1, cp2, s)) {
							outputList.push(intersection(cp1, cp2, s, e));
						}
						outputList.push(e);
					} else if (inside(cp1, cp2, s)) {
						outputList.push(intersection(cp1, cp2, s, e));
					}
					s = e;
				}
				cp1 = cp2;
			}
			return outputList;
		};
    }()
};