var test = require('prova');
var _ = require("lodash");
var energyScenario = require('../energyScenario.js');
var res = require('../res.js');



test('Test forecasting', function(t) {

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


    t.isEquivalent(payments = res.getInvestments(1000000, 0.02, 0.05 ,5),
                   [10200, 10608, 11028.239999999998, 11461.0464, 11906.753760000007],
                   "Should calculate Annual investment in Res");

    t.isEquivalent(res.getInvestments(1000000, 0.02, 0.05 ,5).reduce(
        function(previousValue, currentValue) {return previousValue + currentValue;}) ,
                   (res.growInvestmentInYears(1000000, 0.02, 5) * 0.05 ) ,
                   "Should calculate Annual investment in Res");



    t.end();

});





test('Test POWER GENERATION', function(t) {

    var shares =  energyScenario.getRenewableEnergyShare(2016);
    var investments = res.getInvestments(1000000, 0.02, 0.05 ,5);

    t.isEquivalent(res.allocateMoney(shares, investments[0]),
                   { "title": "Renewable energy", "total": 118372850,
                     "members": [ { "id": 6, "percent": 0.2823072393711903, "needed": 33417512.5, "title": "hydro", "money": 2879.533841586141 },
                                  { "id": 7, "percent": 0.05582445636816213, "needed": 6608100, "title": "bioenergy", "money": 569.4094549552538 },
                                  { "id": 8, "percent": 0.3535750596526146, "needed": 41853687.5, "title": "wind", "money": 3606.465608456669 },
                                  { "id": 9, "percent": 0.0073897857490125484, "needed": 874750, "title": "geothermal", "money": 75.375814639928 },
                                  { "id": 10, "percent": 0.28888022042216605, "needed": 34195575, "title": "solar pv", "money": 2946.578248306094 },
                                  { "id": 11, "percent": 0.01144498083808914, "needed": 1354775, "title": "csp (concentrated solar power.)",
                                    "money": 116.73880454850924 },
                                  { "id": 12, "percent": 0.0005782575987652574, "needed": 68450, "title": "marine",
                                    "money": 5.898227507405625 } ] },"Should allocate the money");




    t.isEquivalent(_.map(res.capacityInstalled(shares).members, function(a) {
                       return a.installed;
                   }),
                   [1.4858275756378436, 0.16581521693513504, 1.0879232604695834, 0.014779571498025097, 0.902750688819269, 0.022441138898214003, 0.001070847405120847 ]
                 ,"Annual new installed capacity kW, (Money allocated (USD) / overnight capital cost)");


    t.end();
});
