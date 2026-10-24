// ============================================================
// CAMPUSMART — In-Memory Seed Data (No DB Connection Yet)
// This mirrors the frontend localStorage data structure.
// Replace these arrays with real DB calls when you add MongoDB.
// ============================================================

const users = [
    {
        id: 'usr_seller_1',
        name: 'Aman Verma',
        email: 'aman@campusmart.com',
        phone: '9123456789',
        role: 'seller',
        college: 'Campus Institute of Technology',
        hostel: 'Block A, Room 204',
        rating: 4.9,
        trustScore: 96,
        joinDate: '2026-07-01',
        avatar: null
    },
    {
        id: 'usr_buyer_1',
        name: 'Rahul Sharma',
        email: 'rahul@campusmart.com',
        phone: '9876543210',
        role: 'buyer',
        college: 'Campus Institute of Technology',
        hostel: 'Block C, Room 312',
        rating: 4.7,
        trustScore: 88,
        joinDate: '2026-08-10',
        avatar: null
    },
    {
        id: 'usr_buyer_2',
        name: 'Priya Singh',
        email: 'priya@campusmart.com',
        phone: '9988776655',
        role: 'buyer',
        college: 'Campus Institute of Technology',
        hostel: 'Block B, Room 101',
        rating: 4.8,
        trustScore: 91,
        joinDate: '2026-09-01',
        avatar: null
    }
];

const products = [
    {
        id: 'prod_101',
        name: 'Engineering Mathematics Textbook (3rd Sem)',
        category: 'Academic',
        price: 850,
        originalPrice: 1200,
        condition: 'Good',
        listingType: 'fixed',
        stock: 3,
        sellerId: 'usr_seller_1',
        sellerName: 'Aman Verma',
        sellerPhone: '9123456789',
        sellerRating: 4.9,
        trustScore: 96,
        location: 'Block A, Room 204',
        description: 'Complete Engineering Mathematics textbook for 3rd semester. Minimal highlighting, all pages intact.',
        image: 'assets/images/products/math-book.jpg',
        rating: 4.5,
        bids: [],
        offers: [
            {
                offerId: 'off_seed_1',
                buyerId: 'usr_buyer_1',
                buyerName: 'Rahul Sharma',
                buyerPhone: '9876543210',
                amount: 700,
                status: 'Pending',
                date: '2026-10-22'
            }
        ],
        dateAdded: '2026-10-01',
        views: 45
    },
    {
        id: 'prod_102',
        name: 'HP Pavilion Laptop (8GB RAM, 512GB SSD)',
        category: 'Electronics',
        price: 32000,
        originalPrice: 45000,
        condition: 'Like New',
        listingType: 'fixed',
        stock: 1,
        sellerId: 'usr_seller_1',
        sellerName: 'Aman Verma',
        sellerPhone: '9123456789',
        sellerRating: 4.9,
        trustScore: 96,
        location: 'Block A, Room 204',
        description: 'HP Pavilion 15 laptop, barely used, comes with original charger and bag.',
        image: 'assets/images/products/laptop.jpg',
        rating: 4.8,
        bids: [],
        offers: [
            {
                offerId: 'off_seed_3',
                buyerId: 'usr_buyer_1',
                buyerName: 'Rahul Sharma',
                buyerPhone: '9876543210',
                amount: 28000,
                status: 'Rejected',
                date: '2026-10-20'
            }
        ],
        dateAdded: '2026-10-05',
        views: 120
    },
    {
        id: 'prod_103',
        name: 'Campus Hoodie (Size M/L) - Auction',
        category: 'Fashion',
        price: 400,
        originalPrice: 700,
        condition: 'Good',
        listingType: 'bidding',
        stock: 2,
        currentBid: 450,
        sellerId: 'usr_seller_1',
        sellerName: 'Aman Verma',
        sellerPhone: '9123456789',
        sellerRating: 4.9,
        trustScore: 96,
        location: 'Block A, Room 204',
        description: 'Campus branded hoodie, size M and L available. Used once for a fest.',
        image: 'assets/images/products/hoodie.jpg',
        rating: 4.3,
        bids: [
            {
                bidderId: 'usr_buyer_1',
                bidderName: 'Rahul Sharma',
                amount: 450,
                date: '2026-10-23'
            }
        ],
        offers: [],
        dateAdded: '2026-10-10',
        views: 78
    },
    {
        id: 'prod_104',
        name: 'Scientific Calculator (Casio FX-991)',
        category: 'Academic',
        price: 750,
        originalPrice: 1100,
        condition: 'Like New',
        listingType: 'fixed',
        stock: 5,
        sellerId: 'usr_seller_1',
        sellerName: 'Aman Verma',
        sellerPhone: '9123456789',
        sellerRating: 4.9,
        trustScore: 96,
        location: 'Block A, Room 204',
        description: 'Casio FX-991 scientific calculator. Perfect condition, all functions working.',
        image: 'assets/images/products/calculator.jpg',
        rating: 4.9,
        bids: [],
        offers: [
            {
                offerId: 'off_seed_2',
                buyerId: 'usr_buyer_1',
                buyerName: 'Rahul Sharma',
                buyerPhone: '9876543210',
                amount: 600,
                status: 'Accepted',
                date: '2026-10-21'
            }
        ],
        dateAdded: '2026-10-08',
        views: 92
    }
];

const orders = [
    {
        id: 'ord_001',
        productId: 'prod_104',
        productName: 'Scientific Calculator (Casio FX-991)',
        price: 600,
        quantity: 1,
        totalAmount: 600,
        sellerId: 'usr_seller_1',
        sellerName: 'Aman Verma',
        sellerPhone: '9123456789',
        buyerId: 'usr_buyer_1',
        buyerName: 'Rahul Sharma',
        buyerPhone: '9876543210',
        orderDate: '2026-10-21',
        status: 'Confirmed',
        paymentMethod: 'Campus Cash on Handover',
        rated: false
    }
];

module.exports = { users, products, orders };
