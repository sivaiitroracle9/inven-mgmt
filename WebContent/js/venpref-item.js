var vendorpref_items_selected = {};
var vendorpref_items = [];
init();

$("#venpref-4").jsGrid({
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
    		
    		vendorpref_items = [];
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
    			vendorpref_items.push(iitem);
    		});

    		var filtered = $.grep(vendorpref_items, function(iitem){
    			return ((!filter["whouse"] || filter["whouse"]===0 || filter["whouse"] === iitem["whouse"])
    					&& (!filter["pcat"] || filter["pcat"]===0 || filter["pcat"] === iitem["pcat"])
    					&& (!filter["pcode"] || filter["pcode"]==="" || iitem["pcode"].indexOf(filter["pcode"]))!=-1
    					&& (!filter["pmake"] || filter["pmake"]===0 || filter["pmake"] === iitem["pmake"])
    					&& (!filter["pdetail"]  || filter["pdetail"]==="" || iitem["pdetail"].indexOf(filter["pdetail"]))!=-1
    					&& (!filter["pprice"] || filter["pprice"] === iitem["pprice"])
    					&& (!filter.venpref || filter.venpref.type == 0 || ((filter.venpref.type == iitem.venpref.type) 
    																			&& (filter.venpref.selection==0 || filter.venpref.selection==iitem.venpref.selection)))
        				);
    		});
    		vendorpref_items_selected = {};
    		filtered.forEach(function(f){
    			vendorpref_items_selected[f.stockid] = f;
    		});
    		toggleGroupVP();
    		return filtered;
    	},
    	
    	updateItem: function(item){
    		alasql("UPDATE stock set venpref=" + Number(item.venpref.selection) + ", venpreftype=" + Number(item.venpref.type) + " where id=" + Number(item.stockid));
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
							 vendorpref_items_selected[d.stockid] = d;
				    	 });
					 } else {
						 $("input.pckb-item").each(function(){
 							$(this).prop('checked', false); 
 						 });
						 vendorpref_items_selected = {};
					 }
				 });
			 },
		 
    		 itemTemplate: function(value, item) {
                 return $("<input class='pckb-item' id='pckb-item-" + item.stockid + "' checked>").attr("type", "checkbox").change(function(){
                	 var id = Number($(this).attr("id").slice(10));
                	 
                	 if($(this).is(":checked")){
                		 vendorpref_items_selected[item.stockid] = item;
                	 } else {
                		 delete vendorpref_items_selected[item.stockid];
                	 }
                	 
                	 if($("#venpref-4").data("JSGrid").data.length === Object.keys(vendorpref_items_selected).length) 
                		 $("input#pckb-header").prop('checked', true);
                	 else 
                		 $("input#pckb-header").prop('checked', false);
                	 
                	 toggleGroupVP();
                 });
             },
    	 },
         { name: "pimg", title: "IMG", type: "text", editing:false, width:70, sorting:false, filtering: false, css:"pimgheader",
    		 itemTemplate: function(value, item) {
    			 if(item != undefined)
    				 return "<img style='width:40px;height:40px' src='img/" + item.pid + ".jpg'>";
             },
             editTemplate: function(value, item) {
    			 if(item != undefined)
    				 return "<img style='width:40px;height:40px' src='img/" + item.pid + ".jpg'>";
             },
         },
    	 { name: "whouse", title: "WAREHOUSE", width:"100px", type: "select", items:getWarehousesLOV(), valueField: "id", textField: "text",editing:false},
         { name: "pcat", title: "CATEGORY", width:"100px", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text",editing:false},
         { name: "pcode", title: "PROD CODE", width:"100px", type: "text", editing:false},
         { name: "pmake", title: "MAKER", width:"100px", type: "select", items:getMakersLOV(), valueField: "id", textField: "text",editing:false},
         { name: "pdetail", title: "DETAIL", width:"100px", type: "text", editing:false},
         { name: "inStock", title: "In Warehouse QTY", type: "number",editing:false},
         { name: "venpref", title: "PREFERRED VENDOR", width:"250px", align:"center",
        	 
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
       				var filter = $("#venpref-4").jsGrid("getFilter");
       				$("#venpref-4").jsGrid("search", filter);
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
       				var filter = $("#venpref-4").jsGrid("getFilter");
       				$("#venpref-4").jsGrid("search", filter);
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


function init() {
	 $("<option selected>").val(0).text("").appendTo($("#venpref-type"));
	 $("<option>").val(1).text("SPECIFIC").appendTo($("#venpref-type"));
	 $("<option>").val(2).text("GENERAL").appendTo($("#venpref-type"));
	 
	 $("#venpref-type").val(0);
	 $("#venpref-selection").val(0);
}
$("#venpref-type").change(function(evt){
    $("#venpref-selection").empty();
    var val = $(this).val();
	if(val == 1) {
		getVendorsLOV().forEach(function(d){
			$("<option>").val(Number(d.id)).text(d.text).appendTo( $("#venpref-selection"));
		});
	} else if(val==2) {
		getVendorPrefSpecificLOV().forEach(function(d){
			$("<option>").val(Number(d.id)).text(d.text).appendTo( $("#venpref-selection"));
		});
	}
	toggleGroupVP();
});
$("#venpref-selection").change(function(){
		toggleGroupVP();
});
function toggleGroupVP(){
	var type = $("#venpref-type").val();
	var selection = $("#venpref-selection").val();
	if(Object.keys(vendorpref_items_selected).length!=0 && type!=0 && selection !=0 ) 
		$("#btn-group-venpref").removeClass("disabled");
	else $("#btn-group-venpref").addClass("disabled");
}

$("#btn-group-venpref").click(function(evt){
	var type = $("#venpref-type").val();
	var selection = $("#venpref-selection").val();
	if(Object.keys(vendorpref_items_selected).length!=0 && type!=0 && selection !=0 ) {
		var stockIDs = Object.keys(vendorpref_items_selected);
		alasql("UPDATE stock set venpref=" + Number(selection) + ", venpreftype=" + Number(type) + " where id IN (" + stockIDs.join(",") + ");");
	}
	refreshVendorPrefItem();
});
