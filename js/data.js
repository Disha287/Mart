/* CAMPUSMART - Initial Data Store & LocalStorage Data Engine */

const SEED_DATA = {
    users: [
        {
            id: 'usr_buyer_1',
            name: 'Rahul Sharma',
            email: 'rahul.s@college.edu',
            password: 'password123',
            role: 'buyer',
            college: 'Campus Institute of Tech (BTech CSE 3rd Year)',
            phone: '9876543210',
            rating: 4.9,
            completedTx: 8,
            trustScore: 95,
            joined: '2025-09-10'
        },
        {
            id: 'usr_seller_1',
            name: 'Aman Verma',
            email: 'aman.v@college.edu',
            password: 'password123',
            role: 'seller',
            college: 'Campus Institute of Tech (BTech ECE 3rd Year)',
            phone: '9123456789',
            rating: 4.8,
            completedTx: 14,
            trustScore: 92,
            joined: '2025-08-15'
        },
        {
            id: 'usr_seller_2',
            name: 'Priya Patel',
            email: 'priya.p@college.edu',
            password: 'password123',
            role: 'seller',
            college: 'Campus Institute of Tech (BTech Mechanical 3rd Year)',
            phone: '9898989898',
            rating: 4.95,
            completedTx: 22,
            trustScore: 98,
            joined: '2025-07-20'
        }
    ],

    products: [
        {
            id: 'prod_101',
            name: 'Casio FX-991EX ClassWiz Scientific Calculator',
            category: 'Academic',
            price: 850,
            originalPrice: 1495,
            condition: 'Like New',
            listingType: 'fixed',
            sellerId: 'usr_seller_1',
            sellerName: 'Aman Verma',
            sellerPhone: '9123456789',
            sellerRating: 4.8,
            trustScore: 92,
            location: 'Hostel Block B, Room 204',
            description: 'Original Casio ClassWiz scientific calculator in mint condition with dual power solar battery. Essential for Engineering Mathematics, Circuit Theory, and Physics.',
            image: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e488?w=600&auto=format&fit=crop&q=80',
            rating: 4.8,
            bids: [],
            offers: [],
            dateAdded: '2026-08-10',
            views: 45
        },
        {
            id: 'prod_102',
            name: 'Engineering Graphics & Drafter Tool Kit',
            category: 'Academic',
            price: 450,
            originalPrice: 900,
            condition: 'Good',
            listingType: 'fixed',
            sellerId: 'usr_seller_2',
            sellerName: 'Priya Patel',
            sellerPhone: '9898989898',
            sellerRating: 4.95,
            trustScore: 98,
            location: 'Girls Hostel 1, Room 108',
            description: 'Complete Engineering Drawing kit containing mini-drafter, set squares, precision compass, roller scale, and protective sheet holder container.',
            image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
            rating: 4.9,
            bids: [],
            offers: [],
            dateAdded: '2026-08-12',
            views: 62
        },
        {
            id: 'prod_103',
            name: 'Dell Latitude Core i5 Laptop (8GB RAM / 256GB SSD)',
            category: 'Electronics',
            price: 14500,
            originalPrice: 35000,
            condition: 'Good',
            listingType: 'bidding',
            currentBid: 14500,
            sellerId: 'usr_seller_1',
            sellerName: 'Aman Verma',
            sellerPhone: '9123456789',
            sellerRating: 4.8,
            trustScore: 92,
            location: 'Hostel Block B, Room 204',
            description: 'Powerful business laptop ideal for programming, VS Code, Python, and AutoCAD. 3+ hours battery life. Includes original charger.',
            image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
            rating: 4.7,
            bids: [
                { bidderId: 'usr_buyer_1', bidderName: 'Rahul Sharma', amount: 14500, date: '2026-08-14' }
            ],
            offers: [],
            dateAdded: '2026-08-13',
            views: 120
        },
        {
            id: 'prod_104',
            name: 'Boat Rockerz 450 Over-Ear Wireless Headphones',
            category: 'Electronics',
            price: 750,
            originalPrice: 1990,
            condition: 'Like New',
            listingType: 'fixed',
            sellerId: 'usr_seller_2',
            sellerName: 'Priya Patel',
            sellerPhone: '9898989898',
            sellerRating: 4.95,
            trustScore: 98,
            location: 'Girls Hostel 1, Room 108',
            description: 'Matte black bluetooth headphones with HD sound and 15-hour battery life. Used for 2 months only. Comes with charging cable.',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
            rating: 4.85,
            bids: [],
            offers: [],
            dateAdded: '2026-08-14',
            views: 38
        },
        {
            id: 'prod_105',
            name: 'Campus Fleece Oversized Winter Hoodie (Navy Blue)',
            category: 'Fashion',
            price: 550,
            originalPrice: 1200,
            condition: 'New',
            listingType: 'fixed',
            sellerId: 'usr_seller_1',
            sellerName: 'Aman Verma',
            sellerPhone: '9123456789',
            sellerRating: 4.8,
            trustScore: 92,
            location: 'Hostel Block B, Room 204',
            description: 'Brand new premium heavyweight fleece hoodie. Super cozy for college library sessions during winter.',
            image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
            rating: 4.6,
            bids: [],
            offers: [],
            dateAdded: '2026-08-15',
            views: 29
        },
        {
            id: 'prod_106',
            name: 'Introduction to Algorithms (CLRS 3rd Edition)',
            category: 'Academic',
            price: 600,
            originalPrice: 1100,
            condition: 'Good',
            listingType: 'fixed',
            sellerId: 'usr_seller_2',
            sellerName: 'Priya Patel',
            sellerPhone: '9898989898',
            sellerRating: 4.95,
            trustScore: 98,
            location: 'Girls Hostel 1, Room 108',
            description: 'Standard textbook for Data Structures & Algorithms, GATE preparation, and coding interviews. Clean pages.',
            image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80',
            rating: 5.0,
            bids: [],
            offers: [],
            dateAdded: '2026-08-15',
            views: 85
        },
        {
            id: 'prod_107',
            name: 'Logitech K380 Multi-Device Wireless Keyboard',
            category: 'Gaming',
            price: 1200,
            originalPrice: 2495,
            condition: 'Like New',
            listingType: 'bidding',
            currentBid: 1200,
            sellerId: 'usr_seller_1',
            sellerName: 'Aman Verma',
            sellerPhone: '9123456789',
            sellerRating: 4.8,
            trustScore: 92,
            location: 'Hostel Block B, Room 204',
            description: 'Connects with laptop, iPad, and smartphone via Bluetooth. Compact size fits easily into college backpacks.',
            image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
            rating: 4.9,
            bids: [],
            offers: [],
            dateAdded: '2026-08-16',
            views: 41
        },
        {
            id: 'prod_108',
            name: 'Touch Control LED Desk Study Lamp',
            category: 'Lifestyle',
            price: 380,
            originalPrice: 850,
            condition: 'Like New',
            listingType: 'fixed',
            sellerId: 'usr_seller_2',
            sellerName: 'Priya Patel',
            sellerPhone: '9898989898',
            sellerRating: 4.95,
            trustScore: 98,
            location: 'Girls Hostel 1, Room 108',
            description: 'Rechargeable LED desk lamp with 3 brightness modes and flexible neck. Essential for late-night hostel study.',
            image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=80',
            rating: 4.8,
            bids: [],
            offers: [],
            dateAdded: '2026-08-16',
            views: 33
        },
        {
            id: 'prod_109',
            name: 'Morphy Richards 50L Hostel Mini Refrigerator',
            category: 'Lifestyle',
            price: 4800,
            originalPrice: 9500,
            condition: 'Good',
            listingType: 'fixed',
            sellerId: 'usr_seller_1',
            sellerName: 'Aman Verma',
            sellerPhone: '9123456789',
            sellerRating: 4.8,
            trustScore: 92,
            location: 'Hostel Block B, Room 204',
            description: 'Compact single-door mini fridge. Chilling compartment works great for beverages, milk, and snacks.',
            image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
            rating: 4.9,
            bids: [],
            offers: [],
            dateAdded: '2026-08-16',
            views: 94
        },
        {
            id: 'prod_110',
            name: 'Fastrack Waterproof College Laptop Backpack',
            category: 'Fashion',
            price: 650,
            originalPrice: 1800,
            condition: 'Like New',
            listingType: 'fixed',
            sellerId: 'usr_seller_2',
            sellerName: 'Priya Patel',
            sellerPhone: '9898989898',
            sellerRating: 4.95,
            trustScore: 98,
            location: 'Girls Hostel 1, Room 108',
            description: 'Ergonomic 30L college bag with dedicated 15.6 inch padded laptop compartment and rain cover.',
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
            rating: 4.8,
            bids: [],
            offers: [],
            dateAdded: '2026-08-17',
            views: 50
        },
        {
            id: 'prod_111',
            name: 'Hero Hawk 21-Speed City Gear Bicycle',
            category: 'Lifestyle',
            price: 3200,
            originalPrice: 7500,
            condition: 'Good',
            listingType: 'bidding',
            currentBid: 3200,
            sellerId: 'usr_seller_1',
            sellerName: 'Aman Verma',
            sellerPhone: '9123456789',
            sellerRating: 4.8,
            trustScore: 92,
            location: 'Hostel Cycle Parking Block C',
            description: 'Lightweight alloy frame cycle for commuting between campus departments and hostels. Smooth Shimano gears.',
            image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80',
            rating: 4.75,
            bids: [],
            offers: [],
            dateAdded: '2026-08-17',
            views: 110
        },
        {
            id: 'prod_112',
            name: 'Cotton White Lab Coat & Safety Goggles Set',
            category: 'Academic',
            price: 320,
            originalPrice: 700,
            condition: 'Like New',
            listingType: 'fixed',
            sellerId: 'usr_seller_2',
            sellerName: 'Priya Patel',
            sellerPhone: '9898989898',
            sellerRating: 4.95,
            trustScore: 98,
            location: 'Girls Hostel 1, Room 108',
            description: '100% pure cotton white lab coat for Chemistry and Workshop labs. Includes anti-fog safety glasses.',
            image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
            rating: 4.85,
            bids: [],
            offers: [],
            dateAdded: '2026-08-17',
            views: 40
        }
    ],

    tuckShop: [
        {
            id: 'tuck_01',
            name: 'A4 Spiral Notebook Set (Classmate 300 Pages x 3)',
            category: 'Notebooks',
            price: 240,
            stock: 50,
            image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop&q=80',
            description: 'High-grade 70GSM white paper with durable poly cover.'
        },
        {
            id: 'tuck_02',
            name: 'Gel Pen Box (Pentel EnerGel 0.7mm Blue - 5 Pack)',
            category: 'Pens',
            price: 180,
            stock: 35,
            image: 'https://images.unsplash.com/photo-1585336261026-875a60a1c96b?w=600&auto=format&fit=crop&q=80',
            description: 'Smooth quick-dry gel ink ideal for fast exam writing.'
        },
        {
            id: 'tuck_03',
            name: 'BTech Engineering Practical Sheet Bundle (100 Sheets)',
            category: 'Practical Sheets',
            price: 120,
            stock: 100,
            image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80',
            description: 'Standard 80GSM ruled practical pages with margin.'
        },
        {
            id: 'tuck_04',
            name: 'Faber-Castell Highlighter Set (4 Pastel Colors)',
            category: 'Highlighters',
            price: 110,
            stock: 40,
            image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80',
            description: 'Smudge-proof soft pastel highlighters for textbook marking.'
        },
        {
            id: 'tuck_05',
            name: 'Sticky Notes Combo (3x3 Yellow & Index Flags)',
            category: 'Sticky Notes',
            price: 85,
            stock: 60,
            image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&auto=format&fit=crop&q=80',
            description: 'Self-adhesive note pads for campus project indexing.'
        },
        {
            id: 'tuck_06',
            name: 'Transparent Hard Board Lab File Holder',
            category: 'Files',
            price: 95,
            stock: 25,
            image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
            description: 'Waterproof cobra file folder for keeping lab records safe.'
        }
    ],

    serviceCategories: [
        { id: 'cat_1', title: 'Academic & Books', icon: '📚', desc: 'Textbooks, lab manuals, drafters, and calculators.' },
        { id: 'cat_2', title: 'Electronics & Tech', icon: '💻', desc: 'Laptops, headphones, keyboards, and OS formatting.' },
        { id: 'cat_3', title: 'Clothing & Fashion', icon: '👕', desc: 'Hoodies, backpacks, custom college apparel, styling.' },
        { id: 'cat_4', title: 'Food & Snacks', icon: '🍔', desc: 'Hostel cakes, late night snacks, tiffin & treat coordination.' },
        { id: 'cat_5', title: 'Birthday & Celebrations', icon: '🎂', desc: 'Surprise party setup, decorations, and custom cakes.' },
        { id: 'cat_6', title: 'Lifestyle & Hostel', icon: '🏠', desc: 'Mini fridges, bicycles, study lamps, hostel room gear.' },
        { id: 'cat_7', title: 'Gaming & Sports', icon: '🎮', desc: 'Gaming gear, sports rackets, consoles, and controllers.' },
        { id: 'cat_8', title: 'Design & Creative', icon: '🎨', desc: 'Poster design, Canva slide decks, video editing, UI mockups.' },
        { id: 'cat_9', title: 'Hardware / Technical Help', icon: '🔧', desc: 'Arduino soldering, PC cleaning, 3D printing assistance.' }
    ],

    serviceProviders: [
        {
            id: 'srv_prov_1',
            name: 'Karan Malhotra',
            category: 'Electronics & Tech',
            skills: ['Python', 'Web Dev', 'Linux OS', 'RAM/SSD Upgrade'],
            description: '3rd Year CSE student specializing in laptop formatting, dual-boot Linux setup, and Python script debugging.',
            startingPrice: 199,
            experience: '2+ Years Campus Tech Support',
            rating: 4.9,
            trustScore: 96,
            completedCount: 34,
            phone: '9811223344',
            image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80'
        },
        {
            id: 'srv_prov_2',
            name: 'Sneha Kapoor',
            category: 'Design & Creative',
            skills: ['Figma', 'Photoshop', 'Canva', 'PPT Presentations'],
            description: 'Designed posters for main college fest. Expert in sleek presentation slide decks and logo creation.',
            startingPrice: 250,
            experience: 'Fest Creative Head',
            rating: 4.95,
            trustScore: 99,
            completedCount: 52,
            phone: '9877665544',
            image: 'https://images.unsplash.com/photo-1542744094-3a312169528f?w=600&auto=format&fit=crop&q=80'
        },
        {
            id: 'srv_prov_3',
            name: 'Rohan Gupta',
            category: 'Hardware / Technical Help',
            skills: ['Arduino', 'Raspberry Pi', 'Circuit Design', 'Soldering'],
            description: 'ECE student offering hardware project assembly, component soldering, and micro-controller debugging.',
            startingPrice: 300,
            experience: 'Robotics Club Lead',
            rating: 4.85,
            trustScore: 94,
            completedCount: 21,
            phone: '9988776655',
            image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'
        },
        {
            id: 'srv_prov_4',
            name: 'Ananya Sharma (Campus Bakes)',
            category: 'Birthday & Celebrations',
            skills: ['Custom Cakes', 'Hostel Delivery', 'Party Decor'],
            description: 'Fresh homemade chocolate and red velvet cakes baked for hostel birthdays and celebrations.',
            startingPrice: 350,
            experience: '50+ Birthday Cakes Delivered',
            rating: 5.0,
            trustScore: 98,
            completedCount: 48,
            phone: '9822110099',
            image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80'
        }
    ],

    academicRequests: [
        {
            id: 'req_301',
            title: 'Need Guidance for 3rd Year DBMS Mini Project',
            category: 'Software',
            skills: ['SQL', 'HTML/CSS', 'PHP/JS'],
            budget: 800,
            deadline: '2026-08-25',
            studentName: 'Rahul Sharma',
            studentPhone: '9876543210',
            description: 'Looking for a senior or peer to explain ER diagrams and assist in setting up database queries for Library Management system.',
            datePosted: '2026-08-16'
        },
        {
            id: 'req_302',
            title: 'Circuit Simulation Help in MATLAB / Proteus',
            category: 'Hardware',
            skills: ['MATLAB', 'Proteus', 'Signal Processing'],
            budget: 600,
            deadline: '2026-08-22',
            studentName: 'Ananya Roy',
            studentPhone: '9822334455',
            description: 'Need assistance in plotting filter frequency response graphs for lab submission.',
            datePosted: '2026-08-17'
        }
    ],

    orders: [
        {
            id: 'ord_901',
            productId: 'prod_101',
            productName: 'Casio FX-991EX ClassWiz Scientific Calculator',
            price: 850,
            quantity: 1,
            sellerName: 'Aman Verma',
            sellerPhone: '9123456789',
            buyerId: 'usr_buyer_1',
            buyerName: 'Rahul Sharma',
            date: '2026-08-15',
            status: 'Completed',
            rated: true,
            ratingGiven: 5
        }
    ],

    donations: [
        {
            id: 'don_101',
            itemName: 'Old Engineering Drawing Board',
            category: 'Academic',
            description: 'A wooden drawing board used for ED class. In decent condition, totally free to anyone who needs it.',
            donorName: 'Rahul Sharma',
            donorPhone: '9876543210',
            receiverName: null,
            receiverPhone: null,
            status: 'Available',
            datePosted: '2026-08-20',
            image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
        },
        {
            id: 'don_102',
            itemName: 'Set of 1st Year Textbooks',
            category: 'Academic',
            description: 'Includes Physics, Maths, and Basic Electrical Engineering books. Some pages are highlighted.',
            donorName: 'Aman Verma',
            donorPhone: '9123456789',
            receiverName: 'Priya Patel',
            receiverPhone: '9898989898',
            status: 'Claimed',
            datePosted: '2026-08-21',
            image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80'
        }
    ],

    wishlist: ['prod_104'],
    cart: [
        { productId: 'prod_102', quantity: 1 }
    ]
};

function initDatabase(forceReset = false) {
    if (forceReset || !localStorage.getItem('cm_initialized')) {
        localStorage.setItem('cm_users', JSON.stringify(SEED_DATA.users));
        localStorage.setItem('cm_products', JSON.stringify(SEED_DATA.products));
        localStorage.setItem('cm_tuckshop', JSON.stringify(SEED_DATA.tuckShop));
        localStorage.setItem('cm_service_categories', JSON.stringify(SEED_DATA.serviceCategories));
        localStorage.setItem('cm_service_providers', JSON.stringify(SEED_DATA.serviceProviders));
        localStorage.setItem('cm_academic_requests', JSON.stringify(SEED_DATA.academicRequests));
        localStorage.setItem('cm_orders', JSON.stringify(SEED_DATA.orders));
        localStorage.setItem('cm_donations', JSON.stringify(SEED_DATA.donations));
        localStorage.setItem('cm_wishlist', JSON.stringify(SEED_DATA.wishlist));
        localStorage.setItem('cm_cart', JSON.stringify(SEED_DATA.cart));
        localStorage.setItem('cm_initialized', 'true');
    }
}

// Initialize Data Engine (Preserves user state once initialized)
initDatabase(false);
