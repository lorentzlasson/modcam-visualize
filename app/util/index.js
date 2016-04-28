const splitDate = (date) => {
	date = date.toISOString()
	const split = []
	split.push(date.slice(0, 4))
	split.push(date.slice(5, 7))
	split.push(date.slice(8, 10))
	split.push(date.slice(11, 13))
	return split
}

module.exports = {
	splitDate
}
