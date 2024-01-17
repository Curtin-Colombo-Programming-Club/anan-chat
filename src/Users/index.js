const { v1: uuidv1, v3: uuidv3, v4: uuidv4 } = require('uuid');
const fs = require('fs');

function randomInt(min, max, step) {
    // Calculate the number of possible values within the range with the given step
    const possibleValuesCount = Math.floor((max - min) / step) + 1;
  
    // Generate a random index within the possible values
    const randomIndex = Math.floor(Math.random() * possibleValuesCount);
  
    // Calculate the random number based on the index and step
    const randomNumber = min + randomIndex * step;
  
    return randomNumber;
}

function newUniqueColor (colors) {
    while (true) {
        let color = `(${randomInt(10, 255, 5)},${randomInt(10, 255, 5)},${randomInt(10, 255, 5)})`;
        if (!colors.includes(color)) {
            return color;
            break;
        }
    }
}

class User {
    constructor() {
        this.sid = null;
        this.addr = null;
        this.token = null;
        this.username = null;
        this.username = null;
        this.connected = false;
    }
}

class Users {
    constructor() {
        this.users = [];
        this.usernames = [];
        this.colors = [];

        fs.readFile(`${__dirname}/data.json`, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading JSON file:', err);
                return;
            }

            // Parse the JSON data
            const jsonData = JSON.parse(data);

            this.adjectives = jsonData.adjectives;
            this.animals = jsonData.animals;
        });
    }

    __

    addUser(user) {
        this.users.push(user);
    }

    newUser(addr) {
        if (this.usernames.length < this.adjectives.length * this.animals.length) {
            let user = new User();

            // username selection
            while (true) {
                let username = `${this.adjectives[Math.floor(Math.random() * this.adjectives.length)]} ${this.animals[Math.floor(Math.random() * this.animals.length)]}`
                if (!this.usernames.includes(username)) {
                    this.usernames.push(username);
                    user.username = username;
                    break;
                }
            }

            // color selection
            user.color = newUniqueColor(this.colors);
            this.colors.push(user.color);

            // token
            user.token = `${uuidv3(user.username, uuidv4())}.${uuidv3(addr, uuidv1())}`.replaceAll('-', '');
            // ip
            user.addr = addr;

            this.users.push(user);

            return user;
        }
        else {
            return new Error("All possible usernames taken!")
        }
    }

    changeUserColor(user) {
        let color = newUniqueColor(this.colors);
        this.colors.filter(item => item !== user.color);
        user.color = color;
    }

    getUser(token) {
        let ruser = null;
        for (let user of this.users) {
            if (user.token === token) {
                ruser = user;
                this.changeUserColor(user);
                break;
            }
        }

        return ruser;
    }

    getUserByIP(addr) {
        let ruser = null;
        for (let user of this.users) {
            if (user.addr === addr) {
                ruser = user;
                this.changeUserColor(user);
                break;
            }
        }

        return ruser;
    }


}

module.exports.Users = Users;