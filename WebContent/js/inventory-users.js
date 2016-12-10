$("#li-overview").hide().removeClass("active");
$("#tabcontent-inventory").removeClass("active");

$("#li-goodsissue").hide().removeClass("active");
$("#tabcontent-goodsissue").removeClass("active");

$("#li-goodsreceive").hide().removeClass("active");
$("#tabcontent-goodsreceive").removeClass("active");

$("#li-invencorrection").hide().removeClass("active");
$("#tabcontent-invencorrection").removeClass("active");

$("#li-settings").hide().removeClass("active");
$("#tabcontent-settings").removeClass("active");

var ifirst = false;
if(getPermission("inventory-tab")) {
	$("#li-overview").show();
	
	if(!ifirst) {
		$("#li-overview").addClass("active");
		$("#tabcontent-inventory").addClass("active");
		ifirst = true;
	}
}

if(getPermission("inventory-gi")) {
	
	$("#li-goodsissue").show();	
	if(!ifirst) {
		$("#li-goodsissue").addClass("active");
		$("#tabcontent-goodsissue").addClass("active");
		ifirst = true;
	}
}

if(getPermission("inventory-gr")) {
	
	$("#li-goodsreceive").show();	
	if(!ifirst) {
		$("#li-goodsreceive").addClass("active");
		$("#tabcontent-goodsreceive").addClass("active");
		ifirst = true;
	}
}

if(getPermission("inventory-stc")) {
	
	$("#li-invencorrection").show();	
	if(!ifirst) {
		$("#li-invencorrection").addClass("active");
		$("#tabcontent-invencorrection").addClass("active");
		ifirst = true;
	}
}

if(getPermission("inventory-settings")) {
	
	$("#li-settings").show();	
	if(!ifirst) {
		$("#li-settings").addClass("active");
		$("#tabcontent-settings").addClass("active");
		ifirst = true;
	}
}
