class DataRow {
    constructor(parentTable) {
        /** @type {DataTable} */
        this.parentTable = parentTable;
        /** @type {Array<string>} */
        this.items = [];
    }

    /**
     * 
     * @param {string} columnName 
     * @returns {number}
     */
    getColumnIndex(columnName) {
        return this.parentTable.getColumnIndex(columnName);
    }

    /**
     * 
     * @param {string} columnName 
     * @param {string} value 
     */
    setValue(columnName, value) {
        this.items[this.getColumnIndex(columnName)] = value;
    }

    /**
     * 
     * @param {string} columnName 
     * @returns {string}
     */
    getValue(columnName) {
        return this.items[this.getColumnIndex(columnName)];
    }    
}

class DataTable {
    /**
     * 
     * @param {string} name 
     */
    constructor(name) {
        /** @type {string} */
        this.name = name;
        /** @type {Array<DataRow>} */
        this.rows = [];
        /** @type {Array<string>} */
        this.columns = [];
    }

    /**
     * 
     * @param {Array<string>} columns 
     */
    setColumns(columns) {
        if(this.rows.length == 0) {
            this.columns = [];
            for(const columnName of columns) {
                this.columns.push(columnName);
            }
        } else {
            throw new Error('Cannot change columns if row count is not zero');
        }
    }

    /**
     * 
     * @param {string} columnName 
     */
    getColumnIndex(columnName) {
        return this.columns.findIndex((item) => item === columnName);
    }

    clear() {
        this.rows = [];
        this.columns = [];
    }

    CSVToArray(strData, strDelimiter){
		var objPattern = new RegExp(
			(
				// Delimiters.
				"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

				// Quoted fields.
				"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

				// Standard fields.
				"([^\"\\" + strDelimiter + "\\r\\n]*))"
			),
			"gi"
		);


		// Create an array to hold our data. Give the array
		// a default empty first row.
		var arrData = [[]];

		// Create an array to hold our individual pattern
		// matching groups.
		var arrMatches = null;


		// Keep looping over the regular expression matches
		// until we can no longer find a match.
		while (arrMatches = objPattern.exec( strData )){

			// Get the delimiter that was found.
			var strMatchedDelimiter = arrMatches[ 1 ];

			// Check to see if the given delimiter has a length
			// (is not the start of string) and if it matches
			// field delimiter. If id does not, then we know
			// that this delimiter is a row delimiter.
			if (
				strMatchedDelimiter.length &&
				(strMatchedDelimiter != strDelimiter)
				){

				// Since we have reached a new row of data,
				// add an empty row to our data array.
				arrData.push( [] );

			}


			// Now that we have our delimiter out of the way,
			// let's check to see which kind of value we
			// captured (quoted or unquoted).
			if (arrMatches[ 2 ]){

				// We found a quoted value. When we capture
				// this value, unescape any double quotes.
				var strMatchedValue = arrMatches[ 2 ].replace(
					new RegExp( "\"\"", "g" ),
					"\""
					);

			} else {

				// We found a non-quoted value.
				var strMatchedValue = arrMatches[ 3 ];

			}


			// Now that we have our value string, let's add
			// it to the data array.
			arrData[ arrData.length - 1 ].push( strMatchedValue );
		}

		// Return the parsed data.
		return( arrData );
	}

    /**
     * 
     * @param {File} file 
     * @param {Function} callbackFn 
     */
    loadFromFile(file, callbackFn) {
        this.clear();
        const reader = new FileReader();
        reader.onload = (event) => {
            const file = event.target.result;

            let dataArray = this.CSVToArray(event.target.result, ',');
            console.log(dataArray);

            this.setColumns(dataArray[0]);
            dataArray.slice(1).forEach((dataRow) => {
                if(dataRow.length == this.columns.length) {
                    let row = this.newRow();
                    for(let k = 0; k < dataRow.length; k++) {
                        row.setValue(this.columns[k], dataRow[k]);
                    }
                }
            });

            // // const allLines = file.split(/\r\n|\n/);
            // const allLines = file.split(/\r\n|\n/);
            // // Reading line by line
            // const columnNames = allLines[0].split(',');
            // this.setColumns(columnNames);
            // allLines.slice(1).forEach((line) => {
            //     const values = line.split(',');
            //     let row = this.newRow();
            //     for(let k = 0; k < values.length; k++) {
            //         row.setValue(this.columns[k], values[k]);
            //     }
            // });
            if(callbackFn != null) {
                callbackFn();
            }
        };
        reader.onerror = (event) => {
            alert(event.target.error.name);
        };
        reader.readAsText(file);
    }

    /**
     * 
     * @returns {DataRow}
     */
    newRow() {
        var row = new DataRow(this);
        this.columns.forEach((column) => { row.items.push(null) });
        this.rows.push(row);
        return row;
    }
}