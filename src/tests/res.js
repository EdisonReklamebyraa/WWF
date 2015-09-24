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
    var annualGrowthRates;

   t.isEquivalent(annualGrowthRates = res.getAnnualGrowthRates( 0.02, 4 ),
                  [ 0, 0.02, 0.02, 0.02, 0.02  ],
                  "Should calculate getAnnualGrowthRates");

    var projectIvestments;
   t.isEquivalent( projectIvestments = res.projectIvestments(1000000000, annualGrowthRates ),
                   [1000000000.0000,	1020000000.0000,	1040400000.0000,	1061208000.0000,	1082432160.0000 ],
                   "Should calculate project investments");

    var investments;
    t.isEquivalent(investments = res.getInvestments(projectIvestments, 0.05  ),
                   [ 10000000.0,	10400000.0,	10812000.0,	11236320.0,	11673288.0 ],
                   "Should calculate Annual investment in Res");



    t.isEquivalent(Math.round(_.sum(investments) / _.last(projectIvestments)*100)  , 5,
                   "Should be the target");



    t.end();

});





test('Test POWER GENERATION', function(t) {

    var annualGrowthRates =  res.getAnnualGrowthRates( 0.02, 4 );
    var projectIvestments  = res.projectIvestments(1000000000, annualGrowthRates );

    var investments = res.getInvestments(projectIvestments, 0.05);
    var share =  energyScenario.getRenewableEnergyShare(2016);
    var shares = energyScenario.getRenewableEnergyShares(2016, 2020);



    t.isEquivalent(_.map(res.addAllocatedMoney(share,investments[0]).members, function(a) {
                       return a.money;
                   }),  [2823072.3937119027, 558244.5636816212, 3535750.596526146, 73897.85749012549, 2888802.2042216603, 114449.80838089141, 5782.575987652574 ],
                   "Should allocate the money");

    t.isEquivalent(_.map(res.addCapacityInstalled(share).members, function(a) {
                       return a.installed;
                   }),
                   [ 1456.6937016057288, 162.56393817170098, 1066.5914318329249, 14.48977597845598, 885.0496949208518, 22.001116566876473, 1.049850397177301 ]
                 ,"Annual new installed capacity kW, (Money allocated (USD) / overnight capital cost)");

    t.isEquivalent(_.map(res.addAnnualOutput(share).members, function(a) {
                       return a.annualOutput;
                   }),
                   [  7064964.452787785, 869717.0692186003, 3146444.7239071284, 95632.52145780946, 1593089.4508575334, 62703.182215597946, 3831.953949697149  ]
                 ,"Annual output (capacity x FLH)");



    t.isEquivalent(_.map(res.addLifetimeOutput(share).members, function(a) {
                       return a.lifetimeOutput;
                   }),
                   [ 353248222.6393892, 32179531.56108821, 78661118.09767821, 2868975.6437342837, 39827236.27143834, 1254063.644311959, 76639.07899394298  ]
                 ,"Annual output (kWh) * lifetime (years).");


    t.isEquivalent( _.map(res.getLifeTimeSpread(shares,investments ), function(a) {
                        return _.reduce(a,function(total, n) { return total + n;  });
                    }),
                    [ 1911836183.238577, 174160799.27728435, 425726619.8524247, 15527357.515173445, 215551406.92061663, 6787194.096450324, 414783.01907912147 ],
                    "Rate of Return Matrix");

    t.isEquivalent( res.summarise(res.getLifeTimeSpread(shares,investments )) ,
                    { "years": 54, "averageAnnualPowerGeneration": 50926006.36888159, "peakPowerGeneration": 1911836183.238577, "yearlyTotalPowerGeneration": [ 12836383.35439415, 26186222.04296407, 40064919.72573502, 54488290.826999635, 69472570.80442454, 69472570.80442454, 69472570.80442454, 69472570.80442454, 69472570.80442454, 69472570.80442454, 69472570.80442454, 69472570.80442454, 69472570.80442454, 69472570.80442454, 69472570.80442454, 69472570.80442454, 69472570.80442454, 69472570.80442454, 69472570.80442454, 69472570.80442454, 69406035.66825925, 69336839.12664734, 69264901.33742543, 69190140.32930574, 69112471.94864807, 64372937.77388341, 59443822.232128166, 54319437.88237261, 48993945.61851344, 43461350.87772642, 43365718.35626861, 43266260.53395249, 43162862.6517523, 43055406.890401624, 42943772.2938873, 42943772.2938873, 42943772.2938873, 42074055.2246687, 41169549.47268136, 40229211.3774422, 39251969.44752197, 38236723.664771505, 38236723.664771505, 38236723.664771505, 38236723.664771505, 38236723.664771505, 38236723.664771505, 38236723.664771505, 38236723.664771505, 38236723.664771505, 31171759.21198372, 23824196.181084424, 16185556.614730269, 8247136.476715423 ], "totalPowerGenerationPerType": [ 1911836183.238577, 174160799.27728435, 425726619.8524247, 15527357.515173445, 215551406.92061663, 6787194.096450324, 414783.01907912147 ], "yearlyMaximum": 69472570.80442454 },
                    "summarise the rate of return matrix");



    t.end();
});



test('Test EMISSIONS CALCULATIONS', function(t) {
    var share =  energyScenario.getRenewableEnergyShare(2016);
    var ffShare = energyScenario.getFossilFuelsShare(2016);


    var annualGrowthRates =  res.getAnnualGrowthRates( 0.02, 4 );
    var projectIvestments  = res.projectIvestments(1000000000, annualGrowthRates );

    var investments = res.getInvestments(projectIvestments, 0.05);
    var shares = energyScenario.getRenewableEnergyShares(2016, 2020);


    res.addInvestmentLifetimeOutput(share,investments[0]);

    t.isEquivalent(_.map(res.addLifetimeEmissions(share).members, function(a) {
                       return a.lifetimeEmissions;
                   }),[ 8477957343.345341, 15607072807.127783, 904602858.1232995, 109021074.46190278, 1911707341.0290403, 33859718.39642289, 1302864.3428970308 ],
                   "Should add the lifetime emissions from Res power generation");



    res.addComparison(ffShare, share);

    t.isEquivalent(_.map(ffShare.members, function(a) {
                       return a.renewableEnergy;
                   }),  [ 244842480.43372688, 51595980.76671467, 211677325.73619264 ],
                   "Should get the lifetime output allocated to fossil fuels only");


    t.isEquivalent(_.map(ffShare.members, function(a) {
                       return a.renewableEnergyCO2;
                   }), [ 200770833955.65604, 43340623844.04032, 103721889610.73439 ],
                   "Should get the lifetime GHG emissions from power generation IF generated by fossil fuels");

    t.isEquivalent(share.c02Saved , 320787823403.60406,
                   "Net CO2 eq. Emission mitigation REs vs fossil");

    t.end();
})

test('Test JOBS CREATION - Method 1: based on GWh produced', function(t) {

    var share =  energyScenario.getRenewableEnergyShare(2016);
    var ffShare = energyScenario.getFossilFuelsShare(2016);

    var annualGrowthRates =  res.getAnnualGrowthRates( 0.02, 4 );
    var projectIvestments  = res.projectIvestments(1000000000, annualGrowthRates );

    var investments = res.getInvestments(projectIvestments, 0.05);
    var shares = energyScenario.getRenewableEnergyShares(2016, 2020);
    res.addInvestmentLifetimeOutput(share,investments[0]);


    t.isEquivalent(_.map(res.addJobsCreated(share).members, function(a) {
                       return a.jobsCreated;
                   }), [ 95.37702011263508, 6.757701627828524, 48.34748301637595, 0.7172439109335709, 68.10457402415955, 0.544765247089115, 0.008430298689333727 ],
                   "Should get the jobs created with renewables energy");

    t.isEquivalent(_.map(res.addJobsCreatedWithFF(ffShare, share).members, function(a) {
                       return a.REJobs;
                   }), [ 29.77045178987926, 0, 26.122284773150497 ],
                   "Jobs created with fossil fuels");

    t.isEquivalent(ffShare.totalREJobsCreated, 55.89273656302976,
                   "Should get the TOTAL jobs created with renewables energy");
    t.end();
});




test('Test JOBS CREATION - Method 2: based on USD invested', function(t) {

   var share =  energyScenario.getRenewableEnergyShare(2016);
    var ffShare = energyScenario.getFossilFuelsShare(2016);

    var annualGrowthRates =  res.getAnnualGrowthRates( 0.02, 4 );
    var projectIvestments  = res.projectIvestments(1000000000, annualGrowthRates );

    var investments = res.getInvestments(projectIvestments, 0.05);
    res.addInvestmentLifetimeOutput(share,investments[0]);


    t.isEquivalent(_.map(res.addUSDJobsCreated(share).members, function(a) {
                       return a.jobsUSDCreated;
                   }),[ 66.02516628093564, 16.97628714773935, 88.69060429676034, 0.6326944280322192, 75.10885730976317, 0.2917325615628922, 0.049730153493812136 ],
                   "Should get the jobs created with renewables energy");


    t.isEquivalent(_.map(res.addUSDJobsCreatedWithFF(ffShare, share).members, function(a) {
                       return a.REUSDJobs;
                   }),[ 60.51150597870107, 0, 40.01455105089398 ],
                   "Jobs created with fossil fuels");

    t.isEquivalent(ffShare.totalUSDREJobsCreated,100.52605702959505,
                   "Should get the TOTAL jobs created with renewables energy");


    t.end();
});
