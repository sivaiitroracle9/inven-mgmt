var gi_orderid_po_items = [];

var gi_orderid_po_update_items = {};
$('input#goodsreceive-orderid').keypress(function (e) {
	  if (e.which == 13) {
		  loadOrderWithItems($('input#goodsreceive-orderid').val());
		  
		  gi_orderid_po_update_items = {};
		  $("#goodsreceive-orderid-update-btn").prop("disabled", true);
	  }
});

$("#goodsreceive-orderid-update-btn").click(function(){
	if(Object.keys(gi_orderid_po_update_items).length > 0) {
		Object.values(gi_orderid_po_update_items).forEach(function(upitem){
			console.log(upitem)
			
    		var rows = alasql("select qty, received from oitems where id = " + upitem.id);
    		var qty = rows[0].qty;
    		var received = rows[0].received + Number(upitem.receivedQty);
    		var status = 0;
    		if(received == 0) status = 7;
    		else if(qty > received) status = 8;
    		else status = 9;
    		alasql("update oitems set received=" + received + ", status=" + status + " where id = " + upitem.id);
    		
    		// order status change
    		var oitemsQty = alasql("select SUM(qty) as qty, SUM(received) as received from oitems where oid='" + upitem.oid +"'");
    		console.log(oitemsQty)
    		
    		if(oitemsQty!=undefined && oitemsQty.length > 0 && oitemsQty[0].received!=0 && oitemsQty[0].qty > oitemsQty[0].received) {
    			status = 3;
    			alasql("update orders set status=" + status + " where oid = '" + upitem.oid + "'");
    		}
    		
    		if(oitemsQty!=undefined && oitemsQty.length > 0 && oitemsQty[0].received !== 0 && oitemsQty[0].qty === oitemsQty[0].received) {
    			status = 4;
    			alasql("update orders set status=" + status + " where oid = '" + upitem.oid + "'");
    		}
    		
    		// stock balance change.
			var currOrders = alasql("select * from orders where oid='" + upitem.oid +"'");
    		var currProduct = alasql("select * from products where code='" + upitem.pcode +"'");
    		var currstock = alasql("select * from stock where item="+currProduct[0].id+" and whouse="+currOrders[0].whouse);
    		if(currstock==undefined || currstock.length==0) {
    			var nextID = 0;
    			var stocks = alasql("select max(id) as id from stock");
    			if(stocks.length != 0) nextID = stocks[0].id;
    			nextID++;
    			
    			alasql("INSERT into stock VALUES(" + nextID + "," + currProduct[0].id + "," + currOrders[0].whouse + "," + Number(upitem.receivedQty) + ")");
    		} else {
    			alasql("UPDATE stock set balance=" + (currstock[0].balance + Number(upitem.receivedQty)) + " where item="+currProduct[0].id+" and whouse="+currOrders[0].whouse);
    		}
		});
	}
	
	  gi_orderid_po_update_items = {};
	  $("#goodsreceive-orderid-update-btn").prop("disabled", true);
	  loadOrderWithItems($('input#goodsreceive-orderid').val());
});


$("#gr-po-items").jsGrid({
	width:"100%",
	filtering: true,
    editing: true,
    sorting: false,
    autoload: true,
    
    controller: {
    	loadData: function() {
    		return gi_orderid_po_items;
    	},
    	
    	updateItem: function(item) {
    		gi_orderid_po_update_items[item.id] = item;
    		if(Object.keys(gi_orderid_po_update_items).length > 0) $("#goodsreceive-orderid-update-btn").prop("disabled", false);
    	}
    },
    fields: [
        { name: "pcode", title: "PROD CODE", type: "text", editing:false},
        { name: "pcat", title: "CATEGORY", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text", filtering: false, editing:false},
        { name: "pmake", title: "MAKER", type: "select", items:getMakersLOV(), valueField: "id", textField: "text", filtering: false, editing:false},
        { name: "pdetail", title: "DETAIL", type: "text",editing:false},
        { name: "toReceiveQty", title: "TO RECEIVE QTY", type: "text", editing:false, filtering: false},   
        { name: "receivedQty", title: "Received QTY", type: "text",filtering: false},
        { type: "control",
          deleteButton: false,
          itemTemplate: function(value, item) {
        	  if(item.toReceiveQty !== 0) return this._createEditButton(item);
        	  return "";
          }
        },
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


function loadOrderWithItems(poid) {
	
	var orders = alasql("select id, status, whouse, vendor from orders where oid='" + poid + "'");

	gi_orderid_po_items = [];
	if(orders!= undefined && orders.length > 0 && orders[0].id !=undefined) {
		if(orders[0].status === 2 || orders[0].status === 3 || orders[0].status === 4) {
			var selectQry = "select * from oitems where oid='" + poid + "'";

			var oitems = alasql(selectQry);
			
			if(oitems!=undefined && oitems.length > 0) {
				oitems.forEach(function(oitem){
					var item = {};
					item.id = oitem.id;
					item.oid = oitem.oid;
					item.whouse = orders[0].whouse;
					item.vendor = orders[0].vendor;
					item.pcode = oitem.pcode;
					item.pcat = oitem.pcat;
					item.pmake = oitem.pmake;
					item.pdetail = oitem.pdetail;
					item.toReceiveQty = oitem.qty - oitem.received;
					item.receivedQty = 0;
					gi_orderid_po_items.push(item);
				});
			}
			
			$("#goodsreceive-whouse").text(getWarehouseById(orders[0].whouse).name);
			$("#goodsreceive-vendor").text(getVendorById(orders[0].vendor).NAME);
		} else {
			toastr.clear();
			toastr.warning("Order already Not Open/Closed/Cancelled.");
		}

	} else {
		toastr.clear();
		toastr.info("No such order.");
	}

	$("#gr-po-items").jsGrid("reset");
	$("#gr-po-items").jsGrid("render");
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