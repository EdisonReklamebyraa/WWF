var _ = require("lodash");
var backgroundData = require('./data/background.js');




exports.growInvestment = function(investment, annualGrowthRate)
{
    return exports.growInvestmentInYears(investment,annualGrowthRate,1);
};

exports.growInvestmentInYears = function(investment, annualGrowthRate, years)
{
    return  investment*Math.pow((1 + annualGrowthRate), years);
};

exports.growInvestmentOverYears = function(investment, annualGrowthRate, start, end)
{
    return  exports.growInvestmentInYears(investment, annualGrowthRate, end - start);
};


exports.targetAmount = function(investment, annualGrowthRate, start, end, targetPercentage)
{
    return exports.growInvestmentOverYears(investment, annualGrowthRate, start, end) * targetPercentage;
};

exports.yearlyInvestmentWithInterest = function(annualGrowthRate, years, target)
{
    return  annualGrowthRate*target/(Math.pow((1+annualGrowthRate),years)-1) ;
};



exports.getInvestments = function(investment, annualGrowthRate, targetPercent ,years)
{
    var payments = []
    , yearlyPercentage = targetPercent/years
    , cumulativePercentage = 0
    , current = 0
    , payed = 0;

    for(var i = 0; i < years; i++)
    {
        cumulativePercentage += yearlyPercentage;
        investment =  exports.growInvestment(investment,annualGrowthRate );

        current = (investment*cumulativePercentage) ;

        payments.push(current - payed);
        payed = current;
    }

    return payments;
};


exports.allocateMoney = function(shares, investment)
{
    for(var j = 0; j < shares.members.length; j++)
    {
        shares.members[j].money = shares.members[j].percent * investment;
    }

    return shares;
};


//= Overnight Capital cost * Average Full Load Hours (capacity)
exports.capacityInstalled = function(shares)
{
    for(var i = 0; i < shares.members.length; i++)
    {
        var data = backgroundData[ shares.members[i].id];
        shares.members[i].installed =   shares.members[i].money / data.overnightCapitalCost;
    }
    return shares;
};


//Annual output