var Arbiter = require('arbiter-subpub');
var _ = require("lodash");

module.exports = UIs;

function UIs(data) {
    var self = this;

    this.loadEvents();
    Arbiter.subscribe("update/user",function(json) {
        self.update(json);
        self.updateUI(json);
    } );

    Arbiter.subscribe("changed/user", function(json) {
        self.update(json);
        self.updateUI(json);
    });

    Arbiter.subscribe("saving", function() {
        self.saving();

    });

}

UIs.prototype = _.create(
    UIs.prototype,
    {

        user: null,
        update: function(json) {
            this.user = json;
        },

        updateUI: function(json) {

            $("input[name=startYear]").val(this.user["starting year"] );
            $("input[name=start]").val(this.user["starting year"] );
            $("input[name=target]").val(this.user["target year"] );
            $("input[name=totalFund]").val(numeral(this.user["investment"] ).format('$ 0, 000')  );
            $("input[name=endYear]").val(this.user["target year"] );
            $("input[name=investPercentage]").val(numeral(this.user["target"] ).format('0%'));
            $("input[name=growthRate]").val(numeral(this.user["annual growth rate"] ).format('0%'));

            $("input[name=comparison]").val(numeral(this.user["comparison"] ).format('0, 000'));

            $("#AppRest").click(function(e) {
                e.preventDefault();
                Arbiter.publish("reset",this);
            });
        },

        saving: function() {
            $("#AppRest").text("Saving").addClass("saving");

            setTimeout(function() {
                $("#AppRest").text("Reset").removeClass("saving");;
            }, 1500);

        },

        loadEvents: function(e) {
            self = this;

            $("input").focusout(function() {
                self.interaction(this);
            }).change(function() {
                self.interaction(this);
            }) ;
        },

        interaction: function(input) {
            var val = $(input).val() * 1;
            val = isNaN(val)? numeral().unformat($(input).val()):val;

            if(!isNaN(val)){
                this.user[ $(input).data("id")] = val;
            }

            this.user["target year"] = Math.max(this.user["target year"], this.user["starting year"])
            Arbiter.publish("changed/user",this.user);
        }


    });
