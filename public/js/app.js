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
var fails = 0

var socket = undefined
var socketAdr = 'ws://node-red-counter.mybluemix.net/ws/counter'
var currentDate = undefined

$(document).ready(function(){
	var today = new Date()
	today.setHours(0)
	today.setMinutes(0)
	today.setSeconds(0)
	today.setMilliseconds(0)
	var dateStr = $.datepicker.formatDate('dd/mm/y', new Date())
	
	currentDate = today
  $("#datepicker").datepicker({
		onClose: function(){
			console.log(dateStr)
			var newDate = $("#datepicker").datepicker('getDate')
			console.log(newDate)
			console.log(currentDate)
			console.log(newDate.getTime() == currentDate.getTime())

			if (newDate.getTime() != currentDate.getTime()){
				currentDate = newDate
				changeDate()
			}


		}	
	}).datepicker('setDate', currentDate)

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

function changeDate(){
	countMap[0] = 0
	countMap[1] = 0
	counts = []
	setValues()
	var toDate = new Date(currentDate) 
	toDate.setDate(toDate.getDate()+1)
	var json = JSON.stringify({fromDate: currentDate.toISOString(), toDate: toDate.toISOString()})
	console.log(json)
	socket.send(json)
}


function socketOnOpen(){
	console.log('Websocket open')
	countMap[0] = 0
	countMap[1] = 0
	counts = []
	fails = 0

	var toDate = new Date(currentDate.getTime()) 
	console.log(toDate.getDate())
	toDate.setDate(toDate.getDate()+1)
	console.log(toDate)
	var json = JSON.stringify({fromDate: currentDate.toISOString(), toDate: toDate.toISOString()})
	console.log(json)
	socket.send(json)
}

function socketOnMessage(evt){
	console.log('message')
	var data = JSON.parse(evt.data)

	console.log(data)
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
	if (fails < 3){
		connectSocket()
	} else {
		console.log("tried connecting to socket to many times")
	}

	fails++
}

function socketOnError(){
	console.log('Websocket error')
	if (fails < 3){
		connectSocket()
	} else {
		console.log("tried connecting to socket to many times")
	}

	fails++
}
