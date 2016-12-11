var dialog = $("#dialog-form").dialog({
	autoOpen : false,
	width : 400,
	modal : true,
	closeOnEscape : true,
	buttons : [ {
		text : "Save",
		click : function() {
			$("#outletForm").submit();
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
    $("#outlet_code").val(vendor["CODE"]);
    $("#outlet_name").val(vendor["NAME"]);
    $("#outlet_tel").val(vendor["TEL"]);
    $("#outlet_email").val(vendor["Email"]);
    $("#outlet_addr").val(vendor["Address"]);

    dialog.dialog("option", "title", dialogType + " vendor").dialog("open");
};

var saveClient = function(outlet, isNew) {
	
	var dboutlet = {};
	var id = 0;
	if(isNew) dboutlet = outlet;
	else id = outlet["id"];
	
	$.extend(dboutlet, {
    	outletcode: $("#outlet_code").val(),
    	name: $("#outlet_name").val(),
    	tel: $("#outlet_tel").val(),
    	email: $("#outlet_email").val(),
    	address: $("#outlet_addr").val()
    });
    isNew ? addOutlet(dboutlet) : updateOutlet(id, dboutlet);
    dialog.dialog("close");
    refreshOutletsGrid();
};

function refreshOutletsGrid() {
	$("#outlets-grid").jsGrid("reset");
	$("#outlets-grid").jsGrid("loadData");
}

$("#outlets-grid").jsGrid({
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
        	
        	var filtered = $.grep(getOutletsFromDB(), function(outlet) {
                return (!filter["CODE"] || outlet["CODE"].indexOf(filter["CODE"]) > -1)
            	&& (!filter["NAME"] || outlet["NAME"].indexOf(filter["NAME"]) > -1)
            	&& (!filter["TEL"] || String(outlet["TEL"]).indexOf(filter["TEL"]) > -1)
            	&& (!filter["Email"] || outlet["Email"].indexOf(filter["Email"]) > -1)
                && (!filter["Address"] || outlet["Address"].indexOf(filter["Address"]) > -1);
        	});
        	
        	if(filter.sortField != undefined && filter.sortOrder != undefined)
        		filtered = sortJsonArray(filtered, filter.sortField, filter.sortOrder);
        	
            return {data: filtered, itemsCount: filtered.length};
        },
        
        deleteItem: function(item) {
        	deleteOutlet(item);
        	refreshOutletsGrid();
        },
        updateItem: function(item) {
        	showDetailsDialog("Edit", item);
        	refreshOutletsGrid();
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
          		
          		this._createGridButton("jsgrid-edit-button", "Edit Outlet", function(grid) {
                    grid.updateItem(item);
                }).appendTo(div);

                this._createGridButton("jsgrid-delete-button", "Delete Outlet", function(grid) {
                	grid.deleteItem(item);
                }).appendTo(div);

                return div;
          	},
        },
            
    ]
});

function updateOutlet(id, outlet) {
	var query = "update outlet set ";
	
	var set = [];
	Object.keys(outlet).forEach(function(key){
		set.push(key + "='" + vendor[key] + "'")
	});
	
	query += set.join(", ");
	query += " where id=" + id;
	console.log(query)
	alasql(query);
}

function deleteOutlet(outlet) {
	console.log(outlet);
	alasql("delete from outlet where id = " + outlet.id);
}

function addOutlet(outlet) {
	var rows = alasql("select max(id) as id from outlet");
	var values = [];
	if (rows.length == 1 && rows[0].id != undefined)
		values.push(Number(rows[0].id) + 1);
	else
		values.push(Number(1));

	Object.keys(outlet).forEach(function(key){
		if(key == "name")
			values[1] = outlet[key];
		else if(key == "outletcode")
			values[3] = outlet[key];
		else if(key == "tel")
			values[2] = outlet[key];
		else if(key == "email")
			values[4] = outlet[key];
		else if(key == "address")
			values[5] = outlet[key];
	});
	
	alasql("INSERT INTO outlet VALUES(?,?,?,?,?,?)", values);
}

function getOutletsFromDB(){
	var rows = alasql("SELECT * FROM outlet order by id desc");

	var data = [];
	if(rows.length !=0 ) {
		rows.forEach(function(r){
			var d = {};
			d["id"] = r.id;
			d["CODE"] = r.outletcode;
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


var import_outlets = {};
$("#input-outlets-file").change(function(event) {
    var data = null;
    var file = event.target.files[0];
    import_outlets = {};
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
                		var outlet = {};
                		outlet["row-id"] = i;
                		outlet["snum"] = i;
                		outlet["ocode"] = csvDataLineVal[0].trim();
                		outlet["oname"] = (csvDataLineVal[1]).trim();
                		outlet["otel"] = csvDataLineVal[2].trim();
                		outlet["oemail"] = csvDataLineVal[3].trim();
                		outlet["oaddr"] = csvDataLineVal[4].trim();
                		import_outlets[i] = outlet;	
            		}
            	}
            	importOutletDialog.dialog("open");
            } else {
            	alert('No data to import!');
            }
        };
        reader.onerror = function() {
            alert('Unable to read ' + file.fileName);
        };
    }
});

function importOutlets() {
	var importData = Object.values(import_outlets);
	if(importData.length > 0) {
		importData.forEach(function(data){
			var query = "INSERT INTO outlet VALUES (";
			var values = [];
			values[0] = getNextInsertId("outlet");
			
			values[1] = "'" + data["oname"] + "'";
			values[2] = "'" + data["otel"] + "'";
			values[3] = "'" + data["ocode"] + "'";
			values[4] = "'" + data["oemail"] + "'";
			values[5] = "'" + data["oaddr"] + "'";
			query += values.join(",");
			query += ")";
			alasql(query);
		});
		refreshOutletGrid();
	}
}

$("#import-outlets-grid").jsGrid({
    height: "500px",
    width: "870px",
    autoload: true,
    editing: true,
    
    onItemDeleted: function(){
    	$("#import-outlets-grid").jsGrid("render");
    },
    controller: {
        loadData: function() {
        	return Object.values(import_outlets);
        },
        
        deleteItem: function(item) {
        	delete import_outlets[item["row-id"]];
        	var snum = 0;
        	Object.values(import_outlets).forEach(function(d){
        		d["snum"] = ++snum;
        	});
        },
        updateItem: function(item) {
        	import_outlets[item["row-id"]] = item;
        	$("#import-outlets-grid").jsGrid("render");
        },
    },
    
    fields: [
    	{ name: "snum", title:"", type:"number", width:"30px", editing:false},
        { name: "ocode", title:"OUTLET CODE", type: "text", width:"150px", },
        { name: "oname", title:"OUTLET NAME", type: "text", width:"150px", },
        { name: "otel", title:"OUTELET TEL", type: "text", width:"150px", },
        { name: "oemail", title:"OUTELET EMAIL", type: "text", width:"150px", },
        { name: "oaddr", title:"OUTELET ADDRESS", type: "text", width:"150px", },
    	{ type: "control", },
    ]
});

var importOutletDialog = $("#dlg-import-outlets").dialog({
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
		$("#import-outlets-grid").jsGrid("loadData");
		$("#import-outlets-grid").jsGrid("render");

		$('.ui-dialog-buttonpane').find('button:contains("Import")')
			.removeClass("ui-button ui-corner-all ui-widget")
			.addClass('btn btn-primary');
		$('.ui-dialog-buttonpane').find('button:contains("Cancel")').removeClass("ui-button ui-corner-all ui-widget").addClass('btn btn-warning');
	 },
    close: function() {
    	import_vendors = {};
    	$("#input-outlets-file").val("");
    	refreshOutletGrid();
    }
});

function getNextInsertId(table) {
	var rows = alasql("select max(id) as id from " + table);
	var insertId = 0;
	if(rows != undefined && rows.length > 0 && rows[0].id != undefined) insertId = rows[0].id;
	return insertId + 1;
}

function outletExportCSV() {
	
	var outlets = [];
	var itemsCount = $("#outlets-grid").jsGrid("_itemsCount");
	var pageSize =$("#outlets-grid").jsGrid("option","pageSize");
	var pages = Math.ceil(itemsCount/pageSize);
	for(var i=0; i<pages; i++) {
		$("#outlets-grid").jsGrid("option","pageIndex",i + 1);
		var newdata = $("#outlets-grid").jsGrid("option","data");
		newdata.forEach(function(d){outlets.push(d)})
	}
	
	var csvData = "";
	
	var cellDelimiter = ",";
	var lineDelimiter = "\n";
	
	var header = [];
	header[0] = "CODE";
	header[1] = "NAME";
	header[2] = "TEL";
	header[3] = "Email";
	header[4] = "Address";
	csvData += header.join(cellDelimiter) + lineDelimiter;
	outlets.forEach(function(outlet){
		var v = [];
		v[0] = outlet["CODE"];
		v[1] = outlet["NAME"];
		v[2] = outlet["TEL"];
		v[3] = outlet["Email"];
		v[4] = outlet["Address"];
		csvData += v.join(cellDelimiter) + lineDelimiter;
	});
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvData);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'outlets.csv';
    hiddenElement.click();
}
