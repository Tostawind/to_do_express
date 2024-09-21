import fs from "fs";

export const getUsers = () => {
    const data = fs.readFileSync('./data/users.json');
    return JSON.parse(data);
}