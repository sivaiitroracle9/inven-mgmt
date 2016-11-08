var dialog = $("#dialog-form").dialog({
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
    close: function() {
        dialog.find("form")[0].reset();
    }
});

var submitHandler;

dialog.find("form").submit(function(e) {
    e.preventDefault();
    submitHandler();
});

var showDetailsDialog = function(dialogType, product) {
	
    submitHandler = function(event) {
    	saveClient(product, dialogType === "Add");
    };
    
    $("#prod_code").val(product["CODE"]);
    
    $("#prod_maker").html("");
    getMakersFromDB().forEach(function(m){
    	var option = $("<option>");
    	option.val(m["id"]);
    	option.text(m["text"]);
    	option.appendTo($("#prod_maker"));
    });
    
    $("#prod_cat").html("");
    getCategoriesFromDB().forEach(function(m){
    	var option = $("<option>");
    	option.val(m["id"]);
    	option.text(m["text"]);
    	option.appendTo($("#prod_cat"));
    });
    
    if(product["CATEGORY"] !=undefined) {
    	$("#prod_cat").val(product["CATEGORY"]);
    }
    
    if(product["MAKER"] !=undefined) {
    	$("#prod_maker").val(product["MAKER"]);
    }
    
    $("#prod_detail").val(product["Detail"]);
    $("#prod_price").val(product["Price"]);
    $("#prod_unit").val(product["Unit"]);

    dialog.dialog("option", "title", dialogType + " product").dialog("open");
};

$("#jsGrid").jsGrid({
    width: "100%",
    autoload: true,
	filtering: true,
	sorting: true,
    paging: true,
    pageLoading: true,
    pageSize: 10,
    pageButtonCount: 5,
	
    rowClick: function(args) {},
    
    rowDoubleClick: function(args) {
    	showDetailsDialog("Edit", args.item);
    },
    
    deleteConfirm: "Do you want to delete it ?",
    
    controller: {
        loadData: function(filter) {
        	
        	var filtered = $.grep(getProductsFromDB(), function(product) {
                return (!filter["CODE"] || product["CODE"].indexOf(filter["CODE"]) == 0)
            	&& (!filter["CATEGORY"] || product["CATEGORY"]==filter["CATEGORY"])
            	&& (!filter["MAKER"] || product["MAKER"]==filter["MAKER"])
            	&& (!filter["Detail"] || product["Detail"].indexOf(filter["Detail"]) > -1)
                && (!filter["Price"] || product["Price"] == filter["Price"])
                && (!filter["Unit"] || product["Unit"].indexOf(filter["Unit"]) == 0);
        	});
        	
        	if(filter.sortField != undefined && filter.sortOrder != undefined)
        		filtered = sortJsonArray(filtered, filter.sortField, filter.sortOrder);
        	
            return {data: filtered, itemsCount: filtered.length};
        },
        
        deleteItem: function(item) {
        	deleteProduct(item);
        	$("#jsGrid").jsGrid("reset");
        },
        updateItem: function(item) {
        	showDetailsDialog("Edit", item);
        	$("#jsGrid").jsGrid("reset");
        },

    },
    
    fields: [
        { name: "CODE", type: "text", width: 150, },
        { name: "Detail", type: "text", width: 150, },
        { name: "MAKER", type: "select", items: getMakersFromDB(), valueField: "id", textField: "text" },
        { name: "CATEGORY", type: "select", items: getCategoriesFromDB(), valueField: "id", textField: "text" },
        { name: "Price", type: "text", width: 150, },
        { name: "Unit", type: "text", width: 150, },
        
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
                            showDetailsDialog("Add", {});
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

var saveClient = function(product, isNew) {
	
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
    dialog.dialog("close");
	$("#jsGrid").jsGrid("reset");
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

function sortJsonArray(data, field, sortOrder){
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
