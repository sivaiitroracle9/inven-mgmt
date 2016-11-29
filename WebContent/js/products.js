var submitHandler;

var makerDialog = $("#makedialog-form").dialog({
    autoOpen: false,
    width: 400,
    modal: true,
    closeOnEscape: true,
    buttons: {
        Save: function() {
            $("#makerForm").submit();
        },
        Cancel: function() {
            $(this).dialog("close");
        }
    },
	open: function(event) {
		$('.ui-dialog-buttonpane').find('button:contains("Save")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-success');
		$('.ui-dialog-buttonpane').find('button:contains("Cancel")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-default');
	 },
    close: function() {
    	makerDialog.find("form#makerForm")[0].reset();
    }
});

makerDialog.find("form#makerForm").submit(function(e) {
    e.preventDefault();
    submitHandler();
});

var showMakeDetailsDialog = function(dialogType, maker) {
	
    submitHandler = function(event) {
    	saveMakeClient(maker, dialogType === "Add");
    };
    console.log(maker)
    $("#make_maker").val(maker["makertext"])
    makerDialog.dialog("option", "title", dialogType + " Maker").dialog("open");
};

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
};

function addMaker(maker) {
	var rows = alasql("select max(id) as id from maker");
	var values = [];
	if (rows.length == 1 && rows[0].id != undefined)
		values.push(Number(rows[0].id) + 1);
	else
		values.push(Number(1));

	Object.keys(maker).forEach(function(key) {
		if(key == "text")
			values[1] = maker[key];
	});
	alasql("INSERT INTO maker VALUES(?,?)", values);
	$("#makersGird").jsGrid("render");
	$("#makersGird").jsGrid("loadData");
	$("#makersGird").jsGrid("reset");
}

function updateMaker(id, maker) {
	var query = "update maker set text='" + maker["text"] + "' where id = " + id;
	console.log(query)
	alasql(query);
	$("#makersGird").jsGrid("render");
	$("#makersGird").jsGrid("loadData");
	$("#makersGird").jsGrid("reset");
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

$("#makersGird").jsGrid({
    width: "100%",
    autoload: false,
	filtering: true,
    paging: true,
    pageLoading: true,
    sorting: true,
    pageSize: 10,
    pageButtonCount: 5,
	
    rowClick: function(args) {},
    
    rowDoubleClick: function(args) {
    	showMakeDetailsDialog("Edit", args.item);
    },
    
    onItemInserted: function(args){
    	var makerLOVField = args.grid.fields[1];
    	makerLOVField.items = getMakersTbl(true);
    	$(".make-insert").empty().append(makerLOVField.insertTemplate());
    	$("#makersGird").jsGrid("reset");
    },
    
    controller: {
        loadData: function(filter) {
        	console.log(filter);
        	var filtered = $.grep(getMakersTbl(false), function(maker) {
                return (filter["maker"] == 0 || maker["id"] == filter["maker"]);
        	});
        	
            return {data: pageData(filtered, filter.pageIndex, filter.pageSize), itemsCount: filtered.length};
        },
        
        deleteItem: function(item) {
        	deleteProduct(item);
        	$("#makersGird").jsGrid("reset");
        },
        updateItem: function(item) {
        	showMakeDetailsDialog("Edit", item);
        	$("#makersGird").jsGrid("reset");
        },

    },
    
    fields: [
        { name:"makercode", title: "MAKER CODE", type: "text", sorting: false, filtering: false  },
        { name:"maker", title: "MAKER", type: "select", items: getMakersTbl(true), valueField: "id", textField: "maker", sorting: false, insertcss: "make-insert"},
    	{
        	type: "control", 
        	deleteButton: false,
        	editButton: false,
        	insertButton: false,

            headerTemplate: function() {
                return $("<button>").attr("type", "button")
                	.addClass("btn btn-success")
                	.addClass("glyphicon glyphicon-plus")
                        .on("click", function () {
                        	showMakeDetailsDialog("Add", {});
                        });
            },
        	
          	itemTemplate: function(value, item) {
          		
          		var div = $("<div>");
          		
          		this._createGridButton("jsgrid-edit-button", "Click to Edit this row", function(grid) {
                    grid.updateItem(item);
                }).appendTo(div);

                this._createGridButton("jsgrid-delete-button", "Click to Edit this row", function(grid) {
                	grid.deleteItem(item);
                }).appendTo(div);

                return div;
          	},
        },
            
    ]
});
//--------------------------------------------------------categories ---------------------------------------------------------------------------
var categoryDialog = $("#catdialog-form").dialog({
    autoOpen: false,
    width: 400,
    modal: true,
    closeOnEscape: true,
    buttons: {
        Save: function() {
            $("#categoryForm").submit();
        },
        Cancel: function() {
            $(this).dialog("close");
        }
    },
	open: function(event) {
		$('.ui-dialog-buttonpane').find('button:contains("Save")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-success');
		$('.ui-dialog-buttonpane').find('button:contains("Cancel")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-default');
	 },
    close: function() {
    	categoryDialog.find("form#categoryForm")[0].reset();
    }
});

categoryDialog.find("form#categoryForm").submit(function(e) {
    e.preventDefault();
    submitHandler();
});

var showCatDetailsDialog = function(dialogType, category) {
	
    submitHandler = function(event) {
    	saveCatClient(category, dialogType === "Add");
    };

    categoryDialog.dialog("option", "title", dialogType + " Category").dialog("open");
};

var saveCatClient = function(category, isNew) {
	
	var dbcategory = {};
	var id = 0;
	if(isNew) dbcategory = category;
	else id = category["id"];
	
	$.extend(dbcategory, {
    	text: $("#cat_cat").val(),
    });

    isNew ? addProduct(dbproduct) : updateProduct(id, dbcategory);
    categoryDialog.dialog("close");
	$("#categoriesGird").jsGrid("reset");
};

function addCategory(category) {
	var rows = alasql("select max(id) as id from kind");
	var values = [];
	if (rows.length == 1 && rows[0].id != undefined)
		values.push(Number(rows[0].id) + 1);
	else
		values.push(Number(1));

	Object.keys(category).forEach(function(key) {
		if(key == "text")
			values[1] = category[key];
	});
	alasql("INSERT INTO products VALUES(?,?)", values);
}

function updateCategory(id, category) {
	var query = "update kind set text=" + maker + "where id = " + id;
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

$("#categoriesGird").jsGrid({
    width: "100%",
    autoload: true,
	filtering: true,
    paging: true,
    pageLoading: true,
    sorting: true,
    pageSize: 10,
    pageButtonCount: 5,
	
    rowClick: function(args) {},
    
    rowDoubleClick: function(args) {
    	showCatDetailsDialog("Edit", args.item);
    },
    
    deleteConfirm: "Do you want to delete it ?",
    
    controller: {
        loadData: function(filter) {
        	var filtered = $.grep(getCategoriesTbl(false), function(category) {
                return (filter["CATEGORY"] == 0 || category["ID"] == filter["CATEGORY"]);
        	});
        	
            return {data: pageData(filtered, filter.pageIndex, filter.pageSize), itemsCount: filtered.length};
        },
        
        deleteItem: function(item) {
        	deleteProduct(item);
        	$("#categoriesGird").jsGrid("reset");
        },
        updateItem: function(item) {
        	showCatDetailsDialog("Edit", item);
        	$("#categoriesGird").jsGrid("reset");
        },

    },
    
    fields: [
        { name: "CAT CODE", type: "text", sorting: false, filtering: false },
        
        { name: "CATEGORY", type: "select", items: getCategoriesTbl(true), valueField: "ID", textField: "CAT", sorting: false,},
    	{
        	type: "control", 
        	deleteButton: false,
        	editButton: false,
        	insertButton: false,

            headerTemplate: function() {
                return $("<button>").attr("type", "button")
                	.addClass("btn btn-success")
                	.addClass("glyphicon glyphicon-plus")
                        .on("click", function () {
                        	showCatDetailsDialog("Add", {});
                        });
            },
        	
          	itemTemplate: function(value, item) {
          		
          		var div = $("<div>");
          		
          		this._createGridButton("jsgrid-edit-button", "Click to Edit this row", function(grid) {
                    grid.updateItem(item);
                }).appendTo(div);

                this._createGridButton("jsgrid-delete-button", "Click to Edit this row", function(grid) {
                	grid.deleteItem(item);
                }).appendTo(div);

                return div;
          	},
        },
            
    ]
});
//------------------------------------------------------------------ products ------------------------------------------------------------------
var productDialog = $("#proddialog-form").dialog({
    autoOpen: false,
    width: 400,
    modal: true,
    closeOnEscape: true,
    buttons: {
        Save: function() {
            $("#productForm").submit();
        },
        Cancel: function() {
            $(this).dialog("close");
        }
    },
	open: function(event) {
		$('.ui-dialog-buttonpane').find('button:contains("Save")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-success');
		$('.ui-dialog-buttonpane').find('button:contains("Cancel")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-default');
	 },
    close: function() {
    	productDialog.find("form")[0].reset();
    }
});

productDialog.find("form#productForm").submit(function(e) {
    e.preventDefault();
    submitHandler();
});

var showProdDetailsDialog = function(dialogType, product) {

	submitHandler = function(event) {
		saveProdClient(product, dialogType === "Add");
	};

	$("#prod_code").val(product["CODE"]);

	$("#prod_maker").html("");
	getMakersFromDB().forEach(function(m) {
		var option = $("<option>");
		option.val(m["id"]);
		option.text(m["text"]);
		option.appendTo($("#prod_maker"));
	});

	$("#prod_cat").html("");
	getCategoriesFromDB().forEach(function(m) {
		var option = $("<option>");
		option.val(m["id"]);
		option.text(m["text"]);
		option.appendTo($("#prod_cat"));
	});

	if (product["CATEGORY"] != undefined) {
		$("#prod_cat").val(product["CATEGORY"]);
	}

	if (product["MAKER"] != undefined) {
		$("#prod_maker").val(product["MAKER"]);
	}

	$("#prod_detail").val(product["Detail"]);
	$("#prod_price").val(product["Price"]);
	$("#prod_unit").val(product["Unit"]);

	productDialog.dialog("option", "title", dialogType + " product").dialog(
			"open");
};

$("#productsGird").jsGrid({
    width: "100%",
    autoload: true,
	filtering: true,
	sorting: true,
    paging: true,
    pageLoading: true,
    pageSize: 10,
    pageButtonCount: 5,
    editing: true,
    
    rowClick: function(){
    	
    },
    
    rowDoubleClick: function(args) {
    	showProdDetailsDialog("Edit", args.item);
    },
    
    deleteConfirm: "Do you want to delete it ?",
    
    controller: {
        loadData: function(filter) {
        	console.log(filter)
        	var filtered = $.grep(getProductsFromDB(), function(product) {
                return (!filter["CODE"] || product["CODE"].indexOf(filter["CODE"]) == 0)
            	&& (!filter["CATEGORY"] || product["CATEGORY"]==filter["CATEGORY"])
            	&& (!filter["MAKER"] || product["MAKER"]==filter["MAKER"])
            	&& (!filter["Detail"] || product["Detail"].indexOf(filter["Detail"]) > -1)
                && (!filter["Price"] || product["Price"] == filter["Price"])
                && (!filter["Unit"] || product["Unit"].indexOf(filter["Unit"]) == 0);
        	});
        	
        	if(filter.sortField != undefined && filter.sortOrder != undefined)
        		filtered = sortProducts(filtered, filter.sortField, filter.sortOrder);

            return {data: pageData(filtered, filter.pageIndex, filter.pageSize), itemsCount: filtered.length};
        },
        
        deleteItem: function(item) {
        	deleteProduct(item);
        	$("#productsGird").jsGrid("reset");
        },
        updateItem: function(item) {
        	showProdDetailsDialog("Edit", item);
        	$("#productsGird").jsGrid("reset");
        },

    },
    
    fields: [
    	{ name: "products-ckb", type: "checkbox", width: 20,
        	headerTemplate: function() {
        		return $("<input id='products-header-ckb' type='checkbox' checked>");
        	},
        	itemTemplate: function(value, item){
        		return $("<input id='products-ckb-"+ item.id + "' type='checkbox' checked>");
        	}
        },
        { name: "CODE", type: "text", width: 150,
        	headerTemplate: function() {
        		return $("<span>CODE</span><span style='float:right' class='glyphicon glyphicon-sort'>");
        	}
        
        },
        { name: "Detail", type: "text", width: 150, 
        	headerTemplate: function() {
        		return $("<span>Detail</span><span style='float:right' class='glyphicon glyphicon-sort'>");
        	}
        },
        { name: "MAKER", type: "select", items: getMakersFromDB(), valueField: "id", textField: "text", sorting: false, },
        { name: "CATEGORY", type: "select", items: getCategoriesFromDB(), valueField: "id", textField: "text", sorting: false, },
        
        { name: "Price", type: "text", width: 150, 
        	headerTemplate: function() {
        		return $("<span>Price</span><span style='float:right' class='glyphicon glyphicon-sort'>");
        	}
        },
        
        { name: "Unit", type: "text", width: 150, 
        	headerTemplate: function() {
        		return $("<span>Unit</span><span style='float:right' class='glyphicon glyphicon-sort'>");
        	}
        },
                
    	{
        	type: "control", 
        	deleteButton: false,
        	editButton: false,
        	insertButton: false,
        	sorting: false,

            headerTemplate: function() {
                return $("<button>").attr("type", "button")
                	.addClass("btn btn-success")
                	.addClass("glyphicon glyphicon-plus")
                        .on("click", function () {
                        	showProdDetailsDialog("Add", {});
                        });
            },
        	
          	itemTemplate: function(value, item) {
          		
          		var div = $("<div>");
          		
          		this._createGridButton("jsgrid-edit-button", "Click to Edit this row", function(grid) {
                    grid.updateItem(item);
                }).appendTo(div);

                this._createGridButton("jsgrid-delete-button", "Click to Edit this row", function(grid) {
                	grid.deleteItem(item);
                }).appendTo(div);

                return div;
          	},
        },
            
    ]
});

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
	$("#productsGird").jsGrid("reset");
	$("#productsGird").jsGrid("render");
	location.reload();
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
			d["CODE"] = product.code;
			d["Detail"] = product.detail;
			d["MAKER"] = product.make;
			d["CATEGORY"] = product.category;
			d["Price"] = product.price;
			d["Unit"] = product.unit;
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

$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
	var target = $(e.target).attr("href")
	if (target === "#tabcontent-categories") {
		$("#categoriesGird").jsGrid("loadData");
		$("#categoriesGird").jsGrid("render");
		$("#categoriesGird").jsGrid("reset");
	} else if (target === "#tabcontent-makers") {
		$("#makersGird").jsGrid("loadData");
		$("#makersGird").jsGrid("render");
		$("#makersGird").jsGrid("reset");
	} else if (target === "#tabcontent-products") {
		$("#productsGird").jsGrid("loadData");
		$("#productsGird").jsGrid("render");
		$("#productsGird").jsGrid("reset");
	}
});

$("div#prod_cat-select-dlg a").click(function(){
	$("div#prod_cat-select-dlg").hide();
	$("div#prod_cat-input-dlg").show();
});

$("div#prod_cat-input-dlg a#save-new-cat").click(function(){
	var newcat = $("#dlg-new-cat").val();
	newcat = newcat.trim();
	if(newcat!= "") {
		var maxid = 0;
		var rows = alasql("SELECT max(id) as id FROM kind");
		console.log(rows)
		if(rows.length > 0 && rows[0].id != undefined) {
			maxid = rows[0].id;
		}
		console.log(maxid)
		maxid++;
		alasql("INSERT INTO kind VALUES("+maxid + ",'" + newcat+ "')");
		$("#prod_cat").html("");
		getCategoriesFromDB().forEach(function(m) {
			var option = $("<option>");
			option.val(m["id"]);
			option.text(m["text"]);
			option.appendTo($("#prod_cat"));
		});
		$("#prod_cat").val(maxid);
	}
	$("div#prod_cat-select-dlg").show();
	$("div#prod_cat-input-dlg").hide();
});
$("div#prod_cat-input-dlg a#remove-new-cat").click(function(){
	$("div#prod_cat-select-dlg").show();
	$("div#prod_cat-input-dlg").hide();
});

$("div#prod_maker-select-dlg a").click(function(){
	$("div#prod_maker-select-dlg").hide();
	$("div#prod_maker-input-dlg").show();
});

$("div#prod_maker-input-dlg a#save-new-maker").click(function(){
	var newmaker = $("#dlg-new-maker").val();
	newmaker = newmaker.trim();
	if(newmaker!= "") {
		var maxid = 0;
		var rows = alasql("SELECT max(id) as id FROM maker");
		console.log(rows)
		if(rows.length > 0 && rows[0].id != undefined) {
			maxid = rows[0].id;
		}
		console.log(maxid)
		maxid++;
		alasql("INSERT INTO maker VALUES("+maxid + ",'" + newmaker+ "')");
		$("#prod_maker").html("");
		getMakersFromDB().forEach(function(m) {
			var option = $("<option>");
			option.val(m["id"]);
			option.text(m["text"]);
			option.appendTo($("#prod_maker"));
		});
		$("#prod_maker").val(maxid);
	}
	$("div#prod_maker-select-dlg").show();
	$("div#prod_maker-input-dlg").hide();
});
$("div#prod_maker-input-dlg a#remove-new-maker").click(function(){
	$("div#prod_maker-select-dlg").show();
	$("div#prod_maker-input-dlg").hide();
});