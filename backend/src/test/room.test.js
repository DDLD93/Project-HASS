const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../server');
const { faker } = require('@faker-js/faker');


chai.use(chaiHttp);
chai.should();

let roomId;

describe("Room", () => {
    let room = {
        roomNumber: 1,
        roomType: "type one",
        availability: false,
        bookings: { startTime: Date.now(), endTime: Date.now() },
    };


    describe("POST /api/v1/room", () => {
        it("should post a new room", (done) => {
            chai.request(app)
                .post('/api/v1/room')
                .send(room)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    roomId = res.body.data._id; // Store the ID for later use
                    done();
                });
        });
    });

    describe("GET /api/v1/room/:id", () => {
        it("should get a single room record", (done) => {
            chai.request(app)
                .get(`/api/v1/room/${roomId}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.data.should.have.property('_id').eql(roomId);
                    done();
                });
        });
    });


    describe("PUT /api/v1/room/:id", () => {
        it("should update a room record", (done) => {
            let updatedData = {
                roomNumber: 2// Other fields can also be updated
            };
            chai.request(app)
                .put(`/api/v1/room/${roomId}`)
                .send(updatedData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.data.should.have.property('roomNumber').eql(updatedData.roomNumber);
                    done();
                });

        });
    });


    describe("DELETE /api/v1/room/:id", () => {
        it("should delete a room record", (done) => {
            chai.request(app)
                .delete(`/api/v1/room/${roomId}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });


    describe("POST /api/v1/room with missing required fields", () => {
        it("should fail to create a room with missing required roomNuber", (done) => {
            let room = {
                roomType: "type one",
                availability: false,
                bookings: { startTime: Date.now(), endTime: Date.now() },
            };
            chai.request(app)
                .post('/api/v1/room')
                .send(room)
                .end((err, res) => {
                    res.should.have.status(500); // Assuming 400 for a bad request
                    res.body.should.be.a('object');
                    // res.body.should.have.property('errors');
                    // res.body.errors.should.have.property('name');
                    done();
                });
        });
    });
});
