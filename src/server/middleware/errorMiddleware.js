module.exports = function(err, req, res, next) {
    console.error(err.stack); // Logs the stack trace of the error for debugging

    // If the error has a status, it's a custom error we've thrown elsewhere in our app
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
