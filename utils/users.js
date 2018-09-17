[{
    id: '/#12fnefknkien',
    name: 'Dominic',
    room: 'The office fans'
}]

// addUser(id, name, room)
// removeUser(id)
// getUser(id)
// getUserList(room)

class Users {
    constructor() {
        this.users = [];
    }

    addUser (id, name, room) {
        var user = {id, name, room};
        this.users.push(user);
        return user;
    }

    removeUser (id) {
        var user = this.getUser(id);

        if (user) {
            this.users = this.users.filter((user) => user.id != id);
        }
        return user;

        // return user that was removed
    }

    getUser (id) {
        return this.users.filter((user) => user.id === id)[0];
    }

    getUserList (room) {
        var users = this.users.filter((users) => users.room === room);
        var namesArray = users.map((users) => users.name);

        return namesArray;
    }
}

module.exports  = {Users};

// class Person {
//     constructor(name, age) {
//         this.name = name;
//         this.age = age;
//     }
//
//     getUserDescription () {
//         return `${this.name} is ${this.age} year(s) old.`
//         return `Jen is 1 year(s)`;
//     }
// }
//
// var me = new Person('Dominic', 22);
// var description = me.getUserDescription();
// console.log(description);