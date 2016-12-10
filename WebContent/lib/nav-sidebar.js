var global_permissions_map = {
		0: {"sb-home":true,
			"sb-inventory":true,
			"inventory-tab":true,
			"inventory-gi":true,
			"inventory-gr":true,
			"inventory-stc":true,
			"inventory-settings":true,
			"sb-products":true,
			"products-tab":true,
			"products-cat":true,
			"products-makers":true,
			"sb-vendors":true,
			"sb-orders":true,
			"orders-po-tab":true,
			"orders-so-tab":true,
			"orders-revisions":true,
			"orders-st-tab":true,
			"sb-reports":true,
			"sb-users":true,
		},
		1: {
			"sb-inventory":true,
			"inventory-tab":true,
			"inventory-stc":true,
			"sb-reports":true,
		},
		2: {
			"sb-inventory":true,
			"inventory-gr":true,
			"sb-reports":true,
		},
		3: {
			"sb-inventory":true,
			"inventory-gi":true,
			"sb-reports":true,
		},
		4: {
			"sb-inventory":true,
			"inventory-tab":true,
			"sb-orders":true,
			"orders-so-tab":true,
		},
		5: {
			"sb-inventory":true,
			"inventory-tab":true,
			"sb-products":true,
			"products-tab":true,
			"products-cat":true,
			"products-makers":true,
			"sb-vendors":true,
			"sb-orders":true,
			"orders-po-tab":true,
			"orders-st-tab":true,
		},
};

$('#nav-menu').click(function(event) {
	$('.sidebar').slideToggle(400);
	$('.sidebar').toggleClass("active");
});

$(window).click(function(event){
	if($(event.target).not("nav.sidebar, a#nav-menu").length!=0){
		if($('nav.sidebar').hasClass("active")) {
			$('.sidebar').slideToggle(10);
			$('.sidebar').toggleClass("active");
		}
	}
});

var user = parseInt($.url().param('user'));
var login = parseInt($.url().param('login'));
if(!user) {
	$(location).attr('href', 'login.html')
} else {

	var rows = alasql("select users.name, whouse.name as warehouse, users.designation  from users outer join whouse on users.whouse=whouse.id where users.id="+user);
	$("#username").text(rows[0].name);
	$("#defaultWhouse").text(rows[0].warehouse);
	$("#defaultdesignation").text(rows[0].designation);

	$("nav.sidebar ul.menu").find("li a").each(function(){
		if(user) {
			$(this).attr("href", $(this).attr("href") + "?user="+user + "&&login=1");
		}
	});
	$(".nav-home-url").each(function(){
		if(user) {
			$(this).attr("href", $(this).attr("href") + "?user="+user + "&&login=1");
		}
	});
	
	sidebarAccess();
	if(login != 1) {
		redirectToFirstPage();
	}
}

function logout() {
	$(location).attr('href', 'login.html');
}


//----------------------------------------------------------------------------------------------------------------------------------------

function getPermission(permission){
	var x = Math.floor((user - 1) / 4);
	var pmap = global_permissions_map[x];
	if(pmap[permission]) {
		return true;
	}
	return false;
}

function redirectToFirstPage() {
	var x = Math.floor((user - 1) / 4);
	var url = $("#sidebar-home").children("a").eq(0).attr("href");
	if(x!=0) {
		url = $("#sidebar-inventory").children("a").eq(0).attr("href");
	}
	$(location).attr('href', url);
}


function sidebarAccess(){
	var x = Math.floor((user - 1) / 4);
	var pmap = global_permissions_map[x];
	if(pmap["sb-home"]) {
		$("#sidebar-home").show();
	} else {
		$("#sidebar-home").hide();
	}
	
	if(pmap["sb-inventory"]) {
		$("#sidebar-inventory").show();
	} else {
		$("#sidebar-inventory").hide();
	}
	
	if(pmap["sb-products"]) {
		$("#sidebar-products").show();
	} else {
		$("#sidebar-products").hide();
	}
	
	if(pmap["sb-vendors"]) {
		$("#sidebar-vendors").show();
	} else {
		$("#sidebar-vendors").hide();
	}
	
	if(pmap["sb-orders"]) {
		$("#sidebar-orders").show();
	} else {
		$("#sidebar-orders").hide();
	}
	
	if(pmap["sb-reports"]) {
		$("#sidebar-reports").show();
	} else {
		$("#sidebar-reports").hide();
	}
	
	if(pmap["sb-users"]) {
		$("#sidebar-users").show();
	} else {
		$("#sidebar-users").hide();
	}
}

$(window).load(function() {
	  // When the page has loaded
	  $("#show-body").fadeIn(1000);
	});