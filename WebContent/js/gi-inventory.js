var gi_so_items = [];

var gi_so_update_items = {};
$('input#goodsissue-orderid').keypress(function (e) {
	  if (e.which == 13) {
		  loadSOrderWithItems($('input#goodsissue-orderid').val());
		  
		  gi_so_update_items = {};
		  $("#goodsissue-orderid-update-btn").prop("disabled", true);
	  }
});

$("#goodsissue-orderid-update-btn").click(function(){
	if(Object.keys(gi_so_update_items).length > 0) {
		Object.values(gi_so_update_items).forEach(function(upitem){
			console.log(upitem)
			
    		var rows = alasql("select qty, issued from soitems where id = " + upitem.id);
    		var orderedQty = rows[0].qty;
    		var issuedQty = rows[0].issued + Number(upitem.issueQty);
    		var status = 0;
    		if(issuedQty == 0) status = 7;
    		else if(orderedQty > issuedQty) status = 8;
    		else status = 9;
    		alasql("update soitems set issued=" + issuedQty + ", status=" + status + " where id = " + upitem.id);
    		
    		// intrans-items
    		var intransitem = 0;
    		var intrans = alasql("select max(id) as id from intrans_items");
    		if(intrans.length == 1 && intrans[0].id!=undefined) intransitem = intrans[0].id;
    		intransitem++;
    		var query = "INSERT INTO intrans_items VALUES("+ intransitem + ",'" + upitem.soid +"'," + upitem.id +"," + Number(upitem.issuedQty) +",'" + (new Date()).toLocaleString() + "')";
    		console.log(query)
    		alasql(query);
    		
    		// order status change
    		var oitemsQty = alasql("select SUM(qty) as qty, SUM(issued) as issued from soitems where soid='" + upitem.soid +"'");
    		console.log(oitemsQty)
    		
    		if(oitemsQty!=undefined && oitemsQty.length > 0 && oitemsQty[0].issued!=0 && oitemsQty[0].qty > oitemsQty[0].issued) {
    			status = 3;
    			alasql("update sorders set status=" + status + " where soid = '" + upitem.soid + "'");
    		}
    		
    		if(oitemsQty!=undefined && oitemsQty.length > 0 && oitemsQty[0].issued !== 0 && oitemsQty[0].qty === oitemsQty[0].issued) {
    			status = 4;
    			alasql("update sorders set status=" + status + " where soid = '" + upitem.soid + "'");
    		}
    		
    		// stock balance change.
			var currOrders = alasql("select * from sorders where soid='" + upitem.soid +"'");
    		var currProduct = alasql("select * from products where code='" + upitem.pcode +"'");
    		var currstock = alasql("select * from stock where item=" + currProduct[0].id + " and whouse=" + currOrders[0].warehouse);
    		if(currstock==undefined || currstock.length==0) {
    			var nextID = 0;
    			var stocks = alasql("select max(id) as id from stock");
    			if(stocks.length != 0) nextID = stocks[0].id;
    			nextID++;
    			
    			alasql("INSERT into stock VALUES(" + nextID + "," + currProduct[0].id + "," 
    					+ currOrders[0].warehouse + "," + Number(upitem.issuedQty) + ")");
    		} else {
    			alasql("UPDATE stock set balance=" + (currstock[0].balance - Number(upitem.issueQty)) 
    					+ " where item=" + currProduct[0].id + " and whouse=" + currOrders[0].warehouse);
    		}
		});
	}
	
	gi_so_update_items = {};
	$("#goodsissue-orderid-update-btn").prop("disabled", true);
	loadOrderWithItems($('input#goodsreceive-orderid').val());
});


$("#gi-so-items").jsGrid({
	width:"100%",
	filtering: true,
    editing: true,
    sorting: false,
    autoload: true,
    rowClick: function(){},
    
    
    controller: {
    	loadData: function() {
    		return gi_so_items;
    	},
    	
    	updateItem: function(item) {
    		gi_so_update_items[item.id] = item;
    		if(Object.keys(gi_so_update_items).length > 0) $("#goodsissue-orderid-update-btn").prop("disabled", false);
    	}
    },
    fields: [
        { name: "pimg", title: "", type: "text", editing:false, filtering: false, width:"100px",
        	itemTemplate: function(value, item){
        		if(item && item.pid) {
        			return "<img src='img/"+ item.pid + ".jpg' style='width:40px;height:40px'>";
        		}
        	},
        	editTemplate: function(value, item){
        		if(item && item.pid) {
        			return "<img src='img/"+ item.pid + ".jpg' style='width:40px;height:40px'>";
        		}
        	}
        },
        { name: "pcode", title: "PROD CODE", type: "text", editing:false,width:100,},
        { name: "pcat", title: "CATEGORY", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text", width:100, filtering: false, editing:false},
        { name: "pmake", title: "MAKER", type: "select", items:getMakersLOV(), valueField: "id", textField: "text", width:100, filtering: false, editing:false},
        { name: "pdetail", title: "DETAIL", type: "text",editing:false},
        { name: "availableQty", title: "QTY AVAILABLE", type: "number", width:100, editing:false,
        	itemTemplate: function(value, item) {
        	  if ( item && item.availableQty === 0 ) {
        		  return "<span style='font-weight:bold' class='label label-danger pull-left'>NO STOCK</span>"+
    		  		"<span style='font-weight:bold' class='pull-right'>0</span>"
        	  } else if ( item && item.availableQty < item.orderedQty-item.issuedQty ) {
          		  return "<span style='font-weight:bold' class='label label-warning pull-left'>LOW STOCK</span>" +
          		  		"<span style='font-weight:bold' class='pull-right'>" + item.availableQty + "</span>"
          	  } else if ( item ){
          		  return "<span style='font-weight:bold' class='label label-success pull-left'>SUFFICIENT</span>" 
          		  + "<span style='font-weight:bold'>" + item.availableQty + "</span>";
          	  }
        	},
        	editTemplate: function(value, item){
          	  if ( item && item.availableQty === 0 ) {
        		  return "<span style='font-weight:bold' class='label label-danger pull-left'>NO STOCK</span>"+
    		  		"<span style='font-weight:bold' class='pull-right'>0</span>"
        	  } else if ( item && item.availableQty < item.orderedQty-item.issuedQty ) {
          		  return "<span style='font-weight:bold' class='label label-warning pull-left'>LOW STOCK</span>" +
          		  		"<span style='font-weight:bold' class='pull-right'>" + item.availableQty + "</span>"
          	  } else if ( item ){
          		  return "<span style='font-weight:bold' class='label label-success pull-left'>SUFFICIENT</span>" 
          		  + "<span style='font-weight:bold'>" + item.availableQty + "</span>";
          	  }
        	}
        },
        { name: "orderedQty", title: "QTY ORDERED.", type: "text", width:100, editing:false, filtering: false, align:"center",
        	itemTemplate: function(value, item) {
        		if(value == 0) return "--";
        		else return value;
        	}
        },   
        
        { name: "issuedQty", title: "QTY ISSUED", type: "text", width:100, editing:false, filtering: false, align:"center",
        	itemTemplate: function(value, item) {
        		if(value == 0) return "--";
        		else return value;
        	}
        }, 
        
        { name: "issueQty", title: "ISSUE QTY", type: "text", width:100, filtering: false, align:"center",
        	itemTemplate: function(value, item) {
        		if(value == 0 && item.issueQty == 0) return "--";
        		else return value;
        	}
        },
        
        { type: "control", align:"center", width:100,
          deleteButton: false,
          itemTemplate: function(value, item) {
        	  var ret = $("<div>");
        	  if(item && item.orderedQty != 0 && item.orderedQty > item.issuedQty ) {
        		  (this._createEditButton(item)).appendTo(ret);
        		  if(item.availableQty < item.orderedQty - item.issuedQty) {
        			  $("<span style='font-weight:bold; margin-left:20px' class='label label-warning'>").text("Low Stock").appendTo(ret);
        			  $("<input type='button' style='font-weight:bold; margin-left:20px' class='jsgrid-button jsgrid-insert-button' title='Request Stock'>")
        			  .click(function(){
        				  alasql("select * from notification where type='PROCUREMENT_REQUEST'")

        			  }).appendTo(ret);
        		  }
        		  return ret;
        	  }
        	  else {
        		  return "<span style='font-weight:bold' class='label label-success pull-left'>FULFILLED</span>";;
        	  }
          }
        },
       ]
});

function loadSOrderWithItems(soid) {
	
	var orders = alasql("select id, status, warehouse, outlet from sorders where soid='" + soid + "'");

	gi_so_items = [];
	if(orders!= undefined && orders.length > 0 && orders[0].id !=undefined) {
		//if(orders[0].status === 2 || orders[0].status === 3 || orders[0].status === 4) {
    		
    		var selectQry = "select soitems.id as id, soitems.pid as pid, soitems.soid as soid, stock.balance as availableQty, " +
    		"soitems.pcode as pcode, soitems.pcat as pcat, " + 
    		"soitems.pmake as pmake, soitems.pdetail as pdetail, soitems.qty as qty, " +
    		"soitems.issued as issued from soitems JOIN stock on soitems.pid = stock.item where stock.whouse=" 
    		+ orders[0].warehouse + " and soitems.soid='" + soid + "'";
    		
			var oitems = alasql(selectQry);
			
			if(oitems!=undefined && oitems.length > 0) {
				oitems.forEach(function(oitem){
					var item = {};
					item.id = oitem.id;
					item.pid = oitem.pid;
					item.soid = oitem.soid;
					item.whouse = orders[0].warehouse;
					item.outlet = orders[0].outlet;
					item.pcode = oitem.pcode;
					item.pcat = oitem.pcat;
					item.pmake = oitem.pmake;
					item.pdetail = oitem.pdetail;
					item.availableQty = oitem.availableQty;
					item.orderedQty = oitem.qty; // orderedQty
					item.issuedQty = oitem.issued; // issuedQty
					item.issueQty = 0; // issuing qty now
					gi_so_items.push(item);
				});
			}
			
			$("#goodsissue-whouse").text(getWarehouseById(orders[0].warehouse).name);
			$("#goodsissue-outlet").text(getVendorById(orders[0].outlet).name);

	} else {
		toastr.clear();
		toastr.info("No such order.");
	}

	$("#gi-so-items").jsGrid("reset");
	$("#gi-so-items").jsGrid("render");
}
