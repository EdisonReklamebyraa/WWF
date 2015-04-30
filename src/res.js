var _ = require("lodash");
var backgroundData = require('./data/background.js');
var res = {};

module.exports = res;

res.growInvestment = function(investment, annualGrowthRate)
{
    return res.growInvestmentInYears(investment,annualGrowthRate,1);
};

res.growInvestmentInYears = function(investment, annualGrowthRate, years)
{
    return  investment*Math.pow((1 + annualGrowthRate), years);
};

res.growInvestmentOverYears = function(investment, annualGrowthRate, start, end)
{
    return  res.growInvestmentInYears(investment, annualGrowthRate, end - start);
};


res.targetAmount = function(investment, annualGrowthRate, start, end, targetPercentage)
{
    return res.growInvestmentOverYears(investment, annualGrowthRate, start, end) * targetPercentage;
};

res.yearlyInvestmentWithInterest = function(annualGrowthRate, years, target)
{
    return  annualGrowthRate*target/(Math.pow((1+annualGrowthRate),years)-1) ;
};



res.getInvestments = function(investment, annualGrowthRate, targetPercent ,years)
{
    var payments = []
    , yearlyPercentage = targetPercent/years
    , cumulativePercentage = 0
    , current = 0
    , payed = 0;

    for(var i = 0; i < years; i++)
    {
        cumulativePercentage += yearlyPercentage;
        investment =  res.growInvestment(investment,annualGrowthRate );

        current = (investment*cumulativePercentage) ;

        payments.push(current - payed);
        payed = current;
    }

    return payments;
};


res.addAllocatedMoney = function(share, investment)
{
    share.investment = investment;
    for(var j = 0; j < share.members.length; j++)
    {
        share.members[j].money = share.members[j].percent * investment;
    }

    return share;
};


//= Overnight Capital cost * Average Full Load Hours (capacity)
res.addCapacityInstalled = function(share)
{
    for(var i = 0; i < share.members.length; i++)
    {
        var data = backgroundData[ share.members[i].id];
        share.members[i].installed =   share.members[i].money / data.overnightCapitalCost;
    }
    return share;
};

// capacityInstalled * Background_data (Full Load Hours (capacity), Average Hours)
res.addAnnualOutput = function(share)
{
    for(var i = 0; i < share.members.length; i++)
    {
        var data = backgroundData[ share.members[i].id];
        share.members[i].annualOutput =   share.members[i].installed * data.averageHours;

    }
    return share;
};

//  Installed capacity's annual output * Lifetime in years
res.addLifetimeOutput = function(share)
{

    var totalLifetimeOutput = 0;
    for(var i = 0; i < share.members.length; i++)
    {
        var data = backgroundData[ share.members[i].id];
        share.members[i].lifetimeOutput =   share.members[i].annualOutput * data.years;
        totalLifetimeOutput += share.members[i].lifetimeOutput;

    }
    share.totalLifetimeOutput = totalLifetimeOutput;
    return share;
};

res.addInvestmentLifetimeOutput = function(share, investment)
{
    res.addAllocatedMoney(share, investment);
    res.addCapacityInstalled(share);
    res.addAnnualOutput(share);
    res.addLifetimeOutput(share);
    return share;
}


res.getInvestmentLifetime = function()
{
    return _.reduce(backgroundData, function(max, n) {
        max = (typeof(max) === "number")?max:0;
        return (n.years && (n.years > max))?  n.years : max ;
    });

}



//   Annual output added  * years
res.getLifeTimeSpread = function(shares, investments){

    var lifeTime = res.getInvestmentLifetime() ;
    var totalYearsReturns = lifeTime + investments.length  ;

    var matrix = makeMatrix(_.first(shares).members.length, totalYearsReturns)

    for(var i = 0; i < investments.length; i++)
    {
        var share = shares[i];
        res.addInvestmentLifetimeOutput(share, investments[i]);

        for(var j = 0; j < share.members.length; j++)
        {
            var data = backgroundData[ share.members[j].id];

            for(var k = 0; k < (data.years); k++)
            {
                matrix[j][k + i] += share.members[j].annualOutput;
            }
        }
    }
    return matrix;
};

res.summarise = function(matrix) {
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
}

function makeMatrix(l,w){
    var matrix = [];
    for(var x = 0; x < l; x++)
    {
        matrix.push(Array.apply(null, new Array(w)).map(Number.prototype.valueOf,0));
    }
    return  matrix;
}

// lifetimeOutput * Emissions, LCA life-cycle assessment
res.addLifetimeEmissions = function(share)
{
    var totalLifetimeEmissions = 0;
    for(var i = 0; i < share.members.length; i++)
    {
        var data = backgroundData[ share.members[i].id];
        share.members[i].lifetimeEmissions =  share.members[i].lifetimeOutput * data.emissions;
        totalLifetimeEmissions += share.members[i].lifetimeEmissions;
    }
    share.totalLifetimeEmissions = totalLifetimeEmissions;
    return share;

}


// Total lifetime output * Existing energy mix world fossil fuels only
res.addComparison = function(ffShare, reShare) {
    var ffC02 = 0;
    for(var i = 0; i < ffShare.members.length; i++){
        var ffData = backgroundData[ ffShare.members[i].id];

        ffShare.members[i].renewableEnergy =  ffShare.members[i].relativeShare * reShare.totalLifetimeOutput;
        ffShare.members[i].renewableEnergyCO2 =  ffShare.members[i].renewableEnergy * ffData.emissions;
        ffC02 += ffShare.members[i].renewableEnergyCO2;
    };
    reShare.c02Saved =  ffC02 - reShare.totalLifetimeEmissions ;
}


res.addJobsCreated = function(share) {

    var totalJobsCreated = 0;

    for(var i = 0; i < share.members.length; i++)
    {
        var data = backgroundData[ share.members[i].id];
        share.members[i].jobsCreated =  share.members[i].lifetimeOutput * data.employment_1 * 0.000001; //NB: GWh and not kWh (= divide per 1 000 000)
        totalJobsCreated += share.members[i].jobsCreated;
    }

    share.totalJobsCreated = totalJobsCreated;
    return share;
}




//Total lifetime output / 1000000 * ( % * employment_1)
//hack
res.addJobsCreatedWithFF = function(ffShare, reShare) {

    var totalJobsCreated = 0;

    for(var i = 0; i < ffShare.members.length; i++)
    {
        var data = backgroundData[ ffShare.members[i].id];
        // hack: We need to exclude oil, because we lack data. So we allocate the share of oil to coal and gas.
        ffShare.members[i].REJobs =  (reShare.totalLifetimeOutput * 0.000001) * data.employment_1 * (ffShare.members[i].relativeShare + (ffShare.members[1].relativeShare/2)) ;
        totalJobsCreated += ffShare.members[i].REJobs;
    }
    ffShare.totalREJobsCreated = totalJobsCreated;
    return ffShare;
}




res.addUSDJobsCreated = function(share) {

    var totalJobsCreated = 0;

    for(var i = 0; i < share.members.length; i++)
    {
        var data = backgroundData[ share.members[i].id];
        share.members[i].jobsUSDCreated =  share.members[i].money * data.employment_2 * 0.000001; //NB: GWh and not kWh (= divide per 1 000 000)
        totalJobsCreated += share.members[i].jobsCreated;
    }

    share.totalUSDJobsCreated = totalJobsCreated;
    return share;
}




//Total lifetime output / 1000000 * ( % * employment_1)
//hack
res.addUSDJobsCreatedWithFF = function(ffShare, reShare) {

    var totalJobsCreated = 0;

    for(var i = 0; i < ffShare.members.length; i++)
    {
        var data = backgroundData[ ffShare.members[i].id];
        // hack: We need to exclude oil, because we lack data. So we allocate the share of oil to coal and gas.
        ffShare.members[i].REUSDJobs =  (reShare.investment * 0.000001) * data.employment_2 * (ffShare.members[i].relativeShare + (ffShare.members[1].relativeShare/2)) ;
        totalJobsCreated += ffShare.members[i].REUSDJobs;
    }

    ffShare.totalUSDREJobsCreated = totalJobsCreated;
    return ffShare;
}
