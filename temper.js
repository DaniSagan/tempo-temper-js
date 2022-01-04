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

            var date = new Date(workItem.date.getFullYear(), workItem.date.getMonth(), workItem.date.getDate())
            var workItemDay = temper.getWorkItemDay(user, date);
            if(workItemDay == null) {
                workItemDay = new WorkItemDay(date, user);
                temper.workItemDays.push(workItemDay);
            }
            workItemDay.workItems.push(workItem);
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

/**
 * 
 * @param {Temper} temper 
 * @param {User} user 
 */
function updateWorkItems(temper, user) {
    let workItems = document.getElementById("work-item-list");
    while (workItems.firstChild) {
        workItems.removeChild(workItems.lastChild);
    }
    // let items = temper.workItems.filter((element) => { return element.user.id === user.id });
    // items.slice().sort((a, b) => (a.date > b.date) ? 1 : -1).forEach((item) => {
    //     // workItems.appendChild(createWorkItemElement(item));
    //     workItems.appendChild(createWorkItem(item));
    // });

    let items2 = temper.getWorkItemDaysForUser(user);
    items2.slice().sort((a, b) => (a.date > b.date) ? 1 : -1).forEach((item) => {
        workItems.appendChild(createWorkItemDayNode(item));
    });
}

/**
 * 
 * @param {string} templateId 
 * @returns {DocumentFragment}
 */
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
    res.querySelector('.work-item').className = `work-item-${workItem.issue.type.key}`;
    res.querySelector('.work-item-issue').innerText = `${workItem.issue.key} - ${workItem.issue.summary}`;
    res.querySelector('.work-item-title').innerText = workItem.description;
    // res.querySelector('.work-item-user').innerText = workItem.user.name;
    res.querySelector('.work-item-duration-hours').innerText = `(${workItem.duration})`;
    res.querySelector('.work-item-duration-days').innerText = `${(workItem.days).toFixed(2)}d`;
    return res;
}

/**
 * 
 * @param {WorkItemDay} workItemDay 
 * @returns {DocumentFragment}
 */
function createWorkItemDayNode(workItemDay) {
    var res = createTemplate('work-item-day-template');
    res.querySelector('.work-item-day-date').innerText = `📅 ${workItemDay.date.toLocaleDateString(navigator.language, {weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'})}`;
    res.querySelector('.work-item-day-total-hours').innerText = `⏲️ ${workItemDay.totalHours}h`;
    var workItemListDiv = res.querySelector('.work-item-day-list');
    workItemDay.workItems.forEach((workItem) => {
        workItemListDiv.appendChild(createWorkItem(workItem));
    });
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
