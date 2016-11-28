var user = parseInt($.url().param('user'));
if(!user) {
	/*var $a = $("<a>").attr("href", "login.html");
	$a.click();*/
	$(location).attr('href', 'login.html')
} else {
	var rows = alasql("select name from users where id="+user);
	$("#username").text(rows[0].name);
}

$("nav.sidebar ul.menu").find("li a").each(function(){
	if(user && user >=0) {
		$(this).attr("href", $(this).attr("href") + "?user="+user);
	}
})

if(user === 2){// shelf
	$("#li-overview").show().addClass("active");
	$("#tabcontent-inventory").show().addClass("active");
	$("#li-goodsissue").show();
	$("#tabcontent-goodsissue");
	
	$("#li-settings").hide().removeClass("active");
	$("#tabcontent-settings").hide().removeClass("active");
	
	$("#li-goodsreceive").hide().removeClass("active");
	$("#tabcontent-goodsreceive").hide().removeClass("active");
	
	$("#sidebar-home").show();
	$("#sidebar-inventory").show();
	$("#sidebar-products").show();
	$("#sidebar-vendors").hide();
	$("#sidebar-orders").show();
	$("#sidebar-users").hide();
} else if(user === 3) { //goodsreceipt
	$("#li-overview").hide().removeClass("active");
	$("#li-goodsissue").hide().removeClass("active");
	$("#li-settings").hide().removeClass("active");
	$("#tabcontent-inventory").hide().removeClass("active");
	$("#tabcontent-goodsissue").hide().removeClass("active");
	$("#tabcontent-settings").hide().removeClass("active");
	$("#li-goodsreceive").show().addClass("active");
	$("#tabcontent-goodsreceive").show().addClass("active");
	
	$("#sidebar-home").show();
	$("#sidebar-inventory").show();
	$("#sidebar-products").hide();
	$("#sidebar-vendors").show();
	$("#sidebar-orders").show();
	$("#sidebar-users").hide();
}

$( '.dropdown-menu a' ).on( 'click', function( event ) {

	   var $target = $( event.currentTarget ),
	       val = $target.attr( 'data-value' ),
	       $inp = $target.find( 'input' );
	   
	   var fieldIndex = 0;
	   var filter = $("#inventory-items").jsGrid("getFilter");
	   
	   $("#inventory-items").data('JSGrid').fields.forEach(function($field){
		   if($field.name === val) {
			   console.log(val)
			   if($inp.is(":checked")) {
				   $inp.prop("checked", false);
				   $field.visible = false;
				   delete filter[$field.name];
			   } else {
				   $inp.prop("checked", true);
				   $field.visible = true;
			   } 
		   }
	   });
	   $("#inventory-items").jsGrid("render"); 
	   $("#inventory-items").jsGrid("search", filter);
	   restoreFilter(filter);
	   return false;
	});

var inventory_items_stock = [];

$("#inventory-items").jsGrid({
	width:"1220",
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
    					&& (!filter["inStock"] || filter["inStock"]==="" || Number(filter["inStock"]) === iitem["inStock"])
    					&& (!filter["pprice"] || filter["pprice"] === iitem["pprice"]));
    		});
    		
    		
    		
    		return filtered;
    	},
    	
    },
    fields: [
             { name: "pcode", title: "PROD CODE", type: "text", editing:false, width:150, },
             { name: "pcat", title: "CATEGORY", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text", width:150, },
             { name: "pmake", title: "MAKER", type: "select", items:getMakersLOV(), valueField: "id", textField: "text", width:150, },
             { name: "pdetail", title: "DETAIL", type: "text", width:150, },
             { name: "whouse", title: "WAREHOUSE", type: "select", items:getWarehousesLOV(), valueField: "id", textField: "text", width:150, },
         { name: "pprice", title: "PRICE ", type: "number", filtering: false, width:150, },   
         { name: "inStock", title: "In Stock QTY", type: "text", width:150, },
         
         { type: "control", width:"100px", deleteButton: false, editButton: false, width:150, 
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
            	   
            	   var updatedHeader = $headerRow.find("th");
            	   var updatedFields = [];
            	   fields.forEach(function(f){
            		   updatedFields.push(f);
            	   })

            	   for(var i=1; i<updatedHeader.length; i++) {
            		   var prevIdx = 0, currIdx = 0;
            		   var prevField, currField;
            		   for(var x=0; x<updatedFields.length; x++) {

            			   if(updatedFields[x].title === updatedHeader.eq(i-1).text() 
            					   || (updatedFields[x].title==null && updatedHeader.eq(i-1).text()=="")) {
                    		   prevIdx = x;
                    		   prevField = updatedFields[x];
            			   }
            			   
            			   if(updatedFields[x].title === updatedHeader.eq(i).text() 
            					   || (updatedFields[x].title==null && updatedHeader.eq(i).text()=="")) {
            				   currIdx = x;
                    		   currField = updatedFields[x];
            			   }
            		   }
            		 
            		   if(prevIdx > currIdx && prevField!=undefined && currField!=undefined) {
            			   updatedFields[currIdx] = prevField;
            			   updatedFields[prevIdx] = currField;
            		   }
            	   }

            	   var filter = $("#inventory-items").jsGrid("getFilter");
            	   console.log(filter)
                   $("#inventory-items").jsGrid("option", "fields", updatedFields);
            	   $("#inventory-items").jsGrid("search", filter);
            	   restoreFilter(filter);
               }
           });
       }
});

function restoreFilter(filter) {
	var fields = $("#inventory-items").data("JSGrid").fields;

	for (var i = 0; i < fields.length; i++) {
		if (fields[i].visible && fields[i].name in filter) {
			var $cell = $("#inventory-items").data("JSGrid")._filterRow
					.children().eq(i);

			if ($cell.find("select").length == 1) {
				$cell.find("select").eq(0).val(filter[fields[i].name])
			} else if ($cell.find("input").length == 1) {
				$cell.find("input").eq(0).val(filter[fields[i].name])
			}

		}
	}
}

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
