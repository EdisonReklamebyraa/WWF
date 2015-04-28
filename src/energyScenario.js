var _ = require("lodash");
var path = require('path');
var electricityMix = require('./data/electricity_mix.js');


exports.getYear = function(year)
{
    var prevYear = getPreviousYear(year);

    if(year === _.first(prevYear))
      return prevYear;
    else{
        return getProjectedYear(year, prevYear, getNextYear(year));

    }
};


exports.getAnnualVariationInCapacity = function(year) {
    var currYear = exports.getYear(year)
      , prevYear = exports.getYear(year - 1)
      , results = [];

    for(var i = 1; i < currYear.length; i++)
    {
        results.push(currYear[i] - prevYear[i]);
    }

    return results;
}

exports.getShare = function(year) {
    var yearData = exports.getYear(year)
    , results = [];


    for(var i = 2; i < yearData.length; i++)
    {
        results.push(yearData[i]/ yearData[1] );
    }

    return results;
}

exports.getRelativeShare = function(year) {
    var yearData = exports.getYear(year),
        prevYear = exports.getYear(year - 1)
      , results = {};




    for(var i = 0; i < electricityMix.groups.length; i++)
    {
        var total = 0;
        var result = {title:electricityMix.groups[i].title, total : 0, members:[] };

        for(var j = 0; j < electricityMix.groups[i].members.length; j++)
        {
            var id = electricityMix.groups[i].members[j];
            total += yearData[id] - prevYear[id];
        }

        result["total"] = total;

        for(j = 0; j < electricityMix.groups[i].members.length; j++)
        {
            var id = electricityMix.groups[i].members[j];
            var needed = yearData[id] - prevYear[id];
            result.members.push({
                id: id,
                percent: needed/total,
                needed: needed,
                title: electricityMix.cols[id]
            });
        }
        results[result.title] = result;
    }

    return results;
}

exports.getRenewableEnergyShare = function(year) {
    return exports.getRelativeShare(year)[electricityMix.RENEWABLEENERGY];
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