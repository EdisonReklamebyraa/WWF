var handsontable2csv = {
    string: function(instance, skipHeader) {
        var headers = instance.getColHeader();

        var csv = (!skipHeader)?headers.join("\t") + "\n" : "";

        for (var i = 0; i < instance.countRows(); i++) {
            var row = [];
            for (var h in headers) {
                var prop = instance.colToProp(h)
                var value = instance.getDataAtRowProp(i, prop)
                row.push(value)
            }

            csv += row.join("\t")
            csv += "\n";
        }

        return csv;
    },

    download: function(instance, filename) {
        var csv = handsontable2csv.string(instance)

        var link = document.createElement("a");
        link.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(csv));
        link.setAttribute("download", filename);

        document.body.appendChild(link)
        link.click();
        document.body.removeChild(link)
    }
}
