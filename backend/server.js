// ============================================================
// CAMPUSMART BACKEND — Express API Server
// Port: 5000
// Database: NOT CONNECTED YET (using in-memory seed data)
// Test with: Thunder Client / Postman at http://localhost:5000
// ============================================================

const express = require('express');
const cors = require('cors');

// Route imports
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Middleware imports
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// GLOBAL MIDDLEWARE
// ============================================================
app.use(cors()); // Allow all origins (restrict in production)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logger (for development)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ============================================================
// HEALTH CHECK & API INFO
// ============================================================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🎓 CampusMart API is running!',
        version: '1.0.0',
        status: 'Development Mode (In-Memory Data)',
        database: 'Not connected yet — using seed data',
        endpoints: {
            users:    'http://localhost:5000/api/users',
            products: 'http://localhost:5000/api/products',
            orders:   'http://localhost:5000/api/orders',
            offers:   'http://localhost:5000/api/products/:id/offers',
            bids:     'http://localhost:5000/api/products/:id/bids'
        }
    });
});

app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'CampusMart REST API v1.0',
        availableRoutes: [
            // Users
            { method: 'GET',    path: '/api/users',                          desc: 'Get all users' },
            { method: 'GET',    path: '/api/users/:id',                      desc: 'Get user by ID' },
            { method: 'POST',   path: '/api/users',                          desc: 'Create new user' },
            { method: 'PUT',    path: '/api/users/:id',                      desc: 'Update user' },
            { method: 'DELETE', path: '/api/users/:id',                      desc: 'Delete user' },
            // Products
            { method: 'GET',    path: '/api/products',                       desc: 'Get all products (supports ?category, ?listingType, ?sellerId, ?search)' },
            { method: 'GET',    path: '/api/products/:id',                   desc: 'Get product by ID' },
            { method: 'POST',   path: '/api/products',                       desc: 'Create product listing' },
            { method: 'PUT',    path: '/api/products/:id',                   desc: 'Update product' },
            { method: 'DELETE', path: '/api/products/:id',                   desc: 'Delete product' },
            // Offers
            { method: 'GET',    path: '/api/products/:id/offers',            desc: 'Get all offers on a product' },
            { method: 'POST',   path: '/api/products/:id/offers',            desc: 'Submit a price offer' },
            { method: 'PATCH',  path: '/api/products/:id/offers/:offerId',   desc: 'Accept/Reject offer' },
            { method: 'DELETE', path: '/api/products/:id/offers/:offerId',   desc: 'Cancel an offer' },
            // Bids
            { method: 'GET',    path: '/api/products/:id/bids',              desc: 'Get all bids on auction' },
            { method: 'POST',   path: '/api/products/:id/bids',              desc: 'Place a bid' },
            // Orders
            { method: 'GET',    path: '/api/orders',                         desc: 'Get all orders (supports ?buyerId, ?sellerId, ?status)' },
            { method: 'GET',    path: '/api/orders/:id',                     desc: 'Get order by ID' },
            { method: 'POST',   path: '/api/orders',                         desc: 'Create new order' },
            { method: 'PUT',    path: '/api/orders/:id',                     desc: 'Update order status/rating' },
            { method: 'DELETE', path: '/api/orders/:id',                     desc: 'Cancel & delete order' }
        ]
    });
});

// ============================================================
// API ROUTES
// ============================================================
app.use('/api/users',    userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);

// ============================================================
// ERROR HANDLING (must be last)
// ============================================================
app.use(notFound);
app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║   🎓  CampusMart API Server Started!     ║');
    console.log(`║   🚀  Running at http://localhost:${PORT}   ║`);
    console.log('║   📦  Mode: In-Memory (No DB yet)        ║');
    console.log('║   📋  Docs: http://localhost:5000/api    ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
});

module.exports = app;
