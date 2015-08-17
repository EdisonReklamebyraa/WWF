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

    $("#ComparisonField").change(function() {
         this.impactChart();
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
             this.investmentsChart();
             this.impactChart();
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
                var comp  = $("#ComparisonField").val() * 1;

                for(var i = 0; i < this.impact.yearlyTotalPowerGeneration.length; i++)
                {
                    arrData.push([(this.user["starting year"] + i) + "", comp, this.impact.yearlyTotalPowerGeneration[i]]);


                }

                var data = google.visualization.arrayToDataTable(arrData);

                var options = {
                    chart: {
                        title: 'Annual and cumulative investment.'
                    }
                };


                var chart = new google.visualization.ColumnChart(document.getElementById('ImpactChart'));

                chart.draw(data, options);
            }
        },


        investmentsChart: function() {

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
                    chart: {
                        title: 'Annual and cumulative investment.'
                    }
                };


                var chart = new google.charts.Bar(document.getElementById('InvestmentsChart'));

                chart.draw(data, options);
            }
        },

        pieChart: function() {
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
                var options = {'title':'Relative share that each technology has WITHIN its category' };

                var chart = new google.visualization.PieChart(document.getElementById('PieDist'));
                chart.draw(data, options);
            }
        }

    }
);