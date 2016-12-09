$('a[data-toggle="tab"]').on(
		'shown.bs.tab',
		function(e) {
			var target = $(e.target).attr("href") // activated tab
			if ("#tabcontent-inventory" == target) {
				refreshInventoryGrid();
			} else if ("#tabcontent-goodsissue" == target) {
				refreshSOGrids();
			} else if ("#tabcontent-goodsreceive" == target) {
				refreshPOGrids();
			} else if ("#tabcontent-invencorrection" == target) {
				refreshInvenCorrectGrids();
			} else if ("#tabcontent-settings" == target) {
				refreshReorderPoint();
			} else if (target == "#tabcontent-settings-vendorpref-item"
					|| target == "#tabcontent-settings-vendorpref")
				refreshVendorPrefItem();
			else if (target == "#tabcontent-settings-vendorpref-cat")
				refreshVendorPrefCat();
			else if (target == "#tabcontent-settings-vendorpref-whouse")
				refreshVendorPrefWhouse();
			else if (target == "#tabcontent-settings-reorderpoint")
				refreshReorderPoint();
		});

function refreshVendorPrefItem(){
	$("#venpref-4").jsGrid("search", $("#venpref-4").jsGrid("getFilter"));
}

function refreshVendorPrefCat(){
	$("#venpref-3").jsGrid("reset");
	$("#venpref-3").jsGrid("render");
	$("#venpref-3").jsGrid("loadData");
}

function refreshVendorPrefWhouse(){
	$("#venpref-2").jsGrid("reset");
	$("#venpref-2").jsGrid("render");
	$("#venpref-2").jsGrid("loadData");
}

function refreshReorderPoint(){
	$("#cstock-spc-items-grid").jsGrid("search", $("#cstock-spc-items-grid").jsGrid("getFilter"));
	$("#cstock-spc-items-grid").jsGrid("reset");
}

function refreshInventoryGrid(){
	$("#inventory-items").jsGrid("reset");
	$("#inventory-items").jsGrid("loadData");
	$("#inventory-items").jsGrid("render");
	$("#po-create-grid").jsGrid("reset");
	$("#po-create-grid").jsGrid("loadData");
	$("#po-create-grid").jsGrid("render");
}

function refreshPOGrids() {
	$("#po-orders-grid").jsGrid("reset");
	$("#po-orders-grid").jsGrid("loadData");
	$("#po-orders-grid").jsGrid("render");
	$("#po-dlg-items").jsGrid("reset");
	$("#po-dlg-items").jsGrid("loadData");
	$("#po-dlg-items").jsGrid("render");
	$("#po-create-grid").jsGrid("render");
}

function refreshSOGrids() {
	$("#so-orders-grid").jsGrid("reset");
	$("#so-orders-grid").jsGrid("loadData");
	$("#so-orders-grid").jsGrid("render");
	$("#so-dlg-items").jsGrid("reset");
	$("#so-dlg-items").jsGrid("loadData");
	$("#so-dlg-items").jsGrid("render");
	$("#so-create-grid").jsGrid("render");
}

function refreshInvenCorrectGrids(){
	$("#invencorrect-items").jsGrid("reset");
	$("#invencorrect-items").jsGrid("loadData");
	$("#invencorrect-items").jsGrid("render");
	refreshInventoryGrid();
}

function loadStock(){
	var products = alasql("select products.id as id, stock.whouse as whouse, stock.balance as qty, products.code as code, " +
			"products.category as category, products.detail as detail, products.make as make, products.price as price, products.unit as unit" +
			" from products JOIN stock ON products.id=stock.item");
	
	var inventory_items_stock = [];
	products.forEach(function(prd){
		var iitem = {};
		iitem.whouse = prd.whouse;
		iitem.pcat = prd.category;
		iitem.pcode = prd.code;
		iitem.pmake = prd.make;
		iitem.pdetail = prd.detail;
		iitem.pprice = prd.price;
		iitem.inStock = prd.qty;
		inventory_items_stock.push(iitem);
	});
	return inventory_items_stock;
}

function getStockLevelLOV() {
	var data = [];
	data.push({"id":0,"text":""});
	data.push({"id":1,"text":"Sufficient Stock"});
	data.push({"id":2,"text":"Low Stock"});
	data.push({"id":3,"text":"Out of Stock"});
	data.push({"id":4,"text":"Low / Out of Stock"});
	return data;
}

function getMakersLOV(){
	var query = "select * from maker";
	var data = [];
	var d = {};
	d["id"] = 0;
	d["text"] = "";
	data.push(d);
	alasql(query).forEach(function(maker){
		d = {};
		d["id"] = maker.id;
		d["text"] = maker.text;
		data.push(d);
	});
	return data;
}

function getProductId(category, make, detail){
	var query = "select id from products where category =" + category + " and make=" + make + " and detail='" + detail + "'";
	console.log(query)
	var rows = alasql(query);
	if(rows.length == 1) {
		return rows[0]["id"];
	}
	return "";
}

function getCategoriesLOV(){
	var query = "select * from kind";
	var data = [];
	var d = {};
	d["id"] = 0;
	d["text"] = "";
	data.push(d);
	alasql(query).forEach(function(maker){
		d = {};
		d["id"] = maker.id;
		d["text"] = maker.text;
		data.push(d);
	});
	return data;
}

function getWarehousesLOV() {
	var rows = alasql("SELECT id, name FROM whouse order by name");

	var data = [];
	var d = {};
	d["id"] = 0;
	d["text"] = "";
	data.push(d);
	if (rows.length != 0) {
		rows.forEach(function(r) {
			var d = {};
			d["id"] = r.id;
			d["text"] = r.name;
			data.push(d);
		});
	}

	return data;
}

function getVendorById(id) {
	var rows = alasql("SELECT * FROM vendor where id =" + Number(id) + " order by id desc");
	if (rows.length != 0) {
		var d = {};
		d["id"] = rows[0].id;
		d["code"] = rows[0].vencode;
		d["name"] = rows[0].name;
		d["tel"] = rows[0].tel;
		d["email"] = rows[0].email;
		d["address"] = rows[0].address;
		return d;
	}
}

function getWarehouseById(id) {
	var rows = alasql("SELECT * FROM whouse where id =" + Number(id) + " order by id desc");
	if (rows.length != 0) {
		var d = {};
		d["id"] = rows[0].id;
		d["name"] = rows[0].name;
		d["tel"] = rows[0].tel;
		d["address"] = rows[0].addr;
		return d;
	}
}

function getOutletById(id) {
	var rows = alasql("SELECT * FROM outlet where id =" + Number(id) + " order by id desc");
	if (rows.length != 0) {
		var d = {};
		d["id"] = rows[0].id;
		d["code"] = rows[0].vencode;
		d["name"] = rows[0].name;
		d["tel"] = rows[0].tel;
		d["email"] = rows[0].email;
		d["address"] = rows[0].address;
		return d;
	}
}

function getVendorsLOV() {
	var rows = alasql("SELECT id, name FROM vendor order by name");

	var data = [];
	var d = {};
	d["id"] = 0;
	d["text"] = "";
	data.push(d);
	if (rows.length != 0) {
		rows.forEach(function(r) {
			var d = {};
			d["id"] = r.id;
			d["text"] = r.name;
			data.push(d);
		});
	}

	return data;
}

function getVendorPrefSpecificLOV() {
	var data = [];
	data.push({id:0,text:""});
	data.push({id:1,text:"HIGH RATING"});
	data.push({id:2,text:"LESS ITEM PRICE"});
	data.push({id:3,text:"MAX. PROCURED ITEMS"});
	data.push({id:4,text:"MAX PROCURED ORDERS"});
	data.push({id:5,text:"MAX PROCURED $ VALUE"});
	return data;
}

function getProductCode(category, make, detail){
	var query = "select code from products where category =" + category + " and make=" + make + " and detail='" + detail + "'";
	console.log(query)
	var rows = alasql(query);
	if(rows.length == 1) {
		return rows[0]["code"];
	}
	return "";
}

function getProductDetailLOV(args){
	if(args) {
		if(args.category && args.make) {
			query = "select detail from products where category=" + args.category + " and make=" + args.make;
		} else if(args.category && !args.make) {
			query = "select distinct(detail) as detail from products where category=" + args.categorye;
		} else query = "select distinct(detail) as detail from products where make=" + args.make;
	} else {
		query = "select distinct(detail) as detail from products";
	}

	var rows = alasql(query);
	var lov = [];
	rows.forEach(function(r){
		var l = {};
		l["id"] = r["detail"];
		l["text"] = r["detail"];
		lov.push(l);
	});
	return lov;
}

function open_dlg_overview_email() {
	dlg_overview_email.dialog("open");
}

var dlg_overview_email = $("#dlg-overview-email").dialog(
		{
			autoOpen : false,
			width : 400,
			modal : true,
			closeOnEscape : true,
			title: "Compose Email",
			buttons : {
				Send : function() {
					$(this).dialog("close");
				},
				Cancel : function() {
					$(this).dialog("close");
				}
			},
			open : function(event) {

				$('.ui-dialog-buttonpane').find('button:contains("Send")')
						.removeClass("ui-button ui-corner-all ui-widget")
						.addClass('btn btn-primary');
				$('.ui-dialog-buttonpane').find('button:contains("Cancel")')
				.removeClass("ui-button ui-corner-all ui-widget")
				.addClass('btn btn-default');
			},
			close : function(event) {

			}
});

function pageData(data, pageIndex, pageSize) {
	var pageData;
	if(pageIndex!= undefined && pageSize!= undefined && pageIndex > 0) {
		pageData = data.slice((pageIndex - 1)*pageSize, pageIndex*pageSize)	
	} else {
		pageData = data;
	}
	return pageData;
}

var global_warehouse_map = {};
getWarehousesLOV().forEach(function(d){
	if(d!=0) {
		global_warehouse_map[d.id] = d.text;
	}
});

var global_status_map = {};
getAllStatusLOV().forEach(function(d){
	if(d!=0) {
		global_status_map[d.id] = d.text;
	}
});

function getNextInsertId(table) {
	var rows = alasql("select max(id) as id from " + table + ";");
	var maxID = 0;
	if(rows && rows[0].id) maxID = rows[0].id;
	return ++maxID;
}

function getAllStatusLOV() {
	var rows = alasql("SELECT id, parent, text FROM status order by id");

	var data = [];
	var d = {};
	d["id"] = 0;
	d["parent"] = 0;
	d["text"] = "";
	data.push(d);
	if (rows.length != 0) {
		rows.forEach(function(r) {
			var d = {};
			d["id"] = r.id;
			d["parent"] = r.parent;
			d["text"] = r.text;
			data.push(d);
		});
	}
	console.log(data)
	return data;
}

function insertOrderRevision(onumber, otype, oitem, ofield, ofrom, oto, odate){
	alasql("INSERT INTO order_revision VALUES(" + getNextInsertId("order_revision") + ",'" + onumber + "','" + otype + "','" + oitem + "','" + ofield + "','" + ofrom + "','" + oto +"','" + odate + "');" );
}

function getOnlyDate(date) {
	if(date){
		date = date.split(",")[0];
		return date;
	}
}

function setStockHistory(stockid, qty, date) {

	var rows = alasql("select * from stockhistory where id=" + Number(stockid));
	
	if(rows && rows.length==1) {
		alasql("UPDATE stockhistory SET qty=" + Number(qty) + " where stockid="+Number(stockid)+" and date='"+getOnlyDate(date)+"'");
	} else {
		alasql("INSERT INTO stockhistory VALUES(" + getNextInsertId("stockhistory") + ", "+ Number(stockid) +", " + Number(qty) + ", 0, '" + getOnlyDate(date) + "');");
	}
}