const mongoose = require('mongoose');

// Actual Schema___________________________________________________________________________________________________________
const AgreementSchema = new mongoose.Schema({
    isSigned: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    template: {
        type: String,
        required: true
    },
    landlord: {
        type: Object,
        required: true
    },
    propertyInfo: {
        type: Object,
        required: true
    },
    propertyAddress: {
        type: Object,
        required: true
    },
    leaseDurationInfo: {
        type: Object,
        required: true
    },
    monthlyRent: {
        type: Object,
        required: true
    },
    deposit: {
        type: Object,
        required: true
    },
    landlordSignatureDetails: {
        type: Object,
        required: false
    },
    tenantSignatureDetails: {
        type: Object,
        required: false
    },
    profileId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    tenantEmail: {
        type: String,
        required: false
    }
})


const agreement = mongoose.model('agreement', AgreementSchema)
module.exports = agreement