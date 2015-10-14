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
            this.clean();
        },

        loadUser: function(json) {
            this.data.user = json;
            this.clean();
        },

        loadMix: function(json) {

            this.data.electricity_mix.data = json;
        },

        loadBackground: function(json) {

            this.data.background = json;
        },

        clean: function() {
            this.data.user["starting year"] = Math.max(this.data.user["starting year"], 2000);
            this.data.user["target year"] = Math.max(this.data.user["starting year"], this.data.user["target year"]);
            this.data.user["target year"] =  (this.data.user["target year"] - this.data.user["starting year"] > 100)?this.data.user["starting year"] + 99 : this.data.user["target year"] ;
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
                                                                           this.data.user["target year"] - this.data.user["starting year"] ));
        },


        updateInvestments : function() {

            this.setInvestments( this.res.getInvestments( this.projections, this.data.user["target"]));
            this.setShares( this.energyScenario.getRenewableEnergyShares(this.data.user["starting year"], this.data.user["target year"]  ));
            this.setFFShares( this.energyScenario.getFossilFuelsShares(this.data.user["starting year"], this.data.user["target year"] ));
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

            var coalPlant = this.data.user["coalPlant"];
            var nuclearReactor = this.data.user["nuclearReactor"];
            var EUCitizens = this.data.user["EUCitizens"];
            var US = this.data.user["US"];


            for(var i = 0; i < shares.length; i++)
            {
                installed     += shares[i].totalInstalled;
            }

            $(".gigawatts").text(numeral(installed).format('0, 000'));
            $(".coalPlants").text(numeral(installed / coalPlant).format('0, 000'));
            $(".nuclearReactors").text(numeral(installed / nuclearReactor).format('0, 000'));

            $(".EUCitizens").text(numeral(installed / EUCitizens).format('0, 000'));
            $(".US").text(numeral(installed / US).format('0, 000.00'));

        },



        updateMoneyToInvest: function(investments) {
            var investment = _.reduce(investments,
                function(previousValue, currentValue) {return previousValue + currentValue;})

            $("#budget1").text(numeral(investment).format('($ 0, 000)') );
        },

        updateImpact:  _.debounce(function(shares,investments) {
                           var million = 1000000;
                           var globes = "";
                           var c02g = 0;

                           var worldGHG = this.data.user["worldGHG"];
                           var worldUS  = this.data.user["worldUS"];

                           var numGlobes = 0;

                           for(var i = 0; i < shares.length; i++)
                           {
                               c02g     += shares[i].c02Saved;
                           }

                           numGlobes = Math.floor(c02g/worldGHG);


                           for(i = 0; i < numGlobes; i++)
                           {
                               globes += (numGlobes > 40 )? ".":'<img src="/img/SVG/globe.svg" class="globe" width="' +90/numGlobes +  '%" />'
                           }

                           Arbiter.publish("changed/impact",this.summary  );

                           $(".EmissionsAvoided").text(numeral(c02g/million).format('0, 000'));
                           $(".timesWorld").text(numeral(c02g/worldGHG).format('0, 000') );

                           $(".globes").html(globes);

                           $(".timesUS").text(numeral(c02g /worldUS).format('0, 000') );
                           $(".amount").text(numeral(this.summary.averageAnnualPowerGeneration).format('0, 000')+' KWh');
                           $(".wAnnually").text(numeral(this.summary .averageAnnualPowerGeneration).format('0, 000'));
                           $(".wAnnuallyType").text(numeral(this.summary .averageAnnualPowerGeneration).format('0, 000'));
                           $(".start").text(this.data.user["starting year"]);
                           $(".end").text(this.data.user["starting year"] + this.summary.years );
                           $(".targetYears").text(this.data.user["target year"]   );
                           $(".impactYears").text(  this.summary .years );

                           $(".targetPercent").text(numeral(this.data.user["target"]).format('0%')   );

                           $(".years").text( this.data.user["target year"] - this.data.user["starting year"] + 1);

                           $(".jobsCreated").text(numeral(_.first(shares).totalJobsCreated).format('0, 000'));


                       }, 150)
    });