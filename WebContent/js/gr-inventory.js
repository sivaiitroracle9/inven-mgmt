var gi_orderid_po_items = [];
var gi_orderid_po_update_items = {};
$('input#goodsissue-orderid').keypress(function (e) {
	  if (e.which == 13) {
		  loadOrderWithItems($('input#goodsissue-orderid').val());
		  
		  gi_orderid_po_update_items = {};
		  $("#goodsissue-orderid-update-btn").prop("disabled", true);
	  }
});

$("#goodsissue-orderid-update-btn").click(function(){
	if(Object.keys(gi_orderid_po_update_items).length > 0) {
		Object.values(gi_orderid_po_update_items).forEach(function(upitem){
			console.log(upitem)
    		var rows = alasql("select qty, received from oitems where id = " + upitem.id);
    		var qty = rows[0].qty;
    		var received = rows[0].received + Number(upitem.receivedQty);
    		var status = 0;
    		if(received == 0) status = 6;
    		else if(qty > received) status = 7;
    		else status = 8;
    		alasql("update oitems set received=" + received + ", status=" + status + " where id = " + upitem.id);
		});
	}
	
	  gi_orderid_po_update_items = {};
	  $("#goodsissue-orderid-update-btn").prop("disabled", true);
	  loadOrderWithItems($('input#goodsissue-orderid').val());
})

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
    		if(Object.keys(gi_orderid_po_update_items).length > 0) $("#goodsissue-orderid-update-btn").prop("disabled", false);
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
	
	var orders = alasql("select id, status from orders where oid='" + poid + "'");

	gi_orderid_po_items = [];
	if(orders!= undefined && orders.length > 0 && orders[0].id !=undefined) {
		if(orders[0].status === 2) {
			var selectQry = "select * from oitems where oid='" + poid + "'";

			var oitems = alasql(selectQry);
			
			if(oitems!=undefined && oitems.length > 0) {
				oitems.forEach(function(oitem){
					var item = {};
					item.id = oitem.id;
					item.pcode = oitem.pcode;
					item.pcat = oitem.pcat;
					item.pmake = oitem.pmake;
					item.pdetail = oitem.pdetail;
					item.toReceiveQty = oitem.qty - oitem.received;
					item.receivedQty = 0;
					gi_orderid_po_items.push(item);
				});
			}
		} else {
			toastr.clear();
			toastr.warning("Order already closed/cancelled.");
		}

	} else {
		toastr.clear();
		toastr.info("No such order.");
	}

	$("#gr-po-items").jsGrid("reset");
	$("#gr-po-items").jsGrid("render");
}