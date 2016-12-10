
$("#li-po").hide().removeClass("active");
$("#tabcontent-po").removeClass("active");

$("#li-so").hide().removeClass("active");
$("#tabcontent-so").removeClass("active");

$("#li-st").hide().removeClass("active");
$("#tabcontent-st").removeClass("active");

$("#li-revisions").hide().removeClass("active");
$("#tabcontent-revisions").removeClass("active");

var ofirst = false;
if(getPermission("orders-po-tab")) {
	
	if(!ofirst) {
		$("#li-po").addClass("active");
		$("#tabcontent-po").addClass("active");
		ofirst = true;
	}
	$("#li-po").show();
}

if(getPermission("orders-so-tab")) {

	if(!ofirst) {
		$("#li-so").addClass("active");
		$("#tabcontent-so").addClass("active");
		ofirst = true;
	}
	$("#li-so").show();
}

if(getPermission("orders-st-tab")) {
	
	if(!ofirst) {
		$("#li-st").addClass("active");
		$("#tabcontent-st").addClass("active");
		ofirst = true;
	}
	$("#li-st").show();
}

if(getPermission("orders-revisions")) {

	if(!ofirst) {
		$("#li-revisions").addClass("active");
		$("#tabcontent-revisions").addClass("active");
		ofirst = true;
	}
	$("#li-revisions").show();
}
