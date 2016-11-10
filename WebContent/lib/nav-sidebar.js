$('#nav-menu').click(function(event) {
	$('.sidebar').toggleClass('active');
});

$('body').click(function(event){
	if($(event.target).not("nav.sidebar, a#nav-menu").length!=0){
		if($('nav.sidebar').hasClass("active")) {
			$('nav.sidebar').removeClass("active");
		}

	}
});
