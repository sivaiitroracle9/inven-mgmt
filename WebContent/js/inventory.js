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

var inventory_items_stock = [];
var inventory_items_selected = {};

$("#inventory-items").jsGrid({
	width:"1800px",
	filtering: true,
	sorting: true,
    autoload: true,
    visible:true,
    paging: true,
    pageSize: 10,
    pageButtonCount: 10,
    pageLoading:true,
    
    rowClick: function(args){

    },
    
    controller: {
    	loadData: function(filter) {
    		console.log(filter)
    		var products = alasql("select stock.id as pstockid, products.id as prodid, stock.cstock as cstock, stock.cstock_type as cstock_type, products.id as id, stock.whouse as whouse, stock.balance as qty, products.code as code, " +
    				"products.category as category, products.detail as detail, products.make as make, stock.price as price, products.unit as unit" +
    				" from products JOIN stock ON products.id=stock.item");

    		var inventory_items_stock = [];
    		products.forEach(function(prd){
    			var iitem = {};
    			iitem.pckb = true;
    			iitem.pstockid = prd.pstockid;  			
    			iitem.prodid = prd.prodid;
    			iitem.cstock_type = prd.cstock_type;
    			iitem.whouse = prd.whouse;
    			iitem.pcat = prd.category;
    			iitem.pcode = prd.code;
    			iitem.plocId = "SL-00" + iitem.whouse + "-" + iitem.pcode;
    			iitem.pmake = prd.make;
    			iitem.pdetail = prd.detail;
    			iitem.pprice = Number((prd.price).toFixed(2));
    			iitem.inWarehouse = prd.qty;
    			iitem.reservedForIssue = getReservedQty(iitem.whouse, iitem.prodid);
    			iitem.leadQty = getLeadQty(iitem.whouse, iitem.prodid);
    			iitem.inStock = iitem.inWarehouse - iitem.reservedForIssue + iitem.leadQty;
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
    					&& (!filter["plocId"] || filter["plocId"]==="" || iitem["plocId"].indexOf(filter["plocId"]))!=-1
    					&& (!filter["pdetail"]  || filter["pdetail"]==="" || iitem["pdetail"].indexOf(filter["pdetail"]))!=-1
    					&& (!filter["pmake"] || filter["pmake"]===0 || filter["pmake"] === iitem["pmake"])
    					&& (!filter.inStock || !filter.inStock.text 
    						|| (filter.inStock.text && Number(filter.inStock.op)===0 && Number(filter.inStock.text)== Number(iitem["inStock"]))
    						|| (filter.inStock.text && Number(filter.inStock.op)===1 && Number(filter.inStock.text) < Number(iitem["inStock"]))
    						|| (filter.inStock.text && Number(filter.inStock.op)===2 && Number(filter.inStock.text) > Number(iitem["inStock"]))
    						|| (filter.inStock.text && Number(filter.inStock.op)===3 && Number(filter.inStock.text) <= Number(iitem["inStock"]))
    						|| (filter.inStock.text && Number(filter.inStock.op)===4 && Number(filter.inStock.text) >= Number(iitem["inStock"]))
    					) && (!filter.inWarehouse || !filter.inWarehouse.text 
        						|| (filter.inWarehouse.text && Number(filter.inWarehouse.op)===0 && Number(filter.inWarehouse.text)== Number(iitem["inWarehouse"]))
        						|| (filter.inWarehouse.text && Number(filter.inWarehouse.op)===1 && Number(filter.inWarehouse.text) < Number(iitem["inWarehouse"]))
        						|| (filter.inWarehouse.text && Number(filter.inWarehouse.op)===2 && Number(filter.inWarehouse.text) > Number(iitem["inWarehouse"]))
        						|| (filter.inWarehouse.text && Number(filter.inWarehouse.op)===3 && Number(filter.inWarehouse.text) <= Number(iitem["inWarehouse"]))
        						|| (filter.inWarehouse.text && Number(filter.inWarehouse.op)===4 && Number(filter.inWarehouse.text) >= Number(iitem["inWarehouse"]))
        				) && (!filter.reservedForIssue || !filter.reservedForIssue.text 
        						|| (filter.reservedForIssue.text && Number(filter.reservedForIssue.op)===0 && Number(filter.reservedForIssue.text)== Number(iitem["reservedForIssue"]))
        						|| (filter.reservedForIssue.text && Number(filter.reservedForIssue.op)===1 && Number(filter.reservedForIssue.text) < Number(iitem["reservedForIssue"]))
        						|| (filter.reservedForIssue.text && Number(filter.reservedForIssue.op)===2 && Number(filter.reservedForIssue.text) > Number(iitem["reservedForIssue"]))
        						|| (filter.reservedForIssue.text && Number(filter.reservedForIssue.op)===3 && Number(filter.reservedForIssue.text) <= Number(iitem["reservedForIssue"]))
        						|| (filter.reservedForIssue.text && Number(filter.reservedForIssue.op)===4 && Number(filter.reservedForIssue.text) >= Number(iitem["reservedForIssue"]))
        				) && (!filter.leadQty || !filter.leadQty.text 
        						|| (filter.leadQty.text && Number(filter.leadQty.op)===0 && Number(filter.leadQty.text)== Number(iitem["leadQty"]))
        						|| (filter.leadQty.text && Number(filter.leadQty.op)===1 && Number(filter.leadQty.text) < Number(iitem["leadQty"]))
        						|| (filter.leadQty.text && Number(filter.leadQty.op)===2 && Number(filter.leadQty.text) > Number(iitem["leadQty"]))
        						|| (filter.leadQty.text && Number(filter.leadQty.op)===3 && Number(filter.leadQty.text) <= Number(iitem["leadQty"]))
        						|| (filter.leadQty.text && Number(filter.leadQty.op)===4 && Number(filter.leadQty.text) >= Number(iitem["leadQty"]))
        				) && (!filter.reorderPoint || !filter.reorderPoint.text 
    						|| (filter.reorderPoint.text && Number(filter.reorderPoint.op)===0 && Number(filter.reorderPoint.text)== Number(iitem["reorderPoint"]))
    						|| (filter.reorderPoint.text && Number(filter.reorderPoint.op)===1 && Number(filter.reorderPoint.text) < Number(iitem["reorderPoint"]))
    						|| (filter.reorderPoint.text && Number(filter.reorderPoint.op)===2 && Number(filter.reorderPoint.text) > Number(iitem["reorderPoint"]))
    						|| (filter.reorderPoint.text && Number(filter.reorderPoint.op)===3 && Number(filter.reorderPoint.text) <= Number(iitem["reorderPoint"]))
    						|| (filter.reorderPoint.text && Number(filter.reorderPoint.op)===4 && Number(filter.reorderPoint.text) >= Number(iitem["reorderPoint"]))
    					) && (!filter.pprice || !filter.pprice.text 
    						|| (filter.pprice.text && Number(filter.pprice.op)===0 && Number(filter.pprice.text)== Number(iitem["pprice"]))
    						|| (filter.pprice.text && Number(filter.pprice.op)===1 && Number(filter.pprice.text) < Number(iitem["pprice"]))
    						|| (filter.pprice.text && Number(filter.pprice.op)===2 && Number(filter.pprice.text) > Number(iitem["pprice"]))
    						|| (filter.pprice.text && Number(filter.pprice.op)===3 && Number(filter.pprice.text) <= Number(iitem["pprice"]))
    						|| (filter.pprice.text && Number(filter.pprice.op)===4 && Number(filter.pprice.text) >= Number(iitem["pprice"]))
    					) && (!filter["stocklevel"] || filter["stocklevel"] === iitem["stocklevel"] || (filter["stocklevel"]===4 && (iitem["stocklevel"]===2 || iitem["stocklevel"] === 3))));
    		});
    		
    		if(filter.sortField != undefined && filter.sortOrder != undefined) {
        		filtered.sort(function(x1, x2){
        			var x11 = x1[filter.sortField], x21 = x2[filter.sortField];
        			if(filter.sortField === "pprice" || filter.sortField === "inStock" || filter.sortField === "reorderPoint") {
        				x11 = Number(x11);
        				x21 = Number(x21);
        			}
        			
        			if(x11 === x21) return 0;
        			
        			if(filter.sortOrder == "asc") {
        				return x11 > x21 ? 1 : -1;
        			} else if(filter.sortOrder == "desc") {
        				return x11 < x21 ? 1 : -1;
        			}	
        		});
    		}

    		inventory_items_selected = {};
    		filtered.forEach(function(d){
    			inventory_items_selected[d.pstockid] = d;
    		});
    		
    		toggleGroupPO();
    		
    		return  {data: pageData(filtered, filter.pageIndex, filter.pageSize), itemsCount: filtered.length};
    	},
    	
    },
    fields: [
    		 { name: "pckb", title: "", type: "checkbox", align: "center", filtering:false, sorting:false, width:20, css:"pckbheader",
    			 headerTemplate: function(value, item) {
    				 return $("<input id='pckb-header'>").attr("type", "checkbox").change(function(){
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
	                 return $("<input class='pckb-item' id='pckb-item-'" + item.pstockid + " >").attr("type", "checkbox").change(function(){
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
	         { name: "pimg", title: "", type: "text", editing:false, width:70, sorting:false, filtering: false, css:"pimgheader", align:"center",
	     		
	    		 itemTemplate: function(value, item) {
	                 return "<img style='width:40px;height:40px' src='img/" + item.prodid + ".jpg'>";
	             },
	         },
             { name: "pcode", title: "PROD CODE", type: "text", editing:false, width:120, sorting:true, align:"center",
	    		 headerTemplate: function() {
	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
	         	}	 
             },
             { name: "pcat", title: "CATEGORY", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text", width:120, align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "plocId", title: "SHELF", type: "text", editing:false, width:120, sorting:true, align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "pmake", title: "MAKER", type: "select", items:getMakersLOV(), valueField: "id", textField: "text", width:120,  align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "pdetail", title: "DETAIL", type: "text", width:150,  align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "whouse", title: "WAREHOUSE", type: "select", items:getWarehousesLOV(), valueField: "id", textField: "text", width:120,  align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "pprice", title: "AVG. PRICE ", type:"number", width:140,  align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	 },
 	         	filterTemplate: function() {
 	         			var operator = $("<select style='width:55px'>").on('change', function (e) {
	 	         		    	$("#inventory-items").jsGrid("search", $("#inventory-items").jsGrid("getFilter"));
	         				});
 	         			$("<option selected>").val(0).text("=").appendTo(operator);
 	         			$("<option>").val(1).text(">").appendTo(operator);
 	         			$("<option>").val(2).text("<").appendTo(operator);
 	         			$("<option>").val(3).text(">=").appendTo(operator);
 	         			$("<option>").val(4).text("<=").appendTo(operator);
 	         			
 	         			this._operatorPicker = operator;
 	         			this._textPicker = $("<input style='width:46px' type='text'>")
 	         				.on('keypress', function (e) {
	 	         		         if(e.which === 13){
	 	         		        	$("#inventory-items").jsGrid("search", $("#inventory-items").jsGrid("getFilter"));
	 	         		         }
 	         				});
	 	               return $("<div>").append(this._operatorPicker).append(this._textPicker);
	 	           },
	 	        
 	           filterValue: function() {
 	        	   return {
 	        		   text: this._textPicker.val(),
 	        		   op: this._operatorPicker.val(),
 	        	   };
 	           }
             },
             { name: "inWarehouse", title: "Qty in Warehouse", type: "text", width:120,  align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	},
 	         	filterTemplate: function() {
	         			var operator = $("<select style='width:55px'>").on('change', function (e) {
 	         		    	$("#inventory-items").jsGrid("search", $("#inventory-items").jsGrid("getFilter"));
         				});
	         			$("<option selected>").val(0).text("=").appendTo(operator);
	         			$("<option>").val(1).text(">").appendTo(operator);
	         			$("<option>").val(2).text("<").appendTo(operator);
	         			$("<option>").val(3).text(">=").appendTo(operator);
	         			$("<option>").val(4).text("<=").appendTo(operator);
	         			
	         			this._operatorPicker = operator;
	         			this._textPicker = $("<input style='width:46px' type='text'>")
	         				.on('keypress', function (e) {
 	         		         if(e.which === 13){
 	         		        	$("#inventory-items").jsGrid("search", $("#inventory-items").jsGrid("getFilter"));
 	         		         }
	         				});
 	               return $("<div>").append(this._operatorPicker).append(this._textPicker);
 	           },
 	        
	           filterValue: function() {
	        	   return {
	        		   text: this._textPicker.val(),
	        		   op: this._operatorPicker.val(),
	        	   };
	           }
             },
             { name: "reservedForIssue", title: "Reserved Qty \n (For Issue)", type: "text", width:120,  align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	},
 	         	filterTemplate: function() {
	         			var operator = $("<select style='width:55px'>").on('change', function (e) {
 	         		    	$("#inventory-items").jsGrid("search", $("#inventory-items").jsGrid("getFilter"));
         				});
	         			$("<option selected>").val(0).text("=").appendTo(operator);
	         			$("<option>").val(1).text(">").appendTo(operator);
	         			$("<option>").val(2).text("<").appendTo(operator);
	         			$("<option>").val(3).text(">=").appendTo(operator);
	         			$("<option>").val(4).text("<=").appendTo(operator);
	         			
	         			this._operatorPicker = operator;
	         			this._textPicker = $("<input style='width:46px' type='text'>")
	         				.on('keypress', function (e) {
 	         		         if(e.which === 13){
 	         		        	$("#inventory-items").jsGrid("search", $("#inventory-items").jsGrid("getFilter"));
 	         		         }
	         				});
 	               return $("<div>").append(this._operatorPicker).append(this._textPicker);
 	           },
 	        
	           filterValue: function() {
	        	   return {
	        		   text: this._textPicker.val(),
	        		   op: this._operatorPicker.val(),
	        	   };
	           }
             },
             { name: "leadQty", title: "Lead Qty\n(Procured)", type: "text", width:120,  align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	},
 	         	filterTemplate: function() {
	         			var operator = $("<select style='width:55px'>").on('change', function (e) {
 	         		    	$("#inventory-items").jsGrid("search", $("#inventory-items").jsGrid("getFilter"));
         				});
	         			$("<option selected>").val(0).text("=").appendTo(operator);
	         			$("<option>").val(1).text(">").appendTo(operator);
	         			$("<option>").val(2).text("<").appendTo(operator);
	         			$("<option>").val(3).text(">=").appendTo(operator);
	         			$("<option>").val(4).text("<=").appendTo(operator);
	         			
	         			this._operatorPicker = operator;
	         			this._textPicker = $("<input style='width:46px' type='text'>")
	         				.on('keypress', function (e) {
 	         		         if(e.which === 13){
 	         		        	$("#inventory-items").jsGrid("search", $("#inventory-items").jsGrid("getFilter"));
 	         		         }
	         				});
 	               return $("<div>").append(this._operatorPicker).append(this._textPicker);
 	           },
 	        
	           filterValue: function() {
	        	   return {
	        		   text: this._textPicker.val(),
	        		   op: this._operatorPicker.val(),
	        	   };
	           }
             },
             { name: "inStock", title: "Net Available QTY", type: "text", width:120,  align:"center",
            	 headerTemplate: function() {
  	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
  	         	},
  	         	filterTemplate: function() {
 	         			var operator = $("<select style='width:55px'>").on('change', function (e) {
  	         		    	$("#inventory-items").jsGrid("search", $("#inventory-items").jsGrid("getFilter"));
          				});
 	         			$("<option selected>").val(0).text("=").appendTo(operator);
 	         			$("<option>").val(1).text(">").appendTo(operator);
 	         			$("<option>").val(2).text("<").appendTo(operator);
 	         			$("<option>").val(3).text(">=").appendTo(operator);
 	         			$("<option>").val(4).text("<=").appendTo(operator);
 	         			
 	         			this._operatorPicker = operator;
 	         			this._textPicker = $("<input style='width:46px' type='text'>")
 	         				.on('keypress', function (e) {
  	         		         if(e.which === 13){
  	         		        	$("#inventory-items").jsGrid("search", $("#inventory-items").jsGrid("getFilter"));
  	         		         }
 	         				});
  	               return $("<div>").append(this._operatorPicker).append(this._textPicker);
  	           },
  	        
 	           filterValue: function() {
 	        	   return {
 	        		   text: this._textPicker.val(),
 	        		   op: this._operatorPicker.val(),
 	        	   };
 	           }
              },
             { name: "reorderPoint", title: "Reorder Point", type: "text", width:120,  align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	},
 	         	filterTemplate: function() {
	         			var operator = $("<select style='width:55px'>").on('change', function (e) {
 	         		    	$("#inventory-items").jsGrid("search", $("#inventory-items").jsGrid("getFilter"));
         				});
	         			$("<option selected>").val(0).text("=").appendTo(operator);
	         			$("<option>").val(1).text(">").appendTo(operator);
	         			$("<option>").val(2).text("<").appendTo(operator);
	         			$("<option>").val(3).text(">=").appendTo(operator);
	         			$("<option>").val(4).text("<=").appendTo(operator);
	         			
	         			this._operatorPicker = operator;
	         			this._textPicker = $("<input style='width:46px' type='text'>")
	         				.on('keypress', function (e) {
 	         		         if(e.which === 13){
 	         		        	$("#inventory-items").jsGrid("search", $("#inventory-items").jsGrid("getFilter"));
 	         		         }
	         				});
 	               return $("<div>").append(this._operatorPicker).append(this._textPicker);
 	           },
 	        
	           filterValue: function() {
	        	   return {
	        		   text: this._textPicker.val(),
	        		   op: this._operatorPicker.val(),
	        	   };
	           }
             },
             { name: "stocklevel", title: "STOCK. STATUS", type: "select", items:getStockLevelLOV(), valueField: "id", textField: "text", width:120,  align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	 },
            	 itemTemplate: function(value, item) {
	        		 if(value === 1) {
	        			return "<label class='label label-success pull-left'>" + this.items[value].text + "</label>";
	        		 } else if(value === 2 || value === 4) {
	        			 return "<label class='label label-warning pull-left'>" + this.items[value].text + "</label>" + 
	        			 "<a onclick='openInventoryPO(false," + item.pstockid + ")'><span class='btn btn-primary pull-right' " +
	        			 		"style='border-radius:50%;border-left-width: 0px;border-right-width: 0px;border-bottom-width: 0px;border-top-width: 0px;padding:3px;'>" +
	        			 "<span class='glyphicon glyphicon-plus'></span></span></a>";
	        		 } else if(value === 3 || value === 4) {
	        			 return "<label class='label label-danger pull-left'>" + this.items[value].text + "</label>" + 
	        			 "<a onclick='openInventoryPO(false," + item.pstockid + ")'><span class='btn btn-primary pull-right' " +
	        			 		"style='border-radius:50%;border-left-width: 0px;border-right-width: 0px;border-bottom-width: 0px;border-top-width: 0px;padding:3px;'>" +
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

function getReservedQty(whouse, pid) {
	var rows = alasql("select sorders.soid, sorders.warehouse, soitems.pid, soitems.qty - soitems.issued as balance from sorders join soitems on sorders.soid=soitems.soid " +
			"where warehouse=" + Number(whouse));
	var balance = 0;
	if(rows && rows.length!=0) {
		rows.forEach(function(r){
			if(r.pid === pid) {
				balance += r.balance;
			}
		})
	}
	return balance;
}

function getLeadQty(whouse, pid) {
	var rows = alasql("select porders.poid, porders.warehouse, poitems.pid, poitems.qty - poitems.received as balance from porders join poitems on porders.poid=poitems.poid " +
			"where warehouse=" + Number(whouse));
	var balance = 0;
	if(rows && rows.length!=0) {
		rows.forEach(function(r){
			if(r.pid === pid) {
				balance += r.balance;
			}
		})
	}
	return balance;
}

