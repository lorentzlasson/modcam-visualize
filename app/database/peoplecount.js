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

	return getByDate(startkey, endkey)
}

var getByDate = (startkey, endkey) => {
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
				var values = body.rows.map((item) => {
					return {
						direction: item.key[3], // 4th element in array is direction
						value: item.value
					}
				})
				return resolve(values)
			}
			reject(err.message)
		})
	})
}

module.exports = {
	getByDay
}
