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
		$('.ui-dialog-buttonpane').find('button:contains("Save")')
			.removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-success');
		$('.ui-dialog-buttonpane').find('button:contains("Cancel")')
			.removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-default');
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
    $("#make_maker").val(maker["text"])
    makerDialog.dialog("option", "title", dialogType + " Maker").dialog("open");
};

$("#makersGird").jsGrid({
    width: "100%",
    autoload: false,
	filtering: true,
    paging: true,
    pageLoading: true,
    sorting: true,
    pageSize: 20,
    pageButtonCount: 5,
	
    rowClick: function(args) {},
    
    rowDoubleClick: function(args) {
    	showMakeDetailsDialog("Edit", args.item);
    },
   
    controller: {
        loadData: function(filter) {
        	var data = [];
        	var rows = alasql("select * from maker");
        	if(rows!=undefined && rows.length!=0) {
        		rows.forEach(function(r){
        			var d = {};
        			d["id"] = r.id;
        			d["text"] = r.text;
        			data.push(d);
        		});
        	}
        	var filtered = $.grep(data, function(maker) {
                return (!filter["id"] || maker["id"]==filter["id"]) 
                	&& (!filter["text"] || maker["text"].indexOf(filter["text"]) >= 0);
        	});
        	
        	
    		if(filter.sortField != undefined && filter.sortOrder != undefined) {
        		filtered.sort(function(x1, x2){
        			var x11 = x1[filter.sortField], x21 = x2[filter.sortField];
        			if(filter.sortField === "id") {
        				x11 = Number(x11);
        				x21 = Number(x21);
        			}
        			
        			if(x11 === x21) return 0;
        			
        			if(filter.sortOrder == "asc") {
        				return x11 > x21 ? 1 : -1;
        			} else if(filter.sortOrder == "desc") {
        				return x11 < x21 ? 1 : -1;
        			}	
        		});
    		}
    		
            return {data: pageData(filtered, filter.pageIndex, filter.pageSize), itemsCount: filtered.length};
        },
        
        deleteItem: function(item) {
        	deleteMaker(item);
        },
        updateItem: function(item) {
        	showMakeDetailsDialog("Edit", item);
        },

    },
    
    fields: [
        { name:"id", title: "ID", type: "text", 
        	headerTemplate: function() {
        		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
        	}
        },
        { name:"text", title: "MAKER", type: "text", insertcss: "make-insert",
        	headerTemplate: function() {
        		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
        	}	
        },
        
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

    $("#cat_cat").val(category["text"]);
    categoryDialog.dialog("option", "title", dialogType + " Category").dialog("open");
};

$("#categoriesGird").jsGrid({
    width: "100%",
    autoload: true,
	filtering: true,
    paging: true,
    pageLoading: true,
    sorting: true,
    pageSize: 20,
    pageButtonCount: 5,
	
    rowClick: function(args) {},
    
    deleteConfirm: "Do you want to delete it ?",
    
    controller: {
        loadData: function(filter) {
        	var data = [];
        	var rows = alasql("select * from kind");
        	if(rows!=undefined && rows.length!=0) {
        		rows.forEach(function(r){
        			var d = {};
        			d["id"] = r.id;
        			d["text"] = r.text;
        			data.push(d);
        		});
        	}
        	var filtered = $.grep(data, function(category) {
        		return (!filter["id"] || category["id"]==filter["id"]) && (!filter["text"] || category["text"].indexOf(filter["text"]) >= 0);
        	});
        	
    		if(filter.sortField != undefined && filter.sortOrder != undefined) {
        		filtered.sort(function(x1, x2){
        			var x11 = x1[filter.sortField], x21 = x2[filter.sortField];
        			if(filter.sortField === "id") {
        				x11 = Number(x11);
        				x21 = Number(x21);
        			}
        			
        			if(x11 === x21) return 0;
        			
        			if(filter.sortOrder == "asc") {
        				return x11 > x21 ? 1 : -1;
        			} else if(filter.sortOrder == "desc") {
        				return x11 < x21 ? 1 : -1;
        			}	
        		});
    		}
        	
            return {data: pageData(filtered, filter.pageIndex, filter.pageSize), itemsCount: filtered.length};
        },
        
        deleteItem: function(item) {
        	deleteCategory(item);
        },
        updateItem: function(item) {
        	showCatDetailsDialog("Edit", item);
        },

    },
    
    fields: [
        { name: "id", title:"ID", type: "text",
        	headerTemplate: function() {
        		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
        	}	
        },
        { name: "text", title:"CATEGORY", type: "text",
        	headerTemplate: function() {
        		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
        	}	
        },
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

var products_items_selected = {};
$("#productsGird").jsGrid({
    width: "100%",
    autoload: true,
	filtering: true,
	sorting: true,
    paging: true,
    pageLoading: true,
    pageSize: 20,
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
        	var filtered = $.grep(getProductsFromDB(), function(product) {
                return (!filter["code"] || product["code"].indexOf(filter["code"]) == 0)
            	&& (!filter["category"] || filter["category"] == 0 || product["category"]==filter["category"])
            	&& (!filter["maker"] || filter["maker"] == 0 || product["maker"]==filter["maker"])
            	&& (!filter["detail"] || product["detail"].indexOf(filter["detail"]) > -1)
                && (!filter.price || !filter.price.text 
						|| (filter.price.text && Number(filter.price.op)===0 && Number(filter.price.text)== Number(product["price"]))
						|| (filter.price.text && Number(filter.price.op)===1 && Number(filter.price.text) < Number(product["price"]))
						|| (filter.price.text && Number(filter.price.op)===2 && Number(filter.price.text) > Number(product["price"]))
						|| (filter.price.text && Number(filter.price.op)===3 && Number(filter.price.text) <= Number(product["price"]))
						|| (filter.price.text && Number(filter.price.op)===4 && Number(filter.price.text) >= Number(product["price"]))
					)
                && (!filter["unit"] || product["unit"].indexOf(filter["unit"]) == 0);
        	});
        	
        	if(filter.sortField != undefined && filter.sortOrder != undefined)
        		filtered = sortProducts(filtered, filter.sortField, filter.sortOrder);

        	products_items_selected = {};
    		filtered.forEach(function(d){
    			products_items_selected[d.id] = d;
    		});
        	
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
		 { name: "pckb", title: "", type: "checkbox", align: "center", filtering:false, sorting:false, width:20, css:"prodpckbheader",
			 headerTemplate: function(value, item) {
				 return $("<input id='prod-pckb-header' checked>").attr("type", "checkbox").change(function(){
					 if($(this).is(":checked")){
						 $("input.prod-pckb-item").each(function(){
							$(this).prop('checked', true); 
						 });
						 $("#productsGird").data("JSGrid").data.forEach(function(d){
							 products_items_selected[d.id] = item;
				    	 });
					 } else {
						 $("input.prod-pckb-item").each(function(){
 							$(this).prop('checked', false); 
 						 });
						 products_items_selected = {};
					 }
				 });
			 },
		 
    		 itemTemplate: function(value, item) {
                 return $("<input class='prod-pckb-item' id='prod-pckb-item-'" + item.pstockid + " checked>").attr("type", "checkbox").change(function(){
                	 var id = Number($(this).attr("id").slice(15));
                	 if($(this).is(":checked")){
                		 products_items_selected[id] = item;
                		 if($("#productsGird").data("JSGrid").data.length === Object.keys(products_items_selected).length) {
                			 $("input#prod-pckb-header").prop('checked', true);
                		 }
                	 } else {
                		 delete products_items_selected[id + 1];
                		 $("input#prod-pckb-header").prop('checked', false);
                	 }
                 });
             },
    	 },
		 
         { name: "pimg", title: "", type: "text", editing:false, width:70, sorting:false, filtering: false, css:"prodimgheader",
    		
    		 itemTemplate: function(value, item) {
                 return "<img style='width:40px;height:40px' src='img/" + item.id + ".jpg'>"
                 },
         },
        { name: "code", title:"CODE", type: "text", width: 150,
        	headerTemplate: function() {
        		return $("<span>CODE</span><span style='float:right' class='glyphicon glyphicon-sort'>");
        	}
        
        },
        { name: "detail", title:"DETAIL", type: "text", width: 150, 
        	headerTemplate: function() {
        		return $("<span>Detail</span><span style='float:right' class='glyphicon glyphicon-sort'>");
        	}
        },
        { name: "maker", title:"MAKER", type: "select", items: getMakersFromDB(), valueField: "id", textField: "text", sorting: false, },
        { name: "category", title:"CATEGORY", type: "select", items: getCategoriesFromDB(), valueField: "id", textField: "text", sorting: false, },
        
        { name: "price", title:"PRICE", type: "text", width: 150, 
        	headerTemplate: function() {
        		return $("<span>Price</span><span style='float:right' class='glyphicon glyphicon-sort'>");
        	},
         	filterTemplate: function() {
         			var operator = $("<select style='width:55px'>").on('change', function (e) {
         				$("#productsGird").jsGrid("search", $("#productsGird").jsGrid("getFilter"));
     				});
         			$("<option selected>").val(0).text("=").appendTo(operator);
         			$("<option>").val(1).text(">").appendTo(operator);
         			$("<option>").val(2).text("<").appendTo(operator);
         			$("<option>").val(3).text(">=").appendTo(operator);
         			$("<option>").val(4).text("<=").appendTo(operator);
         			
         			this._operatorPicker = operator;
         			this._textPicker = $("<input style='width:76px' type='text'>")
         				.on('keypress', function (e) {
         		         if(e.which === 13){
         		        	$("#productsGird").jsGrid("search", $("#productsGird").jsGrid("getFilter"));
         		         }
         				});
               return $("<div>").append(this._operatorPicker).append(this._textPicker);
           },
        
           filterValue: function() {
        	   return {
        		   text: this._textPicker.val(),
        		   op: this._operatorPicker.val(),
        	   };
           }
        },
        
        { name: "unit", title:"UNIT", type: "text", width: 150, 
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

$("#import-products-grid").jsGrid({
    height: "500px",
    width: "810px",
    autoload: true,
    editing: true,
    
    onItemDeleted: function(){
    	$("#import-products-grid").jsGrid("render");
    },
    controller: {
        loadData: function() {
        	return Object.values(import_products);
        },
        
        deleteItem: function(item) {
        	delete import_products[item["row-id"]];
        	var snum = 0;
        	Object.values(import_products).forEach(function(d){
        		d["snum"] = ++snum;
        	});
        },
        updateItem: function(item) {
        	import_products[item["row-id"]] = item;
    		$("#productsGird").jsGrid("render");
        },

    },
    
    fields: [
    	{ name: "snum", title:"", type:"number", width:"30px", editing:false},
        { name: "code", title:"CODE", type: "text", width:"70px",},
        { name: "detail", title:"DETAIL", type: "text", width:"150px", },
        { name: "maker", title:"MAKER", type: "text", width:"150px",},
        { name: "category", title:"CATEGORY", type: "text", width:"150px",},
        { name: "price", title:"PRICE", type: "text", width:"100px",},
        { name: "unit", title:"UNIT", type: "text",width:"50px",},
    	{ type: "control", },
    ]
});

var importProdDialog = $("#dlg-import-products").dialog({
    autoOpen: false,
    width: 850,
    modal: true,
    closeOnEscape: true,
    buttons: {
        Import: function() {
        	importProducts();
        	importProdDialog.dialog("close");
        },
        Cancel: function() {
        	importProdDialog.dialog("close");
        }
    },
	open: function(event) {
    	$("#import-products-grid").jsGrid("loadData");
    	$("#import-products-grid").jsGrid("render");
		$('.ui-dialog-buttonpane').find('button:contains("Import")')
			.removeClass("ui-button ui-corner-all ui-widget")
			.addClass('btn btn-primary');
		$('.ui-dialog-buttonpane').find('button:contains("Cancel")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-warning');
	 },
    close: function() {
    	import_products = {};
    	$("#input-products-file").val("");
    }
});

$("#import-categories-grid").jsGrid({
    height: "500px",
    width: "200px",
    autoload: true,
    editing: true,
    
    onItemDeleted: function(){
    	$("#import-categories-grid").jsGrid("render");
    },
    controller: {
        loadData: function() {
        	return Object.values(import_categories);
        },
        
        deleteItem: function(item) {
        	delete import_categories[item["row-id"]];
        	var snum = 0;
        	Object.values(import_categories).forEach(function(d){
        		d["snum"] = ++snum;
        	});
        },
        updateItem: function(item) {
        	import_categories[item["row-id"]] = item;
        	$("#import-categories-grid").jsGrid("render");
        },

    },
    
    fields: [
    	{ name: "snum", title:"", type:"number", width:"30px", editing:false},
        { name: "text", title:"CATEGORY", type: "text", width:"100px", },
    	{ type: "control", },
    ]
});

var importCatDialog = $("#dlg-import-categories").dialog({
    autoOpen: false,
    width: 220,
    modal: true,
    closeOnEscape: true,
    buttons: {
        Import: function() {
        	importCategories();
        	importCatDialog.dialog("close");
        },
        Cancel: function() {
        	importCatDialog.dialog("close");
        }
    },
	open: function(event) {
		$("#import-categories-grid").jsGrid("loadData");
		$("#import-categories-grid").jsGrid("render");
		$('.ui-dialog-buttonpane').find('button:contains("Import")')
			.removeClass("ui-button ui-corner-all ui-widget")
			.addClass('btn btn-primary');
		$('.ui-dialog-buttonpane').find('button:contains("Cancel")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-warning');
	 },
    close: function() {
    	import_categories = {};
    	$("#input-categories-file").val("");
    }
});

$("#import-makers-grid").jsGrid({
    height: "500px",
    width: "200px",
    autoload: true,
    editing: true,
    
    onItemDeleted: function(){
    	$("#import-makers-grid").jsGrid("render");
    },
    controller: {
        loadData: function() {
        	return Object.values(import_makers);
        },
        
        deleteItem: function(item) {
        	delete import_makers[item["row-id"]];
        	var snum = 0;
        	Object.values(import_makers).forEach(function(d){
        		d["snum"] = ++snum;
        	});
        },
        updateItem: function(item) {
        	import_makers[item["row-id"]] = item;
        	$("#import-makers-grid").jsGrid("render");
        },

    },
    
    fields: [
    	{ name: "snum", title:"", type:"number", width:"30px", editing:false},
        { name: "text", title:"MAKER", type: "text", width:"100px", },
    	{ type: "control", },
    ]
});

var importMakerDialog = $("#dlg-import-makers").dialog({
    autoOpen: false,
    width: 220,
    modal: true,
    closeOnEscape: true,
    buttons: {
        Import: function() {
        	importMakers();
        	importMakerDialog.dialog("close");
        },
        Cancel: function() {
        	importMakerDialog.dialog("close");
        }
    },
	open: function(event) {
		$("#import-makers-grid").jsGrid("loadData");
		$("#import-makers-grid").jsGrid("render");
		$('.ui-dialog-buttonpane').find('button:contains("Import")')
			.removeClass("ui-button ui-corner-all ui-widget")
			.addClass('btn btn-primary');
		$('.ui-dialog-buttonpane').find('button:contains("Cancel")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-warning');
	 },
    close: function() {
    	import_makers = {};
    	$("#input-makers-file").val("");
    }
});