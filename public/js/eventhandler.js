$(document).ready(function(){
	$('#event').on('change', function() {
		var options = ['dwell', 'limit', 'in', 'out'];
		if(this.value == "dwell"){
			showAndHide(options, this.value);
		}
		else if(this.value == "limit"){
			showAndHide(options, this.value);
		}
		else if(this.value == "in"){
			showAndHide(options, this.value);
		}
		else if(this.value == "out"){
			showAndHide(options, this.value);
		}
	});
});
function showAndHide(array, value){
	for(var i = 0; i < array.length; i++){
		$('#' + array[i]).hide();
	}
	$('#' + value).show();
}
