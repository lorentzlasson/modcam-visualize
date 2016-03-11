var debug = require('debug')('modcam:database')
var cloudant = require('./')
var db = cloudant.use('counterdb')
var util = require('../util')

var getByDay = (date) => {
	return new Promise((resolve, reject) => {
		date = new Date(date)
		if(!util.isValidDate(date))
			return reject('invalid date')

		var dateSplit = util.splitDate(date)
		var startkey = dateSplit.slice(0)
		startkey.push(0)
		var endkey = dateSplit.slice(0)
		endkey.push(1)

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
						[item.key[3]]: item.value // 3rd element in array is direction
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
