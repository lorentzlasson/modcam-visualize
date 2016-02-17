function Count(data){
	var direction = data.direction 
	var count = data.count 
	var timestamp = data.timestamp 

	return {
		direction: direction,
		count: count,
		timestamp: timestamp
	}
}


				
var counts = []
var countMap = {}
countMap[0] = 0
countMap[1] = 0

var socket = undefined
var socketAdr = 'ws://node-red-counter.mybluemix.net/ws/counter'
$(document).ready(function(){
	var today = new Date()
	today.setHours(7)
	today.setMinutes(0)
	today.setSeconds(0)
	today.setMilliseconds(0)
	var dateStr = $.datepicker.formatDate('dd/mm/y', new Date())

  $("#datepicker").datepicker({
		onClose: function(){
			console.log("close")
			console.log(dateStr)
		}	
	}).datepicker('setDate', new Date())

	connectSocket()
})

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
	var today = new Date()
	today.setHours(7)
	today.setMinutes(0)
	today.setSeconds(0)
	today.setMilliseconds(0)

	var json = JSON.stringify({fromDate: today.toISOString()})
	socket.send(json)
}

function socketOnMessage(evt){
	console.log('message')
	var data = JSON.parse(evt.data)

	if (data.rows && $.isArray(data.rows)){
		data = data.rows

		for (var ckey in data){
			var c = new Count(data[ckey].value)
			counts.push(c)	
			addToCount(c)
		}
	} else {
		var c = new Count(data)
		counts.push(c)
		addToCount(c)
	}

	setValues()
}

function addToCount(count){
	countMap[count.direction] += count.count
}

function setValues(){
	$("#out").html(countMap[1])
	$("#in").html(countMap[0])
}

function socketOnClose(){
	console.log('Websocket close')
}

function socketOnError(){
	console.log('Websocket error')
}
