var test = require('prova');

var data = require('./data/electricity_mix.js');
var EnergyScenario = require('../energyScenario.js');
var energyScenario = new EnergyScenario(data);




test('Test ENERGY SCENARIO per year', function(t) {

    t.isEquivalent(energyScenario.getYear(2013),
                   [2013, 5869197787.5, 1828833500, 431682087.5, 1507812087.5, 402177875, 1118013712.5, 107994100, 323863487.5, 12147350, 132090875, 3978575, 604050],
                   "Should make the data from 2013")



    t.isEquivalent(energyScenario.getYear(2012),
                   [2012,5683491200,1804550700,441994800,1462386300,394240000,1084596200,101386000,282009800,11272600,97895300,2623800,535600],
                   "Should make the data from 2012")

    t.isEquivalent(energyScenario.getYear(2015),
                   [2015, 6240610962.5, 1877399100, 411056662.5, 1598663662.5, 418053625, 1184848737.5, 121210300, 407570862.5, 13896850, 200482025, 6688125, 740950],
                   "Should get the data from 2015")


    t.isEquivalent(energyScenario.getYear(2036),
                   [2036,9962087950,1422225550,207961300,2354205400,762180750,1975493500,321828250,1622931900,62935050,1098849650,122144050,11332700],
                   "Should get the data from 2036 copying 2035")



    t.isEquivalent(energyScenario.getAnnualVariationInCapacity(2013),
                   [185706587.5, 24282800, -10312712.5, 45425787.5, 7937875, 33417512.5, 6608100, 41853687.5, 874750, 34195575, 1354775, 68450],
                   "Should get the calcuated annual variation in capacity ")


    t.isEquivalent(energyScenario.getShare(2013),
                   [0.31159854655008934, 0.0735504413259646, 0.25690258568407465, 0.06852348303145339, 0.190488334688789, 0.018400146648661565, 0.055180196549135294, 0.0020696780786415097, 0.022505780139378203, 0.0006778737306269388, 0.00010291866484487596 ],
                   "Should get the calcuated annual variation in capacity ");


    t.isEquivalent(energyScenario.getRelativeShare(2013),
{ "Fossil fuels": { "title": "Fossil fuels", "total": 3768327675, "members": [ { "id": 2, "percent": 0.4088297377553576, "relativeShare": 0.4853170047108496, "needed": 24282800, "title": "coal" }, { "id": 3, "percent": -0.1736267459651028, "relativeShare": 0.11455534781751696, "needed": -10312712.5, "title": "oil" }, { "id": 4, "percent": 0.7647970082097452, "relativeShare": 0.40012764747163343, "needed": 45425787.5, "title": "gas" } ] }, "Nuclear": { "title": "Nuclear", "total": 402177875, "members": [ { "id": 5, "percent": 1, "relativeShare": 1, "needed": 7937875, "title": "nuclear" } ] }, "Renewable energy": { "title": "Renewable energy", "total": 1698692150, "members": [ { "id": 6, "percent": 0.2823072393711903, "relativeShare": 0.6581614641004846, "needed": 33417512.5, "title": "hydro" }, { "id": 7, "percent": 0.05582445636816213, "relativeShare": 0.06357485080507377, "needed": 6608100, "title": "bioenergy" }, { "id": 8, "percent": 0.3535750596526146, "relativeShare": 0.1906546089001471, "needed": 41853687.5, "title": "wind" }, { "id": 9, "percent": 0.0073897857490125484, "relativeShare": 0.007151001433661773, "needed": 874750, "title": "geothermal" }, { "id": 10, "percent": 0.28888022042216605, "relativeShare": 0.07776033756322474, "needed": 34195575, "title": "solar pv" }, { "id": 11, "percent": 0.01144498083808914, "relativeShare": 0.002342140098781289, "needed": 1354775, "title": "csp (concentrated solar power.)" }, { "id": 12, "percent": 0.0005782575987652574, "relativeShare": 0.00035559709862672883, "needed": 68450, "title": "marine" } ] } },
                   "Table 2b - Relative share that each technology has WITHIN its category (fossil, nuclear, Res)");



    t.end();

});
