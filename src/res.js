var _ = require("lodash");








module.exports = RES;

function RES(data) {
    self = this;
    self.backgroundData = data;
}

RES.prototype = _.create(
    RES.prototype,
    {

        self : null,
        backgroundData: null,

        growInvestment : function(investment, annualGrowthRate)
        {
            return self.growInvestmentInYears(investment,annualGrowthRate,1);
        },

        growInvestmentInYears : function(investment, annualGrowthRate, years)
        {
            return  investment*Math.pow((1 + annualGrowthRate), years);
        },

        growInvestmentOverYears : function(investment, annualGrowthRate, start, end)
        {
            return  self.growInvestmentInYears(investment, annualGrowthRate, end - start);
        },

        targetAmount : function(investment, annualGrowthRate, start, end, targetPercentage)
        {
            return self.growInvestmentOverYears(investment, annualGrowthRate, start, end) * targetPercentage;
        },

        yearlyInvestmentWithInterest : function(annualGrowthRate, years, target)
        {
            return  annualGrowthRate*target/(Math.pow((1+annualGrowthRate),years)-1) ;
        },

        getInvestments : function(investment, annualGrowthRate, targetPercent ,years)
        {
            var payments = []
              , yearlyPercentage = targetPercent/years
              , cumulativePercentage = 0
              , current = 0
              , payed = 0;

            for(var i = 0; i < years; i++)
            {
                cumulativePercentage += yearlyPercentage;
                investment =  self.growInvestment(investment,annualGrowthRate );
                current = (investment*cumulativePercentage) ;
                payments.push(current - payed);
                payed = current;
            }

            return payments;
        },


        addAllocatedMoney : function(share, investment)
        {
            share.investment = investment;
            for(var j = 0; j < share.members.length; j++)
            {
                share.members[j].money = share.members[j].percent * investment;
            }

            return share;
        },


        //= Overnight Capital cost * Average Full Load Hours (capacity)
        addCapacityInstalled : function(share)
        {
            for(var i = 0; i < share.members.length; i++)
            {
                var data = self.backgroundData[ share.members[i].id];
                share.members[i].installed =   share.members[i].money / data.overnightCapitalCost;
            }
            return share;
        },

        // capacityInstalled * Background_data (Full Load Hours (capacity), Average Hours)
        addAnnualOutput : function(share){
            for(var i = 0; i < share.members.length; i++)
            {
                var data = self.backgroundData[ share.members[i].id];
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
                var data = self.backgroundData[ share.members[i].id];
                share.members[i].lifetimeOutput =   share.members[i].annualOutput * data.years;
                totalLifetimeOutput += share.members[i].lifetimeOutput;

            }

            share.totalLifetimeOutput = totalLifetimeOutput;
            return share;
        },

        addInvestmentLifetimeOutput : function(share, investment){
            self.addAllocatedMoney(share, investment);
            self.addCapacityInstalled(share);
            self.addAnnualOutput(share);
            self.addLifetimeOutput(share);
            return share;
        },

        getInvestmentLifetime : function(){
            return _.reduce(self.backgroundData, function(max, n) {
                       max = (typeof(max) === "number")?max:0;
                       return (n.years && (n.years > max))?  n.years : max ;
                   });

        },

        //   Annual output added  * years
        getLifeTimeSpread : function(shares, investments){

            var lifeTime = self.getInvestmentLifetime() ;
            var totalYearsReturns = lifeTime + investments.length  ;

            var matrix = makeMatrix(_.first(shares).members.length, totalYearsReturns)

            for(var i = 0; i < investments.length; i++)
            {
                var share = shares[i];
                self.addInvestmentLifetimeOutput(share, investments[i]);

                for(var j = 0; j < share.members.length; j++)
                {
                    var data = self.backgroundData[ share.members[j].id];

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
              , yearlyTotalPowerGeneration = []
              , total = 0;


            for(var i = 0; i < matrix.length; i++) {
                var yearTotal = _.reduce(matrix[i],function(total, n) { return total + n;  });
                yearlyTotalPowerGeneration.push(yearTotal);
                peakPowerGeneration = (yearTotal > peakPowerGeneration)? yearTotal: peakPowerGeneration;
                total += yearTotal;
            }
            return {
                averageAnnualPowerGeneration : total/matrix.length,
                peakPowerGeneration: peakPowerGeneration,
                yearlyTotalPowerGeneration: yearlyTotalPowerGeneration
            }
        },


        // lifetimeOutput * Emissions, LCA life-cycle assessment
        addLifetimeEmissions : function(share)
        {
            var totalLifetimeEmissions = 0;
            for(var i = 0; i < share.members.length; i++)
            {
                var data = self.backgroundData[ share.members[i].id];
                share.members[i].lifetimeEmissions =  share.members[i].lifetimeOutput * data.emissions;
                totalLifetimeEmissions += share.members[i].lifetimeEmissions;
            }
            share.totalLifetimeEmissions = totalLifetimeEmissions;
            return share;

        },


        // Total lifetime output * Existing energy mix world fossil fuels only
        addComparison : function(ffShare, reShare) {
            var ffC02 = 0;
            for(var i = 0; i < ffShare.members.length; i++){
                var ffData = self.backgroundData[ ffShare.members[i].id];

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
                                                           var data = self.backgroundData[ share.members[i].id];
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
                              var data = self.backgroundData[ ffShare.members[i].id];
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
                            var data = self.backgroundData[ share.members[i].id];
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
                                var data = self.backgroundData[ ffShare.members[i].id];
                                // hack: We need to exclude oil, because we lack data. So we allocate the share of oil to coal and gas.
                                ffShare.members[i].REUSDJobs =  (reShare.investment * 0.000001) * data.employment_2 * (ffShare.members[i].relativeShare + (ffShare.members[1].relativeShare/2)) ;
                                totalJobsCreated += ffShare.members[i].REUSDJobs;
                            }

                            ffShare.totalUSDREJobsCreated = totalJobsCreated;
                            return ffShare;
                        }

    }),


function makeMatrix(l,w){
    var matrix = [];
    for(var x = 0; x < l; x++)
    {
        matrix.push(Array.apply(null, new Array(w)).map(Number.prototype.valueOf,0));
    }
    return  matrix;
}
