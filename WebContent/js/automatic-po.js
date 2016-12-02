var automatic_stock_items_selected = {};
var automatic_stock_items = [];
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
    
    onItemUpdated: function(args){

    	toastr.clear();
						toastr.success("Critical stock for { "
								+ args.item.whouse + ","
								+ args.item.pcat + ","
								+ args.item.pcode + " } set to " + args.item.threshold);
    },
    
    controller: {
    	loadData: function(filter) {
    		
    		var products = alasql("select stock.id as stockid, products.id as pid, " +
    				"stock.venpref as venpref, " +
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
    			iitem.venpref = prd.venpref;
    			automatic_stock_items.push(iitem);
    		});

    		var filtered = $.grep(automatic_stock_items, function(iitem){
    			return ((!filter["whouse"] || filter["whouse"]===0 || filter["whouse"] === iitem["whouse"])
    					&& (!filter["pcat"] || filter["pcat"]===0 || filter["pcat"] === iitem["pcat"])
    					&& (!filter["pcode"] || filter["pcode"]==="" || iitem["pcode"].indexOf(filter["pcode"]))!=-1
    					&& (!filter["pmake"] || filter["pmake"]===0 || filter["pmake"] === iitem["pmake"])
    					&& (!filter["pdetail"]  || filter["pdetail"]==="" || iitem["pdetail"].indexOf(filter["pdetail"]))!=-1
    					&& (!filter["venpref"] || filter["venpref"]===0 || filter["venpref"] === iitem["venpref"])
    					&& (!filter["pprice"] || filter["pprice"] === iitem["pprice"]));
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
         { name: "pimg", title: "IMG", type: "text", editing:false, width:70, sorting:false, filtering: false, css:"pimgheader",
    		 itemTemplate: function(value, item) {
    			 if(item != undefined)
    				 return "<img style='width:40px;height:40px' src='img/" + item.pid + ".jpg'>";
             },
         },
    	 { name: "whouse", title: "WAREHOUSE", width:"100px", type: "select", items:getWarehousesLOV(), valueField: "id", textField: "text",editing:false},
         { name: "pcat", title: "CATEGORY", width:"100px", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text",editing:false},
         { name: "pcode", title: "PROD CODE", width:"100px", type: "text", editing:false},
         { name: "pmake", title: "MAKER", width:"100px", type: "select", items:getMakersLOV(), valueField: "id", textField: "text",editing:false},
         { name: "pdetail", title: "DETAIL", width:"100px", type: "text", editing:false},
         { name: "inStock", title: "In Stock QTY", type: "number",editing:false},
         { name: "cstock", title: "REORDER POINT", type: "number"},
         { name: "venpref", title: "PREFERRED VENDOR", width:"100px", 
        	 type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text",
        	 headerTemplate: function(){
        		 return "<span class='label label-primary' style='font-weight:bold'>" + this.title + "</span>";
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

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	refreshVendorPrefGrids();
});

function toggleGroupPO(){
	if(Object.keys(inventory_items_selected).length!=0) $("#inven-grp-po").prop("disabled", false);
	else $("#inven-grp-po").prop("disabled", true);
}
