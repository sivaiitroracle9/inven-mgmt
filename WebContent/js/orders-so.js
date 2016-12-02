var soOrderDetailsDlg = $("#so-order-details-dlg").dialog({
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

		$('.ui-dialog-buttonpane').find('button:contains("Ok")')
			.removeClass("ui-button ui-corner-all ui-widget")
			.addClass('btn btn-default');
	 }
});

var od_dlg_so_item = [];
function openSODetails(soid) {
	console.log(soid)
	var rows = alasql("select * from sorders where id = " + Number(soid));
	var sonumber = rows[0].soid;
	var outletId = rows[0].outlet;
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
	$("#so-whouse-dlg-name").text(whouse["name"]);
	$("#so-whouse-dlg-address").text(whouse["address"]);
	$("#so-whouse-dlg-tel").text(whouse["tel"]);

	var outlet = getVendorById(Number(outletId));
	$("#so-outlet-dlg-code").text(outlet["code"]);
	$("#so-outlet-dlg-name").text(outlet["name"]);
	$("#so-outlet-dlg-address").text(outlet["address"]);
	$("#so-outlet-dlg-tel").text(outlet["tel"]);
	$("#so-outlet-dlg-email").text(outlet["email"]);

	var selectQry = "select * from soitems where soid='" + sonumber + "'";
	console.log(selectQry)
	var soitems = alasql(selectQry);

	od_dlg_so_item = [];
	if (soitems != undefined && soitems.length > 0) {
		soitems.forEach(function(soitem) {
			var item = {};
			item.pcode = soitem.pcode;
			item.pcat = soitem.pcat;
			item.pmake = soitem.pmake;
			item.pdetail = soitem.pdetail;
			item.qty = soitem.qty;
			item.status = soitem.status;
			item.receivedqty = soitem.received;
			od_dlg_so_item.push(item);
		});
	}
	console.log(od_dlg_so_item)
	soOrderDetailsDlg.dialog({
		minWidth : 1050
	});
	soOrderDetailsDlg.dialog("open");
	refreshSOGrids();
}

$("#so-dlg-items").jsGrid({
	width:"100%",
	filtering: false,
    editing: false,
    sorting: false,
    autoload: true,
    
    controller: {
    	loadData: function() {
    		return od_dlg_so_item;
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

$("#so-orders-grid").jsGrid({
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
        		var sorders = alasql("select * from sorders order by id desc");

        		var data = [];
        		if(sorders.length > 0 && sorders[0].id!=undefined) {
        			sorders.forEach(function(or){
        				var d = {};
        				d["id"] = or["id"];
        				d["onumber"] = or["soid"];
        				d["outlet"] = or["outlet"];
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
                		return "<a href='#' onclick=openSODetails(" + item.id + ")>" + value + "</a>";
            		}
            	}
            },
            { name: "whouse", title: "WAREHOUSE", type: "select", items: getWarehousesLOV(), valueField: "id", textField: "text", editing: false,},
            { name: "outlet", title: "OUTLET", type: "select", items: getVendorsLOV(), valueField: "id", textField: "text", editing: false,},
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
            		console.log(item)
            		return this._createEditButton(item);
            	}
            }
        ]
    });