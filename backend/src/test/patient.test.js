const chai = require('chai');
const chaiHttp = require('chai-http');
const {app} = require('../server');
const { faker } = require('@faker-js/faker');


chai.use(chaiHttp);
chai.should();

let patientId;

describe("Patients", () => {
    let patient = {
        name: faker.person.fullName(),
        dateOfBirth: "11/05/1993",
        gender: faker.person.sex(),
        contactNumber: faker.phone.number(),
        email: faker.internet.email(),
        address: "uigiugiu iyhoihoihoih iohoihiohoij",
        medicalHistory: ["None"]
    };


    describe("POST /api/v1/patient", () => {
        it("should post a new patient", (done) => {
            chai.request(app)
                .post('/api/v1/patient')
                .send(patient)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    patientId = res.body.data._id; // Store the ID for later use
                    done();
                });
        });
    });

    describe("GET /api/v1/patient/:id", () => {
        it("should get a single patient record", (done) => {
            chai.request(app)
                .get(`/api/v1/patient/${patientId}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.data.should.have.property('_id').eql(patientId);
                    done();
                });
        });
    });

    describe("PUT /api/v1/patient/:id", () => {
        it("should update a patient record", (done) => {
            let updatedData = {
                name: faker.person.fullName() // Other fields can also be updated
            };
            chai.request(app)
                .put(`/api/v1/patient/${patientId}`)
                .send(updatedData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.data.should.have.property('name').eql(updatedData.name);
                    done();
                });
        });
    });

    describe("DELETE /api/v1/patient/:id", () => {
        it("should delete a patient record", (done) => {
            chai.request(app)
                .delete(`/api/v1/patient/${patientId}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe("POST /api/v1/patients with missing required fields", () => {
        it("should fail to create a patient with missing name", (done) => {
            let patient = {
                dateOfBirth: "2000-01-01",
                gender: "Male",
                contactNumber: "123-456-7890",
                email: "johndoe@example.com"
            };
            chai.request(app)
                .post('/api/v1/patient')
                .send(patient)
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
