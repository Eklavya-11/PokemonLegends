(function ($) {
	var IS_IOS = /iphone|ipad/i.test(navigator.userAgent);
	$.fn.nodoubletapzoom = function () {
		if (IS_IOS)
			$(this).bind('touchstart', function preventZoom(e) {
				var t2 = e.timeStamp
					, t1 = $(this).data('lastTouch') || t2
					, dt = t2 - t1
					, fingers = e.originalEvent.touches.length;
				$(this).data('lastTouch', t2);
				if (!dt || dt > 500 || fingers > 1) return; // not double-tap

				e.preventDefault(); // double tap - prevent the zoom
				// also synthesize click events we just swallowed up
				$(this).trigger('click').trigger('click');
			});
	};
})(jQuery);


var charSetSprite = new Image();
charSetSprite.src = cdn + "/images/charactersets/sprite/spritesheet.png?v=1.2122";

var friendsList = "";
var buffer = document.createElement('canvas');
var bufferCtx = buffer.getContext('2d');

var bIsIPhone = false;
var bIsIPad = false;
var bIsAndroid = false;

var bWildBattleIsReady = false;

var bIsLoadingWildDialog = false;
var inventory = [];
var eggs = [];
var bShowUsers = true;
var bShowFollower = true;
var isNight, visualNight = true;
var tempItem = 0;
var titleBlink = false, blinkInterval = null;
var mapWeather = "";

if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) {
	bIsIPhone = true;
	rebindClicks();
} else if (navigator.userAgent.match(/iPad/i)) {
	bIsIPad = true;
	rebindClicks();
} else if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/android/i)) {
	bIsAndroid = true;
	rebindClicks();
}


//divTip



//User Variables
var userID = '';
var userName = '';
var userSprite = '';
var userMoney = 0;

var userEvent = null;
var serverToken = '';

var userX = 0;
var userY = 0;
var userDirection = 0;
var userStepPart = 0;
var userStepX = 0;
var userStepY = 0;

//Rendering Variables
var bLoading = true;
var loadAction = "";
var tick = 0;

var ctx = null;
var cvsWidth = 0;
var cvsHeight = 0;

var tagAlong = "";
var tagAlongName = "";
var follower = null;
var battlescreen = "battlescreen";


var captchaKeypress = new Array(false, false, false, false, false, false);

//Drawing Resources
var screenResources = new Array();
var ImageResourceLoadedCount = 0;
var ImageResourceTotalCount = 0;
function ResourceImage(src, key) {
	var tempCDN = "";
	if (src.indexOf("stackpathcdn") == -1)
		tempCDN = cdn + "/";
	this.img = new Image();
	this.img.src = tempCDN + src;
	this.url = src;
	this.img.onload = loadedResource;
	this.key = key;
	ImageResourceTotalCount++;
	return this;
}

//Audio Resources
var musicResources = new Array();
var MusicResourceLoadedCount = 0;
var MusicResourceTotalCount = 0;
function ResourceMusic(src, key) {
	this.audio = null;

	MusicResourceTotalCount++;
	this.key = key;
	this.src = cdn + "/" + src;

	if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
		this.audio = new Audio();
		this.audio.src = cdn + "/" + src;
		this.audio.load();
	}
	return this;
}

var prevPlaying = "";
var prevPlayingSong = null;
var playOnceSong = null;
var soundEnabled = 0;
var musicEnabled = 0;

var effectResources = new Array();
var EffectResourceLoadedCount = 0;
var EffectResourceTotalCount = 0;
function ResourceEffect(src, key) {
	this.audio = new Audio();
	this.audio.src = src;
	//this.audio.onload = loadedEffectResource;
	this.audio.oncanplaythrough = loadedEffectResource;
	//this.audio.load();
	if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
		this.audio.load();
	}
	//this.audio.play();
	//this.audio.pause();
	this.audio.volume = 0.5;
	this.key = key;
	EffectResourceTotalCount++;
	return this;
}

//Map Variables
var currentMap = null;

var mapName = '';
var mapCode = '';
var mapID = '';
var mapWidth = 0;
var mapHeight = 0;
var mapData = null;
var mapEvents = null;
var bMapDataLoaded = false;
var bMapEventsLoaded = false;
var mapLoadedCount = 0;
var rawMapData = null;
var mapEffect = false;

var mapAbove = new Image();
var mapBase = new Image();
var mapNight = new Image();

mapAbove.onload = loadedMapImage;
mapBase.onload = loadedMapImage;

var stepsInGrass = 0;

var mapEventObjects = new Array();

//Map - runtime draw,centerMap functions
var mapLeft = 0;
var mapTop = 0;

//Charset Variables
var charsets = new Array();
var charsetLoadedCount = 0;

//Scripting Variables
var events = new Array();
var lastTriggeredEventName = "";
var lastTriggeredEventId = 0;


//User Interaction
var keyState = new Object;
keyState.up = false;
keyState.down = false;
keyState.left = false;
keyState.right = false;
keyState.btn1 = false;
keyState.btn2 = false;
keyState.btn3 = false;
var bMouseDown = false;

//###########################################################
//### SOCKET FUNCTIONS ############## Chat, Support Dialog
//###########################################################
//Sockets Variables
var foregnusers = [];
var ws = null;
var bConnected = false;
var updateTick = 0;
var messages = [];
var userOnWhichChatTab = "playerChat";

//notification
setInterval(showNotify, 90000);

function ChatMessage(isadmin, userid, username, message) {
	this.isadmin = isadmin;
	this.userid = userid;
	this.username = username;
	this.message = message;
	return this;
}

function chatKeyPress(e, chat) {
	e = e || event;
	var isP = 1; //player window

	titleBlink = false;
	if (chat == "trade") {
		isP = 2; //trade window
	} else if (chat == "help") {
		isP = 3;
	} else if (chat == "non-english") {
		isP = 6;
	} else if (chat == "moderator") {
		isP = 7;
	}

	let message = $(e.target).val();



	var unicode = e.keyCode ? e.keyCode : e.charCode
	if (unicode == 13) {
		e.preventDefault();
		if (message != "") {

			let channel = window.chat.channelBySlug(chat);
			if (channel.pm) {
				ws.send("/msg^/pm " + channel.party + " " + message + "\r\n\r\n");
				$(e.target).val("");
				setTimeout(function () { e.target.focus(); }, 50);
				return true;
			} else {

				ws.send("/msg^" + message + "|" + isP + "\r\n\r\n");
				$(e.target).val("");
				setTimeout(function () { e.target.focus(); }, 50);
				return true;
			}
		}
	}
	return false;
}

function chatBoxIsActive() {
	var curElement = document.activeElement;
	if (document.getElementById("LtxtUpdate") == curElement) {
		return true;
	}
	if (document.getElementById("PtxtUpdate") == curElement) {
		return true;
	}
	if (document.getElementById("TtxtUpdate") == curElement) {
		return true;
	}
	if (document.getElementById("HtxtUpdate") == curElement) {
		return true;
	}
	if (document.getElementById("NtxtUpdate") == curElement) {
		return true;
	}





	if (document.activeElement != null) {
		if (document.activeElement.id.indexOf('txtUpd') > -1) {
			return true;
		}
	}

	return false;
}

function titleBlinkFunc() {
	blinkInterval = setInterval(function () {
		if (titleBlink) {
			var title = document.title;
			document.title = (title == "Pokemon Legends - Explore" ? "*Your name was mentioned*" : "Pokemon Legends - Explore");
		}
	}, 1000);
}

function removeTitleBlink() {
	clearInterval(blinkInterval);
	document.title = "Pokemon Legends - Explore";
	titleBlink = false;
}

function selectChatBox() {
	if (bConnected) {
		var curElement = document.activeElement;

		// if( document.getElementById("LtxtUpdate") != curElement ) {
		// 	document.getElementById("LtxtUpdate").focus();
		// }
		if (document.getElementById("PtxtUpdate") != curElement) {
			document.getElementById("PtxtUpdate").focus();
		}
		if (document.getElementById("TtxtUpdate") != curElement) {
			document.getElementById("TtxtUpdate").focus();
		}
		if (document.getElementById("HtxtUpdate") != curElement) {
			document.getElementById("HtxtUpdate").focus();
		}
		if (document.getElementById("NtxtUpdate") != curElement) {
			document.getElementById("NtxtUpdate").focus();
		}
		/* else {
			document.getElementById("txtUpdate").blur();
			return true;
		}*/
	}
}

function showChatBox() {
	if (bConnected) {

		document.getElementById("LtxtUpdate").value = "";
		document.getElementById("PtxtUpdate").value = "";
		document.getElementById("HtxtUpdate").value = "";
		document.getElementById("NtxtUpdate").value = "";


		document.getElementById("TtxtUpdate").value = "";
		$("#mws-jui-dialog-post").dialog({
			autoOpen: false,
			title: "Chat Window",
			modal: true,
			width: "480",
			buttons: []
		});

		$("#mws-jui-dialog-post").dialog("option", { modal: false }).dialog("open");

		document.getElementById("txtUpdate").focus();
	}
}

function showUnsupportedMessage() {

	var html = "<p>Some of the functionality needed to dsplay this page correctly is missing from the browser you are using. You can continue to play but you will not be able to see or chat to other players of the game.</p>";

	document.getElementById("mws-jui-dialog-data").innerHTML = html;
	$("#mws-jui-dialog-data").dialog({
		autoOpen: false,
		title: "Partial Functionality Support Notification",
		modal: true,
		width: "480",
		buttons: []
	});

	$("#mws-jui-dialog-data").dialog("option", { modal: true }).dialog("open");

}

function rebindClicks() {



	//remove items which may be in the way
	$("#divTip").css("display", "none");
	$("#mws-header").remove();
	$("#mws-container").css("padding-top", "0px");
	$("#mws-sidebar").css("padding-top", "10px");


	$("#keyUp").bind('touchstart', function (ev) { keyState.up = true; return false; });
	$("#keyUp").bind("touchend", function (ev) { keyState.up = false; return false; });

	$("#keyLeft").bind('touchstart', function (ev) { keyState.left = true; return false; });
	$("#keyLeft").bind("touchend", function (ev) { keyState.left = false; return false; });

	$("#keyRight").bind('touchstart', function (ev) { keyState.right = true; return false; });
	$("#keyRight").bind("touchend", function (ev) { keyState.right = false; return false; });

	$("#keyDown").bind('touchstart', function (ev) { keyState.down = true; return false; });
	$("#keyDown").bind("touchend", function (ev) { keyState.down = false; return false; });

	$("#keyA").bind('touchstart', function (ev) {
		if (!chatBoxIsActive()) { keyState.btn1 = true; } return true;
	});

	$("#keyB").bind('touchstart', function (ev) {
		if (!chatBoxIsActive()) { keyState.btn2 = true; } return true;
	});


	$("#keyUp").nodoubletapzoom();
	$("#keyLeft").nodoubletapzoom();
	$("#keyRight").nodoubletapzoom();
	$("#keyDown").nodoubletapzoom();
	$("#keyA").nodoubletapzoom();
	$("#keyB").nodoubletapzoom();
	$(".container").nodoubletapzoom();
	$("#mws-container").nodoubletapzoom();





}

function preventClickEvent(event) {
	event.preventDefault();
}


//###########################################################
//### GAME FUNCTIONS ############## update, draw, centerMap
//###########################################################

function update() {
	if (bLoading) {
		if (ImageResourceLoadedCount == screenResources.length)
			if (charsetLoadedCount == charsets.length)
				if (mapLoadedCount == 2)
					if (bMapEventsLoaded && bMapDataLoaded) {
						bLoading = false;
						mapWidth = mapAbove.width;
						mapHeight = mapAbove.height;

						clearInterval(gameInterval);
						gameInterval = setInterval(function () {
							update();
							draw();
						}, 50);

					}
	} else {

		if (bConnected) {
			updateTick++;
			if (updateTick > 10) {

				var sendStr = "";

				var running = "0";
				if (keyState.btn2)
					running = "1";


				if (tagAlong != "" && follower != null) {
					sendStr = "/update^" + mapID + "^" + userEvent.mapPosition.X + "^" + userEvent.mapPosition.Y + "^" + userEvent.direction + "^" + userEvent.stepAnimation + "^" + running + "^" + (bInBattle ? "1" : "0") + "^" + tagAlong + "^" + follower.mapPosition.X + "^" + (follower.mapPosition.Y - 2) + "^" + follower.direction + "^" + follower.stepAnimation + "^" + running + "^\r\n\r\n";

				} else {
					sendStr = "/update^" + mapID + "^" + userEvent.mapPosition.X + "^" + userEvent.mapPosition.Y + "^" + userEvent.direction + "^" + userEvent.stepAnimation + "^" + running + "^" + (bInBattle ? "1" : "0") + "\r\n\r\n";
				}
				ws.send(sendStr);
				updateTick = 0;
			}
		}

		if (activeScript.length > 0) {
			scriptUpdate();
		} else if (bInBattle) {
			battleUpdate();
		} else {
			//Process input and movement.
			if (activeScript.length == 0) {
				if (userEvent.moveQueue.length == 0) {
					if (keyState.up) {
						userEvent.addMoveQueue("Up");
					} else if (keyState.down) {
						userEvent.addMoveQueue("Down");
					} else if (keyState.left) {
						userEvent.addMoveQueue("Left");
					} else if (keyState.right) {
						userEvent.addMoveQueue("Right");
					}
				}
			}

			if (keyState.btn1) {
				for (var k = 0; k < currentMap.events.length; k++) {
					var evnt = currentMap.events[k];
					if (evnt.bEventEnabled && (evnt.type == "Action Button" || evnt.type == "X1" || evnt.type == "X2" || evnt.type == "X3" || evnt.type == "X10" || evnt.type == "X15" || evnt.type == "X20") && activeScript.length == 0 && evnt.eventData.length > 0) {
						var checkX = 0;
						var checkY = 0;
						if (userEvent.direction == 0)
							checkY = -1;
						if (userEvent.direction == 1)
							checkY = 1;
						if (userEvent.direction == 2)
							checkX = -1;
						if (userEvent.direction == 3)
							checkX = 1;

						if (evnt.mapPosition.X == userEvent.mapPosition.X + checkX && evnt.mapPosition.Y == userEvent.mapPosition.Y + checkY + 2) {
							//sfx(SOUND_CONFIRM);
							if (triggerEvent(evnt, false)) {
								keyState.btn1 = false;
								return;
							}
						}
					}
				}
			}


		}

		//Evaluate our hero
		userEvent.evaluate();
		centerMap();
		currentMap.evaluateEvents(ctx);

		if (bWildBattleIsReady) {
			if (keyState.btn1 == true) {
				wipeWildMonsterBox();
				battleWildSelected();
				keyState.btn1 = false;
			}
		}
	}
}


function draw() {

	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, cvsWidth, cvsHeight);
	ctx.msImageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;

	if (bLoading) {

		var status = "Loading";
		if (tick > 2)
			status = status + ".";
		if (tick > 5)
			status = status + ".";
		if (tick > 7)
			status = status + ".";
		if (tick > 10)
			tick = 0;

		ctx.font = "bold 14px sans-serif";
		ctx.textAlign = "center";

		drawShadowText(ctx, status, cvsWidth / 2, 40);

		if (ImageResourceLoadedCount > ImageResourceTotalCount)
			ImageResourceLoadedCount = ImageResourceTotalCount;
		if (EffectResourceLoadedCount > EffectResourceTotalCount)
			EffectResourceLoadedCount = EffectResourceTotalCount;

		status = ImageResourceLoadedCount + " of " + ImageResourceTotalCount + " images loaded";
		drawShadowText(ctx, status, cvsWidth / 2, 65);

		status = EffectResourceLoadedCount + " of " + EffectResourceTotalCount + " sound effects loaded";
		drawShadowText(ctx, status, cvsWidth / 2, 85);






	} else {

		//context.drawImage(img,sx,sy,swidth,sheight,dx,dy,dwidth,dheight);
		var drawWidth = mapWidth > cvsWidth ? cvsWidth : mapWidth;
		var drawHeight = mapHeight > cvsHeight ? cvsHeight : mapHeight;
		
		if (drawHeight > mapHeight + (-mapTop - cvsHeight) - 130)
			drawHeight = mapHeight + (-mapTop - cvsHeight) - 130;

		if (drawWidth > mapWidth + mapLeft) {
			drawWidth = mapWidth + mapLeft;
		}
		
		//sharks fix - ff
		if (drawHeight > cvsHeight)
			drawHeight = cvsHeight;
		if (drawWidth > cvsWidth)
			drawWidth = cvsWidth;

		let baseX = -mapLeft;
		let baseY = -(-mapTop - cvsHeight) + 130;

		if( baseY < 0 ) {
			drawHeight += Math.abs(baseY);
		}
		if( baseX < 0 ) {
			drawWidth += Math.abs(baseX);
		}

		//Draw Base Layer
		ctx.drawImage(mapBase, baseX, baseY, drawWidth, drawHeight, 0, 0, drawWidth, drawHeight);

		currentMap.drawEvents(ctx, "below");
		userEvent.drawImage(ctx);

		if (!mapEffect && 1 == 2) {
			if (mapWeather == "Rain")
				currentMap.drawRain(ctx);
			else if (mapWeather == "Hail")
				currentMap.drawSnow(ctx);

			mapEffect = true; //so that it is called only once - there's a setInterval on the functions
		}

		currentMap.drawEvents(ctx, "above");


		//Draw Above Layer


		ctx.drawImage(mapAbove, baseX, baseY, drawWidth, drawHeight, 0, 0, drawWidth, drawHeight);
		if (isNight == 2 && visualNight)
			ctx.drawImage(mapNight, baseX, baseY, drawWidth, drawHeight, 0, 0, drawWidth, drawHeight);

		currentMap.drawNames(ctx);


		if (bMagnify) {
			bufferCtx.fillStyle = "#000000";
			bufferCtx.fillRect(0, 0, cvsWidth, cvsHeight);

			var halfWidth = ctx.canvas.width / 2;
			var halfHeight = ctx.canvas.height / 2;

			var difX = 0;
			//need to account for both the outer area of the screen and the inner distance to the edge of the map
			//edge of the map
			if (currentMap.mapWidth < ctx.canvas.width) {
				difX = (ctx.canvas.width - currentMap.mapWidth);
			} else {

			}

			let left =  (halfWidth / 2) + (userEvent.offsetX / 2) +  difX;
			let top =  (halfHeight / 2) + (userEvent.offsetY / 2);

			left = (mapLeft + userEvent.mapPosition.X * 16) - halfWidth/2 + userStepX/2;
			top = ((-mapTop - cvsHeight - 130) + userEvent.mapPosition.Y * 16) - halfHeight/2 + userStepY/2;
				
			let stepX = 0;
			let stepY = 0;
			if (userEvent.direction == 0) {
				stepY = userEvent.stepPart;
			} else if (userEvent.direction == 1) {
				stepY = -userEvent.stepPart;
			} else if (userEvent.direction == 2) {
				stepX = userEvent.stepPart;
			} else if (userEvent.direction == 3) {
				stepX = -userEvent.stepPart;
			}
			left-=stepX;
			top-=stepY;

			bufferCtx.drawImage(ctx.canvas, left, top, halfWidth, halfHeight, 0, 0, cvsWidth, cvsHeight);

			/* Awesome work Brad */
			bufferCtx.msImageSmoothingEnabled = false;
			bufferCtx.mozImageSmoothingEnabled = false;
			bufferCtx.webkitImageSmoothingEnabled = false;
			bufferCtx.imageSmoothingEnabled = false;

			ctx.fillStyle = "#000000";
			ctx.fillRect(0, 0, cvsWidth, cvsHeight);
			ctx.drawImage(bufferCtx.canvas, 0, 0, cvsWidth, cvsHeight);

		}

		ctx.font = "bold 12px sans-serif";
		ctx.textAlign = "left";
		drawShadowText(ctx, mapName + " (" + ((isNight == 2) ? "Night" : "Day") + " - " + mapWeather + ")", 10, cvsHeight - 15);
		//ctx.textAlign = "left";
		//drawShadowText(ctx,"Use Arrow Keys to move and Battle. Confirm with X, Cancel with Z.",10, cvsHeight-25);

		ctx.textAlign = "right";
		drawShadowText(ctx, "Username: " + userName, cvsWidth - 27, cvsHeight - 45);

		ctx.textAlign = "right";
		if (bConnected)
			drawShadowText(ctx, "Connected: True", cvsWidth - 27, cvsHeight - 30);
		else
			drawShadowText(ctx, "Connected: False", cvsWidth - 27, cvsHeight - 30);

		drawShadowText(ctx, userCount + " Trainers Online", cvsWidth - 27, cvsHeight - 15);

		ctx.textAlign = "right";
		drawShadowText(ctx, "Currency: " + userMoney + "Â¢", cvsWidth - 27, 20);

		if (bInBattle) {
			battleDraw();
		}

		if (activeScript.length > 0) {
			scriptDraw();
		}


		if (eggs.length > 0) {
			var egg = resourceByKey("pokemonegg");
			for (var i = 0; i < eggs.length; i++) {
				ctx.drawImage(egg, -25 + (i * 30), cvsHeight - 100);
			}
		}

	}

	tick++;


}

function centerMap() {
	var MyX = userEvent.mapPosition.X * 16;
	var MyY = userEvent.mapPosition.Y * 16;

	var winSize = new Object;
	winSize.Width = cvsWidth;
	winSize.Height = cvsHeight;

	var xTmp = Math.max(MyX, cvsWidth / 2);
	var yTmp = Math.max(MyY, cvsHeight / 2);
	xTmp = Math.min(xTmp, mapWidth - winSize.Width / 2);
	yTmp = Math.min(yTmp, mapHeight - winSize.Height / 2);

	let actualPosition = new Object;
	actualPosition.X = xTmp;
	actualPosition.Y = yTmp;

	let centerOfView = new Object;
	centerOfView.X = cvsWidth / 2;
	centerOfView.Y = cvsHeight / 2;

	let viewPoint = new Object;
	viewPoint.X = centerOfView.X - actualPosition.X;
	viewPoint.Y = centerOfView.Y - actualPosition.Y;

	if( winSize.Width > mapWidth ) {
		viewPoint.X = winSize.Width / 2 - mapWidth / 2;
	}
	if( winSize.Height > mapHeight ) {
		viewPoint.Y = winSize.Height / 2 - mapHeight / 2;
	}

	if (userEvent.direction == 0) {
		userStepY = userEvent.stepPart;
	} else if (userEvent.direction == 1) {
		userStepY = -userEvent.stepPart;
	} else if (userEvent.direction == 2) {
		userStepX = userEvent.stepPart;
	} else if (userEvent.direction == 3) {
		userStepX = -userEvent.stepPart;
	}

	//TODO: Check mapSize Worked
	if (MyX - userStepX > mapWidth - cvsWidth / 2) {
		userStepX = 0;
	}
	if (MyX - userStepX < cvsWidth / 2) {
		userStepX = 0;
	}

	if (MyY - userStepY > mapHeight - cvsHeight / 2) {
		userStepY = 0;
	}
	if (MyY - userStepY < cvsHeight / 2) {
		userStepY = 0;
	}

	var additionalDown = -cvsHeight - mapHeight / 8;
	mapLeft = viewPoint.X + userStepX;
	mapTop = (viewPoint.Y + userStepY) * -1 + additionalDown;


	//User position should update as if it was an event, theirfore it should not be done in this function but rather in the gameEvent Class.
}



//###########################################################
//### RENDERING FUNCTIONS ##############
//###########################################################

//drawShadowText(context,text,postionX,positionY)
function drawShadowText(ctx, text, posX, posY, color) {

	ctx.fillStyle = 'black';
	ctx.fillText(text, posX + 1, posY - 1);
	ctx.fillText(text, posX - 1, posY - 1);
	ctx.fillText(text, posX + 1, posY + 1);
	ctx.fillText(text, posX - 1, posY + 1);
	if (!color)
		color = 'white';

	ctx.fillStyle = color;
	ctx.fillText(text, posX, posY);

}

//###########################################################
//### AJAX FUNCTIONS ##############
//###########################################################
var requests = [];
function requestObject() {
	var xmlHttpReq = false;

	// Mozilla/Safari
	if (window.XMLHttpRequest) {
		xmlHttpReq = new XMLHttpRequest();
	}
	// IE
	else if (window.ActiveXObject) {
		xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
	}

	self.xmlHttpReq = xmlHttpReq;
	requests[requests.length] = xmlHttpReq;
	return xmlHttpReq;
}
function requestUtilityObject() {
	var xmlHttpReq = false;

	// Mozilla/Safari
	if (window.XMLHttpRequest) {
		xmlHttpReq = new XMLHttpRequest();
	}
	// IE
	else if (window.ActiveXObject) {
		xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
	}

	requests[requests.length] = xmlHttpReq;
	return xmlHttpReq;
}

function loadMapData() {

	wipeWildMonsterBox();
	var xmlHttpReq = requestObject();
	self.xmlHttpReq.open("GET", "/maps/" + mapCode + ".xml", true);
	self.xmlHttpReq.onreadystatechange = loadMapDataCallback;
	self.xmlHttpReq.send();
}

function loadMapDataCallback() {
	if (self.xmlHttpReq.readyState == 4) {
		if (self.xmlHttpReq.responseXML) {
			var resultsNode = self.xmlHttpReq.responseXML.childNodes[1];
			if (!resultsNode) {
				resultsNode = self.xmlHttpReq.responseXML.childNodes[0];
			}

			if (resultsNode == null) {
				loadMapData();
				return;
			}

			mapData = resultsNode;
			bMapDataLoaded = true;

			currentMap.load(mapData);

			if (loadAction != "") {
				if (loadAction.substr(0, 4) == "wrap") {
					var direction = loadAction.substr(5, 1);
					if (direction == 0) {
						userEvent.mapPosition.Y = Math.floor(mapHeight / 16) - 3;
					} else if (direction == 1) {
						userEvent.mapPosition.Y = 0;
					} else if (direction == 2) {
						userEvent.mapPosition.X = Math.floor(mapWidth / 16) - 3;
					} else if (direction == 3) {
						userEvent.mapPosition.X = 0;
					}
				}
			}

			loadMapEvents();
		}
	}
}

function loadMapEvents() {
	var xmlHttpReq = requestObject();
	var finalPostString = "mapid=" + encodeURIComponent(mapCode) + "&x=" + userEvent.mapPosition.X + "&y=" + userEvent.mapPosition.Y;

	self.xmlHttpReq.open("POST", "/game/xml/explore?rand=" + (Math.random() * 1000000), true);

	self.xmlHttpReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	self.xmlHttpReq.onreadystatechange = loadMapEventsCallback;
	self.xmlHttpReq.send(finalPostString);
}

function loadMapEventsCallback() {
	if (self.xmlHttpReq.readyState == 4) {
		if (self.xmlHttpReq.responseXML) {
			var resultsNode = self.xmlHttpReq.responseXML.childNodes[1];
			if (!resultsNode) {
				resultsNode = self.xmlHttpReq.responseXML.childNodes[0];
			}

			if (resultsNode == null) {
				loadMapEvents();
				return;
			}


			mapEvents = resultsNode;
			mapName = nodeValue(firstChildNodeNamed("name", mapEvents));
			mapID = nodeValue(firstChildNodeNamed("id", mapEvents));
			battlescreen = nodeValue(firstChildNodeNamed("type", mapEvents));
			mapWeather = nodeValue(firstChildNodeNamed("weather", mapEvents));
			isNight = parseInt(nodeValue(firstChildNodeNamed("time", mapEvents)));

			mapEffect = false;
			//Load the map's events
			currentMap.loadEvents(mapEvents);
			currentMap.mapMusic = nodeValue(firstChildNodeNamed("music", mapEvents));
			friendsList = nodeValue(firstChildNodeNamed("friendsList", mapEvents));
			if (currentMap.mapMusic != "" && currentMap.mapMusic != prevPlaying) {
				playMusic(currentMap.mapMusic);
			}


			if (currentMap.mapMusic != "") {
				playMusic(currentMap.mapMusic);
			}


			bMapEventsLoaded = true;
		} else {
			alert("Error loading events.");
			bMapEventsLoaded = true;
		}
	}
}


function firstChildNodeNamed(name, node) {
	for (var i = 0; i < node.childNodes.length; i++) {
		if (node.childNodes[i].nodeName == name)
			return node.childNodes[i];
	}
	return null;
}

function nodeValue(node) {
	var str = node.nodeValue;
	if (str == null)
		if (node.childNodes.length > 0)
			str = node.childNodes[0].nodeValue;

	return str;
}

function getDataOfImmediateChild(parentNode) {
	var val = "";
	for (n = 0; n < parentNode.childNodes.length; n++) {
		val = val + nodeValue(parentNode.childNodes[n]);
	}
	return val;
}


//###########################################################
//### LOADING & SETUP ##############
//###########################################################

$(document).ready(function () {


	curMonImage = document.getElementById("curMonImage");
	curOppImage = document.getElementById("curOppImage");

	var c = document.getElementById("cvsGame");
	ctx = c.getContext("2d");

	ctx.canvas.width = $("#mws-explore-area").innerWidth();
	ctx.canvas.height = $("#mws-explore-area").innerHeight();

	cvsWidth = Math.floor(ctx.canvas.width / 16 + 1) * 16;
	cvsHeight = Math.floor(ctx.canvas.height / 16 + 1) * 16;

	loadUserData();			//Instant / Async
	loadCharacterSets();	//Async
	loadImages();
	loadMapData();			//Async

	userEvent = new gameEvent();
	userEvent.initAsPlayer(Point(userX, userY));

	currentMap = gameMap();

	//setup keybindings
	$(document).bind('keydown', 'up', function (evt) { keyState.up = true; return false; });
	$(document).bind('keydown', 'down', function (evt) { keyState.down = true; return false; });
	$(document).bind('keydown', 'left', function (evt) { keyState.left = true; return false; });
	$(document).bind('keydown', 'right', function (evt) { keyState.right = true; return false; });
	$(document).bind('keydown', 'x', function (evt) { if (!chatBoxIsActive()) { keyState.btn1 = true; } return true; });
	$(document).bind('keydown', 'z', function (evt) { if (!chatBoxIsActive()) { keyState.btn2 = true; } return true; });
	$(document).bind('keydown', 'c', function (evt) { if (!chatBoxIsActive()) { keyState.btn3 = true; } return true; });

	$(document).bind('keydown', 'esc', function (evt) { menuOpen(); return true; });

	$(document).bind('keydown', 'w', function (evt) { if (!chatBoxIsActive()) { keyState.up = true; } return true; });
	$(document).bind('keydown', 's', function (evt) { if (!chatBoxIsActive()) { keyState.down = true; } return true; });
	$(document).bind('keydown', 'a', function (evt) { if (!chatBoxIsActive()) { keyState.left = true; } return true; });
	$(document).bind('keydown', 'd', function (evt) { if (!chatBoxIsActive()) { keyState.right = true; } return true; });

	$(document).bind('keydown', '1', function (evt) { captchaKeypress[0] = false; return true; });
	$(document).bind('keydown', '2', function (evt) { captchaKeypress[1] = false; return true; });
	$(document).bind('keydown', '3', function (evt) { captchaKeypress[2] = false; return true; });
	$(document).bind('keydown', '4', function (evt) { captchaKeypress[3] = false; return true; });
	$(document).bind('keydown', '5', function (evt) { captchaKeypress[4] = false; return true; });
	$(document).bind('keydown', '6', function (evt) { captchaKeypress[5] = false; return true; });

	$(document).bind('keyup', '1', function (evt) { addToCaptcha("1"); return true; });
	$(document).bind('keyup', '2', function (evt) { addToCaptcha("2"); return true; });
	$(document).bind('keyup', '3', function (evt) { addToCaptcha("3"); return true; });
	$(document).bind('keyup', '4', function (evt) { addToCaptcha("4"); return true; });
	$(document).bind('keyup', '5', function (evt) { addToCaptcha("5"); return true; });
	$(document).bind('keyup', '6', function (evt) { addToCaptcha("6"); return true; });

	//KEY UP/RELEASE
	$(document).bind('keyup', 'up', function (evt) { keyState.up = false; return false; });
	$(document).bind('keyup', 'down', function (evt) { keyState.down = false; return false; });
	$(document).bind('keyup', 'left', function (evt) { keyState.left = false; return false; });
	$(document).bind('keyup', 'right', function (evt) { keyState.right = false; return false; });
	$(document).bind('keyup', 'x', function (evt) { if (!chatBoxIsActive()) { keyState.btn1 = false; } return true; });
	$(document).bind('keyup', 'z', function (evt) { if (!chatBoxIsActive()) { keyState.btn2 = false; } return true; });
	$(document).bind('keyup', 'c', function (evt) { if (!chatBoxIsActive()) { keyState.btn3 = false; } return true; });

	$(document).bind('keyup', 'w', function (evt) { if (!chatBoxIsActive()) { keyState.up = false; } return true; });
	$(document).bind('keyup', 's', function (evt) { if (!chatBoxIsActive()) { keyState.down = false; } return true; });
	$(document).bind('keyup', 'a', function (evt) { if (!chatBoxIsActive()) { keyState.left = false; } return true; });
	$(document).bind('keyup', 'd', function (evt) { if (!chatBoxIsActive()) { keyState.right = false; } return true; });

	$(document).bind('keyup', 'return', function (evt) { selectChatBox(); return false; });
	$(document).bind('keyup', '/', function (evt) {
		for (var i = 0; i < privateMessages.length; i++) {
			if (document.getElementById("txtUpdate" + privateMessages[i]) == document.activeElement) {
				return true;
			}
		}
		selectChatBox();
		return true;
	});

	$(document).bind('keydown', 'm', function (evt) {
		if (document.getElementById("txtUpdate") == document.activeElement) {
			return true;
		}
		if (document.getElementById("search-args") == document.activeElement) {
			return true;
		}
		for (var i = 0; i < privateMessages.length; i++) {
			if (document.getElementById("txtUpdate" + privateMessages[i]) == document.activeElement) {
				return true;
			}
		}

		if (document.activeElement != null) {
			if (document.activeElement.id.indexOf('txtUpd') > -1) {
				return true;
			}
		}


		bMagnify = !bMagnify;

		return false;
	});

	$("#cvsGame").mousedown(function (e) {
		if (!e) var e = window.event;
		canvasMouseDown(e);
	});
	$("#cvsGame").mouseup(function (e) {
		if (!e) var e = window.event;
		canvasMouseUp(e);
	});
	$("#cvsGame").mousemove(function (e) {
		if (!e) var e = window.event;
		canvasMouseMove(e);
	});

	// test if the browser supports web sockets
	if ("WebSocket" in window) {
		//connect("ws://www.pokemongods.com:8082/game");
		connect(websocket_url);
	} else {
		showUnsupportedMessage();
	};

	if (bIsIPhone || bIsIPad || bIsAndroid) {
		rebindClicks();
	}

	timeoutInterval = setInterval(keepSession, 120000);
	//
	gameInterval = setInterval(function () {
		update();
		draw();
	}, 500);

	reszeWindow();
});

var timeoutInterval = null;
var gameInterval = null;


// connect to the specified host
function connect(host) {

	console.log("Note: Connecting to Pokemon Legends Server.");

	try {
		ws = new WebSocket(host); // create the web socket
	} catch (err) {
		console.log("Note: Connection Error" + err);
	}

	ws.onopen = function () {
		ws.send("/auth^" + serverToken + "\r\n\r\n");
		console.log("Note: Connection Established.");
		bConnected = true;

	};

	ws.onmessage = function (evt) {
		if (typeof evt.data == "string") {
			if (evt.data.indexOf("/update") > -1) {
				updateMMOEvents(evt.data);
			} else if (evt.data.indexOf("/msg") > -1) {
				updateChat(evt.data);
			} else if (evt.data.indexOf("/pvprequest") > -1) {
				pvpRequested(evt.data);
			} else if (evt.data.indexOf("/pvpaccepted") > -1) {
				pvpLoadBattle(evt.data);
			} else if (evt.data.indexOf("/ping") > -1) {
				serverPing(evt.data);
			}
		}
	};

	ws.onclose = function () {
		window.toast.fire({
			title: 'Connectivity Notification',
			html: "Note: Connection Closed. Will retry in 2 minutes."
		});

		bConnected = false;
		mmoUsers = new Array();
		//TODO: Change to the Discord Link
		document.getElementById("IRC").style.display = "block";
		document.getElementById("IRC").innerHTML = "Chat appears to be offline. Try our <a href='/discord' target='_blank'>Discord Server</a>!";

	};

	showNotify();
};

function preventClickEvent(event) {
	event.preventDefault();
}

function keepSession() {
	if (bConnected == false) {

		connect(websocket_url);
	}
	loadUtility("keepAlive=true");
}

function loadMap(newMapCode, arrivalMethod, arrivalDirection) {
	mapLoadedCount = 0;
	bMapEventsLoaded = false;
	bMapDataLoaded = false;
	bLoading = true;

	clearInterval(gameInterval);
	gameInterval = setInterval(function () {
		update();
		draw();
	}, 500);

	mapCode = newMapCode;
	loadMapData();

	currentMap = gameMap();
	mapWidth = mapAbove.width;
	mapHeight = mapAbove.height;

	mapAbove = new Image();
	mapBase = new Image();
	mapNight = new Image();
	mapAbove.onload = loadedMapImage;
	mapBase.onload = loadedMapImage;
	mapAbove.src = cdn + '/maps/' + mapCode + ' above.png';
	mapBase.src = cdn + '/maps/' + mapCode + ' base.png';
	mapNight.src = cdn + '/images/night.png';

	if (arrivalDirection != null) {
		loadAction = "wrap:" + arrivalDirection;
	} else {
		loadAction = "";
	}
	/*
	ga('send', {
		hitType: 'event',
		eventCategory: 'Interaction',
		eventAction: 'Area: ' + newMapCode,
		eventLabel: 'Map Warp'
	});*/

	mmoUsers = new Array();
}


$(window).resize(function () {
	if (ctx == null)
		return;

	reszeWindow();
});


function reszeWindow() {

	var heightPotential = $(window).height();
	var usableHeight = heightPotential - 140;

	if ($(".adDiv").length > 0) {
		usableHeight -= $(".adDiv").innerHeight();
	}

	if( usableHeight < 300 ) {
		usableHeight = 300;
	}

	$("#mws-explore-area").css("height", usableHeight + "px");
	$("#cvsGame").css("height", usableHeight + "px");

	if ($("#mws-explore-area").innerWidth() > 502) {
		usableHeight -= 19;
	}



	$("#mws-explore-encounter").css("top", -(usableHeight + 30) + "px");
	$("#mws-explore-trade-or-battle").css("top", -(usableHeight + 30) + "px");
	$("#mws-explore-requests").css("top", -(usableHeight + 30) + "px");


	ctx.canvas.width = $("#mws-explore-area").innerWidth();
	ctx.canvas.height = $("#mws-explore-area").innerHeight();

	cvsWidth = Math.floor(ctx.canvas.width / 16 + 1) * 16;
	cvsHeight = Math.floor(ctx.canvas.height / 16 + 1) * 16;

	buffer.width = ctx.canvas.width;
	buffer.height = ctx.canvas.height;
	/*
		if (cvsWidth > 1024) {
			cvsWidth = 1024;
		}*/

	repositionMonsters();

	$("#divKeys").css('width',ctx.canvas.width + 'px');

}

function repositionMonsters() {

	cvsWidth = Math.floor(ctx.canvas.width / 16 + 1) * 16;
	cvsHeight = Math.floor(ctx.canvas.height / 16 + 1) * 16;

	var left = $("#cvsGame").offset().left + $("#cvsGame").position().left;
	var top = $("#cvsGame").offset().top + $("#cvsGame").position().top;

	var centerX = cvsWidth / 2;
	var centerY = cvsHeight / 2;

	var offsetY = 70;
	var offsetX = 230;

	curMonImage.style.left = (centerX + offsetX - 120 - curMonImage.width / 2) + 'px';
	curMonImage.style.top = (centerY + offsetY - curMonImage.height / 2 + 70) + 'px';
	curOppImage.style.left = (centerX + offsetX + 120 - curOppImage.width / 2) + 'px';
	curOppImage.style.top = (centerY + offsetY - curOppImage.height / 2) + 'px';

}

function loadedMapImage() {
	mapLoadedCount++;
}

function resourceByKey(key) {
	for (var i = 0; i < screenResources.length; i++) {
		if (screenResources[i].key == key)
			return screenResources[i].img;
	}
	return null;
}
function musicResourceByKey(key) {
	for (var i = 0; i < musicResources.length; i++) {
		if (musicResources[i].key == key)
			return musicResources[i];
	}
	return null;
}
function effectResourceByKey(key) {
	for (var i = 0; i < effectResources.length; i++) {
		if (effectResources[i].key == key)
			return effectResources[i].audio;
	}
	return null;
}

function loadedMusicResource() {
	MusicResourceLoadedCount++;
}
function loadedEffectResource() {
	EffectResourceLoadedCount++;
}
function loadedResource() {
	ImageResourceLoadedCount++;
	for (var k = 0; k < screenResources.length; k++) {
		if (this.src.indexOf(screenResources[k].url) > -1) {
			screenResources[k].width = this.width;
			screenResources[k].height = this.height;
		}
	}
}



function loadImages() {
	//Images
	screenResources.push(new ResourceImage("/images/battlescreen.png", "battlescreen"));
	screenResources.push(new ResourceImage("/images/battlescreen-beach.png", "battlescreen-beach"));
	screenResources.push(new ResourceImage("/images/battlescreen-cave.png", "battlescreen-cave"));
	screenResources.push(new ResourceImage("/images/battlescreen-desert.png", "battlescreen-desert"));
	screenResources.push(new ResourceImage("/images/battlescreen-gym.png", "battlescreen-gym"));
	screenResources.push(new ResourceImage("/images/battlescreen-indoor.png", "battlescreen-indoor"));
	screenResources.push(new ResourceImage("/images/battlescreen-lava.png", "battlescreen-lava"));
	screenResources.push(new ResourceImage("/images/battlescreen-opensea.png", "battlescreen-opensea"));
	screenResources.push(new ResourceImage("/images/battlescreen-rockgarden.png", "battlescreen-rockgarden"));
	screenResources.push(new ResourceImage("/images/battlescreen-seafloor.png", "battlescreen-seafloor"));
	screenResources.push(new ResourceImage("/images/battlescreen-snow.png", "battlescreen-snow"));
	screenResources.push(new ResourceImage("/images/battlescreen-tournament.png", "battlescreen-tournament"));

	screenResources.push(new ResourceImage("/images/weather/Clear Skies.png", "weather-Clear Skies"));
	screenResources.push(new ResourceImage("/images/weather/Diamond Dust.png", "weather-Diamond Dust"));
	screenResources.push(new ResourceImage("/images/weather/Extremely Harsh Sunlight.png", "weather-Extremely Harsh Sunlight"));
	screenResources.push(new ResourceImage("/images/weather/Fog.png", "weather-Fog"));
	screenResources.push(new ResourceImage("/images/weather/Hail.png", "weather-Hail"));
	screenResources.push(new ResourceImage("/images/weather/Harsh Sunlight.png", "weather-Harsh Sunlight"));
	screenResources.push(new ResourceImage("/images/weather/Heavy Rain.png", "weather-Heavy Rain"));
	screenResources.push(new ResourceImage("/images/weather/Mysterious Air Current.png", "weather-Mysterious Air Current"));
	screenResources.push(new ResourceImage("/images/weather/Rain.png", "weather-Rain"));
	screenResources.push(new ResourceImage("/images/weather/Sandstorm.png", "weather-Sandstorm"));
	screenResources.push(new ResourceImage("/images/weather/Shadowy Aura.png", "weather-Shadowy Aura"));



	screenResources.push(new ResourceImage("/images/BattleIcon.png", "battleicon"));
	screenResources.push(new ResourceImage("/images/pokeball_bubble.png", "pokeballicon"));

	screenResources.push(new ResourceImage("/images/pokemonEgg.png", "pokemonegg"));


	screenResources.push(new ResourceImage("/images/btnHighlightAttack.png", "btnHighlightAttack"));
	screenResources.push(new ResourceImage("/images/btnHighlightOption.png", "btnHighlightOption"));
	screenResources.push(new ResourceImage("/images/btnHighlightSwap.png", "btnHighlightSwap"));

	var elements = new Array("ani-air", "ani-ancient", "ani-basic", "ani-demonic", "ani-divine", "ani-earth", "ani-electric", "ani-fire", "ani-ghost", "ani-psychic", "ani-steel", "ani-water", "ani-berserk", "ani-confusion", "ani-heal", "ani-paralyze", "ani-poison", "ani-seed", "ani-sleep");
	for (var k = 0; k < elements.length; k++)
		screenResources.push(new ResourceImage("/images/typeanimations/" + elements[k] + ".png", elements[k]));

	//sfx
	effectResources.push(new ResourceEffect("/audio/MonAppear.wav", "MonAppear"));
	effectResources.push(new ResourceEffect("/audio/beep.wav", "beep"));
	effectResources.push(new ResourceEffect("/audio/door.wav", "door"));
	effectResources.push(new ResourceEffect("/audio/hit.mp3", "hit"));
	effectResources.push(new ResourceEffect("/audio/intro.mp3", "intro"));
	effectResources.push(new ResourceEffect("/audio/levelup.mp3", "levelup"));
	effectResources.push(new ResourceEffect("/audio/coinchange.mp3", "coinchange"));
	effectResources.push(new ResourceEffect("/audio/battle.wav", "battle"));

	effectResources.push(new ResourceEffect("/audio/Hey1.wav", "privatemessage"));

	effectResources.push(new ResourceEffect("/audio/pmAha.wav", "pmAha"));
	effectResources.push(new ResourceEffect("/audio/pmEwww.wav", "pmEwww"));
	effectResources.push(new ResourceEffect("/audio/pmExcellent.wav", "pmExcellent"));
	effectResources.push(new ResourceEffect("/audio/pmFantastic.wav", "pmFantastic"));
	effectResources.push(new ResourceEffect("/audio/pmGood.wav", "pmGood"));
	effectResources.push(new ResourceEffect("/audio/pmGreat.wav", "pmGreat"));
	effectResources.push(new ResourceEffect("/audio/pmILoveYou.wav", "pmILoveYou"));
	effectResources.push(new ResourceEffect("/audio/pmMmmm.wav", "pmMmmm"));
	effectResources.push(new ResourceEffect("/audio/pmNice.wav", "pmNice"));
	effectResources.push(new ResourceEffect("/audio/pmOh.wav", "pmOh"));
	effectResources.push(new ResourceEffect("/audio/pmWellDone.wav", "pmWellDone"));
	effectResources.push(new ResourceEffect("/audio/pmWooHoo.wav", "pmWooHoo"));
	effectResources.push(new ResourceEffect("/audio/pmYeah.wav", "pmYeah"));


	//music
	musicResources.push(new ResourceMusic("audio/Vaniville Town.mp3", "vanivilletown"));
	musicResources.push(new ResourceMusic("audio/Route 8.mp3", "route8"));
	musicResources.push(new ResourceMusic("audio/victory.mp3", "victory"));
	musicResources.push(new ResourceMusic("audio/Scary House.mp3", "cave"));
	//musicResources.push(new ResourceMusic("audio/fail.mp3","fail"));
	musicResources.push(new ResourceMusic("audio/healing.mp3", "healing"));
	musicResources.push(new ResourceMusic("audio/Pokemon Center.mp3", "pokecenter"));
	musicResources.push(new ResourceMusic("audio/overworld1.mp3", "overworld1"));
	//musicResources.push(new ResourceMusic("audio/overworld2.mp3","overworld2"));
	musicResources.push(new ResourceMusic("audio/Magic Forest.mp3", "Magic Forest"));
	musicResources.push(new ResourceMusic("audio/battle1.mp3", "battle1"));
	musicResources.push(new ResourceMusic("audio/tournament.mp3", "tournament"));
	musicResources.push(new ResourceMusic("audio/Sharks.mp3", "Sharks"));
	//musicResources.push(new ResourceMusic("audio/Dark Intentions.mp3","Dark Intentions"));
}

//Loads all NPC and main character sprites into an array
function loadCharacterSets() {
	//no longer used. All are loaded from explore.php.
}


function loadedSprite() {
	charsetLoadedCount++;
}

//Adds a sprite to the charsets array
function addCharset(imgURL) {
	var newImage = new Image();
	var myPos = $(".sprite.sprite-" + imgURL).css("background-position").split(" ");
	newImage.src = charSetSprite.src;
	newImage.className = imgURL + ".png"; //does nothing, used for verifying in drawImage
	newImage.setAttribute('spritePosX', parseInt(-myPos[0].slice(0, -2)));
	newImage.setAttribute('spritePosY', parseInt(-myPos[1].slice(0, -2)));
	newImage.setAttribute('width', parseInt($(".sprite.sprite-" + imgURL).css("width").slice(0, -2)));
	newImage.setAttribute('height', parseInt($(".sprite.sprite-" + imgURL).css("height").slice(0, -2)));
	newImage.onload = loadedSprite();

	charsets.push(newImage);
}

//### SCRIPTING FUNCTIONS ##############

function triggerEvent(Event, fromCollision) {
	if (Event.bEventEnabled) {

		lastTriggeredEventName = Event.name;
		lastTriggeredEventId = Event.id;
		/*
		ga('send', {
			hitType: 'event',
			eventCategory: 'Interaction',
			eventAction: 'Name: ' + lastTriggeredEventName,
			eventLabel: 'NPC',
			eventValue: lastTriggeredEventId
		});*/

		//face the user
		if (Event.mapPosition.X > userEvent.mapPosition.X) {
			scriptAddLine("move event", Event.id + "^Face Left^1");
		} else if (Event.mapPosition.X < userEvent.mapPosition.X) {
			scriptAddLine("move event", Event.id + "^Face Right^1");
		} else if (Event.mapPosition.Y > userEvent.mapPosition.Y + 2) {
			scriptAddLine("move event", Event.id + "^Face Up^1");
		} else if (Event.mapPosition.Y < userEvent.mapPosition.Y + 2) {
			scriptAddLine("move event", Event.id + "^Face Down^1");
		}

		for (var i = 0; i < Event.eventData.length; i++) {
			activeScript.push(Event.eventData[i]);
		}
		if (activeScript.length > 0) {
			scriptProgress();
			return true;
		} else {
			return false;
		}

	}
	return false;
}

//### KEY PRESS / MOUSE FUNCTIONS ##############

function getPosition(e) {
	e = e || window.event;
	var cursor = { x: 0, y: 0 };
	if (e.pageX || e.pageY) {
		cursor.x = e.pageX;
		cursor.y = e.pageY;
	}
	else {
		var de = document.documentElement;
		var b = document.body;
		cursor.x = e.clientX +
			(de.scrollLeft || b.scrollLeft) - (de.clientLeft || 0);
		cursor.y = e.clientY +
			(de.scrollTop || b.scrollTop) - (de.clientTop || 0);
	}
	return cursor;
}

function hitTest(x, y, boxX1, boxY1, boxX2, boxY2) {
	if (x >= boxX1 && x <= boxX2) {
		if (y >= boxY1 && y <= boxY2) {
			return true;
		}
	}
	return false;
}

function checkMousePosition(posX, posY) {
	var boxWidth = 160;
	var boxHeight = 40;
	var centerX = cvsWidth / 2;
	var centerY = cvsHeight / 2;

	var boxX = centerX + 46;
	var boxY = centerY + 110 - 50;
	if (hitTest(posX, posY, boxX - boxWidth / 2, boxY - boxHeight / 2, boxX + boxWidth / 2, boxY + boxHeight / 2)) {
		return "atk1";
	}

	boxX = centerX + 174;
	boxY = centerY + 110 - 50;
	if (hitTest(posX, posY, boxX - boxWidth / 2, boxY - boxHeight / 2, boxX + boxWidth / 2, boxY + boxHeight / 2)) {
		return "atk2";
	}

	boxX = centerX + 46;
	boxY = centerY + 145 - 50;
	if (hitTest(posX, posY, boxX - boxWidth / 2, boxY - boxHeight / 2, boxX + boxWidth / 2, boxY + boxHeight / 2)) {
		return "atk3";
	}

	boxX = centerX + 174;
	boxY = centerY + 145 - 50;
	if (hitTest(posX, posY, boxX - boxWidth / 2, boxY - boxHeight / 2, boxX + boxWidth / 2, boxY + boxHeight / 2)) {
		return "atk4";
	}

	boxWidth = 100;
	boxX = centerX - 232 + 45;
	boxY = centerY + 125 - 40;
	if (hitTest(posX, posY, boxX - boxWidth / 2, boxY - boxHeight / 2, boxX + boxWidth / 2, boxY + boxHeight / 2)) {
		return "run";
	}

	boxX = centerX - 138 + 45;
	boxY = centerY + 125 - 40;
	if (hitTest(posX, posY, boxX - boxWidth / 2, boxY - boxHeight / 2, boxX + boxWidth / 2, boxY + boxHeight / 2)) {
		return "item";
	}


	boxWidth = 50;
	boxHeight = 50;
	boxX = centerX - 220;
	boxY = centerY - 111 - 80;
	if (hitTest(posX, posY, boxX - boxWidth / 2, boxY - boxHeight / 2, boxX + boxWidth / 2, boxY + boxHeight / 2)) {
		return "swap";
	}

	if (battleSelectedMenu > 6 && battleSelectedMenu <= 12) {
		for (var k = 0; k < teamMonsters.length; k++) {
			var pos = k + 1;

			var x = centerX;
			var y = centerY - 75 - 60;
			if (pos < 4) {
				x = x - 110;
				y = y + pos * 30;
			} else {
				x = x + 110;
				y = y + (pos - 3) * 30;
			}

			boxWidth = 200;
			boxHeight = 40;
			boxX = x;
			boxY = y;
			if (hitTest(posX, posY, boxX - boxWidth / 2, boxY - boxHeight / 2, boxX + boxWidth / 2, boxY + boxHeight / 2)) {
				return "swap" + pos;
			}
		}
	} if (battleSelectedMenu == 13) {

		for (var k = 0; k < battleItems.length; k++) {
			var pos = k + 1;

			var x = centerX;
			var y = centerY - 75 - 60;
			if (pos < 5) {
				x = x - 110;
				y = y + pos * 30;
			} else {
				x = x + 110;
				y = y + (pos - 4) * 30;

			}

			boxWidth = 200;
			boxHeight = 40;
			boxX = x;
			boxY = y;
			if (hitTest(posX, posY, boxX - boxWidth / 2, boxY - boxHeight / 2, boxX + boxWidth / 2, boxY + boxHeight / 2)) {
				return "item" + pos;
			}

		}



	}

	return "";
}

function canvasMouseDown(e) {
	var pos = getPosition(e);
	var centerX = cvsWidth / 2;
	var centerY = cvsHeight / 2;
	bMouseDown = true;

	var left = $("#cvsGame").position().left;// + $("#cvsGame").position().left;
	var top = $("#cvsGame").position().top + 24;// + $("#cvsGame").position().top;

	var posX = pos.x - left;
	var posY = pos.y - top;

	if (bInBattle) {
		if (battleScript.length > 0) {
			keyState.btn1 = true;
		} else {
			var activeMenu = checkMousePosition(posX, posY);
			if (activeMenu != "") {
				if (activeMenu != "item" && activeMenu != "swap") {
					keyState.btn1 = true;
				}
			}
		}

	} else {
		document.getElementById('mws-explore-trade-or-battle').innerHTML = "";
		for (var i = 0; i < mmoUsers.length; i++) {
			var user = mmoUsers[i];
			if (pos.x - left > user.drawPosX && pos.x - left < user.drawPosX + 32) {
				if (pos.y - top < user.drawPosY && pos.y - top > user.drawPosY - 48) {
					if (user.name.indexOf("'s Pet") == -1) {
						displayMMOUser(user);
					}
				}
			}
		}
	}

	return false;
}


function canvasMouseUp(e) {
	var pos = getPosition(e);
	var centerX = cvsWidth / 2;
	var centerY = cvsHeight / 2;
	bMouseDown = false;



	return false;
}


function canvasMouseMove(e) {
	var pos = getPosition(e);
	var centerX = cvsWidth / 2;
	var centerY = cvsHeight / 2;
	var left = $("#cvsGame").offset().left + $("#cvsGame").position().left;
	var top = $("#cvsGame").offset().top + $("#cvsGame").position().top;

	var posX = pos.x - left;
	var posY = pos.y - top;

	if (bInBattle) {
		if (battleScript.length == 0) {

			var activeMenu = checkMousePosition(posX, posY);
			if (activeMenu == "atk1" && parseInt(battleStage) != 1) {
				battleSelectedMenu = 2;
			} else if (activeMenu == "atk2" && parseInt(battleStage) != 1) {
				battleSelectedMenu = 3;
			} else if (activeMenu == "atk3" && parseInt(battleStage) != 1) {
				battleSelectedMenu = 4;
			} else if (activeMenu == "atk4" && parseInt(battleStage) != 1) {
				battleSelectedMenu = 5;
			} else if (activeMenu == "run" && parseInt(battleStage) != 1) {
				battleSelectedMenu = 0;
			} else if (activeMenu == "item" && battleSelectedMenu != 13 && parseInt(battleStage) != 1) {
				battleSelectedMenu = 13;
			} else if (activeMenu == "swap" && parseInt(battleStage) != 1) {
				battleSelectedMenu = 7;
			} else if (activeMenu.indexOf('swap') > -1 && activeMenu != "swap") {
				var pos = parseInt(activeMenu.replace(/swap/gi, ''));
				battleSelectedMenu = pos + 6;

			} else if (activeMenu.indexOf('item') > -1 && battleSelectedMenu == 13 && parseInt(battleStage) != 1) {
				var pos = parseInt(activeMenu.replace(/item/gi, ''));
				battleItemSelectedMenu = pos - 1;
			}

			if (activeMenu != "")
				battleUpdatedMenu();


		}
	}


}



//### MMO FUNCTIONS ###############
function displayMMOUser(user) {
	var div = document.getElementById('mws-explore-trade-or-battle');
	var html = "<center><b>" + user.name + "</b><br/>";
	//html += '<input type="button" style="width:120px;"  class="mws-tooltip-s mws-button blue" value="Trade" title="Offer to Trade with this Player."><br/>';
	html += '<input type="button" style="width:120px;"  class="mws-tooltip-s mws-button red" value="Battle" onclick="pvpRequest(\'' + user.name + '\', 0);" title="Request a Battle with this Player."><br/>';
	html += '<input type="button" style="width:120px;"  class="mws-tooltip-s mws-button red" value="Inverse Battle" onclick="pvpRequest(\'' + user.name + '\', 1);" title="Request an Inverse Battle with this Player."><br/>';

	html += '<input type="button" style="width:120px;"  class="mws-tooltip-s mws-button green" value="PM" onclick="pmUser(\'' + user.name + '\')" title="Send a Private Message to this Player."><br/>';
	html += '<a href="/game/trades?user=' + user.name + '" target="_blank"><input type="button" style="width:120px;"  class="mws-tooltip-s mws-button blue" value="Trades"  title="View Trades of this Player."><br/></a>';
	html += "</center>";
	div.innerHTML = html;
}

function pmUser(name) {
	$(".chat-input").val("/pm " + name + " ");
	$(".chat-input").focus();
}

function pvpRequest(name, mode) {
	ws.send("/msg^/pvprequest " + name + " " + mode + "\r\n\r\n");
	document.getElementById('mws-explore-trade-or-battle').innerHTML = "";
}
function pvpAccept(name, mode) {
	ws.send("/msg^/pvpaccept " + name + " " + mode + "\r\n\r\n");
	document.getElementById("mws-explore-requests").innerHTML = "";

}

function pvpRequested(data) {
	var dataRow = data.split("^");
	if (dataRow[2] == 1)
		document.getElementById("mws-explore-requests").innerHTML = '<div style="padding:8px;"><b>' + dataRow[1] + '</b> wants an Inverse battle: <br/><center><input type="button" style="width:120px;"  class="mws-tooltip-s mws-button green" value="Accept PvP" onclick="pvpAccept(\'' + dataRow[1] + '\', ' + dataRow[2] + ')" title="Accept"><br/><input type="button" style="width:120px;"  class="mws-tooltip-s mws-button red" value="Reject PvP" onclick="hideRequest();" title="Reject"></center></div>';
	else
		document.getElementById("mws-explore-requests").innerHTML = '<div style="padding:8px;"><b>' + dataRow[1] + '</b> wants to battle: <br/><center><input type="button" style="width:120px;"  class="mws-tooltip-s mws-button green" value="Accept PvP" onclick="pvpAccept(\'' + dataRow[1] + '\', ' + dataRow[2] + ')" title="Accept"><br/><input type="button" style="width:120px;"  class="mws-tooltip-s mws-button red" value="Reject PvP" onclick="hideRequest();" title="Reject"></center></div>';
}

var userCount = "?";
function serverPing(data) {
	var dataRow = data.split("^");
	userCount = parseInt(dataRow[1]);
}

function pvpLoadBattle(data) {
	var dataRow = data.split("^");
	battleRoundTacker = 0;

	curOpp = null;
	nextOpp = null;
	curMon = null;
	nextMon = null;

	curMonImage.src = cdn + '/images/blank.png';
	curOppImage.src = cdn + '/images/blank.png';

	battleLoading = false;
	//battle_id needs to be provided.
	curOpp = null;
	scriptAddLine(battlescreen, "PVP");
	//bInBattle = true; - this is set in the above script funciton
	battleSelectedMenu = 2;
	playSFX("battle");
	playMusic("battle1");
	if (prevPlayingSong)
		prevPlayingSong.currentTime = 0;
	bWildBattle = false;
	wipeWildMonsterBox();
}



function chatPMKeyPress(e) {
	e = e || event;

	var unicode = e.keyCode ? e.keyCode : e.charCode
	if (unicode == 13) {
		e.preventDefault();
		if (e.target.value != "") {
			ws.send("/msg^/pm " + $(e.target).data('party') + " " + e.target.value + "\r\n\r\n");
			e.target.value = "";

			setTimeout(function () { e.target.focus(); }, 50);
			return true;
		}
	}
	return false;
}


var privateMessages = new Array();

function updateChat(data) {
	window.chat.append(data);
}

function closePM(divName, party) {
	$("#" + divName).remove();
	privateMessages.remove(party);
}

Array.prototype.remove = function () {
	var what, a = arguments, L = a.length, ax;
	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
		}
	}
	return this;
};

String.prototype.toTitleCase = function (n) {
	var s = this;
	if (1 !== n) s = s.toLowerCase();
	return s.replace(/\b[a-z]/g, function (f) { return f.toUpperCase() });
}


//### AUDIO FUNCTIONS ###############

function restoreLastSong() {
	if (musicEnabled == false)
		return;

	if (prevPlayingSong)
		prevPlayingSong.play();


}

function playMusicOnce(key) {
	if (musicEnabled == false)
		return;

	var audio = musicResourceByKey(key);

	if (!audio) {
		if (key.indexOf("/") > -1) {
			musicResources.push(new ResourceMusic(key, key));
			audio = musicResourceByKey(key);
		}
	}

	if (audio) {

		if (prevPlayingSong)
			prevPlayingSong.pause();

		if (playOnceSong)
			playOnceSong.pause();

		if (audio.audio == null) {
			audio.audio = new Audio();
			audio.audio.src = audio.src;
			audio.audio.volume = 0.5;
			//this.audio.play();
			//this.audio.pause();
		}

		audio.audio.loop = false;
		audio.audio.addEventListener('ended', restoreLastSong);
		audio.audio.currentTime = 0;
		audio.audio.play();
		playOnceSong = audio.audio;
	}
}

function playMusic(key) {
	if (musicEnabled == false)
		return;

	var audio = musicResourceByKey(key);

	if (!audio) {
		if (key.indexOf("/") > -1) {
			musicResources.push(new ResourceMusic(key, key));
			audio = musicResourceByKey(key);
		}
	}


	if (audio) {

		if (prevPlayingSong)
			prevPlayingSong.pause();

		if (playOnceSong)
			playOnceSong.pause();

		if (audio.audio == null) {
			audio.audio = new Audio();
			audio.audio.src = audio.src;
			audio.audio.volume = 0.35;
			//this.audio.play();
			//this.audio.pause();
		}

		audio.audio.loop = true;
		audio.audio.play();
		prevPlayingSong = audio.audio;
		prevPlaying = key;
	}
}
function playSFX(key) {
	if (soundEnabled == false)
		return;

	var audio = effectResourceByKey(key);
	if (audio) {
		audio.play();
	}
}


//### SUPPORT FUNCTIONS ###############

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}



// ################################################
// ### MMO USER CLASS ###########################
// ################################################


function MMOUser(id, name, trainerimg) {
	this.id = id;
	this.name = name;
	this.trainerimg = trainerimg;
	this.mapid = 0;
	this.x = 0;
	this.y = 0;
	this.NewX = 0;
	this.NewY = 0;
	this.direction = 0;
	this.step = 0;
	this.inbattle = 0;

	this.drawPosX = 0;
	this.drawPosY = 0;
	this.drawStartX = 0;
	this.drawStartY = 0;

	this.isRunning = 0;

	this.stepPart = 0;
	this.stepAnimation = 0;
	this.offsetX = 0;
	this.offsetY = 0;
	this.stepX = 0;
	this.stepY = 0;

	this.moveQueue = new Array();

	this.msg = "";
	this.msgTick = 0;

	this.frameCount = 2;
	this.ImageRef = null;
	this.updated = false;

	this.spritePosX = 0;
	this.spritePosY = 0;
	this.evaluate = function () {

		this.stepX = 0;
		this.stepY = 0;
		if (this.moveQueue.length > 0) {
			if (this.moveQueue[0] == "up") {
				this.stepY = -this.stepPart;
			} else if (this.moveQueue[0] == "down") {
				this.stepY = this.stepPart;
			} else if (this.moveQueue[0] == "left") {
				this.stepX = -this.stepPart;
			} else {
				this.stepX = this.stepPart;
			}
		}

		this.drawPosX = mapLeft + (this.x * 16) + this.stepX + 13;
		this.drawPosY = -mapTop - currentMap.mapHeight / 2 + ((this.y + 2) * 16) + this.stepY + 2 - 130 + 32;

		var additionalDown = currentMap.mapHeight / 2 - cvsHeight / 2;
		this.drawPosY = -mapTop - cvsHeight / 2 - currentMap.mapHeight / 2 + ((this.y + 2) * 16) + this.stepY + 2 + 28 + (additionalDown - 192);


		this.updateTextureCoords();


		//process move queue - in between movequeue syncs check for position reevaluate
		this.processMoveQueue();

		if (this.msg != "") {
			this.msgTick++;
			if (this.msgTick > 250) {
				this.msg = "";
			}
		}
	}

	this.updatesWithoutMove = 0;
	this.processMoveQueue = function ()    // Define Method
	{
		if (currentMap == null) {
			return false;
		}

		if (this.moveQueue.length > 0) {

			if (this.moveQueue[0].toLowerCase() == "up") {
				this.direction = 0;
			} else if (this.moveQueue[0].toLowerCase() == "down") {
				this.direction = 1;
			} else if (this.moveQueue[0].toLowerCase() == "left") {
				this.direction = 2;
			} else if (this.moveQueue[0].toLowerCase() == "right") {
				this.direction = 3;
			}

			if (this.stepPart == 8 || this.stepPart == 0) {
				this.stepAnimation++;
				if (this.stepAnimation > this.frameCount)
					this.stepAnimation = 0;
			}

			this.stepPart = this.stepPart + 4;

			if (this.isRunning == 1 && this.moveQueue.length == 1)
				this.stepPart = this.stepPart + 4;

			if (this.stepPart >= 16) {
				this.stepPart = 0;

				//update the coordanates at the end of the step.
				if (this.moveQueue[0] == "up") {
					this.y = this.y - 1;
				} else if (this.moveQueue[0] == "down") {
					this.y = this.y + 1;
				} else if (this.moveQueue[0] == "left") {
					this.x = this.x - 1;
				} else {
					this.x = this.x + 1;
				}

				this.moveQueue.splice(0, 1);

				if (Math.abs(this.NewX - this.x) > 6 || Math.abs(this.NewY - this.y) > 6) {
					this.x = this.NewX;
					this.y = this.NewY;
					this.moveQueue.length = 0;
				}

			}
		}

		if (this.moveQueue.length == 0) {
			//add to moveQueue based on position

			if (this.y > this.NewY) {
				if (currentMap.tileIsWalkable(Point(this.x, this.y - 2 - 1))) {
					this.addMoveQueue("up");
				}
			} else if (this.y < this.NewY) {
				if (currentMap.tileIsWalkable(Point(this.x, this.y - 2 + 1))) {
					this.addMoveQueue("down");
				}
			} else if (this.x > this.NewX) {
				if (currentMap.tileIsWalkable(Point(this.x - 1, this.y - 2))) {
					this.addMoveQueue("left");
				}
			} else if (this.x < this.NewX) {
				if (currentMap.tileIsWalkable(Point(this.x + 1, this.y - 2))) {
					this.addMoveQueue("right");
				}
			}

			this.updatesWithoutMove++;

			if (this.updatesWithoutMove > 10) {
				this.x = this.NewX;
				this.y = this.NewY;
				this.updatesWithoutMove = 0;
			}
		} else {
			this.updatesWithoutMove = 0;
		}
	}




	this.addMoveQueue = function (moveDirection)    // Define Method
	{
		this.moveQueue.push(moveDirection.toLowerCase());
	}

	this.drawNames = function (ctx)    // Define Method
	{
		if (this.name.indexOf("'s Pet") > -1) {
			return;
		}


		ctx.font = "bold 11px sans-serif";
		ctx.textAlign = "center";
		if (friendsList.indexOf(this.id) > -1) {
			drawShadowText(ctx, this.name, this.drawPosX + 12, this.drawPosY - 1, "#BBDEFB");
		}
		else {
			drawShadowText(ctx, this.name, this.drawPosX + 12, this.drawPosY - 1);
		}

		if (this.msg != "") {
			drawShadowText(ctx, this.msg, this.drawPosX + 12, this.drawPosY - 14, "#c4d52b");
		}

	}
	this.drawImage = function (ctx)    // Define Method
	{

		//context.drawImage(img,sx,sy,swidth,sheight,dx,dy,dwidth,dheight);
		if (this.ImageRef == null) {
			for (var i = 0; i < charsets.length; i++) {
				var img = charsets[i];

				if ((img.className == this.trainerimg || img.className == (this.trainerimg + ".png")) && this.ImageRef == null) {

					if ((this.name.indexOf("'s Pet") > 0) || (this.name.indexOf("'s Pet") < 0 && img.className == this.trainerimg)) { //why do we need this? gotta check
						this.ImageRef = img;
						if (img.getAttribute('width') == 64) {
							this.frameCount = 1;
						}
						if (img.getAttribute('width') == 32) {
							this.frameCount = 0;
						}
						this.spritePosX = parseInt(img.getAttribute('spritePosX'));
						this.spritePosY = parseInt(img.getAttribute('spritePosY'));

					}
				}
			}
		}

		if (this.ImageRef != null) {
			ctx.drawImage(this.ImageRef, this.spritePosX + this.drawStartX, this.spritePosY + this.drawStartY, 32, 32, this.drawPosX - 5, this.drawPosY, 32, 32);

		}

		if (parseInt(this.inbattle) == 1) {
			ctx.drawImage(resourceByKey("pokeballicon"), this.drawPosX + 4, this.drawPosY - 26);
		}




	}



	this.updateTextureCoords = function ()    // Define Method
	{

		var startX = 0;
		var startY = 0;

		if (this.direction == 0) {
			switch (this.stepAnimation) {
				case 0:
					startX = 0;
					startY = 0;
					break;
				case 1:
					startX = 1;
					startY = 0;
					break;
				case 2:
					startX = 2;
					startY = 0;
					break;
			}
		} else if (this.direction == 1) {
			switch (this.stepAnimation) {
				case 0:
					startX = 0;
					startY = 1;
					break;
				case 1:
					startX = 1;
					startY = 1;
					break;
				case 2:
					startX = 2;
					startY = 1;
					break;
			}
		} else if (this.direction == 2) {
			switch (this.stepAnimation) {
				case 0:
					startX = 0;
					startY = 2;
					break;
				case 1:
					startX = 1;
					startY = 2;
					break;
				case 2:
					startX = 2;
					startY = 2;
					break;
			}
		} else {
			switch (this.stepAnimation) {
				case 0:
					startX = 0;
					startY = 3;
					break;
				case 1:
					startX = 1;
					startY = 3;
					break;
				case 2:
					startX = 2;
					startY = 3;
					break;
			}
		}

		this.drawStartX = startX * 32;
		this.drawStartY = startY * 32;
	}

	return this;
}

var mmoUsers = new Array();

function updateMMOEvents(updateData) {

	for (var k = 0; k < mmoUsers.length; k++) {
		mmoUsers[k].updated = false;
	}
	var dataRaw = updateData.split("^");
	for (var k = 1; k < dataRaw.length; k++) {

		if (dataRaw[k] != "") {
			var dataUser = dataRaw[k].split("|");
			if (bShowUsers || friendsList.indexOf(dataUser[0]) > -1) {
				var user = mmoUserByName(dataUser[1]);
				if (user == null) {
					//add id,name,trainerimg

					user = new MMOUser(dataUser[0], dataUser[1], dataUser[2]);
					mmoUsers.push(user);
				}


				//update mapid,x,y,direction,step,inbattle

				user.mapid = dataUser[3];

				user.NewX = parseInt(dataUser[4]);
				user.NewY = parseInt(dataUser[5]);

				if (user.x == 0) {
					user.x = user.NewX;
					user.y = user.NewY;
				}

				user.direction = parseInt(dataUser[6]);
				user.step = parseInt(dataUser[7]);
				user.isRunning = parseInt(dataUser[8]);
				user.inbattle = dataUser[9];
				user.updated = true;
			}
		}
	}

	//remove old connections
	for (var k = 0; k < mmoUsers.length; k++) {
		if (k < mmoUsers.length) {
			if (mmoUsers[k].updated == false) {
				mmoUsers.splice(k, 1);
				k--;
			}
		}
	}

}

function mmoUserByName(name) {
	for (var k = 0; k < mmoUsers.length; k++) {
		if (name == mmoUsers[k].name) {
			return mmoUsers[k];
		}
	}
	return null;
}


function Point(x, y) {
	this.X = x;
	this.Y = y;
	return this;
}

// ################################################
// ### GAME EVENT CLASS ###########################
// ################################################
function ScriptLine(line, func, args) {
	this.func = func;
	this.args = args;
	this.line = line;
	return this;
}


function GameEgg(node) {
	if (node) {

		this.id = nodeValue(firstChildNodeNamed("id", node));
		this.steps = nodeValue(firstChildNodeNamed("steps", node));

	}
	return this;
}

function GameItem(node) {
	if (node) {

		this.id = nodeValue(firstChildNodeNamed("id", node));
		this.name = nodeValue(firstChildNodeNamed("name", node));
		this.file = nodeValue(firstChildNodeNamed("file", node));
		this.qty = nodeValue(firstChildNodeNamed("qty", node));
	}
	return this;
}

function gameEvent(node) {
	this.moveQueue = new Array();
	this.mapPosition = new Object;

	this.bEventEnabled = false;
	this.bHidden = false;


	this.bIsUser = true;
	this.id = 0;
	this.name = "";
	this.mapPosition.X = 0;
	this.mapPosition.Y = 0;
	this.spriteName = "";
	this.type = "";
	this.direction = 0;
	this.moveType = "";

	this.quest = 0;

	this.frameCount = 2;

	//Event Properties
	this.eventData = new Array();

	this.mapPosition.X = 0;
	this.mapPosition.Y = 0;

	//Core Variables
	if (node) {

		this.id = nodeValue(firstChildNodeNamed("id", node));
		this.name = nodeValue(firstChildNodeNamed("name", node));
		this.mapPosition.X = parseInt(nodeValue(firstChildNodeNamed("x", node))) - 1;
		this.mapPosition.Y = parseInt(nodeValue(firstChildNodeNamed("y", node))) + 1;
		this.type = nodeValue(firstChildNodeNamed("type", node));
		this.spriteName = nodeValue(firstChildNodeNamed("style", node));
		this.direction = parseInt(nodeValue(firstChildNodeNamed("direction", node)));
		this.moveType = nodeValue(firstChildNodeNamed("movement", node));
		this.bIsUser = false;
		this.bEventEnabled = true;

		this.quest = parseInt(nodeValue(firstChildNodeNamed("quest", node)));


		var script = firstChildNodeNamed("script", node);
		for (var i = 0; i < script.childNodes.length; i++) {
			line = script.childNodes[i];
			this.eventData.push(new ScriptLine(nodeValue(firstChildNodeNamed("line", line)), nodeValue(firstChildNodeNamed("function", line)), nodeValue(firstChildNodeNamed("arguments", line))));
		}

	}


	//Movement
	this.stepPart = 0;
	this.stepAnimation = 0;
	this.run = false;

	this.bJumping = false;
	this.jumpYAdd = 0;
	this.jumpYAcc = 0;

	this.drawStartX = 0;
	this.drawStartY = 0;
	this.X = 0;
	this.Y = 0;

	this.offsetX = 0;
	this.offsetY = 0;
	this.stepX = 0;
	this.stepY = 0;

	this.msg = "";
	this.msgTick = 0;

	this.spritePosX = 0;
	this.spritePosY = 0;

	this.bHasAppearance = false;
	if (this.spriteName != "") {
		this.bHasAppearance = true;
	}

	this.ImageRef = null;

	this.drawImage = function (ctx)    // Define Method
	{

		//context.drawImage(img,sx,sy,swidth,sheight,dx,dy,dwidth,dheight);
		if (this.ImageRef == null) {
			for (var i = 0; i < charsets.length; i++) {
				var img = charsets[i];
				if (img.src) {
					if (img.className == this.spriteName) {
						this.ImageRef = img;
						if (img.getAttribute('width') == 64) {
							this.frameCount = 1;
						}
						if (img.getAttribute('width') == 32) {
							this.frameCount = 0;
						}
						this.spritePosX = parseInt(img.getAttribute('spritePosX'));
						this.spritePosY = parseInt(img.getAttribute('spritePosY'));

					}
				}
			}
		}
		if (this.ImageRef != null) {
			if (this.bHidden == false) {
				ctx.drawImage(this.ImageRef, this.spritePosX + this.drawStartX, this.spritePosY + this.drawStartY, 32, 32, this.X - 5, this.Y, 32, 32);
				if (parseInt(this.quest) > 0) {
					ctx.drawImage(resourceByKey("battleicon"), this.X + 2, this.Y - 14);
				}
			}
		}
	}


	this.initWithData = function (data)    // Define Method
	{

		this.processConditions();
		this.evaluate();
	}

	this.initAsPlayer = function (position)    // Define Method
	{
		this.bIsUser = true;
		this.bEventEnabled = true;

		this.spriteName = userSprite;
		this.direction = 1;

		this.mapPosition.X = position.X;
		this.mapPosition.Y = position.Y;




		this.evaluate();
	}

	this.processConditions = function ()    // Define Method
	{
		this.bEventEnabled = true;
	}

	this.addMoveQueue = function (moveDirection)    // Define Method
	{
		this.moveQueue.push(moveDirection.toLowerCase());
	}

	/*
	THESE NEED TO BE CODED TO HAPPEN WHEN THEY HIT THE TOP OF THE QUEUE #####
			} else if( moveDirection.ToLower() == "jump" ) {
				bJumping = true;
				jumpYAcc = -8;
				bAllow = true;
			} else if( moveDirection.ToLower() == "face up" ) {
				direction = 0;
			} else if( moveDirection.ToLower() == "face down" ) {
				direction = 1;
			} else if( moveDirection.ToLower() == "face left" ) {
				direction = 2;
			} else if( moveDirection.ToLower() == "face right" ) {
				direction = 3;
			} else if( moveDirection.ToLower() == "hide" ) {
				sprite.Alpha = 0;
				bHidden = true;
			} else if( moveDirection.ToLower() == "show" ) {
				sprite.Alpha = 1;
				bHidden = false;
			}
	*/

	this.evaluate = function ()    // Define Method
	{
		if (this.bEventEnabled == false) {
			return;
		}
		if (currentMap == null) {
			return;
		}
		if (this.bIsUser == false && this.bHidden == false) {
			this.processNPCMovement();
		}
		this.processMoveQueue();
		this.updatePosition();

		if (this.msg != "") {
			this.msgTick++;
			if (this.msgTick > 250) {
				this.msg = "";
			}
		}
	}

	this.processNPCMovement = function ()    // Define Method
	{
		if (this.moveQueue.length == 0 && activeScript.length == 0 && bInBattle == false) {
			if (this.moveType == "Slow Random" || this.moveType == "Fast Random") {

				//Random Movement
				if (Math.floor(Math.random() * 10) == 1) {
					var randDirection = Math.floor(Math.random() * 4);
					if (randDirection == 0) {
						if (currentMap.tileIsWalkable(Point(this.mapPosition.X, this.mapPosition.Y - 2 - 1))) {
							this.addMoveQueue("up");
						}
					} else if (randDirection == 1) {
						if (currentMap.tileIsWalkable(Point(this.mapPosition.X, this.mapPosition.Y - 2 + 1))) {
							this.addMoveQueue("down");
						}
					} else if (randDirection == 2) {
						if (currentMap.tileIsWalkable(Point(this.mapPosition.X - 1, this.mapPosition.Y - 2))) {
							this.addMoveQueue("left");
						}
					} else {
						if (currentMap.tileIsWalkable(Point(this.mapPosition.X + 1, this.mapPosition.Y - 2))) {
							this.addMoveQueue("right");
						}
					}
				}
			} else if (this.moveType == "Follow User") {
				var xDif = userEvent.mapPosition.X - this.mapPosition.X;
				var yDif = userEvent.mapPosition.Y + 2 - this.mapPosition.Y;
				steps = 0;
				var dir = "";

				if (userEvent.moveQueue.length != 0) {
					if (xDif != 0) {
						if (xDif < 0) {
							dir = "left";
							steps = -xDif - 2;
						} else {
							dir = "right";
							steps = xDif + 2;
						}
					}
					if (yDif != 0) {
						if (yDif < 0) {
							dir = "up";
							steps = -yDif;
						} else {
							dir = "down";
							steps = yDif;
						}
					}



					if (dir != "") {
						this.addMoveQueue(dir);
					}


				}
			}
		}
	}

	this.processMoveQueue = function ()    // Define Method
	{
		if (currentMap == null) {
			return false;
		}



		var bPassedCheck = false;
		if (!this.bIsUser) {
			bPassedCheck = true;
			if (this.moveQueue.length > 0) {
				if (this.moveQueue[0].toLowerCase() == "face up") {
					this.direction = 0;
					this.moveQueue.splice(0, 1);
				} else if (this.moveQueue[0].toLowerCase() == "face down") {
					this.direction = 1;
					this.moveQueue.splice(0, 1);
				} else if (this.moveQueue[0].toLowerCase() == "face left") {
					this.direction = 2;
					this.moveQueue.splice(0, 1);
				} else if (this.moveQueue[0].toLowerCase() == "face right") {
					this.direction = 3;
					this.moveQueue.splice(0, 1);
				} else if (this.moveQueue[0].toLowerCase() == "hide") {
					this.bHidden = true;
					this.moveQueue.splice(0, 1);
				} else if (this.moveQueue[0].toLowerCase() == "show") {
					this.bHidden = false;
					this.moveQueue.splice(0, 1);
				}

			}
		} else {
			while (bPassedCheck == false) {
				if (this.moveQueue.length > 0) {
					if (this.moveQueue[0] == "up") {
						if (!currentMap.tileIsWalkable(Point(this.mapPosition.X, this.mapPosition.Y - 1))) {
							this.moveQueue.splice(0, 1);
							this.direction = 0;
						} else {
							bPassedCheck = true;
						}
					} else if (this.moveQueue[0] == "down") {
						if (!currentMap.tileIsWalkable(Point(this.mapPosition.X, this.mapPosition.Y + 1))) {
							this.moveQueue.splice(0, 1);
							this.direction = 1;
						} else {
							bPassedCheck = true;
						}
					} else if (this.moveQueue[0] == "left") {
						if (!currentMap.tileIsWalkable(Point(this.mapPosition.X - 1, this.mapPosition.Y))) {
							this.moveQueue.splice(0, 1);
							this.direction = 2;
						} else {
							bPassedCheck = true;
						}
					} else if (this.moveQueue[0] == "right") {
						if (!currentMap.tileIsWalkable(Point(this.mapPosition.X + 1, this.mapPosition.Y))) {
							this.moveQueue.splice(0, 1);
							this.direction = 3;
						} else {
							bPassedCheck = true;
						}

					} else if (this.moveQueue[0] == "jump") {
						bPassedCheck = true;
					} else if (this.moveQueue[0].toLowerCase() == "face up") {
						this.direction = 0;
						this.moveQueue.splice(0, 1);
					} else if (this.moveQueue[0].toLowerCase() == "face down") {
						this.direction = 1;
						this.moveQueue.splice(0, 1);
					} else if (this.moveQueue[0].toLowerCase() == "face left") {
						this.direction = 2;
						this.moveQueue.splice(0, 1);
					} else if (this.moveQueue[0].toLowerCase() == "face right") {
						this.direction = 3;
						this.moveQueue.splice(0, 1);
					} else if (this.moveQueue[0].toLowerCase() == "hide") {
						this.bHidden = true;
						this.moveQueue.splice(0, 1);
					} else if (this.moveQueue[0].toLowerCase() == "show") {
						this.bHidden = false;
						this.moveQueue.splice(0, 1);
					} else {
						bPassedCheck = true;
					}
				} else {
					bPassedCheck = true;
				}

				if (bPassedCheck == false) {
					//this.moveQueue.splice(0, 1);
				}
			}
		}

		if (this.moveQueue.length > 0) {

			if (this.moveQueue[0].toLowerCase() == "up") {
				this.direction = 0;
			} else if (this.moveQueue[0].toLowerCase() == "down") {
				this.direction = 1;
			} else if (this.moveQueue[0].toLowerCase() == "left") {
				this.direction = 2;
			} else if (this.moveQueue[0].toLowerCase() == "right") {
				this.direction = 3;
			} else if (this.moveQueue[0].toLowerCase() == "jump") {
				this.jumpYAcc = this.jumpYAcc + 2;
				this.jumpYAdd = this.jumpYAdd + this.jumpYAcc;

				if (this.jumpYAcc == 4) {
					this.jumpYAcc = 0;
					this.jumpYAdd = 0;
					this.bJumping = false;

					this.moveQueue.splice(0, 1);
				}

				return;
			}

			if (this.stepPart == 8 || this.stepPart == 0) {
				this.stepAnimation++;
				if (this.stepAnimation > this.frameCount)
					this.stepAnimation = 0;
			}

			this.stepPart = this.stepPart + 4;
			if (this.moveType == "Slow Random")
				this.stepPart = this.stepPart - 2;

			if (this.run)
				this.stepPart += 4;

			if (keyState.btn2 && this.moveQueue.length == 1 && (this.bIsUser || this.id == -1))
				this.stepPart = this.stepPart + 4;

			if (keyState.btn2 && this.moveQueue.length == 1 && (!this.bIsUser) && this.id != -1 && this.moveType == "Follow User")
				this.stepPart = this.stepPart + 4;

			if (this.stepPart >= 16) {
				this.stepPart = 0;

				//update the coordanates at the end of the step.
				if (this.moveQueue[0] == "up") {
					this.mapPosition.Y = this.mapPosition.Y - 1;
				} else if (this.moveQueue[0] == "down") {
					this.mapPosition.Y = this.mapPosition.Y + 1;
				} else if (this.moveQueue[0] == "left") {
					this.mapPosition.X = this.mapPosition.X - 1;
				} else {
					this.mapPosition.X = this.mapPosition.X + 1;
				}

				if (this.bIsUser) {
					if (activeScript.length == 0) {
						if (this.eventCheck() == true) {
							this.arrivedOnTile();
						}
					}
				}

				this.moveQueue.splice(0, 1);
			}

		}
	}




	this.eventCheck = function ()    // Define Method
	{
		for (var i = 0; i < currentMap.events.length; i++) {
			var evnt = currentMap.events[i];

			if (evnt.mapPosition.X == userEvent.mapPosition.X && evnt.mapPosition.Y == userEvent.mapPosition.Y + 2) {
				if (evnt.type == "On Walk" && evnt.bEventEnabled && activeScript.length == 0 && evnt.eventData.length > 0) {
					if (triggerEvent(evnt, false)) {
						return false;
					}
				}
			}

			//type
			if (evnt.bEventEnabled && (evnt.type == "X1" || evnt.type == "X2" || evnt.type == "X3" || evnt.type == "X10" || evnt.type == "X15" || evnt.type == "X20") && activeScript.length == 0 && evnt.eventData.length > 0) {
				var stepsCheck = 1;
				if (evnt.type == "X2")
					stepsCheck = 2;
				if (evnt.type == "X3")
					stepsCheck = 3;
				if (evnt.type == "X10")
					stepsCheck = 10;
				if (evnt.type == "X15")
					stepsCheck = 15;
				if (evnt.type == "X20")
					stepsCheck = 20;



				for (var check = 1; check <= stepsCheck; check++) {
					if (evnt.mapPosition.X + check == userEvent.mapPosition.X && evnt.mapPosition.Y == userEvent.mapPosition.Y + 2 && evnt.direction == 3) {
						if (triggerEvent(evnt, true)) {
							return false;
						}
					}
					if (evnt.mapPosition.X - check == userEvent.mapPosition.X && evnt.mapPosition.Y == userEvent.mapPosition.Y + 2 && evnt.direction == 2) {
						if (triggerEvent(evnt, true)) {
							return false;
						}
					}
					if (evnt.mapPosition.X == userEvent.mapPosition.X && evnt.mapPosition.Y + check == userEvent.mapPosition.Y + 2 && evnt.direction == 1) {
						if (triggerEvent(evnt, true)) {
							return false;
						}
					}
					if (evnt.mapPosition.X == userEvent.mapPosition.X && evnt.mapPosition.Y - check == userEvent.mapPosition.Y + 2 && evnt.direction == 0) {
						if (triggerEvent(evnt, true)) {
							return false;
						}
					}
				}
			}
		}
		return true;
	}

	this.arrivedOnTile = function ()    // Define Method
	{
		if (this.mapPosition.X == -1) {
			if (firstChildNodeNamed("west", mapEvents) != null) {
				loadMap(nodeValue(firstChildNodeNamed("west", mapEvents)), "wrap", 2)
				return;
			}
		}
		if (this.mapPosition.X + 2 == Math.floor(mapWidth / 16)) {
			if (firstChildNodeNamed("east", mapEvents) != null) {
				loadMap(nodeValue(firstChildNodeNamed("east", mapEvents)), "wrap", 3)
				return;
			}
		}
		if (this.mapPosition.Y + 2 == Math.floor(mapHeight / 16)) {
			if (firstChildNodeNamed("south", mapEvents) != null) {
				loadMap(nodeValue(firstChildNodeNamed("south", mapEvents)), "wrap", 1)
				return;
			}
		}
		if (this.mapPosition.Y == -1) {
			if (firstChildNodeNamed("north", mapEvents) != null) {
				loadMap(nodeValue(firstChildNodeNamed("north", mapEvents)), "wrap", 0)
				return;
			}
		}

		if (this.isInGrass()) {
			stepsInGrass++;
		} else {

		}
		if (stepsInGrass > 8) {


			//TODO: START A BATTLE!!!				
			battleMonsterAtCoord();


			stepsInGrass = 0;


		}

		if (activeScript.length == 0) {
			if (parseInt(Math.random() * 15) == 2) {
				if (eggs.length > 0) {
					for (var i = 0; i < eggs.length; i++) {
						if (eggs[i].steps > 45) {
							hatchingEgg = true;
							loadUtility("action=hatch");
							break;
						}
					}
				}
			}
		}


	}

	this.isInGrass = function ()    // Define Method
	{
		for (var i = 0; i < currentMap.grassPatches.length; i++) {
			var patch = currentMap.grassPatches[i];
			if (this.mapPosition.X >= patch.X1 && this.mapPosition.X <= patch.X2 - 2) {
				if (this.mapPosition.Y + 2 >= patch.Y1 && this.mapPosition.Y + 2 <= patch.Y2) {
					return true;
				}
			}
		}
		return false;
	}



	this.updatePosition = function ()    // Define Method
	{
		var ySink = 0;

		this.stepX = 0;
		this.stepY = 0;

		this.offsetX = 0;
		this.offsetY = 0;


		var MyX = this.mapPosition.X * 16;
		var MyY = this.mapPosition.Y * 16;

		if (currentMap == null) {
			return;
		}

		// if( this.bIsUser == false ) {
		// 	//NPC EVENT POSITIONING

		if (this.moveQueue.length > 0) {
			if (this.moveQueue[0] == "up") {
				this.stepY = -this.stepPart;
			} else if (this.moveQueue[0] == "down") {
				this.stepY = this.stepPart;
			} else if (this.moveQueue[0] == "left") {
				this.stepX = -this.stepPart;
			} else {
				this.stepX = this.stepPart;
			}
		}

		if (this.bIsUser == false) {
			var additionalDown = currentMap.mapHeight / 2 - cvsHeight / 2;
			this.X = mapLeft + MyX + this.stepX + 13;
			//this.Y = -mapTop-currentMap.mapHeight/2 + MyY + this.stepY - Math.floor(this.jumpYAdd)+2-130+32;
			this.Y = -mapTop - cvsHeight / 2 - currentMap.mapHeight / 2 + MyY + this.stepY - Math.floor(this.jumpYAdd) + 2 + 28 + (additionalDown - 192);
		} else {
			var additionalDown = currentMap.mapHeight / 2 - cvsHeight / 2;
			this.X = mapLeft + MyX + this.stepX + 13;
			//this.Y = -mapTop-currentMap.mapHeight/2 + MyY + this.stepY - Math.floor(this.jumpYAdd)+2-130+32;
			this.Y = -mapTop - cvsHeight / 2 - currentMap.mapHeight / 2 + MyY + this.stepY - Math.floor(this.jumpYAdd) + 60 + (additionalDown - 192);
		}

		// } else {
		// 	//USER EVENT POSITIONING
		// 	if( this.moveQueue.length > 0 ) {
		// 		if( this.moveQueue[0] == "left" ) {
		// 			if(  MyX <= cvsWidth/2 || MyX > currentMap.mapWidth - cvsWidth/2 ) {
		// 				this.stepX = -this.stepPart;
		// 			}
		// 		} else if( this.moveQueue[0] == "right" ) {
		// 			if(  MyX < cvsWidth/2 || MyX >= currentMap.mapWidth - cvsWidth/2 ) {
		// 				this.stepX = this.stepPart;
		// 			}
		// 		}
		// 	}
		// 	if(  MyY <= cvsHeight/2 || MyY >= currentMap.mapHeight - cvsHeight/2 ) {
		// 		if( this.moveQueue.length > 0 ) {
		// 			if( this.moveQueue[0] == "up" ) {
		// 				this.stepY = -this.stepPart;
		// 			} else if( this.moveQueue[0] == "down" ) {
		// 				this.stepY = this.stepPart;
		// 			}
		// 		}
		// 	}

		// 	if( this.moveQueue.length > 0 ) {
		// 		if( this.moveQueue[0] == "right" ) {
		// 			if( MyX+this.stepX >= currentMap.mapWidth - cvsWidth/2 ) {
		// 				this.offsetX = cvsWidth/2 + ( currentMap.mapWidth - MyX-this.stepX ) * -1;
		// 			}
		// 		} else {
		// 			if( MyX-this.stepX > currentMap.mapWidth - cvsWidth/2 ) {
		// 				this.offsetX = cvsWidth/2 + ( currentMap.mapWidth - MyX-this.stepX ) * -1;
		// 			}
		// 		}
		// 	} else {
		// 		if( MyX-this.stepX > currentMap.mapWidth - cvsWidth/2 ) {
		// 			this.offsetX = cvsWidth/2 + ( currentMap.mapWidth - MyX-this.stepX ) * -1;
		// 		}
		// 	}

		// 	if( this.moveQueue.length > 0 ) {
		// 		if(  this.moveQueue[0] == "left" ) {
		// 			if( MyX+this.stepX <= cvsWidth/2 ) {
		// 				this.offsetX = (cvsWidth/2-MyX-this.stepX)*-1;
		// 			}
		// 		} else {
		// 			if( MyX-this.stepX < cvsWidth/2 ) {
		// 				this.offsetX = (cvsWidth/2-MyX-this.stepX)*-1;
		// 			}
		// 		}
		// 	} else {
		// 		if( MyX-this.stepX < cvsWidth/2 ) {
		// 			this.offsetX = (cvsWidth/2-MyX-this.stepX)*-1;
		// 		}
		// 	}

		// 	if( cvsWidth > currentMap.mapWidth) {
		// 		this.offsetX = (cvsWidth/2-MyX-this.stepX)*-1;
		// 	}

		// 	// @todo
		// 	if( MyY+this.stepY > currentMap.mapHeight - cvsHeight/2 ) {
		// 		this.offsetY = cvsHeight/2 + (currentMap.mapHeight - MyY-this.stepY ) * -1;
		// 	}
		// 	if( MyY+this.stepY < cvsHeight/2 ) {
		// 		this.offsetY = (cvsHeight/2-MyY-this.stepY)*-1;
		// 	}

		// 	var half = (cvsWidth - currentMap.mapWidth);
		// 	if( half < 0 )
		// 		half = 0;


		// 	if( cvsWidth > mapWidth ) {
		// 		half=0;
		// 	}


		// 	this.X = half+cvsWidth/2 + this.offsetX+13;
		// 	this.Y = cvsHeight/2 + this.offsetY - ySink - Math.floor(this.jumpYAdd);


		//}

		this.updateTextureCoords();
	}

	this.updateTextureCoords = function ()    // Define Method
	{

		var startX = 0;
		var startY = 0;

		if (this.direction == 0) {
			switch (this.stepAnimation) {
				case 0:
					startX = 0;
					startY = 0;
					break;
				case 1:
					startX = 1;
					startY = 0;
					break;
				case 2:
					startX = 2;
					startY = 0;
					break;
			}
		} else if (this.direction == 1) {
			switch (this.stepAnimation) {
				case 0:
					startX = 0;
					startY = 1;
					break;
				case 1:
					startX = 1;
					startY = 1;
					break;
				case 2:
					startX = 2;
					startY = 1;
					break;
			}
		} else if (this.direction == 2) {
			switch (this.stepAnimation) {
				case 0:
					startX = 0;
					startY = 2;
					break;
				case 1:
					startX = 1;
					startY = 2;
					break;
				case 2:
					startX = 2;
					startY = 2;
					break;
			}
		} else {
			switch (this.stepAnimation) {
				case 0:
					startX = 0;
					startY = 3;
					break;
				case 1:
					startX = 1;
					startY = 3;
					break;
				case 2:
					startX = 2;
					startY = 3;
					break;
			}
		}

		this.drawStartX = startX * 32;
		this.drawStartY = startY * 32;
	}


	return this;
}



// ################################################
// ### MAP CLASS ###########################
// ################################################


function Region(x1, y1, x2, y2) {
	this.X1 = x1;
	this.Y1 = y1;
	this.X2 = x2;
	this.Y2 = y2;
	return this;
}

// ################################################
// ### GAME MAP CLASS ############################# 
// ################################################

function gameMap() {
	this.mapCollisionData = null;

	this.mapWidth = 0;
	this.mapHeight = 0;

	this.mapMusic = '';

	this.tileSize = 16;

	this.grassPatches = new Array();
	this.events = new Array();

	this.loadEvents = function (mapEvents)    // Define Method
	{
		events = new Array();

		var npcs = firstChildNodeNamed("npcs", mapEvents);
		for (var k = 0; k < npcs.childNodes.length; k++) {
			var npc = npcs.childNodes[k];

			events.push(new gameEvent(npc));
		}


		eggs = [];
		var eggsNode = firstChildNodeNamed("eggs", mapEvents);
		for (var k = 0; k < eggsNode.childNodes.length; k++) {
			var egg = eggsNode.childNodes[k];
			eggs.push(new GameEgg(egg));
		}

		inventory = [];
		var inv = firstChildNodeNamed("inventory", mapEvents);
		for (var k = 0; k < inv.childNodes.length; k++) {
			var item = inv.childNodes[k];

			inventory.push(new GameItem(item));
		}


		if (tagAlong != "") {
			follower = new gameEvent();
			events.push(follower);

			follower.id = -1;
			follower.name = parseInt(tagAlong);

			follower.mapPosition.X = userEvent.mapPosition.X;
			follower.mapPosition.Y = userEvent.mapPosition.Y + 2;
			follower.type = "Action Button";
			follower.spriteName = tagAlong + ".png";
			follower.direction = userEvent.direction;
			follower.moveType = "Follow User";
			follower.bIsUser = false;
			follower.bEventEnabled = true;
			follower.eventData.push(new ScriptLine(1, "Display Message", tagAlongName + "!"));
			follower.eventData.push(new ScriptLine(2, "MOVE EVENT", "-1^move to user^1"));
			follower.eventData.push(new ScriptLine(3, "SYNC ALL", ""));
			follower.eventData.push(new ScriptLine(4, "MOVE EVENT", "0^forward^1"));
		}

	}

	this.getEvent = function (id) {
		for (var k = 0; k < events.length; k++) {
			if (events[k].id == id) {
				return events[k];
			}
		}
		return null;
	}

	this.evaluateEvents = function ()    // Define Method
	{
		for (var k = 0; k < events.length; k++) {
			events[k].evaluate();
		}
		for (var k = 0; k < mmoUsers.length; k++) {
			mmoUsers[k].evaluate();
		}
	}

	this.drawEvents = function (ctx, positionToDraw)    // Define Method
	{
		for (var k = 0; k < events.length; k++) {
			if (positionToDraw == "above") {
				if (events[k].mapPosition.Y > userEvent.mapPosition.Y + 2) {

					events[k].drawImage(ctx);
				}
			} else {
				if (events[k].mapPosition.Y <= userEvent.mapPosition.Y + 2) {

					events[k].drawImage(ctx);
				}
			}
		}
		for (var k = 0; k < mmoUsers.length; k++) {
			if (positionToDraw == "above") {
				if (mmoUsers[k].y > userEvent.mapPosition.Y) {
					mmoUsers[k].drawImage(ctx);
				}
			} else {
				if (mmoUsers[k].y <= userEvent.mapPosition.Y) {
					mmoUsers[k].drawImage(ctx);
				}
			}
		}
	}

	this.drawNames = function (ctx)    // Define Method
	{
		for (var k = 0; k < mmoUsers.length; k++) {
			mmoUsers[k].drawNames(ctx);
		}


		if (userEvent.msg != "") {
			ctx.font = "bold 11px sans-serif";
			ctx.textAlign = "center";
			drawShadowText(ctx, userEvent.msg, userEvent.X + 12, userEvent.Y - 1, "#c4d52b");
		} else {
			ctx.font = "bold 11px sans-serif";
			ctx.textAlign = "center";
			drawShadowText(ctx, "You", userEvent.X + 12, userEvent.Y - 1);
		}
	}




	this.load = function (mapData)    // Define Method
	{

		this.tileSize = mapData.getAttribute("tilewidth");
		this.mapWidth = mapData.getAttribute("width") * this.tileSize;
		this.mapHeight = mapData.getAttribute("height") * this.tileSize;



		var tileCount = (this.mapWidth / this.tileSize) * (this.mapHeight / this.tileSize);
		this.mapCollisionData = new Array(tileCount);

		for (var i = 0; i < mapData.childNodes.length; i++) {
			var node = mapData.childNodes[i];

			if (node.nodeName == "layer") {
				if (node.getAttribute("name") == "Collision") {
					var dataNode = firstChildNodeNamed("data", node);
					var data = getDataOfImmediateChild(dataNode);

					data = data.replace(/\r\n/i, '').trim();
					rawMapData = stringToBytes(base64_decode(data));

					//for (var k = 0; k < tileCount; k++)
					//	mapCollisionData[k] = getIntAt(rawData,k*4);

				}
			} else if (node.nodeName == "objectgroup") {
				if (node.getAttribute("name").toLowerCase() == "grass") {
					this.grassPatches = new Array();

					for (var k = 0; k < node.childNodes.length; k++) {
						var object = node.childNodes[k];

						if (object.nodeName != "#text") {
							var x1 = parseInt(object.getAttribute("x")) / this.tileSize;
							var y1 = parseInt(object.getAttribute("y")) / this.tileSize;

							var width = parseInt(object.getAttribute("width")) / this.tileSize;
							var height = parseInt(object.getAttribute("height")) / this.tileSize;

							var x2 = x1 + (width + 1);
							var y2 = y1 + (height + 1);

							this.grassPatches.push(new Region(x1, y1, x2, y2));
						}

					}
				}
			}

		}
	}


	this.getTile = function (x, y) {
		var tilesWide = mapWidth / tileSize;
		var pos = 0;
		x++;
		y++;
		if (y * tilesWide + x >= 0 && y * tilesWide + x < mapCollisionData.length) {
			if (rawMapData) {
				pos = (y * tilesWide + x) * 4;
				if (rawMapData[pos] == 0 && rawMapData[pos + 1] == 0 && rawMapData[pos + 2] == 0 && rawMapData[pos + 3] == 0) {
					return 0;
				}
				return 1;
			}

			//return mapCollisionData[y * tilesWide + x];
		}
		return -1;
	}


	this.tileIsWalkable = function (position)    // Define Method
	{
		if (position.X < -1)
			return false;
		if (position.Y < -1)
			return false;
		if (position.X > this.mapWidth / 16)
			return false;
		if (position.Y > this.mapHeight / 16)
			return false;

		if (this.tileIsFreeFromEvents(position) == false) {
			return false;
		}

		if (this.getTile(position.X, position.Y) == 0) {
			return true;
		}

		return false;
	}

	this.tileIsFreeFromEvents = function (position)    // Define Method
	{

		for (var k = 0; k < events.length; k++) {
			if (events[k].spriteName != "" && events[k].spriteName != null && events[k].bHidden == false && events[k].bEventEnabled == true && events[k].moveType != "Follow User") {
				if (events[k].mapPosition.X == position.X) {
					if (events[k].mapPosition.Y == position.Y + 2) {
						return false;
					}
				}
			}
		}


		//TODO: Complete Event Collision Detection
		return true;
	}

	this.drawRain = function (ctx) {
		ctx.strokeStyle = 'rgba(72,118,184,0.5)';
		ctx.lineWidth = 1.2;
		ctx.lineCap = 'round';
		var w = buffer.width;
		var h = buffer.height;

		var init = [];
		var maxParts = 150;
		for (var a = 0; a < maxParts; a++) {
			init.push({
				x: Math.random() * w,
				y: Math.random() * h,
				l: Math.random() * 1,
				xs: -4 + Math.random() * 4 + 2,
				ys: Math.random() * 10 + 10
			})
		}

		var particles = [];
		for (var b = 0; b < maxParts; b++) {
			particles[b] = init[b];
		}

		function draw() {
			if (mapWeather == "Rain" && !bInBattle) {
				for (var c = 0; c < particles.length; c++) {
					var p = particles[c];
					ctx.beginPath();
					ctx.moveTo(p.x, p.y);
					ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
					ctx.stroke();
				}
				move();
			}
		}

		function move() {
			for (var b = 0; b < particles.length; b++) {
				var p = particles[b];
				p.x += p.xs;
				p.y += p.ys;
				if (p.x > w || p.y > h) {
					p.x = Math.random() * w;
					p.y = -20;
				}
			}
		}
		setInterval(draw, 30);
	}

	this.drawSnow = function (ctx) {
		//snowflake particles
		var mp = 30; //max particles
		var particles = [];
		var W = buffer.width;
		var H = buffer.height;
		for (var i = 0; i < mp; i++) {
			particles.push({
				x: Math.random() * W, //x-coordinate
				y: Math.random() * H, //y-coordinate
				r: Math.random() * 4 + 1, //radius
				d: Math.random() * mp //density
			})
		}
		//Lets draw the flakes
		function draw() {
			if (mapWeather == "Snow" && !bInBattle) {
				ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
				ctx.beginPath();
				for (var i = 0; i < mp; i++) {
					var p = particles[i];
					ctx.moveTo(p.x, p.y);
					ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
				}
				ctx.fill();
				update();
			}
		}

		//Function to move the snowflakes
		//angle will be an ongoing incremental flag. Sin and Cos functions will be applied to it to create vertical and horizontal movements of the flakes
		var angle = 0;
		function update() {
			angle += 0.01;
			for (var i = 0; i < mp; i++) {
				var p = particles[i];
				//Updating X and Y coordinates
				//We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
				//Every particle has its own density which can be used to make the downward movement different for each flake
				//Lets make it more random by adding in the radius
				p.y += Math.cos(angle + p.d) + 1 + p.r / 2;
				p.x += Math.sin(angle) * 2;

				//Sending flakes back from the top when it exits
				//Lets make it a bit more organic and let flakes enter from the left and right also.
				if (p.x > W + 5 || p.x < -5 || p.y > H) {
					if (i % 3 > 0) //66.67% of the flakes
					{
						particles[i] = { x: Math.random() * W, y: -10, r: p.r, d: p.d };
					}
					else {
						//If the flake is exitting from the right
						if (Math.sin(angle) > 0) {
							//Enter from the left
							particles[i] = { x: -5, y: Math.random() * H, r: p.r, d: p.d };
						}
						else {
							//Enter from the right
							particles[i] = { x: W + 5, y: Math.random() * H, r: p.r, d: p.d };
						}
					}
				}
			}
		}
		setInterval(draw, 10);


	}

	return this;
}

function base64_decode(data) {
	// Decodes string using MIME base64 algorithm  

	var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
		ac = 0,
		dec = "",
		tmp_arr = [];

	if (!data) {
		return data;
	}

	data += '';

	do { // unpack four hexets into three octets using index points in b64
		h1 = b64.indexOf(data.charAt(i++));
		h2 = b64.indexOf(data.charAt(i++));
		h3 = b64.indexOf(data.charAt(i++));
		h4 = b64.indexOf(data.charAt(i++));

		bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

		o1 = bits >> 16 & 0xff;
		o2 = bits >> 8 & 0xff;
		o3 = bits & 0xff;

		if (h3 == 64) {
			tmp_arr[ac++] = String.fromCharCode(o1);
		} else if (h4 == 64) {
			tmp_arr[ac++] = String.fromCharCode(o1, o2);
		} else {
			tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
		}
	} while (i < data.length);

	dec = tmp_arr.join('');
	//dec = this.utf8_decode(dec);

	return dec;
}

String.prototype.trim = function () {
	return this.replace(/^\s+|\s+$/g, "");
}

function stringToBytes(str) {
	var ch, st, re = [];
	for (var i = 0; i < str.length; i++) {
		ch = str.charCodeAt(i);  // get char 
		st = [];                 // set up "stack"
		do {
			st.push(ch & 0xFF);  // push byte to stack
			ch = ch >> 8;          // shift value down by 1 byte
		}
		while (ch);
		// add stack contents to result
		// done because chars have "wrong" endianness
		re = re.concat(st.reverse());
	}
	// return an array of bytes
	return re;
}

function getIntAt(arr, offs) {

	if (arr[offs + 0] == 0 && arr[offs + 1] == 0 && arr[offs + 2] == 0 && arr[offs + 3] == 0) {
		return 0;
	}
	return 1;

	return (arr[offs + 0] << 24) +
		(arr[offs + 1] << 16) +
		(arr[offs + 2] << 8) +
		arr[offs + 3];
}


// ################################################
// ### BATTLE CLASS ###########################
// ################################################

//Battle Variables
var bInBattle = false;
var battleStage = 0;
var battleTaskQueue = new Array();

var teamMonsters = new Array();
var opponentMonsters = new Array();

var monSkills = new Array();
var battleItems = new Array();

var doingCaptcha = false;

var captchaImages = new Array();
var captchaKeys = new Array();

var curMon = null;
var curOpp = null;
var nextMon = null;
var nextOpp = null;

var battleScript = new Array();
var battleSelectedMenu = 0;
var battleItemSelectedMenu = 0;
var battleItemPaging = 1;

var battleSwappedMonsters = false;

var battleTick1 = 0;
var battleTick2 = 0;
var battleTick3 = 0;
var battleLoading = false;
var loadExplore = false;

var drawMons = true;
var drawMyHp = true;
var drawOpHp = true;

var bWildBattle = false;

function addToCaptcha(letter) {
	if (doingCaptcha) {
		if (captchaKeypress[parseInt(letter) - 1] == false) {
			captchaKeys.push(letter);
			if (captchaKeys.length == 3) {
				$str = captchaKeys[0] + captchaKeys[1] + captchaKeys[2];
				loadBattle("captcha=" + $str);
			}
			captchaKeypress[parseInt(letter) - 1] = true;
		}
	}
}


function MonsterSkill(id, name, ppleft, pptotal) {
	this.id = id;
	this.name = name;
	this.ppleft = ppleft;
	this.pptotal = pptotal;
}

function BattleItem(id, name, file, qty) {
	this.id = id;
	this.name = name;
	this.file = file;
	this.qty = qty;
}

function BattleMonsterLineup(id, name, level, special, specialName, gender, hpleft, hp, image, type1, type2, reborn, caughtBefore, status, held, meg_item, monster_id) {

	this.id = id;
	this.name = name;
	this.level = level;
	this.special = special;
	this.specialName = specialName;
	this.gender = gender;
	this.hpleft = parseInt(hpleft);
	this.hp = parseInt(hp);
	this.image = image;
	this.type1 = type1;
	this.type2 = type2;
	this.reborn = reborn;
	this.caughtBefore = caughtBefore;
	this.status = status;
	this.held = held;
	this.meg_item = meg_item;
	this.monster_id = monster_id; //25 for pika

	return this;
}


function showMonsterAtCoord() {
	if (!battleLoading) {
		bIsLoadingWildDialog = true;
		var form = document.getElementById('mws-explore-encounter');
		form.innerHTML = "<center><img src='/images/preloader.gif' tag='loading'/><br/>Loading</center>";

		loadBattle("x=" + userEvent.mapPosition.X + "&y=" + userEvent.mapPosition.Y + "&action=encounter");
	}
}

function showMonsterAtCoordCallback() {
	var form = document.getElementById('mws-explore-encounter');

	if (curOpp != null) {
		console.log(curOpp);
		//mws-jui-dialog-monster
		var gender = " Male ";
		if (curOpp.gender != "M")
			gender = " Female ";
		var level = curOpp.level;
		var specialName = curOpp.specialName;
		if (specialName != "")
			specialName = specialName + " ";

		var name = curOpp.name;

		if (curOpp.special != "0") {
			name = "<span class='encounter-special'>" + curOpp.name + "</span>";
		}

		bWildBattleIsReady = true;
		var isCaughtBefore = "<img style=' width: 16px; height: 16px; ' src = '" + cdn + "/images/Pokemon_Caught_Icon.png' title = 'You have already caught this before.'>";
		if (curOpp.caughtBefore == 0)
			isCaughtBefore = "<img style=' width: 16px; height: 16px;' src = '" + cdn + "/images/Pokemon_UnCaught_Icon.png' title = 'You have not caught this before.'>";

		form.innerHTML = "<center><img src='" + curOpp.image + "' style='padding-top:10px;'/><div style='padding-left: 8px;padding-right: 8px;'>You have encountered a level " + level + gender + specialName + name + ". </div>" + isCaughtBefore + "<br><input type='button' id='btnBattle' onclick='battleWildSelected();' class='mws-button red' value='Battle' style='margin-bottom:5px;'/></center>";
		/*
		ga('send', {
			hitType: 'event',
			eventCategory: 'Encounter',
			eventAction: 'Map Name: ' + mapName,
			eventLabel: 'Wild',
			eventValue: curOpp.monster_id
		});*/
	} else {
		form.innerHTML = "";
	}
	bIsLoadingWildDialog = false;
}


function battleMonsterAtCoord() {
	battleScript = new Array();
	playSFX("MonAppear");
	showMonsterAtCoord();
	return;

	//bInBattle = true; - this is set in the above script funciton
}

function battleWildSelected() {
	battleSelectedMenu = 2;
	playSFX("battle");
	playMusic("battle1");
	if (prevPlayingSong) {
		try {
			prevPlayingSong.currentTime = 0;
		}
		catch (err) {
		}
	}

	battleLoading = false;
	bWildBattle = true;
	bInBattle = true;

	wipeWildMonsterBox();
}

function battleWithTrainer() {
	curOpp = null;
	scriptAddLine(battlescreen, "TRAINER");
	//bInBattle = true; - this is set in the above script funciton
	battleSelectedMenu = 2;
	playSFX("battle");
	playMusic("battle1");

	curOpp = null;
	nextOpp = null;
	curMon = null;
	nextMon = null;

	curMonImage.src = cdn + '/images/blank.png';
	curOppImage.src = cdn + '/images/blank.png';

	if (prevPlayingSong)
		prevPlayingSong.currentTime = 0;
	bWildBattle = false;
	wipeWildMonsterBox();
}

function wipeWildMonsterBox() {
	bWildBattleIsReady = false;
	var form = document.getElementById('mws-explore-encounter');
	if (form) {
		form.innerHTML = "";
	}

}

function battleScriptEndLine() {

	battleScript.splice(0, 1);
	battleScriptStartLine();

	drawMons = true;
	drawOpHp = true;
	drawMyHp = true;


}

function battleScriptStartLine() {
	battleTick1 = 0;
	battleTick2 = 0;
	battleTick3 = 0;

	if (!bInBattle)
		return;

	var centerX = cvsWidth / 2;
	var centerY = cvsHeight / 2;

	if (battleScript.length > 0) {
		var data = battleScript[0].split("|");
		//battleSelectedMenu = 2;

		if (data[0] == "MSG") {
			drawMons = true;
			drawOpHp = true;
			drawMyHp = true;

			repositionMonsters();
			curMonImage.style.display = 'block';
			curOppImage.style.display = 'block';
		} else if (data[0] == "ATTACK") {
			drawMons = true;
			drawOpHp = true;
			drawMyHp = true;
			playSFX("hit");

		} else if (data[0] == "MUTATE") {
			drawMons = false;
			drawOpHp = false;
			drawMyHp = false;
			var args = data[1].split("-");

			//load required images: Monster Image
			var img = resourceByKey(args[1]);
			if (img == null)
				screenResources.push(new ResourceImage(args[1], args[1]));

			//load required images: Arrow Image
			img = resourceByKey("resultset_next.png");
			if (img == null)
				screenResources.push(new ResourceImage("/images/resultset_next.png", "resultset_next.png"));

		} else if (data[0] == "HPCHANGE") {
			battleTick3 = parseInt(data[2]) / 10;
		}
		else if (data[0] == "DEFEAT") {

			if ((parseInt(data[1]) < 6 && !battlePlayerAwayTeam) || (parseInt(data[1]) >= 6 && battlePlayerAwayTeam)) {
				battleSelectedMenu = 7;
				curMon.hpleft = 0;
				curMonImage.src = cdn + '/images/blank.png';
			} else {
				curOpp.hpleft = 0;
				curOpp = nextOpp;
				curOppImage.src = cdn + '/images/blank.png';
			}
		} else if (data[0] == "SWAP") {
			var monImage = null;

			if ((parseInt(data[1]) < 6 && !battlePlayerAwayTeam) || (parseInt(data[1]) >= 6 && battlePlayerAwayTeam)) {
				if (nextMon != null) {
					curMon = nextMon;
				}
				//sharks
				if (data[2] == null)
					data[2] = 0;
				//end

				if (curMon != null) {
					curMon.hpleft = parseInt(data[2]);
					curMonImage.src = curMon.image;
					curMonImage.style.display = 'block';
				}
				repositionMonsters();


			} else if ((parseInt(data[1]) < 6 && battlePlayerAwayTeam) || (parseInt(data[1]) >= 6 && !battlePlayerAwayTeam)) {
				if (nextOpp != null) {
					curOpp = nextOpp;
				}
				curOpp.hpleft = parseInt(data[2]);

				curOppImage.src = curOpp.image;
				curOppImage.style.display = 'block';
				repositionMonsters();

			}


			battleScriptEndLine();
		} else if (data[0] == "SFX") {
			playSFX(data[1]);
			battleScriptEndLine();
		} else if (data[0] == "LEVELUP") {
			playSFX("levelup");
			battleScriptEndLine();
		} else if (data[0] == "CLIENT SCRIPT") {
			scriptAddLine(data[1], data[2]);
			battleScriptEndLine();
		} else if (data[0] == "SCRIPT") {

			if (data[1] != "") {
				scriptAddLine("server side", data[1]);
			}
			battleScriptEndLine();
			battleEnd();
		} else if (data[0] == "CAUGHT") {


		}
	} else { //
		if (!battleLoading) {
			if (parseInt(battleStage) == 3 || parseInt(battleStage) == 4) {
				battleEnd();
				if (parseInt(battleStage) == 4) {

					userFaint();
				} else {
					//if( !bWildBattle ) {
					playMusicOnce("victory");
					//}
				}
			} else if (parseInt(battleStage) == 5 || parseInt(battleStage) == 6) {
				battleEnd();
				if (battlePlayerAwayTeam) {
					if (parseInt(battleStage) == 6) {
						playMusicOnce("victory");

					} else {
						userFaint();
					}
				} else {
					if (parseInt(battleStage) == 5) {

						playMusicOnce("victory");
					} else {
						userFaint();
					}
				}
			}
		}
	}
}

function battleEnd() {

	bInBattle = false;
	battleSelectedMenu = 0;
	battleItemPaging = 1;
	battleItemSelectedMenu = 0;
	battleScript = new Array();

	teamMonsters = new Array();
	opponentMonsters = new Array();

	curMon = null;
	curOpp = null;

	curOppImage.style.display = 'none';
	curMonImage.style.display = 'none';

	playMusic(currentMap.mapMusic);


}

function battleScriptDraw() {
	var centerX = cvsWidth / 2;
	var centerY = cvsHeight / 2;

	if (battleScript.length > 0) {
		var data = battleScript[0].split("|");

		if (data[0] == "MSG") {

			battleTick1++;
			if (battleTick1 > 1) {
				battleTick2++;
				battleTick1 = 0;
			}

			if ((keyState.btn1 || keyState.btn2) && battleTick2 > data[1].length) {
				battleScriptEndLine();
				keyState.btn1 = false;
				keyState.btn2 = false;
				playSFX("beep");
			} else if (keyState.btn1 || keyState.btn2) {
				battleTick2 = data[1].length;
				keyState.btn1 = false;
				keyState.btn2 = false;
				playSFX("beep");
			}

			//ctx.textAlign = "left";
			//ctx.font = "bold 9px sans-serif";
			//drawShadowText(ctx,data[1].substr(0,battleTick2), centerX-230,centerY+103);

			ctx.textAlign = "left";
			ctx.font = "bold 12px sans-serif";

			var line1 = data[1];
			var line2 = "";

			if (line1.length > 32) {
				var lastSpace = line1.lastIndexOf(" ", 32);
				line2 = line1.substr(lastSpace + 1, line1.length - lastSpace - 1);
				line1 = line1.substr(0, lastSpace);
			}

			if (battleTick2 <= line1.length) {
				drawShadowText(ctx, line1.substr(0, battleTick2), centerX - 234, centerY + 100);
			} else {
				drawShadowText(ctx, line1, centerX - 234, centerY + 100);
				drawShadowText(ctx, line2.substr(0, battleTick2 - line2.length), centerX - 234, centerY + 116);
			}
		} else if (data[0] == "MUTATE") {

			drawMons = false;
			drawOpHp = false;
			drawMyHp = false;
			var args = data[1].split("-");


			ctx.textAlign = "left";
			ctx.font = "bold 12px sans-serif";

			drawShadowText(ctx, "Let the Pokemon Evolve?", centerX - 234, centerY + 100);
			drawShadowText(ctx, "Press 'X' to confirm, 'Z' to cancel.", centerX - 234, centerY + 116);


			ctx.textAlign = "center";
			ctx.font = "bold 14px sans-serif";


			//Draw Monster
			var mon = resourceByKey(curMon.image);
			ctx.drawImage(mon, centerX - 80 - mon.width / 2, centerY - mon.height / 2);
			drawShadowText(ctx, curMon.name, centerX - 80, centerY + 60);

			//Draw Monster Evolution
			mon = resourceByKey(args[1]);
			ctx.drawImage(mon, centerX + 80 - mon.width / 2, centerY - mon.height / 2);
			drawShadowText(ctx, "???", centerX + 80, centerY + 60);


			//Draw Arrow
			mon = resourceByKey("resultset_next.png");
			ctx.drawImage(mon, centerX - mon.width / 2 - mon.width, centerY - mon.height / 2);
			ctx.drawImage(mon, centerX - mon.width / 2, centerY - mon.height / 2);
			ctx.drawImage(mon, centerX - mon.width / 2 + mon.width, centerY - mon.height / 2);

			if (keyState.btn1) {
				loadBattle("mutate=true&mutatetarg=" + data[2]);
				//	loadBattle("mutate=true");
				keyState.btn1 = false;
				battleScriptEndLine();
			} else if (keyState.btn2) {
				keyState.btn2 = false;
				battleScriptEndLine();
			}



			//
			//curMon

		} else if (data[0] == "ATTACK") {

			var img = resourceByKey("ani-" + data[4]);
			battleTick1++;

			if (img == null) {
				battleScriptEndLine();
			} else {

				if ((parseInt(data[2]) < 6 && !battlePlayerAwayTeam) || (parseInt(data[2]) >= 6 && battlePlayerAwayTeam)) {
					ctx.drawImage(img, battleTick2, 0, 80, 80, centerX - 120 - 80 / 2, centerY - img.height / 2 + 40, 80, 80);
				} else {
					ctx.drawImage(img, battleTick2, 0, 80, 80, centerX + 120 - 80 / 2, centerY - img.height / 2 - 40, 80, 80);
				}

				if (battleTick2 > img.width) {
					battleScriptEndLine();
				}
			}

			battleTick2 = battleTick2 + 80;
		} else if (data[0] == "DEFEAT") {
			battleScriptEndLine();
		} else if (data[0] == "HPCHANGE") {
			battleTick1++;
			if (battleTick1 < 10) {
				if ((parseInt(data[1]) < 6 && !battlePlayerAwayTeam) || (parseInt(data[1]) >= 6 && battlePlayerAwayTeam)) {
					curMon.hpleft = curMon.hpleft - battleTick3;
				} else {
					if (curOpp != null)
						curOpp.hpleft = curOpp.hpleft - battleTick3;
				}
			} else {
				if ((parseInt(data[1]) < 6 && !battlePlayerAwayTeam) || (parseInt(data[1]) >= 6 && battlePlayerAwayTeam)) {
					curMon.hpleft = parseInt(data[3]);
				} else {
					if (curOpp != null)
						curOpp.hpleft = parseInt(data[3]);
				}
				battleScriptEndLine();
			}
		} else if (data[0] == "BATTLEEND") {
			battleEnd();
		} else if (data[0] == "CAUGHT") {
			drawMons = false;
			drawOpHp = false;
			drawMyHp = false;
			curMonImage.style.display = 'none';
			curOppImage.style.left = (centerX - curOppImage.width / 2) + 'px';
			curOppImage.style.top = (centerY - curOppImage.height / 2) + 'px';

			ctx.textAlign = "left";
			ctx.font = "bold 11px sans-serif";
			drawShadowText(ctx, "Press 'X' to view Pokemon, 'Z' to cancel.", centerX - 234, centerY + 116);
			if (keyState.btn1) {
				//	loadBattle("mutate=true");
				var caughtPokemonTab = window.open("/game/monster/" + data[1], '_blank');
				//could be null
				keyState.btn1 = false;
				battleScriptEndLine();
			} else if (keyState.btn2) {
				keyState.btn2 = false;
				battleScriptEndLine();
			}
		}
	}
}


function battleUpdate() {

	//If nothings happening and everything has loaded check for input.
	if (battleScript.length == 0 && ImageResourceLoadedCount == screenResources.length && !battleLoading) {
		//0 == Run
		//1 == Item

		//2-5 == Attacks
		//6 == Swap

		if (doingCaptcha)
			return;

		var bChangedSomething = false;
		//Collect Keyboard Input.
		if (keyState.up) {
			playSFX("beep");
			if (battleSelectedMenu < 4) {
				battleSelectedMenu = 6;
			} else if (battleSelectedMenu == 4 || battleSelectedMenu == 5) {
				battleSelectedMenu = battleSelectedMenu - 2;
			} else if (battleSelectedMenu == 13) {
				battleItemSelectedMenu = battleItemSelectedMenu - 1;

				battleItemPaging = Math.floor(battleItemSelectedMenu / 8) + 1;
				if (battleItemPaging == 0)
					battleItemPaging = 1;
				if (battleItemSelectedMenu < 0)
					battleItemSelectedMenu = 0;

			} else if (battleSelectedMenu > 6 && battleSelectedMenu <= 12) {
				battleSelectedMenu--;
				if (battleSelectedMenu < 7)
					battleSelectedMenu = 7;
			}
			keyState.up = false;
			bChangedSomething = true;
		} else if (keyState.right) {
			playSFX("beep");
			if (battleSelectedMenu > 6 && battleSelectedMenu <= 12) {
				if (battleSelectedMenu < 10) {
					battleSelectedMenu = battleSelectedMenu + 3;
					if (battleSelectedMenu - 7 > teamMonsters.length)
						battleSelectedMenu = teamMonsters.length + 6;

				}
			} else if (battleSelectedMenu == 13) {
				battleItemSelectedMenu = battleItemSelectedMenu + 4;
				if (battleItemSelectedMenu >= battleItemPaging * 7)
					battleItemSelectedMenu = battleItemPaging * 7;
			} else if (battleSelectedMenu != 3) {
				battleSelectedMenu++;
				if (battleSelectedMenu > 5)
					battleSelectedMenu = 5;
			}
			keyState.right = false;
			bChangedSomething = true;
		} else if (keyState.left) {
			playSFX("beep");
			if (battleSelectedMenu == 4) {
				battleSelectedMenu = 1;
			} else if (battleSelectedMenu > 6 && battleSelectedMenu <= 12) {
				if (battleSelectedMenu >= 10) {
					battleSelectedMenu = battleSelectedMenu - 3;
				}
			} else if (battleSelectedMenu == 13) {
				battleItemSelectedMenu = battleItemSelectedMenu - 4;
				if (battleItemSelectedMenu < 0)
					battleItemSelectedMenu = 0;
			} else {
				battleSelectedMenu--;
				if (battleSelectedMenu < 0)
					battleSelectedMenu = 0;
			}
			keyState.left = false;
			bChangedSomething = true;
		} else if (keyState.down) {
			playSFX("beep");
			if (battleSelectedMenu == 6) {
				battleSelectedMenu = 0;
			} else if (battleSelectedMenu == 2 || battleSelectedMenu == 3) {
				battleSelectedMenu = battleSelectedMenu + 2;
			} else if (battleSelectedMenu == 13) {
				battleItemSelectedMenu = battleItemSelectedMenu + 1;
				if (battleItems.length < 8) {
					if (battleItemSelectedMenu >= battleItemPaging * 8)
						battleItemSelectedMenu = battleItemPaging * 7;
				} else {
					if (battleItemSelectedMenu >= battleItemPaging * 8) {
						battleItemPaging += 1;
					}

					if (battleItemPaging >= Math.floor(battleItems.length / 8)) {
						battleItemPaging = Math.floor(battleItems.length / 8);
					}

					if (battleItemSelectedMenu >= (battleItemPaging * 8)) {
						battleItemSelectedMenu = (battleItemPaging * 8) - 1;
					}
				}

			} else if (battleSelectedMenu > 6 && battleSelectedMenu <= 12) {
				battleSelectedMenu++;
				if (battleSelectedMenu - 6 > teamMonsters.length)
					battleSelectedMenu = teamMonsters.length + 6;
			}

			keyState.down = false;
			bChangedSomething = true;
		} else if (keyState.btn1) {
			playSFX("beep");
			if (battleSelectedMenu == 0) {
				//bInBattle
				if (bWildBattle) {
					//battleScript.push("MSG|You ran away from the battle.");
					loadBattle("run=true");
					//battleScript.push("BATTLEEND|");
				} else {
					battleScript.push("MSG|You can not run from a trainer battle.");
				}

			} else if (battleSelectedMenu > 1 && battleSelectedMenu < 6) { //Attacks 
				var skill = monSkills[battleSelectedMenu - 2];
				if (skill.ppleft <= 0) {
					if (monSkills[0].ppleft <= 0 && monSkills[1].ppleft <= 0 && monSkills[2].ppleft <= 0 && monSkills[3].ppleft <= 0)
						loadBattle("selatk=" + skill.id + "&pos=" + (battleSelectedMenu - 1));
					else
						battleScript.push("MSG|You cannot use this skill.");
				}
				else {
					var megaAttack = "";
					if (tempItem == 739) { //check
						megaAttack = "&mega=1"; //add
					}
					tempItem = 0; //reset
					loadBattle("selatk=" + skill.id + "&pos=" + (battleSelectedMenu - 1) + megaAttack);
				}

			} else if (battleSelectedMenu == 6) { //Swap 
				battleSelectedMenu = 7;

			} else if (battleSelectedMenu > 6 && battleSelectedMenu <= 12) {
				battleSwappedMonsters = true;
				if (teamMonsters.length > battleSelectedMenu - 7) {

					if (teamMonsters[battleSelectedMenu - 7].hpleft > 0 || tempItem > 0) {
						loadBattle("selmon=" + teamMonsters[battleSelectedMenu - 7].id + "&selitem=" + tempItem);
						tempItem = 0;
					}
				}
			} else if (battleSelectedMenu == 13) {

				if (battleItems[battleItemSelectedMenu].id == 29 || battleItems[battleItemSelectedMenu].id == 28) {
					battleSelectedMenu = 6;
					tempItem = battleItems[battleItemSelectedMenu].id;
					return;
				}

				if (battleItems[battleItemSelectedMenu].id == 739) {
					tempItem = battleItems[battleItemSelectedMenu].id;
					battleScript.push("MSG|You have chosen to activate Mega Pokemon.");
					battleScript.push("MSG|Please choose an attack to proceed.");
					battleSelectedMenu = 2;
					return;
				}

				loadBattle("selitem=" + battleItems[battleItemSelectedMenu].id);

			} else if (battleSelectedMenu == 1) {
				//Enter the Item Menu
				battleSelectedMenu = 13;
			}
			keyState.btn1 = false;

			bChangedSomething = true;
		} else if (keyState.btn2) {
			playSFX("beep");
			if (battleSelectedMenu > 6 && battleSelectedMenu <= 12) {
				if (battleStage != 1) {
					battleSelectedMenu = 6;
				}
			} else if (battleSelectedMenu == 13) {
				battleSelectedMenu = 1;
			}

			keyState.btn2 = false;
			bChangedSomething = true;
		}

		if (bChangedSomething) {
			battleUpdatedMenu();
		}
	} else {


	}

}

function battleUpdatedMenu() {

	if (battleSelectedMenu < 4) {
		curMonImage.style.display = 'block';
		curOppImage.style.display = 'block';
	} else if (battleSelectedMenu == 4 || battleSelectedMenu == 5) {
		curMonImage.style.display = 'block';
		curOppImage.style.display = 'block';
	} else if (battleSelectedMenu >= 13) {
		curMonImage.style.display = 'none';
		curOppImage.style.display = 'none';
	} else if (battleSelectedMenu >= 6 && battleSelectedMenu <= 12) {
		curMonImage.style.display = 'none';
		curOppImage.style.display = 'none';
	}
}

function battleDraw() {
	var bg = resourceByKey(battlescreen);


	var centerX = cvsWidth / 2;
	var centerY = cvsHeight / 2;

	ctx.drawImage(bg, centerX - bg.width / 2, centerY - bg.height / 2);
	if (ImageResourceLoadedCount != screenResources.length) {
		//Loading additional content

		ctx.font = "bold 14px sans-serif";
		ctx.textAlign = "center";
		drawShadowText(ctx, "Loading Resources", centerX, centerY);



	} else {
		if (battleWeather == "" || battleWeather == "None" || battleWeather == null) {
			battleWeather = "Clear Skies";
		}
		var weather = resourceByKey("weather-" + battleWeather);

		ctx.drawImage(weather, centerX - bg.width / 2, centerY - bg.height / 2);

		ctx.textAlign = "center";
		ctx.font = "bold 18px sans-serif";

		drawShadowText(ctx, "Run", centerX - 187, centerY + 145);
		drawShadowText(ctx, "Item", centerX - 93, centerY + 145);

		if (curMon != null) {

			ctx.textAlign = "center";
			ctx.font = "bold 14px sans-serif";
			if (monSkills.length == 4) {
				drawShadowText(ctx, monSkills[0].name, centerX + 46, centerY + 110);
				drawShadowText(ctx, monSkills[1].name, centerX + 174, centerY + 110);
				drawShadowText(ctx, monSkills[2].name, centerX + 46, centerY + 145);
				drawShadowText(ctx, monSkills[3].name, centerX + 174, centerY + 145);
			}

			var mon = resourceByKey(curMon.image);

			if (drawMons) {
				//Draw Monster
				/*
				ctx.scale(-1, 1);		// flip x axis
				ctx.drawImage(, -centerX+120-mon.width/2,centerY-mon.height/2); 
				ctx.scale(-1, 1); 		// flip it back again
				*/

			}
			if (drawMyHp) {
				var hpBarWidth = 0;

				/*if( battlePlayerAwayTeam ) {
					if( curOpp.hpleft > curOpp.hp )
						curOpp.hpleft = curOpp.hp;
					if( curOpp.hpleft < 0 )
						curOpp.hpleft = 0;
					if( curOpp.hpleft != 0 && curOpp.hp != 0 )
						hpBarWidth = (curOpp.hpleft / curOpp.hp) * 72;
				} else {*/
				if (curMon.hpleft > curMon.hp)
					curMon.hpleft = curMon.hp;
				if (curMon.hpleft < 0)
					curMon.hpleft = 0;
				if (curMon.hpleft != 0 && curMon.hp != 0)
					hpBarWidth = (curMon.hpleft / curMon.hp) * 72;
				//}



				ctx.fillStyle = '#4444BB';
				ctx.fillRect(centerX - 184, centerY - 135, hpBarWidth, 6);
			}


			//Draw Text Items
			ctx.textAlign = "left";
			ctx.font = "bold 11px sans-serif";
			drawShadowText(ctx, curMon.name, centerX - 185, centerY - 140);
			ctx.font = "bold 9px sans-serif";
			drawShadowText(ctx, "Lv." + curMon.level, centerX - 90, centerY - 128);
			//	if (curMon.status != null)
			//			drawShadowText(ctx,"(" + curMon.status + ")", centerX-90,centerY-140,'yellow');
			drawShadowText(ctx, "(" + curMon.gender + ")", centerX - 70, centerY - 140, 'yellow');

		}
		if (curOpp != null) {
			var mon = resourceByKey(curOpp.image);

			if (drawMons) {
				//Draw Monster
				//ctx.drawImage(curOppImage, centerX+120-mon.width/2,centerY-mon.height/2 ); 
				/*
				curOppImage.style.display = 'block';
				curOppImage.style.left = (centerX+120-mon.width/2) + 'px';
				curOppImage.style.top = (centerY-mon.height/2) + 'px';
				*/
			}
			if (drawOpHp) {
				var hpBarWidth = 0;
				//if( !battlePlayerAwayTeam ) {
				if (curOpp.hpleft > curOpp.hp)
					curOpp.hpleft = curOpp.hp;
				if (curOpp.hpleft < 0)
					curOpp.hpleft = 0;
				if (curOpp.hpleft != 0 && curOpp.hp != 0)
					hpBarWidth = (curOpp.hpleft / curOpp.hp) * 72;
				/*} else {
					if( curMon.hpleft > curMon.hp )
						curMon.hpleft = curMon.hp;
					if( curMon.hpleft < 0 )
						curMon.hpleft = 0;
					if( curMon.hpleft != 0 && curMon.hp != 0 )
						hpBarWidth = (curMon.hpleft / curMon.hp) * 72;
				}*/

				ctx.fillStyle = '#4444BB';
				ctx.fillRect(centerX + 50, centerY - 135, hpBarWidth, 6);
			}

			//Draw Text Items
			ctx.textAlign = "left";
			ctx.font = "bold 11px sans-serif";
			drawShadowText(ctx, curOpp.name, centerX + 50, centerY - 140);
			ctx.font = "bold 9px sans-serif";
			drawShadowText(ctx, "Lv." + curOpp.level, centerX + 144, centerY - 128);
			//if (curOpp.status != null)
			//	drawShadowText(ctx,"(" + curOpp.status + ")", centerX+140,centerY-140,'yellow');
			drawShadowText(ctx, "(" + curOpp.gender + ")", centerX + 160, centerY - 140, 'yellow');

		}

		//If we are not loading.
		if (battleLoading) {
			ctx.font = "bold 14px sans-serif";
			ctx.textAlign = "center";
			if (battlePVPWaiting) {
				drawShadowText(ctx, "Waiting for other players input.", centerX, centerY);
			} else {
				drawShadowText(ctx, "Loading Update", centerX, centerY);
			}
		} else {
			//button highlights.
			if (battleScript.length > 0) {
				battleScriptDraw()
			} else {

				ctx.textAlign = "center";
				ctx.font = "bold 14px sans-serif";

				if (battleSelectedMenu == 0) {
					ctx.drawImage(resourceByKey("btnHighlightOption"), centerX - 232, centerY + 125);
					drawShadowText(ctx, "Run Away", centerX - 127, centerY + 113);
				} else if (battleSelectedMenu == 1) {
					ctx.drawImage(resourceByKey("btnHighlightOption"), centerX - 138, centerY + 125);
					drawShadowText(ctx, "Use an Item", centerX - 127, centerY + 113);
				} else if (battleSelectedMenu == 2) {
					ctx.drawImage(resourceByKey("btnHighlightAttack"), centerX + 46 - 63, centerY + 110 - 20);
					if (monSkills[0] != null)
						drawShadowText(ctx, "Use this Attack with PP (" + monSkills[0].ppleft + "/" + monSkills[0].pptotal + ")", centerX - 127, centerY + 113);

				} else if (battleSelectedMenu == 3) {
					ctx.drawImage(resourceByKey("btnHighlightAttack"), centerX + 174 - 63, centerY + 110 - 20);
					if (monSkills[1] != null)
						drawShadowText(ctx, "Use this Attack with PP (" + monSkills[1].ppleft + "/" + monSkills[1].pptotal + ")", centerX - 127, centerY + 113);
				} else if (battleSelectedMenu == 4) {
					ctx.drawImage(resourceByKey("btnHighlightAttack"), centerX + 46 - 63, centerY + 145 - 20);
					if (monSkills[2] != null)
						drawShadowText(ctx, "Use this Attack with PP (" + monSkills[2].ppleft + "/" + monSkills[2].pptotal + ")", centerX - 127, centerY + 113);
				} else if (battleSelectedMenu == 5) {
					ctx.drawImage(resourceByKey("btnHighlightAttack"), centerX + 174 - 63, centerY + 145 - 20);
					if (monSkills[3] != null)
						drawShadowText(ctx, "Use this Attack with PP (" + monSkills[3].ppleft + "/" + monSkills[3].pptotal + ")", centerX - 127, centerY + 113);
				} else if (battleSelectedMenu == 6) {
					ctx.drawImage(resourceByKey("btnHighlightSwap"), centerX - 229, centerY - 151);
					drawShadowText(ctx, "Swap Monsters", centerX - 127, centerY + 113);
				} else if (battleSelectedMenu > 6 && battleSelectedMenu <= 1) {

					var dispStr = "";
					if (battleSelectedMenu - 7 < teamMonsters.length) {
						dispStr = "Select " + teamMonsters[battleSelectedMenu - 7].name;

						ctx.drawImage(resourceByKey("btnHighlightSwap"), centerX - 229, centerY - 151);
						drawShadowText(ctx, dispStr, centerX - 127, centerY + 113);
					}

				}
				//btnHighlightAttack//btnHighlightOption//btnHighlightSwap//


				if (battleSelectedMenu > 6 && battleSelectedMenu <= 13) {

					ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
					ctx.fillRect(centerX - 235, centerY - 101, 470, 180);
					ctx.fillStyle = 'rgba(33, 33, 33, 0.85)';
					ctx.fillRect(centerX - 234, centerY - 100, 468, 178);

					ctx.textAlign = "left";
					ctx.font = "bold 10px sans-serif";
					drawShadowText(ctx, "or press 'z' to cancel selection.", centerX - 228, centerY + 73);

					if (battleSelectedMenu == 13) {

						ctx.textAlign = "center";
						ctx.font = "bold 12px sans-serif";
						drawShadowText(ctx, "Select an Item to use", centerX, centerY - 80);
						for (var k = (battleItemPaging - 1) * 7; k < battleItems.length && k >= (battleItemPaging - 1) * 7 && k < (battleItemPaging * 8); k++) {
							var pos = k % 8 + 1;

							var x = centerX;
							var y = centerY - 75;


							if (pos < 5) {
								x = x - 110;
								y = y + pos * 30;
							} else {
								x = x + 110;
								y = y + (pos - 4) * 30;
							}

							if (battleItemSelectedMenu == k) {
								ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
								ctx.fillRect(x - 101, y - 16, 202, 24);
							}

							ctx.fillStyle = 'rgba(33, 33, 33, 0.85)';
							ctx.fillRect(x - 100, y - 15, 200, 22);

							ctx.font = "bold 10px sans-serif";
							drawShadowText(ctx, battleItems[k].name + " x" + battleItems[k].qty, x, y);
							//drawShadowText(ctx, pos + ")", x-90, y);

							var itemImg = resourceByKey(battleItems[k].file);
							ctx.drawImage(itemImg, x - 95, y - 20);

						}

					} else if (battleSelectedMenu > 6 && battleSelectedMenu <= 12) {

						ctx.textAlign = "center";
						ctx.font = "bold 12px sans-serif";
						drawShadowText(ctx, "Select a Pokemon from your team", centerX, centerY - 80);

						ctx.textAlign = "center";
						ctx.font = "bold 12px sans-serif";
						for (var k = 0; k < teamMonsters.length; k++) {
							var pos = k + 1;

							var x = centerX;
							var y = centerY - 75;
							if (pos < 4) {
								x = x - 110;
								y = y + pos * 30;
							} else {
								x = x + 110;
								y = y + (pos - 3) * 30;
							}

							if (battleSelectedMenu - 7 == k) {
								ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
								ctx.fillRect(x - 101, y - 16, 202, 24);
							}

							ctx.fillStyle = 'rgba(33, 33, 33, 0.85)';
							ctx.fillRect(x - 100, y - 15, 200, 22);

							ctx.font = "bold 10px sans-serif";
							drawShadowText(ctx, teamMonsters[k].name + " (" + teamMonsters[k].hpleft + "/" + teamMonsters[k].hp + ")", x, y);
							drawShadowText(ctx, pos + ")", x - 90, y);

						}
					}
				}

			}

			if (captchaImages.length > 0) {

				ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
				ctx.fillRect(centerX - 235, centerY - 101, 470, 180);
				ctx.fillStyle = 'rgba(33, 33, 33, 0.85)';
				ctx.fillRect(centerX - 234, centerY - 100, 468, 178);

				ctx.textAlign = "center";
				ctx.font = "bold 12px sans-serif";
				drawShadowText(ctx, "Tap the keys shown below to prove you are human.", centerX, centerY - 80);

				//48
				for (var k = 0; k < captchaImages.length; k++) {
					var x = centerX - 75 + k * 50;
					ctx.drawImage(captchaImages[k], x, centerY);
				}

			}


		}


	}


	//ctx //bg

}

function getBattleMonByID(ary, id) {
	for (var k = 0; k < ary.length; k++) {
		if (ary[k].id == id) {
			return ary[k];
		}
	}
	return null;
}

var lastRequest = null;

function loadBattle(args) {



	battleLoading = true;
	lastRequest = args;
	var xmlHttpReq = requestObject();
	self.xmlHttpReq.open("GET", "/game/xml/battle?" + args + "&rand=" + (Math.random() * 1000000), true);
	self.xmlHttpReq.onreadystatechange = loadBattleCallback;
	self.xmlHttpReq.send();
	battleRequestCounter++;

	var currentCounter = battleRequestCounter;
	if (battlePVP == 1) {
		setTimeout(function () {
			if (battleLoading) {
				if (currentCounter == battleRequestCounter) {
					//stalled on the same request.
					battleLoading = false;
				}
			}
		}, 20000);
	}

}

var curMonImage = null;
var curOppImage = null;

var battleRequestCounter = 0;
var battlePVPWaitTimer = 0;

var battlePVP = 0;
var battlePlayerAwayTeam = false;
var battleRoundTacker = 0;
var battlePVPWaiting = false;
var battleWeather = "";
function loadBattleCallback() {
	var centerX = cvsWidth / 2;
	var centerY = cvsHeight / 2;


	if (self.xmlHttpReq.readyState == 4) {
		if (self.xmlHttpReq.responseXML) {


			var resultsNode = self.xmlHttpReq.responseXML.childNodes[1];
			if (!resultsNode) {
				resultsNode = self.xmlHttpReq.responseXML.childNodes[0];
			}

			if (resultsNode == null) {
				battleLoading = false;
				return;
			}

			if (bIsLoadingWildDialog)
				curOpp = null;

			while (resultsNode.nodeName == "#comment")
				resultsNode = resultsNode.nextSibling;

			if (resultsNode.childNodes.length == 0) {
				//no children found - no battle - must have no hp, warp to local town.
				battleEnd();
				if (bIsLoadingWildDialog) {
					document.getElementById('mws-explore-encounter').innerHTML = "<br><center><p>No Pokemon was found. Keep trying!</p></center><br>";
				}

				battleLoading = false;
				return;
			}

			var images = firstChildNodeNamed("images", resultsNode);

			doingCaptcha = false;
			if (images.childNodes.length > 0) {
				captchaKeys = new Array();
				doingCaptcha = true;
			}
			captchaImages = new Array();

			for (var k = 0; k < images.childNodes.length; k++) {
				var imageData = nodeValue(images.childNodes[k]);
				var image = new Image();
				image.src = "data:image/png;base64," + imageData;
				captchaImages.push(image);
			}

			//Get the battle stage before proceeding.
			var battle = firstChildNodeNamed("battle", resultsNode);
			var battleRound = parseInt(nodeValue(firstChildNodeNamed("round", battle)));
			battlePVP = nodeValue(firstChildNodeNamed("pvp", battle));
			battleStage = nodeValue(firstChildNodeNamed("stage", battle));
			battleWeather = nodeValue(firstChildNodeNamed("weather", battle));
			if (battlePVP == 1 && battleStage < 5) {
				if (battleRound > battleRoundTacker) {
					//this is fine
					battleRoundTacker = battleRound;
					battlePVPWaitTimer = 0;
					battlePVPWaiting = false;
					//carry on
				} else {
					//not progressing due to other player. Ping for updates
					battlePVPWaiting = true;
					setTimeout(function () {
						battleLoading = false;
						battlePVPWaitTimer++;
						if (battlePVPWaitTimer > 15) {
							battlePVPWaitTimer = 0;
						} else {
							loadBattle("abc=123");
						}
					}, 2000);
					return;
				}
			}


			if (parseInt(battleStage) == 1) {
				loadLineupArrays(resultsNode);


				var opponent = firstChildNodeNamed("opponent", resultsNode);

				if (opponent != null) {
					var opponentName = nodeValue(firstChildNodeNamed("user", opponent));
					if (userName == opponentName) {
						var temp = opponent;
						opponent = trainer;
						trainer = temp;
						battlePlayerAwayTeam = true;
					} else {
						battlePlayerAwayTeam = false;
					}
				}

			} else if (parseInt(battleStage) == 2) {
				//Update Opponent Lineup
				loadLineupArrays(resultsNode);

				var trainer = firstChildNodeNamed("trainer", resultsNode);
				var opponent = firstChildNodeNamed("opponent", resultsNode);

				if (opponent != null) {
					//swap the teams if your the opponent in pvp
					var opponentName = nodeValue(firstChildNodeNamed("user", opponent));
					if (userName == opponentName) {
						var temp = opponent;
						opponent = trainer;
						trainer = temp;
						battlePlayerAwayTeam = true;
					} else {
						battlePlayerAwayTeam = false;
					}
				}

				var myFOP = firstChildNodeNamed("fieldofplay", trainer);
				var myMon = firstChildNodeNamed("mon", myFOP);
				curMon = monFromNode(myMon, curMon); //moved here for battle form changes


				if (myMon == null) {
					curMon = null;
				} else {
					if (battleSwappedMonsters) {
						curMon = null;
						battleSwappedMonsters = false;
					}
					if (curMon == null) {
						curMon = monFromNode(myMon, curMon);
						nextMon = curMon;


						curMonImage.src = curMon.image;
					} else {
						nextMon = monFromNode(myMon, curMon);

					}

					var img = resourceByKey(curMon.image);
					if (img == null)
						screenResources.push(new ResourceImage(curMon.image, curMon.image));

					curMonImage.src = curMon.image;


					img = resourceByKey(nextMon.image);
					if (img == null)
						screenResources.push(new ResourceImage(nextMon.image, nextMon.image));

					//load my monsters skills.
					monSkills = new Array();
					var skills = firstChildNodeNamed("skills", myMon);
					for (var k = 0; k < skills.childNodes.length; k++) {
						monSkills.push(skillFromNode(skills.childNodes[k]));
					}

				}


				if (opponent) {
					var opFOP = firstChildNodeNamed("fieldofplay", opponent);
					var opMon = firstChildNodeNamed("mon", opFOP);
					if (opMon == null) {
						curOpp = null;
					} else {
						if (curOpp == null) {
							curOpp = monFromNode(opMon, null);
							nextOpp = curOpp;


							curOppImage.src = curOpp.image;

						} else {
							nextOpp = monFromNode(opMon, null);


						}

						var img = resourceByKey(curOpp.image);
						if (img == null)
							screenResources.push(new ResourceImage(curOpp.image, curOpp.image));

						curOppImage.src = curOpp.image;


						img = resourceByKey(nextOpp.image);
						if (img == null)
							screenResources.push(new ResourceImage(nextOpp.image, nextOpp.image));
					}
				}

			}

			battleItems = new Array();
			var inventory = firstChildNodeNamed("inventory", resultsNode);
			for (var k = 0; k < inventory.childNodes.length; k++) {
				battleItems.push(new itemFromNode(inventory.childNodes[k]));
				var fileName = battleItems[battleItems.length - 1].file;
				screenResources.push(new ResourceImage("/images/items/" + fileName, fileName));
			}

			if (curMon != null) {
				if (curMon.held == curMon.meg_item && curMon.meg_item != 0) {
					//common item, don't mind.
					battleItems.push(new BattleItem(739, "Mega Ring", "mega-ring.png", "1"));
					screenResources.push(new ResourceImage("/images/items/mega-ring.png", "mega-ring.png"));
				}
			}


			var messages = firstChildNodeNamed("messages", resultsNode);
			if (messages) {
				var round = firstChildNodeNamed("round", messages);
				var msgs = firstChildNodeNamed("msgs", round);
				loadBattleScriptFrom(msgs);
			}

			if (bIsLoadingWildDialog) {
				showMonsterAtCoordCallback();
				battleLoading = false;
				return;
			}



			if (battleStage == 1) {
				if (battlePVP == 1) {
					battleSelectedMenu = 7;
					/*
					if( curMon == null ) {
						battleSelectedMenu = 7;
					} else {
						if( curMon.hpleft == 0 ) {
							battleSelectedMenu = 7;
						} else {
							//waiting for other player to select replacement pokemon.
						}
					}*/
				} else {
					battleSelectedMenu = 7;
				}

			} else {
				battleSelectedMenu = 2;
			}

			battleLoading = false;



		} else {
			if (bIsLoadingWildDialog) {
				document.getElementById('mws-explore-encounter').innerHTML = "";
			}

			//log the body of the response to help debugging. 


			if (self.xmlHttpReq.status == 0) {

				errorMessage = "Status: " + self.xmlHttpReq.status + " lastRequest: " + lastRequest;
				loadUtility("keepAlive=true&action=error&text=" + escape(errorMessage));
				loadBattle(lastRequest);
			} else {
				var errorMessage = self.xmlHttpReq.responseText;
				if (errorMessage == "") {
					errorMessage = "Status: " + self.xmlHttpReq.status + " last request: " + lastRequest;
				}
				loadUtility("keepAlive=true&action=error&text=" + escape(errorMessage));
			}
			//
		}
	}
}

function loadBattleScriptFrom(roundNode) {
	var bInitScript = battleScript.length == 0;
	for (var i = 0; i < roundNode.childNodes.length; i++) {
		battleScript.push(nodeValue(roundNode.childNodes[i]).trim());
	}

	//if there wasn't any script before but there is now we better kick it off.
	if (battleScript.length > 0 && bInitScript)
		battleScriptStartLine();
}

function itemFromNode(node) {
	var id = nodeValue(firstChildNodeNamed("id", node));
	var name = nodeValue(firstChildNodeNamed("name", node));
	var file = nodeValue(firstChildNodeNamed("file", node));
	var qty = nodeValue(firstChildNodeNamed("qty", node));
	return new BattleItem(id, name, file, qty);
}


function skillFromNode(node) {
	var id = nodeValue(firstChildNodeNamed("id", node));
	var name = nodeValue(firstChildNodeNamed("name", node));
	var ppleft = nodeValue(firstChildNodeNamed("ppleft", node));
	var pptotal = nodeValue(firstChildNodeNamed("pptotal", node));

	return new MonsterSkill(id, name, ppleft, pptotal);
}

function monFromNode(opMon, hpTemplate) {
	var f1 = nodeValue(firstChildNodeNamed("f1", opMon));
	var f2 = nodeValue(firstChildNodeNamed("f2", opMon));
	var f3 = nodeValue(firstChildNodeNamed("f3", opMon));
	var f4a = nodeValue(firstChildNodeNamed("f4a", opMon));
	var f4b = nodeValue(firstChildNodeNamed("f4b", opMon));
	if (f4b == null)
		f4b = "";
	var f5 = nodeValue(firstChildNodeNamed("f5", opMon));

	var f7a = nodeValue(firstChildNodeNamed("f7a", opMon));
	var f7b = nodeValue(firstChildNodeNamed("f7b", opMon));
	if (hpTemplate != null)
		f7a = hpTemplate.hpleft;

	var f8 = nodeValue(firstChildNodeNamed("f8", opMon));
	var f9a = nodeValue(firstChildNodeNamed("f9a", opMon));
	var f9b = nodeValue(firstChildNodeNamed("f9b", opMon));
	var f13 = nodeValue(firstChildNodeNamed("f13", opMon));
	var f14 = nodeValue(firstChildNodeNamed("f14", opMon));
	var f15 = nodeValue(firstChildNodeNamed("f15", opMon));
	var f16 = nodeValue(firstChildNodeNamed("f16", opMon));
	var f17 = nodeValue(firstChildNodeNamed("f17", opMon));
	var f18 = nodeValue(firstChildNodeNamed("f18", opMon));


	return new BattleMonsterLineup(f1, f2, f3, f4a, f4b, f5, f7a, f7b, f8, f9a, f9b, f13, f14, f15, f16, f17, f18);
}


function loadLineupArrays(resultsNode) {
	teamMonsters = new Array();

	//check that the images are/have loading/loaded.
	var trainer = firstChildNodeNamed("trainer", resultsNode);
	var opponent = firstChildNodeNamed("opponent", resultsNode);



	var myLineup = firstChildNodeNamed("lineup", trainer);

	for (var i = 0; i < myLineup.childNodes.length; i++) {
		var mon = myLineup.childNodes[i];
		var f8 = nodeValue(firstChildNodeNamed("f8", mon));


		//only update the first time.
		if (i == teamMonsters.length) {
			teamMonsters.push(monFromNode(mon));
		}

	}

	var opponent = firstChildNodeNamed("opponent", resultsNode);
	if (opponent) {
		var oppLineup = firstChildNodeNamed("lineup", opponent);

		//Reset the opponents array to refresh all data there.
		opponentMonsters = new Array();

		for (var i = 0; i < oppLineup.childNodes.length; i++) {
			var mon = oppLineup.childNodes[i];
			var f8 = nodeValue(firstChildNodeNamed("f8", mon));


			opponentMonsters.push(monFromNode(mon));

		}
	}

	if (opponent != null) {
		//swap the teams if your the opponent in pvp
		var opponentName = nodeValue(firstChildNodeNamed("user", opponent));
		if (userName == opponentName) {
			var temp = opponentMonsters;
			opponentMonsters = teamMonsters;
			teamMonsters = temp;
		}
	}

}

function userFaint() {
	window.location = "/game/explore";
}


// ################################################
// ### SCRIPTING CLASS ###########################
// ################################################

//Script Variables
var activeScript = new Array();

//Animation timers
var scriptTick1 = 0;
var scriptTick2 = 0;
var scriptTick3 = 0;
var scriptTick4 = 0;

var drawnObjects = new Array();


var menuSelection = 0;
var menuOptions = new Array();
var menuDepth = new Array();

function MenuItem(text, style, icon) {
	this.text = text;
	this.style = style;
	this.icon = icon;
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	return this;
}

//processes the start of each script line.
function scriptProgress() {
	//reset objects for the next function
	drawnObjects = new Array();
	scriptTick1 = 0;
	scriptTick2 = 0;
	scriptTick3 = 0;
	scriptTick4 = 0;
	wipeWildMonsterBox();
	menuOptions = new Array();


	while (activeScript[0].func == null)
		activeScript.splice(0, 1);

	if (activeScript.length > 0) {
		var scriptFunc = activeScript[0].func.toLowerCase();
		var scriptData = activeScript[0].args;
		if (scriptFunc == "server side") {

			loadServerSide("token=" + scriptData.trim());
		} else if (scriptFunc == "display message") {

		} else if (scriptFunc == "sync all") {
			//do nothing till all events finish

		} else if (scriptFunc == "playonce") {
			playMusicOnce(scriptData.trim());
			scriptLineComplete();
		} else if (scriptFunc == "sfx") {
			playSFX(scriptData.trim());
			scriptLineComplete();

		} else if (scriptFunc == "notice") {
			if (scriptData.trim().split("^")[0] == "mon") {
				window.toast.fire({
					title: 'Your Latest Pokemon!',
					html: "You have obtained a <a rel='noopener' href=/game/monster/" + scriptData.trim().split("^")[2] + " style='color:#FEC814;' target='_blank'> " + scriptData.trim().split("^")[1] + "</a>."
				});

			}
			scriptLineComplete();

		} else if (scriptFunc == "main menu inventory") {
			menuSelection = 0;

		} else if (scriptFunc == "main menu") {
			menuSelection = 0;

			menuDepth = new Array();

			//menuOptions.push(new MenuItem("Appearance","basic",""));
			//menuOptions.push(new MenuItem("My Pokemon","basic",""));
			menuOptions.push(new MenuItem("Inventory", "basic", ""));
			//menuOptions.push(new MenuItem("Options","basic",""));
			menuOptions.push(new MenuItem("Press Z to close", "basic", ""));

			//menuSelection

		} else if (scriptFunc == "wipe") {

			var evnt = currentMap.getEvent(scriptData);
			if (evnt != null) {
				evnt.eventData = new Array();
			}
			scriptLineComplete();
		} else if (scriptFunc == "pokemon pc") {
			window.open('/game/pokemon', '_blank');
			scriptLineComplete();
		} else if (scriptFunc == "quest start") {

		} else if (scriptFunc == "quest finish") {

		} else if (scriptFunc == "money") {
			userMoney = parseInt(scriptData);
			scriptLineComplete();
		} else if (scriptFunc == "hide event") {
			var evnt = currentMap.getEvent(scriptData);

			evnt.bHidden = true;

			scriptLineComplete();
		}
		else if (scriptFunc == "show event") {
			var evnt = currentMap.getEvent(scriptData);

			evnt.bHidden = false;

			scriptLineComplete();
		}
		else if (scriptFunc == "move event") {
			//Add the function to the events queue
			var args = scriptData.split("^");
			var evnt = currentMap.getEvent(args[0]);
			var dir = args[1].toLowerCase();
			var steps = parseInt(args[2]);





			if (args[0] == "0")
				evnt = userEvent;
			evnt.run = parseInt(args[3]);

			if (dir.toLowerCase() == "move to user") {
				var xDif = userEvent.mapPosition.X - evnt.mapPosition.X;
				var yDif = userEvent.mapPosition.Y + 2 - evnt.mapPosition.Y;
				steps = 0;

				if (xDif != 0) {
					if (xDif < 0) {
						dir = "left";
						steps = -xDif;
					} else {
						dir = "right";
						steps = xDif;
					}
				}
				if (yDif != 0) {
					if (yDif < 0) {
						dir = "up";
						steps = -yDif;
					} else {
						dir = "down";
						steps = yDif;
					}
				}

				if (steps == 1)
					steps++;

				for (var i = 0; i < steps - 1; i++) {
					evnt.moveQueue.push(dir);
				}

			} else {

				if (dir == "forward") {
					if (evnt.direction == 0)
						dir = "up";
					if (evnt.direction == 1)
						dir = "down";
					if (evnt.direction == 2)
						dir = "left";
					if (evnt.direction == 3)
						dir = "right";
				}

				for (var i = 0; i < steps; i++) {
					evnt.moveQueue.push(dir);
				}
			}

			scriptLineComplete();
		} else if (scriptFunc == "transition") {

		} else if (scriptFunc == "shop") {
			battleItemSelectedMenu = 0;
			var items = scriptData.split("^");
			for (var i = 0; i < items.length; i++) {
				var item = items[i].split("|");

				screenResources.push(new ResourceImage("/images/items/" + item[3], "item." + item[1]));
			}
		} else if (scriptFunc == "choice") {
			scriptTick3 = 0;
			scriptTick4 = 0;
		} else if (scriptFunc == "add item") {
			var args = scriptData.split("^");
			screenResources.push(new ResourceImage("/images/items/" + args[1], "item." + args[0]));

			playSFX("coinchange");
		} else if (scriptFunc == "warp") {
			arrivalDirection = null;
			var args = scriptData.split("^");

			userEvent.mapPosition.X = parseInt(args[1]);
			userEvent.mapPosition.Y = parseInt(args[2]);

			scriptLineComplete();

			if (args[0].toLowerCase() != mapCode.toLowerCase()) {
				loadMap(args[0]);
			}
		} else if (scriptFunc == battlescreen) {

		} else if (scriptFunc == "battle") {
			battleWithTrainer();
			scriptLineComplete();
		} else if (scriptFunc == "inn animation") {
			playMusicOnce("healing");
		}
		else if (scriptFunc == "change sprite") {
			var tempNPC = scriptData.split("^");
			var evnt = currentMap.getEvent(tempNPC[0]);
			evnt.ImageRef = null;
			evnt.spriteName = tempNPC[1] + ".png";
			evnt.drawImage(ctx);
			scriptLineComplete();

		} else if (scriptFunc == "item purchase qty") {
			battleItemSelectedMenu = 0;
		}

		else {
			scriptLineComplete();
		}

	}
}

//updates the current line being executed and triggers the end of the script function
function scriptUpdate() {
	if (activeScript.length > 0) {
		var scriptFunc = activeScript[0].func.toLowerCase();
		var scriptData = activeScript[0].args;

		if (scriptFunc == "display message") {

			scriptTick1++;
			if (scriptTick1 > 1) {
				scriptTick2++;
				scriptTick1 = 0;
			}

			if ((keyState.btn1 || keyState.btn2) && scriptTick2 > scriptData.length) {
				playSFX("beep");
				scriptLineComplete();
				keyState.btn1 = false;
				keyState.btn2 = false;
			} else if ((keyState.btn1 || keyState.btn2)) {
				playSFX("beep");
				scriptTick2 = scriptData.length;
				keyState.btn1 = false;
				keyState.btn2 = false;
			}
		} else if (scriptFunc == "main menu inventory") {

			if (keyState.btn2) {
				if (menuDepth.length == 0) {
					keyState.btn2 = false;
					scriptLineComplete();
					scriptAddLine("main menu", "");
					scriptProgress();
				}
			} else if (keyState.btn1) {
				var selectedItem = inventory[menuSelection];
				if (selected.name == "Inventory") {
					//use item...
					scriptLineComplete();
				}
			} else if (keyState.up) {
				menuSelection--;
				if (menuSelection < 0)
					menuSelection = inventory.length - 1;
				keyState.up = false;
			} else if (keyState.down) {
				menuSelection++;
				if (menuSelection >= inventory.length)
					menuSelection = 0;
				keyState.down = false;
			}

		} else if (scriptFunc == "main menu") {

			if (keyState.btn2) {
				if (menuDepth.length == 0) {
					keyState.btn2 = false;
					scriptLineComplete();
				}
			} else if (keyState.btn1) {
				var selected = menuOptions[menuSelection];
				if (selected.text == "Inventory") {
					keyState.btn1 = false;
					scriptLineComplete();
					scriptAddLine("main menu inventory", "");
					scriptProgress();
				}
			} else if (keyState.up) {
				menuSelection--;
				if (menuSelection < 0)
					menuSelection = menuOptions.length - 1;
				keyState.up = false;
			} else if (keyState.down) {
				menuSelection++;
				if (menuSelection >= menuOptions.length)
					menuSelection = 0;
				keyState.down = false;
			}


		} else if (scriptFunc == "battle") {

		} else if (scriptFunc == "quest start") {
			scriptTick1++;
			if (scriptTick1 > 1) {
				scriptTick2++;
				scriptTick1 = 0;
			}

			if ((keyState.btn1 || keyState.btn2) && scriptTick2 > 10) {
				scriptLineComplete();
				keyState.btn1 = false;
				keyState.btn2 = false;
			}
		} else if (scriptFunc == "quest finish") {
			scriptTick1++;
			if (scriptTick1 > 1) {
				scriptTick2++;
				scriptTick1 = 0;
			}

			if ((keyState.btn1 || keyState.btn2) && scriptTick2 > 10) {
				scriptLineComplete();
				keyState.btn1 = false;
				keyState.btn2 = false;
			}
		} else if (scriptFunc == "shop") {
			var items = scriptData.split("^");

			if (scriptTick1 == 0) {
				if (keyState.up) {
					battleItemSelectedMenu = battleItemSelectedMenu - 1;
					if (battleItemSelectedMenu < 0)
						battleItemSelectedMenu = 0;
					keyState.up = false;
				} else if (keyState.right) {
					battleItemSelectedMenu = battleItemSelectedMenu + 4;
					if (battleItemSelectedMenu >= items.length)
						battleItemSelectedMenu = items.length - 1;
					keyState.right = false;
				} else if (keyState.left) {
					battleItemSelectedMenu = battleItemSelectedMenu - 4;
					if (battleItemSelectedMenu < 0)
						battleItemSelectedMenu = 0;
					keyState.left = false;
				} else if (keyState.down) {
					battleItemSelectedMenu = battleItemSelectedMenu + 1;
					if (battleItemSelectedMenu >= items.length)
						battleItemSelectedMenu = items.length - 1;
					keyState.down = false;
				} else if (keyState.btn1) {
					var itemData = items[battleItemSelectedMenu].split("|");
					scriptLineComplete();
					scriptAddLine("item purchase qty", itemData);

				} else if (keyState.btn2) {
					scriptLineComplete();
				}
			}


		} else if (scriptFunc == "add item") {

			scriptTick1++;
			if (scriptTick1 > 80) {
				scriptLineComplete();
			}

		} else if (scriptFunc == "sync all") {

			var bClear = true;
			for (var k = 0; k < currentMap.events.length; k++) {
				if (currentMap.events[k].moveQueue.length > 0) {
					bClear = false;
				}
			}
			if (userEvent.moveQueue.length > 0) {
				bClear = false;
			}

			if (bClear) {
				scriptLineComplete();
			}

		} else if (scriptFunc == "move event") {

		} else if (scriptFunc == "choice") {
			var args = scriptData.split("^");

			scriptTick1++;
			if (scriptTick1 > 1) {
				scriptTick2++;
				scriptTick1 = 0;
			}

			if ((keyState.btn1 || keyState.btn2) && scriptTick2 < args[0].length) {
				playSFX("beep");
				scriptTick2 = args[0].length;
				keyState.btn1 = false;
				keyState.btn2 = false;
			} else {
				//make choice
				if (keyState.up) {
					scriptTick3--;
					if (scriptTick3 < 0) {
						scriptTick3 = args.length - 2;
					}
					keyState.up = false;
				} else if (keyState.down) {
					scriptTick3++;
					if (scriptTick3 > args.length - 2) {
						scriptTick3 = 0;
					}
					keyState.down = false;
				} else if (keyState.btn1 && scriptTick4 == 0) {
					loadUtility("action=choice&item=" + (scriptTick3 + 1));
					scriptTick4 = 1;

					keyState.btn1 = false;
				}




			}




		} else if (scriptFunc == battlescreen) {
			//
			// Animate curtains falling down the screen.
			//
			//
			// Animate curtains falling down the screen.
			//
			if (drawnObjects.length == 0) {
				drawnObjects.push("rect:0:0:width:height:rgba(255, 255, 255, 0)");
			}


			if (scriptTick2 == 0) {
				scriptTick1 = scriptTick1 + 24;
				if (scriptTick1 > cvsHeight) {
					scriptTick2++;
					scriptTick1 = 1;
					drawnObjects[0] = "rect:0:0:width:height:rgba(237,21,21,1)";
				} else {
					drawnObjects[0] = "rect:0:0:width:" + scriptTick1 + ":rgba(237,21,21,1)";
				}

			} else if (scriptTick2 == 1) {
				scriptTick1 -= 0.05;
				if (scriptTick1 <= 0) {
					scriptTick1 = 0;

					bInBattle = true;

					if (scriptData == "WILD") {
						loadBattle("x=" + userEvent.mapPosition.X + "&y=" + userEvent.mapPosition.Y + "&action=encounter");
					} else if (scriptData == "TRAINER") {
						loadBattle("x=" + userEvent.mapPosition.X + "&y=" + userEvent.mapPosition.Y + "&action=trainer");
					} else if (scriptData == "PVP") {
						loadBattle("x=" + userEvent.mapPosition.X + "&y=" + userEvent.mapPosition.Y + "&action=pvp");
					}

					scriptLineComplete();
					return;
				}
				drawnObjects[0] = "rect:0:0:width:height:rgba(237,186,21," + scriptTick1 + ")";
			}


		} else if (scriptFunc == "inn animation") {
			//
			// Animate curtains falling down the screen.
			//
			if (drawnObjects.length == 0) {
				drawnObjects.push("rect:0:0:width:height:rgba(255, 255, 255, 0)");
			}


			if (scriptTick2 == 0) {
				scriptTick1 = scriptTick1 + 16;
				if (scriptTick1 > cvsHeight) {
					scriptTick2++;
					scriptTick1 = 1;
					drawnObjects[0] = "rect:0:0:width:height:rgba(237,186,21,1)";
				} else {
					drawnObjects[0] = "rect:0:0:width:" + scriptTick1 + ":rgba(237,186,21,1)";
				}

			} else if (scriptTick2 == 1) {
				scriptTick1 -= 0.01;
				if (scriptTick1 <= 0) {
					scriptTick1 = 0;
					scriptLineComplete();
					return;
				}
				drawnObjects[0] = "rect:0:0:width:height:rgba(237,186,21," + scriptTick1 + ")";
			}

		} else if (scriptFunc == "item purchase qty") {
			var items = "1^5^10^25".split("^");
			if (scriptTick1 == 0) {
				if (keyState.up) {
					battleItemSelectedMenu = battleItemSelectedMenu - 1;
					if (battleItemSelectedMenu < 0)
						battleItemSelectedMenu = 0;
					keyState.up = false;
				} else if (keyState.right) {
					battleItemSelectedMenu = battleItemSelectedMenu + 4;
					if (battleItemSelectedMenu >= items.length)
						battleItemSelectedMenu = items.length - 1;
					keyState.right = false;
				} else if (keyState.left) {
					battleItemSelectedMenu = battleItemSelectedMenu - 4;
					if (battleItemSelectedMenu < 0)
						battleItemSelectedMenu = 0;
					keyState.left = false;
				} else if (keyState.down) {
					battleItemSelectedMenu = battleItemSelectedMenu + 1;
					if (battleItemSelectedMenu >= items.length)
						battleItemSelectedMenu = items.length - 1;
					keyState.down = false;
				} else if (keyState.btn1) {
					loadUtility("action=buy&item=" + scriptData[0] + "&npc=" + lastTriggeredEventId + "&qty=" + items[battleItemSelectedMenu].split("|")[0]);
					keyState.btn1 = false;
				}
				else if (keyState.btn2) {
					scriptLineComplete();
					keyState.btn2 = false;
				}
			}
		}
	}
}

function scriptLineComplete() {
	activeScript.splice(0, 1);
	if (activeScript.length > 0)
		scriptProgress();
}

function menuOpen() {
	if (activeScript.length == 0) {
		scriptAddLine("main menu");
		scriptProgress();
	}
}

//Accepts user input
function scriptKeys() {


}

//Draws Script related items
function scriptDraw() {

	if (activeScript.length > 0) {
		var scriptFunc = activeScript[0].func.toLowerCase();
		var scriptData = activeScript[0].args;

		var centerX = cvsWidth / 2;
		var centerY = cvsHeight / 2;

		if (scriptFunc == "display message") {

			ctx.textAlign = "left";
			ctx.font = "bold 14px sans-serif";

			ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
			ctx.fillRect(centerX - 201, centerY + 77, 402, 72);
			ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
			ctx.fillRect(centerX - 200, centerY + 78, 400, 70);


			var line1 = scriptData;
			var line2 = "";

			if (line1.length > 49) {
				var lastSpace = line1.lastIndexOf(" ", 49);
				line2 = line1.substr(lastSpace + 1, line1.length - lastSpace - 1);
				line1 = line1.substr(0, lastSpace);
			}

			if (scriptTick2 <= line1.length) {
				drawShadowText(ctx, line1.substr(0, scriptTick2), centerX - 190, centerY + 100);
			} else {
				drawShadowText(ctx, line1, centerX - 190, centerY + 100);
				drawShadowText(ctx, line2.substr(0, scriptTick2 - line2.length), centerX - 190, centerY + 116);
			}

			ctx.textAlign = "center";
			ctx.font = "bold 11px sans-serif";
			drawShadowText(ctx, "(press 'x' to continue)", centerX, centerY + 140);

		} else if (scriptFunc == "main menu inventory") {

			var runY = 15;
			var runX = 15;

			if (inventory.length == 0) {
				ctx.textAlign = "left";
				ctx.font = "bold 11px sans-serif";
				drawShadowText(ctx, "You are not carrying any usable items.", runX, runY + 4);
				drawShadowText(ctx, "Press Z to return to the last menu.", runX, runY + 15 + 4);
			}

			for (var i = 0; i < inventory.length; i++) {
				var iHeight = 25;
				var iWidth = 160;

				//default
				ctx.fillStyle = 'rgba(33, 33, 33, 0.55)';
				ctx.fillRect(runX, runY, iWidth, iHeight);

				if (menuSelection == i) {
					ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
				} else {
					ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
				}
				ctx.fillRect(runX + 1, runY + 1, iWidth - 2, iHeight - 2);

				if (inventory[i].name != "") {
					ctx.textAlign = "left";
					ctx.font = "bold 11px sans-serif";
					drawShadowText(ctx, inventory[i].name, runX + 32, runY + iHeight / 2 + 4);
				}

				runY = runY + iHeight + 2;
			}

		} else if (scriptFunc == "main menu") {


			var runY = 15;
			var runX = 15;
			for (var i = 0; i < menuOptions.length; i++) {
				var iHeight = 25;
				var iWidth = 160;

				if (menuOptions[i].style == "basic") {
					//default
					ctx.fillStyle = 'rgba(33, 33, 33, 0.55)';
					ctx.fillRect(runX, runY, iWidth, iHeight);

					if (menuSelection == i) {
						ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
					} else {
						ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
					}
					ctx.fillRect(runX + 1, runY + 1, iWidth - 2, iHeight - 2);
				}

				if (menuOptions[i].text != "") {
					ctx.textAlign = "left";
					ctx.font = "bold 11px sans-serif";
					drawShadowText(ctx, menuOptions[i].text, runX + 32, runY + iHeight / 2 + 4);
				}

				runY = runY + iHeight + 2;
			}


		} else if (scriptFunc == "choice") {
			var args = scriptData.split("^");

			ctx.textAlign = "left";
			ctx.font = "bold 14px sans-serif";

			ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
			ctx.fillRect(centerX - 201, centerY + 77, 402, 72);
			ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
			ctx.fillRect(centerX - 200, centerY + 78, 400, 70);


			var line1 = args[0];
			var line2 = "";

			if (line1.length > 49) {
				var lastSpace = line1.lastIndexOf(" ", 49);
				line2 = line1.substr(lastSpace + 1, line1.length - lastSpace - 1);
				line1 = line1.substr(0, lastSpace);
			}

			if (scriptTick2 <= line1.length) {
				drawShadowText(ctx, line1.substr(0, scriptTick2), centerX - 190, centerY + 100);
			} else {
				drawShadowText(ctx, line1, centerX - 190, centerY + 100);
				drawShadowText(ctx, line2.substr(0, scriptTick2 - line2.length), centerX - 190, centerY + 116);
			}


			if (scriptTick2 >= args[0].length) {
				var lines = args.length - 1;

				for (var k = 0; k < lines; k++) {
					var y = centerY - 150 + k * 40;

					ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
					ctx.fillRect(centerX - 201, y - 1, 402, 32);
					ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
					if (scriptTick3 == k)
						ctx.fillStyle = 'rgba(10, 90, 10, 0.85)';
					ctx.fillRect(centerX - 200, y, 400, 30);

					drawShadowText(ctx, "- " + args[k + 1], centerX - 190, y + 20);
				}
			}
		} else if (scriptFunc == "quest start") {
			var args = scriptData.split("^");

			ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
			ctx.fillRect(centerX - 241, centerY + 77, 482, 62);
			ctx.fillStyle = 'rgba(90, 0, 0, 0.75)';
			ctx.fillRect(centerX - 240, centerY + 78, 480, 60);

			ctx.textAlign = "center";
			ctx.font = "bold 14px sans-serif";
			drawShadowText(ctx, "Quest Accepted: " + args[0], centerX, centerY + 97);

			ctx.font = "bold 11px sans-serif";
			drawShadowText(ctx, args[1], centerX, centerY + 115);

			ctx.font = "bold 12px sans-serif";
			drawShadowText(ctx, "Reward: " + args[2] + "Â¢", centerX, centerY + 133);

		} else if (scriptFunc == "quest finish") {

			var args = scriptData.split("^");

			ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
			ctx.fillRect(centerX - 241, centerY + 77, 482, 62);
			ctx.fillStyle = 'rgba(0, 90, 0, 0.75)';
			ctx.fillRect(centerX - 240, centerY + 78, 480, 60);

			ctx.textAlign = "center";
			ctx.font = "bold 14px sans-serif";
			drawShadowText(ctx, "Quest Complete: " + args[0], centerX, centerY + 97);

			ctx.font = "bold 11px sans-serif";
			drawShadowText(ctx, args[1], centerX, centerY + 115);

			ctx.font = "bold 12px sans-serif";
			drawShadowText(ctx, "Reward: " + args[2] + "Â¢", centerX, centerY + 133);

		} else if (scriptFunc == "add item") {
			var args = scriptData.split("^");

			var item = resourceByKey("item." + args[0]);

			ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
			ctx.fillRect(centerX - 201, centerY + 77, 402, 32);
			ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
			ctx.fillRect(centerX - 200, centerY + 78, 400, 30);

			ctx.textAlign = "center";
			ctx.font = "bold 14px sans-serif";
			drawShadowText(ctx, args[0] + " x" + args[2] + " acquired.", centerX, centerY + 97);

			ctx.drawImage(item, centerX - 188 + 16, centerY + 97 - 16);

		} else if (scriptFunc == "shop") {

			ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
			ctx.fillRect(centerX - 330, centerY - 101, 690, 180);
			ctx.fillStyle = 'rgba(33, 33, 33, 0.85)';
			ctx.fillRect(centerX - 329, centerY - 100, 688, 178);

			ctx.textAlign = "left";
			ctx.font = "bold 10px sans-serif";
			drawShadowText(ctx, "or press 'z' to leave the store.", centerX - 228, centerY + 73);

			ctx.textAlign = "center";
			ctx.font = "bold 12px sans-serif";
			drawShadowText(ctx, "Select an Item to Purchase", centerX, centerY - 80);

			var items = scriptData.split("^");
			for (var i = 0; i < items.length; i++) {
				var item = items[i].split("|");

				var pos = i + 1;

				var x = centerX - 80;
				var y = centerY - 75;
				if (pos < 5) {
					x = x - 110;
					y = y + pos * 30;
				} else if (pos < 9) {
					x = x + 110;
					y = y + (pos - 4) * 30;
				}
				else {
					x = x + 320;
					y = y + (pos - 8) * 30;
				}

				if (battleItemSelectedMenu == i) {
					ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
					ctx.fillRect(x - 101, y - 16, 202, 24);
				}

				ctx.fillStyle = 'rgba(33, 33, 33, 0.85)';
				ctx.fillRect(x - 100, y - 15, 200, 22);

				ctx.font = "bold 10px sans-serif";
				drawShadowText(ctx, item[1], x, y);
				drawShadowText(ctx, item[4] + "Â¢", x + 80, y);

				var itemImg = resourceByKey("item." + item[1]);
				ctx.drawImage(itemImg, x - 95, y - 20);

			}

			if (scriptTick1 == 1) {

				ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
				ctx.fillRect(centerX - 101, centerY + 77, 202, 32);
				ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
				ctx.fillRect(centerX - 100, centerY + 78, 200, 30);

				ctx.textAlign = "center";
				ctx.font = "bold 14px sans-serif";
				drawShadowText(ctx, "Loading", centerX, centerY + 97);
			}

		} else if (scriptFunc == "server side") {


			ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
			ctx.fillRect(centerX - 101, centerY + 77, 202, 32);
			ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
			ctx.fillRect(centerX - 100, centerY + 78, 200, 30);

			ctx.textAlign = "center";
			ctx.font = "bold 14px sans-serif";
			drawShadowText(ctx, "Loading", centerX, centerY + 97);

		} else if (scriptFunc == "item purchase qty") {
			ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
			ctx.fillRect(centerX - 330, centerY - 101, 690, 180);
			ctx.fillStyle = 'rgba(33, 33, 33, 0.85)';
			ctx.fillRect(centerX - 329, centerY - 100, 688, 178);

			ctx.textAlign = "left";
			ctx.font = "bold 10px sans-serif";
			drawShadowText(ctx, "or press 'z' to leave the store.", centerX - 228, centerY + 73);

			ctx.textAlign = "center";
			ctx.font = "bold 12px sans-serif";
			drawShadowText(ctx, "Select Quantity to purchase " + scriptData[1], centerX, centerY - 80);

			var items = "1^5^10^25".split("^");
			for (var i = 0; i < items.length; i++) {
				var item = items[i].split("|");

				var pos = i + 1;

				var x = centerX - 80;
				var y = centerY - 75;
				if (pos < 5) {
					x = x - 110;
					y = y + pos * 30;
				} else if (pos < 9) {
					x = x + 110;
					y = y + (pos - 4) * 30;
				}
				else {
					x = x + 320;
					y = y + (pos - 8) * 30;
				}

				if (battleItemSelectedMenu == i) {
					ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
					ctx.fillRect(x - 101, y - 16, 202, 24);
				}

				ctx.fillStyle = 'rgba(33, 33, 33, 0.85)';
				ctx.fillRect(x - 100, y - 15, 200, 22);

				ctx.font = "bold 10px sans-serif";
				drawShadowText(ctx, item[0], x, y);

			}
		}
	}


	for (var i = 0; i < drawnObjects.length; i++) {
		var opts = drawnObjects[i].split(":");

		if (opts[0] == "rect") {
			var width = opts[3];
			var height = opts[4];

			if (width == "width")
				width = cvsWidth;
			if (height == "height")
				height = cvsHeight;

			ctx.fillStyle = opts[5];
			ctx.fillRect(parseInt(opts[1]), parseInt(opts[2]), width, height);
		} else if (opts[0] == "image") {
			var img = resourceByKey(opts[1]);
			var x = opts[2];
			var y = opts[3];

			if (x == "center")
				x = cvsWidth / 2 - img.width / 2;
			if (y == "center")
				y = cvsHeight / 2 - img.height / 2;

			ctx.drawImage(img, x, y);

		} else if (opts[0] == "text") {

			ctx.textAlign = opts[1]; //"center";
			ctx.fillStyle = opts[2]; //'rgba(33, 33, 33, 0.85)';
			ctx.font = opts[3]; //"bold 10px sans-serif";
			drawShadowText(ctx, opts[4], parseInt(opts[5]), parseInt(opts[6]));

		}
	}

}

//Adds an action to the queue
function scriptAddLine(command, data) {
	activeScript.push(new ScriptLine(0, command, data));
	if (activeScript.length == 1) {
		scriptProgress();
	}
}


//******************************************************
// Quick script functions.
//******************************************************


function loadServerSide(args) {

	loadExplore = true; //sets this as true on warp/first load and thus enables wild encounters
	var xmlHttpReq = requestObject();
	self.xmlHttpReq.open("POST", "/game/xml/explore?rand=" + (Math.random() * 1000000), true);
	self.xmlHttpReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	self.xmlHttpReq.onreadystatechange = loadServerSideCallback;
	self.xmlHttpReq.send(args);
}

function loadServerSideCallback() {
	if (self.xmlHttpReq.readyState == 4) {
		if (self.xmlHttpReq.responseXML) {
			var resultsNode = self.xmlHttpReq.responseXML.childNodes[1];
			if (!resultsNode) {
				resultsNode = self.xmlHttpReq.responseXML.childNodes[0];
			}

			if (resultsNode == null) {
				return;
			}

			//load the new script functions
			var script = firstChildNodeNamed("script", resultsNode);
			for (var i = 0; i < script.childNodes.length; i++) {
				line = script.childNodes[i];
				if (line.nodeName != "#comment") {
					activeScript.push(new ScriptLine(nodeValue(firstChildNodeNamed("line", line)), nodeValue(firstChildNodeNamed("function", line)), nodeValue(firstChildNodeNamed("arguments", line))));
				}
			}

			//end the current sript line which must be a "server side"
			scriptLineComplete();

		}
	}
}
var isNotification = false;
var hatchingEgg = false;
var keepAliveRequest = null;
function loadUtility(args) {

	scriptTick1 = 1;
	keepAliveRequest = requestUtilityObject();
	keepAliveRequest.open("POST", "/game/xml/utility?rand=" + (Math.random() * 1000000), true);
	keepAliveRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	if (args == "keepAlive=true") {
		keepAliveRequest.onreadystatechange = loadUtilityCallbackDummy;
	} else {
		keepAliveRequest.onreadystatechange = loadUtilityCallback;
	}
	keepAliveRequest.send(args);

}

function loadUtilityCallbackDummy() {

}

function loadUtilityCallback() {
	if (keepAliveRequest.readyState == 4) {
		if (keepAliveRequest.responseXML) {
			var resultsNode = keepAliveRequest.responseXML.childNodes[1];
			if (!resultsNode) {
				resultsNode = keepAliveRequest.responseXML.childNodes[0];
			}

			if (resultsNode == null) {
				return;
			}
			if (hatchingEgg) {
				var inner = nodeValue(resultsNode);
				if (inner != null) {
					activeScript.splice(0, 0, new ScriptLine(0, "Display Message", inner));
					playSFX("levelup");
					scriptProgress();
					eggs.splice(0, 1);
				}
				hatchingEgg = false;
			}
			else if (isNotification) {
				if (firstChildNodeNamed("count", resultsNode) != null) {
					if (visualNight)
						isNight = parseInt(nodeValue(firstChildNodeNamed("time", resultsNode)));
					var count = parseInt(nodeValue(firstChildNodeNamed("count", resultsNode)));
					if (count > 0) {
						if (count >= 5) {

							window.toast.fire({
								title: 'System Message',
								html: "You have " + count + " new <a target='_blank' style='color:#FEC814;' href='/game/home'> notifications</a>."
							});
						} else {
							var messages = firstChildNodeNamed("messages", resultsNode);
							for (var i = 0; i < messages.childNodes.length; i++) {
								let text = $(messages.childNodes[i].childNodes[0]).text();
								window.toast.fire({
									title: 'Notification',
									html: text
								});

							}
						}
					}
					isNotification = false;
				}
			}
			else {

				if (activeScript.length > 0) {
					var scriptFunc = activeScript[0].func.toLowerCase();
					var scriptData = activeScript[0].args;



					if (scriptFunc == "shop" || scriptFunc == "item purchase qty") {
						var moneyNode = firstChildNodeNamed("money", resultsNode);
						if (moneyNode)
							userMoney = parseInt(nodeValue(moneyNode));

						var msgNode = firstChildNodeNamed("msg", resultsNode);
						if (msgNode) {
							activeScript.splice(0, 0, new ScriptLine(0, "Display Message", nodeValue(msgNode)));
							playSFX("coinchange");
							scriptProgress();
						}
					} else {
						scriptLineComplete();
					}
				}
			}

		}
		scriptTick1 = 0;
	}
}

function hideRequest() {
	document.getElementById("mws-explore-requests").innerHTML = "";
}


function btnShowFollower(btn) {
	if (btn.value == "On") {
		btn.value = "Off";
		bShowFollower = false;
		btn.className = "mws-button red small";

	}
	else {
		btn.value = "On";
		bShowFollower = true;
		btn.className = "mws-button green small";

	}
}



function userOnWhichChat(v) {
	userOnWhichChatTab = v.id;
}

function showNotify() {
	if (!bInBattle) {
		isNotification = true;
		loadUtility("action=notification");
	}
}
