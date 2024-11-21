import mongoose, {isvaidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const publishAVideo = asyncHandler(async (req,res)=>{
    const {title,description}=req.body
    /*
    ->title,description validation
    ->videoLocalPath get from frontend and send it to cloudinary
    ->thumbnail repeat
    ->get the video URL and store it in database
    ->thumbnai repeat
    ->duration
    ->isPublished
    ->views{when a user access this video by the function getVideoById we will increase the count of the views}
    ->set the owner of the video
    */
    if(
        [title,description].some((field)=> field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required");
    }

    const thumbnailLocalPath = req.files?.thumbnail[0].path
    const videoLocalPath = req.files?.videoFile[0].path

    if(!thumbnailLocalPath && !videoLocalPath){
        throw new ApiError(400,"Thumbnail and video file is necessary")

    }
    // uppload files on cloudinary

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    const video = await uploadOnCloudinary(videoLocalPath)

    if(!thumbnail && !video){
        throw new ApiError(400,"Problem occured while uploading")

    }
    // push datat to the database

    const user = await User.create({
        videoFile:video.url,
        thumbnai:thumbnail.url,
        title,
        description,
        duration:video.duration,
        views:0,
        isPublished:true,
        owner: req.user?._id,
    })

    return res
    .status(201).
    json(
        new ApiResponse(201,user,"video published succesfully")
    )
    

})

const getAllVideos = asyncHandler(async (req,res)=>{
    const {page=1,limit=10,query,sortBy,sortType,userId}=req.query
    /*
    first -> check the userID is as validObjectID and convert it into object id
    sortBy -> short by createdAt criteria
    sortType -> ascending or descending
    put the limit of videos in one page
    get all the videos from the database(using find method with all the above parameters)
    store them all
    return the response in json file.

    */
   let objectId;
    if(mongoose.isValidObjectId(userId)){
        objectId = mongoose.ObjectId(userId);
    }else{
        throw new ApiError(400,"UserID is not valid")
    }

    const skip = (Number(page)-1)*Number(limit)

    const sortOptions={}

    if(sortBy && sortType){
        sortOptions[sortBy] = sortType.toLowerCase() === "asc"? 1:-1
    }

    const Videos = await Video.find({
        title: new RegExp(query,"i"),
        userId: objectId
    })
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(limit));

    const totalVideos = await Videos.countDocuments({
        title: new RegExp(query,"i"),
        userId : objectId
    })

    return res.status(200).json({
        success:true,
        page:Number(page),
        limit:Number(limit),
        totalVideos: totalVideos,
        queryData: Videos,
    }
    )
    
})

const getVideoById= asyncHandler(async (req,res)=>{
    const {videoId} = req.params;

    // check whether the provided videoId is valid or not
    //once we get the videoId , query database 
    let validObject;
    if(isvaidObjectId(videoId)){
        validObject = mongoose.objectId(videoId)
    }else{
        throw new ApiError(400,"Gived videoId is not valid")
    }
    const video = await Video.findById(validObject)

    return res.
    status(200)
    .json(
        new ApiResponse(200,video,"Video fetched Succesfully")
    )
})

const updateVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const {title,desc} = req.body
    const thumbnailLocalPath = req.file?.path
    let validObject;
    if(isvaidObjectId(videoId)){
        validObject = mongoose.objectId(videoId)
    }else{
        throw new ApiError(400,"Gived videoId is not valid")
    }
    if(!title && !desc){
        throw new ApiError(400,"provide a title and description as well.")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    const video = await Video.findByIdAndUpdate(
       validObject,
       {
        $set:{
            title:title,
            description:desc,
            thumbnail:thumbnail.url,
        }
       },
       {
        new:true,
       }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Thumbnail updated successfully.")
    )

})

const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;

    // check whether the provided videoId is valid or not
    //once we get the videoId , query database 
    let validObject;
    if(isvaidObjectId(videoId)){
        validObject = mongoose.objectId(videoId)
    }else{
        throw new ApiError(400,"Gived videoId is not valid")
    }

    const deletedVideo = await Video.deleteOne(
        {
            _id:validObject,
        }
    )

    return res
    .status(201)
    .json(
        new ApiResponse(201,deleteVideo,"If you are getting the output null the video is deleted succesfully.")
    )
})

const togglePublishStatus = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    const {isPublished} = req.body
    // check whether the provided videoId is valid or not
    //once we get the videoId , query database 
    let validObject;
    if(isvaidObjectId(videoId)){
        validObject = mongoose.objectId(videoId)
    }else{
        throw new ApiError(400,"Gived videoId is not valid")
    }
    if(!isPublished){
        throw new ApiError(401,"Please use true or false to set publish")
    }

    const newVideo = Video.findByIdAndUpdate(
        validObject,
        {
            $set:{
                isPublished:isPublished
            }
        }
    )
    return res.
    status(200)
    .json(
        new ApiResponse(200,newVideo,"Changes made succesfully.")
    )
})


export{
    publishAVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    togglePublishStatus,
    deleteVideo,
}