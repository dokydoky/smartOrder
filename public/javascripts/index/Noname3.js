var xhtml_ns = 'http://www.w3.org/1999/xhtml';
var svg_ns = 'http://www.w3.org/2000/svg';
var xlink_ns = 'http://www.w3.org/1999/xlink';
var brow = false;

function createElement(ns, element) {
	if (typeof document.createElementNS != 'undefined') {
		return document.createElementNS(ns, element);
	}
	if (typeof document.createElement != 'undefined') {
		return document.createElement(element);
	}
	return false;
};

function getAttribute(ns, element, node) {
	if (typeof node.getAttributeNS != 'undefined') {
		return node.getAttributeNS(ns, element);
	}
	if (typeof node.getAttribute != 'undefined') {
		return node.getAttribute(element);
	}
	return false;
};

function getElementsByTagName(ns, element) {
	if (typeof document.getElementsByTagNameNS != 'undefined') {
		return document.getElementsByTagNameNS(ns, element);
	}
	if (typeof document.getElementsByTagName != 'undefined') {
		return document.getElementsByTagName(element);
	}
	return false;
};

function hasAttribute(element, node) {	
	if (typeof node.hasAttribute != 'undefined') {
		return node.hasAttribute(element) ? true:false;
	} else {		
		return getAttribute("", element, node) ? true:false;
	}
	return false;
};

function getPixel2(cm) {
	//return cm*37.73;
	return cm;
};

function getXmlObject(root) {
	var xmlDoc;
	var svgStr = root.innerHTML;
	try {
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = "false";
		xmlDoc.loadXML(svgStr);
		brow = true;
		return xmlDoc.documentElement;
	} catch (e) {
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(svgStr, "text/xml");
		return xmlDoc.getElementsByTagName("xml")[0];
	}	
}

function CanvaSVG (root, dest, text_container) {	
	var svgs = getXmlObject(root);
	//alert(svgs);
	new CanvaSVGDocument(svgs, dest, text_container);	
};

function CanvaSVGDocument (svgElement, dest, text_container) {
	this.Root = svgElement;
	this.Canvas = null;
	this.Context = null;
	this.Inheritance = [];
	this.labels = [];
	this.container = document.getElementById(text_container);
	this.IDs = [];
	this.w;
	this.h;
	
	this.Fill = 'black';
	this.FillOpacity = 1;
	this.Stroke = 'none';
	this.StrokeWidth = 1;
	this.StrokeOpacity = 1;
	this.Transform = false;
	
	this.LineCap = 'butt';
	this.LineJoin = 'miter';
	this.MiterLimit = 4;
	
	this.CurrentColor = 'black';
	
	this.PaintServers = [];
	
	this.SetupCanvas(dest);
	this.Parse(this.Root);
	//alert(this.Root);
};

CanvaSVGDocument.prototype.SetupCanvas = function (dest) {
	var w = this.Root.getAttribute('width');
	var h = this.Root.getAttribute('height');
	w = getPixel2(w);
	h = getPixel2(h);
	this.w = w;
	this.h = h;
//alert("A");
	var canvas = document.getElementById(dest);	
	this.Canvas = canvas;
	this.Context = this.Canvas.getContext('2d');
	this.Context.clearRect(0,0,w,h);
	
	// handle viewBox
	if (hasAttribute('viewBox', this.Root)) {
		var viewBox = new ViewBox(this.Root);
		var transforms = viewBox.GetTransformInstructions();
		while (transforms.length) {
			var t = transforms.pop();
			if (t.Type == 'scale') {				
				this.Context.scale(1/t.Sx, 1/t.Sy);
			} else if (t.Type == 'translate') {
				this.Context.translate(-t.Tx, -t.Ty);
			}
		}
	}
	
	// handle viewport-fill	
	if (hasAttribute('viewport-fill', this.Root)) {
		var fill_color = this.Root.getAttribute('viewport-fill');
		var fill_opacity = hasAttribute('viewport-fill-opacity', this.Root) ? this.Root.getAttribute('viewport-fill-opacity') : 1;
		this.Context.fillStyle = this.GetColorAsRGBA(fill_color, fill_opacity);
		this.Context.fillRect(0,0,w,h);
	}

	this.container.style.position = 'relative';
	this.container.style.top = "-510";
	this.container.style.left = "-20";
};

CanvaSVGDocument.prototype.Parse = function (element) {
	this.PreProcessContainer(element);
	var children = element.childNodes;	
	for (var i=0; i<children.length; i++) {
		var node = children.item(i);		
		if (node.nodeType == 1) { // node is an element
			var display = hasAttribute('display', node) ? node.getAttribute('display') : 'inline';
			var visibility = hasAttribute('visibility', node) ? node.getAttribute('visibility') : 'visible';
			if (display != 'none' && visibility != 'hidden' && visibility != 'collapsed') {
				this.ParseElement(node);
			}
		}
	}
	this.PostProcessContainer(element);	
};

CanvaSVGDocument.prototype.PreProcessContainer = function (element) {
	var transforms;
	
	if (this.Inheritance.length == 0) {
		this.Fill = hasAttribute('fill', element) ? element.getAttribute('fill') : this.Fill;
		this.FillOpacity = hasAttribute('fill-opacity', element) ? element.getAttribute('fill-opacity') : this.FillOpacity;
		this.Stroke = hasAttribute('stroke', element) ? element.getAttribute('stroke') : this.Stroke;
		this.StrokeWidth = hasAttribute('stroke-width', element) ? element.getAttribute('stroke-width') : this.StrokeWidth;
		this.StrokeOpacity = hasAttribute('stroke-opacity', element) ? element.getAttribute('stroke-opacity') : this.StrokeOpacity;
		this.LineCap = hasAttribute('stroke-linecap', element) ? element.getAttribute('stroke-linecap') : this.LineCap;
		this.LineJoin = hasAttribute('stroke-linejoin', element) ? element.getAttribute('stroke-linejoin') : this.LineJoin;
		this.MiterLimit = hasAttribute('stroke-miterlimit', element) ? element.getAttribute('stroke-miterlimit') : this.MiterLimit;
		transforms = false;
	} else {
		var parent = this.Inheritance[this.Inheritance.length - 1];
		this.Fill = hasAttribute('fill', element) ? element.getAttribute('fill') : parent.Fill;
		this.FillOpacity = hasAttribute('fill-opacity', element) ? element.getAttribute('fill-opacity') : parent.FillOpacity;
		this.Stroke = hasAttribute('stroke', element) ? element.getAttribute('stroke') : parent.Stroke;
		this.StrokeWidth = hasAttribute('stroke-width', element) ? element.getAttribute('stroke-width') : parent.StrokeWidth;
		this.StrokeOpacity = hasAttribute('stroke-opacity', element) ? element.getAttribute('stroke-opacity') : parent.StrokeOpacity;
		this.LineCap = hasAttribute('stroke-linecap', element) ? element.getAttribute('stroke-linecap') : parent.LineCap;
		this.LineJoin = hasAttribute('stroke-linejoin', element) ? element.getAttribute('stroke-linejoin') : parent.LineJoin;
		this.MiterLimit = hasAttribute('stroke-miterlimit', element) ? element.getAttribute('stroke-miterlimit') : parent.MiterLimit;

		if (hasAttribute('transform', element)) {
			transforms = this.GetTransformInstructions(element.getAttribute('transform'));
			for (var i=0; i<transforms.length; i++) {
				var t = transforms[i];
				if (t.Type == 'scale') {
					this.Context.scale(t.Sx, t.Sy);			
				} else if (t.Type == 'translate') {
					this.Context.translate(t.Tx, t.Ty);
				} else if (t.Type == 'rotate') {
					this.Context.rotate(t.Angle);
				}
			}
		}
	}

	try {
		this.Context.fillStyle = this.Fill;
	} catch(e) {
		//alert(e);
	}

	if (this.Stroke !== 'none') {
		try {
			this.Context.strokeStyle = stroke;
		} catch(e) {
			//alert(stroke);
		}
	}

	this.Context.lineWidth = this.StrokeWidth;
	this.Context.lineCap = this.LineCap;
	this.Context.lineJoin = this.LineJoin;
	this.Context.miterLimit = this.MiterLimit;

	this.Inheritance.push({
		Element : element,
		Fill : this.Fill,
		FillOpacity : this.FillOpacity,
		Stroke : this.Stroke,
		StrokeWidth : this.StrokeWidth,
		StrokeOpacity : this.StrokeOpacity,
		LineCap: this.LineCap,
		LineJoin: this.LineJoin,
		MiterLimit: this.MiterLimit,
		Transforms : transforms
	});
};

CanvaSVGDocument.prototype.PostProcessContainer = function (element) {
	var current = this.Inheritance.pop();
	var transforms = current.Transforms;

	if (this.Inheritance.length) {
		var parent = this.Inheritance[this.Inheritance.length - 1];
		this.Fill = parent.Fill;
		try {
			this.Context.fillStyle = fill;
		} catch(e) {
			//alert(e);
		}
		this.Stroke = parent.Stroke;
		try {
			this.Context.strokeStyle = this.Stroke;
		} catch(e) {
			//alert(stroke);
		}
	}

	// revert transforms
	if (hasAttribute('transform', element)) {
		while (transforms.length) {
			var t = transforms.pop();
			if (t.Type == 'scale') {				
				this.Context.scale(1/t.Sx, 1/t.Sy);			
			} else if (t.Type == 'translate') {
				this.Context.translate(-t.Tx, -t.Ty);
			} else if (t.Type == 'rotate') {
				this.Context.rotate(-t.Angle);
			}
		}
	}	
};

CanvaSVGDocument.prototype.ParseElement = function (element) {
	if (hasAttribute('id', element)) {
		this.IDs.push({
			Id : element.getAttribute('id'),
			Element : element
		});
	}
		
	var name = element.tagName;
	var handler = 'Parse_' + name;
	//alert(name);
	if (this[handler] == null) { // check if we can handle that element
		alert("알 수 없는 내부 에러");
	} else {
		if (name == 'g' || name == 'defs') {
			this.Parse(element);
		} else if (name == 'linearGradient' || name == 'radialGradient') {
			this[handler](element);
		} else {
			this.Draw(element, handler);
		}
	}
};

/***************************** rect parse *********************************/

CanvaSVGDocument.prototype.Parse_rect = function (rect) {	
	//alert("B");
	var w = hasAttribute('width', rect) ? Number(rect.getAttribute('width')) : 0;
	var h = hasAttribute('height', rect) ? Number(rect.getAttribute('height')) : 0;
	var x = hasAttribute('x', rect) ? Number(rect.getAttribute('x')) : 0;
	var y = hasAttribute('y', rect) ? Number(rect.getAttribute('y')) : 0;	
	w = getPixel2(w);
	h = getPixel2(h);
	x = getPixel2(x);
	y = getPixel2(y);	
	// check width and height to be negative
	if (w < 0 || h < 0) {
		//alert('Attributes "width" and "height" must have a positive value');
		return;	
	}
	// check width and height to be zero
	if (w == 0 || h == 0) {
		//alert('Attributes "width" or "height" with value zero disable rendering');
		return;
	}
	
	this.DrawRect(x,y,w,h);	
};

CanvaSVGDocument.prototype.DrawRect = function (x,y,w,h) {
	
	this.Context.beginPath();
	this.Context.rect(x,y,w,h);	
	this.Context.closePath();
};

/***************************** rect parse *********************************/

/***************************** text parse *********************************/

CanvaSVGDocument.prototype.Parse_text = function (text) {
	//alert("C");
	var x = hasAttribute('x', text) ? Number(text.getAttribute('x')) : 0;
	var y = hasAttribute('y', text) ? Number(text.getAttribute('y')) : 0;
	var font_family = hasAttribute('font-family', text) ? text.getAttribute('font-family') : "Gulim";	
	var font_size = hasAttribute('font-size', text) ? Number(text.getAttribute('font-size')) : 10;
	var fill = hasAttribute('fill', text) ? text.getAttribute('fill') : "black";
	var text_anchor = hasAttribute('text-anchor', text) ? text.getAttribute('text-anchor') : "middle";

	x = getPixel2(x);
	y = getPixel2(y);

	this.DrawText(x, y, font_family, font_size, fill, text_anchor, this.w, this.h, text.firstChild.nodeValue);	
};

CanvaSVGDocument.prototype.DrawText = function (x, y, font_family, font_size, fill, text_anchor, w, h, text) {
	//alert(text);
	if(brow) {
		this.Context.text(x, y, font_family, font_size, fill, text_anchor, w, h, text);	
	} else {		
		var container = document.createElement('div');
		var label = document.createElement('div');
		//color direction fontFamily fontSize fontSizeAdjust fontStretch fontStyle fontVariant fontWeight letterSpacing lineHeight textAlign textDecoration textIndent textShadow textTransform unicodeBidi whiteSpace wordSpacing
		
		var svgTextString = '';
		if(text_anchor == "middle") {
			svgTextString = '&nbsp;&nbsp;' + text + '&nbsp;&nbsp;';
		} else if(text_anchor == "end") {
			svgTextString = '&nbsp;&nbsp;&nbsp;&nbsp;' + text;
		} else {
			svgTextString = text + '&nbsp;&nbsp;&nbsp;&nbsp;';
		}

		label.innerHTML = svgTextString;	
		
		container.style.position = 'absolute';		
				
		label.style.position = 'absolute';
		label.style.fontSize = font_size;
		label.style.color = fill;
		label.style.fontFamily = font_family;		
		label.style.left = x;
		label.style.top = y;
		
		this.container.appendChild(container.appendChild(label));
		this.labels.push(label);
	}
};

/***************************** text parse *********************************/

/***************************** line parse *********************************/

CanvaSVGDocument.prototype.Parse_line = function (line) {
	var x1 = hasAttribute('x1', line) ? Number(line.getAttribute('x1')) : 0;
	var y1 = hasAttribute('y1', line) ? Number(line.getAttribute('y1')) : 0;
	var x2 = hasAttribute('x2', line) ? Number(line.getAttribute('x2')) : 0;
	var y2 = hasAttribute('y2', line) ? Number(line.getAttribute('y2')) : 0;
	x1 = getPixel2(x1);
	y1 = getPixel2(y1);
	x2 = getPixel2(x2);
	y2 = getPixel2(y2);
	this.DrawLine(x1, y1, x2, y2);
};

CanvaSVGDocument.prototype.DrawLine = function (x1, y1, x2, y2) {
	this.Context.beginPath();
	this.Context.moveTo(x1,y1);
	this.Context.lineTo(x2, y2);
};

/***************************** line parse *********************************/

/***************************** circle parse *********************************/

CanvaSVGDocument.prototype.Parse_circle = function (circle) {
	// get specified geometry attributes' values or revert to default
	var cx = hasAttribute('cx', circle) ? Number(circle.getAttribute('cx')) : 0;
	var cy = hasAttribute('cy', circle) ? Number(circle.getAttribute('cy')) : 0;
	var r = hasAttribute('r', circle) ? Number(circle.getAttribute('r')) : 0;
	cx = getPixel2(cx);
	cy = getPixel2(cy);
	r = getPixel2(r);
	// check radius to be negative
	if (r < 0) {
		//alert('Attribute "r" must have a positive value');
		return;	
	}
	// check radius to be zero
	if (r == 0) {
		//alert('Attribute "r" with value zero disables rendering');
		return;
	}
	// draw circle
	this.DrawCircle(cx,cy,r);
};

CanvaSVGDocument.prototype.DrawCircle = function (cx,cy,r) {
	this.Context.beginPath();
	this.Context.arc(cx,cy,r,0,2*Math.PI,1);
	this.Context.closePath();
};

/***************************** circle parse *********************************/

CanvaSVGDocument.prototype.Draw = function (element, handler) {	
	var transforms = null;
	if (hasAttribute('transform', element)) {
		transforms = this.GetTransformInstructions(element.getAttribute('transform'));
		for (var i=0; i<transforms.length; i++) {
			var t = transforms[i];
			if (t.Type == 'scale') {
				this.Context.scale(t.Sx, t.Sy);			
			} else if (t.Type == 'translate') {
				this.Context.translate(t.Tx, t.Ty);
			} else if (t.Type == 'rotate') {
				this.Context.rotate(t.Angle);
			}
		}
	}

	if(element.tagName != "text") {
		if (hasAttribute('fill', element)) {
			this.Fill = element.getAttribute('fill');
			//alert(this.Fill);
			if (this.Fill.substr(0,5) == 'url(#') {
				var paint_server_id = this.Fill.substr(5,this.Fill.length-6);
				// lookup paint server in IDs table
				for (var i=0; i<this.PaintServers.length; i++) {
					if (this.PaintServers[i].Id == paint_server_id) {
						this.Fill = this.PaintServers[i].Paint;
					}
				}
			}
			try {
				this.Context.fillStyle = this.Fill;
			} catch(e) {
				//alert(stroke);
			}
		}
	} 

	if (hasAttribute('stroke-width', element)) {
		this.StrokeWidth = element.getAttribute('stroke-width');
		this.Context.lineWidth = this.StrokeWidth;
	}

	if (hasAttribute('stroke', element)) {
		this.Stroke = element.getAttribute('stroke');
		try {
			this.Context.strokeStyle = this.Stroke;
		} catch(e) {
			//alert(stroke);
		}
	}

	// lineCap	
	if (hasAttribute('stroke-linecap', element)) {
		this.LineCap = element.getAttribute('stroke-linecap');
		try {
			this.Context.lineCap = this.LineCap;
		} catch(e) {			
		}
	}

	// lineJoin	
	if (hasAttribute('stroke-linejoin', element) ) {
		this.LineJoin = element.getAttribute('stroke-linejoin');
		try {
			this.Context.lineJoin = this.LineJoin;
		} catch(e) {
		}
	}

	// miterLimit	
	if (hasAttribute('stroke-miterlimit', element)) {
		this.MiterLimit = Number(element.getAttribute('miterlimit'));
		try {
			this.Context.miterLimit = this.MiterLimit;
		} catch(e) {
		}
	}
	
	var parent = this.Inheritance[this.Inheritance.length - 1];

	if (hasAttribute('fill-opacity', element)) {
		this.Context.globalAlpha = element.getAttribute('fill-opacity');
	} else {
		this.Context.globalAlpha = parent.FillOpacity;	
	}

	// draws fill if any
	if(element.tagName != "text") {
		if (this.Fill !== 'none') {		
			//alert('filling ' + element.nodeName + ' with ' + this.Fill);
			this[handler](element);		
			this.Context.fill();
		}

		// revert to previous fill if needed
		if (this.Fill !== parent.Fill) {
			this.Fill = parent.Fill;
			this.Context.fillStyle = this.Fill;
		}
	} else {
		if(brow) {
			if (this.Fill !== 'none') {		
				//alert('filling ' + element.nodeName + ' with ' + this.Fill);
				this[handler](element);		
				this.Context.fill();
			}

			// revert to previous fill if needed
			if (this.Fill !== parent.Fill) {
				this.Fill = parent.Fill;
				this.Context.fillStyle = this.Fill;
			}
		} else {
			this[handler](element);
		}
	}

	if (hasAttribute('stroke-opacity', element)) {
		this.Context.globalAlpha = element.getAttribute('stroke-opacity');
	} else {
		this.Context.globalAlpha = parent.StrokeOpacity;	
	}
	
	// draws stroke if any
	if (this.Stroke != 'none') {
		this[handler](element);
		this.Context.stroke();
	}

	// revert to previous stroke if needed
	if (this.Stroke != parent.Stroke) {
		this.Stroke = parent.Stroke;
		try {
			this.Context.strokeStyle = this.Stroke;
		} catch(e) {
			//alert(stroke);
		}
	}

	// revert to previous stroke-width
	if (this.StrokeWidth != parent.StrokeWidth) {
		this.StrokeWidth = parent.StrokeWidth;
		this.Context.lineWidth = this.StrokeWidth;
	}

	// lineCap	
	if (this.LineCap != parent.LineCap) {
		this.LineCap = parent.LineCap;
		this.Context.lineCap = this.LineCap;
	}

	// lineJoin	
	if (this.LineJoin != parent.LineJoin) {
		this.LineJoin = parent.LineJoin;
		this.Context.lineJoin	= this.LineJoin;
	}

	// miterLimit	
	if (this.MiterLimit != parent.MiterLimit) {
		this.MiterLimit = parent.MiterLimit;
		this.Context.miterLimit = this.MiterLimit;
	}

	// revert transforms
	if (hasAttribute('transform', element)) {
		while (transforms.length) {
			var t = transforms.pop();
			if (t.Type == 'scale') {
				// watch out for 0
				this.Context.scale(1/t.Sx, 1/t.Sy);			
			} else if (t.Type == 'translate') {
				this.Context.translate(-t.Tx, -t.Ty);
			} else if (t.Type == 'rotate') {
				this.Context.rotate(-t.Angle);
			}
		}
	}

};