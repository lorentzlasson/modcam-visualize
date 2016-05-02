function getWeek(){
	return moment.utc().format('WW')
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
	return moment.utc().startOf('day')
}

function createDatepicker(){
	$('#datepicker').datepicker({
		dateFormat:	'dd/mm/y',
		onClose: function(){
			let selectedDate = $('#datepicker').datepicker('getDate')
			updateSelectedDate(selectedDate)
		}
	})
	let jsDate = moment(today).toDate()
	$('#datepicker').datepicker('setDate', jsDate)
}

function updateSelectedDate(newDate){	
	newDate = moment(newDate).startOf('day') // convert to moment object
	if(newDate.isSame(currentDate, 'day')){
		return
	}
	currentDate = newDate
	loadCounts()
}

function loadCounts(){
	let currentDateISO = currentDate.format()
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
let currentDate = moment.utc(today)

$(document).ready(function(){
	createDatepicker()
	loadCounts()
	connectSocket()
	$('#week').html(getWeek(currentDate))
})
