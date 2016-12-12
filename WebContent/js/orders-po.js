var od_dlg_po_item = [];
var poOrderDetailsDlg = $("#po-order-details-dlg").dialog({
    autoOpen: false,
    width: 400,
    modal: true,
    closeOnEscape: true,
    title: "Purchase Order details",
    buttons: {
        Ok: function() {
            $(this).dialog("close");
        }
    },
	open: function(event) {
		$('.ui-dialog-buttonpane').find('button:contains("Ok")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-default');
	 },
	 close: function(event){
		 od_dlg_po_item = [];
	 }
});
$("#po-order-details-dlg").show();

function openPODetails(id) {

	
	console.log(id)
	var rows = alasql("select * from porders where id = " + Number(id));
	var ponumber = rows[0].poid;
	var vendorId = rows[0].vendor;
	var whouseId = rows[0].warehouse;
	var status = rows[0].status;
	
	$("#attached-po-quote").text("");
	$("#attached-po-invoice").text("");
	
	$("#po-quote-send-tovendor").attr("onclick", "sendToVendor('"+ponumber+"')");
	if(status >= 4) {
		$("#attached-po-quote").show();
	}
	
	if(status >=7 ) {
		$("#attached-po-invoice").show();
	}
	
	if(rows[0].poQuote!='') {
		$("#attached-po-quote")
			.attr("href", "data:text/csv;charset=utf-8,PROCUREMENT QUOTE DATA")
			.attr("download", rows[0].poQuote)
			.text(rows[0].poQuote);
	}
	
	if(rows[0].poInvoice!='') {
		$("#attached-po-invoice")
			.attr("href", "data:text/csv;charset=utf-8,PROCUREMENT QUOTE DATA")
			.attr("download", rows[0].poInvoice)
			.text(rows[0].poInvoice);
	}
	
	console.log(rows[0]);
	$("#od-dlg-status").attr("class", "");
	$("#od-dlg-type").attr("class", "");
	$("#od-dlg-status").text("")
	$("#od-dlg-type").text("Purchase");
	$("#od-dlg-type").addClass("label label-primary");

	getStatusLOV("PO").forEach(function(lov) {
		if (lov.id === status) {
			$("#od-dlg-status").addClass("label label-warning");
			$("#od-dlg-status").text(lov.text);
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
			item.poid = poitem.poid;
			item.pid = poitem.pid;
			item.pcode = poitem.pcode;
			item.pcat = poitem.pcat;
			item.pmake = poitem.pmake;
			item.pdetail = poitem.pdetail;
			item.qty = poitem.qty;
			item.status = poitem.status;
			item.receivedqty = poitem.received;
			item.qprice = poitem.qprice;
			od_dlg_po_item.push(item);
		});
	}
	console.log(od_dlg_po_item)
	
	toggleQuoteInDlg(status);
	togglePaymentInDlg(status);
	
	poOrderDetailsDlg.dialog({
		minWidth : 1050
	});
	poOrderDetailsDlg.dialog("open");
	refreshPOGrids();
}



$("#po-dlg-items").jsGrid({
	width:"100%",
	filtering: false,
    editing: true,
    sorting: false,
    autoload: true,
    rowClick: function(args){    },
    
    onItemUpdated: function(args){
    	console.log(args.item)
    	var date = (new Date()).toLocaleString();
    	var rows = alasql("select qprice from poitems where poid='" + args.item.poid + "' and pid=" + args.item.pid);
        if(rows && Number(rows[0].qprice) !== Number(args.item.qprice)) {
        	insertOrderRevision(args.item.poid, "PURCHASE", "--", "QUOTED PRICE", Number(rows[0].qprice), Number(args.item.qprice), date);	
        }
    	alasql("update poitems set qprice=" + Number(args.item.qprice) 
    				+ ", lastupdate='" + date + "', lastupdatedby=" + getUserId() 
    				+ " where poid='" + args.item.poid + "' and pid=" + args.item.pid);
    	
    	var porders = alasql("select status from porders where poid='"+args.item.poid+"'");
    	toggleQuoteInDlg(porders[0].status);
    },
    
    controller: {
    	loadData: function() {
    		return od_dlg_po_item;
    	},
    	
    },
    fields: [
        { name: "pcode", title: "PROD CODE", type: "text",editing: false,},
        { name: "pcat", title: "CATEGORY", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text",editing: false,},
        { name: "pmake", title: "MAKER", type: "select", items:getMakersLOV(), valueField: "id", textField: "text",editing: false,},
        { name: "pdetail", title: "DETAIL", type: "text",editing: false,},
        { name: "qty", title: "ORDERED QTY", type: "text", width:80,editing: false,},
        { name: "receivedqty", title: "Received QTY", type: "text",width:80,editing: false,},
        { name: "status", title: "STATUS", type: "select", items: getStatusLOV("POITEM"), valueField: "id", textField: "text",editing: false,
        	itemTemplate: function(value, item) {
        		var str = "";
        		this.items.forEach(function(r){
        			if(value == r.id) {
        				if(value == 16) { // NOT
        					str =  "<span style='font-weight:bold' class='label label-warning'>"+ r.text + "</span>";
        				} else if(value == 17) {
        					str =  "<span style='font-weight:bold' class='label label-default'>"+ r.text + "</span>";
        				} else if(value == 18) {
        					str =  "<span style='font-weight:bold' class='label label-primary'>"+ r.text + "</span>";
        				}
            		}
        		});
        		return str;
        	},	
        },
        {name:"qprice", title:"Quoted PIRCE (UNIT)", type: "number", width:80,
        	itemTemplate: function(value, item){
        		if(value === 0) return "<span class='po-dlg-items-qprice'>--</span>";
        		return "<span class='po-dlg-items-qprice'>" + value + "</span>";;
        	}
        },
        {type: "control",
        	deleteButton: false,
        	itemTemplate: function(value, item) {
        		if(Number(item.status) != 4 && Number(item.status) != 5 && Number(item.qprice)===0)
        			return this._createEditButton(item);
        	}
        }
       ]
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
    		var date = (new Date()).toLocaleString();
        	var rows = alasql("select status from porders where id = " + args.item.id + ";");
        	if(rows && Number(rows[0].status) !== Number(args.item.status)) {
        		insertOrderRevision(args.item.onumber, "PURCHASE", "--", "STATUS", 
        				global_status_map[Number(rows[0].status)], 
        				global_status_map[Number(args.item.status)], 
        				date);	
        	}
        	console.log(args)
        	var q = "update porders set status =" + Number(args.item.status) 
        				+ ", lastupdate='" + date + "', lastupdatedby=" + getUserId() 
        				+ " where id =" + args.item.id + ";";
        	alasql(q);
        },
        
        controller: {
        	loadData: function(filter) {
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
        				d["lastupdatedby"] = getUserDetailString(or["lastupdatedby"]);
        				data.push(d);
        			});
        		}
        		
            	var filtered = $.grep(data, function(so) {
                    return (!filter["onumber"] || so["onumber"].indexOf(filter["onumber"])) 
                    	&& (!filter["vendor"] || so["vendor"]==filter["vendor"])
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
                		return "<a href='#' onclick=openPODetails(" + item.id + ")>" + value + "</a>";
            		}
            	},
            	editTemplate: function(value, item) {
            		if(item!=undefined) {
                		return "<a href='#' onclick=openPODetails(" + item.id + ")>" + value + "</a>";
            		}
            	}
            },
            { name: "vendor", title: "VENDOR", type: "select", items: getVendorsLOV(), valueField: "id", textField: "text", editing: false, align:"center",},
            { name: "whouse", title: "WAREHOUSE", type: "select", items: getWarehousesLOV(), valueField: "id", textField: "text", editing: false, align:"center",},
            { name: "status", title: "STATUS", type: "select", items: getStatusLOV("PO"), valueField: "id", textField: "text", align:"center",
            	
            	itemTemplate: function(value, item){
            		var str = "";
            		getStatusLOV("PO").forEach(function(stl){
            			if(stl.id == value) {
            				if(value == 1) str = "<span class='label label-success'>" + stl.text + "</span>";
            				else if(value == 2) str = "<span class='label label-success'>" + stl.text + "</span>";
            				else if(value == 3) str = "<span class='label label-warning'>" + stl.text + "</span>";
            				else if(value == 4) str = "<span class='label label-default'>" + stl.text + "</span>";
            				else if(value == 5) str = "<span class='label label-default'>" + stl.text + "</span>";
            				else if(value == 6) str = "<span class='label label-primary'>" + stl.text + "</span>";
            				else if(value == 7) str = "<span class='label label-info'>" + stl.text + "</span>";
            				else if(value == 8) str = "<span class='label label-danger'>" + stl.text + "</span>";
            			}
            		});
            		return str;
            	},
            	
            	editTemplate: function(value, item){
            		var $select = $("<select>");
            		getStatusLOV("PO").forEach(function(stl){
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
            {type: "control", align:"center",
            	deleteButton: false,
            	itemTemplate: function(value, item) {
            		if((Number(item.status) == 1 || Number(item.status) == 7) && getPermission("orders-po-edit"))
            			return this._createEditButton(item);
            	}
            }
        ]
    });

function poUpdatePayment() {
	var data = $("#po-dlg-items").data("JSGrid").data;
	if(data.length > 0 && $("#invoice-input").prop('files').length!=0) {
		var invoiceFile = $("#invoice-input").prop('files')[0].name;
		var date = (new Date()).toLocaleString();
		insertOrderRevision(data[0].poid, "PURCHASE", "--", "PO INVOICE", "--", "Attached: " + invoiceFile, date);
		var q = "UPDATE porders set status=7, poInvoice='" + invoiceFile 
						+ "', lastupdate='" + date + "', lastupdatedby=" 
						+ getUserId() + " where poid='" + data[0].poid + "'";
		alasql(q);
		refreshPOGrids();
		poOrderDetailsDlg.dialog("close");
		openPODetails(data[0].id)
	}
}

function sendToVendor(poid) {
	if($("#poQuote-input").prop('files').length!=0) {
		var quoteFile = $("#poQuote-input").prop('files')[0].name;
		var date = (new Date()).toLocaleString();
		insertOrderRevision(poid, "PURCHASE", "--", "PO QUOTE", "--", "Attached: " + quoteFile, date);
		var q = "UPDATE porders set status=4, poQuote='" + quoteFile + "', lastupdate='" 
						+ date + "', lastupdatedby=" + getUserId() + " where poid='" + poid + "'";
		alasql(q);
		refreshPOGrids();
		poOrderDetailsDlg.dialog("close");
		q = "select id from porders where poid='" + poid + "'";
		var row = alasql(q);
		openPODetails(row[0].id)
	}
}

function toggleQuoteInDlg(status) {
	if(status == 2) {
		$("#poQuote-input").prop("disabled", false);
		if(qpriceSet()) {
			$("#po-quote-send-tovendor").prop("disabled", false);	
		}	
	} else {
		$("#poQuote-input").prop("disabled", true);
		$("#po-quote-send-tovendor").prop("disabled", true);
	}
}

function togglePaymentInDlg(status) {
	if(status == 6) {
		$("#invoice-input").prop("disabled", false);
		$("#update-payment").prop("disabled", false);	
	} else {
		$("#invoice-input").prop("disabled", true);
		$("#update-payment").prop("disabled", true);
	}
}


function qpriceSet() {
	var set = true;
	if(od_dlg_po_item.length!=0){
		od_dlg_po_item.forEach(function(i){
			if(i.qprice == 0) {
				set = false;
			}
		})
	}
	return set;
}