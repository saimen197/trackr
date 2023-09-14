require('dotenv').config({ path: './w3s-dynamic-storage/.env' });
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser'); 
const app = express();
const errorMiddleware = require('./middleware/errorMiddleware');
const initializeDatabase = require('./db/initDb.js');

initializeDatabase();

app.use(cors({credentials:true}));
app.use(morgan('dev'));
app.use(cookieParser()); 
app.use(express.json()); 

// Import route modules
const mealRoutes = require('./routes/mealRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const userRoutes = require('./routes/userRoutes');
const intakeRoutes = require('./routes/intakeRoutes');

// Use  routes
app.use('/api/meals', mealRoutes);
app.use('/api/ingredients', ingredientRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/intake', intakeRoutes);

app.use(errorMiddleware);

app.use((req, res) => {
    res.status(404).send("Not Found");
});

const clientApp = express();
clientApp.use(express.static('dist'));
clientApp.use(express.json());

clientApp.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../dist', 'index.html'));
});

app.listen(process.env.PORT || 3000, () => console.log(`Listening on port ${process.env.PORT || 3000}!`));

if (process.env.NODE_ENV !== 'development') {
  clientApp.listen(8000, () => console.log('client listening on port 8000'));
}