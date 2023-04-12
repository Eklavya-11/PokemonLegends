

var itemQty = null;
var itemPrice = null;
var itemID = null;
var userid = 0;

$(document).ready(function() {

	$(".mws-tabs").tabs();
	$(".mws-datatable-shoplogs").dataTable({sPaginationType: "full_numbers"});
	$(".mws-datatable-shop").dataTable({sPaginationType: "full_numbers"});
	$(".mws-datatable-items").dataTable({sPaginationType: "full_numbers"});
	
});


function btnAddFriend() {
	_common.showLoading();
	window.location = '/game/friends?f='+document.getElementById('data').value;
	
}
function btnOpenTrade()
{
	_common.showLoading();
	window.location = '/game/trades?user='+document.getElementById('data').value;	
}

function btnOpenAuction(){
	_common.showLoading();
	window.location = '/game/auction?user='+document.getElementById('data').value;	
}
function btnPurchaseItem() {
	document.getElementById('args').value = itemID + "|" + itemQty;
	document.getElementById('action').value = 'purchase';
	userid = document.getElementById('userid').value;
	//document.forms['pageForm'].submit();
	processReq();
	_common.showLoading();
}



/*
function btnPurchase(curQty, curPrice,curID) {
	
	$('#mws-jui-dialog-buy').dialog({
		autoOpen: false, 
		title: 'Purchase Item', 
		modal: true, 
		width: "320", 
		buttons: [{
				text: "Buy", 
				click: function() {
					btnPurchaseItem();
					$( this ).dialog( "close" );
					_common.showLoading();
				}},{
				text: "Cancel", 
				click: function() {
					$( this ).dialog( "close" );
				}}]
	});
	$("#mws-jui-dialog-buy").dialog("option", {modal: false}).dialog("open");
	
	$(".mws-slider-size").slider({
		range: "min", 
		min: 1, 
		value: 1,
		max: curQty, 
		slide: function( event, ui ) {
			sliderUpdateCost(this, ui.value);
		}
	});
	
	document.getElementById('lblSpaceQty').innerHTML = 1;
	itemQty = 1;
	itemPrice = curPrice;
	itemID = curID;
	shopCostBase = itemPrice * itemQty;
	document.getElementById('txtCost').innerHTML = itemPrice * itemQty;
}*/
/*
function sliderUpdateCost(obj, val) {
	document.getElementById('lblSpaceQty').innerHTML = val;
	itemQty = val;
	document.getElementById('txtCost').innerHTML = itemPrice * itemQty;
	
}
*/

var trade = null;
var tradePostData = null;

function btnMakeOffer() {
	//trade
	//txtCoin
	//lstMons
	
	var lstMons = document.getElementById("lstMons");
	var monid = lstMons.options[lstMons.selectedIndex].value;
	var coinOffer = document.getElementById('txtCoin').value;
	
	$("#mws-jui-dialog-trades").dialog( "close" );
	_common.showLoading();
	document.getElementById('args').value = trade + "|" + monid + "|" + coinOffer;
	document.getElementById('action').value = 'tradeOffer';
	document.forms['pageForm'].submit();
	
	
}

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
			
			var html = '';
			html = html + "<center><input type='button' style='width:420px;' class='mws-tooltip-s mws-button green large' value='Trade - Monster: " + name + "'><br/><img src='" + image + "'/><br/>Form: " + form + ", Level: "+level+", Gender: " + gender + ".<br/>Special: "+special+", Added: " + time + "<br/><br/></center>";
			document.getElementById('divTrade').innerHTML = html;
			
			_common.hideLoading();
			
			$('#mws-jui-dialog-trades').dialog({
				autoOpen: false, 
				title: 'Browse Trade', 
				modal: true, 
				width: "560", 
				buttons: [{
						text: "Make Offer", 
						click: function() {
							btnMakeOffer();
							$( this ).dialog( "close" );
						}},{
						text: "Close", 
						click: function() {
							$( this ).dialog( "close" );
						}}]
			});
			$("#mws-jui-dialog-trades").dialog("option", {modal: false}).dialog("open");
			
			
			$("select.chzn-select").chosen();
			
			//divTrade
			//divOffer
		}
	}
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

function processReq()
{
	var xmlhttp;
	// Mozilla/Safari
	if (window.XMLHttpRequest) {
		self.xmlhttp = new XMLHttpRequest();
	}
	// IE
	else if (window.ActiveXObject) {
		self.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
    	 self.xmlhttp.open("GET", "/game/xml/user?action=purchase&id="+document.getElementById('userid').value+"&args="+document.getElementById('args').value +"&rand="+ (Math.random() * 1000000) , true);
	
        self.xmlhttp.onreadystatechange = loadDataCallback;
        self.xmlhttp.send();

}
function loadDataCallback()
{
	if (self.xmlhttp.readyState == 4) {
		if (self.xmlhttp.responseXML) {
			var resultsNode = self.xmlhttp.responseXML.childNodes[1];
			if (!resultsNode) {
				resultsNode = self.xmlhttp.responseXML.childNodes[0];
			}

			if (resultsNode == null) {
				return;
			}
			
			var msg = nodeValue(firstChildNodeNamed("message",resultsNode)).split(':');

			document.getElementById("showRes").className = "mws-form-message " + msg[0];
			document.getElementById("showRes").innerHTML = msg[1];
			_common.hideLoading();
			window.location.reload();
		}
	}
}




