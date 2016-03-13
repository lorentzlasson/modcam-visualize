var debug = require('debug')('modcam:database')
var cloudant = require('./')
var db = cloudant.use('counterdb')
var util = require('../util')

var getByDay = (date) => {
	var dateSplit = util.splitDate(date)
	var startkey = dateSplit.slice(0)
	startkey.push(0)
	var endkey = dateSplit.slice(0)
	endkey.push(1)

	return getByDate(startkey, endkey, (rows) => {
		return rows.map((item) => {
			return item.value
		})
	})
}

var getByWeek = (date) => {
	var week = util.getWeek(date)
	var startkey = util.splitDate(week.start)
	startkey.push(0)
	var endkey = util.splitDate(week.end)
	endkey.push(1)

	return getByDate(startkey, endkey, (rows) => {
		return rows.filter((item) => {
			return !item.key[3]
		})
		.map((item) => {
			var date = item.key.slice(0,3).join()
			var day = new Date(date).getDay()
			return {
				value: item.value,
				day
			}
		})
	})
}

var getByDate = (startkey, endkey, massage) => {
	return new Promise((resolve, reject) => {
		var params = {
			reduce: true,
			group_level: 4,
			startkey,
			endkey
		}
		debug('params: %j', params)

		db.view('data', 'total_by_date', params, (err, body) => {
			if (!err) {
				debug('data retreived: %j', body)
				var values = massage(body.rows)
				return resolve(values)
			}
			reject(err.message)
		})
	})
}

module.exports = {
	getByDay,
	getByWeek
}
