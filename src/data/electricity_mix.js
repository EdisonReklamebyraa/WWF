var data = {}
module.exports = data;

module.exports.data =  [

    [2012,5683491200,1804550700,441994800,1462386300,394240000,1084596200,101386000,282009800,11272600,97895300,2623800,535600],
    [2020,7169143900,1998813100,359493100,1825792600,457743000,1351936300,154250800,616839300,18270600,371459900,13462000,1083200],
    [2030,9031106600,1614421400,258471900,2178067800,660701500,1767641100,265969100,1287567700,48046900,856386400,85916700,7916200],
    [2035,9962087950,1422225550,207961300,2354205400,762180750,1975493500,321828250,1622931900,62935050,1098849650,122144050,11332700]
];

data.cols = [
    "year",
    "total",
    "coal",
    "oil",
    "gas",
    "nuclear",
    "hydro",
    "bioenergy",
    "wind",
    "geothermal",
    "solar pv",
    "csp (concentrated solar power.)",
    "marine"];



data.FOSSILFUELS = "Fossil fuels";
data.NUCLEAR = "Nuclear";
data.RENEWABLEENERGY = "Renewable energy";

data.groups = [
    {title:data.FOSSILFUELS, members:[2,3,4]},
    {title:data.NUCLEAR, members:[5]},
    {title:data.RENEWABLEENERGY, members:[6,7,8,9,10,11,12]}
];
