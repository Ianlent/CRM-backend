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
///////////////////////////////////////////
const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticateToken);

app.use('/auth', auth);
app.use('/api/users', authorizeRoles(['admin']), users)
app.use('/api/customers', customers) //authorization handled seperately in route for finer control



app.listen(process.env.PORT, () =>
  console.log(`Backend running on http://localhost:${process.env.PORT}`)
);
