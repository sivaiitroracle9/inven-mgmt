var saveMakeClient = function(maker, isNew) {
	
	var dbmaker = {};
	var id = 0;
	if(isNew) dbmaker = maker;
	else id = maker["id"];
	
	$.extend(dbmaker, {
    	text: $("#make_maker").val(),
    });

    isNew ? addMaker(dbmaker) : updateMaker(id, dbmaker);
    makerDialog.dialog("close");
    reloadMakersGrid();
};

function reloadProductsGrid() {
	var fields = $("#productsGird").data("JSGrid").fields;
	fields.forEach(function(f){
		if(f.name === "maker") {
			f.items = getMakersFromDB();
		}
		
		if(f.name === "category") {
			f.items = getCategoriesFromDB();
		}
	});
	$("#productsGird").jsGrid("option", "fields", fields);
	console.log($("#productsGird"))
	$("#productsGird").jsGrid("render");
	$("#productsGird").jsGrid("reset");
	$("#productsGird").jsGrid("loadData");
}

function reloadMakersGrid() {
	$("#makersGird").jsGrid("render");
	$("#makersGird").jsGrid("loadData");
}

function reloadCategoriesGrid() {
	$("#categoriesGird").jsGrid("render");
	$("#categoriesGird").jsGrid("loadData");
}

function addMaker(maker) {
	var values = [];
	values.push(Number(getNextInsertId("maker")));

	Object.keys(maker).forEach(function(key) {
		if(key == "text")
			values[1] = maker[key];
	});
	alasql("INSERT INTO maker VALUES(?,?)", values);
}

function updateMaker(id, maker) {
	var query = "update maker set text='" + maker["text"] + "' where id = " + Number(id);
	console.log(query)
	alasql(query);
}

function getMakersTbl(select) {
	var data = [];
	getMakersFromDB().forEach(function(r) {

		if(select == true) {
			var d = {};
			d["id"] = r["id"];
			d["maker"] = r["text"];
			data.push(d);
		} else if(r["id"]!=0) {
			var d = {};
			d["makercode"] = r["id"];
			d["id"] = r["id"];
			d["maker"] = r["id"];
			d["makertext"] = r["text"];
			data.push(d);
		}
	});
	return data;
}

var saveCatClient = function(category, isNew) {
	
	var dbcategory = {};
	var id = 0;
	if(isNew) dbcategory = category;
	else id = category["id"];
	
	$.extend(dbcategory, {
    	text: $("#cat_cat").val(),
    });

    isNew ? addCategory(dbcategory) : updateCategory(id, dbcategory);
    categoryDialog.dialog("close");
    reloadCategoriesGrid();
};

function addCategory(category) {
	var values = [];
	values.push(Number(getNextInsertId("kind")));

	Object.keys(category).forEach(function(key) {
		if(key == "text")
			values[1] = category[key];
	});
	alasql("INSERT INTO kind VALUES(?,?)", values);
}

function updateCategory(id, category) {
	var query = "update kind set text='" + category.text + "' where id = " + id;
	console.log(query)
	alasql(query);
}

function getCategoriesTbl(select) {
	var data = [];
	getCategoriesFromDB().forEach(function(r) {

		if(select == true) {
			var d = {};
			d["ID"] = r["id"];
			d["CAT"] = r["text"];
			data.push(d);
		} else if(r["id"]!=0) {
			var d = {};
			d["CAT CODE"] = r["id"];
			d["ID"] = r["id"];
			d["CATEGORY"] = r["id"];
			data.push(d);
		}
	});
	return data;
}

function updateProduct(id, product) {
	var query = "update products set ";
	
	var set = [];
	Object.keys(product).forEach(function(key){
		if(key == "code" || key == "detail" || key == "unit")
			set.push(key + "='" + product[key] +"'");
		else set.push(key + "=" + product[key]);
	});
	
	query += set.join(", ");
	query += " where id=" + id;
	console.log(query)
	alasql(query);
}

var saveProdClient = function(product, isNew) {
	
	var dbproduct = {};
	var id = 0;
	if(isNew) dbproduct = product;
	else id = product["id"];
	
	$.extend(dbproduct, {
    	code: $("#prod_code").val(),
    	category: Number($("#prod_cat").val()),
    	detail: $("#prod_detail").val(),
    	make: Number($("#prod_maker").val()),
    	price: Number($("#prod_price").val()),
    	unit: $("#prod_unit").val(),
    });

    isNew ? addProduct(dbproduct) : updateProduct(id, dbproduct);
    productDialog.dialog("close");
    reloadProductsGrid();
};

function addProduct(product) {
	var rows = alasql("select max(id) as id from products");
	var values = [];
	if (rows.length == 1 && rows[0].id != undefined)
		values.push(Number(rows[0].id) + 1);
	else
		values.push(Number(1));

	Object.keys(product).forEach(function(key) {
		if(key == "code")
			values[1] = product[key];
		else if(key == "category")
			values[2] = product[key];
		else if(key == "detail")
			values[3] = product[key];
		else if(key == "make")
			values[4] = product[key];
		else if(key == "price")
			values[5] = product[key];
		if(key == "unit")
			values[6] = product[key];
	});
	alasql("INSERT INTO products VALUES(?,?,?,?,?,?,?)", values);
}

function getProductsFromDB(){
	
	var query = "select * from products";
	var product_rows = alasql(query);
	query = "select * from maker";
	var maker_map = {};
	alasql(query).forEach(function(maker){
		maker_map[maker.id] = maker.text;
	});
	query = "select * from kind";
	var kind_map = {};
	alasql(query).forEach(function(kind){
		kind_map[kind.id] = kind.text;
	});
	
	var data = [];
	if (maker_map != undefined && kind_map != undefined
			&& product_rows.length != 0 && maker_map.length != 0
			&& kind_map.length != 0) {

		product_rows.forEach(function(product) {
			var d = {};
			d["id"] = product.id;
			d["code"] = product.code;
			d["detail"] = product.detail;
			d["maker"] = product.make;
			d["category"] = product.category;
			d["price"] = product.price;
			d["unit"] = product.unit;
			data.push(d);
		});
	}
    return data;
}

function getMakersFromDB(){
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

function getCategoriesFromDB(){
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

function deleteProduct(product) {
	alasql("delete from products where id = " + product.id);
}

function deleteCategory(category) {
	alasql("delete from kind where id = " + Number(category.id));
}

function deleteMaker(maker) {
	alasql("delete from maker where id = " + Number(maker.id));
}

function sortCategories(data, field, sortOrder){
	if(sortOrder == "asc") {
	    return data.sort(function(a, b) {
	        var x = a[field]; var y = b[field];
	        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	    });
	} else {
	    return data.sort(function(a, b) {
	        var x = a[field]; var y = b[field];
	        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
	    });
	}
}

function sortProducts(data, field, sortOrder){
	if(sortOrder == "asc") {
	    return data.sort(function(a, b) {
	        var x = a[field]; var y = b[field];
	        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	    });
	} else {
	    return data.sort(function(a, b) {
	        var x = a[field]; var y = b[field];
	        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
	    });
	}
}

function pageData(data, pageIndex, pageSize) {
	var pageData;
	if(pageIndex!= undefined && pageSize!= undefined && pageIndex > 0) {
		pageData = data.slice((pageIndex - 1)*pageSize, pageIndex*pageSize)	
	} else {
		pageData = data;
	}
	return pageData;
}

function getNextInsertId(table) {
	var rows = alasql("select max(id) as id from " + table);
	var insertId = 0;
	if(rows != undefined && rows.length > 0 && rows[0].id != undefined) insertId = rows[0].id;
	return insertId + 1;
}

function getCategoryIdByName(category){
	var rows = alasql("select id from kind where text = '" + category + "'");
	if(rows != undefined && rows.length > 0 && rows[0].id != undefined) return rows[0].id;
}

function insertCategory(category) {
	var catId = getNextInsertId("kind");
	alasql("INSERT INTO kind VALUES("+ catId + ",'" + category +"')");
	return catId;
}

function getMakerIdByName(maker){
	var rows = alasql("select id from maker where text = '" + maker + "'");
	if(rows != undefined && rows.length > 0 && rows[0].id != undefined) return rows[0].id;
}

function insertMaker(maker) {
	var makerId = getNextInsertId("maker");
	alasql("INSERT INTO maker VALUES("+ makerId + ",'" + maker +"')");
	return makerId;
}
//-------------------------------------------------------------------------------------------------------------------------------
var import_products = {};
$("#input-products-file").change(function(event) {
    var data = null;
    var file = event.target.files[0];
    import_products = {};
    if(file.type =="application/vnd.ms-excel" && file.name.indexOf(".csv") != -1) {
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(event) {
            var csvData = event.target.result;
            console.log(csvData)
            csvData = csvData.split("\n");
            if(csvData.length > 1) {
            	for(var i = 1; i < csvData.length; i++) {
            		var csvDataLine = csvData[i].trim();
            		var csvDataLineVal = csvDataLine.split(",");
            		if(csvDataLineVal.length == 6) {
                		var prd = {};
                		prd["row-id"] = i;
                		prd["snum"] = i;
                		prd["code"] = csvDataLineVal[0].trim();
                		prd["category"] = (csvDataLineVal[1]).trim();
                		prd["detail"] = csvDataLineVal[2].trim();
                		prd["maker"] = csvDataLineVal[3].trim();
                		prd["price"] = csvDataLineVal[4].trim();
                		prd["unit"] = csvDataLineVal[5].trim();
                		import_products[i] = prd;	
            		}
            	}
            	importProdDialog.dialog("open");
            } else {
            	alert('No data to import!');
            }
        };
        reader.onerror = function() {
            alert('Unable to read ' + file.fileName);
        };
    }
});

function importProducts() {
	var importData = Object.values(import_products);
	if(importData.length > 0) {
		importData.forEach(function(data){
			var query = "INSERT INTO products VALUES (";
			var values = [];
			values[0] = getNextInsertId("products");
			
			values[1] = "'" + data["code"] + "'";
			
			var categoryId = getCategoryIdByName(data["category"]);
			if(categoryId == undefined) {
				categoryId = insertCategory(data["category"]);
			}
			values[2] = categoryId;
			
			values[3] = "'" + data["detail"] + "'";
			
			var makerId = getMakerIdByName(data["maker"]);
			if(makerId == undefined) {
				makerId = insertMaker(data["maker"]);
			}
			values[4] = makerId;
			
			values[5] = data["price"];
			values[6] = "'" + data["unit"] + "'";
			query += values.join(",");
			query += ")";
			alasql(query);
		});
		reloadProductsGrid();
	}
}

var import_categories = {};
$("#input-categories-file").change(function(event) {
    var data = null;
    var file = event.target.files[0];
    import_categories = [];
    if(file.type =="application/vnd.ms-excel" && file.name.indexOf(".csv") != -1) {
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(event) {
            var csvData = event.target.result;
            console.log(csvData)
            csvData = csvData.split("\n");
            if(csvData.length > 1) {
            	for(var i = 1; i < csvData.length; i++) {
            		var csvDataLine = csvData[i].trim();
            		var csvDataLineVal = csvDataLine.split(",");
            		if(csvDataLine!="" && csvDataLineVal.length == 1) {
                		var cat = {};
                		cat["row-id"] = i;
                		cat["snum"] = i;
                		cat["text"] = (csvDataLineVal[0]).trim();
                		import_categories[i] = cat;	
            		}
            	}
            	importCatDialog.dialog("open");
            } else {
            	alert('No data to import!');
            }
        };
        reader.onerror = function() {
            alert('Unable to read ' + file.fileName);
        };
    }
});

function importCategories() {
	var importData = Object.values(import_categories);
	if(importData.length > 0) {
		importData.forEach(function(data){
			var categoryId = getCategoryIdByName(data["text"]);
			if(categoryId == undefined) {
				categoryId = insertCategory(data["text"]);
			}
		});
		reloadCategoriesGrid();
	}
}

var import_makers = {};
$("#input-makers-file").change(function(event) {
    var data = null;
    var file = event.target.files[0];
    import_makers = [];
    if(file.type =="application/vnd.ms-excel" && file.name.indexOf(".csv") != -1) {
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(event) {
            var csvData = event.target.result;
            console.log(csvData)
            csvData = csvData.split("\n");
            if(csvData.length > 1) {
            	for(var i = 1; i < csvData.length; i++) {
            		var csvDataLine = csvData[i].trim();
            		var csvDataLineVal = csvDataLine.split(",");
            		if(csvDataLine!="" && csvDataLineVal.length == 1) {
                		var cat = {};
                		cat["row-id"] = i;
                		cat["snum"] = i;
                		cat["text"] = (csvDataLineVal[0]).trim();
                		import_makers[i] = cat;	
            		}
            	}
            	importMakerDialog.dialog("open");
            } else {
            	alert('No data to import!');
            }
        };
        reader.onerror = function() {
            alert('Unable to read ' + file.fileName);
        };
    }
});

function importMakers() {
	var importData = Object.values(import_makers);
	if(importData.length > 0) {
		importData.forEach(function(data){
			var makerId = getMakerIdByName(data["text"]);
			if(makerId == undefined) {
				makerId = insertMaker(data["text"]);
			}
		});
		reloadMakersGrid();
	}
}

function exportProductsCSV() {
	
	var csvData = "";
	var products = $("#productsGird").data("JSGrid").data;
	
	var makerMap = {};
	getMakersFromDB().forEach(function(m){
		makerMap[m["id"]]=m["text"];
	});
	
	var categoryMap = {};
	getCategoriesFromDB().forEach(function(m){
		categoryMap[m["id"]]=m["text"];
	});
	
	var cellDelimiter = ",";
	var lineDelimiter = "\n";
	
	var header = [];
	header[0] = "PROD CODE";
	header[1] = "PROD DETAIL";
	header[2] = "PROD MAKER";
	header[3] = "PROD CATEGORY";
	header[4] = "PROD PRICE";
	header[5] = "PROD UNIT";
	csvData += header.join(cellDelimiter) + lineDelimiter;
	products.forEach(function(product){
		var v = [];
		v[0] = product["code"];
		v[1] = product["detail"];
		v[2] = makerMap[product["maker"]];
		v[3] = categoryMap[product["category"]];
		v[4] = product["price"];
		v[5] = product["unit"];
		csvData += v.join(cellDelimiter) + lineDelimiter;
	});
	downloadCSVFile("products", csvData)
}

function exportCategoriesCSV() {
	
	var csvData = "";
	var categories = $("#categoriesGird").data("JSGrid").data;
	
	var cellDelimiter = ",";
	var lineDelimiter = "\n";
	
	var header = [];
	header[0] = "CATEGORY NAME";
	csvData += header.join(cellDelimiter) + lineDelimiter;
	categories.forEach(function(cat){
		var v = [];
		v[0] = cat["text"];
		csvData += v.join(cellDelimiter) + lineDelimiter;
	});
	downloadCSVFile("categories", csvData)
}

function exportMakersCSV() {
	
	var csvData = "";
	var makers = $("#makersGird").data("JSGrid").data;
	
	var cellDelimiter = ",";
	var lineDelimiter = "\n";
	
	var header = [];
	header[0] = "MAKER NAME";
	csvData += header.join(cellDelimiter) + lineDelimiter;
	makers.forEach(function(maker){
		var v = [];
		v[0] = maker["text"];
		csvData += v.join(cellDelimiter) + lineDelimiter;
	});
	downloadCSVFile("makers", csvData)
}

function downloadCSVFile(filename, csvData){
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvData);
    hiddenElement.target = '_blank';
    hiddenElement.download = filename + '.csv';
    hiddenElement.click();
}