function getWarehousesLOV() {
	var rows = alasql('SELECT * FROM whouse;');
	var data = {};
	data[0] = "-- All Warehouses --";
	if(rows) {
		rows.forEach(function(r){
			data[r.id] = r.name;
		})
	}
	return data;
}

function getCategoriesLOV() {
	var rows = alasql('SELECT * FROM kind;');
	var data = {};
	data[0] = "-- All Categories --";
	if(rows) {
		rows.forEach(function(r){
			data[r.id] = r.text;
		})
	}
	return data;
}

function getProductsLOV(kind) {
	var data = {};
	data[0] = "-- All Products --";
	var rows;
	if (kind && Number(kind) != 0) {
		rows = alasql('SELECT * FROM products where category=' + Number(kind)
				+ ';');
	} else {
		rows = alasql('SELECT * FROM products;');
	}
	if (rows) {
		rows.forEach(function(r) {
			data[r.id] = r.detail;
		})
	}
	return data;
}