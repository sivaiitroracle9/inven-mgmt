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
