var Arbiter = require('arbiter-subpub');
var RES = require('./res.js');
var EnergyScenario = require('./energyScenario.js');

var _ = require("lodash");



module.exports = Results;

function Results(data) {

    var self = this;

    Arbiter.subscribe("update",function(json) {
        self.loadData(json);
        self.update();
    } );

    Arbiter.subscribe("changed/user",function(json) {

        self.loadUser(json);
        self.update();
    } );
}

Results.prototype = _.create(
    Results.prototype,
    {
        data: null,
        res: null,
        energyScenario: null,

        loadData: function(json) {
            this.data = json;
        },


        loadUser: function(json) {
            this.data.user = json;
        },

        update: function() {
            this.res = new RES(this.data.background);
            this.energyScenario = new EnergyScenario(this.data.electricity_mix);
            this.updateResults();
        },

        updateResults: function() {

            var investments = this.res.getInvestments(
                this.data.user["investment"],
                this.data.user["annual growth rate"],
                this.data.user["target"],
                this.data.user["target year"] - this.data.user["starting year"]);
            var shares = this.energyScenario.getRenewableEnergyShares(this.data.user["starting year"], this.data.user["target year"]);

            var summary = this.res.summarise(this.res.getLifeTimeSpread(shares,investments ));


            this.updateShares(_.first(shares));
            this.updateMoneyToInvest(investments);
            this.updateInstalledCapacity(shares);
        },

        updateShares: function(share) {

            for(var i = 0; i < share.members.length; i++)
            {
                $("[data-id="+share.members[i].id+"] span").text(
                    numeral(share.members[i].percent).format('0%')
                );
            }
        },

        updateInstalledCapacity: function(shares) {
            var installed = 0 ;
            for(var i = 0; i < shares.length; i++)
            {
                installed     += shares[i].totalLifetimeOutput;
            }

            $("#gigawatts").text(numeral(installed / 1000000).format('0.00'));
        },


        updateMoneyToInvest: function(investments) {
            var investment = investments.reduce(
                function(previousValue, currentValue) {return previousValue + currentValue;})

            $("#budget1").text(numeral(investment).format('($ 0.00 a)') );
        }


    });