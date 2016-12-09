var automatic_stock_items_selected = {};
var automatic_stock_items = [];
$("#venpref-3").jsGrid({
	width:"100%",
	filtering: true,
	editing: true,
    sorting: true,
    autoload: true,
    paging: true,
    pageSize: 10,
    pageButtonCount: 10,
    updateOnResize: true,
    
    rowClick: function(){},
    
    onItemUpdated: function(args){ },
    
    controller: {
    	loadData: function(filter) {
    		
    		var products = alasql("select stock.id as stockid, products.id as pid, " +
    				"stock.venpref as venpref,stock.venpreftype as venpreftype, " +
    				"stock.whouse as whouse, stock.balance as qty, products.code as code, " +
    				"products.category as category, products.detail as detail, products.make as make, products.price as price, products.unit as unit," +
    				" stock.cstock as cstock from products JOIN stock ON products.id=stock.item");
    		
    		automatic_stock_items = [];
    		products.forEach(function(prd){
    			var iitem = {};
    			iitem.pckb = true;
    			iitem.pid = prd.pid;
    			iitem.stockid = prd.stockid;
    			iitem.whouse = prd.whouse;
    			iitem.pcat = prd.category;
    			iitem.pcode = prd.code;
    			iitem.pmake = prd.make;
    			iitem.pdetail = prd.detail;
    			iitem.pprice = prd.price;
    			iitem.inStock = prd.qty;
    			iitem.cstock = prd.cstock;
    			var venpref = {};
    			venpref.type = prd.venpreftype;
    			venpref.selection = prd.venpref;
    			iitem.venpref = venpref;
    			automatic_stock_items.push(iitem);
    		});

    		var filtered = $.grep(automatic_stock_items, function(iitem){
    			return ((!filter["whouse"] || filter["whouse"]===0 || filter["whouse"] === iitem["whouse"])
    					&& (!filter["pcat"] || filter["pcat"]===0 || filter["pcat"] === iitem["pcat"])
    					&& (!filter.venpref || filter.venpref.type == 0 || ((filter.venpref.type == iitem.venpref.type) 
    																			&& (filter.venpref.selection==0 || filter.venpref.selection==iitem.venpref.selection)))
        				);
    		});
    		return filtered;
    	},
    	
    	updateItem: function(item){
    		alasql("UPDATE stock set venpref=" + item.venpref + " where id=" + item.stockid);
    	}
    	
    },
    fields: [
		 { name: "pckb", title: "", type: "checkbox", align: "center", filtering:false, sorting:false, width:20, css:"pckbheader",
			 headerTemplate: function(value, item) {
				 return $("<input id='pckb-header' checked>").attr("type", "checkbox").change(function(){
					 if($(this).is(":checked")){
						 $("input.pckb-item").each(function(){
							$(this).prop('checked', true); 
						 });
						 $("#venpref-4").data("JSGrid").data.forEach(function(d){
							 automatic_stock_items_selected[d.pstockid] = d;
				    	 });
					 } else {
						 $("input.pckb-item").each(function(){
 							$(this).prop('checked', false); 
 						 });
						 automatic_stock_items_selected = {};
					 }
				 });
			 },
		 
    		 itemTemplate: function(value, item) {
                 return $("<input class='pckb-item' id='pckb-item-" + item.stockid + "' checked>").attr("type", "checkbox").change(function(){
                	 var id = Number($(this).attr("id").slice(10));
                	 
                	 if($(this).is(":checked")){
                		 automatic_stock_items_selected[item.pstockid] = item;
                	 } else {
                		 delete automatic_stock_items_selected[item.pstockid];
                	 }
                	 
                	 if($("#venpref-4").data("JSGrid").data.length === Object.keys(automatic_stock_items_selected).length) 
                		 $("input#pckb-header").prop('checked', true);
                	 else 
                		 $("input#pckb-header").prop('checked', false);
                	 
                	 console.log(automatic_stock_items_selected);
                	 toggleGroupPO();
                 });
             },
    	 },
    	 { name: "whouse", title: "WAREHOUSE", width:"100px", type: "select", items:getWarehousesLOV(), valueField: "id", textField: "text",editing:false},
         { name: "pcat", title: "CATEGORY", width:"100px", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text",editing:false},
         { name: "venpref", title: "PREFERRED VENDOR", width:"250px", align:"center",
        	 headerTemplate: function(){
        		 return "<span class='label label-primary' style='font-weight:bold'>" + this.title + "</span>";
        	 },
        	 
        	 itemTemplate: function(value, item){
        		 
        		 var str = "";
        		 if(value.type == 1) str = "<span class='label label-default' style='margin:4px;float:left'>SPECIFIC</span>";
        		 else str = "<span class='label label-primary' style='margin:4px;float:left'>GENERAL</span>";
        		 
        		 if(value.type == 1) {
        			 getVendorsLOV().forEach(function(d){
   						if(d.id == value.selection) {
   							str += "<span style='font-weight:bold'>" + d.text + "</span>";
   						}
   					});
        		 } else if(value.type == 2) {
        			 getVendorPrefSpecificLOV().forEach(function(d){
    						if(d.id == value.selection) {
    							str += "<span style='font-weight:bold'>" + d.text + "</span>";
    						}
    					});
        		 }
        		 return str;
        	 },
        	 
        	 editTemplate: function(){
        		var selection = $("<select style='width:200px;margin-left:4px'>");
				getVendorsLOV().forEach(function(d){
					if(d.id != 0) {
						$("<option>").val(Number(d.id)).text(d.text).appendTo(selection);
					}
				});
					
      			var type = $("<select style='width:150px'>").on('change', function (e) {
      		    	var val = $(this).val();
      		    	selection.empty();
      				if(val == 1) {
      					getVendorsLOV().forEach(function(d){
      						if(d.id != 0) {
      							$("<option>").val(Number(d.id)).text(d.text).appendTo(selection);
      						}
      					});
      				} else if(val==2){
      					getVendorPrefSpecificLOV().forEach(function(d){
      						if(d.id != 0) {
      							$("<option>").val(Number(d.id)).text(d.text).appendTo(selection);
      						}
      					});
      				}
 				});
     			$("<option selected>").val(1).text("SPECIFIC").appendTo(type);
     			$("<option>").val(2).text("GENERAL").appendTo(type);

     			this._typePicker = type;
     			this._selectionPicker = selection;
            return $("<div>").append(this._typePicker).append(this._selectionPicker);
        		 
        	 },
        	 
        	 editValue: function(){
        		 return {
        			type: this._typePicker.val(),
        		 	selection: this._selectionPicker.val(),
        		 };
        	 },
        	 
        	 filterTemplate: function(){
         		var selection = $("<select style='width:200px;margin-left:4px'>").on('change', function (e) {
       				var filter = $("#venpref-3").jsGrid("getFilter");
       				$("#venpref-3").jsGrid("search", filter);
         		});
         		
 				getVendorsLOV().forEach(function(d){
 					$("<option>").val(Number(d.id)).text(d.text).appendTo(selection);
 				});
 					
       			var type = $("<select style='width:150px'>").on('change', function (e) {
       		    	var val = $(this).val();
       		    	selection.empty();
       				if(val == 1) {
       					getVendorsLOV().forEach(function(d){
       						$("<option>").val(Number(d.id)).text(d.text).appendTo(selection);
       					});
       				} else if(val==2) {
       					getVendorPrefSpecificLOV().forEach(function(d){
       						$("<option>").val(Number(d.id)).text(d.text).appendTo(selection);
       					});
       				}
       				var filter = $("#venpref-3").jsGrid("getFilter");
       				$("#venpref-3").jsGrid("search", filter);
  				});
       		 $("<option selected>").val(0).text("").appendTo(type);
      		 $("<option>").val(1).text("SPECIFIC").appendTo(type);
      		 $("<option>").val(2).text("GENERAL").appendTo(type);

      		 this._typePicker = type;
      		 this._selectionPicker = selection;
             return $("<div>").append(this._typePicker).append(this._selectionPicker);
         		 
         	 },
         	 
         	 filterValue: function(){
         		 return {
         			type: this._typePicker.val(),
         		 	selection: this._selectionPicker.val(),
         		 };
         	 }
         },
         { type: "control", deleteButton: false,}
       ]
});

function refreshVendorPrefGrids(){
	$("#venpref-4").jsGrid("reset");
	$("#venpref-4").jsGrid("render");
	$("#venpref-4").jsGrid("loadData");
}


function toggleGroupPO(){
	if(Object.keys(inventory_items_selected).length!=0) $("#inven-grp-po").prop("disabled", false);
	else $("#inven-grp-po").prop("disabled", true);
}
