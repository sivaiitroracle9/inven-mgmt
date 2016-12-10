
function downloadInventory(){
	var data = [];
	var itemsCount = $("#inventory-items").jsGrid("_itemsCount");
	var pageSize =$("#inventory-items").jsGrid("option","pageSize");
	var pages = Math.ceil(itemsCount/pageSize);
	for(var i=0; i<pages; i++) {
		$("#inventory-items").jsGrid("option","pageIndex",i + 1);
		var newdata = $("#inventory-items").jsGrid("option","data");
		newdata.forEach(function(d){data.push(d)})
	}
	
	var header = [];
	var csvData = "";
	
	var cellDelimiter = ",";
	var lineDelimiter = "\n";
	
	if(data.length!=0) {
		header[0] = "WAREHOUSE";
		header[1] = "CATEGORY";
		header[2] = "PRODUCT CODE";
		header[3] = "PROD. MAKER";
		header[4] = "PROD. DETAIL";
		header[5] = "LOCATION";
		header[6] = "AVG. PRICE (UNIT)";
		header[7] = "REORDER POINT";
		header[8] = "IN WAREHOUSE QTY";
		header[9] = "RESERVED FOR ISSUE QTY";
		header[10] = "LEAD QTY FROM PROCUREMENT";
		header[11] = "NET QTY";
		csvData += header.join(cellDelimiter) + lineDelimiter;
		data.forEach(function(d){
			var v = [];
			v[0] = global_warehouse_map[Number(d.whouse)];
			v[1] = global_cat_map[Number(d.pcat)];
			v[2] = d.pcode;
			v[3] = global_maker_map[Number(d.pmake)];
			v[4] = d.pdetail;
			v[5] = d.plocId;
			v[6] = d.pprice;
			v[7] = d.reorderPoint;
			v[8] = d.inWarehouse;
			v[9] = d.reservedForIssue;
			v[10] = d.leadQty;
			v[11] = d.inStock;
			csvData += v.join(cellDelimiter) + lineDelimiter;
		});
	}
	downloadCSVFile("inventory-stock", csvData)	
	return data;
	
}

function downloadCSVFile(filename, csvData){
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvData);
    hiddenElement.target = '_blank';
    hiddenElement.download = filename + '.csv';
    hiddenElement.click();
}