var allChart = undefined
var allMen = []
var allWomen = []
var db = 'https://2ed64fa0-abba-4d60-8437-62d7bcad30af-bluemix.cloudant.com/demographicdb/_design/data/_view/'

$(document).ready(function(){
	$('#men').on('click', function(){
		showMen()
		setSelected('men')
		
	})

	$('#women').on('click', function(){
		showWomen()
		setSelected('women')
	})

	$('#all').on('click', function(){
		showAll()
		setSelected('all')
	})

	createCharts()
	getAllMen()
	getAllWomen()

})

function setSelected(sel){
	$('#men, #women, #all').removeClass('active-tab')
	$('#'+sel).addClass('active-tab')
}

function createCharts(){
	createAllChart()
}

function mapData(arr, data){
	for (var i in data){
		var m = data[i]
		var d = {
			x: parseInt(m.key[3]),
			y: parseInt(m.key[4]),
			z: m.value
		}
		arr.push(d)
	}
}

function createAllChart(){
	allChart = new Highcharts.Chart({
		chart: {
			renderTo: 'container',
			type: 'bubble'
		},
		title: {
			text: 'Demo-graphics'
		},
		xAxis: {
			text: 'Hour',
			gridLineWidth: 1,
			min: 0,
			max: 24
		},
		yAxis: {
			title: {
				text: 'Age'
			}
		},
		series:[{name: 'Men'}, {name: 'Women'}]
	})	
}

function showAll(){
	allChart.series[0].show()
	allChart.series[1].show()
}

function showWomen(){
	allChart.series[0].hide()
	allChart.series[1].show()
}

function showMen(){
	allChart.series[1].hide()
	allChart.series[0].show()
}



function updateMenCharts(){
	var d = []
	mapData(d, allMen)
	allChart.series[0].setData(d)
}

function updateWomenCharts(){
	var d = []
	mapData(d, allWomen)
	allChart.series[1].setData(d)
}

function getAllWomen(){
	var doc = 'all_women?reduce=true&group_level=5'
	$.getJSON(db+doc, function(data){
		console.log(data)
		if (data.rows){
			allWomen = data.rows
			updateWomenCharts()
		}
	})
}

function getAllMen(){
	var doc = 'all_men?reduce=true&group_level=5'
	$.getJSON(db+doc, function(data){
		console.log(data)
		if (data.rows){
			allMen = data.rows
			updateMenCharts()
		}
	})
}
