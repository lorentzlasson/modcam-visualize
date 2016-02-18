function set(direction, value){
	countMap[direction] = value
	render()
}

function setByRow(raw){
	var rows = raw.rows
	set(0, 0)
	set(1, 0)

	if (rows.length > 0){
		var row = rows[0]
		set(row.key[row.key.length-1], row.value)
	}

	if (rows.length > 1){
		var row = rows[1]
		set(row.key[row.key.length-1], row.value)
	}
}

function getDayName(n){
	switch(n){
		case '0':
				return 'sun'
			break
		case '1':
				return 'mon'
			break;
		case '2':
				return 'tue'
			break;
		case '3':
				return 'wed'
			break;
		case '4':
				return 'thu'
			break;
		case '5':
				return 'fri'
			break;
		case '6':
				return 'sat'
			break;
	}
}


function setWeekColor(name, value){
	var cname = ''
	if (value < 1){
		cname = 'none'	
	}
	else if (value < 355){
		cname = 'green'	
	} else if (value < 386){
		cname = 'yellow'
	} else {
		cname = 'red'
	}


	$('#'+name).removeClass('none green yellow red').addClass(cname)
}

function setWeek(raw){
	$('.days-data li').removeClass('none green yellow red').addClass('none')
	
	var newRows = {}
	var rows = raw.rows
	for (var r in rows){
		var date = new Date(rows[r].key[0],rows[r].key[1],rows[r].key[2])

		date.setDate(date.getDate()-1)
		var day = date.getDay()

		newRows[day]= newRows[day] + rows[r].value || rows[r].value

	}

	for (var r in newRows){
		console.log(getDayName(r), newRows[r])
		setWeekColor(getDayName(r), newRows[r])
	}

}

function update(direction, value){
	countMap[direction] += value
	render()
}

function render(){
	$('#in').html(countMap[0])
	$('#out').html(countMap[1])
}


function getMonday(d) {
  d = new Date(d);
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1); 

  d = new Date(d.setDate(diff));
	d.setHours(1)
	d.setMinutes(0)
	d.setSeconds(0)
	d.setMilliseconds(0)

	return d
}

function getToday(){
	var d = new Date()
	d.setHours(1)
	d.setMinutes(0)
	d.setSeconds(0)
	d.setMilliseconds(0)

	return d
}

function createDatepicker(){
	$('#datepicker').datepicker({
		dateFormat:	'dd/mm/y',
		onClose: function(){
			var selectedDate = $('#datepicker').datepicker('getDate')
			updateSelectedDate(selectedDate)
		}
	})
	$('#datepicker').datepicker('setDate', today)
}

function updateSelectedDate(newDate){	
	if (newDate.getTime() == currentDate.getTime()){
		return
	}

	var currentMonday = getMonday(currentDate)
	var newMonday = getMonday(newDate)


	currentDate = new Date(newDate)
	currentDate.setHours(currentDate.getHours()+1)
	toDate = new Date(currentDate)
	var json = JSON.stringify({startKey: currentDate.toISOString(), endKey: toDate.toISOString(), reqType: 'TotalByDate'})
	socket.send(json)

	if (currentMonday.getTime() != newMonday.getTime()){
		var weekRequest = JSON.stringify({startKey: currentDate.toISOString(), reqType: "Week"})
		socket.send(weekRequest)
	}

	var lateCurrent = new Date(currentDate)
	lateCurrent.setHours(23)
	var hourRequest = JSON.stringify({startKey: currentDate.toISOString(), endKey: lateCurrent.toISOString(), reqType: "TotalByHour"})
	socket.send(hourRequest)
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

function socketOnOpen(){
	console.log('Websocket open')
	connectFails = 0
	if (today.getTime() == currentDate.getTime()){
		var request = JSON.stringify({reqType: "Today"})
		socket.send(request)
	} else {
		var json = JSON.stringify({startKey: currentDate.toISOString(), endKey: currentDate.toISOString(), reqType: 'TotalByDate'})
		socket.send(json)
	}

	var weekRequest = JSON.stringify({startKey: currentDate.toISOString(), reqType: "Week"})
	socket.send(weekRequest)


	var lateCurrent = new Date(currentDate)
	lateCurrent.setHours(23)
	var hourRequest = JSON.stringify({startKey: currentDate.toISOString(), endKey: lateCurrent.toISOString(), reqType: "TotalByHour"})
	socket.send(hourRequest)
}

function setMostOccupied(raw){
	var rows = raw.rows
	var maxHour = undefined
	var numOfP = 0
	var hourMap = {}
	var movMap = { 0: 0, 1: 0}
	
	console.log(movMap)

	for (var r in rows){
		movMap[rows[r].key[4]] += rows[r].value
		console.log(movMap[0] + ':' + movMap[1] + ' -> ' + (movMap[0] - movMap[1]))
		var num = movMap[0] - movMap[1]
		if (num > numOfP){
			numOfP = num
			maxHour = rows[r].key[3]
		}
	}

	console.log(maxHour + ': ' + numOfP)


	if (maxHour){
		$('#most').html(maxHour + ':00 ' + (maxHour > '11' ? 'pm' : 'am')+ ' | ' + numOfP + ' people')
	} else {
		$('#most').html('- | - ')
	}

	
}

function socketOnMessage(evt){
	var data = JSON.parse(evt.data)

	if (data.reqType == "Today"){
		console.log("Today data")
		console.log(data.rows)
		setByRow(data)
	} else if (data.reqType == "Live" && today.getTime() == currentDate.getTime()) {
		console.log("Live data")
		console.log(data)
		update(data.direction, data.count)
	} else if (data.reqType == 'TotalByDate'){
		console.log('Total by Date')
		console.log(data.rows)
		setByRow(data)
	} else if (data.reqType == 'Week'){
		console.log('Week')
		console.log(data.rows)
		setWeek(data)
	} else if (data.reqType == 'TotalByHour'){
		console.log('Hour')
		console.log(data.rows)
		setMostOccupied(data)
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

function socketOnError(){
	console.log('Websocket error')
	if (3 > connectFails++){
		connectSocket()
	} else {
		console.log("tried connecting to socket to many times")
	}
}


var countMap = {}
var connectFails = 0
var socket = undefined
var socketAdr = 'ws://node-red-counter.mybluemix.net/ws/counter'
var today = getToday()
var currentDate = new Date(today)


$(document).ready(function(){
	createDatepicker()
	connectSocket()
})







