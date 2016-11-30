//--------------------------------------------------------------------- so -------------------------------------------------------------
$("#so-date").text((new Date()).toLocaleString());
getVendorsLOV().forEach(function(lov){
	var option = $("<option>");
	option.val(lov.id);
	option.text(lov.text);
	option.appendTo($("#so-outlet-info-select"));
});

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

$("#so-outlet-info-select").on("change", function(event) {
	var outletId = $("#so-outlet-info-select").val();
	if(outletId == 0) {
		$("#so-to-info div.panel-body div#so-outlet").hide();
		$("#so-to-info div.panel-body").hide();
	}
	else {
		$("#so-to-info div.panel-body").show();
		$("#so-to-info div.panel-body div#so-outlet").show();
		$("#so-to-info div.panel-body div#so-customer").hide();
		var outlet = getVendorById(outletId);
		$("#so-outlet-name").text(outlet["name"]);
		$("#so-outlet-address").text(outlet["address"]);
		$("#so-outlet-tel").text(outlet["tel"]);
	}
});

getWarehousesLOV().forEach(function(lov){
	var option = $("<option>");
	option.val(lov.id);
	option.text(lov.text);
	option.appendTo($("#so-warehouse-info-select"));
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
//--------------------------------------------------------------------- so ----------------------------------------------------------------------------------------------

$("#so-create-grid").jsGrid({
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
    	if($("#so-warehouse-info-select").val()==0) {
    		
    		if($("#so-warehouse-info-select").val()==0) {
    			notification("Please select Warehouse.");
    		}
    		$("#so-create-grid").jsGrid("deleteItem", args.item);
        	var makeField = args.grid.fields[2];
        	makeField.items = [];
            $(".prod-make-insert").empty().append(makeField.insertTemplate());
            var detailField = args.grid.fields[3];
            detailField.items = [];
            $(".prod-detail-insert").empty().append(detailField.insertTemplate());	
    	} else {
    		++so_max_insert_id;
        	args.item["pcode"] = getProductCode(args.item["pcat"], args.item["pmake"], args.item["pdetail"]);
        	
        	var dbitem = {};
        	dbitem["status"] = 1;
        	dbitem["so-row-id"] = so_max_insert_id;
        	dbitem["pcode"] = args.item["pcode"];
        	dbitem["pcat"] = args.item["pcat"];
        	dbitem["pmake"] = args.item["pmake"];
        	dbitem["pdetail"] = args.item["pdetail"];
        	dbitem["pquant"] = args.item["pquant"];
        	dbitem["poutlet"] = $("#so-outlet-info-select").val();
        	dbitem["pwarehouse"] = $("#so-warehouse-info-select").val();
        	console.log(dbitem)
        	
        	so_items_inserted[so_max_insert_id] = dbitem;
        	refreshSOButtons();
        	
        	var makeField = args.grid.fields[2];
        	makeField.items = [];
            $(".prod-make-insert").empty().append(makeField.insertTemplate());
            var detailField = args.grid.fields[3];
            detailField.items = [];
            $(".prod-detail-insert").empty().append(detailField.insertTemplate());	
    	}
    },
    
    onItemDeleted: function(args) {
    	delete so_items_inserted[args.item["so-row-id"]];
    	refreshSOButtons();
    },
    
    controller: {
    	loadData: function(){
    		return [];
    	}
    },
    
	fields: [
		{name: "pcode", inserting: true, title: "PROD CODE"	},
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


$("#so-cancel-btn").click(function(event){
	so_max_insert_id=0;
	so_items_inserted = {};
	refreshSOButtons();
	resetSOGrids();
	$("#so-vendor-info-select").val(0);
	$("#so-warehouse-info-select").val(0);
});

$("#so-create-btn").click(function(event){
	console.log(so_items_inserted);
	if(Object.keys(so_items_inserted).length==0){
		alert("so cannot be created.");
	}
	createSO(so_items_inserted);
	resetSOGrids();
	$("#so-vendor-info-select").val(0);
	$("#so-vendor-info div.panel-body").hide();
	$("#so-warehouse-info-select").val(0);
	$("#so-warehouse-info div.panel-body").hide();
});

//-----------------------------------------------------------------------------------------------------------------------------------------------------------

function createSO(so_items_inserted) {
	console.log(so_items_inserted)
	if(Object.keys(so_items_inserted).length > 0) {
		var row = so_items_inserted[Object.keys(so_items_inserted)[0]];
		console.log(row)
		var status = row["status"];
		var poutlet = row["poutlet"];
		var pwarehouse = row["pwarehouse"];
		
		var orderQuery = "select max(id) as id from sorders";
		var orders = alasql(orderQuery);
		var orderId = 0;
		if(orders.length != 0 && orders[0].id !=undefined) orderId = orders[0].id;
		orderId++;
		var values = [];
		values.push(orderId);
		values.push("'SO-0000"+orderId+"'");
		values.push(pwarehouse);
		values.push(poutlet);
		values.push(Number(status));
		values.push("'" + (new Date()).toLocaleString() + "'");
		var orderInsert = "INSERT INTO sorders VALUES (" + values.join(",") + ")";
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
			values.push("'SO-0000"+orderId+"'");
			values.push("'" + item["pcode"] + "'");
			values.push(item["pcat"]);
			values.push(item["pmake"]);
			values.push("'" + item["pdetail"] + "'");
			values.push(item["pquant"]);
			values.push(10); // status
			values.push(0); // received
			values.push("'" + (new Date()).toLocaleString() + "'");
			var soitemInsert = "INSERT INTO soitems VALUES (" + values.join(",") + ")";
			console.log(soitemInsert)
			alasql(soitemInsert);
		});
		
		toastr.clear();
		toastr.success('so created successfully.');
	}
}

function refreshSOButtons() {
	if(Object.keys(so_items_inserted).length == 0) {
		$("#so-create-btn").prop("disabled", true);
		$("#so-cancel-btn").prop("disabled", true);
	} else {
		$("#so-create-btn").prop("disabled", false);
		$("#so-cancel-btn").prop("disabled", false);
	}
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

