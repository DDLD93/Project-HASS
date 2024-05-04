const RoomsModel = require("../model/room.model");
const { faker } = require("@faker-js/faker");

class RoomsController {
  constructor() {
    // this.#init();
  }

  #init() {
    this.generateFakeRooms();
  }
  async bookRoom(body) {
    try {
      const room = new RoomsModel(body);
      let result = await room.save();
      return { ok: true, data: result };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async getSingleRoom(id) {
    try {
      let room = await RoomsModel.findById(id);
      return { ok: true, data: room };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async gellAllRooms(query) {
    try {
      if (query || query == undefined) {
        const regex = new RegExp(query, "i");
        const searchedRooms = await RoomsModel.find({
          type: { $regex: regex },
        });
        return {
          ok: true,
          data: searchedRooms,
          message: "Rooms fetched successfully",
        };
      } else {
        const rooms = await RoomsModel.find();
        return {
          ok: true,
          data: rooms,
          message: "Rooms fetched successfully",
        };
      }
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async gellAllAvailableRooms() {
    try {
      let availableRooms = await RoomsModel.find({ availability: true });
      return { ok: true, data: availableRooms };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async updateRoom(id, updateData) {
    try {
      const room = await RoomsModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );
      return { ok: true, data: room };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async deleteRoom(id) {
    try {
      const room = await RoomsModel.findByIdAndDelete(id);
      if (room) {
        return { ok: true, message: `Room has been deleted` };
      }
    } catch (error) {
      console.log(error.message)
      return { ok: false, message: error.message };
    }
  }

  async generateFakeRooms() {
    for (let i = 0; i < 20; i++) {
      const newRoom = new RoomsModel({
        number: faker.number.int({ min: 1, max: 100 }),
        type: faker.helpers.arrayElement(["Cosultation", "Cosultation", "Cosultation", "Cosultation", "Specialist", "Post Cosultation"]),
        status: faker.helpers.arrayElement(["avialable", "avialable", "avialable", "avialable", "not avialable"]),

      });
      await newRoom.save();
      console.log(`Room number : ${i++} generated`);
    }
    console.log("All done");
  }

  generateFakeBookings() {
    const bookings = [];
    const numBookings = faker.number.int({ min: 1, max: 5 });
    for (let i = 0; i < numBookings; i++) {
      const startTime = faker.date.between({
        from: new Date(),
        to: faker.date.future(),
      });
      const endTime = faker.date.between({
        from: startTime,
        to: faker.date.future(),
      });
      bookings.push({ startTime, endTime });
    }
    return bookings;
  }
}

module.exports = new RoomsController();
