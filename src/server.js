const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const mongoose = require('mongoose')

const MONGO_DB_HOST = process.env.MONGO_DB_HOST
const MONGO_DB_NAME = process.env.MONGO_DB_NAME

const URI = `mongodb://${MONGO_DB_HOST}:27017/${MONGO_DB_NAME}`

mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(result => console.log('Successful conection to MongoDB'))
.catch(err => console.error('Error in the mongodb connection', err))

const { CarModel } = require('./models/car-model.model')
const { BrandModel } = require('./models/brand.model')
const { request, response } = require('express')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(helmet())
app.use(cors())

app.get('/api/v1/brands', async (request, response) => {
    try {
        const cars = await CarModel.aggregate([
            { $group: {
                _id: '$brand_name',
                average_price: { $avg: '$average_price' },
                id: { $first: "$id"}
            }},
            {
                $project: {
                    nombre: "$_id",
                    average_price: { $trunc: [ "$average_price" ] },
                    id: "$id"
                }
            }
        ])
        return response.status(201).json({ message: 'OK', data: cars })
    } catch (error) {
        console.log('Error in the service /api/v1/accounts', error)
        return response.status(500).json({ message: 'Internal server error' })
    }
})

app.get('/api/v1/:id/brands', async (request, response) => {
    if (!request.params.id)
        return response.status(400).json({ message: 'Bad request' })

    const id = request.params.id

    try {
        const brand = await BrandModel.findById(id).lean()
        const cars = await CarModel.find({ brand_name: brand.nombre })
        return response.status(200).json({ message: 'OK', data: cars})
    } catch(err) {
        console.error(err.message)
        return response.status(500).json({ message: 'Internal server error' })
    }
})

app.post('/api/v1/brands', async (request, response) => {
    if (!request.body.name)
        return response.status(400).json({ message: 'Bad request' })

    try {
        const exists = await BrandModel.exists({ name: request.body.name })
        if (exists) return response.status(409).json({ message: 'The brand already exists' })
    } catch (error) {
        console.error(err.message)
        return response.status(500).json({ message: 'Internal server error' })
    }

    try {
        const car = new BrandModel(request.body)
        car.active = true
        car.created_at = new Date().toISOString()
        await car.save()
        return response.status(201).json({ message: 'Created' })
    } catch (err) {
        console.error(err.message)
        return response.status(500).json({ message: 'Internal server error' })
    }
})

app.post('/api/v1/:id/models', async (request, response) => {
    if (!request.body.name || !request.params.id)
        return response.status(201).json({ message: 'Created' })

    try {
        const existsBrand = await BrandModel.findById(request.params.id).lean()
        if (!existsBrand) return response.status(404).json({ message: 'Not found' })

        const existsModel = await CarModel.findOne({ name: request.body.name })

        if (existsModel)
            return response.status(409).json({ message: 'The model already exists' })

        if (request.body?.average_price <= 100000)
            return response.status(400).json({ message: 'The average price not is greater than 100000'})

        const newCar = new CarModel()
        newCar.name = request.body.name
        newCar.brand_name = existsBrand.nombre
        newCar.average_price = request.body?.average_price ?? 0
        newCar.created_at = new Date().toISOString()
        newCar.active = true
        newCar.save()

        return response.status(201).json({ message: 'Created' })
    } catch (error) {
        console.error(error)
        return response.status(500).json({ message: 'Internal server error' })
    }
})

app.get('/api/v1/models', async (request, response) => {
    const greater = request.query?.greater
    const lower = request.query?.lower
    let query = {}

    if (greater && lower) query = { average_price: { $gte: parseInt(greater), $lte: parseInt(lower) } }
    if (greater && !lower) query = { average_price: { $gte: parseInt(greater) } }
    if (lower && !greater) query = { average_price: {  $lte: parseInt(lower) } }

    try {
        const cars = await CarModel.find(query)
        return response.status(200).json({ message: 'OK', data: cars })
    } catch (error) {
        console.error(error.message)
        return response.status(500).json({ message: 'Internal server error' })
    }
})

app.listen(process.env.PORT, () => console.log('API ready :D'))