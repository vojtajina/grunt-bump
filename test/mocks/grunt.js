var tasks = [];

module.exports = {
    tasks: tasks,
    registerTask: function(name, description, taskFn){
        this.tasks.push({
            name: name,
            description: description,
            taskFn: taskFn
        })
    }
};