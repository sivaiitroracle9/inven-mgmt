$("#prevision").jsGrid({
	width: "100%",
	filtering: true,
	autoload: true,
    paging: true,
    pageSize: 10,
    pageButtonCount: 10,
    pageLoading:true,
	
	controller: {
    	loadData: function(filter){
    		console.log(filter);
    		var filtered = $.grep(getOrderRevisions(), function(iitem){
    			return ((!filter["onumber"] || iitem["onumber"].indexOf(filter["onumber"])!=-1)
    					&& (!filter["otype"] || iitem["otype"]==0 || iitem["otype"] == filter["otype"])
    					&& (!filter["oitem"] || iitem["oitem"].indexOf(filter["oitem"])!=-1)
    					&& (!filter["ofield"] || iitem["ofield"]==0 || iitem["ofield"] == filter["ofield"])
    					&& (!filter["ofrom"] || iitem["ofrom"].indexOf(filter["ofrom"])!=-1)
    					&& (!filter["oto"] || iitem["oto"].indexOf(filter["oto"])!=-1)
    					&& (!filter["odate"] || iitem["odate"].indexOf(filter["odate"])!=-1));
    		});
    		
    		if(filter.sortField != undefined && filter.sortOrder != undefined) {
        		filtered.sort(function(x1, x2){
        			var x11 = x1[filter.sortField], x21 = x2[filter.sortField];
        			
        			if(x11 === x21) return 0;
        			
        			if(filter.sortOrder == "asc") {
        				return x11 > x21 ? 1 : -1;
        			} else if(filter.sortOrder == "desc") {
        				return x11 < x21 ? 1 : -1;
        			}	
        		});
    		}

    		return  {data: pageData(filtered, filter.pageIndex, filter.pageSize), itemsCount: filtered.length};
    	}
    },
    
	fields: [
		{name:"onumber", title:"ORDER NUMBER", type:"text", width:150,align:"center",},
		{name:"otype", title:"TYPE", type:"select", items:OROrderTypesLOV(), valueField: "id", textField: "text", width:150,align:"center",},
		{name:"oitem", title:"ORDER ITEM", type:"text", width:150,align:"center",},
		{name:"ofield", title:"FIELD", type:"select", items:OROrderFieldsLOV(), valueField: "id", textField: "text", width:150,align:"center",},
		{name:"ofrom", title:"FROM", type:"text", width:150,align:"center",},
		{name:"oto", title:"TO", type:"text", width:150,align:"center",},
		{name:"odate", title:"DATE", type:"text", width:150,align:"center",},
	]
});

function getOrderRevisions(){
	var rows = alasql("select * from order_revision order by id desc");
	
	var data = [];
	if(rows) {
		rows.forEach(function(d){
			var item = {};
			item.onumber = d.oid;
			item.otype = d.otype;
			item.oitem = d.oitem;
			item.ofield = d.ofield;
			item.ofrom = d.ofrom;
			item.oto = d.oto;
			item.odate = d.odate;
			data.push(item);
		});
	}
	return data;
}

function exportOrderRevisionsCSV() {
	
	var csvData = "";
	var revisions = getORGridData();
	
	var cellDelimiter = ",";
	var lineDelimiter = "\n";
	
	var header = [];
	header[0] = "ORDER NUMBER";
	header[1] = "ORDER TYPE";
	header[2] = "ORDER ITEM";
	header[3] = "FIELD";
	header[4] = "FROM";
	header[5] = "TO";
	header[6] = "DATE";
	csvData += header.join(cellDelimiter) + lineDelimiter;
	revisions.forEach(function(revision){
		var v = [];
		v[0] = revision.onumber;
		v[1] = revision.otype;
		v[2] = revision.oitem;
		v[3] = revision.ofield;
		v[4] = revision.ofrom;
		v[5] = revision.oto;
		v[6] = revision.odate.trim();
		csvData += v.join(cellDelimiter) + lineDelimiter;
	});
	downloadCSVFile("order-revisions", csvData)
}

function downloadCSVFile(filename, csvData){
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvData);
    hiddenElement.target = '_blank';
    hiddenElement.download = filename + '.csv';
    hiddenElement.click();
}

function getORGridData() {
	var data = [];
	var itemsCount = $("#order-revision").jsGrid("_itemsCount");
	var pageSize = $("#order-revision").jsGrid("option","pageSize");
	var pages = Math.ceil(itemsCount/pageSize);
	for(var i=0; i<pages; i++) {
		$("#order-revision").jsGrid("option","pageIndex",i + 1);
		var newdata = $("#order-revision").jsGrid("option","data");
		newdata.forEach(function(d){data.push(d)})
	}
	return data;
}