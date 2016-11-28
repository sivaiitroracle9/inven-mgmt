//--------------------------------------------------------------------- so -------------------------------------------------------------
$("#so-date").text((new Date()).toLocaleString());


$("#so-to-info div.panel-body").hide();
$("#so-to-info div.panel-body div#so-outlet").hide();
$("#so-to-info div.panel-body div#so-customer").hide();

$("#so-to-info-select").change(function(){
	if($(this).val() == 1) {
		$("#so-outlet-info-select").hide();
		$("#so-to-info div.panel-body div#so-outlet").hide();
		$("#so-to-info div.panel-body").show();
		$("#so-to-info div.panel-body div#so-customer").show();
	} else {
		$("#so-to-info div.panel-body div#so-customer").hide();
		$("#so-outlet-info-select").show();
		if($("#so-outlet-info-select").val()!=0) {
			$("#so-to-info div.panel-body").show();
			$("#so-to-info div.panel-body div#so-outlet").show();
		} else {
			$("#so-to-info div.panel-body").hide();
		}
	}
	
});

getWarehousesLOV().forEach(function(lov){
	var option = $("<option>");
	option.val(lov.id);
	option.text(lov.text);
	option.appendTo($("#so-warehouse-info-select"));
});

getVendorsLOV().forEach(function(lov){
	var option = $("<option>");
	option.val(lov.id);
	option.text(lov.text);
	option.appendTo($("#so-outlet-info-select"));
});

$("#so-outlet-info-select").on("change", function(event) {
	var outletId = $("#so-outlet-info-select").val();
	if(outletId == 0) {
		$("#so-to-info div.panel-body").hide();
		$("#so-to-info div.panel-body div#so-outlet").hide();
		$("#so-to-info div.panel-body div#so-customer").hide();
	}
	else {
		var outlet = getVendorById(outletId);
		$("#so-outlet-code").text(outlet["CODE"]);
		$("#so-outlet-name").text(outlet["NAME"]);
		$("#so-outlet-address").text(outlet["Address"]);
		$("#so-outlet-tel").text(outlet["TEL"]);
		$("#so-outlet-email").text(outlet["Email"]);
		$("#so-to-info div.panel-body").show();
		$("#so-to-info div.panel-body div#so-outlet").show();
	}
});


$("#so-warehouse-info div.panel-body").hide();
$("#so-warehouse-info-select").on("change", function(event) {
	var whouseId = $("#so-warehouse-info-select").val();
	if(whouseId == 0) $("#so-warehouse-info div.panel-body").hide();
	else {
		$("#so-warehouse-info div.panel-body").show();
		var whouse = getWarehouseById(whouseId);
		$("#so-warehouse-info-name").text(whouse["name"]);
		$("#so-warehouse-info-address").text(whouse["address"]);
		$("#so-warehouse-info-tel").text(whouse["tel"]);
	}
});

var so_items_inserted = {};
var so_max_insert_id = 0;


$("#so-cancel-btn").click(function(event){
	so_items_inserted = {};
	so_max_insert_id=0;
	$("#so-customer-info-select").val(0);
	$("#so-warehouse-info-select").val(0);
});

$("#so-create-btn").click(function(event){
	console.log(so_items_inserted);
	if(Object.keys(so_items_inserted).length==0){
		alert("so cannot be created.");
	}
	Object.keys(so_items_inserted).forEach(function(pk){
		console.log(so_items_inserted[pk])
	})
	createSO(so_items_inserted);
	$("#so-outlet-info-select").val(0);
	$("#so-to-info-select").val(0);
	$("#so-warehouse-info-select").val(0);
	$("#so-warehouse-info div.panel-body").hide();
	$("#so-to-info div.panel-body").hide();
	$("#so-customer-info div.panel-body").hide();
	$("#so-grid").jsGrid("render");
	so_max_insert_id = 0;
	so_items_inserted = {};
	$("#so-create-btn").prop("disabled", true);
	$("#so-cancel-btn").prop("disabled", true);
	
});

function createSO(so_items_inserted) {

	if(Object.keys(so_items_inserted).length > 0) {
		var row = so_items_inserted[Object.keys(so_items_inserted)[0]];
		console.log(so_items_inserted)
		console.log(row)
		var to = row["to"];
		var from = row["from"];
		var totype = row["totype"];
		var status = row["status"];
		
		var orderQuery = "select max(id) as id from orders";
		var orders = alasql(orderQuery);
		var orderId = 0;
		if(orders.length != 0 && orders[0].id !=undefined) orderId = orders[0].id;
		orderId++;
		var values = [];
		values.push(orderId);
		values.push("'SO"+orderId+"'");
		values.push(2); // order type
		values.push(totype); // to type
		values.push(Number(to));
		values.push(0); // from type -- warehouse
		values.push(Number(from));
		values.push(Number(status));
		values.push("'" + (new Date()).toLocaleString() + "'");
		var orderInsert = "INSERT INTO orders VALUES (" + values.join(",") + ")";
		console.log(orderInsert)
		alasql(orderInsert);
		
		// order-items
		var soitems = alasql("select max(id) as id from soitems");
		var soitemId = 0;
		if(soitems.length != 0 && soitems[0].id !=undefined) soitemId = soitems[0].id;
		Object.values(so_items_inserted).forEach(function(item){
			soitemId++;
			var values = [];
			values.push(soitemId);
			values.push("'SO"+orderId+"'");
			values.push("'" + item["pcode"] + "'");
			values.push(item["pcat"]);
			values.push(item["pmake"]);
			values.push("'" + item["pdetail"] + "'");
			values.push(item["pquant"]);
			values.push(10); // status
			values.push(0); // shipped
			values.push("'" + (new Date()).toLocaleString() + "'");
			var soitemInsert = "INSERT INTO soitems VALUES (" + values.join(",") + ")";
			console.log(soitemInsert)
			alasql(soitemInsert);
		});
		
		toastr.clear();
		toastr.success('so created successfully.');
	}
}


$("#so-orders-grid").jsGrid({
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
    	if($("#so-warehouse-info-select").val()==0 || $("#so-customer-info-select").val()==0) {
    		
    		if($("#so-customer-info-select").val()==0) {
    			notification("Please select customer.");
    		}
    		
    		if($("#so-warehouse-info-select").val()==0) {
    			notification("Please select Warehouse.");
    		}
    		$("#so-grid").jsGrid("deleteItem", args.item);
        	var makeField = args.grid.fields[2];
        	makeField.items = [];
            $(".prod-make-insert").empty().append(makeField.insertTemplate());
            var detailField = args.grid.fields[3];
            detailField.items = [];
            $(".prod-detail-insert").empty().append(detailField.insertTemplate());	
    	} else {
    		
        	args.item["pcode"] = getProductCode(args.item["pcat"], args.item["pmake"], args.item["pdetail"]);
        	
        	var dbitem = {};
        	
        	dbitem["from"] = $("#so-warehouse-info-select").val();
    		dbitem["totype"] = $("#so-to-info-select").val();
        	if($("#so-to-info-select").val() == 0) {
        		dbitem["to"] = $("#so-outlet-info-select").val();
        	} else {
        		dbitem["to"] = {};
        	}
        	
        	dbitem["status"] = 1;
        	dbitem["pcode"] = args.item["pcode"];
        	dbitem["pcat"] = args.item["pcat"];
        	dbitem["pmake"] = args.item["pmake"];
        	dbitem["pdetail"] = args.item["pdetail"];
        	dbitem["pquant"] = args.item["pquant"];
        	
        	so_max_insert_id++;
        	dbitem["so-row-id"] = so_max_insert_id;
			so_items_inserted[so_max_insert_id] = dbitem;
			if(Object.keys(so_items_inserted).length > 0) {
				$("#so-create-btn").prop("disabled", false);
				$("#so-cancel-btn").prop("disabled", false);
			}
        	console.log(dbitem)

        	var makeField = args.grid.fields[2];
        	makeField.items = [];
            $(".prod-make-insert").empty().append(makeField.insertTemplate());
            var detailField = args.grid.fields[3];
            detailField.items = [];
            $(".prod-detail-insert").empty().append(detailField.insertTemplate());	
    	}
    },
    
    onItemDeleted: function(args) {
    	var id = args.item["so-row-id"];
    	if(so_items_inserted[id] != undefined)
    		delete so_items_inserted[id];
		if(Object.keys(so_items_inserted).length == 0) {
			$("#so-create-btn").prop("disabled", true);
			$("#so-cancel-btn").prop("disabled", true);
		}
		console.log(so_items_inserted);
    },
    
    controller: {
    	loadData: function(){
    		return [];
    	}
    },
    
	fields: [
		{name: "pcode", inserting: true, title: "PROD CODE",
			itemTemplate: function(value, item) {
				return getProductCode(item["prod-cat"], item["prod-make"], item["prod-detail"]);
			}	
		},
		{name: "pcat", title: "PROD CATEGORY", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text", 
			
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
		
		
		{name: "pmake", title: "PROD MAKER", type: "select", items:[], valueField: "id", textField: "text", insertcss: "prod-make-insert",
			
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
		
		{name: "pdetail", title: "PROD DETAIL", type: "select", items:[], valueField: "id", textField: "text", insertcss: "prod-detail-insert",
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
		{name: "pquant", title: "QTY", type: "text", validate:{validator: function(value, item) {
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

function getcustomerById(id) {
	var rows = alasql("SELECT * FROM customer where id =" + Number(id) + " order by id desc");
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

function getcustomersLOV() {
	var rows = alasql("SELECT id, name FROM customer order by name");

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
