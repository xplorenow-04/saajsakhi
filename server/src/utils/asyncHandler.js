export const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        return Promise.resolve(requestHandler(req,res,next)).catch((error)=>{
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success:false,
                message:error.message,
            })
        })
    }
}

