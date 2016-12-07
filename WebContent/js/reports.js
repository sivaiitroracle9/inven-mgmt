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
		if(rows) {
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
			"soitems.pdetail, soitems.pmake from sorders outer join soitems on sorders.poid=soitems.soid");
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
				d.vendor = global_vendor_map[soitems[r.itemid].vendor];
				d.pcode = poitems[r.itemid].pcode;
				d.pcat = global_cat_map[soitems[r.itemid].pcat];
				d.pmake = global_maker_map[soitems[r.itemid].pmake];
				d.pdetail = soitems[r.itemid].pdetail;
				d.qty = r.qty;
				data.push(d);
			});
		}
	} else if(m) {
		
	} else if(y) {
		
	} else {
		
	}
	return data
}
