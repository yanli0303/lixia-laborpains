function record(date) {
	$.ajax('/laborpains/mark', {
		type: 'POST',
		dataType: 'json',
		data: date.getTime().toString(),
		success: function() {
			document.location.reload();
		}
	});
}

function load() {
	$.ajax('/laborpains/history', {
		dataType: 'json',
		success: function(data) {
			renderChart(JSON.parse(data));
		},
		error: function(xhr, status, msg) {
			console.log(msg);
		}
	});
}

function renderChart(rawData) {
	function padLeft(value) {
		return value < 10 ? '0' + value : value.toString();
	}

	var labels = [],
      data = [],
      width = Math.max(rawData.length * 20, 1900),
      canvas = $('#birthChart').attr('width', width),
    	ctx = canvas.get(0).getContext("2d"),
    	chart = new Chart(ctx);;

	var prev = 0;
	$.each(rawData, function(index, value) {
		if(index > 0) {
			var time = new Date(value),
				span = Math.round((value - prev) / (60 * 1000)),
				label = time.getHours() + ':' + padLeft(time.getMinutes());

			if(span < 30) {
				labels.push(label);
				data.push(span);
			}
		}

		prev = value;
	});

	chart.Line({
		labels : labels,
		datasets : [{
			fillColor : "rgba(151,187,205,0.5)",
			strokeColor : "rgba(151,187,205,1)",
			pointColor : "rgba(151,187,205,1)",
			pointStrokeColor : "#fff",
			data : data
		}]
	}, { animation: false });
	
	canvas.parent().scrollLeft(width - 1900);
}

$(function() {
	function refresh(){
		var now = new Date();
		$('#day').val(now.getDate());
		$('#hour').val(now.getHours());
		$('#min').val(now.getMinutes());
	}

	$('#refresh').on('click', refresh);

	$('#record').on('click', function(){
		var uiDate = new Date();
		uiDate.setDate(parseInt($('#day').val(), 10));
		uiDate.setHours(parseInt($('#hour').val(), 10));
		uiDate.setMinutes(parseInt($('#min').val(), 10));

		record(uiDate);
	});

	$('#mark').on('click', function(){
		record(new Date());
	});

	refresh();
	load();
});