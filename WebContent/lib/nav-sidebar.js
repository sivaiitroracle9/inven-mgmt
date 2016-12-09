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
if(!user) {
	/*var $a = $("<a>").attr("href", "login.html");
	$a.click();*/
	$(location).attr('href', 'login.html')
} else {
	var rows = alasql("select users.name, whouse.name as warehouse, users.designation  from users outer join whouse on users.whouse=whouse.id where users.id="+user);
	$("#username").text(rows[0].name);
	$("#defaultWhouse").text(rows[0].warehouse);
	$("#defaultdesignation").text(rows[0].designation);
	$("nav.sidebar ul.menu").find("li a").each(function(){
		if(user) {
			$(this).attr("href", $(this).attr("href") + "?user="+user);
		}
	});
	$(".nav-home-url").each(function(){
		if(user) {
			$(this).attr("href", $(this).attr("href") + "?user="+user);
		}
	});
}

function logout() {
	$(location).attr('href', 'login.html');
}