init();
var invenCorrectItems = {};
var inventory_items_stock = [];
var inventory_items_selected = {};

function init() {
	loadFullAdjustmentData();
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

	   $("#invencorrect-items").jsGrid("search", filter);
	   restoreFilter(filter);
	   refreshInventoryGrid();
	   return false;
});

var invencorrectDlg = $("#invencorrect-dlg").dialog({
    autoOpen: false,
    width: 400,
    modal: true,
    closeOnEscape: true,
    title: "Stock Adjustment / Correction",
    buttons: {
        Save: function() {
        	updateStockCorrection(Object.values(invenCorrectItems)[0])
            $(this).dialog("close");
        },
        Cancel: function(){
        	$(this).dialog("close");
        }
    },
	open: function(event) {
		$('.ui-dialog-buttonpane').find('button:contains("Save")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-primary');
		$('.ui-dialog-buttonpane').find('button:contains("Cancel")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-default');
	 }
});

function updateStockCorrection(item){
	var crrctQty = $("#invencorrect-qty").val();
	var reason = $("#invencorrect-reason").val();
	if(crrctQty && Number(crrctQty)!==0 && reason) {
		alasql("insert into stockcorrection values("+getNextInsertId("stockcorrection") 
				+ "," + item.pstockid + "," + Number(crrctQty) + ",'" 
				+ reason + "','" + (new Date()).toLocaleString() + "')");
		alasql("update stock set balance=balance-"+ Number(crrctQty) + " where id=" + Number(item.pstockid));
	}
	refreshInvenCorrectGrids();
}

function refreshInventoryGrid(){
	$("#invencorrect-items").jsGrid("render");
}

$("#invencorrect-items").jsGrid({
	width:"1250px",
	filtering: true,
	sorting: true,
    autoload: true,
    editing:true,
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
    		var products = alasql("select stock.id as pstockid, products.id as prodid, stock.cstock as cstock, stock.cstock_type as cstock_type, products.id as prodid, stock.whouse as whouse, stock.balance as qty, products.code as code, " +
    				"products.category as category, products.detail as detail, products.make as make, products.price as price, products.unit as unit" +
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
    			iitem.pprice = prd.price;
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
        				));
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
    		
    		return  {data: pageData(filtered, filter.pageIndex, filter.pageSize), itemsCount: filtered.length};;
    	},
    	
    },
    fields: [
    		 { name: "pckb", title: "", type: "checkbox", align: "center", filtering:false, sorting:false, css:"pckbheader",
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
	         { name: "pimg", title: "", type: "text", editing:false, sorting:false, filtering: false, css:"pimgheader", align:"center",
	     		
	    		 itemTemplate: function(value, item) {
	                 return "<img style='width:40px;height:40px' src='img/" + item.prodid + ".jpg'>";
	             },
	             
	             editTemplate: function(value, item) {
	                 return "<img style='width:40px;height:40px' src='img/" + item.prodid + ".jpg'>";
	             },
	         },
             { name: "pcode", title: "PROD CODE", type: "text", editing:false,sorting:true, align:"center",
	    		 headerTemplate: function() {
	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
	         	}	 
             },
             { name: "pcat", title: "CATEGORY", type: "select", editing:false, items:getCategoriesLOV(), valueField: "id", textField: "text",align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "plocId", title: "SHELF", type: "text", editing:false, sorting:true, align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "pmake", title: "MAKER", type: "select", editing:false, items:getMakersLOV(), valueField: "id", textField: "text",  align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "pdetail", title: "DETAIL", type: "text",  editing:false, align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "whouse", title: "WAREHOUSE", type: "select", editing:false, items:getWarehousesLOV(), valueField: "id", textField: "text", align:"center",
            	 headerTemplate: function() {
 	         		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
 	         	}	 
             },
             { name: "inWarehouse", title: "Qty in Warehouse", type: "text", align:"center", editing:false,
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
             { type:"control",
               deleteButton: false,
               editButton: false,
               itemTemplate: function(value, item) {
            	   
            	   return this._createGridButton("jsgrid-edit-button", "Edit", function(grid) {
            		   invenCorrectItems[item.pstockid] = item;
            		   invencorrectDlg.dialog("open");
                   }).appendTo($("<div>"));
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

            	   var filter = $("#invencorrect-items").jsGrid("getFilter");
            	   console.log(filter)
                   $("#invencorrect-items").jsGrid("option", "fields", updatedFields);
            	   $("#invencorrect-items").jsGrid("search", filter);
            	   restoreFilter(filter);
               }
           });
       }
});

function restoreFilter(filter) {
	var fields = $("#invencorrect-items").data("JSGrid").fields;

	for (var i = 0; i < fields.length; i++) {
		if (fields[i].visible && fields[i].name in filter) {
			var $cell = $("#invencorrect-items").data("JSGrid")._filterRow
					.children().eq(i);

			if ($cell.find("select").length == 1) {
				$cell.find("select").eq(0).val(filter[fields[i].name])
			} else if ($cell.find("input").length == 1) {
				$cell.find("input").eq(0).val(filter[fields[i].name])
			}

		}
	}
}

function getNextInsertId(table) {
	var rows = alasql("select max(id) as id from " + table);
	var maxID = 0;
	if(rows && rows.length>0 && rows[0].id) maxID = rows[0].id;
	return ++maxID;
}


$("#invencorrect-items").on({
    mouseenter: function(){
  	    var rows;
    	var item;
    	if(!$(this).hasClass("jsgrid-header-row") && !$(this).hasClass("jsgrid-filter-row")) {
    		item = $(this).data("JSGridItem");
            $("#recent-invencorrection").html("");
            if(item) {
                $("#recent-invencorrection-text").html("for <span style='color:blue'>" + item.pcode + "</span> in <span style='color:blue'>" 
                		+ global_warehouse_map[item.whouse] + "</span> warehouse");
                rows = alasql("select lastupdate, correctionQty, message from stockcorrection where stockid = " + item.pstockid);	
            }

            if(rows && rows.length > 0) {
            	rows.forEach(function(r){
            		var $tr = $("<tr>");
            		$("<td>").text(r.lastupdate).appendTo($tr);
            		$("<td>").text(r.correctionQty).appendTo($tr);
            		$("<td>").text(r.message).appendTo($tr);
            		$tr.appendTo($("#recent-invencorrection"));
            	});
            } else {
            	var $tr = $("<tr>");
        		$("<td>").text("No data available.").appendTo($tr);
        		$tr.appendTo($("#recent-invencorrection"));
            }
    	}
        
    },
    mouseleave: function(){
    	loadFullAdjustmentData();
    }
}, "tr");

function loadFullAdjustmentData() {
	$("#recent-invencorrection-text").text("for the products shown.");
	$("#recent-invencorrection").html("");
	var stockIDs = [];
	
	if($("#invencorrect-items").data("JSGrid")) {
    	var gData = $("#invencorrect-items").data("JSGrid").data;
    	gData.forEach(function(r){
    		stockIDs.push(r.pstockid);
    	});	
	}
	if(stockIDs.length!=0) {
		var rows = alasql("select lastupdate, correctionQty, message from stockcorrection where stockid IN (" + stockIDs.join(",") + ")");
        $("#recent-invencorrection").html("");
        if(rows && rows.length > 0) {
        	rows.forEach(function(r){
        		var $tr = $("<tr>");
        		$("<td>").text(r.lastupdate).appendTo($tr);
        		$("<td>").text(r.correctionQty).appendTo($tr);
        		$("<td>").text(r.message).appendTo($tr);
        		$tr.appendTo($("#recent-invencorrection"));
        	});
        }
	} else {
    	var $tr = $("<tr>");
		$("<td>").text("No data available.").appendTo($tr);
		$tr.appendTo($("#recent-invencorrection"));
    }
}
