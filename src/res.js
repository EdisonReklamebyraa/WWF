var _ = require("lodash");



module.exports = RES;

function RES(data) {
    this.backgroundData = data;
}

RES.prototype = _.create(
    RES.prototype,
    {
        backgroundData: null,
        growInvestment : function(investment, annualGrowthRate)
        {
            return this.growInvestmentInYears(investment,annualGrowthRate,1);
        },

        growInvestmentInYears : function(investment, annualGrowthRate, years)
        {
            return  investment*Math.pow((1 + annualGrowthRate), years);
        },

        growInvestmentOverYears : function(investment, annualGrowthRate, start, end)
        {
            return  this.growInvestmentInYears(investment, annualGrowthRate, end - start);
        },

        targetAmount : function(investment, annualGrowthRate, start, end, targetPercentage)
        {
            return this.growInvestmentOverYears(investment, annualGrowthRate, start, end) * targetPercentage;
        },

        yearlyInvestmentWithInterest : function(annualGrowthRate, years, target)
        {
            return  annualGrowthRate*target/(Math.pow((1+annualGrowthRate),years)-1) ;
        },

        getAnnualGrowthRates: function( annualGrowthRate,years){
            var gr =  _.fill(Array(years ), annualGrowthRate);
            gr.unshift(0);
            return gr;
        },

        getInvestments : function(projections, targetPercent)
        {
            var payments = []
              , yearlyPercentage = targetPercent/(projections.length)
              , cumulativePercentage = 0
              , current = 0
              , payed = 0;

            for(var i = 0; i < projections.length; i++)
            {
                cumulativePercentage += yearlyPercentage;
                current = (projections[i]*cumulativePercentage) ;
                payments.push(current - payed);
                payed = current;
            }

            return payments;
        },

        projectIvestments: function(investment, annualGrowthRates){

            var investmentProjection = [];

            for(var i = 0; i < annualGrowthRates.length; i++)
            {
                investmentProjection.push(investment = this.growInvestment(investment,annualGrowthRates[i]));
            }

            return investmentProjection;
        },


        addAllocatedMoney : function(share, investment)
        {
            share.investment = investment;
            var total = 0;
            for(var j = 0; j < share.members.length; j++)
            {
                share.members[j].money = share.members[j].percent * investment;
                total += share.members[j].money ;
            }
            share.totalMoney = total;
            return share;
        },


        //= Overnight Capital cost * Average Full Load Hours (capacity)
        addCapacityInstalled : function(share)
        {
            var totalInstalled = 0;
            for(var i = 0; i < share.members.length; i++)
            {

                var data = this.backgroundData[ share.members[i].id];
                share.members[i].installed =   share.members[i].money / data.overnightCapitalCost;
                totalInstalled += share.members[i].installed;
            }
            share.totalInstalled = totalInstalled;
            return share;
        },

        // capacityInstalled * Background_data (Full Load Hours (capacity), Average Hours)
        addAnnualOutput : function(share){
            for(var i = 0; i < share.members.length; i++)
            {
                var data = this.backgroundData[ share.members[i].id];
                share.members[i].annualOutput =   share.members[i].installed * data.averageHours;

            }
            return share;
        },

        //  Installed capacity's annual output * Lifetime in years
        addLifetimeOutput : function(share)
        {
            var totalLifetimeOutput = 0;
            for(var i = 0; i < share.members.length; i++)
            {
                var data = this.backgroundData[ share.members[i].id];
                share.members[i].lifetimeOutput =   share.members[i].annualOutput * data.years;
                totalLifetimeOutput += share.members[i].lifetimeOutput;

            }

            share.totalLifetimeOutput = totalLifetimeOutput;
            return share;
        },

        addInvestmentLifetimeOutput : function(share, investment){
            this.addAllocatedMoney(share, investment);
            this.addCapacityInstalled(share);
            this.addAnnualOutput(share);
            this.addLifetimeOutput(share);
            return share;
        },

        getInvestmentLifetime : function(){
            return _.reduce(this.backgroundData, function(max, n) {
                       max = (typeof(max) === "number")?max:0;
                       return (n.years && (n.years > max))?  n.years : max ;
                   });

        },

        //   Annual output added  * years
        getLifeTimeSpread : function(shares, investments){

            var lifeTime = this.getInvestmentLifetime() ;
            var totalYearsReturns = lifeTime + investments.length - 1  ;
            var members = _.first(shares).members.length;
            var matrix = makeMatrix(members, totalYearsReturns);

            for(var i = 0; i < investments.length; i++)
            {
                var share = shares[i];
                this.addInvestmentLifetimeOutput(share, investments[i]);

                for(var j = 0; j < members; j++)
                {

                    var data = this.backgroundData[ share.members[j].id];

                    for(var k = 0; k < (data.years); k++)
                    {
                        matrix[j][k + i] += share.members[j].annualOutput;
                    }
                }
            }
            return matrix;
        },

        summarise : function(matrix) {
            var  peakPowerGeneration = 0
              , yearlyTotalPowerGeneration = zeroArray(matrix[0].length)
              , totalPowerGenerationPerType = []
              , total = 0
              , yearlyMax = 0;


            for(var i = 0; i < matrix.length; i++) {
                var yearTotal = _.reduce(matrix[i],function(total, n) { return total + n;  });
                totalPowerGenerationPerType.push(yearTotal);
                peakPowerGeneration = (yearTotal > peakPowerGeneration)? yearTotal: peakPowerGeneration;
                total += yearTotal;
            }

            for(var j = 0; j < matrix.length; j++)
            {
                for(var k = 0; k < matrix[j].length; k++)
                {
                    yearlyTotalPowerGeneration[k] += matrix[j][k];
                    yearlyMax = Math.max(yearlyMax, yearlyTotalPowerGeneration[k]);
                }

            }


            return {
                years : matrix[0].length,
                averageAnnualPowerGeneration : total/(matrix[0].length),
                peakPowerGeneration: peakPowerGeneration,
                yearlyTotalPowerGeneration: yearlyTotalPowerGeneration,
                totalPowerGenerationPerType: totalPowerGenerationPerType,
                yearlyMaximum: yearlyMax
            }
        },


        // lifetimeOutput * Emissions, LCA life-cycle assessment
        addLifetimeEmissions : function(share)
        {
            var totalLifetimeEmissions = 0;
            for(var i = 0; i < share.members.length; i++)
            {
                var data = this.backgroundData[ share.members[i].id];
                share.members[i].lifetimeEmissions =  share.members[i].lifetimeOutput * data.emissions;
                totalLifetimeEmissions += share.members[i].lifetimeEmissions;
            }
            share.totalLifetimeEmissions = totalLifetimeEmissions;
            return share;

        },


        addComparisons: function(ffShares, reShares) {

            for(var i = 0; i < ffShares.length; i++)
            {
                this.addLifetimeEmissions(reShares[i]);
                this.addComparison(ffShares[i], reShares[i]);
            }
        },

        // Total lifetime output * Existing energy mix world fossil fuels only
        addComparison : function(ffShare, reShare) {
            var ffC02 = 0;
            for(var i = 0; i < ffShare.members.length; i++){
                var ffData = this.backgroundData[ ffShare.members[i].id];

                ffShare.members[i].renewableEnergy =  ffShare.members[i].relativeShare * reShare.totalLifetimeOutput;
                ffShare.members[i].renewableEnergyCO2 =  ffShare.members[i].renewableEnergy * ffData.emissions;
                ffC02 += ffShare.members[i].renewableEnergyCO2;
            };
            reShare.c02Saved =  ffC02 - reShare.totalLifetimeEmissions ;
        },


        addJobsCreated : function(share) {

            var totalJobsCreated = 0;

            for(var i = 0; i < share.members.length; i++)
            {
                var data = this.backgroundData[ share.members[i].id];
                share.members[i].jobsCreated =  share.members[i].lifetimeOutput * data.employment_1 * 0.000001; //NB: GWh and not kWh (= divide per 1 000 000)
                totalJobsCreated += share.members[i].jobsCreated;
            }

            share.totalJobsCreated = totalJobsCreated;
            return share;
        },




        //Total lifetime output / 1000000 * ( % * employment_1)
        //hack
        addJobsCreatedWithFF : function(ffShare, reShare) {

            var totalJobsCreated = 0;

            for(var i = 0; i < ffShare.members.length; i++)
            {
                var data = this.backgroundData[ ffShare.members[i].id];
                // hack: We need to exclude oil, because we lack data. So we allocate the share of oil to coal and gas.
                ffShare.members[i].REJobs =
                  (reShare.totalLifetimeOutput
                * 0.000001)
              * data.employment_1
              * (ffShare.members[i].relativeShare
              + (ffShare.members[1].relativeShare/2)) ;

                totalJobsCreated += ffShare.members[i].REJobs;
            }
            ffShare.totalREJobsCreated = totalJobsCreated;
            return ffShare;
        },




        addUSDJobsCreated : function(share) {

            var totalJobsCreated = 0;

            for(var i = 0; i < share.members.length; i++)
            {
                var data = this.backgroundData[ share.members[i].id];
                share.members[i].jobsUSDCreated =  share.members[i].money * data.employment_2 * 0.000001; //NB: GWh and not kWh (= divide per 1 000 000)
                totalJobsCreated += share.members[i].jobsCreated;
            }

            share.totalUSDJobsCreated = totalJobsCreated;
            return share;
        },




        //Total lifetime output / 1000000 * ( % * employment_1)
        //hack
        addUSDJobsCreatedWithFF : function(ffShare, reShare) {

            var totalJobsCreated = 0;

            for(var i = 0; i < ffShare.members.length; i++)
            {
                var data = this.backgroundData[ ffShare.members[i].id];
                // hack: We need to exclude oil, because we lack data. So we allocate the share of oil to coal and gas.
                ffShare.members[i].REUSDJobs =
                  (reShare.investment * 0.000001)
              * data.employment_2
              * (ffShare.members[i].relativeShare
              + (ffShare.members[1].relativeShare/2)) ;
                totalJobsCreated += ffShare.members[i].REUSDJobs;
            }

            ffShare.totalUSDREJobsCreated = totalJobsCreated;
            return ffShare;
        }

    });



function makeMatrix(l,w){
    var matrix = [];
    for(var x = 0; x < l; x++)
    {
        matrix.push(zeroArray(w));
    }
    return  matrix;
}


function zeroArray(w){
    return Array.apply(null, new Array(w)).map(Number.prototype.valueOf,0);
}
