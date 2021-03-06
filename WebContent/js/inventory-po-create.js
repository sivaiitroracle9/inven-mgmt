$("#inven-grp-po").hide();
$(".inven-po-cls").hide();
if(getPermission("inventory-po-create")) {
	$("#inven-grp-po").show();
	$(".inven-po-cls").show();
}

//------------------------------------------------------------------------------------- PO ----------------------------------------------------------------------------------------
var poOrderDetailsDlg = $("#dlg-inventory-create-po").dialog({
    autoOpen: false,
    width: 800,
    modal: true,
    closeOnEscape: true,
    title: "Create purchase order",
    close: function(){
    	refreshPOButtons();
    	refreshPOGrids();
    	$("#po-vendor-info-select").val(0);
    	$("#po-warehouse-info-select").val(0);
    }
});
$("#dlg-inventory-create-po").show();

var notificationDlg = $("#notification-dlg").dialog({
    autoOpen: false,
    width: 300,
    modal: true,
    closeOnEscape: true,
    title: "Alert",
    buttons: {
        Ok: function() {
            $(this).dialog("close");
        }
    },
});
$("#notification-dlg").show();

$("#o-date").text((new Date()).toLocaleString());
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

//------------------------------------------------------------------------------- PO -------------------------------------------------------------------------------------
$("#po-create-grid").jsGrid({
	width: "100%",
	height: "300px",
	inserting: true,
	autoload: true,
	editing: true,
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
    	if($("#po-warehouse-info-select").val()==0) {
    		
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
    		++po_max_insert_id;
        	args.item["pcode"] = getProductCode(args.item["pcat"], args.item["pmake"], args.item["pdetail"]);
        	args.item["pid"] = getProductId(args.item["pcat"], args.item["pmake"], args.item["pdetail"]);
        	
        	var dbitem = {};
        	dbitem["status"] = 1;
        	dbitem["po-row-id"] = po_max_insert_id;
        	dbitem["pid"] = args.item["pid"];
        	dbitem["pcode"] = args.item["pcode"];
        	dbitem["pcat"] = args.item["pcat"];
        	dbitem["pmake"] = args.item["pmake"];
        	dbitem["pdetail"] = args.item["pdetail"];
        	dbitem["pquant"] = args.item["pquant"];
        	dbitem["pvendor"] = $("#po-vendor-info-select").val();
        	dbitem["pwarehouse"] = $("#po-warehouse-info-select").val();
        	console.log(dbitem)
        	
        	po_items_inserted[po_max_insert_id] = dbitem;
        	refreshPOButtons();
        	
        	var makeField = args.grid.fields[2];
        	makeField.items = [];
            $(".prod-make-insert").empty().append(makeField.insertTemplate());
            var detailField = args.grid.fields[3];
            detailField.items = [];
            $(".prod-detail-insert").empty().append(detailField.insertTemplate());	
    	}
    },
    
    onItemDeleted: function(args) {
    	delete po_items_inserted[args.item["po-row-id"]];
    	refreshPOButtons();
    },
    
    controller: {
    	loadData: function(filter){
    		console.log(this)
    		console.log(filter)
    		return [];
    	}
    },
    
	fields: [
		{name: "pcode", inserting: true, title: "PROD CODE", editing:false},
		{name: "pcat", title: "PROD CATEGORY", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text", editing:false,
			
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
		
		{name: "pmake", title: "PROD MAKER", type: "select", items:[], valueField: "id", textField: "text", insertcss: "prod-make-insert", editing:false,
			
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
		{name: "pdetail", title: "PROD DETAIL", type: "select", items:[], valueField: "id", textField: "text", insertcss: "prod-detail-insert", editing:false,
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
		{name: "pquant", title: "QTY", type: "number",
			validate:{
				validator: function(value, item) {
					if(Number(value) === parseInt(value, 10) && Number(value) > 0) return true;
					else false;
				}, 
				message: function(value, item) {
					return "Invalid QTY = " + value;
				},
				param: [1]
			},
			itemTemplate: function(value, item) {
				var str = "";
				if(parseInt(value, 10) <= 0) {
					str = "<span class='label label-danger pull-left'>Invalid</span><span class='pull-right'>" + parseInt(value, 10) + "</span>" ;
				} else str = parseInt(value, 10);
				return str;
			}
		
		},
		{ type: "control",	}
	]
});
//--------------------------------------------------------------------- PO -------------------------------------------------------------
function openInventoryPO(multiple, itemId) {

	if(multiple) {
		if (Object.keys(inventory_items_selected).length == 0) {
			$("div#notification-dlg span.text").text("No stock item selected");
			notificationDlg.dialog("open");
		} else {
			var whouse = {};
			Object.values(inventory_items_selected).forEach(function(item) {
				if (item.whouse !== 0) {
					whouse[item.whouse] = true;
				}
			});

			if (Object.keys(whouse).length > 1) {
				$("div#notification-dlg span.text").text(
						"Items from different Warehouses selected.");
				notificationDlg.dialog("open");
			} else{
				poOrderDetailsDlg.dialog("open");
				Object.values(inventory_items_selected).forEach(function(item){
					 if(item["reorderPoint"] - item["inStock"] > 0) {
						var poitem = {};
				    	poitem["pcat"] = item["pcat"];
				    	poitem["pmake"] = item["pmake"];
				    	poitem["pdetail"] = item["pdetail"];
				    	
				    	poitem["pquant"] = item["inStock"] - item["reorderPoint"] < 0 ? Math.abs(item["inStock"] - item["reorderPoint"]): 0;

				    	$("#po-warehouse-info-select").val(item["whouse"]).change();
						$("#po-create-grid").jsGrid("insertItem", poitem);	
					}
				});
				$("#po-create-grid").jsGrid("reset");
			}

		}
	} else {
		poOrderDetailsDlg.dialog("open");
		var rows = alasql("select stock.id as pstockid, stock.cstock as cstock, stock.cstock_type as cstock_type, products.id as prodid, stock.whouse as whouse, stock.balance as qty, products.code as code, " +
				"products.category as category, products.detail as detail, products.make as make, products.price as price, products.unit as unit" +
				" from products JOIN stock ON products.id=stock.item where stock.id = " + Number(itemId));
		if(rows!=undefined && rows.length != 0) {
			var item = rows[0];
			var poitem = {};
	    	poitem["pcat"] = item["category"];
	    	poitem["pmake"] = item["make"];
	    	poitem["pdetail"] = item["detail"];
	    	poitem.inWarehouse = item["qty"];
	    	poitem.reorderPoint = item["cstock"];
	    	poitem.reservedForIssue = getReservedQty(item.whouse, item.prodid);
	    	poitem.inStock = poitem.inWarehouse - poitem.reservedForIssue;
	    	poitem["pquant"] = poitem["inStock"] - poitem["reorderPoint"] < 0 ? Math.abs(poitem["inStock"] - poitem["reorderPoint"]): 0;
	    	$("#po-warehouse-info-select").val(item["whouse"]).change();
			$("#po-create-grid").jsGrid("insertItem", poitem);	
		}
		$("#po-create-grid").jsGrid("reset");
	}
}

function refreshPOButtons() {
	if(Object.keys(po_items_inserted).length == 0) {
		$("#po-create-btn").prop("disabled", true);
		$("#po-cancel-btn").prop("disabled", true);
	} else {
		$("#po-create-btn").prop("disabled", false);
		$("#po-cancel-btn").prop("disabled", false);
	}
}

$("#po-cancel-btn").click(function(event){
	po_max_insert_id=0;
	po_items_inserted = {};
	refreshPOButtons();
	refreshPOGrids();
	$("#po-vendor-info-select").val(0);
	$("#po-warehouse-info-select").val(0);
	poOrderDetailsDlg.dialog("close");
});

$("#po-create-btn").click(function(event){
	console.log(po_items_inserted);
	if(Object.keys(po_items_inserted).length==0){
		alert("PO cannot be created.");
	}
	createPO(po_items_inserted);
	refreshPOGrids();
	po_max_insert_id=0;
	po_items_inserted = {};
	$("#po-vendor-info-select").val(0);
	$("#po-vendor-info div.panel-body").hide();
	$("#po-warehouse-info-select").val(0);
	$("#po-warehouse-info div.panel-body").hide();
	poOrderDetailsDlg.dialog("close");
});

function createPO(po_items_inserted, stopmsg) {
	console.log(po_items_inserted)
	if(Object.keys(po_items_inserted).length > 0) {
		var row = po_items_inserted[Object.keys(po_items_inserted)[0]];
		console.log(row)
		var status = row["status"];
		var pvendor = row["pvendor"];
		var pwarehouse = row["pwarehouse"];
		
		var orderQuery = "select max(id) as id from porders";
		var orders = alasql(orderQuery);
		var orderId = 0;
		if(orders.length != 0 && orders[0].id !=undefined) orderId = orders[0].id;
		orderId++;
		var values = [];
		values.push(orderId);
		values.push("'PO-0000"+orderId+"'");
		values.push(pvendor==0 ? $("#po-vendor-info-select").val():pvendor);
		values.push(pwarehouse);
		values.push(Number(status));
		var date = (new Date()).toLocaleString();
		values.push("'" + date + "'");
		values.push("''");
		values.push("''");
		values.push(getUserId());
		var orderInsert = "INSERT INTO porders VALUES (" + values.join(",") + ")";
		console.log(orderInsert)
		alasql(orderInsert);

		// order revision;
		insertOrderRevision("PO-0000"+orderId, "PURCHASE", "--", "STATUS", "--", "NEW ORDER", date);
		
		// order-items
		var poitems = alasql("select max(id) as id from poitems");
		var poitemId = 0;
		if(poitems.length != 0 && poitems[0].id !=undefined) poitemId = poitems[0].id;
		Object.values(po_items_inserted).forEach(function(item){
			poitemId++;
			var values = [];
			values.push(poitemId);
			values.push("'PO-0000"+orderId+"'");
			values.push(item["pid"]);
			values.push("'" + item["pcode"] + "'");
			values.push(item["pcat"]);
			values.push(item["pmake"]);
			values.push("'" + item["pdetail"] + "'");
			values.push(item["pquant"]);
			values.push(16); // status
			values.push(0); // received
			values.push("'" + date + "'");
			values.push(0);
			values.push(getUserId());
			var poitemInsert = "INSERT INTO poitems VALUES (" + values.join(",") + ")";
			console.log(poitemInsert)
			alasql(poitemInsert);
			
			// order revision;
			insertOrderRevision("PO-0000"+orderId, "PURCHASE", item["pcode"], "QTY", "--", item["pquant"], date);
			insertOrderRevision("PO-0000"+orderId, "PURCHASE", item["pcode"], "STATUS", "--", global_status_map[16], date);
			insertOrderRevision("PO-0000"+orderId, "PURCHASE", item["pcode"], "RECEIVED", "--", 0, date);
			insertOrderRevision("PO-0000"+orderId, "PURCHASE", item["pcode"], "QUOTE PRICE", "--", 0, date);
		});
		if(!stopmsg) {
			toastr.clear();
			toastr.success('PO created successfully.');	
		}
		refreshInventoryGridFilter();
	}
}