import mongoose from 'mongoose'
import config from './config'

mongoose.Promise = Promise

// Create the mongoose connection
const connection = () => (process.env.NODE_ENV != undefined && process.env.NODE_ENV.trim() == 'test')
    ? mongoose.connect(config.DB_URI_TEST) : mongoose.connect(config.DB_URI, { useNewUrlParser: true })

/**
 * CONNECTION EVENTS
 */

// When successfully connected
mongoose.connection.on('connected', () => {
    // console.log(`Mongoose default connection open to: ${config.DB_URI}`);
})

// If the connection throws an error
mongoose.connection.on('error', (err) => {
    console.log(`Mongoose default connection error: ${err}`)
})

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose default connection disconnected');
})

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    })
})

export default { connection }