

var postId = null;
var bMe = true;
var bFriends = true;

$(document).ready(function() {
	loadData("AM");
	
	$(".mws-form").bind("submit", function() { if( replyingTo == null ) { btnPostDo(); } else { btnCommentDo(); }; return false; })
	
	
});

function btnAvatarNext() {
	charsetIndex++;
	if( charsetIndex >= charsets.length ) 
		charsetIndex = 0;
	
	updateAvatarImage();
}

function btnAvatarPrevious() {
	charsetIndex--;
	if( charsetIndex < 0 ) 
		charsetIndex = charsets.length - 1;

	updateAvatarImage();
}

function updateAvatarImage() {
	var imgTrainer = document.getElementById('imgTrainer');
	imgTrainer.src = "/images/charactersets/" + charsets[charsetIndex];
}



function btnResetPosition() {
	document.getElementById('args').value = "";
	document.getElementById('action').value = 'resetPosition';
	document.forms['pageForm'].submit();
}

function btnAvatarSave() {
	document.getElementById('args').value = charsets[charsetIndex];
	document.getElementById('action').value = 'avatar';
	document.forms['pageForm'].submit();
}

function btnResend() {
	document.getElementById('args').value = "";
	document.getElementById('action').value = 'resendVerify';
	document.forms['pageForm'].submit();
}

function btnChangeSoundSetting() {
	document.getElementById('args').value = 'toggle';
	document.getElementById('action').value = 'sound';
	document.forms['pageForm'].submit();
}
function btnChangeMusicSetting() {
	document.getElementById('args').value = 'toggle';
	document.getElementById('action').value = 'music';
	document.forms['pageForm'].submit();
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


var replyingTo = null;


function btnChangeSetting() {
	loadData("&help=toggle");
}

function btnShowMe() {
	bMe = !bMe;
	
	if( bMe )
		document.getElementById('btnMe').setAttribute("class","bi bi-check");
	else
		document.getElementById('btnMe').setAttribute("class","bi bi-x");
	
	loadData();
}
function btnShowFriends() {
	bFriends = !bFriends;
	
	if( bFriends )
		document.getElementById('btnFriends').setAttribute("class","bi bi-check");
	else
		document.getElementById('btnFriends').setAttribute("class","bi bi-x");
		
	loadData();
}


function loadData(postData) {
	var scope = "";
	if( bMe ) 
		scope = scope + "m";
	if( bFriends ) 
		scope = scope + "a";
	
	if( !postData ) 
		postData = "";
		
	var finalPostString = "scope=" + scope + postData;
	
	var xmlHttpReq = requestObject();
	self.xmlHttpReq.open("POST", "/game/xml/profile?rand=" + (Math.random() * 1000000), true);
	
	self.xmlHttpReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	
	self.xmlHttpReq.onreadystatechange = loadDataCallback;
	self.xmlHttpReq.send(finalPostString);
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
			
			var user = firstChildNodeNamed("user",resultsNode);
			var updates = firstChildNodeNamed("updates",resultsNode);
			
			var showhelp = nodeValue(firstChildNodeNamed("showhelp",user));
			if( parseInt(showhelp) == 1 ) {
				document.getElementById('btnHelp').setAttribute("class","mws-button green small");
				document.getElementById('btnHelp').value = "On";
			} else {
				document.getElementById('btnHelp').setAttribute("class","mws-button black small");
				document.getElementById('btnHelp').value = "Off";
			}
			
			
			var list = document.getElementById('mws-summary-updates');
            var listHtml = "";
            
			if( updates == null ) {
				list.innerHTML = "";
				return;
			}
			
            for(var i=0;i<updates.childNodes.length;i++){ 
            	var update = updates.childNodes[i];
            	
            	var id = nodeValue(firstChildNodeNamed("id",update));
            	var userid = nodeValue(firstChildNodeNamed("userid",update));
            	var username = nodeValue(firstChildNodeNamed("username",update));
            	var date = nodeValue(firstChildNodeNamed("date",update));
            	var relativedate = nodeValue(firstChildNodeNamed("relativedate",update));
            	var comment = nodeValue(firstChildNodeNamed("comment",update));
            	var url = nodeValue(firstChildNodeNamed("url",update));
            	var image = nodeValue(firstChildNodeNamed("image",update));
            	var deletable = nodeValue(firstChildNodeNamed("deletable",update));
            	var mid = nodeValue(firstChildNodeNamed("mid",update));

            	
            	
            	listHtml = listHtml + "<li>";
            		if( image != "" ) {
            			if (mid != 0)
            			{
            				listHtml = listHtml + "<a target= '_blank' href='/game/monster/" + mid+"'>";
            			}
            			listHtml = listHtml +  "<img style='float:right;' src='"+image+"' tag='post image'/>";
            			if (mid != 0)
            			{
            				listHtml = listHtml + "</a>";
            			}
            		}
            		listHtml = listHtml + "<b>" + username + ":</b><p style='margin-left:75px;margin-bottom:0px;white-space: pre-wrap; white-space: -moz-pre-wrap !important; white-space: -pre-wrap; white-space: -o-pre-wrap; word-wrap: break-word; '>" + comment + "</p><center><input type='button' value='" + relativedate + "' class='mws-button gray small'/><input type='button' value='Options' class='mws-button black small btn-profile-options' data-deletable='"+deletable+"' data-id='"+id+"' /><input type='button' value='Comment' class='mws-button green small btn-profile-reply' data-username='"+username+"' data-id='"+id+"' /></center>";
            	listHtml = listHtml + "</li>";
            	
            	var comments = firstChildNodeNamed("comments",update);
            	for(var k=0;k<comments.childNodes.length;k++) {
            	
					var comment = comments.childNodes[k];
					
					var id = nodeValue(firstChildNodeNamed("id",comment));
					var userid = nodeValue(firstChildNodeNamed("userid",comment));
					var username = nodeValue(firstChildNodeNamed("username",comment));
					var date = nodeValue(firstChildNodeNamed("date",comment));
					var relativedate = nodeValue(firstChildNodeNamed("relativedate",comment));
					var reply = nodeValue(firstChildNodeNamed("comment",comment));
					var url = nodeValue(firstChildNodeNamed("url",comment));
					var image = nodeValue(firstChildNodeNamed("image",comment));
            		var deletable = nodeValue(firstChildNodeNamed("deletable",comment));
					
					listHtml = listHtml + "<li style='padding:0px;'><div style='background-color:#EEE;padding-left:5px;margin-left:50px;border-left:1px solid #999;'>";
						listHtml = listHtml + "<b>" + username + ":</b><p style='margin-left:90px;margin-bottom:0px;white-space: pre-wrap; white-space: -moz-pre-wrap !important; white-space: -pre-wrap; white-space: -o-pre-wrap; word-wrap: break-word; '>" + reply + "</p><center><input type='button' value='" + relativedate + "' class='mws-button gray small'/><input type='button' value='Options' class='mws-button black small btn-profile-options' data-deletable='"+deletable+"' data-id='"+id+"' \"/></center>";
					listHtml = listHtml + "</div></li>";
            	
            	}
            	
            }
            
            list.innerHTML = listHtml;
			
			
			
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
