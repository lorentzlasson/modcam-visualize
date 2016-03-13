Date.prototype.getWeek = function() {
	var onejan = new Date(this.getFullYear(), 0, 1)
	return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7) - 1
}

function set(direction, value){
	countMap[direction] = value
	render()
}

function update(direction, value){
	countMap[direction] = (countMap[direction] || 0)
	countMap[direction] += value
	render()
}

function render(){
	$('#in').html(countMap[0])
	$('#out').html(countMap[1])
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
	currentDate = new Date(newDate)
	currentDate.setHours(currentDate.getHours()+1)
	loadCountByDay(currentDate)
}

function loadCountByDay(date){
	$.get('/peoplecount/day?date=' + date, function(data) {
		var counts = data.counts
		if(counts.length > 0) {
			counts.forEach(function(count) {
				set(count.direction, count.value)
			})
		}
		else {
			// set counts to 0 if no data is found
			set(0, 0)
			set(1, 0)
		}
	})
}

function socketOnMessage(evt){
	var data = JSON.parse(evt.data)
	console.log('data: %s', data)
	update(data.direction, data.value)
	var v = $('#comp-modcam').html()
	$('#comp-modcam').html(parseInt(v)+data.count)
}

function socketOnClose(){
	console.log('Websocket close')
	if (3 > connectFails++){
		connectSocket()
	} else {
		console.log('Tried connecting to socket to many times')
	}
}

function connectSocket(){
	try {
		socket = new WebSocket(socketAdr)
		socket.onmessage = socketOnMessage
		socket.onclose = socketOnClose
	} catch(exception){
		console.log('Failed to connect websocket')
	}
}

var countMap = {}
var connectFails = 0
var socket = undefined
var host = window.document.location.host
var socketAdr = 'ws://' + host + '/ws/counter'
var today = getToday()
var currentDate = new Date(today)

$(document).ready(function(){
	createDatepicker()
	loadCountByDay(currentDate)
	connectSocket()
	$('#week').html(currentDate.getWeek())
})
