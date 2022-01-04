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
        /** @type {string} */
        this.name = name;
        /** @type {string} */
        this.key = key;
    }

    /**
     * 
     * @param {string} value 
     * @returns {IssueType}
     */
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
        /** @type {string} */
        this.id = id;
        /** @type {string} */
        this.name = name;
    }
}

class Issue {
    /**
     * 
     * @param {string} key 
     * @param {string} summary
     */
    constructor(key, summary) {
        /** @type {string} */
        this.key = key;
        /** @type {string} */
        this.summary = summary;
        /** @type {IssueType} */
        this.type = null;
    }
}

class WorkItem {
    /**
     * 
     * @param {number} id 
     */
    constructor(id) {
        /** @type {number} */
        this.id = id;
        /** @type {string} */
        this.description = null;
        /** @type {User} */
        this.user = null;
        /** @type {Issue} */
        this.issue = null;
        /** @type {Date} */
        this.date = null;
        /** @type {number} */
        this.hours = null;
    }

    /** @type {number} */
    get days() {
        return this.hours / 8;
    }

    /** @type {string} */
    get duration() {
        let h = Math.trunc(this.hours);
        let m = (this.hours - h) * 60;
        var res = '';
        if(h > 0) {
            res += `${h}h`;
        }
        if(m > 0) {
            res += `${m}m`;
        }
        return res;
    }
}

class WorkItemDay {
    /**
     * 
     * @param {Date} date 
     * @param {User} user 
     */
    constructor(date, user) {
        /** @type {Date} */
        this.date = date;
        /** @type {User} */
        this.user = user;
        /** @type {Array<WorkItem} */
        this.workItems = [];
    }

    /**
     * 
     * @returns {number}
     */
    get totalHours() {
        return this.workItems.reduce((a, b) => a + b.hours, 0);
    }
}

class Temper {
    constructor() {
        /** @type {Array<User>} */
        this.users = [];
        /** @type {Array<Issue>} */
        this.issues = [];
        /** @type {Array<WorkItem>} */
        this.workItems = [];
        /** @type {Array<WorkItemDay>} */
        this.workItemDays = [];
    }

    /**
     * 
     * @param {string} key 
     * @returns {Issue}
     */
    getIssueByKey(key) {
        return this.issues.find((item) => {return item.key === key});
    }

    /**
     * 
     * @param {string} id 
     * @returns {User}
     */
    getUserById(id) {
        return this.users.find((item) => {return item.id === id});
    }

    /**
     * 
     * @param {User} user 
     * @param {Date} date 
     * @returns {WorkItemDay}
     */
    getWorkItemDay(user, date) {
        return this.workItemDays.find((item) => {
            return (item.user.id === user.id) && (item.date.getTime() === date.getTime());
        });
    }

    /**
     * 
     * @param {User} user 
     * @returns {Array<WorkItemDay>}
     */
    getWorkItemDaysForUser(user) {
        return this.workItemDays.filter((item) => {
            return item.user.id === user.id;
        });
    }
}