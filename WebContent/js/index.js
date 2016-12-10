var whouse_map = getWarehousesLOV();
var cat_map = getCategoriesLOV();
var product_map = getProductsLOV();

init();

$("select#st-chart-cat").change(function(){
	var pmap = getProductsLOV($(this).val());
	$("select#st-chart-prod").html("");
	Object.keys(pmap).forEach(function(key){
		$("<option>").val(Number(key)).text(pmap[key]).appendTo($("select#st-chart-prod"));
	});
	generateStockQtyBarChart(warehouse, $("select#st-chart-type").val(), 
			$("select#st-chart-cat").val(), $("select#st-chart-prod").val(), date);
});
$("select#st-chart-prod").change(function(){
	var date = (new Date()).toLocaleDateString();
	generateStockQtyBarChart(warehouse, $("select#st-chart-type").val(), 
			$("select#st-chart-cat").val(), $("select#st-chart-prod").val(), date);
});

$("select#iv-chart-cat").change(function(){
	var pmap = getProductsLOV($(this).val());
	$("select#iv-chart-prod").html("");
	Object.keys(pmap).forEach(function(key){
		$("<option>").val(Number(key)).text(pmap[key]).appendTo($("select#iv-chart-prod"));
	});
});

$("select#global-warehouse").change(function(){
	var warehouse = $("#global-warehouse").val();
	var ivalue = setInventoryValue(warehouse);
	var date = (new Date()).toLocaleDateString();
	generateInventoryValueChart(ivalue, date);
	generateStockQtyBarChart(date)
	generateStockQtyBarChart(warehouse, $("select#st-chart-type").val(), 
			$("select#st-chart-cat").val(), $("select#st-chart-prod").val(), date);
});

function init(){
	Object.keys(whouse_map).forEach(function(key){
		$("<option>").val(Number(key)).text(whouse_map[key]).appendTo($("#global-warehouse"));
	});
	
	$("select.category-lov").each(function(){
		var $select = $(this);
		Object.keys(cat_map).forEach(function(key){
			$("<option>").val(Number(key)).text(cat_map[key]).appendTo($select);
		});
	});
	
	$("select.product-lov").each(function(){
		var $select = $(this);
		Object.keys(product_map).forEach(function(key){
			$("<option>").val(Number(key)).text(product_map[key]).appendTo($select);
		});
	});
	
	var warehouse = $("#global-warehouse").val();
	var ivalue = setInventoryValue(warehouse);
	var date = (new Date()).toLocaleDateString();
	generateInventoryValueChart(ivalue, date);
	generateStockQtyBarChart(warehouse, $("select#st-chart-type").val(), 
			$("select#st-chart-cat").val(), $("select#st-chart-prod").val(), date);
}

function setInventoryValue(whouse){
	var rows;
	var ivalue = 0;
	if(whouse && Number(whouse) !=0) {
		rows = alasql("select * from stock where whouse=" + Number(whouse));
	} else {
		rows = alasql("select * from stock");
	}
	if(rows) {
		rows.forEach(function(r){
			ivalue += (r.balance)*(r.price);
		});
	}
	$("#inwhouse-ivalue").text(ivalue.toLocaleString());
	return ivalue;
}