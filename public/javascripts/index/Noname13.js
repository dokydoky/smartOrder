var g_string = "";
function chartGallery(width,height) {
	//�� �ҽ��ȿ����� ��� ��Ʈũ�⳪ ���̿� ���� ���� ���� �ʺ� �������� ������� ũ��� ���Ǿ� �ִ�. �̴� ������ �ݺ����� �׽�Ʈ ��� �ְ������� �����ϴ� �ǴܵǾ� ������ �����̴�.
	g_string = "";
	this.width = width;
	this.height = height;
	this.position;
	this.type;
	this.k;
	this.scaleX1;
	this.scaleX2;
	this.CoordY1;
	this.CoordY2;
	this.xwid;
	this.ywid;
	this.sa;
	
	//��ü ������ 10%�κ��� Ÿ��Ʋ �������� ��´�
	this.titleHeight = height * 0.1;

	//�ʱ� ũ�� ����
	g_string = g_string + "<xml width=\""+getPixel(width)+"\" height=\""+getPixel(height)+"\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";	
	
	//������ �迭
	this.obj = new Array();
	this.objCount = new Array();
	
	//�޼ҵ� ����Ʈ
	this.makeChartTitle = createChartTitle;
	this.makeCanvas = createCanvas;
	this.make2DCoordinates = create2DCoordinates;
	//this.make3DCoordinates = create3DCoordinates;
	this.make2DScale = create2DScale;
	//this.make3DScale = create3DScale;
	this.makeLegend = createLegend;
	this.makeBar = createBar;
	//this.make3DBar = create3DBar;
	this.makeLine = createLine;
	//this.make3DLine = create3DLine;
	//this.makePie3D = createPie3D;
	//this.makeDiscreatePie3D = createDiscreatePie3D;
	this.addData = createData;
	this.display = display;	
}

function createChartTitle(title,bgcolor,fontcolor) {
	//���� �ֻ�� �κ��� 0cm, 0cm�̴�. �̰� �������� ���õ� ũ�⸸ŭ �簢���� �׷��� �� �κ��� �׷��� �������� �Ѵ�. �׷��� �� �żҵ�� ������ ����� �κ��̹Ƿ� ������ �׷��� �������� ���� 10% �κ��� ����κ����� �������ش�.
	var fontSize;
	
	if(typeof bgcolor != 'string') {
		bgcolor = "white";
	}
	if(typeof fontcolor != 'string') {
		fontcolor = "black";
	}	
	g_string = g_string + "<rect x=\"0\" y=\"0\" width=\""+getPixel(this.width)+"\" height=\""+getPixel(this.titleHeight)+"\" fill=\""+bgcolor+"\" ></rect>";

	//���� 10�϶� 25����Ʈ�� �������� ��� ��밪�� �����Ѵ�.
	fontSize = Math.round(2.5 * this.height);
	
	g_string = g_string + "<text x=\""+getPixel(this.width * 0.5)+"\" y=\""+getPixel(this.height*0.075)+"\" font-family=\"Gulim\" font-size=\""+fontSize+"\" fill=\""+fontcolor+"\"  text-anchor=\"middle\">"+title+"</text>";	
}

function createCanvas(bgcolor) {
	//������ �׷��� �������� ���񿵿��� �� ������ �κ��� ������ �ش�
	if(typeof bgcolor != 'string') {
		bgcolor = "white";
	}
	
	g_string = g_string + "<rect x=\"0\" y=\"0\" width=\""+getPixel(this.width)+"\" height=\""+getPixel(this.height)+"\" fill=\""+bgcolor+"\" stroke=\"grey\" stroke-width=\""+getPixel(0.001)+"\" ></rect>\n";	
}

function create2DScale(type,num) {
	//���� 2D 3D �� ���� �ʿ䰡 ������ ������ �������� ��������� ��а��� �и��ϴ°� ���ڴٴ� �Ǵ��� �����. num ������ ���� ������ ������ 2 ,5, 10 ���� �ϴ� ���� �����Ѵ�. 
	var maxValue=0,maxValue2=0,maxValue3=0;
	var yValue="1";	
	var i = 0, k = 0, j= 0;
	this.type = type;
	var arr;

	if(num > 0) {
	} else {
		num = 10;
	}	
	
	//�� �κ��� �׷����� ���Ŀ� ���� y�� ���� �޶����� �ϱ⿡ �б�Ǵ� �κ��̴�. 1������ y�� ���� �����Ǳ⿡ �� �÷���� �ϰ� 2������ x���� ���� ����Ǵ� ���̱⿡ ���� y���� �����ؾ� �ϱ� �����̴�.
	if(type == "1") {
		for(i=0;i<this.objCount.length;i++) {
			if(i==0) {
				maxValue2 = this.objCount[i];
			} else {
				if(maxValue2 >= parseInt(this.objCount[i])) {
				} else {
					maxValue2 = this.objCount[i];
				}
			}
		}	

		for(i = 0;i < maxValue2;i++) {
			maxValue3 = 0;
			for(j=0;j<this.objCount.length;j++) {
				arr = this.obj[j];
				maxValue3 = maxValue3 + parseInt(arr[i][1]);
			}
			
			if(maxValue >= maxValue3) {
			} else {
				maxValue =  maxValue3;
			}	
			k++;
			
		}
	} else {
		for(j = 0;j < this.objCount.length;j++) {
			arr = this.obj[j];		
			for(i = 0;i < this.objCount[j];i++) {			
				if(maxValue >= parseInt(arr[i][1])) {
				} else {
					maxValue = arr[i][1];
				}	
				k++;
			}		
		}
	}
	
	this.k = k;

	////////////////////////�������� ���� ���� ���� �κ�//////////////////////////////////
	//������ �迭�� ���� �ִ밪�� �������� �Ѵ�. �� ���� ���α׸� ���� �� ���ڸ�ŭ 1���ٰ� 0�� �����ָ� 10 100 1000 10000 �̷������� ���� �������⿡ �� �ڵ带 �����ߴ�
	for(i=0;i<Math.ceil((Math.LOG10E)*(Math.log(maxValue)));i++) {
		yValue = yValue + "0";
	}
	var c = i;

	//10 100 1000 �̷������� �Ǹ� �ʹ� ������ Ŀ���� ��찡 ���� 5 50 500 �̷��� ũ�⸦ �� �ٿ������� ������ �κ��̴�.
	if(yValue/2 > maxValue) {
		yValue = yValue/2;
		c=i-1;
	}
	this.yValue = yValue;
	yValue = yValue/num;

	yValue = Math.round(yValue);
	
	var cc="1",strc="";
	for(var ii=0;ii<c-2;ii++) {
		cc = cc + "0";
	}

	//////////////////////////////////////////////////////////////////////////////////
	
	var fontSize = this.height;

	for(i=0;i<num;i++) {
		g_string = g_string + "<line x1=\""+getPixel(this.scaleX1)+"\" y1=\""+getPixel(((this.CoordY2-this.CoordY1)/num*i)+this.CoordY1)+"\" x2=\""+getPixel(this.scaleX1*0.9)+"\" y2=\""+getPixel(((this.CoordY2-this.CoordY1)/num*i)+this.CoordY1)+"\" stroke=\"black\" stroke-width=\"0.2\" ></line>\n";

		//��� �Ǵ� �κ��ε� ���ڰ� Ŀ���� y�� ������ ������ ��� ���ڿ� ������ �������� ���� ������ y�� ��ܿ� (����:strc) ��� ������ ���ְ� y���� ���ڱ��̴� 4�ڸ��� �����ϱ� ���� �����ߴ�
		if(c > 3) {
			if(i==0) {
				switch(cc) {
					case "10":
						strc = "��";
						break;
					case "100":
						strc = "��";
						break;
					case "1000":
						strc = "õ";
						break;
					case "10000":
						strc = "��";
						break;
					case "100000":
						strc = "�ʸ�";
						break;
					case "100000":
						strc = "�鸸";
						break;
					case "100000":
						strc = "õ��";
						break;
					case "100000":
						strc = "��";
						break;
				}
				g_string = g_string + "<text x=\""+getPixel(this.scaleX1*0.9)+"\" y=\""+getPixel(this.CoordY1-(this.height * 0.04))+"\" font-family=\"Gulim\" font-size=\""+fontSize+"\" fill=\"black\" text-anchor=\"end\">("+"���� : "+strc+")</text>\n";
			}
			g_string = g_string + "<text x=\""+getPixel(this.scaleX1*0.9)+"\" y=\""+getPixel(((this.CoordY2-this.CoordY1)/num*i)+this.CoordY1)+"\" font-family=\"Gulim\" font-size=\""+fontSize+"\" fill=\"black\" text-anchor=\"end\">"+((yValue*(num-i))/cc)+"</text>\n";
		} else {
			g_string = g_string + "<text x=\""+getPixel(this.scaleX1*0.9)+"\" y=\""+getPixel(((this.CoordY2-this.CoordY1)/num*i)+this.CoordY1)+"\" font-family=\"Gulim\" font-size=\""+fontSize+"\" fill=\"black\" text-anchor=\"end\">"+(yValue*(num-i))+"</text>\n";
		}
	}	
	g_string = g_string + "<text x=\""+getPixel(this.scaleX1*0.9)+"\" y=\""+getPixel(this.CoordY2)+"\" font-family=\"Gulim\" font-size=\""+fontSize+"\" fill=\"black\" text-anchor=\"end\">0</text>\n";	
}

function create2DCoordinates(type,XYval,position) {
	if(typeof type != 'string') {
		type = "NONE";
	}	
	
	var btext;
	if(typeof XYval == "object" && XYval != null) {
		btext = true;
	} else {
		btext = false;
	}

	//���� ��ġ�� ���� ���� ��ġ�� �޶����⿡ �����Ѵ�.
	if(typeof position != 'string') {
		position = "RIGHT_TOP";
	} else {
		position = position.toUpperCase();
	}
	
	var scaleX1,scaleX2,CoordY1,CoordY2,axisTextX1,axisTextY1,axisTextX2,axisTextY2;
	switch(position) {
		case "RIGHT_TOP":
			if(btext) {				
				scaleX1 = this.width * 0.12;
				scaleX2 = this.width * 0.8;
				CoordY1 = (this.height - this.titleHeight) / 5;
				CoordY2 = (this.height - this.titleHeight) * 0.95;
				axisTextX1 = this.width * 0.85 * 0.5;
				axisTextY1 = this.height * 0.45;
				axisTextX2 = this.width * 0.047;
				axisTextY2 = this.height * 0.97;
			} else {
				scaleX1 = this.width * 0.1;
				scaleX2 = this.width * 0.8;
				CoordY1 = (this.height - this.titleHeight) / 5;
				CoordY2 = this.height * 0.8;
			}
			break;
		case "RIGHT_BOTTOM":
			if(btext) {				
				scaleX1 = this.width * 0.12;
				scaleX2 = this.width * 0.8;
				CoordY1 = (this.height - this.titleHeight) / 5;
				CoordY2 = (this.height - this.titleHeight) * 0.95;
				axisTextX1 = this.width * 0.85 * 0.5;
				axisTextY1 = this.height * 0.45;
				axisTextX2 = this.width * 0.047;
				axisTextY2 = this.height * 0.97;
			} else {
				scaleX1 = this.width * 0.1;
				scaleX2 = this.width * 0.8;
				CoordY1 = (this.height - this.titleHeight) / 5;
				CoordY2 = this.height * 0.8;
			}
			break;
		case "BOTTOM":
			if(btext) {				
				scaleX1 = this.width * 0.12;
				scaleX2 = this.width * 0.9;
				CoordY1 = (this.height - this.titleHeight) / 5;
				CoordY2 = (this.height - this.titleHeight) * 0.8;
				axisTextX1 = this.width * 0.5;
				axisTextY1 = this.height * 0.4;
				axisTextX2 = this.width * 0.047;
				axisTextY2 = this.height * 0.85;
			} else {
				scaleX1 = this.width * 0.1;
				scaleX2 = this.width * 0.9;
				CoordY1 = (this.height - this.titleHeight) / 5;
				CoordY2 = this.height * 0.8;
			}
			break;
		case "LEFT_BOTTOM":
			if(btext) {				
				scaleX1 = this.width * 0.12 * 1.2;
				scaleX2 = this.width * 0.8 * 1.2;
				CoordY1 = (this.height - this.titleHeight) / 5;
				CoordY2 = (this.height - this.titleHeight) * 0.95;
				axisTextX1 = this.width * 0.85 * 0.5 * 1.2;
				axisTextY1 = this.height * 0.45;
				axisTextX2 = this.width * 0.047 * 2.5;
				axisTextY2 = this.height * 0.97;
			} else {
				scaleX1 = this.width * 0.1 * 1.2;
				scaleX2 = this.width * 0.8 * 1.2;
				CoordY1 = (this.height - this.titleHeight) / 5;
				CoordY2 = this.height * 0.8;
			}
			break;
		case "NONE":
			if(btext) {				
				scaleX1 = this.width * 0.12;
				scaleX2 = this.width * 0.9;
				CoordY1 = (this.height - this.titleHeight) / 5;
				CoordY2 = (this.height - this.titleHeight) * 0.95;
				axisTextX1 = this.width * 0.5;
				axisTextY1 = this.height * 0.45;
				axisTextX2 = this.width * 0.047;
				axisTextY2 = this.height * 0.97;
			} else {
				scaleX1 = this.width * 0.1;
				scaleX2 = this.width * 0.9;
				CoordY1 = (this.height - this.titleHeight) / 5;
				CoordY2 = this.height * 0.85;
			}
			break;
		default:
			if(btext) {				
				scaleX1 = this.width * 0.12;
				scaleX2 = this.width * 0.8;
				CoordY1 = (this.height - this.titleHeight) / 5;
				CoordY2 = (this.height - this.titleHeight) * 0.95;
				axisTextX1 = this.width * 0.85 * 0.5;
				axisTextY1 = this.height * 0.45;
				axisTextX2 = this.width * 0.047;
				axisTextY2 = this.height * 0.97;
			} else {
				scaleX1 = this.width * 0.1;
				scaleX2 = this.width * 0.8;
				CoordY1 = (this.height - this.titleHeight) / 5;
				CoordY2 = this.height * 0.8;
			}
	}

	this.position = position;
	this.scaleX1 = scaleX1;
	this.scaleX2 = scaleX2;
	this.CoordY1 = CoordY1;
	this.CoordY2 = CoordY2;

	var dashWidth;	
	switch(type) {
		case "NONE":
			break;
		case "DASH":
			dashWidth = scaleX2 - scaleX1;
			if(bAutoScale) {
				for(var i=0;i<10;i++) {
				//	g_string = g_string + "<line x1=\""+scaleX+"cm\" y1=\""+this.scaleY[i]+"cm\" x2=\""+dashWidth+"cm\" y2=\""+this.scaleY[i]+"cm\" style=\"stroke-dasharray: 10, 10;\" stroke=\"black\" stroke-width=\"0.1\" />";
				}
			}
			break;
		default:
	}	 
	
	if(type != "HIDDEN") {

		if(btext) { //x y �� ������ �����Ǿ� �ִٸ�	
			var fontSize = Math.round(1.2 * this.height);
			
			g_string = g_string + "<text font-family=\"Gulim\" font-size=\""+fontSize+"\" fill=\"black\" text-anchor=\"middle\" x=\""+getPixel(axisTextX1)+"\" y=\""+getPixel(axisTextY2)+"\" >\n";
			g_string = g_string + XYval[0];
			g_string = g_string + "</text>\n";

			g_string = g_string + "<text font-family=\"Gulim\" font-size=\""+fontSize+"\" fill=\"black\" text-anchor=\"middle\" glyph-orientation-vertical=\"0\" writing-mode=\"tb\" x=\""+getPixel(axisTextX2)+"\" y=\""+getPixel(axisTextY1)+"\">\n";
			g_string = g_string + XYval[1];
			g_string = g_string + "</text>\n";			
		} 
		
		//���μ�
		g_string = g_string + "<line x1=\""+getPixel(scaleX1)+"\" y1=\""+getPixel(CoordY1)+"\" x2=\""+getPixel(scaleX1)+"\" y2=\""+getPixel(CoordY2)+"\" stroke=\"black\" stroke-width=\"0.2\"  ></line>\n";
		//���μ�
		g_string = g_string + "<line x1=\""+getPixel(scaleX1)+"\" y1=\""+getPixel(CoordY2)+"\" x2=\""+getPixel(scaleX2)+"\" y2=\""+getPixel(CoordY2)+"\" stroke=\"black\" stroke-width=\"0.2\"  ></line>\n";	
	}
	
}

function createLegend(val) {	
	
	var labelRectX,labelTextX,mHeight,labelRectY,bottomy;
	var labelRectWidth = this.width * 0.02;
	var labelRectHeight = this.height * 0.021;
	var count = val.length;
	
	if(this.position != "NONE") {
		switch(this.position) {
			case "RIGHT_TOP":
				labelRectX = this.scaleX2 + ((this.width-this.scaleX2) * 0.2);
				mHeight = labelRectHeight * 0.83;
				labelRectY = this.height*0.03;
				labelTextX = labelRectX + labelRectWidth;
				bottomy = 0;
				break;
			case "RIGHT_BOTTOM":
				labelRectX = this.scaleX2 + ((this.width-this.scaleX2) * 0.2);
				mHeight = labelRectHeight * 0.83;
				labelRectY = this.height*0.03; 
				labelTextX = labelRectX + labelRectWidth;
				bottomy = (this.height-this.titleHeight)/2;
				break;
			case "BOTTOM":
				labelRectX = this.scaleX2 + ((this.width-this.scaleX2) * 0.2);
				mHeight = labelRectHeight * 0.83;
				labelRectY = this.height*0.03; 
				labelTextX = labelRectX + labelRectWidth;
				bottomy = (this.height-this.titleHeight)/2;
				break;
			case "LEFT_BOTTOM":
				labelRectX = this.scaleX2 + ((this.width-this.scaleX2) * 0.2);
				mHeight = labelRectHeight * 0.83;
				labelRectY = this.height*0.03; 
				labelTextX = labelRectX + labelRectWidth;
				bottomy = (this.height-this.titleHeight)/2;
				break;		
			default:
				labelRectX = this.scaleX2 + ((this.width-this.scaleX2) * 0.2);
				mHeight = labelRectHeight * 0.83;
				labelRectY = this.height*0.03;
				labelTextX = labelRectX + labelRectWidth;
				bottomy = 0;
		}		

		//�Ϲ������� 10�������� ���̸� �������� �Ѵ�. �׺��� �������� 10���� �������� ������� ũ�⸦ �����Ѵ�.
		if(count > 10) {
			for(var i = 0;i < count;i++) {
				g_string = g_string + "<rect x=\""+getPixel(labelRectX)+"\" y=\""+getPixel(((labelRectY*(i+1)-mHeight)*10/count)+this.titleHeight+bottomy)+"\" width=\""+getPixel(labelRectWidth*10/count)+"\" height=\""+getPixel(labelRectHeight*10/count)+"\" fill=\""+val[i][0]+"\" opacity=\".8\" ></rect>";
				g_string = g_string + "<text x=\""+getPixel(labelTextX)+"\" y=\""+getPixel(((labelRectY*(i+1)-mHeight)*10/count)+this.titleHeight+bottomy)+"\" font-family=\"Gulim\" font-size=\""+(11*10/count)+"\" fill=\""+val[i][0]+"\" opacity=\".8\" text-anchor=\"start\" xml:space=\"preserve\"> "+val[i][1]+"</text>";
			}
		} else {
			for(var i = 0;i < count;i++) {
				g_string = g_string + "<rect x=\""+getPixel(labelRectX)+"\" y=\""+getPixel((labelRectY*(i+1)-mHeight)+this.titleHeight+bottomy)+"\" width=\""+getPixel(labelRectWidth)+"\" height=\""+getPixel(labelRectHeight)+"\" fill=\""+val[i][0]+"\" opacity=\".8\" ></rect>";
				g_string = g_string + "<text x=\""+getPixel(labelTextX)+"\" y=\""+getPixel((labelRectY*(i+1)-mHeight)+this.titleHeight+labelRectHeight+bottomy)+"\" font-family=\"Gulim\" font-size=\"11\" fill=\""+val[i][0]+"\" opacity=\".8\" text-anchor=\"start\" xml:space=\"preserve\"> "+val[i][1]+"</text>";
			}
		}			
	}
}

function createBar(ePoint) {	
	var x = 0, y = 0;
	var arr;
	var maxValue = 0;
	var i = 0, j = 0, by = 0, sby = 0, sbx = 0, conj=0, conj2=0, bsbx = 0, bbx = 0;
	
	for(i=0;i<this.objCount.length;i++) {
		if(i==0) {
			maxValue = this.objCount[i];
		} else {
			if(maxValue >= parseInt(this.objCount[i])) {
			} else {
				maxValue = this.objCount[i];
			}
		}
	}
	
	var objColor = randomColor(this.objCount.length);
	var arrLabel = new Array();

	var tmpx1=0,tmpx2=0;

	for(i = 0;i < maxValue;i++) {		
		y = 0;
		bsbx = 0;
		for(j=0;j<this.objCount.length;j++) {
			arr = this.obj[j];
			y = this.CoordY2 - (((this.CoordY2-this.CoordY1)* arr[i][1])/this.yValue);
				
			if(this.type=="1") { //���� ������(x ��ǥ���� �����ϰ� y��ǥ���� �����Ͽ� ������Ų��.)
				x = (this.scaleX1+(this.scaleX2 - this.scaleX1)/arr.length/4)+(i*((this.scaleX2 - this.scaleX1)/arr.length));
				sbx = ((this.scaleX2 - this.scaleX1)/arr.length)/2;
				if(j>0) {
					y = y - by;
					sby = this.CoordY2-y - by;
				} else {
					sby = this.CoordY2-y;
				}
			} else if(this.type=="2") {  //���� ������(y��ǥ���� ũ�� �״�� �����ϰ� x��ǥ�� �����Ű�� �׷캰�δ� ������ ���ش�.)		
			
				tmpx1 = (((this.scaleX2 - this.scaleX1) - (((this.scaleX1+(this.scaleX2 - this.scaleX1)/arr.length/4) - this.scaleX1) * 2)) * 0.75)/arr.length;
				if(parseInt(arr.length) > 1) {
					tmpx2 = (((this.scaleX2 - this.scaleX1) - (((this.scaleX1+(this.scaleX2 - this.scaleX1)/arr.length/4) - this.scaleX1) * 2)) * 0.25)/(arr.length - 1);
				}
				
				sbx = tmpx1/(this.k/arr.length);
				x = (i*tmpx1) + ((this.scaleX1+(this.scaleX2 - this.scaleX1)/arr.length/4) + (i*tmpx2));
				
				sby = this.CoordY2-y;
				if(j>0) {
					x = x + (sbx * j);
				}				
			}			

			var fontSize = this.height;			
			
			
			g_string = g_string + "<rect x=\""+getPixel(x)+"\" y=\""+getPixel(y)+"\" width=\""+getPixel(sbx)+"\" height=\""+getPixel(sby)+"\" fill=\""+objColor[j]+"\" onclick=\"obj_click("+arr[i][1]+")\"  opacity=\".8\"></rect>\n";
			

			if((j == this.objCount.length - 1) && ePoint) {
				g_string = g_string + "<text x=\""+getPixel(((sbx+bsbx)/2)+bbx)+"\" y=\""+getPixel(this.CoordY2+(this.height*0.03))+"\" font-family=\"Gulim\" font-size=\""+fontSize+"\" opacity=\".8\" fill=\"black\" text-anchor=\"middle\" >"+arr[i][0]+"</text>\n";
			}
			
			by = this.CoordY2-y;			
			if(this.type == "2") {
				bsbx = bsbx + sbx;
			}
			if(j <= 0) {
				bbx  = x;
			}
			
			if(i==0) {
				arrLabel[j] = new Array(objColor[j],arr[i][2]);
			}
		}		
	}
	
	this.makeLegend(arrLabel);	
}

function createLine(ePoint) {
	var x = 0, y = 0, x2 = 0, y2 = 0;
	var arr;
	var maxValue=0;
	var i = 0, j = 0;
	
	for(i=0;i<this.objCount.length;i++) {
		if(i==0) {
			maxValue = this.objCount[i];
		} else {
			if(maxValue >= parseInt(this.objCount[i])) {
			} else {
				maxValue = this.objCount[i];
			}
		}
	}

	var objColor = randomColor(this.objCount.length);
	var arrLabel = new Array();
	var fontSize = this.height;

	for(i = 0;i < maxValue-1;i++) {
		y=0;		
		for(j=0;j<this.objCount.length;j++) {
			arr = this.obj[j];			
			y = this.CoordY2 - (((this.CoordY2-this.CoordY1)* arr[i][1])/this.yValue);
			x = (((this.scaleX2 - this.scaleX1) / maxValue) * i) + this.scaleX1 + ((((this.scaleX2 - this.scaleX1) / maxValue)) / 2);

			y2 = this.CoordY2 - (((this.CoordY2-this.CoordY1)* arr[i+1][1])/this.yValue);
			x2 = (((this.scaleX2 - this.scaleX1) / maxValue) * (i + 1)) + this.scaleX1 + ((((this.scaleX2 - this.scaleX1) / maxValue)) / 2);
			
			g_string = g_string + "<line x1=\""+getPixel(x)+"\" y1=\""+getPixel(y)+"\" x2=\""+getPixel(x2)+"\" y2=\""+getPixel(y2)+"\" stroke-width=\"2\" stroke=\""+objColor[j]+"\"></line>\n";

			if(ePoint) {
				g_string = g_string + "<circle cx=\""+getPixel(x)+"\" cy=\""+getPixel(y)+"\" r=\""+0.05+"\" fill=\""+objColor[j]+"\" stroke=\""+objColor[j]+"\" ></circle>\n";
				if(j <= 0) {
					g_string = g_string + "<text x=\""+getPixel(x)+"\" y=\""+getPixel(this.CoordY2+(this.height*0.03))+"\" font-family=\"Gulim\" font-size=\""+fontSize+"\" fill=\"black\" text-anchor=\"middle\">"+arr[i][0]+"</text>\n";
				}
			}
			if(i==0) {
				arrLabel[j] = new Array(objColor[j],arr[i][2]);
			}
		}
	}
	for(j=0;j<this.objCount.length;j++) {
		arr = this.obj[j];	
		y = this.CoordY2 - (((this.CoordY2-this.CoordY1)* arr[maxValue-1][1])/this.yValue);
		x = (((this.scaleX2 - this.scaleX1) / maxValue) * (maxValue-1)) + this.scaleX1 + ((((this.scaleX2 - this.scaleX1) / maxValue)) / 2);
		if(ePoint) {
			g_string = g_string + "<circle cx=\""+getPixel(x)+"\" cy=\""+getPixel(y)+"\" r=\""+0.05+"\" fill=\""+objColor[j]+"\" stroke=\""+objColor[j]+"\" ></circle>\n";
			if(j <= 0) {
				g_string = g_string + "<text x=\""+getPixel(x)+"\" y=\""+getPixel(this.CoordY2+(this.height*0.03))+"\" font-family=\"Gulim\" font-size=\""+fontSize+"\" fill=\"black\" text-anchor=\"middle\">"+arr[i][0]+"</text>\n";
			}
		}
	}

	this.makeLegend(arrLabel);
}

function randomColor(num) {
	var i=0,j=0,k=0,n=0;
	var objColor = new Array();
	for(i=0;i<num;i++) {
		j = Math.floor(255*Math.random());
		k = Math.floor(255*Math.random());
		n = Math.floor(255*Math.random());		
		objColor[i] = "rgb("+j+","+k+","+n+")";
	}
	return objColor;
}
function getPixel(cm) {
	//svg �±� �� path �±״� cm�� �ȵǱ⿡ ��ȯ ����	
	return Math.round(cm*37.73);
}

function createData(val) {	
	var idx = this.obj.length;	
	this.obj[idx] = val;
	this.objCount[idx] = val.length;	
}

function display() {
	return g_string + "</xml>";
}