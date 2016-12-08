if(user === 2){// shelf
	$("#li-overview").show().addClass("active");
	$("#tabcontent-inventory").show().addClass("active");
	$("#li-goodsissue").show();
	$("#tabcontent-goodsissue");
	
	$("#li-settings").hide().removeClass("active");
	$("#tabcontent-settings").hide().removeClass("active");
	
	$("#li-goodsreceive").hide().removeClass("active");
	$("#tabcontent-goodsreceive").hide().removeClass("active");
	
	$("#sidebar-home").show();
	$("#sidebar-inventory").show();
	$("#sidebar-products").show();
	$("#sidebar-vendors").hide();
	$("#sidebar-orders").show();
	$("#sidebar-users").hide();
} else if(user === 3) { //goodsreceipt
	$("#li-overview").hide().removeClass("active");
	$("#li-goodsissue").hide().removeClass("active");
	$("#li-settings").hide().removeClass("active");
	$("#tabcontent-inventory").hide().removeClass("active");
	$("#tabcontent-goodsissue").hide().removeClass("active");
	$("#tabcontent-settings").hide().removeClass("active");
	$("#li-goodsreceive").show().addClass("active");
	$("#tabcontent-goodsreceive").show().addClass("active");
	
	$("#sidebar-home").show();
	$("#sidebar-inventory").show();
	$("#sidebar-products").hide();
	$("#sidebar-vendors").show();
	$("#sidebar-orders").show();
	$("#sidebar-users").hide();
}