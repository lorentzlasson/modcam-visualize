$(document).ready(function(){
	eventDropdown();
});
function showAndHide(array, value){
	for(var i = 0; i < array.length; i++){
		$('#' + array[i]).hide();
	}
	$('#' + value).show();
}
function eventDropdown(){
	$('#event').on('change', function() {
		var options = ['dwell', 'limit', 'in', 'out'];
		showAndHide(options, this.value);
	});
}
