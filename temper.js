var temper = new Temper();

/**
 * 
 * @param {Input} selector 
 */
function processFile(selector) {
    // console.log(selector);
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
        // console.log(temper);
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
    updateWorkItems(temper, user);
}

/**
 * 
 * @param {InputElement} input 
 */
function onFilterChange(input) {
    let filterText = input.value;
    let workItems = document.getElementsByClassName('work-item');
    for(let workItem of workItems) {
        if(filterText === '') {
            workItem.style.display = '';
        } else {
            let issueName = workItem.querySelector('.work-item-issue').innerText;
            let issueTitle = workItem.querySelector('.work-item-title').innerText;
            if(issueName.toLowerCase().includes(filterText.toLowerCase()) || issueTitle.toLowerCase().includes(filterText.toLowerCase())) {
                workItem.style.display = '';
            } else {
                workItem.style.display = 'none';
            }
        }
    }
}

function onJiraServerAddressChange(input) {
    temper.serverAddress = input.value;
    createCookie("server", temper.serverAddress, 30);
    // updateJiraLinks(temper);
}

function openWorkItemIssueLink(workItemIssueDiv) {
    // console.log(workItemIssueDiv.dataset.workitemissue);
    let url = `${temper.serverAddress}/browse/${workItemIssueDiv.dataset.workitemissue}`;
    window.open(url, '_blank').focus();
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
    let items = temper.getWorkItemDaysForUser(user);
    items.slice().sort((a, b) => (a.date > b.date) ? 1 : -1).forEach((item) => {
        workItems.appendChild(createWorkItemDayNode(item));
    });
}

function updateJiraLinks(temper) {
    let jiraLinkNodes = document.getElementsByClassName('work-item-issue-link');
    jiraLinkNodes.forEach((linkNode) => {
        linkNode.setAttribute('href', `${temper.serverAddress}/browse/${workItem.issue.key}`);
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
    let workItemDiv = res.querySelector('.work-item');
    workItemDiv.addEventListener('click', (event) => {
        console.log(workItemDiv);
    });
    res.querySelector('.work-item').classList.add(`work-item-${workItem.issue.type.key}`);
    res.querySelector('.work-item-issue').innerText = `${workItem.issue.key} - ${workItem.issue.summary}`;
    res.querySelector('.work-item-issue-link').dataset.workitemissue = workItem.issue.key;
    res.querySelector('.work-item-title').innerText = workItem.description;
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

function onJiraServerAddressLoad(input) {
    let jiraServer = readCookie("server");
    console.log(jiraServer);
    if(jiraServer != null) {
        input.value = jiraServer;
        temper.serverAddress = jiraServer;
    }
}

window.onload = (event) => {
    let jiraServer = readCookie("server");
    console.log(jiraServer);
    if (jiraServer != null) {
        document.getElementById('jira-server-address-input').value = jiraServer;
        temper.serverAddress = jiraServer;
    }
}
