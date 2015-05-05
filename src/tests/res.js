var test = require('prova');
var _ = require("lodash");



var electricity = require('./data/electricity_mix.js');
var EnergyScenario = require('../energyScenario.js');
var energyScenario = new EnergyScenario(electricity);


var backgroundData = require('./data/background.js');
var RES = require('../res.js');
var res = new RES(backgroundData);


test('Test INVESTOR SIZE, FORECAST AND INVESTMENT TARGET', function(t) {

    t.isEquivalent(res.growInvestment(1000000, 0.02),
                   1020000,
                   "Should grow the investment by 2%");


    t.isEquivalent(res.growInvestmentInYears(1000000, 0.02, 5),
                   1104080.8032,
                   "Should grow the investment by 2% over 5 years");

    t.isEquivalent(res.growInvestmentOverYears(1000000, 0.02, 2016, 2021),
                   1104080.8032,
                   "Should grow the investment by 2% from 2016 to 2012");

    t.isEquivalent(res.targetAmount(1000000, 0.02, 2016, 2021, 0.05),
                   55204.040160000004,
                   "Should calculate the target ammount to invest");

    t.isEquivalent(res.yearlyInvestmentWithInterest(0.02, 5, 55204.040160000004),
                   10607.91970521611,
                   "Should calculate the annual target ammount");



    t.isEquivalent(res.getInvestments(1000000, 0.02, 0.05 ,5),
                   [10200, 10608, 11028.239999999998, 11461.0464, 11906.753760000007],
                   "Should calculate Annual investment in Res");


    t.isEquivalent(res.getInvestments(1000000, 0.02, 0.05 ,5),
                   [10200, 10608, 11028.239999999998, 11461.0464, 11906.753760000007],
                   "Should calculate Annual investment in Res");

    t.isEquivalent(res.getInvestments(1000000, 0.02, 0.05 ,5).reduce(
        function(previousValue, currentValue) {return previousValue + currentValue;}) ,
                   (res.growInvestmentInYears(1000000, 0.02, 5) * 0.05 ) ,
                   "Should calculate Annual investment in Res");



    t.end();

});





test('Test POWER GENERATION', function(t) {

    var share =  energyScenario.getRenewableEnergyShare(2016);
    var investments = res.getInvestments(1000000, 0.02, 0.05 ,5);
    var shares = energyScenario.getRenewableEnergyShares(2016, 2021);

    t.isEquivalent(_.map(res.addAllocatedMoney(share, investments[0]).members, function(a) {
                       return a.money;
                   }), [2879.533841586141, 569.4094549552538, 3606.465608456669, 75.375814639928, 2946.578248306094, 116.73880454850924, 5.898227507405625],
                   "Should allocate the money");

    t.isEquivalent(_.map(res.addCapacityInstalled(share).members, function(a) {
                       return a.installed;
                   }),
                   [1.4858275756378436, 0.16581521693513504, 1.0879232604695834, 0.014779571498025097, 0.902750688819269, 0.022441138898214003, 0.001070847405120847 ]
                 ,"Annual new installed capacity kW, (Money allocated (USD) / overnight capital cost)");

    t.isEquivalent(_.map(res.addAnnualOutput(share).members, function(a) {
                       return a.annualOutput;
                   }),
                   [7206.2637418435415, 887.1114106029725, 3209.373618385271, 97.54517188696563, 1624.9512398746842, 63.95724585990991, 3.9085930286910915 ]
                 ,"Annual output (capacity x FLH)");



    t.isEquivalent(_.map(res.addLifetimeOutput(share).members, function(a) {
                       return a.lifetimeOutput;
                   }),
                   [360313.1870921771, 32823.12219230998, 80234.34045963179, 2926.355156608969, 40623.780996867106, 1279.1449171981983, 78.17186057382183 ]
                 ,"Annual output (kWh) * lifetime (years).");


    t.isEquivalent( _.map(res.getLifeTimeSpread(shares,investments ), function(a) {
                        return _.reduce(a,function(total, n) { return total + n;  });
                    }),
                    [1950072.9069033489, 177644.01526282998, 434241.15224947303, 15837.90466547693, 219862.435059029, 6922.937978379335, 423.07867946070394 ],
                    "Rate of Return Matrix");

    t.isEquivalent( res.summarise(res.getLifeTimeSpread(shares,investments )) ,
                    {
                        "averageAnnualPowerGeneration": 400714.91868542833,
                        "peakPowerGeneration": 1950072.9069033489,
                        "yearlyTotalPowerGeneration": [ 1950072.9069033489, 177644.01526282998, 434241.15224947303,
                                                        15837.90466547693, 219862.435059029, 6922.937978379335, 423.07867946070394 ] },
                    "summarise the rate of return matrix");



    t.end();
});



test('Test EMISSIONS CALCULATIONS', function(t) {
    var share =  energyScenario.getRenewableEnergyShare(2016);
    var ffShare = energyScenario.getFossilFuelsShare(2016);
    var investments = res.getInvestments(1000000, 0.02, 0.05 ,5);
    res.addInvestmentLifetimeOutput(share,investments[0]);

    t.isEquivalent(_.map(res.addLifetimeEmissions(share).members, function(a) {
                       return a.lifetimeEmissions;
                   }),[ 8647516.49021225, 15919214.26327034, 922694.9152857655, 111201.49595114082, 1949941.487849621, 34536.91276435136, 1328.921629754971 ],
                   "Should add the lifetime emissions from Res power generation");



    res.addComparison(ffShare, share);

    t.isEquivalent(_.map(ffShare.members, function(a) {
                       return a.renewableEnergy;
                   }), [ 249739.33004240147, 52627.90038204898, 215910.87225091658 ],
                   "Should get the lifetime output allocated to fossil fuels only");


    t.isEquivalent(_.map(ffShare.members, function(a) {
                       return a.renewableEnergyCO2;
                   }), [204786250.6347692, 44207436.320921145, 105796327.40294912 ],
                   "Should get the lifetime GHG emissions from power generation IF generated by fossil fuels");

    t.isEquivalent(share.c02Saved , 327203579.87167627,
                   "Net CO2 eq. Emission mitigation REs vs fossil");




    t.end();
})

test('Test JOBS CREATION - Method 1: based on GWh produced', function(t) {

    var share =  energyScenario.getRenewableEnergyShare(2016);
    var ffShare = energyScenario.getFossilFuelsShare(2016);
    var investments = res.getInvestments(1000000, 0.02, 0.05 ,5);
    res.addInvestmentLifetimeOutput(share,investments[0]);


    t.isEquivalent(_.map(res.addJobsCreated(share).members, function(a) {
                       return a.jobsCreated;
                   }),[ 0.09728456051488782, 0.006892855660385095, 0.013639837878137405, 0.0007315887891522423, 0.035342689467274375, 0.0002942033309555856, 0],
                   "Should get the jobs created with renewables energy");


    t.isEquivalent(_.map(res.addJobsCreatedWithFF(ffShare, share).members, function(a) {
                       return a.REJobs;
                   }),[0.030365860825676855, 0, 0.026644730468613518 ],
                   "Should get the jobs created with renewables energy");

    t.isEquivalent(ffShare.totalREJobsCreated, 0.05701059129429037,
                   "Should get the TOTAL jobs created with renewables energy");




    t.end();
});




test('Test JOBS CREATION - Method 2: based on USD invested', function(t) {


    var share =  energyScenario.getRenewableEnergyShare(2016);
    var ffShare = energyScenario.getFossilFuelsShare(2016);
    var investments = res.getInvestments(1000000, 0.02, 0.05 ,5);
    res.addInvestmentLifetimeOutput(share,investments[0]);


    t.isEquivalent(_.map(res.addUSDJobsCreated(share).members, function(a) {
                       return a.jobsUSDCreated;
                   }),[0.06734566960655435, 0.01731581289069414, 0.07465317116318321, 0.0006453483165928635, 0.048428857291272935, 0.0002975719337930963, 0 ],
                   "Should get the jobs created with renewables energy");


    t.isEquivalent(_.map(res.addUSDJobsCreatedWithFF(ffShare, share).members, function(a) {
                       return a.REUSDJobs;
                   }),[0.06172173609827509, 0, 0.040814842071911855 ],
                   "Should get the jobs created with renewables energy");

    t.isEquivalent(ffShare.totalUSDREJobsCreated, 0.10253657817018694,
                   "Should get the TOTAL jobs created with renewables energy");


    t.end();
});
