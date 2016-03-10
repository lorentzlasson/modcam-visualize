var gridChart = undefined
var current = -1
var rects = []



$(document).ready(function(){
	createChart()
})

function createChart(){
	gridChart = new Highcharts.Chart({
        chart: {
        	backgroundColor: null,
            renderTo: 'container',
            events: {
                selection: function(event) {
                    var xMin = gridChart.xAxis[0].translate((event.xAxis[0]||gridChart.xAxis[0]).min),
                        xMax = gridChart.xAxis[0].translate((event.xAxis[0]||gridChart.xAxis[0]).max),
                        yMin = gridChart.yAxis[0].translate((event.yAxis[0]||gridChart.yAxis[0]).min),
                        yMax = gridChart.yAxis[0].translate((event.yAxis[0]||gridChart.yAxis[0]).max)

					current++
                    rects[current].attr({
                        x: xMin + gridChart.plotLeft,
                        y: gridChart.plotHeight + gridChart.plotTop - yMax,
                        width: xMax - xMin,
                        height: yMax - yMin	
                    })
                    
                    
                    return false;
                }
            },
            zoomType: 'xy'
        },
        yAxis: {min: 0, max: 100},
        xAxis: {min: 0, max: 100},
        
        series: [{
            data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]        
        }]
    })

    rects.push(gridChart.renderer.rect(0,0,0,0,0).css({
        stroke: 'black',
        strokeWidth: '.5',
        fill: 'black',
        fillOpacity: '.1'
    }).add())
}
