var g_string = "";
function chartGallery(width,height) {
	//이 소스안에서의 모든 폰트크기나 길이와 같은 것은 높이 너비를 기준으로 상대적인 크기로 계산되어 있다. 이는 여러번 반복적인 테스트 결과 주관적으로 적당하다 판단되어 설정한 값들이다.
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
	
	//전체 높이의 10%부분을 타이틀 영역으로 잡는다
	this.titleHeight = height * 0.1;

	//초기 크기 설정
	g_string = g_string + "<xml width=\""+getPixel(width)+"\" height=\""+getPixel(height)+"\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";	
	
	//데이터 배열
	this.obj = new Array();
	this.objCount = new Array();
	
	//메소드 리스트
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
	//왼쪽 최상단 부분이 0cm, 0cm이다. 이걸 기준으로 세팅된 크기만큼 사각형을 그려줘 그 부분을 그래프 영역으로 한다. 그런데 이 매소드는 제목을 만드는 부분이므로 설정된 그래프 영역에서 높이 10% 부분을 제목부분으로 설정해준다.
	var fontSize;
	
	if(typeof bgcolor != 'string') {
		bgcolor = "white";
	}
	if(typeof fontcolor != 'string') {
		fontcolor = "black";
	}	
	g_string = g_string + "<rect x=\"0\" y=\"0\" width=\""+getPixel(this.width)+"\" height=\""+getPixel(this.titleHeight)+"\" fill=\""+bgcolor+"\" ></rect>";

	//높이 10일때 25포인트를 기준으로 삼아 상대값을 적용한다.
	fontSize = Math.round(2.5 * this.height);
	
	g_string = g_string + "<text x=\""+getPixel(this.width * 0.5)+"\" y=\""+getPixel(this.height*0.075)+"\" font-family=\"Gulim\" font-size=\""+fontSize+"\" fill=\""+fontcolor+"\"  text-anchor=\"middle\">"+title+"</text>";	
}

function createCanvas(bgcolor) {
	//설정된 그래프 영역에서 제목영역을 뺀 나머지 부분을 정의해 준다
	if(typeof bgcolor != 'string') {
		bgcolor = "white";
	}
	
	g_string = g_string + "<rect x=\"0\" y=\"0\" width=\""+getPixel(this.width)+"\" height=\""+getPixel(this.height)+"\" fill=\""+bgcolor+"\" stroke=\"grey\" stroke-width=\""+getPixel(0.001)+"\" ></rect>\n";	
}

function create2DScale(type,num) {
	//굳이 2D 3D 로 나눌 필요가 있을까 생각해 보았지만 명시적으로 당분간은 분리하는게 좋겠다는 판단이 들었다. num 인자의 값은 제한은 없지만 2 ,5, 10 개로 하는 것을 권장한다. 
	var maxValue=0,maxValue2=0,maxValue3=0;
	var yValue="1";	
	var i = 0, k = 0, j= 0;
	this.type = type;
	var arr;

	if(num > 0) {
	} else {
		num = 10;
	}	
	
	//이 부분은 그래프의 형식에 따라 y의 값이 달라져야 하기에 분기되는 부분이다. 1형식은 y의 값이 누적되기에 더 늘려줘야 하고 2형식은 x축의 값이 변경되는 것이기에 원래 y값을 유지해야 하기 때문이다.
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

	////////////////////////스케일의 숫자 범위 설정 부분//////////////////////////////////
	//데이터 배열의 값중 최대값을 기준으로 한다. 그 값의 상용로그를 취해 그 숫자만큼 1에다가 0을 더해주면 10 100 1000 10000 이런식으로 딱딱 떨어지기에 이 코드를 삽입했다
	for(i=0;i<Math.ceil((Math.LOG10E)*(Math.log(maxValue)));i++) {
		yValue = yValue + "0";
	}
	var c = i;

	//10 100 1000 이런식으로 되면 너무 범위가 커지는 경우가 많아 5 50 500 이렇게 크기를 좀 줄여보고자 삽입한 부분이다.
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

		//없어도 되는 부분인데 숫자가 커지고 y축 제목을 설정한 경우 숫자와 제목이 겹쳐지는 문제 때문에 y축 상단에 (단위:strc) 라는 변수를 써주고 y축의 숫자길이는 4자리로 제한하기 위해 삽입했다
		if(c > 3) {
			if(i==0) {
				switch(cc) {
					case "10":
						strc = "십";
						break;
					case "100":
						strc = "백";
						break;
					case "1000":
						strc = "천";
						break;
					case "10000":
						strc = "만";
						break;
					case "100000":
						strc = "십만";
						break;
					case "100000":
						strc = "백만";
						break;
					case "100000":
						strc = "천만";
						break;
					case "100000":
						strc = "억";
						break;
				}
				g_string = g_string + "<text x=\""+getPixel(this.scaleX1*0.9)+"\" y=\""+getPixel(this.CoordY1-(this.height * 0.04))+"\" font-family=\"Gulim\" font-size=\""+fontSize+"\" fill=\"black\" text-anchor=\"end\">("+"단위 : "+strc+")</text>\n";
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

	//라벨의 위치에 따라 축의 위치가 달라지기에 설정한다.
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

		if(btext) { //x y 축 제목이 설정되어 있다면	
			var fontSize = Math.round(1.2 * this.height);
			
			g_string = g_string + "<text font-family=\"Gulim\" font-size=\""+fontSize+"\" fill=\"black\" text-anchor=\"middle\" x=\""+getPixel(axisTextX1)+"\" y=\""+getPixel(axisTextY2)+"\" >\n";
			g_string = g_string + XYval[0];
			g_string = g_string + "</text>\n";

			g_string = g_string + "<text font-family=\"Gulim\" font-size=\""+fontSize+"\" fill=\"black\" text-anchor=\"middle\" glyph-orientation-vertical=\"0\" writing-mode=\"tb\" x=\""+getPixel(axisTextX2)+"\" y=\""+getPixel(axisTextY1)+"\">\n";
			g_string = g_string + XYval[1];
			g_string = g_string + "</text>\n";			
		} 
		
		//세로선
		g_string = g_string + "<line x1=\""+getPixel(scaleX1)+"\" y1=\""+getPixel(CoordY1)+"\" x2=\""+getPixel(scaleX1)+"\" y2=\""+getPixel(CoordY2)+"\" stroke=\"black\" stroke-width=\"0.2\"  ></line>\n";
		//가로선
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

		//일반적으로 10개까지의 길이를 기준으로 한다. 그보다 많아지면 10개를 기준으로 상대적인 크기를 적용한다.
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
				
			if(this.type=="1") { //세로 누적형(x 좌표값은 동일하고 y좌표값을 변경하여 누적시킨다.)
				x = (this.scaleX1+(this.scaleX2 - this.scaleX1)/arr.length/4)+(i*((this.scaleX2 - this.scaleX1)/arr.length));
				sbx = ((this.scaleX2 - this.scaleX1)/arr.length)/2;
				if(j>0) {
					y = y - by;
					sby = this.CoordY2-y - by;
				} else {
					sby = this.CoordY2-y;
				}
			} else if(this.type=="2") {  //가로 집합형(y좌표값은 크기 그대로 유지하고 x좌표를 변경시키되 그룹별로는 간격을 없앤다.)		
			
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
	//svg 태그 중 path 태그는 cm가 안되기에 변환 목적	
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