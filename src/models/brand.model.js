'use strict'

const mongoose = require('mongoose')

const SchemaBrand = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    average_price: {
        type: Number,
        required: false
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

const BrandModel = mongoose.model('brands', SchemaBrand)
module.exports = { BrandModel }