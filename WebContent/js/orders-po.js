var poOrderDetailsDlg = $("#po-order-details-dlg").dialog({
    autoOpen: false,
    width: 400,
    modal: true,
    closeOnEscape: true,
    buttons: {
        Ok: function() {
            $(this).dialog("close");
        }
    },
	open: function(event) {

		$('.ui-dialog-buttonpane').find('button:contains("Ok")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-default');
	 }
});

var od_dlg_po_item = [];
function openPODetails(poid) {
	console.log(poid)
	var rows = alasql("select * from porders where id = " + Number(poid));
	var ponumber = rows[0].poid;
	var vendorId = rows[0].vendor;
	var whouseId = rows[0].warehouse;
	var status = rows[0].status;

	console.log(rows[0]);
	$("#od-dlg-status").attr("class", "");
	$("#od-dlg-type").attr("class", "");
	$("#od-dlg-status").text("")
	$("#od-dlg-type").text("Purchase");
	$("#od-dlg-type").addClass("label label-primary");

	getStatusLOV("ORDER").forEach(function(lov) {
		if (lov.id === status) {
			if (status === 1) {
				$("#od-dlg-status").addClass("label label-success");
				$("#od-dlg-status").text(lov.text);
			} else if (status === 2) {
				$("#od-dlg-status").addClass("label label-default");
				$("#od-dlg-status").text(lov.text);
			} else if (status === 3) {
				$("#od-dlg-status").addClass("label label-info");
				$("#od-dlg-status").text(lov.text);
			} else if (status === 4) {
				$("#od-dlg-status").addClass("label label-primary");
				$("#od-dlg-status").text(lov.text);
			} else if (status === 5) {
				$("#od-dlg-status").addClass("label label-danger");
				$("#od-dlg-status").text(lov.text);
			} else if (status === 6) {
				$("#od-dlg-status").addClass("label label-warning");
				$("#od-dlg-status").text(lov.text);
			}
		}
	});

	var oddate = rows[0].lastupdate;
	$("#od-dlg-lastupdate").text(oddate);

	var whouse = getWarehouseById(Number(whouseId));
	$("#po-whouse-dlg-name").text(whouse["name"]);
	$("#po-whouse-dlg-address").text(whouse["address"]);
	$("#po-whouse-dlg-tel").text(whouse["tel"]);

	var vendor = getVendorById(Number(vendorId));
	$("#po-vendor-dlg-code").text(vendor["CODE"]);
	$("#po-vendor-dlg-name").text(vendor["NAME"]);
	$("#po-vendor-dlg-address").text(vendor["Address"]);
	$("#po-vendor-dlg-tel").text(vendor["TEL"]);
	$("#po-vendor-dlg-email").text(vendor["Email"]);

	var selectQry = "select * from poitems where poid='" + ponumber + "'";
	console.log(selectQry)
	var poitems = alasql(selectQry);

	od_dlg_po_item = [];
	if (poitems != undefined && poitems.length > 0) {
		poitems.forEach(function(poitem) {
			var item = {};
			item.pcode = poitem.pcode;
			item.pcat = poitem.pcat;
			item.pmake = poitem.pmake;
			item.pdetail = poitem.pdetail;
			item.qty = poitem.qty;
			item.status = poitem.status;
			item.receivedqty = poitem.received;
			od_dlg_po_item.push(item);
		});
	}
	console.log(od_dlg_po_item)
	poOrderDetailsDlg.dialog({
		minWidth : 1050
	});
	poOrderDetailsDlg.dialog("open");
	$("#po-dlg-items").jsGrid("reset");
	$("#po-dlg-items").jsGrid("render");
}



$("#po-dlg-items").jsGrid({
	width:"100%",
	filtering: false,
    editing: false,
    sorting: false,
    autoload: true,
    
    controller: {
    	loadData: function() {
    		return od_dlg_po_item;
    	},
    	
    },
    fields: [
        { name: "pcode", title: "PROD CODE", type: "text",},
        { name: "pcat", title: "CATEGORY", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text",},
        { name: "pmake", title: "MAKER", type: "select", items:getMakersLOV(), valueField: "id", textField: "text",},
        { name: "pdetail", title: "DETAIL", type: "text",},
        { name: "qty", title: "QTY", type: "text",},
        { name: "status", title: "STATUS", type: "select", items: getStatusLOV("ORDERITEM"), valueField: "id", textField: "text",
        	itemTemplate: function(value, item) {
        		var str = "";
        		this.items.forEach(function(r){
        			if(value == r.id) {
        				if(value == 7) { // NOT
        					str =  "<span style='font-weight:bold' class='label label-warning'>"+ r.text + "</span>";
        				} else if(value == 8) {
        					str =  "<span style='font-weight:bold' class='label label-info'>"+ r.text + "</span>";
        				} else if(value == 9) {
        					str =  "<span style='font-weight:bold' class='label label-primary'>"+ r.text + "</span>";
        				}
            		}
        		});
        		return str;
        	},	
        },
        
        { name: "receivedqty", title: "Received QTY", type: "text",},
       ]
});


function resetPOGrids() {
	$("#po-grid").jsGrid("loadData");
	$("#po-grid").jsGrid("reset");
}

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	  var target = $(e.target).attr("href") // activated tab
	  if(target=="#tabcontent-overview") {
			$("#orders-grid").jsGrid("render");
	  } else  if(target=="#tabcontent-purchase") {
		  $("#po-grid").jsGrid("render");
	  }
	});

$("#po-orders-grid").jsGrid({
        width: "100%",
        filtering: true,
        editing: true,
        sorting: true,
        autoload: true,
        
        rowClick: function(){
        	
        },
        
        onItemUpdated: function(args){
        	alasql("update orders set status =" + args.item.status + " where id =" + args.item.id + ";");
        	if(args.item.status === 2) {
        		toastr.clear();
        		toastr.success("Order sent to Vendor.")
        	}
        },
        
        controller: {
        	loadData: function() {
        		var porders = alasql("select * from porders order by id desc");

        		var data = [];
        		if(porders.length > 0 && porders[0].id!=undefined) {
        			porders.forEach(function(or){
        				var d = {};
        				d["id"] = or["id"];
        				d["onumber"] = or["poid"];
        				d["vendor"] = or["vendor"];
        				d["whouse"] = or["warehouse"];
        				d["status"] = or["status"];
        				d["lastupdate"] = or["lastupdate"];
        				data.push(d);
        			});
        		}
        		console.log(data)
        		return data;
        	},
        },
 
        fields: [
            { name: "onumber", title: "ORD. NUMBER", type: "text", editing: false,
            	itemTemplate: function(value, item) {
            		if(item!=undefined) {
                		return "<a href='#' onclick=openPODetails(" + item.id + ")>" + value + "</a>";
            		}
            	}
            },
            { name: "vendor", title: "VENDOR", type: "select", items: getVendorsLOV(), valueField: "id", textField: "text", editing: false,},
            { name: "whouse", title: "WAREHOUSE", type: "select", items: getWarehousesLOV(), valueField: "id", textField: "text", editing: false,},
            { name: "status", title: "STATUS", type: "select", items: getStatusLOV("ORDER"), valueField: "id", textField: "text",

            	itemTemplate: function(value, item) {
            		console.log(item)
            		var str = "";
            		this.items.forEach(function(r){
            			if(value == r.id) {

            				if(value == 1) {
            					str =  "<span style='font-weight:bold' class='label label-success'>"+ r.text + "</span>";
            				} else if(value == 2) {
            					str =  "<span style='font-weight:bold' class='label label-default'>"+ r.text + "</span>";
            				} else if(value == 3) {
            					str =  "<span style='font-weight:bold' class='label label-info'>"+ r.text + "</span>";
            				}
            				else if(value == 4) {
            					str =  "<span style='font-weight:bold' class='label label-primary'>"+ r.text + "</span>";
            				}
            				else if(value == 5) {
            					str =  "<span style='font-weight:bold' class='label label-danger'>"+ r.text + "</span>";
            				}
            				else if(value == 6) {
            					str =  "<span style='font-weight:bold' class='label label-warning'>"+ r.text + "</span>";
            				}
                		}
            		});
            		return str;
            	},
            	
            },
            { name: "lastupdate", title: "LAST UPDATE", type: "text", filtering: false, editing: false,},
            {type: "control",
            	deleteButton: false,
            	itemTemplate: function(value, item) {
            		/*if(item.status === 1 || item.status === 2 || item.status === 3 || item.status === 4) {
            			return this._createEditButton(item);
            		}
            		return "";*/
            		console.log(item)
            		return this._createEditButton(item);
            	}
            }
        ]
    });

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
