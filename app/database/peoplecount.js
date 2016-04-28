const debug = require('debug')('modcam:database')
const cloudant = require('./')
const db = cloudant.use('counterdb')
const util = require('../util')
const moment = require('moment')

let getByDay = (date) => {
	const day = util.splitDate(date).splice(0, 3)
	const startkey = day.concat([0])
	const endkey = day.concat([1])

	return getByDate(startkey, endkey, (rows) => {
		return rows.map((item) => {
			return item.value
		})
	})
}

let getByWeek = (date) => {
	const start = moment(date).startOf('isoWeek')
	const end = moment(date).endOf('isoWeek')
	const startSplit = util.splitDate(start)
	const endSplit = util.splitDate(end)
	const startkey = startSplit.concat([0])
	const endkey = endSplit.concat([1])
	console.log(startkey)
	console.log(endkey)

	return getByDate(startkey, endkey, (rows) => {
		return rows.filter((item) => {
			let direction = item.key[3]
			return direction === 0 // only keep counts of people comming in
		})
		.map((item) => {
			let date = item.key.slice(0,3).join()
			let day = new Date(date).getDay()
			return {
				value: item.value,
				day
			}
		})
	})
}

let getByDate = (startkey, endkey, massage) => {
	return new Promise((resolve, reject) => {
		let params = {
			reduce: true,
			group_level: 4,
			startkey,
			endkey
		}
		debug('params: %j', params)

		db.view('data', 'total_by_date', params, (err, body) => {
			if (!err) {
				debug('data retreived: %j', body)
				let values = massage(body.rows)
				return resolve(values)
			}
			reject(err.message)
		})
	})
}

let storeCount = (count) => {
	return new Promise((resolve, reject) => {
		count.timestamp = new Date().toISOString()
		debug('count event: %j', count)
		db.insert(count, (err, body) => {
			if(err) return reject(err)
			resolve(body)
		})
	})
}

module.exports = {
	getByDay,
	getByWeek,
	storeCount
}
