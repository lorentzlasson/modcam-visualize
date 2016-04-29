Date.prototype.getWeek = function() {
	let onejan = new Date(this.getFullYear(), 0, 1)
	return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7) - 1
}

function set(direction, value){
	countMap[direction] = value
	render()
}

function setWeek(counts){
	clearWeek()
	counts.forEach(function(item){
		setWeekColor(getDayName(item.day), item.value)
	})
}

function clearWeek(){
	for (let i = 0; i < 7; i++){
		let day = getDayName(i)
		$('#' + day).removeClass('none green yellow red').addClass('none')
		$('#' + day).attr('data-tooltip', 0)
	}
}

function setWeekColor(name, value){
	let cname = ''
	if (value < 1){
		cname = 'none'
	}
	else if (value < 160){
		cname = 'green'
	} else if (value < 200){
		cname = 'yellow'
	} else {
		cname = 'red'
	}


	$('#'+name).removeClass('none').addClass(cname)
	$('#'+name).attr('data-tooltip', value)
}

function getDayName(n){
	switch(n){
	case 0:
		return 'sun'
	case 1:
		return 'mon'
	case 2:
		return 'tue'
	case 3:
		return 'wed'
	case 4:
		return 'thu'
	case 5:
		return 'fri'
	case 6:
		return 'sat'
	}
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
	let d = new Date()
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
			let selectedDate = $('#datepicker').datepicker('getDate')
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
	loadCounts()
}

function loadCounts(){
	loadCountByDay(currentDateISO)
	loadCountByWeek(currentDateISO)
}

function loadCountByWeek(date){
	$.get('/peoplecount/week?date=' + date, function(data) {
		let counts = data.counts
		if(counts.length > 0) {
			setWeek(counts)
		}
	})
}


function loadCountByDay(date){
	$.get('/peoplecount/day?date=' + date, function(data) {
		let counts = data.counts
		if(counts.length > 0) {
			for(let i = 0; i < counts.length; i++){
				set(i, counts[i])
			}
		}
		else {
			// set counts to 0 if no data is found
			set(0, 0)
			set(1, 0)
		}
	})
}

function socketOnMessage(evt){
	let data = JSON.parse(evt.data)
	console.log('data: %s', data)
	update(data.direction, data.count)
	let v = $('#comp-modcam').html()
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

let countMap = {}
let connectFails = 0
let socket = undefined
let host = window.document.location.host
let socketAdr = 'ws://' + host + '/ws/counter'
let today = getToday()
let currentDate = new Date(today)
let currentDateISO = currentDate.toISOString()

$(document).ready(function(){
	createDatepicker()
	loadCounts()
	connectSocket()
	$('#week').html(currentDate.getWeek())
})
