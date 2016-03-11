var splitDate = (date) => {
	date = date.toISOString()
	var split = []
	split.push(date.slice(0, 4))
	split.push(date.slice(5, 7))
	split.push(date.slice(8, 10))
	return split
}

var isValidDate = (d) => {
	if ( Object.prototype.toString.call(d) !== '[object Date]' )
		return false
	return !isNaN(d.getTime())
}

module.exports = {
	splitDate,
	isValidDate
}
