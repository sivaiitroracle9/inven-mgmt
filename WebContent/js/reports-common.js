var global_warehouse_map = {};
getWarehousesMap().forEach(function(r){
	global_warehouse_map[r.id] = r.text;
});
var global_vendor_map = {};
getVendorsMap().forEach(function(r){
	global_vendor_map[r.id] = r.text;
});
var global_maker_map = {};
getMakersMap().forEach(function(r){
	global_maker_map[r.id] = r.text;
});

var global_cat_map = {};
getWarehousesMap().forEach(function(r){
	global_cat_map[r.id] = r.text;
});

var dmy = 0;
function dmyf(i){
	dmy = Number(i);
}

$("#from, #to").change(function(){
	dmy = dmy(3);
});

$("#generate-report").click(function(){
	runReport();
});

function runReport() {
	var report = Number($("#report-select").val());
	var from = $("#from").val();
	var to = $("#to").val();
	if(report === 0){
		dailyStockRun();
	} else if(report === 1) {
		lowStockRun();
	} else if(report === 2) {
		inboundRunReport();
	} else if(report === 3) {
		outboundRunReport();
	} else if(report === 4) {
		stockAdjustRun();
	} else if(report === 5) {
		inboundTransRun();
	} else if(report === 6) {
		outboundTransRun();
	}
}

function getOnlyDate(date) {
	if(date){
		date = date.split(",")[0];
		return date;
	}
}

function getWarehousesMap(){
	var data = [];
	var rows = alasql("select * from whouse");
	rows.forEach(function(r){
		var d = {};
		d.id = r.id
		d.text = r.name;
		data.push(d);
	});
	return data;
}

function getVendorsMap(){
	var data = [];
	var rows = alasql("select * from vendor");
	rows.forEach(function(r){
		var d = {};
		d.id = r.id
		d.text = r.name;
		data.push(d);
	});
	return data;
}

function getCatMap(){
	var data = [];
	var rows = alasql("select * from kind");
	rows.forEach(function(r){
		var d = {};
		d.id = r.id
		d.text = r.text;
		data.push(d);
	});
	return data;
}

function getMakersMap(){
	var data = [];
	var rows = alasql("select * from maker");
	rows.forEach(function(r){
		var d = {};
		d.id = r.id
		d.text = r.text;
		data.push(d);
	});
	return data;
}


function inboundStockReportPrint(){
	
}

function inboundStockReportDownload(){	
	
	var data = [];
	var itemsCount = $("#2-inbound-stock").jsGrid("_itemsCount");
	var pageSize = $("#2-inbound-stock").jsGrid("option","pageSize");
	var pages = Math.ceil(itemsCount/pageSize);
	for(var i=0; i<pages; i++) {
		$("#2-inbound-stock").jsGrid("option","pageIndex",i + 1);
		var newdata = $("#2-inbound-stock").jsGrid("option","data");
		newdata.forEach(function(d){data.push(d)})
	}
	
	var csvData = "";
	
	var cellDelimiter = ",";
	var lineDelimiter = "\n";
	
	var header = [];
	
	if(data.length!=0) {
		header[0] = "ORDER NUMBER";
		header[1] = "WAREHOUSE";
		header[2] = "VENDOR";
		header[3] = "PRODUCT CODE";
		header[4] = "PROD. CATEGORY";
		header[5] = "PROD. MAKER";
		header[6] = "PROD. DETAIL";
		header[7] = "INBOUND QTY";
		csvData += header.join(cellDelimiter) + lineDelimiter;
		data.forEach(function(d){
			var v = [];
			v[0] = d.oid;
			v[1] = d.warehouse;
			v[2] = d.vendor;
			v[3] = d.pcode;
			v[4] = d.pcat;
			v[5] = d.pmake;
			v[6] = d.pdetail;
			v[7] = d.qty;
			csvData += v.join(cellDelimiter) + lineDelimiter;
		});
	}
	downloadCSVFile("inbound-stock", csvData)	
	return data;
}

function outboundStockReportDownload(){	
	
	var data = [];
	var itemsCount = $("#3-outbound-stock").jsGrid("_itemsCount");
	var pageSize = $("#3-outbound-stock").jsGrid("option","pageSize");
	var pages = Math.ceil(itemsCount/pageSize);
	for(var i=0; i<pages; i++) {
		$("#3-outbound-stock").jsGrid("option","pageIndex",i + 1);
		var newdata = $("#3-outbound-stock").jsGrid("option","data");
		newdata.forEach(function(d){data.push(d)})
	}
	
	var csvData = "";
	
	var cellDelimiter = ",";
	var lineDelimiter = "\n";
	
	var header = [];
	
	if(data.length!=0) {
		header[0] = "ORDER NUMBER";
		header[1] = "WAREHOUSE";
		header[2] = "OUTLET";
		header[3] = "PRODUCT CODE";
		header[4] = "PROD. CATEGORY";
		header[5] = "PROD. MAKER";
		header[6] = "PROD. DETAIL";
		header[7] = "INBOUND QTY";
		csvData += header.join(cellDelimiter) + lineDelimiter;
		data.forEach(function(d){
			var v = [];
			v[0] = d.oid;
			v[1] = d.warehouse;
			v[2] = d.vendor;
			v[3] = d.pcode;
			v[4] = d.pcat;
			v[5] = d.pmake;
			v[6] = d.pdetail;
			v[7] = d.qty;
			csvData += v.join(cellDelimiter) + lineDelimiter;
		});
	}
	downloadCSVFile("outbound-stock", csvData)	
	return data;
}

function downloadCSVFile(filename, csvData){
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvData);
    hiddenElement.target = '_blank';
    hiddenElement.download = filename + '.csv';
    hiddenElement.click();
}