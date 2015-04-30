var _ = require("lodash");
var path = require('path');
var electricityMix = require('./data/electricity_mix.js');
var energyScenario = {};

module.exports = energyScenario;


energyScenario.getYear = function(year)
{
    var prevYear = getPreviousYear(year);

    if(year === _.first(prevYear))
      return prevYear;
    else{
        return getProjectedYear(year, prevYear, getNextYear(year));

    }
};


energyScenario.getAnnualVariationInCapacity = function(year) {
    var currYear = energyScenario.getYear(year)
      , prevYear = energyScenario.getYear(year - 1)
      , results = [];

    for(var i = 1; i < currYear.length; i++)
    {
        results.push(currYear[i] - prevYear[i]);
    }

    return results;
}

energyScenario.getShare = function(year) {
    var yearData = energyScenario.getYear(year)
    , results = [];


    for(var i = 2; i < yearData.length; i++)
    {
        results.push(yearData[i]/ yearData[1] );
    }

    return results;
}

energyScenario.getRelativeShare = function(year) {
    var yearData = energyScenario.getYear(year),
        prevYear = energyScenario.getYear(year - 1)
      , results = {};




    for(var i = 0; i < electricityMix.groups.length; i++)
    {
        var totalInstalled = 0;
        var total = 0;
        var result = {title:electricityMix.groups[i].title, total : 0, members:[] };

        for(var j = 0; j < electricityMix.groups[i].members.length; j++)
        {
            var id = electricityMix.groups[i].members[j];
            totalInstalled += yearData[id] - prevYear[id];
            total += yearData[id];
        }

        result["total"] = total;

        for(j = 0; j < electricityMix.groups[i].members.length; j++)
        {
            var id = electricityMix.groups[i].members[j];
            var needed = yearData[id] - prevYear[id];
            result.members.push({
                id: id,
                percent: needed/totalInstalled,
                relativeShare: yearData[id]/total,
                needed: needed,
                title: electricityMix.cols[id]
            });
        }
        results[result.title] = result;
    }

    return results;
}

energyScenario.getRenewableEnergyShare = function(year) {
    return energyScenario.getRelativeShare(year)[electricityMix.RENEWABLEENERGY];
}

energyScenario.getFossilFuelsShare = function(year) {
    return energyScenario.getRelativeShare(year)[electricityMix.FOSSILFUELS];
}



energyScenario.getRenewableEnergyShares = function(years) {
    var shares = [];
    for(var i = 0; i < years.length; i++)
    {
        shares.push(energyScenario.getRelativeShare(years[i])[electricityMix.RENEWABLEENERGY]);
    }
    return shares;
}



function getPreviousYear(year)
{
    return _.findLast(electricityMix.data, function(y) {
               return year >= _.first(y);
           });
};


function getNextYear(year)
{
    return _.find(electricityMix.data, function(y) {
               return year <= _.first(y);
           });
};


function getProjectedYear(year, prevYear, nextYear)
{
    var projectedValues;


    if(!prevYear && !nextYear){
        projectedValues = _.clone(_.first(electricityMix.data));
        projectedValues[0] = year;
    }
    else if(prevYear && !nextYear){
        projectedValues = _.clone(prevYear);
        projectedValues[0] = year;
    }
    else if(!prevYear && nextYear){
        projectedValues = _.clone(nextYear);
        projectedValues[0] = year;
    }
    else{
       projectedValues  = projectYear(year, prevYear, nextYear);
    }

    return projectedValues;
};


function projectYear(year, prevYear, nextYear)
{
    var projectedValues = [year]
      , yearsDifference =  _.first(nextYear) - _.first(prevYear)
      , yearsFromPrev = year - _.first(prevYear);

    for(var i = 1; i < prevYear.length; i++)
    {
        projectedValues[i] = ((nextYear[i] - prevYear[i]) / yearsDifference) * yearsFromPrev + prevYear[i];
    }

    return projectedValues;
}