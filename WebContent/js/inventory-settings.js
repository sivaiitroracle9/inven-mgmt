//---- Initialization ------- //
$("input.auto-po").each(function(){
	var value = 0;
	var stocks = alasql("select autopo from stock");
	if(stocks!=undefined && stocks.length!=0) value = stocks[0].autopo;
	
	if($(this).val() == value) $(this).prop('checked', true);
});
$("#grp-reorder-point-input").val("");

var settings_inventory_items_stock = [];
var settings_inventory_items_stock_selected = {};
$("#cstock-spc-items-grid").jsGrid({
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
    	alasql("UPDATE stock set cstock=" + args.item.cstock + " where id=" + args.item.stockid);
    	toastr.clear();
    	toastr.success("for " + args.item.pcode,"Reorderpoint update, Sucess");
    },
    
    controller: {
    	loadData: function(filter) {
    		
    		var products = alasql("select stock.id as stockid, products.id as pid, stock.whouse as whouse, stock.balance as qty, products.code as code, " +
    				"products.category as category, products.detail as detail, products.make as make, products.price as price, products.unit as unit," +
    				" stock.cstock as cstock from products JOIN stock ON products.id=stock.item");
    		
    		var settings_inventory_items_stock = [];
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
    			settings_inventory_items_stock.push(iitem);
    		});
    		
    		var filtered = $.grep(settings_inventory_items_stock, function(iitem){
    			return ((!filter["whouse"] || filter["whouse"]===0 || filter["whouse"] === iitem["whouse"])
    					&& (!filter["pcat"] || filter["pcat"]===0 || filter["pcat"] === iitem["pcat"])
    					&& (!filter["pcode"] || filter["pcode"]==="" || iitem["pcode"].indexOf(filter["pcode"]))!=-1
    					&& (!filter["pmake"] || filter["pmake"]===0 || filter["pmake"] === iitem["pmake"])
    					&& (!filter["pdetail"]  || filter["pdetail"]==="" || iitem["pdetail"].indexOf(filter["pdetail"]))!=-1
    					&& (!filter["inStock"] || filter["inStock"]==="" || filter["inStock"] === iitem["inStock"])
    					&& (!filter["pprice"] || filter["pprice"] === iitem["pprice"]));
    		});
    		
    		settings_inventory_items_stock_selected = {};
    		filtered.forEach(function(f){
    			settings_inventory_items_stock_selected[f.stockid] = f;
    		});
    		toggleGroupRP();
    		
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
						 $("#cstock-spc-items-grid").data("JSGrid").data.forEach(function(d){
							 settings_inventory_items_stock_selected[d.stockid] = d;
				    	 });
					 } else {
						 $("input.pckb-item").each(function(){
 							$(this).prop('checked', false); 
 						 });
						 settings_inventory_items_stock_selected = {};
					 }
				 });
			 },
		 
    		 itemTemplate: function(value, item) {
                 return $("<input class='pckb-item' id='pckb-item-" + item.stockid + "' checked>").attr("type", "checkbox").change(function(){
                	 var id = Number($(this).attr("id").slice(10));
                	 
                	 if($(this).is(":checked")){
                		 settings_inventory_items_stock_selected[item.stockid] = item;
                	 } else {
                		 delete settings_inventory_items_stock_selected[item.stockid];
                	 }
                	 
                	 if($("#cstock-spc-items-grid").data("JSGrid").data.length === Object.keys(settings_inventory_items_stock_selected).length) 
                		 $("input#pckb-header").prop('checked', true);
                	 else 
                		 $("input#pckb-header").prop('checked', false);
                	 
                	 toggleGroupRP();
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
    	 { name: "whouse", title: "WAREHOUSE", type: "select", items:getWarehousesLOV(), valueField: "id", textField: "text",editing:false},
         { name: "pcat", title: "CATEGORY", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text",editing:false},
         { name: "pcode", title: "PROD CODE", type: "text", editing:false},
         { name: "pdetail", title: "DETAIL", type: "text",editing:false},
         { name: "inStock", title: "In Stock QTY", type: "number",editing:false},
         { name: "cstock", title: "REORDER POINT", type: "number"},
         { type: "control", deleteButton: false,}
       ]
});

function loadStock(){
	var products = alasql("select products.id as id, stock.whouse as whouse, stock.balance as qty, products.code as code, " +
			"products.category as category, products.detail as detail, products.make as make, products.price as price, products.unit as unit" +
			" from products JOIN stock ON products.id=stock.item");
	
	var settings_inventory_items_stock = [];
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

$("input.auto-po").change(function() {
	if ($(this).is(":checked")) {
		$(this).siblings("input").each(function() {
			$(this).prop('checked', false);
		});
		alasql("UPDATE stock set autopo = " + $(this).val());
	}
	
	if($("input#auto-po-on").is(":checked")) {
		$("div#auto-po-on-div").show();
		refreshVendorPrefGrids();
	} else $("div#auto-po-on-div").hide();
});

$("input.cstock-set").change(function() {
	if ($(this).is(":checked")) {
		$(this).siblings("input").each(function() {
			$(this).prop('checked', false);
			$("#"+$(this).attr("id")+"-items").hide();
		});
		$("#"+$(this).attr("id")+"-items").show();
		refreshReorderPoint();
		refreshInventoryGrid();
	}
});

$("input.cstock-gnl-radio").change(function() {
	var $current = $(this);
	$("input.cstock-gnl-text#" + $current.attr("id")).prop("disabled", false);
	$("input.cstock-gnl-radio").each(function() {
		if ($current.is(":checked") && $current.attr("id") != $(this).attr("id")) {
			$(this).prop('checked', false);
			$("input.cstock-gnl-text#" + $(this).attr("id")).prop("disabled", true);
		}
	});
});

$("button#btn-cstock-gnl").on('click', function(){
	$("input.cstock-gnl-radio").each(function(){
		if($(this).is(":checked")) {
			var setVal = $("input.cstock-gnl-text#" + $(this).attr("id")).val();
			alasql("UPDATE stock set cstock="+Number(setVal) + ", cstock_type="+Number($(this).val()));
		}
	});
	refreshReorderPoint();
	refreshInventoryGrid();
});

function toggleGroupRP(){
	var input = $("#grp-reorder-point-input").val();
	var selection = $("#grp-reorder-point-select").val();
	if(Object.keys(settings_inventory_items_stock_selected).length!=0 && input!="" ) 
		$("#btn-grp-reorder-point").removeClass("disabled");
	else $("#btn-grp-reorder-point").addClass("disabled");
}

$("#grp-reorder-point-select, #grp-reorder-point-input").change(function(){
	toggleGroupRP();
});

$("#btn-grp-reorder-point").click(function(evt){
	var input = $("#grp-reorder-point-input").val();
	var selection = $("#grp-reorder-point-select").val();
	if(Object.keys(settings_inventory_items_stock_selected).length!=0 && input!="" )  {
		var stockIDs = Object.keys(settings_inventory_items_stock_selected);
		alasql("UPDATE stock set cstock=" + Number(input) + " where id IN (" + stockIDs.join(",") + ");");
    	toastr.clear();
    	toastr.success("for selected items","Reorderpoint update, Sucess");
	}
	refreshInventoryGrid();
	refreshReorderPoint();
});