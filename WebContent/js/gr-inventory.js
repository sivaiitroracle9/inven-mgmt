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
	var date = (new Date()).toLocaleString();
	if(Object.keys(gi_orderid_po_update_items).length > 0) {
		
		var orderId = Object.values(gi_orderid_po_update_items)[0].poid;
		Object.values(gi_orderid_po_update_items).forEach(function(upitem){
			console.log(upitem)
			
    		var rows = alasql("select pid, qty, received, status, qprice from poitems where id = " + upitem.id);
			var qprice = rows[0].qprice;
			var qty = rows[0].qty;
    		var received = rows[0].received + Number(upitem.receivedQty);
    		// record revision
    		insertOrderRevision(upitem.poid, "PURCHASE", upitem.pcode, "RECEIVED", rows[0].received, received, date);
    		
    		var status = 0;
    		if(received == 0) status = 16; // NOT RECEIVED
    		else if(qty > received) status = 17;
    		else status = 18;
    		alasql("update poitems set received=" + received + ", status=" + status + ", lastupdate='" + date + "', lastupdatedby=" + getUserId() 
        				+ " where id = " + upitem.id);
    		if(rows[0].status!==status)
    			insertOrderRevision(upitem.poid, "PURCHASE", upitem.pcode, "STATUS", global_status_map[rows[0].status], global_status_map[status], date);
    		
    		// inbound-items
    		var ibitem = getNextInsertId("inbound");
    		var query = "INSERT INTO inbound VALUES("+ ibitem + ",'" + upitem.poid +"'," + upitem.id +"," + Number(upitem.receivedQty) +",'" + getOnlyDate(date) + "')";
    		console.log(query)
    		alasql(query);
    		
    		// stock balance change.
			var currOrders = alasql("select * from porders where poid='" + upitem.poid +"'");
    		var currProduct = alasql("select * from products where code='" + upitem.pcode +"'");
    		var currstock = alasql("select * from stock where item="+currProduct[0].id+" and whouse="+currOrders[0].warehouse);
    		if(currstock==undefined || currstock.length==0) {
    			var nextID = 0;
    			var stocks = alasql("select max(id) as id from stock");
    			if(stocks.length != 0) nextID = stocks[0].id;
    			nextID++;
    			
    			alasql("INSERT into stock VALUES(" + nextID + "," + currProduct[0].id + "," + currOrders[0].warehouse + "," + Number(upitem.receivedQty) + ",0,0,0," + Number(qprice) + ")");
    			setStockHistory(nextID, Number(upitem.receivedQty), date);
    		} else {
    			var newavgprice = ((currstock[0].balance)*(currstock[0].price)) + (Number(upitem.receivedQty) * Number(qprice));
    			var newbalance = (currstock[0].balance + Number(upitem.receivedQty));
    			newavgprice = newavgprice/newbalance;
    			alasql("UPDATE stock set balance=" + newbalance + ", price=" + newavgprice + " where item="+currProduct[0].id+" and whouse="+currOrders[0].warehouse);
    			setStockHistory(currstock[0].id, newbalance, date);
    		}
    		
		});
		
		// order status change
		var oitemsQty = alasql("select SUM(qty) as qty, SUM(received) as received from poitems where poid='" + orderId +"'");
		var porder = alasql("select status from porders where poid='" + orderId +"'");
		console.log(oitemsQty)
		if(oitemsQty!=undefined && oitemsQty.length > 0) {
			var orderStatus = 4;
			if(oitemsQty[0].received != 0 && oitemsQty[0].qty > oitemsQty[0].received) {
				orderStatus = 5;
			} else if(oitemsQty[0].qty === oitemsQty[0].received){
				orderStatus = 6;
			}
			if(porder.status != orderStatus) {
				alasql("update porders set status=" + orderStatus + ", lastupdate='" + date + "', lastupdatedby=" + getUserId() 
        				+ " where poid = '" + orderId + "'");
	    		insertOrderRevision(orderId, "PURCHASE", "--", "STATUS", global_status_map[porder[0].status], global_status_map[orderStatus], date);	
			}
		}
		gi_orderid_po_update_items = {};
		$("#goodsreceive-orderid-update-btn").prop("disabled", true);
		loadOrderWithItems(orderId);
	}
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
        { name: "toReceiveQty", title: "TO RECEIVE QTY", type: "text", editing:false, filtering: false,
        	itemTemplate: function(value, item) {
        		if(value == 0) return "--";
        		else return value;
        	}
        },   
        
        { name: "receivedQty", title: "Received QTY", type: "text",filtering: false, 
        	itemTemplate: function(value, item) {
        		if(value == 0 && item.toReceiveQty == 0) return "--";
        		else return value;
        	}
        },
        
        { type: "control",
          deleteButton: false,
          itemTemplate: function(value, item) {
        	  if(item.toReceiveQty != 0) return this._createEditButton(item);
        	  else {
        		  //TODO make editing false in the grid.
        		  return "<span style='font-weight:bold' class='label label-success'>FULFILLED</span>";;
        	  }
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
	
	var orders = alasql("select id, status, warehouse, vendor from porders where poid='" + poid + "'");

	gi_orderid_po_items = [];
	if(orders!= undefined && orders.length > 0 && orders[0].id !=undefined) {
		//if(orders[0].status === 2 || orders[0].status === 3 || orders[0].status === 4) {
			var selectQry = "select * from poitems where poid='" + poid + "'";

			var oitems = alasql(selectQry);
			
			if(oitems!=undefined && oitems.length > 0) {
				oitems.forEach(function(oitem){
					var item = {};
					item.id = oitem.id;
					item.poid = oitem.poid;
					item.whouse = orders[0].warehouse;
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
			
			$("#goodsreceive-whouse").text(getWarehouseById(orders[0].warehouse).name);
			$("#goodsreceive-vendor").text(getVendorById(orders[0].vendor).NAME);
		/*} else {
			toastr.clear();
			toastr.warning("Order already Not Open/Closed/Cancelled.");
		}*/

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
