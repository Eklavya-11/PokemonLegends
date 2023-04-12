var iCnt = new Number(0);

function selectPkmn() {
	if( iCnt == 0) {
		iCnt = 1;
	}
	
	var Box = document.getElementById('b' + iCnt);
	var oList = document.getElementById('u');
	
	for( var i=1; i<=6 ;i++ ) {
		var Box = document.getElementById('b' + i);
		if( oList.options[oList.selectedIndex].text == Box.innerHTML ) {
			alert("You already added that mon");
			return;
		}
	}
	
	var Box = document.getElementById('b' + iCnt);
	var oInput = document.getElementById('h' + iCnt);
	var oNumber = document.getElementById('t' + iCnt);

	Box.innerHTML = oList.options[oList.selectedIndex].text;
	//Box.dataset.pindex = oList.options[oList.selectedIndex].value;
	
	oInput.value = oList.options[oList.selectedIndex].value;
	oNumber.value = oList.options[oList.selectedIndex].getAttribute("data-pindex") ;
	
	
	
	iCnt++;
}

function bClear() {
	resetBox(1);
	resetBox(2);
	resetBox(3);
	resetBox(4);
	resetBox(5);
	resetBox(6);
}

function resetBox(iBox) {
	var Box = document.getElementById('b' + iBox);
	if(Box == null) {
		alert('box num not found');
	}
	Box.innerHTML = '<br/><center>#' + iBox + '</center><br/>';
	var oInput = document.getElementById('h' + iBox);
	oInput.value = '';
}
