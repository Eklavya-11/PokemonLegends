
$(document).ready(function() {
	
		$(".mws-datatable").dataTable({sPaginationType: "full_numbers", pageLength: "50"});
		
});


function btnAddFriend() {
	_common.showLoading();
	
	document.getElementById('action').value = "add";
	document.getElementById('data').value = document.getElementById('txtFriend').value;
	//document.forms["friendsForm"].submit();
	processReq("add");
}

function btnRemoveFriend(fId, inst, user) {
	
	document.getElementById('action').value = "remove";
	document.getElementById('data').value = fId;
	
	
	$("#mws-jui-dialog-confirm").dialog({
		autoOpen: false, 
		title: "Confirm Friend Removal", 
		modal: true, 
		width: "320", 
		buttons: [{
				text: "Cancel", 
				click: function() {
					$( this ).dialog( "close" );
				}},{
				text: "Remove", 
				click: function() {
					$( this ).dialog( "close" );
					//document.forms["friendsForm"].submit();
					processReq("remove");
					$('#friendsList tr[data-username="'+user+'"]').addClass("selected");

					var table = $('#friendsList').DataTable();
					table.rows('.selected').remove().draw( false );


				}}]
	});
		
	$("#mws-jui-dialog-confirm").dialog("option", {modal: true}).dialog("open");
	

}

function btnAcceptFriend(fId, inst) {
	_common.showLoading();

	document.getElementById('action').value = "accept";
	document.getElementById('data').value = fId;
	//document.forms["friendsForm"].submit();
	processReq("accept");
	inst.value = "Remove";
	inst.className = "mws-button red";
}




function processReq(method)
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

	var params = "action="+method+"&data="+document.getElementById("data").value+"&rand="+ (Math.random() * 1000000);
	self.xmlhttp.open("POST", "/game/xml/friend", true);
	self.xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	self.xmlhttp.onreadystatechange = loadDataCallback;
	self.xmlhttp.send(params);

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

		}
	}
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
