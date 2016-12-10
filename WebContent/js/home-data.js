/**
 * http://usejsdoc.org/
 */

function generateInventoryData(base, date){
	
	var maxbase = base*(1.1);
	var minbase = base*(0.8);
	var data = [];
	var d={};
	var date = new Date(date);
	var newdate = date;
	d.d = morrisDate(date);
	d.value = Math.floor(base);
	data.push(d);
	for(var i=1; i<90; i++) {
		d={};
		newdate.setDate(newdate.getDate() - 1);
		d.d = morrisDate(newdate);
		d.value = Math.floor((Math.random()*(maxbase-minbase)) + minbase);
		data.push(d);
	}
	return data;
}

function generateInventoryValueChart(base, date){
	$("#morris-inventory-value-chart").empty();
	var rdata = generateInventoryData(base, date);
	var x = {
	        // ID of the element in which to draw the chart.
	        element: 'morris-inventory-value-chart',
	        // Chart data records -- each entry in this array corresponds to a point on
	        // the chart.
	        data: rdata,
	        // The name of the data record attribute that contains x-visitss.
	        xkey: 'd',
	        // A list of names of data record attributes that contain y-visitss.
	        ykeys: ['value'],
	        // Labels for the ykeys -- will be displayed when you hover over the
	        // chart.
	        labels: ['Value $'],
	        // Disables line smoothing
	        smooth: true,
	        resize: true
	    };
    // Line Chart
    var m = Morris.Line(x); 
}

function generateStockQtyData(base, date){
	
	var maxbase = base*(1.1);
	var minbase = base*(0.8);
	var data = [];
	var d={};
	var date = new Date(date);
	var newdate = date;
	d.d = morrisDate(date);
	d.units = Math.floor(base);
	data.push(d);
	for(var i=1; i<90; i++) {
		d={};
		newdate.setDate(newdate.getDate() - 1);
		d.date = morrisDate(newdate);
		d.units = Math.floor((Math.random()*(maxbase-minbase)) + minbase);
		data.push(d);
	}
	return data;
}

function generateStockQtyBarChart(warehouse, ctype, pcat, pid, date){
	$("#st-chart-qty").empty();
	var rows;
	if(warehouse == 0) {
		rows = alasql("select sum(balance) as balance from stock");
	} else {
		rows = alasql("select sum(balance) as balance from stock where whouse=" + Number(warehouse));
	}

	var rdata = generateStockQtyData(rows[0].balance, date);
	var x = {
	        element: 'st-chart-qty',
	        data: rdata,
	        xkey: 'date',
	        ykeys: ['units'],
	        labels: ['Qty : '],
	        barRatio: 0.4,
	        xLabelAngle: 35,
	        hideHover: 'auto',
	        resize: true
	    };
	Morris.Bar(x);
}

function morrisDate(date) {
	var d = "";
	d = date.getFullYear();
	d += "-" + date.getMonth();
	d += "-" + date.getDate();
	return d;
}