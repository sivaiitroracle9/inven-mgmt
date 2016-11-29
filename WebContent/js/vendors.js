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
            	&& (!filter["TEL"] || vendor["TEL"].indexOf(filter["TEL"]) > -1)
            	&& (!filter["Email"] || vendor["Email"].indexOf(filter["Email"]) > -1);
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
        { name: "CODE", type: "text", sorting: true, },
        { name: "NAME", type: "text", },
        { name: "TEL", type: "text",  },
    	{ name: "Email", type: "text", 
        	itemTemplate: function(value, item){
        		return value + " <a onclick='venodorEmail(" + value + ")'><span class='glyphicon glyphicon-envelope'> </span></a>"
        	}
    	},
    	{ name: "Address", type: "text", filtering: false, sorting: false },
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

$("#vendorImportGrid").jsGrid({
	
})

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
