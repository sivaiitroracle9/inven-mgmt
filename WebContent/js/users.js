$("#users-grid").jsGrid({
	width:"100%",
	height:"500px",
    autoload: true,
    inserting: true,
    editing: true,
    filtering: true,
    
    controller: {
    	loadData: function(filter) {
    		return [];
    	}
    },
    fields: [
    	{name:"uname", title:"USERNAME", type:"text", width:150,align:"center",},
    	{name:"uemail", title:"EMAIL", type:"text", width:150,align:"center",},
    	{name:"fullname", title:"FULL NAME", type:"text", width:150,align:"center",},
    	{name:"department", title:"DEPARTMENT", type:"text", width:150,align:"center",},
    	{name:"whouse", title:"WAREHOUSE", type:"text", width:150,align:"center",},
    	{name:"dob", title:"DATE OF BIRTH", type:"text", width:150,align:"center",},
    	{name:"designation", title:"DESIGNATION", type:"text", width:150,align:"center",},
    	{name:"status", title:"STATUS", type:"select", items:getUserStatus(), valueField: "id", textField: "text", width:150,align:"center",},
    	{type:"control",},
    ]
});


function getUserStatus() {
	var data = [];
	data.push({id:0, text:""});
	data.push({id:1, text:"ACTIVE"});
	data.push({id:2, text:"INACTIVE"});
	return data;
}