var Arbiter = require('arbiter-subpub');
var _ = require("lodash");



module.exports = Charts;

function Charts(data) {

    var self = this;

    Arbiter.subscribe("update/shares",function(json) {
        self.updateShares(json);
    } );

    Arbiter.subscribe("update/investments",function(json) {
        self.updateInvestments(json);
    } );

    Arbiter.subscribe("changed/user",function(json) {
        self.updateUser(json);
    } );

    Arbiter.subscribe("update/user",function(json) {
        self.updateUser(json);
    } );

    Arbiter.subscribe("changed/impact",function(json) {
        self.updateImpact(json);
    } );

    google.load('visualization', '1.0', {'packages':['corechart',"bar"]});
    google.setOnLoadCallback(function() {
        self.loadedGoogle();
    });


}

Charts.prototype = _.create(
    Charts.prototype,
    {
        shares: null,
        investments: null,
        impact: null,
        user: null,
        gLoaded: false,

        updateShares: function(json) {
            this.shares = (json)?json: this.shares;
            this.update();
        },

        updateUser: function(json) {

            this.user = (json)?json: this.user;
            this.update();
        },


        updateInvestments: function(json) {
            this.investments = (json)?json: this.investments;
            this.update();
        },

        update: _.debounce(function() {

                    this.pieChart();
                    this.totalInvestmentChart();
                    this.investmentsChart();
                    this.impactChart();
                    this.capacityInstalled();
                }, 200),


        updateImpact: function(json) {
            this.impact = (json)?json: this.impact;
            this.update();
        },

        loadedGoogle: function() {
            this.gLoaded = true;
            this.update();
        },

        impactChart: function() {

            if(this.impact && this.gLoaded && this.user){

                var arrData = [ ['Year', 'Comparison field', 'Energy']];
                var comp  = this.user["comparison"] ;

                for(var i = 0; i < this.impact.yearlyTotalPowerGeneration.length; i++)
                {
                    arrData.push([(this.user["starting year"] + i) + "", comp, this.impact.yearlyTotalPowerGeneration[i]]);


                }

                var data = google.visualization.arrayToDataTable(arrData);

                var options = {
                    height: 400,
                    chartArea: {  height: "60%" },
                    chart: {
                        title: 'Impact'
                    },
                    legend:{
                        position: 'top', maxLines: 10
                    }
                };


                var chart = new google.visualization.ColumnChart(document.getElementById('ImpactChart'));

                chart.draw(data, options);

                $("#ImpactChartLink").html( '<img width="50" target="_blank" src="' + chart.getImageURI() + '"/><a href="' + chart.getImageURI() + '">Download Chart</a>').click(function(e){
                    saveSVG("ImpactChart");
                    e.preventDefault();
                });
            }
        } ,


        investmentsChart: function() {
            if(this.impact && this.gLoaded && this.user){
                var data = [(["Year"]).concat(_.first(this.shares).members.map(function(member) {
                                                  return member.title;
                                              })).concat(["total"])];

                for(var i = 0; i < this.shares.length; i++){
                    data.push(([(this.user["starting year"] + i + "")]).concat(this.shares[i].members.map(function(member) {
                                                                                   return member.money;
                                                                               })).concat([this.shares[i].totalMoney]) );
                }

                var series = {};
                series[(this.shares[0].members.length)] = {type: 'line'};
                var options = {
                    height: 400,
                    vAxis: {title: 'Invested, $'},
                    hAxis: {title: 'Year'},
                    seriesType: 'bars',
                    series: series,
                    chartArea: {  height: "60%" },
                    legend:{
                        position: 'top', maxLines: 10
                    }
                };

                var chart = new google.visualization.ComboChart(document.getElementById('InvestmentChart'));
                chart.draw(google.visualization.arrayToDataTable(data), options);

                $("#InvestmentChartLink").html( '<img width="50" target="_blank" src="' + chart.getImageURI() + '"/><a href="' + chart.getImageURI() + '">Download Chart</a>').click(function(e){
                    saveSVG("InvestmentChart");
                    e.preventDefault();
                });




            }} ,



        capacityInstalled:  function() {
            if(this.investments && this.gLoaded && this.user){
                var data = [(["Year"]).concat(_.first(this.shares).members.map(function(member) {
                                                  return member.title;
                                              })).concat(["total"])];

                for(var i = 0; i < this.shares.length; i++){
                    data.push(([(this.user["starting year"] + i + "")]).concat(this.shares[i].members.map(function(member) {
                                                                                   return member.installed;
                                                                               })).concat([this.shares[i].totalInstalled]) );
                }

                var series = {};
                series[(this.shares[0].members.length )]  = {type: 'line'};
                var options = {
                    height: 400,
                    vAxis: {title: 'Installed capacity, kW'},
                    hAxis: {title: 'Year'},
                    seriesType: 'bars',
                    series: series,
                    chartArea: {  height: "60%" },
                    legend:{
                        position: 'top', maxLines: 10
                    }
                };

                var chart = new google.visualization.ComboChart(document.getElementById('CapacityInstalled'));
                chart.draw(google.visualization.arrayToDataTable(data), options);
                $("#CapacityInstalledLink").html( '<img width="50" target="_blank" src="' + chart.getImageURI() + '"/><a href="' + chart.getImageURI() + '">Download Chart</a>').click(function(e){
                    saveSVG("CapacityInstalled");
                    e.preventDefault();
                });

            }
        },


        totalInvestmentChart:   function() {

            if(this.investments && this.gLoaded && this.user){
                var arrData = [ ['Year', 'Annual investment', 'Cumulative investment']];
                var total = 0;

                for(var i = 0; i < this.investments.length; i++)
                {
                    total += this.investments[i];
                    arrData.push([(this.user["starting year"] + i) + "", this.investments[i],total]);
                }

                var data = google.visualization.arrayToDataTable(arrData);

                var options = {
                    height: 400,
                    chartArea: {  height: "60%" },
                    chart: {
                        title: 'Annual and cumulative investment.'
                    },
                    legend:{
                        position: 'top', maxLines: 10
                    }
                };


                var chart = new google.visualization.ColumnChart(document.getElementById('TotalInvestmentChart'));
                chart.draw(data, options);

                $("#TotalInvestmentChartLink").html( '<img width="50" target="_blank" src="' + chart.getImageURI() + '"/><a href="' + chart.getImageURI() + '">Download Chart</a>').click(function(e){
                    saveSVG("TotalInvestmentChart");
                    e.preventDefault();
                });

            }
        },

        pieChart:  function() {
            if(this.shares && this.gLoaded ){
                var data = new google.visualization.DataTable();
                var pieData = [];

                data.addColumn('string', 'Type');
                data.addColumn('number', 'Percentage');



                for(var i = 0; i < this.shares[0].members.length; i++)
                {
                    var av = this.shares.reduce(function(a, share) {
                                 return a + share.members[i].percent; }, 0) / this.shares.length;
                    pieData.push([this.shares[0].members[i].title,av * 100]);
                }

                data.addRows(pieData );
                // Set chart options
                var options = {
                    height: 400,
                    'title':'Relative share that each technology has WITHIN its category',
                    chartArea: {  height: "60%" },
                    legend:{
                        position: 'top', maxLines: 10
                    }
                };

                var chart = new google.visualization.PieChart(document.getElementById('PieDist'));
                chart.draw(data, options);
                $("#PieDistLink").html( '<img width="50" target="_blank" src="' + chart.getImageURI() + '"/><a href="' + chart.getImageURI() + '">Download Chart</a>')
                .click(function(e){
                    saveSVG("PieDist");
                    e.preventDefault();
                });
            }
        }

    }
);


function saveSVG(id) {


    var img = $("#"+id+"Link img:First").get(0);



  var image_data = atob(img.src.split(',')[1]);
    // Use typed arrays to convert the binary data to a Blob
    var arraybuffer = new ArrayBuffer(image_data.length);
    var view = new Uint8Array(arraybuffer);
    for (var i=0; i<image_data.length; i++) {
        view[i] = image_data.charCodeAt(i) & 0xff;
    }
    try {
        // This is the recommended method:
        var blob = new Blob([arraybuffer], {type: 'application/octet-stream'});
        saveAs(blob, id+".png");
    } catch (e) {
        // The BlobBuilder API has been deprecated in favour of Blob, but older
        // browsers don't know about the Blob constructor
        // IE10 also supports BlobBuilder, but since the `Blob` constructor
        //  also works, there's no need to add `MSBlobBuilder`.
        var bb = new (window.WebKitBlobBuilder || window.MozBlobBuilder);
        bb.append(arraybuffer);
        var blob = bb.getBlob('application/octet-stream'); // <-- Here's the Blob

        saveAs(blob, id+".png");
    }


}