const ReviewModel = require("../model/review.model");

class ReviewController {
    constructor() { }

    async setReview(body) {
        try {
            const review = new ReviewModel(body);
            let result = await review.save();
            return { ok: true, data: result };
        } catch (error) {
            return { ok: false, message: error.message }
        }
    }

    async getSingleDoctorReviews(DoctorId) {
        try {
            let reviews = await ReviewModel.find({ doctor: DoctorId })
            // .populate('patient').populate('appointment');
            return { ok: true, data: reviews };
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }

    async getSinglePatientsReviews(patientIdId) {
        try {
            let reviews = await ReviewModel.find({ patient: patientIdId })
            // .populate('doctor').populate('appointment');
            return { ok: true, data: reviews };
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }

    async gellAllReviews() {
        try {
            let reviews = await ReviewModel.find();
            return { ok: true, data: reviews }
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }

    async updateReview(id, updateData) {
        try {
            const review = await ReviewModel.findByIdAndUpdate(id, { $set: updateData }, { new: true })
            return { ok: true, data: review }
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }

    async deleteReview(id) {
        try {
            const review = await ReviewModel.findByIdAndDelete(id);
            if (review) {
                return { ok: true, data: ` Review has been deleted` };
            }
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }
}

module.exports = new ReviewController();