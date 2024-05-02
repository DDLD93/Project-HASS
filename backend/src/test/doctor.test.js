const chai = require("chai");
const chaiHttp = require("chai-http");
const {app} = require("../server");
const DoctorSchema = require("../model/doctor.model");
const AuthModel = require("../model/auth.model");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

chai.use(chaiHttp);
const should = chai.should();

let globalScopeId;
let token;

describe("POST /api/v1/doctor", () => {
  it("Should register a doctor", async () => {
    // ************** creating a user **************

    const newUser = new AuthModel({
      stripeId: "stripetest101",
      email: "shamskhalil@gmail.com",
      password: "qwerty",
      role: "doctor",
      authType: "local",
      isVerified: true,
    });
    let user = await newUser.save();

    // ************** creating the auth token for doctor **************
    let id = user._id;

    token = jwt.sign(
      { email: user.email, userType: user.role, id: id.valueOf() },
      jwtSecret,
      {
        expiresIn: "48h",
      }
    );

    // ************** Registering a Doctor**************

    const newDoctor = {
      fullName: "Shams Khalil",
      department: "Urology",
      specialization: "urology",
      contactNumber: "123-456-7890",
      email: "shamskhalil@gmail.com",
      workingHours: {
        start: "09:00",
        end: "18:00",
      },
      availability: [
        {
          day: "Wednesday",
        },
      ],
      averageRating: 1,
      ratingsCount: 2,
    };
    // const newDoc = await newDoctorSchema.save();

    const res = await chai
      .request(app)
      .post("/api/v1/doctor")
      .send(newDoctor)
      .set("authorization", token);

    globalScopeId = res.body.data._id;

    res.should.have.status(200);
    res.body.should.have.property("ok").eql(true);
    console.log({ "Should register a doctor": res.body });
  });
});

describe("GET /api/v1/doctor/profile", () => {
  it("Should return a single doctor's profile", async () => {
    const res = await chai
      .request(app)
      .get("/api/v1/doctor/profile")
      .set("authorization", token);
    res.should.have.status(200);
    res.body.should.have.property("ok").eql(true);
    console.log({ "Should return a single doctor's profile": res.body });
  });
});

describe("GET /api/v1/doctor", function () {
  it("Should return an Array of all registered doctors", function (done) {
    chai
      .request(app)
      .get("/api/v1/doctor")
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(200);
        chai.expect(res.body.data).to.be.an("array");
        res.body.data.forEach((obj, idx) => {
          console.log({
            index: idx,
            "Should return an Array of all registered doctors": obj,
          });
        });

        done();
      });
  });
});

describe("GET /api/v1/doctor/available", function () {
  it("Should return available doctor(s)", async () => {
    const res = await chai
      .request(app)
      .get("/api/v1/doctor/available")
      .query({ day: "Wednesday", start: "09:00", end: "18:00" });
    res.should.have.status(200);
    res.body.should.be.a("object");
    res.body.data.forEach((obj, idx) => {
      console.log({ "Should return available doctor(s)": obj });
    });
  });
});

describe("GET /:id", () => {
  it("should return a single doctor using his id", async () => {
    let id = globalScopeId;
    const res = await chai.request(app).get(`/api/v1/doctor/${id}`);
    res.should.have.status(200);
    res.body.should.be.a("object");
    console.log({ "should return a single doctor using his id": res.body });
  });
});

describe("PUT /:id", () => {
  it("Update a doctor record", async () => {
    let id = globalScopeId;
    const res = await chai.request(app).put(`/api/v1/doctor/${id}`).send({
      fullName: "Ologunebi Feyishola Taiwo",
    });
    res.should.have.status(200);
    res.body.should.have.property("ok").eql(true);
    console.log({ "Update a doctor record": res.body });
  });
});

describe("DELETE /:id", () => {
  it("Should delete a Doctor from Db", async () => {
    // get id to delete
    let id = globalScopeId;
    const res = await chai.request(app).delete(`/api/v1/doctor/${id}`);
    res.should.have.status(200);
    res.body.should.have.property("ok").eql(true);
    console.log({ "Should delete a Doctor from Db": res.body });
  });
});
