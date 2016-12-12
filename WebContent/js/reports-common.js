var global_warehouse_map = {};
getWarehousesMap().forEach(function(r){
	global_warehouse_map[r.id] = r.text;
});
var global_vendor_map = {};
getVendorsMap().forEach(function(r){
	global_vendor_map[r.id] = r.text;
});
var global_maker_map = {};
getMakersMap().forEach(function(r){
	global_maker_map[r.id] = r.text;
});

var global_cat_map = {};
getCatMap().forEach(function(r){
	global_cat_map[r.id] = r.text;
});

var dmy = 0;
function dmyf(i){
	dmy = Number(i);
}

$("#from, #to").change(function(){
	dmy = dmy(3);
});

$("#generate-report").click(function(){
	runReport();
});

function runReport() {
	var report = Number($("#report-select").val());
	var from = $("#from").val();
	var to = $("#to").val();
	if(report === 0){
		dailyStockRun();
	} else if(report === 1) {
		lowStockRun();
	} else if(report === 2) {
		inboundRunReport();
	} else if(report === 3) {
		outboundRunReport();
	} else if(report === 4) {
		stockAdjustRun();
	} else if(report === 5) {
		inboundTransRun();
	} else if(report === 6) {
		outboundTransRun();
	}
}

function getOnlyDate(date) {
	if(date){
		date = date.split(",")[0];
		return date;
	}
}

function getWarehousesMap(){
	var data = [];
	var rows = alasql("select * from whouse");
	rows.forEach(function(r){
		var d = {};
		d.id = r.id
		d.text = r.name;
		data.push(d);
	});
	return data;
}

function getVendorsMap(){
	var data = [];
	var rows = alasql("select * from vendor");
	rows.forEach(function(r){
		var d = {};
		d.id = r.id
		d.text = r.name;
		data.push(d);
	});
	return data;
}

function getCatMap(){
	var data = [];
	var rows = alasql("select * from kind");
	rows.forEach(function(r){
		var d = {};
		d.id = r.id
		d.text = r.text;
		data.push(d);
	});
	return data;
}

function getMakersMap(){
	var data = [];
	var rows = alasql("select * from maker");
	rows.forEach(function(r){
		var d = {};
		d.id = r.id
		d.text = r.text;
		data.push(d);
	});
	return data;
}




function open_dlg_overview_email(email) {
	dlg_overview_email.dialog("open");
	if(email) {
		$("#dlg-overview-email-to").val(email)
	}
	$("#dlg-overview-email-from").val(getUserEmail());
}

var dlg_overview_email = $("#dlg-overview-email").dialog(
		{
			autoOpen : false,
			width : 400,
			modal : true,
			closeOnEscape : true,
			title: "Compose Email",
			buttons : {
				Send : function() {
					$(this).dialog("close");
				},
				Cancel : function() {
					$(this).dialog("close");
				}
			},
			open : function(event) {

				$('.ui-dialog-buttonpane').find('button:contains("Send")')
						.removeClass("ui-button ui-corner-all ui-widget")
						.addClass('btn btn-primary');
				$('.ui-dialog-buttonpane').find('button:contains("Cancel")')
				.removeClass("ui-button ui-corner-all ui-widget")
				.addClass('btn btn-default');
			},
			close : function(event) {
				$("#dlg-overview-email-to").val("");
				$("#dlg-overview-email-from").val("");
			}
});