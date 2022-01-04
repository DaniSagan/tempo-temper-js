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

class WorkItemDay {
    constructor(date) {
        this.date = date;
        this.workItems = [];
    }

    getTotalHours() {
        return this.workItems.reduce((a, b) => a + b.hours, 0);
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