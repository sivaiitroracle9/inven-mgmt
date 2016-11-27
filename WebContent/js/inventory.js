$(".inventory-items-grid-cols").change(function(){
	var fieldIndex = Number($(this).attr("id").slice(21));
	if($(this).is(":checked")) {
		$("#inventory-items").data('JSGrid').fields[fieldIndex].visible = true;
	} else {
		$("#inventory-items").data('JSGrid').fields[fieldIndex].visible = false;
	}
	$("#inventory-items").jsGrid("render");
});


var inventory_items_stock = [];

$("#inventory-items").jsGrid({
	width:"1200px",
	filtering: true,
    sorting: true,
    autoload: true,
    visible:true,
    paging: true,
    pageSize: 10,
    pageButtonCount: 10,
    
    controller: {
    	loadData: function(filter) {
    		
    		var products = alasql("select stock.id as pstockid, stock.cstock as cstock, stock.cstock_type as cstock_type, products.id as id, stock.whouse as whouse, stock.balance as qty, products.code as code, " +
    				"products.category as category, products.detail as detail, products.make as make, products.price as price, products.unit as unit" +
    				" from products JOIN stock ON products.id=stock.item");
    		
    		var inventory_items_stock = [];
    		products.forEach(function(prd){
    			var iitem = {};
    			iitem.pstockid = prd.pstockid;
    			iitem.cstock = prd.cstock;
    			iitem.cstock_type = prd.cstock_type;
    			iitem.whouse = prd.whouse;
    			iitem.pcat = prd.category;
    			iitem.pcode = prd.code;
    			iitem.pmake = prd.make;
    			iitem.pdetail = prd.detail;
    			iitem.pprice = prd.price;
    			iitem.inStock = prd.qty;
    			inventory_items_stock.push(iitem);
    		});
    		
    		var filtered = $.grep(inventory_items_stock, function(iitem){
    			return ((!filter["whouse"] || filter["whouse"]===0 || filter["whouse"] === iitem["whouse"])
    					&& (!filter["pcat"] || filter["pcat"]===0 || filter["pcat"] === iitem["pcat"])
    					&& (!filter["pcode"] || filter["pcode"]==="" || iitem["pcode"].indexOf(filter["pcode"]))!=-1
    					&& (!filter["pmake"] || filter["pmake"]===0 || filter["pmake"] === iitem["pmake"])
    					&& (!filter["pdetail"]  || filter["pdetail"]==="" || iitem["pdetail"].indexOf(filter["pdetail"]))!=-1
    					&& (!filter["inStock"] || filter["inStock"]==="" || filter["inStock"] === iitem["inStock"])
    					&& (!filter["pprice"] || filter["pprice"] === iitem["pprice"]));
    		});
    		
    		
    		
    		return filtered;
    	},
    	
    },
    fields: [
             { name: "pcode", title: "PROD CODE", type: "text", editing:false, width:70, },
             { name: "pcat", title: "CATEGORY", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text", width:70, },
             { name: "pmake", title: "MAKER", type: "select", items:getMakersLOV(), valueField: "id", textField: "text", width:70, },
             { name: "pdetail", title: "DETAIL", type: "text", width:70, },
             { name: "whouse", title: "WAREHOUSE", type: "select", items:getWarehousesLOV(), valueField: "id", textField: "text", width:70, },
         { name: "pprice", title: "PRICE ", type: "number", filtering: false, width:70, },   
         { name: "inStock", title: "In Stock QTY", type: "number", width:70, },
         
         { type: "control", width:"100px", deleteButton: false, editButton: false, width:30, 
        	 itemTemplate: function(value, item) {
            		 
        		 if(item.inStock < item.cstock) {
        			 if(item.inStock === 0) {
            			 return "<label class='label label-danger'> Out of Stock </label><br/><span>Safety stock: " +
         			 	item.cstock +"</span>";	
        			 }
        			 
        			 return "<label class='label label-warning'> Low Stock </label><br/><span>Safety stock: " +
     			 		item.cstock +"</span>";	
        		 } 
            		 
        	 }
         }
       ],
       
       onRefreshed: function(e) {
           var $headerRow = $("#inventory-items .jsgrid-header-row");
           var $headerCells = $headerRow.find("th");
           var fields = e.grid.option("fields");

           $.each(fields, function(index, field) {
               $headerCells.eq(index).data("JSField", field);
           });

           $headerRow.sortable({
               axis: "x",
               placeholder: "header-cell-placeholder",
               start: function(e, ui){
                   //ui.placeholder.width(ui.helper.width());
            	   $(".header-cell-placeholder").css({width: $(ui.item).width()}); 
               },
               update: function(e, ui) {
                   var fields = $.map($headerRow.find("th"), function(cell) {
                       return $(cell).data("JSField");
                   });

                   $("#inventory-items").jsGrid("option", "fields", fields);
               }
           });
       }
});

function loadStock(){
	var products = alasql("select products.id as id, stock.whouse as whouse, stock.balance as qty, products.code as code, " +
			"products.category as category, products.detail as detail, products.make as make, products.price as price, products.unit as unit" +
			" from products JOIN stock ON products.id=stock.item");
	
	var inventory_items_stock = [];
	products.forEach(function(prd){
		var iitem = {};
		iitem.whouse = prd.whouse;
		iitem.pcat = prd.category;
		iitem.pcode = prd.code;
		iitem.pmake = prd.make;
		iitem.pdetail = prd.detail;
		iitem.pprice = prd.price;
		iitem.inStock = prd.qty;
		inventory_items_stock.push(iitem);
	});
	return inventory_items_stock;
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
