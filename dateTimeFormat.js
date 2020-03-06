/**
 * @param {*} rows a JS Object call JSON.parse() before  
 * @param {string} key of the key that contains the date value in rows
 * @param {boolean} bool true if the desired format is Datetime. False if only Date
 * @returns {*} the rows with the date in the correct format
 * @description iterate over the rows and reformat the date
 * @public
 */
var format = function (rows, key, bool) {
    for (let i = 0; i < rows.length; i++) {
        //console.log(typeof JSON.parse(JSON.stringify(rows[i].listModifDate)));
        let tab = rows[i][key].split('T');
        let date_time = "le "+tab[0];
        if (bool) {
            tab = tab[1].split('.');
            date_time += " à "+tab[0];
        }
        rows[i][key] = date_time;
    }
    return rows;

}

module.exports.format = format;
