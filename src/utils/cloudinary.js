import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'; //fs-> file system




const uploadOnCloudinary = async function(localFilePath) {

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_CLOUD_KEY, 
        api_secret: process.env.CLOUDINARY_CLOUD_SECRET // Click 'View API Keys' above to copy your API secret
    });
    
    try {
        if((!localFilePath)) return null;
        //upload file
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //File has been uploaded successfully
        console.log("file is uploaded", response.url)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temp file as the upload operation got failed
        return null;
    }    
};
export {uploadOnCloudinary}