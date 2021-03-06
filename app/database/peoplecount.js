const debug = require('debug')('modcam:database')
const cloudant = require('./')
const db = cloudant.use('counterdb')
const util = require('../util')
const moment = require('moment')

const getByHour = (date) => {
	const hour = util.splitDate(date).splice(0, 4)
	const startkey = hour.concat([0])
	const endkey = hour.concat([1])

	const params = getParams(startkey, endkey)
	return getView('total_by_hour', params, (rows) => {
		return rows.map((item) => {
			return item.value
		})
	})
}

const getByDay = (date) => {
	const day = util.splitDate(date).splice(0, 3)
	const startkey = day.concat([0])
	const endkey = day.concat([1])

	const params = getParams(startkey, endkey)
	return getView('total_by_date', params, (rows) => {
		return rows.map((item) => {
			return item.value
		})
	})
}

const getByWeek = (date) => {
	const start = moment(date).startOf('isoWeek')
	const end = moment(date).endOf('isoWeek')
	const startSplit = util.splitDate(start).splice(0, 3)
	const endSplit = util.splitDate(end)
	const startkey = startSplit.concat([0])
	const endkey = endSplit.concat([1])

	const params = getParams(startkey, endkey)
	return getView('total_by_date', params, (rows) => {
		return rows.filter((item) => {
			const direction = item.key[3]
			return direction === 0 // only keep counts of people comming in
		})
		.map((item) => {
			const date = item.key.slice(0,3).join()
			const day = new Date(date).getDay()
			return {
				value: item.value,
				day
			}
		})
	})
}

const getParams = (startkey, endkey) => {
	return {
		reduce: true,
		group_level: 4,
		startkey,
		endkey
	}
}

const getView = (view, params, massage) => {
	console.log('param', params)
	return new Promise((resolve, reject) => {
		db.view('data', view, params, (err, body) => {
			if (!err) {
				debug('data retreived: %j', body)
				const values = massage(body.rows)
				return resolve(values)
			}
			reject(err.message)
		})
	})
}

const storeCount = (count) => {
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
	getByHour,
	storeCount
}
