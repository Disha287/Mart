const express = require('express');
const cors = require('cors');

const config = require('./config/config');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const { errorHandler, notFound } = require('./middleware/errorHandler');
const { requireVerifiedUser } = require('./middleware/authMiddleware');

const app = express();
const PORT = config.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🎓 CampusMart API is running (MVC Architecture)!',
        version: '1.0.0',
        architecture: 'MVC (Models, Views/FrontEnd, Controllers)',
        endpoints: {
            auth:     `http://localhost:${PORT}/api/auth`,
            users:    `http://localhost:${PORT}/api/users`,
            products: `http://localhost:${PORT}/api/products`,
            orders:   `http://localhost:${PORT}/api/orders`,
            offers:   `http://localhost:${PORT}/api/products/:id/offers`,
            bids:     `http://localhost:${PORT}/api/products/:id/bids`
        }
    });
});

app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'CampusMart REST API v1.0',
        architecture: 'Model-View-Controller (MVC)',
        availableRoutes: [
            { method: 'GET',    path: '/api/users',                          desc: 'Get all users' },
            { method: 'GET',    path: '/api/users/:id',                      desc: 'Get user by ID' },
            { method: 'POST',   path: '/api/users',                          desc: 'Create new user' },
            { method: 'PUT',    path: '/api/users/:id',                      desc: 'Update user' },
            { method: 'DELETE', path: '/api/users/:id',                      desc: 'Delete user' },
            { method: 'GET',    path: '/api/products',                       desc: 'Get all products (supports ?category, ?listingType, ?sellerId, ?search)' },
            { method: 'GET',    path: '/api/products/:id',                   desc: 'Get product by ID' },
            { method: 'POST',   path: '/api/products',                       desc: 'Create product listing' },
            { method: 'PUT',    path: '/api/products/:id',                   desc: 'Update product' },
            { method: 'DELETE', path: '/api/products/:id',                   desc: 'Delete product' },
            { method: 'GET',    path: '/api/products/:id/offers',            desc: 'Get all offers on a product' },
            { method: 'POST',   path: '/api/products/:id/offers',            desc: 'Submit a price offer' },
            { method: 'PATCH',  path: '/api/products/:id/offers/:offerId',   desc: 'Accept/Reject offer' },
            { method: 'DELETE', path: '/api/products/:id/offers/:offerId',   desc: 'Cancel an offer' },
            { method: 'GET',    path: '/api/products/:id/bids',              desc: 'Get all bids on auction' },
            { method: 'POST',   path: '/api/products/:id/bids',              desc: 'Place a bid' },
            { method: 'GET',    path: '/api/orders',                         desc: 'Get all orders (supports ?buyerId, ?sellerId, ?status)' },
            { method: 'GET',    path: '/api/orders/:id',                     desc: 'Get order by ID' },
            { method: 'POST',   path: '/api/orders',                         desc: 'Create new order' },
            { method: 'PUT',    path: '/api/orders/:id',                     desc: 'Update order status/rating' },
            { method: 'DELETE', path: '/api/orders/:id',                     desc: 'Cancel & delete order' }
        ]
    });
});

app.use('/api/auth',     authRoutes);
app.use('/api',          authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/products', requireVerifiedUser, productRoutes);
app.use('/api/orders',   requireVerifiedUser, orderRoutes);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`CampusMart API running at http://localhost:${PORT}`);
            console.log(`API documentation: http://localhost:${PORT}/api`);
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`\n❌ [PORT ERROR] Port ${PORT} is already in use.`);
                console.error(`   Another instance of CampusMart or another service is listening on port ${PORT}.`);
                console.error(`   To free port ${PORT} on Windows:`);
                console.error(`   1. netstat -ano | findstr :${PORT}`);
                console.error(`   2. taskkill /PID <PID> /F\n`);
                process.exit(1);
            } else {
                console.error(`❌ [SERVER ERROR] ${error.message}`);
                process.exit(1);
            }
        });
    } catch (error) {
        console.error("Failed to start CampusMart:", error.message);
        process.exit(1);
    }
}

startServer();

module.exports = app;
