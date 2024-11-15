const asyncHandler =(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).reject((err)=>next(err))
    }
}

export {asyncHandler}



// const asyncHandler = ()=>{} //Normal callback function
// const asyncHandler =(func)=>{ ()=>{} } // passing a function as argument to another function
// const asyncHandler =(func)=>{ async ()=>{} } 
// const asyncHandler =(func)=> ()=>{}  // we can remove the outer curly braces

// const asyncHandler =(func)=>{ async(req,res,next)=>{
//     try {
//         await func(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message: error.message
//         })
//     }
// } }