module.exports = function(err, req, res, next) {
    console.error(err.stack); 

    // If the error has a status, it's a custom error thrown elsewhere in the app
    if (err.status && err.message) {
        res.status(err.status).json({
            status: 'error',
            message: err.message
        });
    } else {
        // Handle unexpected errors
        if (process.env.NODE_ENV === 'development') {
            // In development, send detailed error
            res.status(500).json({ 
                status: 'error',
                message: err.message,
                stack: err.stack 
            });
        } else {
            // In production, send generic message
            res.status(500).json({
                status: 'error',
                message: 'Internal Server Error'
            });
        }
    }
}
