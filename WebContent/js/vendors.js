/**
 * http://usejsdoc.org/
 */

//initialization
$("#save-btn").hide();
var editingrow = -1;


var rows = alasql("SELECT * FROM vendor");

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
	if($("#edt-btn").hasClass("disabled") && $("#del-btn").hasClass("disabled")) {
		$("#edt-btn").removeClass("disabled").addClass("active");
		$("#del-btn").removeClass("disabled").addClass("active");
	}
	$("#edt-btn").attr("vendor", $(this).attr("id"));
	$("#del-btn").attr("vendor", $(this).attr("id"));
});

// edit-vendor
$("tbody#vendor-list tr.vendor-tdata td.editable").on('dblclick', function(){
	editingrow = $(this).parent().attr("id");
	$(this).parent().addClass("editing");
	editVendorRow(editingrow);
});

$("body").not("tbody#vendor-list tr.vendor-tdata#" + editingrow + ")").click(function(event){
	console.log(editingrow);
	if(editingrow!=-1) {
		var query = "update vendor set ";
		var vals = [];
		$("tbody#vendor-list tr.vendor-tdata#" + editingrow + " td.editable input").each(function(){
			var field = $(this).attr("id").slice(6);
			vals.push(field + "= '" + $(this).val()+"' ");
		});
		query += vals.join(", ") + " where id = " + Number(editingrow);
		console.log(query);
		alasql(query);

		$("tbody#vendor-list tr.vendor-tdata#" + editingrow + " td.editable input").each(function(){
			$(this).parent().text($(this).val())
		});
		editingrow = -1;
	}

});


$.click(function(){
	$(this)
});

function editVendorRow(rowid){
	$("tbody#vendor-list tr.vendor-tdata#" + rowid + " td.editable").each(function(){
		var old = $(this).text();
		$(this).html("<input id='input-" + $(this).attr("id") + "' type='text' value='" + old + "'>");
	});
	$("#edt-btn").hide();
	if($("#save-btn").hasClass("disabled")) {
		$("#save-btn").removeClass("disabled").addClass("active");
	}
	$("#add-btn").removeClass("active").addClass("disabled");
	$("#del-btn").removeClass("active").addClass("disabled");
	$("#save-btn").attr("vendor", rowid).show();
}

$("#save-btn").on('click', function(){
	var vid = $("#save-btn").attr("vendor");
	var query = "update vendor set ";
	var vals = [];
	$("tbody#vendor-list tr.vendor-tdata#" + vid + " td.editable input").each(function(){
		var field = $(this).attr("id").slice(6);
		vals.push(field + "='" + $(this).val()+"'");
	});
	query += vals.join(",") + " where id = " + vid;
	alasql(query);
	location.reload();
});

// del-vendor
$("#del-btn").on('click', function(){
	var vid = $("#del-btn").attr("vendor");
	alasql("delete from vendor where id=" + vid);
	$("tbody#vendor-list tr.vendor-tdata#"+vid).remove();
});