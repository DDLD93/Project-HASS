const AuthModel = require("../model/auth.model");
const DoctorModel = require("../model/doctor.model");
const PatientModel = require("../model/patient.model");

const { faker } = require("@faker-js/faker");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

class ControllerAuth {
  constructor() {
    this.#init();
  }

  async register(body) {
    try {
      // Create a new user
      const newUser = new AuthModel({ authType: "local", ...body });
      await newUser.save();

      // Create Stripe customer and update user with Stripe ID
      // let strObj = await stripeCtrl.createCustomer({ email: newUser.email });
      // await AuthModel.findByIdAndUpdate(newUser._id, { stripeId: strObj.id });

      // await this.postRegistration(newUser);

      return {
        ok: true,
        data: { ...newUser, password: "******" },
        message: "Registration successful",
      };
    } catch (error) {
      console.log("Error creating user :::", error.message);
      return { ok: false, message: error.message };
    }
  }

  async loginWithToken(tokenStr) {
    try {
      let user = this.decodeToken(tokenStr);

      let account = await AuthModel.findById(user.id);
      if (!account) {
        return { ok: false, message: "Account not found" };
      }
      let token = this.encodeToken(
        {
          email: account.email,
          role: account.role,
          id: account._id,
        },
        { expiresIn: "5h" }
      );

      let payload = {
        user: account,
        token,
      };
      return { ok: true, data: payload };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
  async resetPassword(tokenStr, password) {
    try {
      let payloadObj = this.decodeToken(tokenStr);

      if (!payloadObj) {
        return { ok: false, message: "Unable to decode token" };
      }

      let user = await AuthModel.findById(payloadObj.id);
      if (!user) {
        return { ok: false, message: "Account not found" };
      }
      await user.changePassword(password);
      let token = this.encodeToken(
        {
          email: user.email,
          role: user.role,
          id: user._id,
        },
        { expiresIn: "5h" }
      );

      let payload = {
        user,
        token,
      };
      return { ok: true, data: payload };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async changeAccPassword(id, password) {
    // dis
    try {
      let user = await AuthModel.findById(id);
      if (!user) {
        return { ok: false, message: "Account not found" };
      }
      await user.changePassword(password);
      let token = this.encodeToken(
        {
          email: user.email,
          role: user.role,
          id: user._id,
        },
        { expiresIn: "5h" }
      );
      console.log(token, "created");
      let payload = {
        user,
        token,
      };
      return { ok: true, data: payload };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async login(email, password) {
    try {
      const user = await AuthModel.findOne({ email, authType: "local" });
      if (!user) {
        throw new Error("User not found");
      }

      const isValid = await user.isValidPassword(password);
      if (!isValid) {
        throw new Error("Invalid password");
      }
      if (user.status !== "active") {
        throw new Error("Account suspended");
      }
      let token = this.encodeToken(
        {
          email: user.email,
          role: user.role,
          id: user._id,
        },
        { expiresIn: "5h" }
      );

      let payload = {
        user,
        token,
      };
      return { ok: true, data: payload, message: "Login successful" };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async getUsers() {
    const patients = await DoctorModel.find().populate("authId");
    const doctors = await PatientModel.find().populate("authId");
    return {
      ok: true,
      data: [...patients, ...doctors],
      message: "Users fetched successfully",
    };

  }

  async updateUser(id, newData) {
    try {
      console.log({id, newData})
      const user = await AuthModel.findByIdAndUpdate(id, newData, { new: true });
      console.log({user})
      return {
        ok: true,
        data: user,
        message: "Users updated successfully",
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }

  }

  encodeToken(payload, options = {}) {
    return jwt.sign(payload, jwtSecret, options);
  }
  decodeToken(token) {
    try {
      return jwt.verify(token, jwtSecret);
    } catch (error) {
      console.log("token not verifed>>>", error.message);
    }
  }
  async #init() {
    try {
      let adminUser = await AuthModel.findOne({ email: "admin@system.com" });
      if (adminUser) {
        console.log("Admin User found >>> Skipping seeding ::::");
        // await this.generateAndSaveUsers();
        return;
      }
      await AuthModel.ensureIndexes();
      let adminObj = {
        email: "admin@system.com",
        password: "0987654321",
        role: "admin",
        authType: "local",
      };
      let newAdmin = new AuthModel(adminObj);
      let admin = await newAdmin.save({ isAdmin: true });
      console.log("Seeded new admin account ::::", admin);
    } catch (error) {
      console.log("error seeding admin account ::::", error.message);
    }
  }

  async generateAndSaveUsers() {
    try {
      for (let i = 0; i < 150; i++) {
        const newUser = new AuthModel({
          email: faker.internet.email(),
          password: "123456",
          role: faker.helpers.arrayElement([
            "patient",
            "doctor",
            "doctor",
            "doctor",
            "doctor",
            "doctor",
          ]),
          authType: faker.helpers.arrayElement(["local"]),
          isVerified: true,
          status:"active"
        });
        await newUser.save();
        console.log(`User ${i + 1} created successfully`);
      }
      console.log("All users created successfully");
    } catch (error) {
      console.error("Error creating users:", error.message);
    }
  }
}

module.exports = new ControllerAuth();
