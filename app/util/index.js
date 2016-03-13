var splitDate = (date) => {
	date = date.toISOString()
	var split = []
	split.push(date.slice(0, 4))
	split.push(date.slice(5, 7))
	split.push(date.slice(8, 10))
	return split
}

var getWeek = (date) => {
	var selectedWeek = new Date(date)
	var day = selectedWeek.getDay()
	var diff = selectedWeek.getDate() - day + (day == 0 ? -6:1) // adjust when day is sunday
	var start = new Date(selectedWeek.setDate(diff))
	var end = new Date(start)
	end.setDate(end.getDate()+7)

	start.setHours(0, 0, 0, 0)
	end.setHours(0, 0, 0, 0)

	return {start, end}
}

var isValidDate = (d) => {
	if ( Object.prototype.toString.call(d) !== '[object Date]' )
		return false
	return !isNaN(d.getTime())
}

module.exports = {
	splitDate,
	getWeek,
	isValidDate
}
