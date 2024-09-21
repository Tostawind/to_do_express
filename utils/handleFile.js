import fs from "fs";

// GET TASKS:
export const readTasks = () => {
    const data = fs.readFileSync('./data/tasks.json');
    return JSON.parse(data);
}

// UPDATE TASKS:
export const writeTasks = (tasks) => {
    fs.writeFileSync('./data/tasks.json', JSON.stringify(tasks, null, 2));
}