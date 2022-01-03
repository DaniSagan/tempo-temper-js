class IssueType {
    static Story = new IssueType("Story", "story");
    static SupportTask = new IssueType("Support Task", "support-task");
    static Bug = new IssueType("Bug", "bug");
    static Task = new IssueType("Task", "task");

    /**
     * 
     * @param {string} name 
     * @param {string} key
     */
    constructor(name, key) {
        this.name = name;
        this.key = key;
    }

    static fromString(value) {
        switch(value) {
            case IssueType.Story.name:
                return IssueType.Story;
            case IssueType.SupportTask.name:
                return IssueType.SupportTask;
            case IssueType.Bug.name:
                return IssueType.Bug;
            default:
                return null;
        }
    }
}

class DataRow {
    constructor(parentTable) {
        this.parentTable = parentTable;
        this.items = [];
    }

    getColumnIndex(columnName) {
        return this.parentTable.getColumnIndex(columnName);
    }

    setValue(columnName, value) {
        this.items[this.getColumnIndex(columnName)] = value;
    }

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
        this.name = name;
        this.rows = [];
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

    newRow() {
        var row = new DataRow(this);
        this.columns.forEach((column) => { row.items.push(null) });
        this.rows.push(row);
        return row;
    }
}

class User {
    /**
     * 
     * @param {string} id
     * @param {string} name
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class Issue {
    /**
     * 
     * @param {string} key 
     */
    constructor(key, summary) {
        this.key = key;
        this.summary = summary;
        this.type = null;
    }
}

class WorkItem {
    /**
     * 
     * @param {number} id 
     */
    constructor(id) {
        this.id = id;
        this.description = null;
        this.user = null;
        this.issue = null;
        this.date = null;
        this.hours = null;
    }
}

class Temper {
    constructor() {
        this.users = [];
        this.issues = [];
        this.workItems = [];
    }

    getIssueByKey(key) {
        return this.issues.find((item) => {return item.key === key});
    }

    getUserById(id) {
        return this.users.find((item) => {return item.id === id});
    }
}

var temper = new Temper();

/**
 * 
 * @param {Input} selector 
 */
function processFile(selector) {
    console.log(selector);
    const file = selector.files[0];
    var table = new DataTable("tempo");
    table.loadFromFile(file, () => {
        table.rows.forEach((row) => {
            let issueKey = row.getValue("Issue Key");
            let issue = temper.getIssueByKey(issueKey);
            if(issue == null) {
                issue = new Issue(issueKey, row.getValue("Issue summary"));
                issue.type = IssueType.fromString(row.getValue('Issue Type'));
                temper.issues.push(issue);
            }
            let userId = row.getValue("User Account ID");
            let user = temper.getUserById(userId);
            if(user == null) {
                user = new User(userId, row.getValue("Full name"));
                temper.users.push(user);
            }
            let workItem = new WorkItem(temper.workItems.length);
            workItem.description = row.getValue("Work Description");
            workItem.user = user;
            workItem.issue = issue;
            workItem.date = new Date(row.getValue("Work date"));
            workItem.hours = parseFloat(row.getValue("Hours"));
            temper.workItems.push(workItem);
        });
        console.log(temper);
        updateUsers(temper);
    });    
}

function updateUsers(temper) {
    let userSelect = document.getElementById("userSelect");
    userSelect.options = [];
    temper.users.forEach((user) => {
        userSelect.options.add(new Option(user.name, user.id));
    });
}

function onUserSelectChange(select) {
    let userSelect = document.getElementById("userSelect");
    let user = temper.getUserById(select.value);
    console.log(user);
    updateWorkItems(temper, user);
}

function updateWorkItems(temper, user) {
    let workItems = document.getElementById("work-item-list");
    while (workItems.firstChild) {
        workItems.removeChild(workItems.lastChild);
    }
    let items = temper.workItems.filter((element) => { return element.user.id === user.id });
    console.log(items);
    items.slice().sort((a, b) => (a.date > b.date) ? 1 : -1).forEach((item) => {
        // workItems.appendChild(createWorkItemElement(item));
        workItems.appendChild(createWorkItem(item));
    });
}

function createTemplate(templateId) {
    var template = document.getElementById(templateId);
    var res = template.content.cloneNode(true);
    return res;
}

/**
 * 
 * @param {WorkItem} workItem 
 */
function createWorkItem(workItem) {
    var res = createTemplate('work-item-template');
    console.log(res.querySelector('.work-item').className);
    res.querySelector('.work-item').className = `work-item-${workItem.issue.type.key}`;
    res.querySelector('.work-item-issue').innerText = `${workItem.issue.key} - ${workItem.issue.summary}`;
    res.querySelector('.work-item-title').innerText = workItem.description;
    res.querySelector('.work-item-user').innerText = workItem.user.name;
    res.querySelector('.work-item-duration-hours').innerText = `${workItem.hours}h`;
    res.querySelector('.work-item-duration-days').innerText = `${workItem.hours / 8}d`;
    return res;
}

// function createWorkItemElement(workItem) {
//     let div = document.createElement('div');
//     div.className = "workItem";
//     let nameText = document.createTextNode(workItem.user.name);
//     nameText.className = "workItemUser";
//     div.appendChild(nameText);
//     let descriptionText = document.createTextNode(workItem.description);
//     descriptionText.className = "workItemDescription";
//     div.appendChild(descriptionText);
//     return div;    
// }
