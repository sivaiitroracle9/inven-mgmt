function dailyStockReportDownload() {
	var data = [];
	var itemsCount = $("#0-dialy-stock").jsGrid("_itemsCount");
	var pageSize = $("#0-dialy-stock").jsGrid("option","pageSize");
	var pages = Math.ceil(itemsCount/pageSize);
	for(var i=0; i<pages; i++) {
		$("#0-dialy-stock").jsGrid("option","pageIndex",i + 1);
		var newdata = $("#0-dialy-stock").jsGrid("option","data");
		newdata.forEach(function(d){data.push(d)})
	}
	
	var csvData = "";
	
	var cellDelimiter = ",";
	var lineDelimiter = "\n";
	
	var header = [];
	
	if(data.length!=0) {
		header[0] = "PRODUCT CODE";
		header[1] = "CATEGORY";
		header[2] = "MAKER";
		header[3] = "WAREHOUSE";
		header[4] = "DETAIL";
		header[5] = "OPENING STOCK";
		header[6] = "INBOUND STOCK";
		header[7] = "OUTBOUND STOCK";
		header[8] = "STOCK CORRECTION";
		header[9] = "CLOSING STOCK";
		header[10] = "DATE";
		csvData += header.join(cellDelimiter) + lineDelimiter;
		data.forEach(function(d){
			var v = [];
			v[0] = d.pcode;
			v[1] = d.pcat;
			v[2] = d.maker;
			v[3] = d.warehouse;
			v[4] = d.pdetail;
			v[5] = d.ostock;
			v[6] = d.ibstock;
			v[7] = d.obstock;
			v[8] = d.stcorrection;
			v[9] = d.clstock;
			v[10] = d.date;
			csvData += v.join(cellDelimiter) + lineDelimiter;
		});
	}
	downloadCSVFile("daily-stock", csvData)	
	return data;
}

function lowStockReportDownload() {
	downloadCSVFile("low-stock", "")	
}

function stockAdjustReportDownload() {
	downloadCSVFile("stock-adjust", "")	
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
		header[7] = "OUTBOUND QTY";
		csvData += header.join(cellDelimiter) + lineDelimiter;
		data.forEach(function(d){
			var v = [];
			v[0] = d.oid;
			v[1] = d.warehouse;
			v[2] = d.outlet;
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

function inboundTransReportDownload() {
	var data = [];
	var itemsCount = $("#5-inbound-trans").jsGrid("_itemsCount");
	var pageSize = $("#5-inbound-trans").jsGrid("option","pageSize");
	var pages = Math.ceil(itemsCount/pageSize);
	for(var i=0; i<pages; i++) {
		$("#5-inbound-trans").jsGrid("option","pageIndex",i + 1);
		var newdata = $("#5-inbound-trans").jsGrid("option","data");
		newdata.forEach(function(d){data.push(d)})
	}
	
	var csvData = "";
	
	var cellDelimiter = ",";
	var lineDelimiter = "\n";
	
	var header = [];
	
	if(data.length!=0) {
		header[0] = "WAREHOUSE";
		header[1] = "PRODUCT CODE";
		header[2] = "PROD. CATEGORY";
		header[3] = "PROD. MAKER";
		header[4] = "PROD. DETAIL";
		header[5] = "INBOUND QTY";
		header[6] = "DATE";
		csvData += header.join(cellDelimiter) + lineDelimiter;
		data.forEach(function(d){
			var v = [];
			v[0] = d.warehouse;
			v[1] = d.pcode;
			v[2] = d.pcat;
			v[3] = d.maker;
			v[4] = d.pdetail;
			v[5] = d.ibstock;
			v[6] = d.date;
			csvData += v.join(cellDelimiter) + lineDelimiter;
		});
	}
	downloadCSVFile("inbound-transactions", csvData)	
	return data;
}

function outboundTransReportDownload() {
	var data = [];
	var itemsCount = $("#6-obound-trans").jsGrid("_itemsCount");
	var pageSize = $("#6-obound-trans").jsGrid("option","pageSize");
	var pages = Math.ceil(itemsCount/pageSize);
	for(var i=0; i<pages; i++) {
		$("#6-obound-trans").jsGrid("option","pageIndex",i + 1);
		var newdata = $("#6-obound-trans").jsGrid("option","data");
		newdata.forEach(function(d){data.push(d)})
	}
	
	var csvData = "";
	
	var cellDelimiter = ",";
	var lineDelimiter = "\n";
	
	var header = [];
	
	if(data.length!=0) {
		header[0] = "WAREHOUSE";
		header[1] = "PRODUCT CODE";
		header[2] = "PROD. CATEGORY";
		header[3] = "PROD. MAKER";
		header[4] = "PROD. DETAIL";
		header[5] = "OUTBOUND QTY";
		header[6] = "DATE";
		csvData += header.join(cellDelimiter) + lineDelimiter;
		data.forEach(function(d){
			var v = [];
			v[0] = d.warehouse;
			v[1] = d.pcode;
			v[2] = d.pcat;
			v[3] = d.maker;
			v[4] = d.pdetail;
			v[5] = d.obstock;
			v[6] = d.date;
			csvData += v.join(cellDelimiter) + lineDelimiter;
		});
	}
	downloadCSVFile("outbound-transactions", csvData)	
	return data;
}

function reportPrint(){
	
}

function downloadCSVFile(filename, csvData){
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvData);
    hiddenElement.target = '_blank';
    hiddenElement.download = filename + '.csv';
    hiddenElement.click();
}