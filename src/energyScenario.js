var _ = require("lodash");




module.exports = EnergyScenario;

function EnergyScenario(data) {

    this.electricityMix = data;
}

EnergyScenario.prototype = _.create(EnergyScenario.prototype,
                                    {
                                        this : null,
                                        electricityMix: null,

                                        getYear : function(year)
                                        {
                                            var prevYear = this.getPreviousYear(year);

                                            if(year === _.first(prevYear))
                                              return prevYear;
                                            else{
                                                return this.getProjectedYear(year, prevYear, this.getNextYear(year));

                                            }
                                        },


                                        getAnnualVariationInCapacity : function(year) {
                                            var currYear = this.getYear(year)
                                              , prevYear = this.getYear(year - 1)
                                              , results = [];

                                            for(var i = 1; i < currYear.length; i++)
                                            {
                                                results.push(currYear[i] - prevYear[i]);
                                            }

                                            return results;
                                        },

                                        getShare : function(year) {
                                            var yearData = this.getYear(year)
                                              , results = [];


                                            for(var i = 2; i < yearData.length; i++)
                                            {
                                                results.push(yearData[i]/ yearData[1] );
                                            }

                                            return results;
                                        },

                                        getRelativeShare : function(year) {
                                            var yearData = this.getYear(year),
                                                prevYear = this.getYear(year - 1)
                                              , results = {};


                                            for(var i = 0; i < this.electricityMix.groups.length; i++)
                                            {
                                                var totalInstalled = 0;
                                                var total = 0;
                                                var result = {title:this.electricityMix.groups[i].title, total : 0, members:[] };

                                                for(var j = 0; j < this.electricityMix.groups[i].members.length; j++)
                                                {
                                                    var id = this.electricityMix.groups[i].members[j];
                                                    totalInstalled += yearData[id] - prevYear[id];
                                                    total += yearData[id];
                                                }

                                                result["total"] = total;

                                                for(j = 0; j < this.electricityMix.groups[i].members.length; j++)
                                                {
                                                    var id = this.electricityMix.groups[i].members[j];
                                                    var needed = yearData[id] - prevYear[id];

                                                    result.members.push({
                                                        id: id,
                                                        percent: (totalInstalled > 0)?needed/totalInstalled:0,
                                                        relativeShare: yearData[id]/total,
                                                        needed: needed,
                                                        title: this.electricityMix.cols[id]
                                                    });
                                                }
                                                results[result.title] = result;
                                            }

                                            return results;
                                        },

                                        getRenewableEnergyShare : function(year) {
                                            return this.getRelativeShare(year)[this.electricityMix.RENEWABLEENERGY];
                                        },

                                        getFossilFuelsShare : function(year) {
                                            return this.getRelativeShare(year)[this.electricityMix.FOSSILFUELS];
                                        },


                                        getFossilFuelsShares : function(start, end) {
                                            var shares = [];
                                            for(var i = 0; i < end - start; i++)
                                            {
                                                shares.push(this.getFossilFuelsShare(start + i )[this.electricityMix.FOSSILFUELS]);
                                            }
                                            return shares;
                                        },



                                        getRenewableEnergyShares : function(start, end) {
                                            var shares = [];
                                            for(var i = 0; i < end - start; i++)
                                            {
                                                shares.push(this.getRelativeShare(start + i )[this.electricityMix.RENEWABLEENERGY]);
                                            }
                                            return shares;
                                        },



                                        getPreviousYear: function(year)
                                        {
                                            return _.findLast(this.electricityMix.data, function(y) {
                                                       return year >= _.first(y);
                                                   });
                                        },


                                        getNextYear: function (year)
                                        {
                                            return _.find(this.electricityMix.data, function(y) {
                                                       return year <= _.first(y);
                                                   });
                                        },


                                        getProjectedYear: function (year, prevYear, nextYear)
                                        {
                                            var projectedValues;


                                            if(!prevYear && !nextYear){
                                                projectedValues = _.clone(_.first(this.electricityMix.data));
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
                                                projectedValues  = this.projectYear(year, prevYear, nextYear);
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
