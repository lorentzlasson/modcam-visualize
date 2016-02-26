var allChart = undefined
var pieChart = undefined
var resCount = 0
var allMen = []
var allWomen = []
var db = 'https://2ed64fa0-abba-4d60-8437-62d7bcad30af-bluemix.cloudant.com/demographicdb/_design/data/_view/'
var categories = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100']
var today = new Date()
var totalVisits = 0
today.setHours(0)
today.setMinutes(0)
today.setSeconds(0)
today.setMilliseconds(0)

var selectedGender = 'all'
var selectedHour = '12'

var selectedDate = new Date(today)

$(document).ready(function(){
	createDatepicker()
	$('#men').on('click', function(){
		showMen()
		selectedGender = 'men'
		setSelected('men')
		updatePieChart()
	})

	$('#women').on('click', function(){
		showWomen()
		selectedGender = 'women'
		setSelected('women')
		updatePieChart()
	})

	$('#all').on('click', function(){
		showAll()
		selectedGender = 'all'
		setSelected('all')
		updatePieChart()
	})

	$('#hour-picker').change(function(){
		var v = $('#hour-picker option:selected').val()
		selectedHour = v
		updatePieChart()
	})

	createCharts()
	refreshData()
})

function refreshData(){
	getAllMen()
	getAllWomen()
	
}

function setSelected(sel){
	$('#men, #women, #all').removeClass('active-tab')
	$('#'+sel).addClass('active-tab')
}

function createCharts(){
	createAllChart()
	createPieChart()
}

function mapData(arr, data){
	for (var i in data){
		var m = data[i]
		var d = {
			x: Date.UTC(m.key[0], (parseInt(m.key[1])-1), m.key[2], m.key[3]),
			y: parseInt(Math.floor(m.key[4] / 10)),
			z: m.value
		}
		arr.push(d)
	}
}

function createPieChart(){
	pieChart = new Highcharts.Chart({
		chart: {
			renderTo: 'container-two',
			type: 'pie',
			plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
		},
		title: {
			text: ''
		},
		plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                showInLegend: true
            }
        },
        tooltip: {
            formatter: function () {
                return this.y
            }
        },
		series: [
			{
				name: 'Ages', 
				colorByPoint: true, 
				dataLabels: {
				  formatter:function() {
				    if(this.y != 0) {
				      return 'Count: ' + this.y + ' of ' + totalVisits + '<br>Percent: ' + ((this.y / totalVisits) *100).toFixed(2) + ' %';
				    }
				  }
				},
				data: [
					{name: '0', y: 0},
					{name: '10', y: 0},
					{name: '20', y: 0},
					{name: '30', y: 0},
					{name: '40', y: 0},
					{name: '50', y: 0},
					{name: '60', y: 0},
					{name: '70', y: 0},
					{name: '80', y: 0},
					{name: '90', y: 0},
					{name: '100', y: 0}
				]
			}
		]
	})
}

function createAllChart(){
	allChart = new Highcharts.Chart({
		chart: {
			renderTo: 'container',
			type: 'bubble',
            zoomType: 'xy'
		},
		tooltip: {
            formatter: function () {
                return 'Time: ' + new Date(this.x).getHours() + ':00<br>Age: ' + this.y + ' years<br>Count: ' + this.point.z;
            }
        },
		title: {
			text: ''
		},
		xAxis: {
			text: 'Hour',
			type: 'datetime',
	        tickInterval: 3600 * 1000,
	        min: Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate()+1, 9),
	        max: Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate()+1, 19),
	        gridLineWidth: 1
		},
		yAxis: {
			title: {
				text: 'Age'
			}
		},
		series:[{name: 'Men', color: '#ffa500',}, {name: 'Women', color: '#a64ca6',}]
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

function updateMenWigets(){
	var most = findMost(allMen)
	if (most){
		$('#most-men').html(most.key[3] + ':00 | ' + most.value + ' ' + (most.value < 2 ? 'man' : 'men'))
	} else {
		$('#most-men').html(' - | - ')
	}
	

}

function updateWomenWidgets(){
	var most = findMost(allWomen)
	if (most){
		$('#most-women').html(most.key[3] + ':00 | ' + most.value + ' ' + (most.value < 2 ? 'woman' : 'women'))
	} else {
		$('#most-women').html(' - | - ')
	}
}


function findMost(data){
	var most = undefined
	for (var i in data){
		if (!most || most.value < data[i].value){
			most = data[i]
		}
	}

	return most
}

function totalVisit(){
	var total = 0
	for (var i in allMen){
		total += allMen[i].value
	}

	for (var i in allWomen){
		total += allWomen[i].value
	}

	return total
}

function findMostOfAges(){
	var ageMap = {}
	var most = undefined

	for (var i in allMen){
		var d = allMen[i]
		var k = d.key[4]
		ageMap[k] = ageMap[k] + d.value || d.value
	}

	for (var i in allWomen){
		var d = allWomen[i]
		var k = d.key[4]
		ageMap[k] = ageMap[k] + d.value || d.value
	}

	for (var i in ageMap){
		if (!most || most.value < ageMap[i]){
			most = {value: ageMap[i], age: i }
		}
	}

	return most
}

function groupAges(time){
	ages = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
	ageGroup = []
	for (var i in ages){
		ageGroup.push(0)
	}

	if (selectedGender != 'women'){
		for (var i in allMen){
			var m = allMen[i]
			var k = m.key

			if (k[3] == time){
				var group = Math.floor((k[4] / 10))
				ageGroup[group] += m.value
			}
		
		}
	} 
	
	if (selectedGender != 'men'){
		for (var i in allWomen){
			var m = allWomen[i]
			var k = m.key

			if (k[3] == time){
				var group = (k[4] / 10).toFixed()
				ageGroup[group] += m.value
			}
		}
	}

	return ageGroup
}

function updateMostOfAge(){
	var most = findMostOfAges()
	var total = totalVisit()
	if (most){
		var percent = most.value / total
		$('#most-age').html('Age: ' + most.age + ' | ' + (percent*100).toFixed(2) + ' % of total visitors')
	} else {
		$('#most-age').html(' - | - ')
	}
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
	var startKey = JSON.stringify(getStartKey())
	var endKey = JSON.stringify(getEndKey())

	var doc = 'all_women?start_key=' + startKey+ '&end_key=' + endKey +'&reduce=true&group_level=5'
	$.getJSON(db+doc, function(data){
		if (data.rows){
			resCount++
			allWomen = data.rows
			console.log(allMen)
			if (resCount == 2){
				resCount = 0
				update()
			}	
		}
	})
}

function getPaddedDate(n){
	return n > 9 ? n.toString() : '0' + n
}

function getStartKey(){
	var key = []
	key.push(selectedDate.getUTCFullYear().toString())
	key.push(getPaddedDate(selectedDate.getMonth()+1))
	key.push(selectedDate.getDate().toString())
	key.push((0).toString())
	key.push(0)

	return key
}

function getEndKey(){
	var key = []
	key.push(selectedDate.getUTCFullYear().toString())
	key.push(getPaddedDate(selectedDate.getMonth()+1))
	key.push(selectedDate.getDate().toString())
	key.push((23).toString())
	key.push({})

	return key
}

function getAllMen(){
	var startKey = JSON.stringify(getStartKey())
	var endKey = JSON.stringify(getEndKey())

	var doc = 'all_men?start_key=' + startKey+ '&end_key=' + endKey +'&reduce=true&group_level=5'
	$.getJSON(db+doc, function(data){
		if (data.rows){
			resCount++
			allMen = data.rows
			console.log(allMen)

			if (resCount == 2){
				resCount = 0
				update()
			}
		}
	})
}

function update(){
	totalVisits = totalVisit()
	createAllChart()
	updateWomenCharts()
	updateWomenWidgets()
	updateMostOfAge()
	updateMenCharts()
	updateMenWigets()
	updatePieChart()
}

function updatePieChart(){
	var ages = groupAges(selectedHour)

	var setData = []
	for (var i in categories){
		setData.push([categories[i], ages[i]])
	}
	pieChart.series[0].setData(setData)
}

function createDatepicker(){
	$('#datepicker').datepicker({
		dateFormat:	'dd/mm/y',
		onClose: function(){
			selectedDate = $('#datepicker').datepicker('getDate')
			refreshData()
			console.log(selectedDate)
		}
	})
	$('#datepicker').datepicker('setDate', today)
}
