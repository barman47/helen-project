const expect = require('expect');

const {Users} = require('./users');

describe('Users', () => {

    var users;

    beforeEach(() => {
        users = new Users();
        users.users = [{
            id: '1',
            name: 'Mike',
            room: 'Node course'
        }, {
            id: '2',
            name: 'Jen',
            room: 'React course'
        }, {
            id: '3',
            name: 'Julie',
            room: 'Node course'
        }];
    });

    it('Should add new user', () => {
        var users = new Users();
        var user = {
            id: '123',
            name: 'Dominic',
            roomName: 'The office fans'
        };
        var resUser = users.addUser(user.id, user.name, user.roomName);

        expect(users.users).toEqual([user]);
    });

    it('Should remove a user', () => {
        var userId = '1';
        var user = users.removeUser(userId);

        expect(user.id).toBe(userId);
        expect(users.users.length).toBe(2);
    });

    it('Should not remove User', () => {
        var userId = '99';
        var user = users.removeUser(userId);

        expect(user).toNotExist();
        expect(users.users.length).toBe(3);
    });

    it('Should find user', () => {
       var userId = '2';
       var user = users.getUser(userId);
       expect(user.id).toBe(userId);
    });

    it('Should not find user', () => {
        var userId = '99';
        var user = users.getUser(userId);

        expect(user).toNotExist();
    });

    it('Should return names for node course', () => {
        var userList = users.getUserList('Node course');
        expect(userList).toEqual(['Mike', 'Julie']);
    });

    it('Should return names for react course', () => {
        var userList = users.getUserList('React course');
        expect(userList).toEqual(['Jen']);
    });
});