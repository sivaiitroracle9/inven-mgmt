//---- Initialization ------- //
$("input.auto-po").each(function(){
	var value = 0;
	var stocks = alasql("select autopo from stock");
	if(stocks!=undefined && stocks.length!=0) value = stocks[0].autopo;
	
	if($(this).val() == value) $(this).prop('checked', true);
});

var settings_inventory_items_stock = [];

$("#cstock-spc-items").jsGrid({
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
    	
    	alasql("UPDATE stock set cstock=" + args.item.cstock + ", cstock_type=0 where id=" + args.item.stockid);
    	toastr.clear();
						toastr.success("Critical stock for { "
								+ args.item.whouse + ","
								+ args.item.pcat + ","
								+ args.item.pcode + " } set to " + args.item.threshold);
    },
    
    controller: {
    	loadData: function(filter) {
    		
    		var products = alasql("select stock.id as stockid, products.id as id, stock.whouse as whouse, stock.balance as qty, products.code as code, " +
    				"products.category as category, products.detail as detail, products.make as make, products.price as price, products.unit as unit," +
    				" stock.cstock as cstock from products JOIN stock ON products.id=stock.item");
    		
    		var settings_inventory_items_stock = [];
    		products.forEach(function(prd){
    			var iitem = {};
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
    		return filtered;
    	},
    	
    },
    fields: [
    	 { name: "whouse", title: "WAREHOUSE", type: "select", items:getWarehousesLOV(), valueField: "id", textField: "text",editing:false},
         { name: "pcat", title: "CATEGORY", type: "select", items:getCategoriesLOV(), valueField: "id", textField: "text",editing:false},
         { name: "pcode", title: "PROD CODE", type: "text", editing:false},
         { name: "pmake", title: "MAKER", type: "select", items:getMakersLOV(), valueField: "id", textField: "text",editing:false},
         { name: "pdetail", title: "DETAIL", type: "text",editing:false},
         { name: "pprice", title: "PRICE ", type: "number", filtering: false,editing:false},   
         { name: "inStock", title: "In Stock QTY", type: "number",editing:false},
         { name: "cstock", title: "THRESHOLD", type: "number"},
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

$("input.auto-po").change(function() {
	if ($(this).is(":checked")) {
		$(this).siblings("input").each(function() {
			$(this).prop('checked', false);
		});
		alasql("UPDATE stock set autopo = " + $(this).val());
	}
});

$("input.cstock-set").change(function() {
	if ($(this).is(":checked")) {
		$(this).siblings("input").each(function() {
			$(this).prop('checked', false);
			$("#"+$(this).attr("id")+"-items").hide();
		});
		$("#"+$(this).attr("id")+"-items").show();
		$("#cstock-spc-items").jsGrid("reset");
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
	$("#cstock-spc-items").jsGrid("render");
	$("#inventory-items").jsGrid("render");
});
