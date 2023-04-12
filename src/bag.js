
var shopItemId = null;
var shopItemQty = null;

var shopSize = null;
var shopCostBase = null;



$(document).ready(function() {

/*
*/

	$(".mws-form").bind("submit", function() { if( replyingTo == null ) { btnPostDo(); } else { btnCommentDo(); }; return false; })

});



function btnUpgrade(curSize) {


	$('#mws-jui-dialog-shop').dialog({
		autoOpen: false,
		title: 'Place Item in the Shop',
		modal: true,
		width: "320",
		buttons: [{
				text: "Save",
				click: function() {
					btnSaveUpgrade();
					$( this ).dialog( "close" );
					_common.showLoading();
				}},{
				text: "Cancel",
				click: function() {
					$( this ).dialog( "close" );
				}}]
	});
	$("#mws-jui-dialog-shop").dialog("option", {modal: false}).dialog("open");

	$(".mws-slider-size").slider({
		range: "min",
		min: curSize,
		value: curSize,
		step: 5,
		max: 200,
		slide: function( event, ui ) {
			sliderUpdateCost(this, ui.value);
		}
	});

	document.getElementById('lblSpaceQty').innerHTML = curSize;
	shopSize = curSize;
	shopCostBase = parseInt((curSize * (curSize/8)) * 100);
}

function sliderUpdateCost(obj, val) {
	document.getElementById('lblSpaceQty').innerHTML = val;
	shopSize = val;
	document.getElementById('txtCost').innerHTML = parseInt((shopSize * (shopSize/8)) * 100) - shopCostBase;

}



function btnSell(itemid, itemname, itemimg, itemqty) {
	shopItemId = itemid;

	$('#mws-jui-dialog-sell').dialog({
		autoOpen: false,
		title: 'Place Item in the Shop',
		modal: true,
		width: "320",
		buttons: [{
				text: "Save",
				click: function() {
					btnSaveToShop();
					$( this ).dialog( "close" );
					_common.showLoading();
				}},{
				text: "Cancel",
				click: function() {
					$( this ).dialog( "close" );
				}}]
	});
	$("#mws-jui-dialog-sell").dialog("option", {modal: false}).dialog("open");

	$(".mws-slider-qty").slider({
		range: "min",
		min: 1,
		value: 1,
		max: parseInt(itemqty),
		slide: function( event, ui ) {
			sliderUpdate(this, ui.value);
		}
	});

	document.getElementById('lblQty').innerHTML = 1;
	shopItemQty = 1;
}

function sliderUpdate(obj, val) {
	document.getElementById('lblQty').innerHTML = val;
	shopItemQty = val;
}


var trade = null;
var tradePostData = null;



function openTrade(tradeId) {
	trade = tradeId;
	loadData("trade=" + trade);
	$("#mws-jui-dialog-trades").dialog( "close" );
	_common.showLoading();
}

function loadDataConfirm(postData,action) {
	tradePostData = postData;

	$("#mws-jui-dialog-trades").dialog( "close" );

	document.getElementById('divTrade').innerHTML = "";
	document.getElementById('divOffer').innerHTML = "";

	var subject = "Are you sure you want to accept this offer?";
	if( action == 0 )
		subject = "Are you sure you want to decline this offer?";

	$('#mws-jui-dialog-trades').dialog({
		autoOpen: false,
		title: subject,
		modal: true,
		width: "480",
		buttons: [{
				text: "Yes",
				click: function() {
					loadData(tradePostData);
				}},{
				text: "Cancel",
				click: function() {
					$( this ).dialog( "close" );
				}}]
	});
	$("#mws-jui-dialog-trades").dialog("option", {modal: false}).dialog("open");



}

function loadData(postData) {

	if( !postData )
		postData = "";

	var xmlHttpReq = requestObject();
	self.xmlHttpReq.open("POST", "/game/xml/account?rand=" + (Math.random() * 1000000), true);

	self.xmlHttpReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	self.xmlHttpReq.onreadystatechange = loadDataCallback;
	self.xmlHttpReq.send(postData);
}

function loadDataCallback() {
	if (self.xmlHttpReq.readyState == 4) {
		if (self.xmlHttpReq.responseXML) {
			var resultsNode = self.xmlHttpReq.responseXML.childNodes[1];
			if (!resultsNode) {
				resultsNode = self.xmlHttpReq.responseXML.childNodes[0];
			}

			if (resultsNode == null) {
				return;
			}

			var tradeNode = firstChildNodeNamed("trade",resultsNode);

			if( tradeNode == null ) {
				window.location = "/account/";
				return;
			}


			//Properties
			var id = nodeValue(firstChildNodeNamed("id",tradeNode));
			var monid = nodeValue(firstChildNodeNamed("monid",tradeNode));
			var name = nodeValue(firstChildNodeNamed("name",tradeNode));
			var form = nodeValue(firstChildNodeNamed("form",tradeNode));
			var special = nodeValue(firstChildNodeNamed("special",tradeNode));
			var level = nodeValue(firstChildNodeNamed("level",tradeNode));
			var gender = nodeValue(firstChildNodeNamed("gender",tradeNode));
			var money = nodeValue(firstChildNodeNamed("money",tradeNode));
			var time = nodeValue(firstChildNodeNamed("time",tradeNode));
			var image = nodeValue(firstChildNodeNamed("image",tradeNode));
			var offercount = nodeValue(firstChildNodeNamed("offercount",tradeNode));
			var offerto = nodeValue(firstChildNodeNamed("offerto",tradeNode));

			var html = '';
			html = html + "<center><input type='button' style='width:300px;' class='mws-tooltip-s mws-button green large' value='Your Trade - Monster: " + name + "'>&nbsp;<input type='button' style='width:120px;' class='mws-tooltip-s mws-button red large' value='Remove' onclick=\"loadData('trade=" + trade + "&action=remove');\" ><br/><img src='" + image + "'/><br/>Form: " + form + ", Level: "+level+", Gender: " + gender + ".<br/>Added: " + time + "<br/><br/></center>";

			document.getElementById('divTrade').innerHTML = html;

			//Suboffers.
			html = '';

			if( parseInt(offerto) == 0 ) {
				var offers = firstChildNodeNamed("offers",tradeNode);
				for(var k=0;k<offers.childNodes.length;k++) {
					html = html + outputTradeOffer(offers.childNodes[k]);
				}
				if( offers.childNodes.length == 0 ) {
					html = html + "<h3>No Offers Have Been Made.</h3>";
					html = html + "<div></div>";
				}
				document.getElementById('divOffer').innerHTML = "<div class='mws-accordion'>" + html + "</div>";
			} else {
				document.getElementById('divOffer').innerHTML = "";
			}

			_common.hideLoading();

			$('#mws-jui-dialog-trades').dialog({
				autoOpen: false,
				title: 'Browse Trade',
				modal: true,
				width: "480",
				buttons: [{
						text: "Close",
						click: function() {
							$( this ).dialog( "close" );
						}}]
			});
			$("#mws-jui-dialog-trades").dialog("option", {modal: false}).dialog("open");


			$(".mws-accordion").accordion();


			//divTrade
			//divOffer
		}
	}
}


function outputTradeOffer(node) {
	var html = "";

	var id = nodeValue(firstChildNodeNamed("id",node));
	var username = nodeValue(firstChildNodeNamed("username",node));
	var monid = nodeValue(firstChildNodeNamed("monid",node));
	var name = nodeValue(firstChildNodeNamed("name",node));
	var form = nodeValue(firstChildNodeNamed("form",node));
	var special = nodeValue(firstChildNodeNamed("special",node));
	var level = nodeValue(firstChildNodeNamed("level",node));
	var gender = nodeValue(firstChildNodeNamed("gender",node));
	var money = nodeValue(firstChildNodeNamed("money",node));
	var time = nodeValue(firstChildNodeNamed("time",node));
	var image = nodeValue(firstChildNodeNamed("image",node));

	if( parseInt(money) > 0 && parseInt(monid) > 0 ) {
		html = html + "<h3><a href='#'>User: " + username + ", Monster: " + name + " and Coin: " + money + "Â¢</a></h3>";
	} else if( parseInt(money) > 0 && parseInt(monid) == 0 ) {
		html = html + "<h3><a href='#'>User: " + username + ", Coin Only: " + money + "Â¢</a></h3>";
	} else {
		html = html + "<h3><a href='#'>User: " + username + ", Monster Only: " + name + "</a></h3>";
	}

	html = html + "<div>";
	html = html + "<p>";
	html = html + "<center><img src='" + image + "'/><br/>Form: " + form + ", Level: "+level+", Gender: " + gender + ".";
	html = html + "<br/>Added: " + time + ", Coin Offer: " + money + "Â¢.<br/>";
	html = html + "<input type='button' style='width:120px;' onclick=\"loadDataConfirm('trade=" + trade + "&action=accept&args="+ id +"',1);\" class='mws-tooltip-s mws-button green' value='Accept'>&nbsp;";
	html = html + "<input type='button' style='width:120px;' onclick=\"loadDataConfirm('trade=" + trade + "&action=decline&args="+ id +"',0);\" class='mws-tooltip-s mws-button red' value='Decline'>";
	html = html + "</center><br/><br/><br/></p>";
	html = html + "</div>";
	return html;
}


function requestObject() {
	var xmlHttpReq = false;

	// Mozilla/Safari
	if (window.XMLHttpRequest) {
		self.xmlHttpReq = new XMLHttpRequest();
	}
	// IE
	else if (window.ActiveXObject) {
		self.xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
	}

	return xmlHttpReq;
}

function firstChildNodeNamed(name, node) {
	if( node ) {
		if( node.childNodes ) {
			for (var i = 0; i < node.childNodes.length; i++) {
				if (node.childNodes[i].nodeName == name)
					return node.childNodes[i];
			}
		} else {
			alert("Item Provided is not a XmlNode!");
		}
	} else {
		alert("Item Provided is not a XmlNode!");
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
