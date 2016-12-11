var rfirst = false;
$("#report-select").find("option").each(function(){
	$(this).hide();
	$(this).prop("selected", false);
	
	var val = $(this).val();
	if(getPermission("reports-" + val)){
		$(this).show();
		if(!rfirst) {
			$(this).prop("selected", true);
			rfirst = true;
		}
	}
})
