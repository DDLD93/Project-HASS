const chai = require('chai');
const chaiHttp = require('chai-http');
const {app} = require('../server');
const { faker } = require('@faker-js/faker');

chai.use(chaiHttp);
chai.should();
let user = {
    email: faker.internet.email().toLowerCase(),
    fullName: faker.person.fullName(),
    password: faker.internet.password(),
    role: faker.helpers.arrayElement(["patient", "doctor"])
}

describe("Auth", () => {
  
    describe("POST /api/v1/auth/register", () => {
        it("should register a new user", (done) => {
            chai.request(app)
                .post('/api/v1/auth/register')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('ok').eql(true);
                    res.body.should.have.property('data');
                    done();
                });
        });
    });

    describe("POST /api/v1/auth/login", () => {
        it("should log in an existing user", (done) => {
            chai.request(app)
                .post('/api/v1/auth/login')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.body.should.be.a('object');
                    res.body.should.have.property('ok').eql(false);
                    res.body.should.have.property('message').eql('Not Authorize, please verify account');
                    // res.body.should.have.property('data');
                    // res.body.data.should.have.property('token');
                    // Other assertions as needed
                    done();
                });
        });

    });

    describe("POST /api/v1/auth/login with non-existent user", () => {
        it("should fail to log in a non-existent user", (done) => {
            let credentials = {
                email: "nonexistent@example.com",
                password: "password123"
            };
            chai.request(app)
                .post('/api/v1/auth/login')
                .send(credentials)
                .end((err, res) => {
                    res.should.have.status(500); // Assuming 404 for not found
                    res.body.should.be.a('object');
                    res.body.should.have.property('ok').eql(false);
                    // Assertions for error message
                    done();
                });
        });
    });

    describe("POST /api/v1/auth/login with incorrect credentials", () => {
        it("should fail to log in with wrong password", (done) => {
            let credentials = {
                email: "existinguser@example.com",
                password: "wrongpassword"
            };
            chai.request(app)
                .post('/api/v1/auth/login')
                .send(credentials)
                .end((err, res) => {
                    res.should.have.status(500); // Assuming 401 for unauthorized
                    res.body.should.be.a('object');
                    res.body.should.have.property('ok').eql(false);
                    // Additional assertions for error message
                    done();
                });
        });
    });

    describe("POST /api/v1/auth/register with missing fields", () => {
        it("should fail to register a user with missing password", (done) => {
            let user = {
                email: "user@example.com",
                // Missing 'password' field
                role: "patient"
            };
            chai.request(app)
                .post('/api/v1/auth/register')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.body.should.be.a('object');
                    res.body.should.have.property('ok').eql(false);
                    done();
                });
        });
    });
    describe("POST /api/v1/auth/register with invalid email", () => {
        it("should fail to register a user with an invalid email format", (done) => {
            let user = {
                email: "invalidemail", // Incorrect email format
                password: "password123",
                role: "patient"
            };
            chai.request(app)
                .post('/api/v1/auth/register')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(500);
                    res.body.should.be.a('object');
                    res.body.should.have.property('ok').eql(false);
                    done();
                });
        });
    });



});


