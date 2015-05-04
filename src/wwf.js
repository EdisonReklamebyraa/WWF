var _ = require('lodash');
var background = require('./data/background.js');
var electricityMix = require('./data/electricity_mix.js');
var user = require('./data/user.js');





module.exports = WWF;

function WWF() {

    this.setUpTables();
}

WWF.prototype = _.create(WWF.prototype, {

    setUpTables : function() {
        var data = [
    ["", "Kia", "Nissan", "Toyota", "Honda"],
    ["2008", 10, 11, 12, 13],
    ["2009", 20, 11, 14, 13],
    ["2010", 30, 15, 12, 13]
  ];

  var container = document.getElementById('TableA');
  var hot = new Handsontable(container,
    {
      data: data,
      minSpareRows: 1,
      colHeaders: true,
      contextMenu: true
    });
    }

});
