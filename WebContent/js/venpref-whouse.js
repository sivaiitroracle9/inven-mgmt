var automatic_stock_items_selected = {};
var vendorpref_whouse = [];
$("#venpref-2").jsGrid({
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
    		
    		vendorpref_whouse = {};
    		getWarehousesLOV().forEach(function(w){
    			if(w.id!=0) {
        			vendorpref_whouse[w.id] = {pckb: true, whouse:w.id, venpref:{ type:-1, selection:-1 }, different:false};	
    			}
    		})
    		products.forEach(function(prd){
    			if(vendorpref_whouse[prd.whouse].venpref.selection==-1 && vendorpref_whouse[prd.whouse].venpref.type==-1){
    				vendorpref_whouse[prd.whouse].venpref.selection = prd.venpref;
    				vendorpref_whouse[prd.whouse].venpref.type = prd.venpreftype;
    			} else if(!vendorpref_whouse[prd.whouse].different) {
    				if(vendorpref_whouse[prd.whouse].venpref.selection != prd.venpref 
    						&& vendorpref_whouse[prd.whouse].venpref.type != prd.venpreftype) {
    					vendorpref_whouse[prd.whouse].different = true;
    				}
    			}
    		});

    		var filtered = $.grep(Object.values(vendorpref_whouse), function(iitem){
    			return ((!filter["whouse"] || filter["whouse"]===0 || filter["whouse"] === iitem["whouse"])
    					&& (!filter.venpref || filter.venpref.type == 0 || ((filter.venpref.type == iitem.venpref.type) 
    																			&& (filter.venpref.selection==0 || filter.venpref.selection==iitem.venpref.selection)))
        				);
    		});
    		return filtered;
    	},
    	
    	updateItem: function(item){
    		alasql("UPDATE stock set venpref=" + Number(item.venpref.selection) + ", venpreftype=" + Number(item.venpref.type) + " where whouse=" + Number(item.whouse));
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
						 $("#venpref-2").data("JSGrid").data.forEach(function(d){
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
                	 
                	 if($("#venpref-2").data("JSGrid").data.length === Object.keys(automatic_stock_items_selected).length) 
                		 $("input#pckb-header").prop('checked', true);
                	 else 
                		 $("input#pckb-header").prop('checked', false);
                	 
                	 console.log(automatic_stock_items_selected);
                	 toggleGroupPO();
                 });
             },
    	 },
    	 { name: "whouse", title: "WAREHOUSE", width:"100px", type: "select", items:getWarehousesLOV(), valueField: "id", textField: "text",editing:false},
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
       				var filter = $("#venpref-2").jsGrid("getFilter");
       				$("#venpref-2").jsGrid("search", filter);
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
       				var filter = $("#venpref-2").jsGrid("getFilter");
       				$("#venpref-2").jsGrid("search", filter);
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

function toggleGroupPO(){
	if(Object.keys(inventory_items_selected).length!=0) $("#inven-grp-po").prop("disabled", false);
	else $("#inven-grp-po").prop("disabled", true);
}
