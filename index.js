import express from 'express';
import cors from 'cors';

//middleware /////////////////////////////////////////////////////////
import authenticateToken from './middleware/auth/authenticateToken.js';
import authorizeRoles from './middleware/auth/authorizeRoles.js';
//////////////////////////////////////////////////////////////////////

//routes //////////////////////////////////
import auth from './routes/auth.js';
import users from './routes/users.js';
import customers from './routes/customers.js';
import expenses from './routes/expenses.js';
import services from './routes/services.js';
import discounts from './routes/discount.js';
import order from './routes/order.js';
///////////////////////////////////////////
const app = express();

app.use(cors());
app.use(express.json());

//Auth entry point
app.use('/auth', auth);

//protected routes
app.use(authenticateToken);
app.use('/api/users', authorizeRoles(['admin']), users);
app.use('/api/customers', customers); //authorization handled seperately in route for finer control
app.use('/api/expenses', authorizeRoles(['admin', 'manager']), expenses); //more authorization handled seperately in route for finer control
app.use('/api/services', services); //more authorization handled seperately in route for finer control
app.use('/api/discounts', discounts);
app.use('/api/orders', order);

app.listen(process.env.PORT, () =>
  console.log(`Backend running on http://localhost:${process.env.PORT}`)
);
