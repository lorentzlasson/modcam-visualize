var socketAdr = 'ws://dwell-node-red.mybluemix.net/ws/events'
var socket = undefined;
var connectFails = 0;
var hadConnection = false;

$(document).ready(function(){
	eventDropdown();
	eventActionDropdown()
	connectSocket();
});
function showAndHide(array, value){
	for(var i = 0; i < array.length; i++){
		$('#' + array[i]).hide();
	}
	$('#' + value).show();
}
function eventDropdown(){
	$('#event').on('change', function() {
		var options = ['dwell', 'limit', 'in', 'out'];
		showAndHide(options, this.value);
	});
}
function eventActionDropdown(){
	$('#event-action').on('change', function() {
		var options = ['sms', 'twitter'];
		showAndHide(options, this.value);
	});
}
function socketOnOpen(){
	console.log('Websocket open')
	if (hadConnection) return;
	hadConnection = true;
	connectFails = 0;
	var eventRequest = JSON.stringify({req: "get"})
	socket.send(eventRequest)
}

function socketOnMessage(evt){
	var data = JSON.parse(evt.data);
	if (data.res == "get"){
		console.log("get");
		$.each(data.events.dwell, function(key, val){
				$('#table-in tr:last').after('<tr><td>'+ val.area +'</td><td>'+ val.day +'</td><td>'+ val.time +'</td><td>'+ val.action +'</td><td><span class="close">x</span></td></tr>');
		});
		$.each(data.events.limit, function(key, val){
				$('#table-limit tr:last').after('<tr><td>'+ val.area +'</td><td>'+ val.day +'</td><td>'+ val.limit +'</td><td>'+ val.action +'</td><td><span class="close">x</span></td></tr>');
		});
		$.each(data.events.in, function(key, val){
				$('#table-in tr:last').after('<tr><td>'+ val.area +'</td><td>'+ val.day +'</td><td>'+ val.action +'</td><td><span class="close">x</span></td></tr>');
		});
		$.each(data.events.out, function(key, val){
				$('#table-in tr:last').after('<tr><td>'+ val.area +'</td><td>'+ val.day +'</td><td>'+ val.action +'</td><td><span class="close">x</span></td></tr>');
		});

	}
	else if (data.res == "live"){
		console.log(data);
		$.each(data.result, function(key, val){
			$('#table-log tr:last').after('<tr><td>'+ val.area +'</td><td>'+ val.day +'</td><td>'+ val.action +'</td><td><span class="close">x</span></td></tr>');
		});
	}
}

function socketOnClose(){
	console.log('Websocket close')
	if (3 > connectFails++){
		connectSocket()
	} else {
		console.log("Tried connecting to socket to many times")
	}
}

function connectSocket(){
	try {
		socket = new WebSocket(socketAdr)

		socket.onopen = socketOnOpen
		socket.onmessage = socketOnMessage
		socket.onclose = socketOnClose

	} catch(exception){
		console.log('Failed to connect websocket')
	}
}
