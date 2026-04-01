// src.server.ts
import express, { Application } from 'express';
import cors from 'cors';
import { errorHandler } from './_middleware/errorHandler';
import { initialize } from './_helpers/database';
import userController from './users/users.controller';

const app: Application = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Api Routes (refer to the users.controller.ts for routing /users)
app.use('/users', userController);

// global errorhandler
app.use(errorHandler);

// start server and initialize database
const PORT = process.env.PORT || 4000;

initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log('TEST WITH: POST /users with {email,password...}');
            console.log('ADMIN ACC: admin@example.com pass: admin123');
        });
    })
    .catch((err) => {
        console.error('FAILED TO IINTIAIZE DATABASE:', err);
        process.exit(1);
    })