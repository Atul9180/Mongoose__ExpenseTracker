require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fs = require('fs');
const connectDB = require('./utils/database')
const path = require('path')
const helmet = require('helmet');
const morgan = require('morgan');



const app = express();
connectDB();


//middlewares
app.use(cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

//log file
const accessLogstream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogstream }));





//importing routes
const adminRoute = require('./routes/adminRoutes');
const userRoute = require('./routes/userRoutes');
const orderRoute = require('./routes/purchaseRoutes');
const premiumUserRoutes = require('./routes/premiumFeaturesRoutes')
const PasswordRouter = require('./routes/resetPasswordRoutes')


//registering routes to app
app.use(adminRoute);
app.use(userRoute);
app.use(orderRoute);
app.use('/premium', premiumUserRoutes)
app.use('/password', PasswordRouter)




app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public/view/404.html'));
});


const PORT=4000||process.env.PORT;

app.listen(PORT,()=> console.log(`Server running on port ${PORT}`));

