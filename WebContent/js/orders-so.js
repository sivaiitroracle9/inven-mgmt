var soOrderDetailsDlg = $("#so-order-details-dlg").dialog({
    autoOpen: false,
    width: 400,
    modal: true,
    title: "Sales order details.",
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
	$("#so-dlg-type").text("Sales");
	$("#so-dlg-lastupdate").text(rows[0].lastupdate);
	getStatusLOV("SO").forEach(function(lov) {
		if (lov.id === status) {
			$("#so-dlg-status").text(lov.text);
		}
	});

	var oddate = rows[0].lastupdate;
	$("#od-dlg-lastupdate").text(oddate);

	var whouse = getWarehouseById(Number(whouseId));
	$("#so-whouse-dlg-name").text(whouse["name"]);
	$("#so-whouse-dlg-address").text(whouse["address"]);
	$("#so-whouse-dlg-tel").text(whouse["tel"]);
	$("#so-whouse-dlg-email").text(whouse["email"]);

	var outlet = getOutletById(Number(outletId));
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
			item.pid = soitem.pid;
			item.pcode = soitem.pcode;
			item.pcat = soitem.pcat;
			item.pmake = soitem.pmake;
			item.pdetail = soitem.pdetail;
			item.qty = soitem.qty;
			item.status = soitem.status;
			item.issuedQty = soitem.issued;
			item.toissueQty = soitem.qty - soitem.issued;
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
        { name: "pimg", title: "", type: "text",
        	itemTemplate: function(value, item){
        		if(item!= undefined && item.pid!=undefined) {
        			return "<img src='img/"+ item.pid + ".jpg' style='width:40px;height:40px'>";
        		}
        	}
        },
        { name: "pcode", title: "PROD CODE", type: "text",},
        { name: "pcat", title: "CATEGORY", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text",},
        { name: "pmake", title: "MAKER", type: "select", items:getMakersLOV(), valueField: "id", textField: "text",},
        { name: "pdetail", title: "DETAIL", type: "text",},
        { name: "qty", title: "ORDERED. QTY", type: "number",},        
        { name: "issuedQty", title: "ISSUED QTY", type: "number",},
        { name: "toissueQty", title: "BALANCE TO ISSUE", type: "number", width:100},
        { name: "status", title: "STATUS", type: "select", items: getStatusLOV("SOITEM"), valueField: "id", textField: "text",
        	itemTemplate: function(value, item) {
        		var str = "";
        		this.items.forEach(function(r){
        			if(value == r.id) {
        				if(value == 19) { // NOT
        					str =  "<span style='font-weight:bold' class='label label-warning'>"+ r.text + "</span>";
        				} else if(value == 20) {
        					str =  "<span style='font-weight:bold' class='label label-default'>"+ r.text + "</span>";
        				} else if(value == 21) {
        					str =  "<span style='font-weight:bold' class='label label-primary'>"+ r.text + "</span>";
        				}
            		}
        		});
        		return str;
        	},	
        },
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
    		var date = (new Date()).toLocaleString();
        	var rows = alasql("select status from sorders where id = " + args.item.id + ";");
        	if(rows && Number(rows[0].status) !== Number(args.item.status)) {
        		insertOrderRevision(args.item.onumber, "SALES", "--", "STATUS", 
        				global_status_map[Number(rows[0].status)], global_status_map[Number(args.item.status)], date);	
        	}
        	console.log(args)
        	var q = "update sorders set status =" + Number(args.item.status) + ", lastupdate='" + date + "', lastupdatedby=" + getUserId() 
        				+ " where id =" + args.item.id + ";";
        	alasql(q);
        },
        
        controller: {
        	loadData: function(filter) {
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
        				d["lastupdatedby"] = getUserDetailString(or["lastupdatedby"]);
        				data.push(d);
        			});
        		}
        		
            	var filtered = $.grep(data, function(so) {
                    return (!filter["onumber"] || so["onumber"].indexOf(filter["onumber"])) 
                    	&& (!filter["outlet"] || so["outlet"]==filter["outlet"])
                    	&& (!filter["whouse"] || so["whouse"]==filter["whouse"])
                    	&& (!filter["status"] || so["status"]==filter["status"])
                    	&& (!filter["lastupdate"] || so["lastupdate"].indexOf(filter["lastupdate"]))
                    	&& (!filter["lastupdatedby"] || so["lastupdatedby"].indexOf(filter["lastupdatedby"]));
            	});
        		
        		return filtered;
        	},
        },
 
        fields: [
            { name: "onumber", title: "ORD. NUMBER", type: "text", editing: false, align:"center",
            	itemTemplate: function(value, item) {
            		if(item!=undefined) {
                		return "<a href='#' onclick=openSODetails(" + item.id + ")>" + value + "</a>";
            		}
            	},
            	editTemplate: function(value, item) {
            		if(item!=undefined) {
                		return "<a href='#' onclick=openSODetails(" + item.id + ")>" + value + "</a>";
            		}
            	}
            },
            { name: "whouse", title: "WAREHOUSE", type: "select", items: getWarehousesLOV(), valueField: "id", textField: "text", editing: false, align:"center",},
            { name: "outlet", title: "OUTLET", type: "select", items: getOutletsLOV(), valueField: "id", textField: "text", editing: false, align:"center",},
            { name: "status", title: "STATUS", type: "select", items: getStatusLOV("SO"), valueField: "id", textField: "text", align:"center",

            	itemTemplate: function(value, item){
            		var str = "";
            		getStatusLOV("SO").forEach(function(stl){
            			if(stl.id == value) {
            				if(value == 9) str = "<span class='label label-success'>" + stl.text + "</span>";
            				else if(value == 10) str = "<span class='label label-success'>" + stl.text + "</span>";
            				else if(value == 11) str = "<span class='label label-warning'>" + stl.text + "</span>";
            				else if(value == 12) str = "<span class='label label-default'>" + stl.text + "</span>";
            				else if(value == 13) str = "<span class='label label-default'>" + stl.text + "</span>";
            				else if(value == 14) str = "<span class='label label-primary'>" + stl.text + "</span>";
            				else if(value == 15) str = "<span class='label label-danger'>" + stl.text + "</span>";
            			}
            		});
            		return str;
            	},
            	
            	editTemplate: function(value, item){
            		var $select = $("<select>");
            		getStatusLOV("SO").forEach(function(stl){
            			if(stl.id === value) {
                    		$("<option selected>").val(stl.id).text(stl.text).appendTo($select);
            			} else if(stl.parent === value) {
        	         		$("<option>").val(stl.id).text(stl.text).appendTo($select);
            			}
            		});
            		this._selectPicker = $select;
            		return $select;
            	},
            	
            	editValue: function(args){
            		console.log(this._selectPicker.val())
            		return Number(this._selectPicker.val());
            	}
            	
            },
            { name: "lastupdate", title: "LAST UPDATE", type: "text", editing: false, align:"center",},
            { name: "lastupdatedby", title: "LAST UPDATED BY", type: "text", editing: false, align:"center",},
            {type: "control",
            	deleteButton: false,
            	itemTemplate: function(value, item) {
            		if((item.status === 9 || item.status === 14) && getPermission("orders-so-edit")) {
                		return this._createEditButton(item);	
            		}
            	}
            }
        ]
    });