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
                    height: 300,
                    chart: {
                        title: 'Impact'
                    },
                    legend:{
                        position: 'bottom', maxLines: 5
                    }
                };


                var chart = new google.visualization.ColumnChart(document.getElementById('ImpactChart'));

                chart.draw(data, options);

                $("#ImpactChartLink").html( '<a target="_blank" href="' + chart.getImageURI() + '">Download Chart</a>').click(function(e){
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
                     height: 300,
                    vAxis: {title: 'Invested, $'},
                    hAxis: {title: 'Year'},
                    seriesType: 'bars',
                    series: series,
                    legend:{
                        position: 'bottom', maxLines: 5
                    }
                };

                var chart = new google.visualization.ComboChart(document.getElementById('InvestmentChart'));
                chart.draw(google.visualization.arrayToDataTable(data), options);

                $("#InvestmentChartLink").html( '<a target="_blank" href="' + chart.getImageURI() + '">Download Chart</a>').click(function(e){
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
                    height: 300,
                    vAxis: {title: 'Installed capacity, kW'},
                    hAxis: {title: 'Year'},
                    seriesType: 'bars',
                    series: series,
                    legend:{
                        position: 'bottom', maxLines: 5
                    }
                };

                var chart = new google.visualization.ComboChart(document.getElementById('CapacityInstalled'));
                chart.draw(google.visualization.arrayToDataTable(data), options);
                $("#CapacityInstalledLink").html( '<a target="_blank" href="' + chart.getImageURI() + '">Download Chart</a>').click(function(e){
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
                     height: 300,
                    chart: {
                        title: 'Annual and cumulative investment.'
                    },
                    legend:{
                        position: 'bottom', maxLines: 5
                    }
                };


                var chart = new google.visualization.ColumnChart(document.getElementById('TotalInvestmentChart'));
                chart.draw(data, options);

                $("#TotalInvestmentChartLink").html( '<a target="_blank" href="' + chart.getImageURI() + '">Download Chart</a>').click(function(e){
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
                    pieData.push([this.shares[0].members[i].title,this.shares[0].members[i].percent* 100]);
                }
                data.addRows(pieData );
                // Set chart options
                var options = {
                     height: 300,
                    'title':'Relative share that each technology has WITHIN its category',
                    legend:{
                        position: 'bottom', maxLines: 5
                    }
                };

                var chart = new google.visualization.PieChart(document.getElementById('PieDist'));
                chart.draw(data, options);
                $("#PieDistLink").html( '<a target="_blank" href="' + chart.getImageURI() + '">Download Chart</a>').click(function(e){
                    saveSVG("PieDistLink");
                    e.preventDefault();
                });
            }
        }

    }
);


function saveSVG(id) {

    var blob = new Blob(['<?xml version="1.0" encoding="utf-8"?>',
                         '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n',
                         '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" >',
                         (new XMLSerializer()).serializeToString($("#"+id+" svg").get(0)),
                         "</svg>"], {type: "application/svg+xml;charset=utf-8"});
    saveAs(blob, id+".svg");
}