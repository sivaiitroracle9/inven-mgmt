var inbound_data = [];
var outbound_data = [];
var daily_data = [];
var ibtrans_data = [];
var obtrans_data = [];

$("#0-dialy-stock").jsGrid({
	width:"100%",
	height:"500px",
    autoload: true,
    filtering: true,
    
    controller: {
    	loadData: function(filter) {
    		var filtered = $.grep(daily_data, function(ind) {
    			return (!filter["pcode"] || ind["pcode"].indexOf(filter["pcode"]))
    				&& (!filter["pcat"] || ind["pcat"].indexOf(filter["pcat"]))
    				&& (!filter["maker"] || ind["maker"].indexOf(filter["maker"])) 
    				&& (!filter["warehouse"] || ind["warehouse"].indexOf(filter["warehouse"])) 
    				&& (!filter["pdetail"] || ind["pdetail"].indexOf(filter["pdetail"])) 
    				&& (!filter["ostock"] || ind["ostock"].indexOf(filter["ostock"])) 
    				&& (!filter["ibstock"] || ind["ibstock"].indexOf(filter["ibstock"])) 
    				&& (!filter["obstock"] || ind["obstock"].indexOf(filter["obstock"])) 
    				&& (!filter["stcorrection"] || ind["stcorrection"].indexOf(filter["stcorrection"])) 
    				&& (!filter["clstock"] || ind["clstock"]==filter["clstock"]) 
    				&& (!filter["date"] || ind["date"]==filter["date"]);
    		});
    		return filtered;
    	}
    },
    fields: [
    	{name:"pcode", title:"PRODUCT CODE", type:"text", width:150,align:"center",},
    	{name:"pcat", title:"CATEGORY", type:"text", width:150,align:"center",},
    	{name:"maker", title:"MAKER", type:"text", width:150,align:"center",},
    	{name:"warehouse", title:"WAREHOUSE", type:"text", width:150,align:"center",},
    	{name:"pdetail", title:"DETAIL", type:"text", width:150,align:"center",},
    	{name:"ostock", title:"OPENING STOCK", type:"text", width:150,align:"center",},
    	{name:"ibstock", title:"INBOUND STOCK", type:"text", width:150,align:"center",},
    	{name:"obstock", title:"OUTBOUND STOCK", type:"text", width:150,align:"center",},
    	{name:"stcorrection", title:"STOCK CORRECTION", type:"text", width:150,align:"center",},
    	{name:"clstock", title:"CLOSING STOCK", type:"text", width:150,align:"center",},
    	{name:"date", title:"DATE", type:"text", width:150,align:"center",},
    ]
});


$("#2-inbound-stock").jsGrid({
	width:"900px;",
	height:"500px;",
    autoload: true,
    filtering: true,
    
    controller: {
    	loadData: function(filter) {
    		var filtered = $.grep(inbound_data, function(ind) {
    			return (!filter["oid"] || ind["oid"]==filter["oid"]) 
    				&& (!filter["warehouse"] || ind["warehouse"].indexOf(filter["warehouse"]))
    				&& (!filter["vendor"] || ind["vendor"].indexOf(filter["vendor"])) 
    				&& (!filter["pcode"] || ind["pcode"].indexOf(filter["pcode"])) 
    				&& (!filter["pcat"] || ind["pcat"].indexOf(filter["pcat"])) 
    				&& (!filter["pmake"] || ind["pmake"].indexOf(filter["pmake"])) 
    				&& (!filter["pdetail"] || ind["pdetail"].indexOf(filter["pdetail"])) 
    				&& (!filter["date"] || ind["date"].indexOf(filter["date"])) 
    				&& (!filter["qty"] || ind["qty"]==filter["qty"]) 
    		});
    		return filtered;
    	}
    },
    fields: [
    	{name:"oid", title:"ORDER NUMBER", type:"text", width:150,align:"center",},
    	{name:"warehouse", title:"WAREHOUSE", type:"text", width:150,align:"center",},
    	{name:"vendor", title:"VENDOR", type:"text", width:150,align:"center",},
    	{name:"pcode", title:"PRODUCT CODE", type:"text", width:150,align:"center",},
    	{name:"pcat", title:"CATEGORY", type:"text", width:150,align:"center",},
    	{name:"pmake", title:"MAKER", type:"text", width:150,align:"center",},
    	{name:"pdetail", title:"DETAIL", type:"text", width:150,align:"center",},
    	{name:"qty", title:"QTY", type:"text", width:150,align:"center",},
    	{name:"date", title:"DATE", type:"text", width:150,align:"center",},
    ]
});

$("#3-outbound-stock").jsGrid({
	width:"900px;",
	height:"500px;",
    autoload: true,
    filtering: true,
    
    controller: {
    	loadData: function(filter) {
    		var filtered = $.grep(outbound_data, function(ind) {
    			return (!filter["oid"] || ind["oid"]==filter["oid"]) 
    				&& (!filter["warehouse"] || ind["warehouse"].indexOf(filter["warehouse"])) 
    				&& (!filter["outlet"] || ind["outlet"].indexOf(filter["outlet"])) 
    				&& (!filter["pcode"] || ind["pcode"].indexOf(filter["pcode"])) 
    				&& (!filter["pcat"] || ind["pcat"].indexOf(filter["pcat"])) 
    				&& (!filter["pmake"] || ind["pmake"].indexOf(filter["pmake"])) 
    				&& (!filter["pdetail"] || ind["pdetail"].indexOf(filter["pdetail"])) 
    				&& (!filter["date"] || ind["date"].indexOf(filter["date"])) 
    				&& (!filter["qty"] || ind["qty"]==filter["qty"]) 
    		});
    		return filtered;
    	}
    },
    fields: [
    	{name:"oid", title:"ORDER NUMBER", type:"text", width:150,align:"center",},
    	{name:"warehouse", title:"WAREHOUSE", type:"text", width:150,align:"center",},
    	{name:"outlet", title:"OUTLET", type:"text", width:150,align:"center",},
    	{name:"pcode", title:"PRODUCT CODE", type:"text", width:150,align:"center",},
    	{name:"pcat", title:"CATEGORY", type:"text", width:150,align:"center",},
    	{name:"pmake", title:"MAKER", type:"text", width:150,align:"center",},
    	{name:"pdetail", title:"DETAIL", type:"text", width:150,align:"center",},
    	{name:"qty", title:"QTY", type:"text", width:150,align:"center",},
    	{name:"date", title:"DATE", type:"text", width:150,align:"center",},
    ]
});

$("#5-inbound-trans").jsGrid({
	width:"900px;",
	height:"500px;",
    autoload: true,
    filtering: true,

    controller: {
    	loadData: function(filter) {
    		var filtered = $.grep(ibtrans_data, function(ind) {
    			return (!filter["warehouse"] || ind["warehouse"].indexOf(filter["warehouse"]))
    				&& (!filter["pcode"] || ind["pcode"].indexOf(filter["pcode"])) 
    				&& (!filter["pcat"] || ind["pcat"].indexOf(filter["pcat"])) 
    				&& (!filter["maker"] || ind["maker"].indexOf(filter["maker"])) 
    				&& (!filter["pdetail"] || ind["pdetail"].indexOf(filter["pdetail"])) 
    				&& (!filter["date"] || ind["date"].indexOf(filter["date"])) 
    				&& (!filter["ibstock"] || ind["ibstock"]==filter["ibstock"]) 
    		});
    		return filtered;
    	}
    },
    fields: [
    	{name:"warehouse", title:"WAREHOUSE", type:"text", width:150,align:"center",},
    	{name:"pcode", title:"PRODUCT CODE", type:"text", width:150,align:"center",},
    	{name:"pcat", title:"CATEGORY", type:"text", width:150,align:"center",},
    	{name:"maker", title:"MAKER", type:"text", width:150,align:"center",},
    	{name:"pdetail", title:"DETAIL", type:"text", width:150,align:"center",},
    	{name:"ibstock", title:"INBOUND QTY", type:"text", width:150,align:"center",},
    	{name:"date", title:"DATE", type:"text", width:150,align:"center",},
    ]
});

$("#6-obound-trans").jsGrid({
	width:"900px;",
	height:"500px;",
    autoload: true,
    filtering: true,

    controller: {
    	loadData: function(filter) {
    		var filtered = $.grep(obtrans_data, function(ind) {
    			return (!filter["warehouse"] || ind["warehouse"].indexOf(filter["warehouse"]))
    				&& (!filter["pcode"] || ind["pcode"].indexOf(filter["pcode"])) 
    				&& (!filter["pcat"] || ind["pcat"].indexOf(filter["pcat"])) 
    				&& (!filter["maker"] || ind["maker"].indexOf(filter["maker"])) 
    				&& (!filter["pdetail"] || ind["pdetail"].indexOf(filter["pdetail"])) 
    				&& (!filter["date"] || ind["date"].indexOf(filter["date"])) 
    				&& (!filter["obstock"] || ind["ibstock"]==filter["ibstock"]) 
    		});
    		return filtered;
    	}
    },
    fields: [
    	{name:"warehouse", title:"WAREHOUSE", type:"text", width:150,align:"center",},
    	{name:"pcode", title:"PRODUCT CODE", type:"text", width:150,align:"center",},
    	{name:"pcat", title:"CATEGORY", type:"text", width:150,align:"center",},
    	{name:"maker", title:"MAKER", type:"text", width:150,align:"center",},
    	{name:"pdetail", title:"DETAIL", type:"text", width:150,align:"center",},
    	{name:"obstock", title:"OUTBOUND QTY", type:"text", width:150,align:"center",},
    	{name:"date", title:"DATE", type:"text", width:150,align:"center",},
    ]
});

function dailyStockRun() {
	$("#report-grids").children().hide();
	$("#report-grids").children().eq(0).show();
	
	if(dmy === 0) daily_data = dailyStockData(true);
	else if(dmy === 1) daily_data = dailyStockData(undefined, true);
	else if(dmy === 2) daily_data = dailyStockData(undefined, undefined, true);
	else if(dmy === 3) daily_data = dailyStockData(undefined, undefined, undefined, from, to);

	$("#0-dialy-stock").jsGrid("reset");
	$("#0-dialy-stock").jsGrid("loadData");
	$("#btn-download").attr("onclick", "dailyStockReportDownload()");
	$("#btn-print").attr("onclick", "reportPrint()");
}

function lowStockRun() {
	$("#report-grids").children().hide();
	$("#report-grids").children().eq(1).show();
	
	$("#btn-download").attr("onclick", "lowStockReportDownload()");
	$("#btn-print").attr("onclick", "reportPrint()");
}

function stockAdjustRun() {
	$("#report-grids").children().hide();
	$("#report-grids").children().eq(4).show();
	
	$("#btn-download").attr("onclick", "stockAdjustReportDownload()");
	$("#btn-print").attr("onclick", "reportPrint()");
}

function inboundTransRun() {
	$("#report-grids").children().hide();
	$("#report-grids").children().eq(5).show();
	
	if(dmy === 0) ibtrans_data = inboundTransData(true);
	else if(dmy === 1) ibtrans_data = inboundTransData(undefined, true);
	else if(dmy === 2) ibtrans_data = inboundTransData(undefined, undefined, true);
	else if(dmy === 3) ibtrans_data = inboundTransData(undefined, undefined, undefined, from, to);
	
	$("#5-inbound-trans").jsGrid("reset");
	$("#5-inbound-trans").jsGrid("loadData");
	$("#btn-download").attr("onclick", "inboundTransReportDownload()");
	$("#btn-print").attr("onclick", "reportPrint()");
}

function outboundTransRun() {
	$("#report-grids").children().hide();
	$("#report-grids").children().eq(6).show();
	
	if(dmy === 0) obtrans_data = outboundTransData(true);
	else if(dmy === 1) obtrans_data = outboundTransData(undefined, true);
	else if(dmy === 2) obtrans_data = outboundTransData(undefined, undefined, true);
	else if(dmy === 3) obtrans_data = outboundTransData(undefined, undefined, undefined, from, to);
	
	$("#6-obound-trans").jsGrid("reset");
	$("#6-obound-trans").jsGrid("loadData");
	$("#btn-download").attr("onclick", "outboundTransReportDownload()");
	$("#btn-print").attr("onclick", "reportPrint()");
}

function inboundRunReport() {
	$("#report-grids").children().hide();
	$("#report-grids").children().eq(2).show();
	if(dmy === 0) inbound_data = inboundStockData(true);
	else if(dmy === 1) inbound_data = inboundStockData(undefined, true);
	else if(dmy === 2) inbound_data = inboundStockData(undefined, undefined, true);
	else if(dmy === 3) inbound_data = inboundStockData(undefined, undefined, undefined, from, to);

	$("#2-inbound-stock").jsGrid("loadData");
	$("#btn-download").attr("onclick", "inboundStockReportDownload()");
	$("#btn-print").attr("onclick", "reportPrint()");
}

function outboundRunReport() {
	$("#report-grids").children().hide();
	$("#report-grids").children().eq(3).show();
	if(dmy === 0) outbound_data = outboundStockData(true);
	else if(dmy === 1) outbound_data = outboundStockData(undefined, true);
	else if(dmy === 2) outbound_data = outboundStockData(undefined, undefined, true);
	else if(dmy === 3) outbound_data = outboundStockData(undefined, undefined, undefined, from, to);

	$("#3-outbound-stock").jsGrid("loadData");
	$("#btn-download").attr("onclick", "outboundStockReportDownload()");
	$("#btn-print").attr("onclick", "reportPrint()");
}

function dailyStockData(d, m, y, from, to) {
	var date = getOnlyDate((new Date()).toLocaleString());
	var data = [];
	var bound = {};
	
	if(d) {			
		var rows = alasql("select first(stock.id) as stockid, sum(inbound.qty) as inbound, first(inbound.date) as date, " +
				"first(stock.balance) as balance, first(porders.warehouse) as warehouse, first(porders.vendor) as vendor, " +
				"first(poitems.pcode) as pcode, first(poitems.pcat) as pcat, first(poitems.pdetail) as pdetail, " +
				"first(poitems.pmake) as pmake from porders outer join poitems on porders.poid=poitems.poid outer " +
				"join stock on poitems.pid=stock.item and porders.warehouse=stock.whouse outer " +
				"join inbound on poitems.id=inbound.itemid where inbound.date='" + date + "' group by stock.id");
		if(rows) {
			rows.forEach(function(r){
				if(r.stockid){
					var d = {};
					d.date = r.date;
					d.stockid = r.stockid;
					d.ibstock = r.inbound;
					d.obstock = 0;
					d.stcorrection = getStockCorrectionByDate(d.stockid , d.date);
					d.ostock = r.balance + d.obstock - d.ibstock + d.stcorrection;
					d.clstock = r.balance;
					d.warehouse = global_warehouse_map[r.warehouse];
					d.pcode = r.pcode;
					d.pcat = global_cat_map[r.pcat];
					d.maker = global_maker_map[r.pmake];
					d.pdetail = r.pdetail;
					bound[r.stockid] = d;	
				}
			});
		}

		rows = alasql("select first(stock.id) as stockid, sum(outbound.qty) as outbound, first(outbound.date) as date, " +
				"first(stock.balance) as balance, first(sorders.warehouse) as warehouse, first(sorders.outlet) as outlet, " +
				"first(soitems.pcode) as pcode, first(soitems.pcat) as pcat, first(soitems.pdetail) as pdetail, " +
				"first(soitems.pmake) as pmake from sorders outer join soitems on sorders.soid=soitems.soid outer " +
				"join stock on soitems.pid=stock.item and sorders.warehouse=stock.whouse outer join " +
				"outbound on soitems.id=outbound.itemid where outbound.date='" + date + "' group by stock.id");
		
		if(rows) {
			rows.forEach(function(r){
				if(r.stockid in bound) {
					bound[r.stockid].obstock = r.outbound;
					bound[r.stockid].ostock = r.balance + bound[r.stockid].obstock - bound[r.stockid].ibstock + bound[r.stockid].stcorrection;
				} else {
					if(r.stockid){
						var d = {};
						d.date = r.date;
						d.stockid = r.stockid;
						d.ibstock = 0;
						d.obstock = r.outbound;
						d.stcorrection = getStockCorrectionByDate(d.stockid , d.date);
						d.ostock = r.balance + d.obstock - d.ibstock + d.stcorrection;
						d.clstock = r.balance;
						d.warehouse = global_warehouse_map[r.warehouse];
						d.pcode = r.pcode;
						d.pcat = global_cat_map[r.pcat];
						d.maker = global_maker_map[r.pmake];
						d.pdetail = r.pdetail;
						bound[r.stockid] = d;	
					}
				}
			});
		}
		
		console.log("select first(stock.id) as stockid, first(stock.balance) as balance, sum(stockcorrection.diffQty) as diff, first(stockcorrection.date) as date, first(products.code) as pcode, " +
				"first(products.category) as pcat, first(products.detail) as pdetail, first(products.make) as pmake " +
				"from stock outer join products on products.id=stock.item outer join stockcorrection on stock.id=stockcorrection.stockid where stockcorrection.date like '" + date + "%' group by stock.id")
		
		rows = alasql("select first(stock.id) as stockid, first(stock.whouse) as warehouse, first(stock.balance) as balance, sum(stockcorrection.diffQty) as diff, first(stockcorrection.lastupdate) as date, first(products.code) as pcode, " +
				"first(products.category) as pcat, first(products.detail) as pdetail, first(products.make) as pmake " +
				"from stock outer join products on products.id=stock.item outer join stockcorrection on stock.id=stockcorrection.stockid where stockcorrection.lastupdate like '" + date + "%' group by stockid");
		
		if(rows) {
			rows.forEach(function(r){
				if(r.stockid in bound) {
					bound[r.stockid].stcorrection = r.diff;
					bound[r.stockid].ostock = bound[r.stockid].clstock + bound[r.stockid].obstock - bound[r.stockid].ibstock + bound[r.stockid].stcorrection;
				} else {
					if(r.stockid){
						var d = {};
						d.date = r.date;
						d.stockid = r.stockid;
						d.ibstock = 0;
						d.obstock = 0;
						d.stcorrection = getStockCorrectionByDate(d.stockid , d.date);
						d.ostock = r.balance + d.obstock - d.ibstock + d.stcorrection;
						d.clstock = r.balance;
						d.warehouse = global_warehouse_map[r.warehouse];
						d.pcode = r.pcode;
						d.pcat = global_cat_map[r.pcat];
						d.maker = global_maker_map[r.pmake];
						d.pdetail = r.pdetail;
						bound[r.stockid] = d;	
					}
				}
			});
		}
		var val = Object.values(bound);
		val.forEach(function(v){
			data.push(v);
		});
	} else if(m) {
		
	} else if(y) {
		
	} else {
		
	}
	return data
}

function inboundStockData(d, m, y, from, to) {
	var date = getOnlyDate((new Date()).toLocaleString());
	var data = [];
	var rows = alasql("select poitems.id as itemid, porders.warehouse, porders.vendor, poitems.pcode, poitems.pcat, " +
			"poitems.pdetail, poitems.pmake from porders outer join poitems on porders.poid=poitems.poid");
	var poitems = {};
	if(rows) {
		rows.forEach(function(r){
			poitems[r.itemid] = r;
		});
	}

	if(d) {
		rows = alasql("select oid, itemid, SUM(qty) as qty from inbound where date='" + date +"' group by oid, itemid");
		if(rows && rows[0].oid) {
			rows.forEach(function(r){
				var d = {};
				d.itemid = r.itemid;
				d.oid = r.oid;
				d.warehouse = global_warehouse_map[poitems[r.itemid].warehouse];
				d.vendor = global_vendor_map[poitems[r.itemid].vendor];
				d.pcode = poitems[r.itemid].pcode;
				d.pcat = global_cat_map[poitems[r.itemid].pcat];
				d.pmake = global_maker_map[poitems[r.itemid].pmake];
				d.pdetail = poitems[r.itemid].pdetail;
				d.qty = r.qty;
				d.date = date;
				data.push(d);
			});
		}
	} else if(m) {
		
	} else if(y) {
		
	} else {
		
	}
	return data
}

function outboundStockData(d, m, y, from, to) {
	var date = getOnlyDate((new Date()).toLocaleString());
	var data = [];
	var rows = alasql("select soitems.id as itemid, sorders.warehouse, sorders.outlet, soitems.pcode, soitems.pcat, " +
			"soitems.pdetail, soitems.pmake from sorders outer join soitems on sorders.soid=soitems.soid");
	var soitems = {};
	if(rows) {
		rows.forEach(function(r){
			soitems[r.itemid] = r;
		});
	}

	if(d) {
		rows = alasql("select oid, itemid, SUM(qty) as qty from outbound where date='" + date +"' group by oid, itemid");
		if(rows) {
			rows.forEach(function(r){
				var d = {};
				d.itemid = r.itemid;
				d.oid = r.oid;
				d.warehouse = global_warehouse_map[soitems[r.itemid].warehouse];
				d.outlet = global_vendor_map[soitems[r.itemid].outlet];
				d.pcode = soitems[r.itemid].pcode;
				d.pcat = global_cat_map[soitems[r.itemid].pcat];
				d.pmake = global_maker_map[soitems[r.itemid].pmake];
				d.pdetail = soitems[r.itemid].pdetail;
				d.qty = r.qty;
				d.date = date;
				data.push(d);
			});
		}
	} else if(m) {
		
	} else if(y) {
		
	} else {
		
	}
	return data
}


function inboundTransData(d, m, y, from, to) {
	var date = getOnlyDate((new Date()).toLocaleString());
	var data = [];

	if(d) {
		var rows = alasql("select stock.id as stockid, inbound.qty as inbound, inbound.date as date, "
				+ "stock.balance as balance, porders.warehouse as warehouse, porders.vendor as vendor, "
				+ "poitems.pcode as pcode, poitems.pcat as pcat, poitems.pdetail as pdetail, "
				+ "poitems.pmake as pmake from porders outer join poitems on porders.poid=poitems.poid outer "
				+ "join stock on poitems.pid=stock.item and porders.warehouse=stock.whouse outer "
				+ "join inbound on poitems.id=inbound.itemid where inbound.date='"
				+ date + "'");
		if (rows) {
			rows.forEach(function(r) {
				if (r.stockid) {
					var d = {};
					d.date = r.date;
					d.stockid = r.stockid;
					d.ibstock = r.inbound;
					d.warehouse = global_warehouse_map[r.warehouse];
					d.pcode = r.pcode;
					d.pcat = global_cat_map[r.pcat];
					d.maker = global_maker_map[r.pmake];
					d.pdetail = r.pdetail;
					data.push(d);
				}
			});
		}
	} else if(m) {
		
	} else if(y) {
		
	} else {
		
	}
	return data
}

function outboundTransData(d, m, y, from, to) {
	var date = getOnlyDate((new Date()).toLocaleString());
	var data = [];

	if(d) {
		rows = alasql("select stock.id as stockid, outbound.qty as outbound, outbound.date as date, " +
				"stock.balance as balance, sorders.warehouse as warehouse, sorders.outlet as outlet, " +
				"soitems.pcode as pcode, soitems.pcat as pcat, soitems.pdetail as pdetail, " +
				"soitems.pmake as pmake from sorders outer join soitems on sorders.soid=soitems.soid outer " +
				"join stock on soitems.pid=stock.item and sorders.warehouse=stock.whouse outer join " +
				"outbound on soitems.id=outbound.itemid where outbound.date='" + date + "'");
		if (rows) {
			rows.forEach(function(r) {
				if (r.stockid) {
					var d = {};
					d.date = r.date;
					d.stockid = r.stockid;
					d.obstock = r.outbound;
					d.warehouse = global_warehouse_map[r.warehouse];
					d.pcode = r.pcode;
					d.pcat = global_cat_map[r.pcat];
					d.maker = global_maker_map[r.pmake];
					d.pdetail = r.pdetail;
					data.push(d);
				}
			});
		}
	} else if(m) {
		
	} else if(y) {
		
	} else {
		
	}
	return data
}
function getStockCorrectionByDate(stockid, date) {
	var rows = alasql("select sum(diffQty) as diff from stockcorrection where lastupdate like '" + date + "%' and stockid=" + Number(stockid));
	if(rows && rows[0].diff!=undefined) return rows[0].diff;
	return 0;
}