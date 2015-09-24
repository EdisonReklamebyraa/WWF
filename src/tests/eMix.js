var test = require('prova');

var data = require('./data/electricity_mix.js');
var EnergyScenario = require('../energyScenario.js');
var energyScenario = new EnergyScenario(data);




test('Test ENERGY SCENARIO per year', function(t) {
    t.isEquivalent(energyScenario.getYear(2013),
                   [ 1828833500, 431682087.5, 1507812087.5, 402177875, 1118013712.5, 107994100, 323863487.5, 12147350, 132090875, 3978575, 604050],
                   "Should make the data from 2013")



    t.isEquivalent(energyScenario.getYear(2012),
                   [ 1804550700,441994800,1462386300,394240000,1084596200,101386000,282009800,11272600,97895300,2623800,535600],
                   "Should make the data from 2012")

    t.isEquivalent(energyScenario.getYear(2015),
                   [ 1877399100, 411056662.5, 1598663662.5, 418053625, 1184848737.5, 121210300, 407570862.5, 13896850, 200482025, 6688125, 740950],
                   "Should get the data from 2015")


    t.isEquivalent(energyScenario.getYear(2036),
                   [1422225550,207961300,2354205400,762180750,1975493500,321828250,1622931900,62935050,1098849650,122144050,11332700],
                   "Should get the data from 2036 copying 2035")



    t.isEquivalent(energyScenario.getAnnualVariationInCapacity(2013),
                   [24282800, -10312712.5, 45425787.5, 7937875, 33417512.5, 6608100, 41853687.5, 874750, 34195575, 1354775, 68450],
                   "Should get annual Variation in capacity")


    t.isEquivalent(energyScenario.getShare(2013),
                   [0.31159855119550667, 0.07355044242247966, 0.25690258951406597, 0.06852348405302483, 0.19048833752865404, 0.018400146922977225, 0.055180197371780475, 0.002069678109496976, 0.022505780474902048, 0.0006778737407329114, 0.00010291866637922249],
                   "Should get the calcuated annual variation in capacity ");


    t.isEquivalent(energyScenario.getRelativeShare(2016)["Renewable energy"],
                   {
                       "title":"Renewable energy",
                       "total":2053810700,
                       "members":[
                           {
                               "id":4,
                               "percent":0.2823072393711903,
                               "relativeShare":0.5931735821611992,
                               "needed":33417512.5,
                               "title":"hydro"
                           },
                           {
                               "id":5,
                               "percent":0.05582445636816213,
                               "relativeShare":0.06223475220963646,
                               "needed":6608100,
                               "title":"bioenergy"
                           },
                           {
                               "id":6,
                               "percent":0.3535750596526146,
                               "relativeShare":0.2188247193375709,
                               "needed":41853687.5,
                               "title":"wind"
                           },
                           {
                               "id":7,
                               "percent":0.0073897857490125484,
                               "relativeShare":0.007192288948538441,
                               "needed":874750,
                               "title":"geothermal"
                           },
                           {
                               "id":8,
                               "percent":0.28888022042216605,
                               "relativeShare":0.114264474325701,
                               "needed":34195575,
                               "title":"solar pv"
                           },
                           {
                               "id":9,
                               "percent":0.01144498083808914,
                               "relativeShare":0.003916086326748614,
                               "needed":1354775,
                               "title":"csp (concentrated solar power.)"
                           },
                           {
                               "id":10,
                               "percent":0.0005782575987652574,
                               "relativeShare":0.00039409669060541945,
                               "needed":68450,
                               "title":"marine"
                           }
                       ]
                   },
                   "Table 2b - Relative share that each technology has WITHIN its category (fossil, nuclear, Res)");



    t.end();

});
