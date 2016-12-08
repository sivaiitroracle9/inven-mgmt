// Morris.js Charts sample data for SB Admin template

$(function() {
    // Donut Chart
var dnt=   Morris.Donut({
        element: 'morris-donut-chart',
        data: [{
            label: "Download Sales",
            value: 12
        }, {
            label: "In-Store Sales",
            value: 30
        }, {
            label: "Mail-Order Sales",
            value: 20
        }],
        resize: true
    });

console.log(dnt)

    // Line Chart
    Morris.Line({
        // ID of the element in which to draw the chart.
        element: 'morris-inventory-value-chart',
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        data: [{
            d: '2012-10-01',
            value: 802
        }, {
            d: '2012-10-02',
            value: 783
        }, {
            d: '2012-10-03',
            value: 820
        }, {
            d: '2012-10-04',
            value: 839
        }, {
            d: '2012-10-05',
            value: 792
        }, {
            d: '2012-10-06',
            value: 859
        }, {
            d: '2012-10-07',
            value: 790
        }, {
            d: '2012-10-08',
            value: 1680
        }, {
            d: '2012-10-09',
            value: 1592
        }, {
            d: '2012-10-10',
            value: 1420
        }, {
            d: '2012-10-11',
            value: 882
        }, {
            d: '2012-10-12',
            value: 889
        }, {
            d: '2012-10-13',
            value: 819
        }, {
            d: '2012-10-14',
            value: 849
        }, {
            d: '2012-10-15',
            value: 870
        }, {
            d: '2012-10-16',
            value: 1063
        }, {
            d: '2012-10-17',
            value: 1192
        }, {
            d: '2012-10-18',
            value: 1224
        }, {
            d: '2012-10-19',
            value: 1329
        }, {
            d: '2012-10-20',
            value: 1329
        }, {
            d: '2012-10-21',
            value: 1239
        }, {
            d: '2012-10-22',
            value: 1190
        }, {
            d: '2012-10-23',
            value: 1312
        }, {
            d: '2012-10-24',
            value: 1293
        }, {
            d: '2012-10-25',
            value: 1283
        }, {
            d: '2012-10-26',
            value: 1248
        }, {
            d: '2012-10-27',
            value: 1323
        }, {
            d: '2012-10-28',
            value: 1390
        }, {
            d: '2012-10-29',
            value: 1420
        }, {
            d: '2012-10-30',
            value: 1529
        }, {
            d: '2012-10-31',
            value: 1892
        }, ],
        // The name of the data record attribute that contains x-visitss.
        xkey: 'd',
        // A list of names of data record attributes that contain y-visitss.
        ykeys: ['value'],
        // Labels for the ykeys -- will be displayed when you hover over the
        // chart.
        labels: ['Value $'],
        // Disables line smoothing
        smooth: false,
        resize: true
    });

    // Bar Chart
    Morris.Bar({
        element: 'morris-bar-chart',
        data: [{
            device: 'iPhone',
            geekbench: 136
        }, {
            device: 'iPhone 3G',
            geekbench: 137
        }, {
            device: 'iPhone 3GS',
            geekbench: 275
        }, {
            device: 'iPhone 4',
            geekbench: 380
        }, {
            device: 'iPhone 4S',
            geekbench: 655
        }, {
            device: 'iPhone 5',
            geekbench: 1571
        }],
        xkey: 'device',
        ykeys: ['geekbench'],
        labels: ['Geekbench'],
        barRatio: 0.4,
        xLabelAngle: 35,
        hideHover: 'auto',
        resize: true
    });

});
