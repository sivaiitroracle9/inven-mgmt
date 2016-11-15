//--------------------------------------------------------------------- PO -------------------------------------------------------------
$("#po-date").text((new Date()).toLocaleString());
getVendorsLOV().forEach(function(lov){
	var option = $("<option>");
	option.val(lov.id);
	option.text(lov.text);
	option.appendTo($("#po-vendor-info-select"));
});

$("#po-vendor-info div.panel-body").hide();
$("#po-vendor-info-select").on("change", function(event) {
	var vendorId = $("#po-vendor-info-select").val();
	if(vendorId == 0) $("#po-vendor-info div.panel-body").hide();
	else {
		$("#po-vendor-info div.panel-body").show();
		var vendor = getVendorById(vendorId);
		$("#po-vendor-info-code").text(vendor["CODE"]);
		$("#po-vendor-info-name").text(vendor["NAME"]);
		$("#po-vendor-info-address").text(vendor["Address"]);
		$("#po-vendor-info-tel").text(vendor["TEL"]);
		$("#po-vendor-info-email").text(vendor["Email"]);
	}
});

getWarehousesLOV().forEach(function(lov){
	var option = $("<option>");
	option.val(lov.id);
	option.text(lov.text);
	option.appendTo($("#po-warehouse-info-select"));
});

$("#po-warehouse-info div.panel-body").hide();
$("#po-warehouse-info-select").on("change", function(event) {
	var whouseId = $("#po-warehouse-info-select").val();
	if(whouseId == 0) $("#po-warehouse-info div.panel-body").hide();
	else {
		$("#po-warehouse-info div.panel-body").show();
		var whouse = getWarehouseById(whouseId);
		$("#po-warehouse-info-name").text(whouse["name"]);
		$("#po-warehouse-info-address").text(whouse["address"]);
		$("#po-warehouse-info-tel").text(whouse["tel"]);
	}
});

var po_items_inserted = {};
var po_max_insert_id = 0;

function nextPOInsertId() {
	po_max_insert_id++;

}

function decPOInsertId(clear) {
	if(clear == true) {
		po_max_insert_id=0	
	} else po_max_insert_id--;
}

function addPOItem(item) {
	po_items_inserted[po_max_insert_id] = item;
	if(Object.keys(po_items_inserted).length > 0) {
		$("#po-create-btn").prop("disabled", false);
		$("#po-cancel-btn").prop("disabled", false);
	}
}

function removePOItem(clear, id) {
	if(clear == true) {
		decPOInsertId(clear);
		po_items_inserted = {};
	} else {
		delete po_items_inserted[id];
	}
	console.log(po_items_inserted);
	if(Object.keys(po_items_inserted).length == 0) {
		$("#po-create-btn").prop("disabled", true);
		$("#po-cancel-btn").prop("disabled", true);
	}
}

$("#po-cancel-btn").click(function(event){
	removePOItem(true);
	resetPOGrids();
	$("#po-vendor-info-select").val(0);
	$("#po-warehouse-info-select").val(0);
});

$("#po-create-btn").click(function(event){
	console.log(po_items_inserted);
	if(Object.keys(po_items_inserted).length==0){
		alert("PO cannot be created.");
	}
	Object.keys(po_items_inserted).forEach(function(pk){
		console.log(po_items_inserted[pk])
	})
	createPO(po_items_inserted);
	resetPOGrids();
	$("#po-vendor-info-select").val(0);
	$("#po-vendor-info div.panel-body").hide();
	$("#po-warehouse-info-select").val(0);
	$("#po-warehouse-info div.panel-body").hide();
});

function createPO(po_items_inserted) {

	if(Object.keys(po_items_inserted).length > 0) {
		var row = po_items_inserted[Object.keys(po_items_inserted)[0]];
		console.log(po_items_inserted)
		console.log(row)
		var vendor = row["vendor"];
		var whouse = row["whouse"];
		var status = row["status"];
		
		var orderQuery = "select max(id) as id from orders";
		var orders = alasql(orderQuery);
		var orderId = 0;
		if(orders.length != 0 && orders[0].id !=undefined) orderId = orders[0].id;
		orderId++;
		var values = [];
		values.push(orderId);
		values.push("'PO"+orderId+"'");
		values.push(Number(vendor));
		values.push(Number(whouse));
		values.push(Number(status));
		values.push("'" + (new Date()).toLocaleString() + "'");
		var orderInsert = "INSERT INTO orders VALUES (" + values.join(",") + ")";
		console.log(orderInsert)
		alasql(orderInsert);
		
		// order-items
		var oitems = alasql("select max(id) as id from oitems");
		var oitemId = 0;
		if(oitems.length != 0 && oitems[0].id !=undefined) oitemId = oitems[0].id;
		Object.values(po_items_inserted).forEach(function(item){
			oitemId++;
			var values = [];
			values.push(oitemId);
			values.push("'PO"+orderId+"'");
			values.push("'" + item["prod-code"] + "'");
			values.push(item["prod-cat"]);
			values.push(item["prod-make"]);
			values.push("'" + item["prod-detail"] + "'");
			values.push(item["prod-quant"]);
			values.push(6);
			values.push(0);
			values.push("'" + (new Date()).toLocaleString() + "'");
			var oitemInsert = "INSERT INTO oitems VALUES (" + values.join(",") + ")";
			console.log(oitemInsert)
			alasql(oitemInsert);
		});
		
		toastr.clear();
		toastr.success('PO created successfully.');
	}
}


$("#po-grid").jsGrid({
	width: "100%",
	inserting: true,
	autoload: true,
	pageSize: 10,
	pageButtonCount: 5,
	confirmDeleting: false,
    
	invalidNotify: function(args){
		var message = [];
		args.errors.forEach(function(e){
			if(e.message != undefined) {
				message.push(e.message);
			}
		});
		notification(message.join(", "));
	},
	
    onItemInserted: function(args){
    	if($("#po-warehouse-info-select").val()==0 || $("#po-vendor-info-select").val()==0) {
    		
    		if($("#po-vendor-info-select").val()==0) {
    			notification("Please select Vendor.");
    		}
    		
    		if($("#po-warehouse-info-select").val()==0) {
    			notification("Please select Warehouse.");
    		}
    		$("#po-grid").jsGrid("deleteItem", args.item);
        	var makeField = args.grid.fields[2];
        	makeField.items = [];
            $(".prod-make-insert").empty().append(makeField.insertTemplate());
            var detailField = args.grid.fields[3];
            detailField.items = [];
            $(".prod-detail-insert").empty().append(detailField.insertTemplate());	
    	} else {
    		
        	args.item["prod-code"] = getProductCode(args.item["prod-cat"], args.item["prod-make"], args.item["prod-detail"]);

        	nextPOInsertId();
        	
        	var dbitem = {};
        	
        	dbitem["whouse"] = $("#po-warehouse-info-select").val();
        	dbitem["vendor"] = $("#po-vendor-info-select").val();
        	dbitem["status"] = 1;
        	dbitem["po-row-id"] = po_max_insert_id;
        	dbitem["prod-code"] = args.item["prod-code"];
        	dbitem["prod-cat"] = args.item["prod-cat"];
        	dbitem["prod-make"] = args.item["prod-make"];
        	dbitem["prod-detail"] = args.item["prod-detail"];
        	dbitem["prod-quant"] = args.item["prod-quant"];
        	console.log(dbitem)
        	addPOItem(dbitem);

        	var makeField = args.grid.fields[2];
        	makeField.items = [];
            $(".prod-make-insert").empty().append(makeField.insertTemplate());
            var detailField = args.grid.fields[3];
            detailField.items = [];
            $(".prod-detail-insert").empty().append(detailField.insertTemplate());	
    	}
    },
    
    onItemDeleted: function(args) {
    	removePOItem(false, args.item["po-row-id"]);
    },
    
    controller: {
    	loadData: function(){
    		return [];
    	}
    },
    
	fields: [
		{name: "prod-code", inserting: true, title: "PROD CODE",
			itemTemplate: function(value, item) {
				return getProductCode(item["prod-cat"], item["prod-make"], item["prod-detail"]);
			}	
		},
		{name: "prod-cat", title: "PROD CATEGORY", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text", 
			
			validate:{validator: "min", 
				message: function(value, item) {
					return "Invalid PROD CATEGORY";
				},
				param: [1]
			},
			
			selectedIndex: 0,
			
			insertTemplate: function(){
                var makeField = this._grid.fields[2];
                var detailField = this._grid.fields[3];
                var $insertControl = jsGrid.fields.select.prototype.insertTemplate.call(this);
                
                $insertControl.on("change", function() {
                    var selectedCat = $(this).val();
                    var makermap = {};
                    
                    getProductsFromDB().forEach(function(p){
                    	if(p["category"] == selectedCat) {
                    		makermap[p["make"]]="";
                    	}
                    });
                    
                    getMakersLOV().forEach(function(m){
                    	if(m["id"] in makermap) makermap[m["id"]] = m["text"];
                    });
                    
                    var makers = [];
                    Object.keys(makermap).forEach(function(key){
                    	var d = {};
                    	d["id"] = key;
                    	d["text"] = makermap[key];
                    	makers.push(d);
                    });
                
                    makeField.items = makers;
                    console.log(makers)
                    $(".prod-make-insert").empty().append(makeField.insertTemplate());
                    var filter;
                    if(makers.length!=0) filter = {"category":selectedCat, "make": makers[0].id};
                    else filter = {"category":selectedCat};
                    detailField.items = getProductDetailLOV(filter);
                    $(".prod-detail-insert").empty().append(detailField.insertTemplate());
                });
                return $insertControl;
			},
			
			insertValue: function() {
				return Number(this.insertControl.val());
		    },
		    
		    itemTemplate: function(value, item){
		    	var list = $.grep(getCategoriesLOV(), function(cat){
		    		return cat["id"]==value;
		    	});
		    	var text = "";
		    	if(list.length > 0) text = list[0]["text"];
		    	return text;
		    }
		},
		
		
		{name: "prod-make", title: "PROD MAKER", type: "select", items:[], valueField: "id", textField: "text", insertcss: "prod-make-insert",
			
			selectedIndex: 0,
			validate:{validator: "min", 
				message: function(value, item) {
					return "Invalid PROD MAKER";
				},
				param: [1]
			},
			insertTemplate: function(){
                var detailField = this._grid.fields[3];
                var $insertControl = jsGrid.fields.select.prototype.insertTemplate.call(this);

                $insertControl.on("change", function() {
                    var selectedMake = $(this).val();
                    var detailmap = {};
                    
                    getProductsFromDB().forEach(function(p){
                    	if(p["make"] == selectedMake) {
                    		detailmap[p["detail"]]=p["detail"];
                    	}
                    });
                    
                    var details = [];
                    Object.keys(detailmap).forEach(function(key){
                    	var d = {};
                    	d["id"] = key;
                    	d["text"] = detailmap[key];
                    	details.push(d);
                    });
                
                    detailField.items = details;
                    $(".prod-detail-insert").empty().append(detailField.insertTemplate());
                });                
                return $insertControl;
			},
			
			insertValue: function(args) {
				return Number(this.insertControl.val());
		    },
		    
		    itemTemplate: function(value, item) {
		    	var list = $.grep(getMakersLOV(), function(cat){
		    		if(cat["id"] == value) {
		    			return true;
		    		}
		    		return false;
		    	});
		    	var text = "";
		    	if(list.length > 0) text = list[0]["text"];
		    	return text;
		    }
		},
		
		{name: "prod-detail", title: "PROD DETAIL", type: "select", items:[], valueField: "id", textField: "text", insertcss: "prod-detail-insert",
			validate:{validator: "min", 
				message: function(value, item) {
					return "Invalid PROD DETAIL";
				},
				param: [1]
			},
		    itemTemplate: function(value, item){
		    	var list = $.grep(getProductDetailLOV(), function(cat){
		    		return cat["id"]==value;
		    	});
		    	var text = "";
		    	if(list.length > 0) text = list[0]["text"];
		    	return text;
		    },
		    
			insertValue: function(args) {
				return this.insertControl.val();
		    },
		},	
		{name: "prod-quant", title: "QTY", type: "text", validate:{validator: function(value, item) {
					if(Number(value) === parseInt(value, 10) && Number(value) > 0) return true;
					else false;
			}, message: function(value, item) {
				return "Invalid QTY = " + value;
			},
			param: [1]
		},
		
		itemTemplate: function(value, item) {
			return parseInt(value, 10);
		}	
		
		},
		{ type: "control",
		  editButton: false,
		}
	]
});

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
