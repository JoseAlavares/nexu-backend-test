'use strict'

const mongoose = require('mongoose')

const SchemaCarModel = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    average_price: {
        type: Number,
        required: true
    },
    brand_name: {
        type: String,
        required: true
    },
    active: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        required: true
    },
    updated_at: {
        type: Date
    }
})

const CarModel = mongoose.model('car-models', SchemaCarModel)
module.exports = { CarModel }