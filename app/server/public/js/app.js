Date.prototype.getWeek = function() {
	var onejan = new Date(this.getFullYear(), 0, 1)
	return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7) - 1
}

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
		row = rows[1]
		set(row.key[row.key.length-1], row.value)
	}
}

function getDayName(n){
	switch(n){
	case '0':
		return 'sun'
	case '1':
		return 'mon'
	case '2':
		return 'tue'
	case '3':
		return 'wed'
	case '4':
		return 'thu'
	case '5':
		return 'fri'
	case '6':
		return 'sat'
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
	$('#'+name).attr('data-tooltip', value)
}

function setWeek(raw){
	$('.days-data li').removeClass('none green yellow red').addClass('none')

	for (var i = 0; i < 7; i++){
		var day = getDayName(''+i)
		$('#' + day).attr('data-tooltip', 0)	
	}
	
	var newRows = {}
	var rows = raw.rows
	for (var r in rows){
		var date = new Date(rows[r].key[0],rows[r].key[1],rows[r].key[2])

		date.setDate(date.getDate()-1)
		day = date.getDay()

		newRows[day]= newRows[day] + rows[r].value || rows[r].value

	}

	for (r in newRows){
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
	d = new Date(d)
	var day = d.getDay()
	var diff = d.getDate() - day + (day == 0 ? -6:1)

	d = new Date(d.setDate(diff))
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
	var toDate = new Date(currentDate)
	var json = JSON.stringify({startKey: currentDate.toISOString(), endKey: toDate.toISOString(), reqType: 'TotalByDate'})
	socket.send(json)

	if (currentMonday.getTime() != newMonday.getTime()){
		var weekRequest = JSON.stringify({startKey: currentDate.toISOString(), reqType: 'Week'})
		socket.send(weekRequest)
	}

	var lateCurrent = new Date(currentDate)
	lateCurrent.setHours(23)
	var hourRequest = JSON.stringify({startKey: currentDate.toISOString(), endKey: lateCurrent.toISOString(), reqType: 'TotalByHour'})
	socket.send(hourRequest)
	$('#week').html(currentDate.getWeek())

	var bleRequest = JSON.stringify({startKey: currentDate.toISOString(), endKey: currentDate.toISOString(), reqType: 'TotalBleByDate'})
	socket.send(bleRequest)
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
		var request = JSON.stringify({reqType: 'Today'})
		socket.send(request)
	} else {
		var json = JSON.stringify({startKey: currentDate.toISOString(), endKey: currentDate.toISOString(), reqType: 'TotalByDate'})
		socket.send(json)
	}

	var weekRequest = JSON.stringify({startKey: currentDate.toISOString(), reqType: 'Week'})
	socket.send(weekRequest)


	var lateCurrent = new Date(currentDate)
	lateCurrent.setHours(23)
	var hourRequest = JSON.stringify({startKey: currentDate.toISOString(), endKey: lateCurrent.toISOString(), reqType: 'TotalByHour'})
	socket.send(hourRequest)

	var mostFlowRequest = JSON.stringify({reqType: 'MostFlow'})
	socket.send(mostFlowRequest)



	var bleRequest = JSON.stringify({startKey: currentDate.toISOString(), endKey: currentDate.toISOString(), reqType: 'TotalBleByDate'})
	socket.send(bleRequest)
}

function setMostOccupied(raw){
	var rows = raw.rows
	var maxHour = undefined
	var numOfP = 0
	var movMap = { 0: 0, 1: 0}

	

	for (var r in rows){
		movMap[rows[r].key[4]] += rows[r].value
		var num = movMap[0] - movMap[1]
		if (num > numOfP){
			numOfP = num
			maxHour = rows[r].key[3]
		}
	}



	if (maxHour){
		$('#most').html(paddWithZero(parseInt(maxHour) + 1) + ':00 ' + (maxHour > '11' ? 'pm' : 'am')+ ' | ' + numOfP + ' people')
	} else {
		$('#most').html('- | - ')
	}

	
}

function paddWithZero(n){
	return n < 10 ? '0' + n : '' + n
}

function setMostFlow(raw){
	var min = raw.min
	var max = raw.max

	if (max){
		$('#mostOccupied').html(max.key[2] + 'th ' + monthNames[parseInt(max.key[1])-1] + ' ' + max.key[0] + ' | ' + max.value + ' people in total')
	} else {
		$('#mostOccupied').html(' - | - ')
	}


	if (min){

		$('#leastOccupied').html(min.key[2] + 'th ' + monthNames[parseInt(min.key[1])-1] + ' ' + min.key[0] + ' | ' + min.value + ' people in total')
	} else {
		$('#leastOccupied').html(' - | - ')
	}
}


function socketOnMessage(evt){
	var data = JSON.parse(evt.data)

	if (data.reqType == 'Today'){
		console.log('Today data')
		console.log(data.rows)
		setByRow(data)
		$('#comp-modcam').html(countMap[0]+countMap[1])
	} else if (data.reqType == 'Live' && today.getTime() == currentDate.getTime()) {
		console.log('Live data')
		console.log(data)
		update(data.direction, data.count)
		var v = $('#comp-modcam').html()
		$('#comp-modcam').html(parseInt(v)+data.count)
	} else if (data.reqType == 'TotalByDate'){
		console.log('Total by Date')
		console.log(data.rows)
		setByRow(data)
		$('#comp-modcam').html(countMap[0]+countMap[1])
	} else if (data.reqType == 'Week'){
		console.log('Week')
		console.log(data.rows)
		setWeek(data)
	} else if (data.reqType == 'TotalByHour'){
		console.log('Hour')
		console.log(data.rows)
		setMostOccupied(data)
	} else if (data.reqType == 'MostFlow'){
		console.log('Most Flow')
		console.log(data)
		setMostFlow(data)
	} else if (data.reqType == 'TotalBleByDate'){
		console.log('Total BLE by Date')
		console.log(data)
		if (data.rows && data.rows.length > 0){
			$('#comp-ble').html(data.rows[0].value)
		} else {
			$('#comp-ble').html(0)
		}
	} else if (data.reqType == 'bleLive' && today.getTime() == currentDate.getTime()){
		console.log('Live BLE data')
		console.log(data)
		v = $('#comp-ble').html()
		$('#comp-ble').html(parseInt(v)+1)
	}
}

function socketOnClose(){
	console.log('Websocket close')
	if (3 > connectFails++){
		connectSocket()
	} else {
		console.log('Tried connecting to socket to many times')
	}

}

function activateSelectionBar(){
	$('#all').addClass('active-tab')

	$('#women').click(function () {
		$('#all').removeClass('active-tab')
		$('#men').removeClass('active-tab')
		$('#women').addClass('active-tab')
	})
	$('#men').click(function () {
		$('#all').removeClass('active-tab')
		$('#women').removeClass('active-tab')
		$('#men').addClass('active-tab')
	})
	$('#all').click(function () {
		$('#men').removeClass('active-tab')
		$('#women').removeClass('active-tab')
		$('#all').addClass('active-tab')
	})
}


var countMap = {}
var connectFails = 0
var socket = undefined
var host = window.document.location.host
var socketAdr = 'ws://' + host + '/ws/counter'
var today = getToday()
var currentDate = new Date(today)
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']


$(document).ready(function(){
	activateSelectionBar()
	createDatepicker()
	connectSocket()
	$('#week').html(currentDate.getWeek())
})
