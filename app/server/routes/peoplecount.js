const express = require('express')
const router = express.Router()
const moment = require('moment')
const db = require('../../database/peoplecount')

router.get('*', (req, res, next) => {
	const date = moment.utc(req.query.date)
	if(!date.isValid()){
		return res.status(400).json({
			error: 'invalid date'
		})
	}
	req.date = date
	return next()
})

router.get('/hour/', (req, res) => {
	db.getByHour(req.date)
	.then((counts) => {
		res.json({
			counts
		})
	})
	.catch((err) => {
		res.status(400).json({
			error: err
		})
	})
})

router.get('/day/', (req, res) => {
	db.getByDay(req.date)
	.then((counts) => {
		res.json({
			date: req.date,
			counts
		})
	})
	.catch((err) => {
		res.status(400).json({
			error: err
		})
	})
})

router.get('/week/', (req, res) => {
	db.getByWeek(req.date)
	.then((counts) => {
		return res.json({
			counts
		})
	})
	.catch((err) => {
		res.status(400).json({
			error: err
		})
	})
})

module.exports = router
