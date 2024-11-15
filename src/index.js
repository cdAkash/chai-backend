

// import mongoose from "mongoose";
// import {DB_NAME} from "./constants"
import express from "express"
import dotenv from "dotenv"
import connectDB from "./db/index.js";
const app = express()
/*
;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Errr:",error)
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error(error)
    }
})() // IFFE method calling

*/
// require('dotenv').config({path:'./env'})


dotenv.config({
    path:'./env'
})
connectDB().then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at Port: ${process.env.PORT}`)
    })
}).catch((err)=>{
    console.log("mongoDB connection Failed->", err)
})