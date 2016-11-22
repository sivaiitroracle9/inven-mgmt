var DB = {};

DB.init = function() {
	if (window.confirm('are you sure to initialize database?')) {
		DB.load();
	}
};

DB.load = function() {
	alasql.options.joinstar = 'overwrite';

	// Classes
	alasql('DROP TABLE IF EXISTS kind;');
	alasql('CREATE TABLE kind(id INT IDENTITY, text STRING);');
	var pkind = alasql.promise('SELECT MATRIX * FROM CSV("data/KIND-KIND.csv", {headers: true})').then(function(kinds) {
		for (var i = 0; i < kinds.length; i++) {
			var kind = kinds[i];
			alasql('INSERT INTO kind VALUES(?,?);', kind);
		}
	});

	// Items
	alasql('DROP TABLE IF EXISTS item;');
	alasql('CREATE TABLE item(id INT IDENTITY, code STRING, kind INT, detail STRING, maker INT, price INT, unit STRING);');
	var pitem = alasql.promise('SELECT MATRIX * FROM CSV("data/ITEM-ITEM.csv", {headers: true})').then(function(items) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			alasql('INSERT INTO item VALUES(?,?,?,?,?,?,?);', item);
		}
	});

	// Warehouses
	alasql('DROP TABLE IF EXISTS whouse;');
	alasql('CREATE TABLE whouse(id INT IDENTITY, name STRING, addr STRING, tel STRING);');
	var pwhouse = alasql.promise('SELECT MATRIX * FROM CSV("data/WHOUSE-WHOUSE.csv", {headers: true})').then(
			function(whouses) {
				for (var i = 0; i < whouses.length; i++) {
					var whouse = whouses[i];
					alasql('INSERT INTO whouse VALUES(?,?,?,?);', whouse);
				}
			});

	// Inventories
	alasql('DROP TABLE IF EXISTS stock;');
	alasql('CREATE TABLE stock(id INT IDENTITY, item INT, whouse INT, balance INT, threshold INT, autopo INT, cstock INT, cstock_type INT);');
	var pstock = alasql.promise('SELECT MATRIX * FROM CSV("data/STOCK-STOCK.csv", {headers: true})').then(
			function(stocks) {
				for (var i = 0; i < stocks.length; i++) {
					var stock = stocks[i];
					alasql('INSERT INTO stock VALUES(?,?,?,?,?,?,?,?);', stock);
				}
			});

	// Transaction
	alasql('DROP TABLE IF EXISTS trans;');
	alasql('CREATE TABLE trans(id INT IDENTITY, stock INT, date DATE, qty INT, balance INT, memo STRING);');
	var ptrans = alasql.promise('SELECT MATRIX * FROM CSV("data/TRANS-TRANS.csv", {headers: true})').then(
			function(transs) {
				for (var i = 0; i < transs.length; i++) {
					var trans = transs[i];
					alasql('INSERT INTO trans VALUES(?,?,?,?,?,?);', trans);
				}
			});
	
	// Vendor
	alasql('DROP TABLE IF EXISTS vendor;');
	alasql('CREATE TABLE vendor(id INT IDENTITY, name STRING, tel STRING, vencode STRING, email STRING, address STRING);');
	var pvendor = alasql.promise('SELECT MATRIX * FROM CSV("data/VENDOR-VENDOR.csv", {headers: true})').then(
			function(vendors) {
				for (var i = 0; i < vendors.length; i++) {
					var vendor = vendors[i];
					alasql('INSERT INTO vendor VALUES(?,?,?,?,?,?);', vendor);
				}
			});
	
/*	// Outlet
	alasql('DROP TABLE IF EXISTS outlet;');
	alasql('CREATE TABLE outlet(id INT IDENTITY, name STRING, tel STRING, outletcode STRING, email STRING, address STRING);');
	var pvendor = alasql.promise('SELECT MATRIX * FROM CSV("data/VENDOR-VENDOR.csv", {headers: true})').then(
			function(vendors) {
				for (var i = 0; i < vendors.length; i++) {
					var vendor = vendors[i];
					alasql('INSERT INTO outlet VALUES(?,?,?,?,?,?);', vendor);
				}
			});*/
	
	alasql('DROP TABLE IF EXISTS products;');
	alasql('CREATE TABLE products(id INT IDENTITY, code STRING, category INT, detail STRING, make INT, price INT, unit STRING);');
	var pproduct = alasql.promise('SELECT MATRIX * FROM CSV("data/PRODUCT-PRODUCT.csv", {headers: true})').then(
			function(products) {
				for (var i = 0; i < products.length; i++) {
					var prod = products[i];
					alasql('INSERT INTO products VALUES(?,?,?,?,?,?,?);', prod);
				}
			});
	
	alasql('DROP TABLE IF EXISTS maker;');
	alasql('CREATE TABLE maker(id INT IDENTITY, text STRING);');
	var pmaker = alasql.promise('SELECT MATRIX * FROM CSV("data/MAKER-MAKER.csv", {headers: true})').then(
			function(makers) {
				for (var i = 0; i < makers.length; i++) {
					var make = makers[i];
					alasql('INSERT INTO maker VALUES(?,?);', make);
				}
			});
	
	alasql('DROP TABLE IF EXISTS orders;');
	alasql('CREATE TABLE orders(id INT IDENTITY, oid STRING, otype INT, totype INT, toagent INT, fromtype INT, fromagent INT, status INT, lastupdate STRING);');

	alasql('DROP TABLE IF EXISTS poitems;');
	alasql('CREATE TABLE poitems(id INT IDENTITY, oid STRING, pcode STRING, pcat INT, pmake INT, pdetail STRING, qty INT, status INT, received INT, lastupdate STRING);');

	alasql('DROP TABLE IF EXISTS soitems;');
	alasql('CREATE TABLE soitems(id INT IDENTITY, oid STRING, pcode STRING, pcat INT, pmake INT, pdetail STRING, qty INT, status INT, shipped INT, lastupdate STRING);');
	
	alasql('DROP TABLE IF EXISTS customer;');
	alasql('CREATE TABLE customer(id INT IDENTITY, cname STRING, cemail STRING, ctel STRING, caddress STRING);');
	
	alasql('DROP TABLE IF EXISTS status;');
	alasql('CREATE TABLE status(id INT IDENTITY, text STRING, type STRING);');
	var pstatus = alasql.promise('SELECT MATRIX * FROM CSV("data/STATUS-STATUS.csv", {headers: true})').then(
			function(statuss) {
				for (var i = 0; i < statuss.length; i++) {
					var sttus = statuss[i];
					alasql('INSERT INTO status VALUES(?,?,?);', sttus);
				}
			});
	
	
	// Reload page
	Promise.all([ pkind, pitem, pwhouse, pstock, ptrans, pvendor, pproduct, pmaker, pstatus ]).then(function() {
		window.location.reload(true);
	});
};

DB.remove = function() {
	if (window.confirm('are you sure to delete dababase?')) {
		alasql('DROP localStorage DATABASE STK')
	}
};

// add commas to number
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// DO NOT CHANGE!
alasql.promise = function(sql, params) {
	return new Promise(function(resolve, reject) {
		alasql(sql, params, function(data, err) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

// connect to database
try {
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
} catch (e) {
	alasql('CREATE localStorage DATABASE STK;');
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
	DB.load();
}
