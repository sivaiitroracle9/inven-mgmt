$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	  var target = $(e.target).attr("href") // activated tab
	  if("#tabcontent-po-overview" == target || "#tabcontent-po" == target || "#tabcontent-po-create" == target) {
		  refreshPOGrids();
	  } else if("#tabcontent-so-overview" == target || "#tabcontent-so" == target || "#tabcontent-so-create" == target) {
		  refreshSOGrids();
	  }
});

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
	$("#so-dlg-itemss").jsGrid("render");
	$("#so-create-grid").jsGrid("render");
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

function getProductsFromDB(){
	
	var query = "select * from products";
	var product_rows = alasql(query);
	query = "select * from maker";
	var maker_map = {};
	alasql(query).forEach(function(maker){
		maker_map[maker.id] = maker.text;
	});
	query = "select * from kind";
	var kind_map = {};
	alasql(query).forEach(function(kind){
		kind_map[kind.id] = kind.text;
	});
	
	var data = [];
	if (maker_map != undefined && kind_map != undefined
			&& product_rows.length != 0 && maker_map.length != 0
			&& kind_map.length != 0) {

		product_rows.forEach(function(product) {
			var d = {};
			d["id"] = product.id;
			d["pcode"] = product.code;
			d["detail"] = product.detail;
			d["make"] = product.make;
			d["category"] = product.category;
			data.push(d);
		});
	}
    return data;
}

function notification(message) {
	$("#notificationDialog").html("<span>" + message + "</span>")
	$(function() {
		$("#notificationDialog").dialog({
			modal : true,
			buttons : {
				Ok : function() {
					$(this).dialog("close");
				}
			}
		});
	});
}

function getVendorById(id) {
	var rows = alasql("SELECT * FROM vendor where id =" + Number(id) + " order by id desc");
	if (rows.length != 0) {
		var d = {};
		d["id"] = rows[0].id;
		d["CODE"] = rows[0].vencode;
		d["NAME"] = rows[0].name;
		d["TEL"] = rows[0].tel;
		d["Email"] = rows[0].email;
		d["Address"] = rows[0].address;
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

function getStatusLOV(type) {
	var rows = alasql("SELECT id, text FROM status where type='" + type + "' order by id");

	var data = [];
	var d = {};
	d["id"] = 0;
	d["text"] = "";
	data.push(d);
	if (rows.length != 0) {
		rows.forEach(function(r) {
			var d = {};
			d["id"] = r.id;
			d["text"] = r.text;
			data.push(d);
		});
	}
	console.log(data)
	return data;
}


//------------------------------------------------------------------------------------------------------------------------------------------------
function open_dlg_overview_email() {
	dlg_overview_email.dialog("open");
}

var dlg_overview_email = $("#dlg-overview-email").dialog(
		{
			autoOpen : false,
			width : 400,
			modal : true,
			closeOnEscape : true,
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