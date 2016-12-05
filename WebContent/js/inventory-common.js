function refreshPOGrids() {
	$("#po-orders-grid").jsGrid("reset");
	$("#po-orders-grid").jsGrid("loadData");
	$("#po-orders-grid").jsGrid("render");
	$("#po-dlg-items").jsGrid("reset");
	$("#po-dlg-items").jsGrid("loadData");
	$("#po-dlg-items").jsGrid("render");
	$("#po-create-grid").jsGrid("render");
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