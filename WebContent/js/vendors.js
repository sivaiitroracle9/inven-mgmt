var dialog = $("#dialog-form").dialog({
	autoOpen : false,
	width : 400,
	modal : true,
	closeOnEscape : true,
	buttons : [ {
		text : "Save",
		click : function() {
			$("#vendorForm").submit();
		}
	}, {
		text : "Cancel",
		click : function() {
			$(this).dialog("close");
		}
	} ],
	open: function(event) {
	     $('.ui-dialog-buttonpane').find('button:contains("Save")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-success');
		 $('.ui-dialog-buttonpane').find('button:contains("Cancel")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-default');
	 },
	 
	close : function() {
		dialog.find("form")[0].reset();
	}
});

var submitHandler;

dialog.find("form").submit(function(e) {
    e.preventDefault();
    submitHandler();
});

var showDetailsDialog = function(dialogType, vendor) {
    submitHandler = function(event) {
    	saveClient(vendor, dialogType === "Add");
    };
    $("#ven_code").val(vendor["CODE"]);
    $("#ven_name").val(vendor["NAME"]);
    $("#ven_tel").val(vendor["TEL"]);
    $("#ven_email").val(vendor["Email"]);
    $("#ven_addr").val(vendor["Address"]);

    dialog.dialog("option", "title", dialogType + " vendor").dialog("open");
};

var saveClient = function(vendor, isNew) {
	
	var dbvendor = {};
	var id = 0;
	if(isNew) dbvendor = vendor;
	else id = vendor["id"];
	
	$.extend(dbvendor, {
    	vencode: $("#ven_code").val(),
    	name: $("#ven_name").val(),
    	tel: $("#ven_tel").val(),
    	email: $("#ven_email").val(),
    	address: $("#ven_addr").val()
    });
    isNew ? addVendor(dbvendor) : updateVendor(id, dbvendor);
    dialog.dialog("close");
    refreshVendorGrid();
};

function refreshVendorGrid() {
	$("#jsGrid").jsGrid("reset");
	$("#jsGrid").jsGrid("loadData");
}

$("#jsGrid").jsGrid({
    width: "100%",
    autoload: true,
	filtering: true,
	sorting: true,
    paging: true,
    pageLoading: true,
	
    rowClick: function(args) {},
    
    rowDoubleClick: function(args) {
    	
    },
    
    deleteConfirm: "Do you want to delete it ?",
    
    controller: {
        loadData: function(filter) {
        	
        	var filtered = $.grep(getVendorsFromDB(), function(vendor) {
                return (!filter["CODE"] || vendor["CODE"].indexOf(filter["CODE"]) > -1)
            	&& (!filter["NAME"] || vendor["NAME"].indexOf(filter["NAME"]) > -1)
            	&& (!filter["TEL"] || String(vendor["TEL"]).indexOf(filter["TEL"]) > -1)
            	&& (!filter["Email"] || vendor["Email"].indexOf(filter["Email"]) > -1)
                && (!filter["Address"] || vendor["Address"].indexOf(filter["Address"]) > -1);
        	});
        	
        	if(filter.sortField != undefined && filter.sortOrder != undefined)
        		filtered = sortJsonArray(filtered, filter.sortField, filter.sortOrder);
        	
            return {data: filtered, itemsCount: filtered.length};
        },
        
        deleteItem: function(item) {
        	deleteVendor(item);
            refreshVendorGrid();
        },
        updateItem: function(item) {
        	showDetailsDialog("Edit", item);
            refreshVendorGrid();
        },

    },
    
    fields: [
        { name: "CODE", title:"CODE", type: "text", sorting: true,
        	headerTemplate: function() {
        		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
        	}	
        },
        { name: "NAME", title:"NAME", type: "text", 
        	headerTemplate: function() {
        		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
        	}	
        },
        { name: "TEL", title:"TEL", type: "text",  
        	headerTemplate: function() {
        		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
        	}	
        },
    	{ name: "Email", title:"Email", type: "text", 
        	itemTemplate: function(value, item){
        		return value + " <a onclick='venodorEmail(" + value + ")'><span class='glyphicon glyphicon-envelope'> </span></a>"
        	}
    	},
    	{ name: "Address", title:"Address", type: "text", 
        	headerTemplate: function() {
        		return $("<span>" + this.title + "</span><span style='float:right' class='glyphicon glyphicon-sort'>");
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

function updateVendor(id, vendor) {
	var query = "update vendor set ";
	
	var set = [];
	Object.keys(vendor).forEach(function(key){
		set.push(key + "='" + vendor[key] + "'")
	});
	
	query += set.join(", ");
	query += " where id=" + id;
	console.log(query)
	alasql(query);
}

function deleteVendor(vendor) {
	console.log(vendor);
	alasql("delete from vendor where id = " + vendor.id);
}

function addVendor(vendor) {
	var rows = alasql("select max(id) as id from vendor");
	var values = [];
	if (rows.length == 1 && rows[0].id != undefined)
		values.push(Number(rows[0].id) + 1);
	else
		values.push(Number(1));

	Object.keys(vendor).forEach(function(key){
		if(key == "name")
			values[1] = vendor[key];
		else if(key == "vencode")
			values[3] = vendor[key];
		else if(key == "tel")
			values[2] = vendor[key];
		else if(key == "email")
			values[4] = vendor[key];
		else if(key == "addr")
			values[5] = vendor[key];
	});
	
	alasql("INSERT INTO vendor VALUES(?,?,?,?,?,?)", values);
}

function getVendorsFromDB(){
	var rows = alasql("SELECT * FROM vendor order by id desc");

	var data = [];
	if(rows.length !=0 ) {
		rows.forEach(function(r){
			var d = {};
			d["id"] = r.id;
			d["CODE"] = r.vencode;
			d["NAME"] = r.name;
			d["TEL"] = r.tel;
			d["Email"] = r.email;
			d["Address"] = r.address;
			data.push(d);
		});
	}
	
    return data;
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


var import_vendors = {};
$("#input-vendors-file").change(function(event) {
    var data = null;
    var file = event.target.files[0];
    import_vendors = {};
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
            		if(csvDataLineVal.length == 5) {
                		var vendor = {};
                		vendor["row-id"] = i;
                		vendor["snum"] = i;
                		vendor["vcode"] = csvDataLineVal[0].trim();
                		vendor["vname"] = (csvDataLineVal[1]).trim();
                		vendor["vtel"] = csvDataLineVal[2].trim();
                		vendor["vemail"] = csvDataLineVal[3].trim();
                		vendor["vaddr"] = csvDataLineVal[4].trim();
                		import_vendors[i] = vendor;	
            		}
            	}
            	importVendorDialog.dialog("open");
            } else {
            	alert('No data to import!');
            }
        };
        reader.onerror = function() {
            alert('Unable to read ' + file.fileName);
        };
    }
});

function importVendors() {
	var importData = Object.values(import_vendors);
	if(importData.length > 0) {
		importData.forEach(function(data){
			var query = "INSERT INTO vendor VALUES (";
			var values = [];
			values[0] = getNextInsertId("vendor");
			
			values[1] = "'" + data["vname"] + "'";
			values[2] = "'" + data["vtel"] + "'";
			values[3] = "'" + data["vcode"] + "'";
			values[4] = "'" + data["vemail"] + "'";
			values[5] = "'" + data["vaddr"] + "'";
			query += values.join(",");
			query += ")";
			alasql(query);
		});
		refreshVendorGrid();
	}
}

$("#import-vendors-grid").jsGrid({
    height: "500px",
    width: "870px",
    autoload: true,
    editing: true,
    
    onItemDeleted: function(){
    	$("#import-vendors-grid").jsGrid("render");
    },
    controller: {
        loadData: function() {
        	return Object.values(import_vendors);
        },
        
        deleteItem: function(item) {
        	delete import_vendors[item["row-id"]];
        	var snum = 0;
        	Object.values(import_vendors).forEach(function(d){
        		d["snum"] = ++snum;
        	});
        },
        updateItem: function(item) {
        	import_vendors[item["row-id"]] = item;
        	$("#import-vendors-grid").jsGrid("render");
        },
    },
    
    fields: [
    	{ name: "snum", title:"", type:"number", width:"30px", editing:false},
        { name: "vcode", title:"VENDOR CODE", type: "text", width:"150px", },
        { name: "vname", title:"VENDOR NAME", type: "text", width:"150px", },
        { name: "vtel", title:"VENDOR TEL", type: "text", width:"150px", },
        { name: "vemail", title:"VENDOR EMAIL", type: "text", width:"150px", },
        { name: "vaddr", title:"VENDOR ADDRESS", type: "text", width:"150px", },
    	{ type: "control", },
    ]
});

var importVendorDialog = $("#dlg-import-vendors").dialog({
    autoOpen: false,
    width: 900,
    modal: true,
    closeOnEscape: true,
    buttons: {
        Import: function() {
        	importVendors();
        	importVendorDialog.dialog("close");
        },
        Cancel: function() {
        	importVendorDialog.dialog("close");
        }
    },
	open: function(event) {
		$("#import-vendors-grid").jsGrid("loadData");
		$("#import-vendors-grid").jsGrid("render");

		$('.ui-dialog-buttonpane').find('button:contains("Import")')
			.removeClass("ui-button ui-corner-all ui-widget")
			.addClass('btn btn-primary');
		$('.ui-dialog-buttonpane').find('button:contains("Cancel")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-warning');
	 },
    close: function() {
    	import_vendors = {};
    	$("#input-vendors-file").val("");
    	refreshVendorGrid();
    }
});

function getNextInsertId(table) {
	var rows = alasql("select max(id) as id from " + table);
	var insertId = 0;
	if(rows != undefined && rows.length > 0 && rows[0].id != undefined) insertId = rows[0].id;
	return insertId + 1;
}

function vendorExportCSV() {
	
	var csvData = "";
	var vendors = $("#jsGrid").data("JSGrid").data;
	
	var cellDelimiter = ",";
	var lineDelimiter = "\n";
	
	var header = [];
	header[0] = "CODE";
	header[1] = "NAME";
	header[2] = "TEL";
	header[3] = "Email";
	header[4] = "Address";
	csvData += header.join(cellDelimiter) + lineDelimiter;
	vendors.forEach(function(vendor){
		var v = [];
		v[0] = vendor["CODE"];
		v[1] = vendor["NAME"];
		v[2] = vendor["TEL"];
		v[3] = vendor["Email"];
		v[4] = vendor["Address"];
		csvData += v.join(cellDelimiter) + lineDelimiter;
	});
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvData);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'vendors.csv';
    hiddenElement.click();
}
