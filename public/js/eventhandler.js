var socketAdr = 'ws://dwell-node-red.mybluemix.net/ws/events'
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
var socket = undefined;
var connectFails = 0;
var hadConnection = false;
var settingsDoc = undefined

$(document).ready(function(){
	eventDropdown();
	eventActionDropdown()
	connectSocket();
	removeRow()
	addEvent()
	showAndHide()

});

function clearTables(){
	$('#table-dwell tr').slice(1).remove()
	$('#table-limit tr').slice(1).remove()
	$('#table-in tr').slice(1).remove()
	$('#table-out tr').slice(1).remove()
}

function addEvent(){
	$('#add-event-btn').on('click', function(){
		var options = {}
		options.area = $('#area option:selected').text()
		options.event = $('#event option:selected').text().toLowerCase()
		options.action = $('#event-action option:selected').text().toLowerCase()
		options.day = $('#event-day option:selected').text()

		if (options.event == 'dwell'){
			options.minutes = parseInt($('.dwell-minutes').val())
		} else if (options.event == 'limit'){
			options.limit = parseInt($('.limit-count').val())
		}

		if (options.action == 'twitter'){
			options.hashTag = $('#hashtag').val()
			options.message = $('#twitter-message').val()
		} else if (options.action == 'sms'){
			options.number = $('#sms-number').val()
			options.message = $('#sms-message').val()
		}

		settings = jQuery.extend(true, {}, settingsDoc)
		settings.events[options.event].push(options)
		saveDocument(settings, options)
	})
}

function saveDocument(settings){
	settings.req = 'put'
	socket.send(JSON.stringify(settings))
}

function parseDwell(raw){
	var tds = $(raw).find('td').toArray()
	console.log(tds)

	var setting = {}
	setting.event = 'dwell'
	setting.area = tds[0].innerText
	setting.day = tds[1].innerText
	setting.minutes = parseInt(tds[2].innerText)
	setting.action = tds[3].innerText

	return setting

}

function parseLimit(raw){
	var tds = $(raw).find('td').toArray()
	console.log(tds)

	var setting = {}
	setting.event = 'limit'
	setting.area = tds[0].innerText
	setting.day = tds[1].innerText
	setting.limit = parseInt(tds[2].innerText)
	setting.action = tds[3].innerText

	return setting
}

function parseIn(raw){
	var tds = $(raw).find('td').toArray()
	console.log(tds)

	var setting = {}
	setting.event = 'in'
	setting.area = tds[0].innerText
	setting.day = tds[1].innerText
	setting.action = tds[2].innerText

	return setting
}

function parseOut(raw){
	var tds = $(raw).find('td').toArray()

	var setting = {}
	setting.event = 'out'
	setting.area = tds[0].innerText
	setting.day = tds[1].innerText
	setting.action = tds[2].innerText

	return setting
}

function removeRow(){
	$(document).on('click', '.close', function(){
		var setting = undefined
		if ($(this).closest('tr').hasClass('dwell-row')){
			setting = parseDwell($(this).closest('tr'))
		} else if ($(this).closest('tr').hasClass('limit-row')){
			setting = parseLimit($(this).closest('tr'))
		} else if ($(this).closest('tr').hasClass('in-row')) {
			setting = parseIn($(this).closest('tr'))
		} else if ($(this).closest('tr').hasClass('out-row')) {
			setting = parseOut($(this).closest('tr'))
		}
		
		$(this).closest('tr').remove()

		if (setting){

			settings = jQuery.extend(true, {}, settingsDoc)
			var index = eventAtIndex(settings.events[setting.event], setting)
			console.log(index)
			settings.events[setting.event].splice(index,1)
			//settings.events[options.event].push(options)
			saveDocument(settings)
		}
	})
}

function compareDwell(d1, d2){
	return d1.type == d2.type && d1.area == d2.area && d1.day == d2.day && d1.minutes == d2.minutes && d1.action == d2.action
}

function compareLimit(d1, d2){
	return d1.type == d2.type && d1.area ==  d2.area && d1.day == d2.day && d1.limit == d2.limit && d1.action == d2.action
}

function compareInOrOut(d1, d2){
	return d1.type == d2.type && d1.area == d2.area && d1.day == d2.day && d1.action == d2.action
}

function compare(d1, d2){
	console.log(d1, d2)
	if (d1.type == 'dwell'){
		return compareDwell(d1, d2)
	} else if (d1.type == 'limit'){
		return compareLimit(d1, d2)
	}

	return compareInOrOut(d1, d2)
}


function eventAtIndex(events, event){
	for (var e in events){
		if (compare(event, events[e])){
			return e
		}
	}

	return -1
}

function showAndHide(array, value){
	if (!array || !value) return

	for(var i = 0; i < array.length; i++){
		$('#' + array[i]).hide();
	}
	$('#' + value).show();
}
function eventDropdown(){
	var options = ['dwell', 'limit', 'in', 'out'];
	$('#event').on('change', function() {	
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
		clearTables()
		settingsDoc = data
		console.log(data.events)
		$.each(data.events.dwell, function(key, val){
				$('#table-dwell tr:last').after('<tr class="dwell-row"><td>'+ val.area +'</td><td>'+ val.day +'</td><td>'+ val.minutes +'</td><td>'+ val.action +'</td><td><span class="close">x</span></td></tr>');
		});
		$.each(data.events.limit, function(key, val){
				$('#table-limit tr:last').after('<tr class="limit-row"><td>'+ val.area +'</td><td>'+ val.day +'</td><td>'+ val.limit +'</td><td>'+ val.action +'</td><td><span class="close">x</span></td></tr>');
		});
		$.each(data.events.in, function(key, val){
				$('#table-in tr:last').after('<tr class="in-row"><td>'+ val.area +'</td><td>'+ val.day +'</td><td>'+ val.action +'</td><td><span class="close">x</span></td></tr>');
		});
		$.each(data.events.out, function(key, val){
				$('#table-out tr:last').after('<tr class="out-row"><td>'+ val.area +'</td><td>'+ val.day +'</td><td>'+ val.action +'</td><td><span class="close">x</span></td></tr>');
		});

	}
	else if (data.res == "live"){
		console.log(data);
		var val = data.result
		var val1 = data.deviceEvent
		var other = "-"

		if (val1.type == 'limit'){
			other = 'limit of ' + val.limit 
		}


		$('#table-log tr:last').after('<tr><td>'+ val.area +'</td><td>'+ val1.type +'</td><td>'+ days[new Date(val1.timestamp).getDay()] +'</td><td>'+ val.action +'</td><td>' + other + '</td><td><span class="close">x</span></td></tr>');
		
	} else if (data.res = 'put'){
		socket.send(JSON.stringify({req: 'get'}))
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
		connectFailes = 0
	} catch(exception){
		console.log('Failed to connect websocket')
	}
}
