$("#users-grid").jsGrid({
	width:"100%",
	height:"700px",
    autoload: true,
    inserting: true,
    editing: true,
    filtering: true,
    
    controller: {
    	loadData: function(filter) {
    		var users = [];
    		var rows = alasql("select users.uname, users.email,users.name,users.dob,users.designation,users.department,users.status,whouse.name as whouse from users outer join whouse on users.whouse=whouse.id");
    		if(rows){
    			rows.forEach(function(r){
    				var u = {};
    				u.uname = r.uname;
    				u.uemail = r.email;
    				u.fullname = r.name;
    				u.department = r.department;
    				u.whouse = r.whouse;
    				u.dob = r.dob;
    				u.designation = r.designation;
    				u.status = r.status;
    				users.push(u);
    			});
    		}
    		return users;
    	}
    },
    fields: [
    	{name:"uname", title:"USERNAME", type:"text", width:150,align:"center",},
    	{name:"uemail", title:"EMAIL", type:"text", width:150,align:"center",},
    	{name:"fullname", title:"FULL NAME", type:"text", width:150,align:"center",},
    	{name:"department", title:"DEPARTMENT", type:"select", items:getUserDepartments(), valueField: "id", textField: "text", width:150,align:"center",},
    	{name:"whouse", title:"WAREHOUSE", type:"select", items:getUserWhouses(), valueField: "id", textField: "text", width:150,align:"center",},
    	{name:"dob", title:"DATE OF BIRTH", type:"text", width:150,align:"center",},
    	{name:"designation", title:"DESIGNATION", type:"select", items:getUserDesignation(), valueField: "id", textField: "text", width:150,align:"center",},
    	{name:"status", title:"STATUS", type:"select", items:getUserStatus(), valueField: "id", textField: "text", width:150,align:"center",},
    	{type:"control",},
    ]
});


function getUserStatus() {
	var data = [];
	data.push({id:"", text:""});
	data.push({id:"ACTIVE", text:"ACTIVE"});
	data.push({id:"INACTIVE", text:"INACTIVE"});
	return data;
}

function getUserDepartments() {
	var data = [];
	data.push({id:"", text:""});
	data.push({id:"MANAGER", text:"MANAGER"});
	data.push({id:"SHELF", text:"SHELF"});
	data.push({id:"GOODS RECEIPT", text:"GOODS RECEIPT"});
	data.push({id:"GOODS ISSUE", text:"GOODS ISSUE"});
	data.push({id:"SALES", text:"SALES"});
	data.push({id:"PROCUREMENT", text:"PROCUREMENT"});
	return data;
}

function getUserWhouses() {
	var data = [];
	data.push({id:"", text:""});
	var rows = alasql("select distinct(whouse.name) as warehouse from users outer join whouse on users.whouse=whouse.id");
	if(rows){
		rows.forEach(function(r){
			var d = {};
			d.id = r.warehouse;
			d.text = r.warehouse;
			data.push(d);
		});
	}
	return data;
}

function getUserDesignation() {
	var data = [];
	data.push({id:"", text:""});
	var rows = alasql("select distinct(designation) as designation from users");
	if(rows){
		rows.forEach(function(r){
			var d = {};
			d.id = r.designation;
			d.text = r.designation;
			data.push(d);
		});
	}
	return data;
}