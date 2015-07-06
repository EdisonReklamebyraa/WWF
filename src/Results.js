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
    Arbiter.subscribe("edit/mix",function(json) {
        self.loadMix(json);
        self.update();
    } );

    Arbiter.subscribe("edit/background",function(json) {
        self.loadBackground(json);
        self.update();
    } );

    Arbiter.subscribe("edit/investments",function(json) {
        self.setInvestments(json);
        self.updateResults();
    } );


    Arbiter.subscribe("edit/annualGrowthRates",function(json) {
        self.setAnnualGrowthRates(json);
        self.updateProjections();
        self.updateInvestments();
        self.updateResults();
    } );


}

Results.prototype = _.create(
    Results.prototype,
    {
        data: null,
        res: null,
        energyScenario: null,
        investments: null,
        projections: null,
        shares:null,
        annualGrowthRates: null,
        ffshares:null,
        summary: null,

        loadData: function(json) {
            this.data = json;
        },

        loadUser: function(json) {
            this.data.user = json;
        },


        loadMix: function(json) {

            this.data.electricity_mix.data = json;
        },

        loadBackground: function(json) {

            this.data.background = json;
        },

        update: _.debounce(function() {
            this.res = new RES(this.data.background);
            this.energyScenario = new EnergyScenario(this.data.electricity_mix);
            this.updateAnnualGrowthRates();
            this.updateProjections();
            this.updateInvestments();
        },100),

        updateProjections : function() {
            this.setProjections(this.res.projectIvestments( this.data.user["investment"], this.annualGrowthRates, this.data.user["target year"] - this.data.user["starting year"]));
        },

        updateAnnualGrowthRates : function() {
            this.setAnnualGrowthRates(this.res.getAnnualGrowthRates( this.data.user["annual growth rate"],
                                                                           this.data.user["target year"] - this.data.user["starting year"]));
        },


        updateInvestments : function() {

           var endOfyear = 1;

            this.setInvestments( this.res.getInvestments( this.projections, this.data.user["target"]));

            this.setShares( this.energyScenario.getRenewableEnergyShares(this.data.user["starting year"], this.data.user["target year"] + endOfyear ));
            this.setFFShares( this.energyScenario.getFossilFuelsShares(this.data.user["starting year"], this.data.user["target year"] + endOfyear ));
            this.updateResults();

        },

        updateResults: function() {

            this.summary = this.res.summarise(this.res.getLifeTimeSpread(this.shares,this.investments ));

            this.res.addComparisons(this.ffshares,this.shares );

            this.updateShares(_.first(this.shares));
            this.updateMoneyToInvest(this.investments);
            this.updateInstalledCapacity(this.shares);
            this.updateImpact(this.shares,this.investments);

            Arbiter.publish("update/growthRates", this.annualGrowthRates);
            Arbiter.publish("update/projections", this.projections);
            Arbiter.publish("update/investments", this.investments);
            Arbiter.publish("update/shares", this.shares);
        },

        setAnnualGrowthRates: function(annualGrowthRates) {
            this.annualGrowthRates = annualGrowthRates;
        },

        setProjections: function(projections){
            this.projections = projections;
        },

        setInvestments: function(investments){
            this.investments = investments;
        },

        setShares: function(shares){

            this.shares = shares;
        },

        setFFShares: function(ffshares){

            this.ffshares = ffshares;
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
            var coalPlant = 272000;
            var nuclearReactor = 922000;


            for(var i = 0; i < shares.length; i++)
            {
                installed     += shares[i].totalLifetimeOutput;
            }

            $("#gigawatts").text(numeral(installed / 1000000).format('0.00'));
            $("#coalPlants").text(numeral(installed / coalPlant).format('0a'));
            $("#nuclearReactors").text(numeral(installed / nuclearReactor).format('0a'));
        },



        updateMoneyToInvest: function(investments) {
            var investment = _.reduce(investments,
                function(previousValue, currentValue) {return previousValue + currentValue;})

            $("#budget1").text(numeral(investment).format('($ 0,00)') );
        },

        updateImpact:  _.debounce(function(shares,investments) {

                           var impact = this.res.summarise(this.res.getLifeTimeSpread(shares,investments )) ;
                           var c02g = 0;
                           var worldGHG = 45914 * 1000000  ;
                           var worldUS  = 6135 * 1000000  ;

                           for(var i = 0; i < shares.length; i++)
                           {
                               c02g     += shares[i].c02Saved;
                           }

                           Arbiter.publish("changed/impact",impact );



                           $("#timesWorld").text(numeral(c02g/worldGHG).format('0a') );
                           $("#timesUS").text(numeral(c02g /worldUS).format('0a') );

                           $("#twhImpact .amount").text(numeral(impact.averageAnnualPowerGeneration).format('0a')+'H');
                           $("#wAnnually").text(numeral(impact.averageAnnualPowerGeneration).format('0a'));
                           $("#wAnnuallyType").text(numeral(impact.averageAnnualPowerGeneration).format('a'));
                           $("#twhImpact .start").text(this.data.user["starting year"]);
                           $("#twhImpact .end").text(this.data.user["starting year"] + impact.years );

                           $("#Years").text( this.data.user["target year"] - this.data.user["starting year"] + 1);


                       }, 150)
    });