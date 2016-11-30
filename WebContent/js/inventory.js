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

	   $("#inventory-items").jsGrid("search", filter);
	   restoreFilter(filter);
	   refreshInventoryGrid();
	   return false;
});

function refreshInventoryGrid(){
	$("#inventory-items").jsGrid("render");
}

var inventory_items_stock = [];
var inventory_items_selected = {};

$("#inventory-items").jsGrid({
	width:"1400px",
	filtering: true,
    sorting: true,
    autoload: true,
    visible:true,
    paging: true,
    pageSize: 20,
    pageButtonCount: 10,
    
    rowClick: function(args){

    },
    
    controller: {
    	loadData: function(filter) {
    		
    		console.log(filter)
    		
    		var products = alasql("select stock.id as pstockid, stock.cstock as cstock, stock.cstock_type as cstock_type, products.id as id, stock.whouse as whouse, stock.balance as qty, products.code as code, " +
    				"products.category as category, products.detail as detail, products.make as make, products.price as price, products.unit as unit" +
    				" from products JOIN stock ON products.id=stock.item");
    		
    		var inventory_items_stock = [];
    		products.forEach(function(prd){
    			var iitem = {};
    			iitem.pckb = true;
    			iitem.pstockid = prd.pstockid;
    			iitem.cstock_type = prd.cstock_type;
    			iitem.whouse = prd.whouse;
    			iitem.pcat = prd.category;
    			iitem.pcode = prd.code;
    			iitem.pmake = prd.make;
    			iitem.pdetail = prd.detail;
    			iitem.pprice = prd.price;
    			iitem.inStock = prd.qty;
    			iitem.reorderPoint = prd.cstock;
    			
    			iitem.stocklevel = 1;
    			if(iitem.inStock === 0) iitem.stocklevel = 3;
    			else if(iitem.inStock < iitem.reorderPoint) iitem.stocklevel = 2;
    			
    			inventory_items_stock.push(iitem);
    		});
    		
    		var filtered = $.grep(inventory_items_stock, function(iitem){
    			return ((!filter["whouse"] || filter["whouse"]===0 || filter["whouse"] === iitem["whouse"])
    					&& (!filter["pcat"] || filter["pcat"]===0 || filter["pcat"] === iitem["pcat"])
    					&& (!filter["pcode"] || filter["pcode"]==="" || iitem["pcode"].indexOf(filter["pcode"]))!=-1
    					&& (!filter["pmake"] || filter["pmake"]===0 || filter["pmake"] === iitem["pmake"])
    					&& (!filter["pdetail"]  || filter["pdetail"]==="" || iitem["pdetail"].indexOf(filter["pdetail"]))!=-1
    					&& (!filter["inStock"] || filter["inStock"]==="" || Number(filter["inStock"]) === iitem["inStock"])
    					&& (!filter["reorderPoint"] || filter["reorderPoint"] === iitem["reorderPoint"])
    					&& (!filter["pprice"] || filter["pprice"] === iitem["pprice"])
    					&& (!filter["stocklevel"] || filter["stocklevel"] === iitem["stocklevel"]));
/*    			var sel_pprice = $("#sel-pprice").val();
    			return ((!filter["whouse"] || filter["whouse"]===0 || filter["whouse"] === iitem["whouse"])
    					&& (!filter["pcat"] || filter["pcat"]===0 || filter["pcat"] === iitem["pcat"])
    					&& (!filter["pcode"] || filter["pcode"]==="" || iitem["pcode"].indexOf(filter["pcode"]))!=-1
    					&& (!filter["pmake"] || filter["pmake"]===0 || filter["pmake"] === iitem["pmake"])
    					&& (!filter["pdetail"]  || filter["pdetail"]==="" || iitem["pdetail"].indexOf(filter["pdetail"]))!=-1
    					&& (!filter["inStock"] || filter["inStock"]==="" || Number(filter["inStock"]) === iitem["inStock"])
    					&& (!filter["reorderPoint"] || filter["reorderPoint"] === iitem["reorderPoint"])
    					&& (!filter["pprice"] || (sel_pprice==0 && Number(filter["pprice"]) === Number(iitem["pprice"])) 
    							|| (sel_pprice==1 && Number(filter["pprice"]) < Number(iitem["pprice"]))
    							|| (sel_pprice==2 && Number(filter["pprice"]) > Number(iitem["pprice"]))
    							|| (sel_pprice==3 && Number(filter["pprice"]) <= Number(iitem["pprice"]))
    							|| (sel_pprice==4 && Number(filter["pprice"]) >= Number(iitem["pprice"])))
    					&& (!filter["stocklevel"] || filter["stocklevel"] === iitem["stocklevel"]));*/
    		});
    		
    		inventory_items_selected = {};
    		filtered.forEach(function(d){
    			inventory_items_selected[d.pstockid] = d;
    		});
    		
    		toggleGroupPO();
    		
    		return filtered;
    	},
    	
    },
    fields: [
    		 { name: "pckb", title: "", type: "checkbox", align: "center", filtering:false, sorting:false, width:20, css:"pckbheader",
    			 headerTemplate: function(value, item) {
    				 return $("<input id='pckb-header' checked>").attr("type", "checkbox").change(function(){
    					 if($(this).is(":checked")){
    						 $("input.pckb-item").each(function(){
    							$(this).prop('checked', true); 
    						 });
    						 $("#inventory-items").data("JSGrid").data.forEach(function(d){
    				    			inventory_items_selected[d.pstockid] = d;
    				    	 });
    					 } else {
    						 $("input.pckb-item").each(function(){
     							$(this).prop('checked', false); 
     						 });
    						 inventory_items_selected = {};
    					 }
    				 });
    			 },
    		 
	    		 itemTemplate: function(value, item) {
	                 return $("<input class='pckb-item' id='pckb-item-'" + item.pstockid + " checked>").attr("type", "checkbox").change(function(){
	                	 var id = Number($(this).attr("id").slice(10));
	                	 if($(this).is(":checked")){
	                		 inventory_items_selected[item.pstockid] = item;
	                	 } else {
	                		 delete inventory_items_selected[item.pstockid];
	                	 }
	                	 if($("#inventory-items").data("JSGrid").data.length === Object.keys(inventory_items_selected).length) 
	                		 $("input#pckb-header").prop('checked', true);
	                	 else $("input#pckb-header").prop('checked', false);
	                	 
	                	 console.log(inventory_items_selected);
	                	 toggleGroupPO();
	                 });
	             },
	    	 },
    		 
             { name: "pcode", title: "PROD CODE", type: "text", editing:false, width:150, 
	    		 headerTemplate: function() {
	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
	         	}	 
             },
             { name: "pcat", title: "CATEGORY", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text", width:150, 
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "pmake", title: "MAKER", type: "select", items:getMakersLOV(), valueField: "id", textField: "text", width:150, 
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "pdetail", title: "DETAIL", type: "text", width:150, 
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "whouse", title: "WAREHOUSE", type: "select", items:getWarehousesLOV(), valueField: "id", textField: "text", width:150, 
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "pprice", title: "PRICE ", type: "number", filtering: false, width:150, 
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	 },
/* 	         	 filterTemplate: function() {
 	         		var operator = "<select id='sel-pprice' style='float:left;width:60px'><option value='0'>=</option>" +
 	         				"<option value='1'>></option>" +
 	         				"<option value='2'><</option>" +
 	         				"<option value='3'>>=</option>" +
 	         				"<option value='4'><=</option></select>" +
 	         				"<input id='in-pprice' style='width:76px' type='text'>";
 	         		 return operator;
 	         	 },
 	         	filterValue: function(){
 	         		 console.log($("#in-pprice").val());
 	         		console.log(this.filterControl.val())
 	         		 return Number($("#in-pprice").val());
 	         	 }*/
             },   
             { name: "inStock", title: "In Stock QTY", type: "text", width:150, 
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "reorderPoint", title: "Reorder Point", type: "text", width:150, 
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "stocklevel", title: "STOCK. STATUS", type: "select", items:getStockLevelLOV(), valueField: "id", textField: "text", width:150, 
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	 },
            	 itemTemplate: function(value, item) {
	        		 if(value === 1) {
	        			return "<label class='label label-success pull-left'>" + this.items[value].text + "</label>";
	        		 } else if(value === 2) {
	        			 return "<label class='label label-warning pull-left'>" + this.items[value].text + "</label>" + 
	        			 "<a onclick='openInventoryPO(false," + item.pstockid + ")'><span class='label label-primary pull-right' style='border-radius:50%;margin-left:20px'>" +
	        			 "<span class='glyphicon glyphicon-plus'></span></span></a>";
	        		 } else if(value === 3) {
	        			 return "<label class='label label-danger pull-left'>" + this.items[value].text + "</label>" + 
	        			 "<a onclick='openInventoryPO(false," + item.pstockid + ")'><span class='label label-primary pull-right' style='border-radius:50%;margin-left:20px'>" +
	        			 "<span class='glyphicon glyphicon-plus'></span></span></a>";
	        		 } 
	        	 },
             
             },
       ],
       
       onRefreshed: function(e) {
           var $headerRow = $("#inventory-items .jsgrid-header-row");
           var $headerCells = $headerRow.find("th");
           var fields = e.grid.option("fields");
    	   
           $.each(fields, function(index, field) {
        	   $headerCells.eq(index).data("JSField", field);
           });

           $headerRow.sortable({
        	   items: "th:not(.pckbheader)",
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

function toggleGroupPO(){
	if(Object.keys(inventory_items_selected).length!=0) $("#inven-grp-po").prop("disabled", false);
	else $("#inven-grp-po").prop("disabled", true);
}
