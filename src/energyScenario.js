var _ = require("lodash");
var path = require('path');






module.exports = EnergyScenario;

function EnergyScenario(data) {
    self = this;
    self.electricityMix = data;

}

EnergyScenario.prototype = _.create(EnergyScenario.prototype,
                                    {
                                        self : null,
                                        electricityMix: null,

                                        getYear : function(year)
                                        {
                                            var prevYear = self.getPreviousYear(year);

                                            if(year === _.first(prevYear))
                                              return prevYear;
                                            else{
                                                return self.getProjectedYear(year, prevYear, self.getNextYear(year));

                                            }
                                        },


                                        getAnnualVariationInCapacity : function(year) {
                                            var currYear = self.getYear(year)
                                              , prevYear = self.getYear(year - 1)
                                              , results = [];

                                            for(var i = 1; i < currYear.length; i++)
                                            {
                                                results.push(currYear[i] - prevYear[i]);
                                            }

                                            return results;
                                        },

                                        getShare : function(year) {
                                            var yearData = self.getYear(year)
                                              , results = [];


                                            for(var i = 2; i < yearData.length; i++)
                                            {
                                                results.push(yearData[i]/ yearData[1] );
                                            }

                                            return results;
                                        },

                                        getRelativeShare : function(year) {
                                            var yearData = self.getYear(year),
                                                prevYear = self.getYear(year - 1)
                                              , results = {};




                                            for(var i = 0; i < self.electricityMix.groups.length; i++)
                                            {
                                                var totalInstalled = 0;
                                                var total = 0;
                                                var result = {title:self.electricityMix.groups[i].title, total : 0, members:[] };

                                                for(var j = 0; j < self.electricityMix.groups[i].members.length; j++)
                                                {
                                                    var id = self.electricityMix.groups[i].members[j];
                                                    totalInstalled += yearData[id] - prevYear[id];
                                                    total += yearData[id];
                                                }

                                                result["total"] = total;

                                                for(j = 0; j < self.electricityMix.groups[i].members.length; j++)
                                                {
                                                    var id = self.electricityMix.groups[i].members[j];
                                                    var needed = yearData[id] - prevYear[id];
                                                    result.members.push({
                                                        id: id,
                                                        percent: needed/totalInstalled,
                                                        relativeShare: yearData[id]/total,
                                                        needed: needed,
                                                        title: self.electricityMix.cols[id]
                                                    });
                                                }
                                                results[result.title] = result;
                                            }

                                            return results;
                                        },

                                        getRenewableEnergyShare : function(year) {
                                            return self.getRelativeShare(year)[self.electricityMix.RENEWABLEENERGY];
                                        },

                                        getFossilFuelsShare : function(year) {
                                            return self.getRelativeShare(year)[self.electricityMix.FOSSILFUELS];
                                        },



                                        getRenewableEnergyShares : function(years) {
                                            var shares = [];
                                            for(var i = 0; i < years.length; i++)
                                            {
                                                shares.push(self.getRelativeShare(years[i])[self.electricityMix.RENEWABLEENERGY]);
                                            }
                                            return shares;
                                        },

                                        getPreviousYear: function(year)
                                        {
                                            return _.findLast(self.electricityMix.data, function(y) {
                                                       return year >= _.first(y);
                                                   });
                                        },


                                        getNextYear: function (year)
                                        {
                                            return _.find(self.electricityMix.data, function(y) {
                                                       return year <= _.first(y);
                                                   });
                                        },


                                        getProjectedYear: function (year, prevYear, nextYear)
                                        {
                                            var projectedValues;


                                            if(!prevYear && !nextYear){
                                                projectedValues = _.clone(_.first(self.electricityMix.data));
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
                                                projectedValues  = self.projectYear(year, prevYear, nextYear);
                                            }

                                            return projectedValues;
                                        },


                                        projectYear: function (year, prevYear, nextYear)
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
                                    }
                                   );
