$("#porder-quotes").jsGrid({
		width:"1100px",
        filtering: true,
        sorting: true,
        autoload: true,
        
        rowClick: function(){
        	
        },
   
        
        controller: {
        	loadData: function() {
        		var porders = alasql("select * from porders order by id desc");

        		var data = [];
        		if(porders.length > 0 && porders[0].id!=undefined) {
        			porders.forEach(function(or){
        				var d = {};
        				d["id"] = or["id"];
        				d["onumber"] = or["poid"];
        				d["vendor"] = or["vendor"];
        				d["whouse"] = or["warehouse"];
        				d["status"] = or["status"];
        				d["poQuote"] = or["poQuote"];
        				d["poInvoice"] = or["poInvoice"];
        				d["lastupdate"] = or["lastupdate"];
        				data.push(d);
        			});
        		}
        		console.log(data)
        		return data;
        	},
        },
 
        fields: [
            { name: "onumber", title: "ORD. NUMBER", type: "text", editing: false, width:200, align:"center",
            	itemTemplate: function(value, item) {
            		if(item!=undefined) {
                		return "<a href='#' onclick=openPODetails(" + item.id + ")>" + value + "</a>";
            		}
            	},
            	editTemplate: function(value, item) {
            		if(item!=undefined) {
                		return "<a href='#' onclick=openPODetails(" + item.id + ")>" + value + "</a>";
            		}
            	}
            },
            { name: "status", title: "STATUS", type: "select", items: getStatusLOV("PO"), valueField: "id", textField: "text", width:200, align:"center",
            	
            	itemTemplate: function(value, item){
            		var str = "";
            		getStatusLOV("PO").forEach(function(stl){
            			if(stl.id == value) {
            				if(value == 1) str = "<span class='label label-success'>" + stl.text + "</span>";
            				else if(value == 2) str = "<span class='label label-success'>" + stl.text + "</span>";
            				else if(value == 3) str = "<span class='label label-warning'>" + stl.text + "</span>";
            				else if(value == 4) str = "<span class='label label-default'>" + stl.text + "</span>";
            				else if(value == 5) str = "<span class='label label-default'>" + stl.text + "</span>";
            				else if(value == 6) str = "<span class='label label-primary'>" + stl.text + "</span>";
            				else if(value == 7) str = "<span class='label label-info'>" + stl.text + "</span>";
            				else if(value == 8) str = "<span class='label label-danger'>" + stl.text + "</span>";
            			}
            		});
            		return str;
            	},
            	
            	editTemplate: function(value, item){
            		var $select = $("<select>");
            		getStatusLOV("PO").forEach(function(stl){
            			if(stl.id === value) {
                    		$("<option selected>").val(stl.id).text(stl.text).appendTo($select);
            			} else if(stl.parent === value) {
        	         		$("<option>").val(stl.id).text(stl.text).appendTo($select);
            			}
            		});
            		this._selectPicker = $select;
            		return $select;
            	},
            	
            	editValue: function(args){
            		console.log(this._selectPicker.val())
            		return Number(this._selectPicker.val());
            	}
            	
            },
            { name: "poQuote", title: "QUOTE", type: "text", width:200, align:"center",
            	itemTemplate: function(value, item){
            		if(!value || value=='') return "--";
            		var $a = $("<a style='color:blue;' target='_blank'>").attr("href", 
            				"data:text/csv;charset=utf-8,PROCURMENT QUOTE FOR ORDER NUMBER - " + item.onumber)
            				.attr("download", value).text(value);
            		
            		return $a;
            	}
            },
            
            { name: "poInvoice", title: "INVOICE", type: "text", width:200, align:"center",
            	itemTemplate: function(value, item){
            		if(!value || value=='') return "--";
            		var $a = $("<a style='color:blue;' target='_blank'>").attr("href", 
            				"data:text/csv;charset=utf-8,PROCURMENT INVOICE FOR ORDER NUMBER - " + item.onumber)
            				.attr("download", value).text(value);
            		
            		return $a;
            	}
            },
            { name: "lastupdate", title: "LAST UPDATE", type: "text", width:200, align:"center",},

        ]
    });
