/**
 * http://usejsdoc.org/
 */

$("div#add-vendor button#submit").on('click', function() {
	var addFormData = $("#add-vendor-form").serializeArray();
	var rows = alasql("select max(id) as id from vendor");
	var values = [];
	if (rows.length == 1 && rows[0].id != undefined)
		values.push(Number(rows[0].id) + 1);
	else
		values.push(Number(1));

	addFormData.forEach(function(i){
		if(i.name == "name")
			values[1] = i.value;
		else if(i.name == "vencode")
			values[3] = i.value;
		else if(i.name == "tel")
			values[2] = i.value;
		else if(i.name == "email")
			values[4] = i.value;
		else if(i.name == "addr")
			values[5] = i.value;
	});
	
	console.log(values)
	alasql("INSERT INTO vendor VALUES(?,?,?,?,?,?)", values);
});

//initialization
$("#save-btn").hide();
var editingrow = -1;


var rows = alasql("SELECT * FROM vendor order by id desc");

if(rows.length !=0 ) {
	var $tbody = $("#vendor-list");
	rows.forEach(function(r){
		var tr = $("<tr class='vendor-tdata' id='" + r.id + "'></tr>");
		$("<td></td>").appendTo(tr);
		$("<td>" + r.vencode + "</td>").appendTo(tr);
		$("<td id='name' class='editable'>" + r.name + "</td>").appendTo(tr);
		$("<td id='tel' class='editable'>" + r.tel + "</td>").appendTo(tr);
		$("<td id='email' class='editable'>" + r.email + "</td>").appendTo(tr);
		$("<td id='address' class='editable'>" + r.address + "</td>").appendTo(tr);
		tr.appendTo($tbody);
	});
}

$("tbody#vendor-list tr.vendor-tdata").on('click', function(){
	$(this).addClass("active").siblings().removeClass("active");
	if($("#del-btn").hasClass("disabled")) {
		$("#del-btn").removeClass("disabled").addClass("active");
	}
	$("#del-btn").attr("vendor", $(this).attr("id"));
});

// edit-vendor
$("tbody#vendor-list tr.vendor-tdata td.editable").on('dblclick', function(){
	
	if(editingrow!=-1) {
		updateRow(editingrow);
	}
	
	editingrow = $(this).parent().attr("id");
	$(this).parent().addClass("editing");
	editVendorRow(editingrow);
	
});

function updateRow(rowid){
	var query = "update vendor set ";
	var vals = [];
	$("tbody#vendor-list tr.vendor-tdata#" + rowid + " td.editable input").each(function(){
		var field = $(this).attr("id").slice(6);
		vals.push(field + "= '" + $(this).val()+"' ");
	});
	query += vals.join(", ") + " where id = " + Number(rowid);
	alasql(query);

	$("tbody#vendor-list tr.vendor-tdata#" + rowid + " td.editable input").each(function(){
		$(this).parent().text($(this).val())
	});
}

$("body").on('click', function(e){
	if($(e.target).not("input.vendor-inline-edit").length != 0 && editingrow!=-1) {
		updateRow(editingrow);
		editingrow = -1;
	}
});

function editVendorRow(rowid){
	$("tbody#vendor-list tr.vendor-tdata#" + rowid + " td.editable").each(function(){
		var old = $(this).text();
		$(this).html("<input class='vendor-inline-edit' id='input-" + $(this).attr("id") + "' type='text' value='" + old + "'>");
	});
}

// del-vendor
$("#del-btn").on('click', function(){
	var vid = $("#del-btn").attr("vendor");
	alasql("delete from vendor where id=" + vid);
	$("tbody#vendor-list tr.vendor-tdata#"+vid).remove();
});