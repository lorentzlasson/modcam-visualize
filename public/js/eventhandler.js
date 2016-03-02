$(document).ready(function(){
	$('#event').on('change', function() {
		var options = ['dwell', 'limit', 'in', 'out'];
		if(this.value == "dwell"){
			showAndHide(options, 'event', this.value);
		}
		else if(this.value == "limit"){
			showAndHide(options, 'event', this.value);
		}
		else if(this.value == "in"){
			showAndHide(options, 'event', this.value);
		}
		else if(this.value == "out"){
			showAndHide(options, 'event', this.value);
		}
	});
});
function showAndHide(array, dropdown, value){
	var options = array;
	for(var i = 0; i < options.length; i++){
		$('#' + options[i]).hide();
	}
	$('#' + value).show();
}
