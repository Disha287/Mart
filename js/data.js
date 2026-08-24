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
            image: 'assets/images/products/unsplash_calculator.jpg',
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
            image: 'assets/images/products/unsplash_1e0102cf079e37ca2e76ba09b47428d6.jpg',
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
            image: 'assets/images/products/unsplash_a26afdbeb7d3d73a8bd6d237b34ae67f.jpg',
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
            image: 'assets/images/products/unsplash_2149c8d4f35a9b1eda9cc4dd288ffac9.jpg',
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
            image: 'assets/images/products/unsplash_d4be6a5d4fb91c2253b74298ab0e99aa.jpg',
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
            image: 'assets/images/products/unsplash_99314150f350391035b8f0eb96fc95e3.jpg',
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
            image: 'assets/images/products/unsplash_ee3eada207cb02462d51f9b6943d37f9.jpg',
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
            image: 'assets/images/products/unsplash_a4a675ae6a506c093b7ef83a0c6b70a4.jpg',
            rating: 4.8,
            bids: [],
            offers: [],
            dateAdded: '2026-08-16',
            views: 33
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
            image: 'assets/images/products/unsplash_f28c40be5298668788f7e7ce7a9379c3.jpg',
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
            image: 'assets/images/products/unsplash_18488bc8fb9e5561368b8f9fd5a15518.jpg',
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
            image: 'assets/images/products/unsplash_70e252f67d1190dfdba35cb837c5e6ce.jpg',
            rating: 4.85,
            bids: [],
            offers: [],
            dateAdded: '2026-08-17',
            views: 40
        },
        {
            id: 'prod_113',
            name: 'Apple iPad Air (5th Gen, 64GB WiFi - Blue)',
            category: 'Electronics',
            price: 32000,
            originalPrice: 54900,
            condition: 'Like New',
            listingType: 'fixed',
            sellerId: 'usr_seller_1',
            sellerName: 'Rohan Mehra',
            sellerPhone: '9811223344',
            sellerRating: 4.8,
            trustScore: 94,
            location: 'Hostel Block A, Room 405',
            description: 'Apple iPad Air 5 with M1 chip. Immaculate condition, no scratches. Comes with box, charger, and a free compatible magnetic stylus pen.',
            image: 'assets/images/products/unsplash_ipad.jpg',
            rating: 4.9,
            bids: [],
            offers: [],
            dateAdded: '2026-08-18',
            views: 85
        },
        {
            id: 'prod_114',
            name: 'Classic Wooden Guitar (Yamaha F310)',
            category: 'Lifestyle',
            price: 4800,
            originalPrice: 9500,
            condition: 'Good',
            listingType: 'fixed',
            sellerId: 'usr_seller_2',
            sellerName: 'Simranpreet Singh',
            sellerPhone: '9877665544',
            sellerRating: 4.9,
            trustScore: 95,
            location: 'Hostel Block C, Room 12',
            description: 'Yamaha acoustic guitar with rich tone. Slightly worn on the fretboard but plays beautifully. Includes guitar bag and 3 plectrums.',
            image: 'assets/images/products/unsplash_guitar.jpg',
            rating: 4.7,
            bids: [],
            offers: [],
            dateAdded: '2026-08-19',
            views: 62
        },
        {
            id: 'prod_115',
            name: 'Ergonomic Study Chair with Mesh Back',
            category: 'Lifestyle',
            price: 1500,
            originalPrice: 3500,
            condition: 'Fair',
            listingType: 'fixed',
            sellerId: 'usr_seller_1',
            sellerName: 'Nikhil Gupta',
            sellerPhone: '9811223344',
            sellerRating: 4.75,
            trustScore: 90,
            location: 'Hostel Block B, Room 102',
            description: 'Adjustable study chair with breathable mesh back support. Hydraulics and wheels work perfectly. Slight fabric wear.',
            image: 'assets/images/products/unsplash_chair.jpg',
            rating: 4.5,
            bids: [],
            offers: [],
            dateAdded: '2026-08-20',
            views: 48
        },
        {
            id: 'prod_116',
            name: 'Mechanics of Materials Textbook (Gere & Goodno)',
            category: 'Academic',
            price: 350,
            originalPrice: 850,
            condition: 'Good',
            listingType: 'fixed',
            sellerId: 'usr_seller_2',
            sellerName: 'Divya Sharma',
            sellerPhone: '9877665544',
            sellerRating: 4.9,
            trustScore: 97,
            location: 'Girls Hostel 2, Room 302',
            description: 'Standard textbook for Mechanical and Civil engineering. No pages torn, very few pencil marks. Ready for next semester.',
            image: 'assets/images/products/unsplash_textbook.jpg',
            rating: 4.6,
            bids: [],
            offers: [],
            dateAdded: '2026-08-21',
            views: 29
        },
        {
            id: 'prod_117',
            name: 'Wacom Intuos Drawing Tablet (Small)',
            category: 'Design & Creative',
            price: 2500,
            originalPrice: 4200,
            condition: 'Good',
            listingType: 'fixed',
            sellerId: 'usr_seller_1',
            sellerName: 'Aman Verma',
            sellerPhone: '9123456789',
            sellerRating: 4.8,
            trustScore: 92,
            location: 'Hostel Block B, Room 204',
            description: 'Used for two semesters for a design elective. Works perfectly, includes original pen and cable.',
            image: 'assets/images/products/prod_wacom.png',
            rating: 4.8,
            bids: [],
            offers: [],
            dateAdded: '2026-08-22',
            views: 42,
            stock: 1
        },
        {
            id: 'prod_118',
            name: 'Digital Multimeter & Soldering Iron Kit',
            category: 'Electronics',
            price: 450,
            originalPrice: 850,
            condition: 'Like New',
            listingType: 'fixed',
            sellerId: 'usr_seller_2',
            sellerName: 'Priya Patel',
            sellerPhone: '9898989898',
            sellerRating: 4.95,
            trustScore: 98,
            location: 'Girls Hostel 1, Room 108',
            description: 'Complete basic electronics kit. Bought for ECE mini project, barely used.',
            image: 'assets/images/products/prod_multimeter.png',
            rating: 4.9,
            bids: [],
            offers: [],
            dateAdded: '2026-08-22',
            views: 15,
            stock: 2
        },
        {
            id: 'prod_119',
            name: 'Dell 24-inch Monitor (FHD, 75Hz)',
            category: 'Electronics',
            price: 4500,
            originalPrice: 9000,
            condition: 'Good',
            listingType: 'bidding',
            currentBid: 4500,
            sellerId: 'usr_seller_1',
            sellerName: 'Rohan Mehra',
            sellerPhone: '9811223344',
            sellerRating: 4.8,
            trustScore: 94,
            location: 'Hostel Block A, Room 405',
            description: 'Great for a dual-monitor coding setup in your hostel. No dead pixels.',
            image: 'assets/images/products/prod_monitor.png',
            rating: 4.7,
            bids: [],
            offers: [],
            dateAdded: '2026-08-23',
            views: 120,
            stock: 1
        },
        {
            id: 'prod_120',
            name: 'JBL Go 3 Portable Bluetooth Speaker',
            category: 'Electronics',
            price: 1800,
            originalPrice: 2999,
            condition: 'Like New',
            listingType: 'fixed',
            sellerId: 'usr_seller_2',
            sellerName: 'Simranpreet Singh',
            sellerPhone: '9877665544',
            sellerRating: 4.9,
            trustScore: 95,
            location: 'Hostel Block C, Room 12',
            description: 'Waterproof compact speaker. Great bass. Barely used.',
            image: 'assets/images/products/prod_jbl.png',
            rating: 4.8,
            bids: [],
            offers: [],
            dateAdded: '2026-08-23',
            views: 55,
            stock: 1
        },
        {
            id: 'prod_121',
            name: 'Pigeon 1.5L Electric Kettle',
            category: 'Lifestyle',
            price: 350,
            originalPrice: 650,
            condition: 'Fair',
            listingType: 'fixed',
            sellerId: 'usr_seller_1',
            sellerName: 'Nikhil Gupta',
            sellerPhone: '9811223344',
            sellerRating: 4.75,
            trustScore: 90,
            location: 'Hostel Block B, Room 102',
            description: 'The ultimate hostel survivor item. Works perfectly for Maggi and coffee.',
            image: 'assets/images/products/prod_kettle.png',
            rating: 4.5,
            bids: [],
            offers: [],
            dateAdded: '2026-08-23',
            views: 88,
            stock: 1
        },
        {
            id: 'prod_122',
            name: 'Hostel Single Bed Mattress (Cotton)',
            category: 'Lifestyle',
            price: 600,
            originalPrice: 1200,
            condition: 'Good',
            listingType: 'fixed',
            sellerId: 'usr_seller_2',
            sellerName: 'Divya Sharma',
            sellerPhone: '9877665544',
            sellerRating: 4.9,
            trustScore: 97,
            location: 'Girls Hostel 2, Room 302',
            description: 'Clean cotton mattress, used for one year. Moving out so selling it cheap.',
            image: 'assets/images/products/prod_mattress.png',
            rating: 4.6,
            bids: [],
            offers: [],
            dateAdded: '2026-08-24',
            views: 34,
            stock: 1
        },
        {
            id: 'prod_123',
            name: 'UNO & Monopoly Board Game Combo',
            category: 'Electronics',
            price: 400,
            originalPrice: 800,
            condition: 'Good',
            listingType: 'fixed',
            sellerId: 'usr_seller_1',
            sellerName: 'Aman Verma',
            sellerPhone: '9123456789',
            sellerRating: 4.8,
            trustScore: 92,
            location: 'Hostel Block B, Room 204',
            description: 'Hostel game night essentials. All cards and pieces are intact.',
            image: 'assets/images/products/prod_uno.png',
            rating: 4.8,
            bids: [],
            offers: [],
            dateAdded: '2026-08-24',
            views: 45,
            stock: 1
        },
        {
            id: 'prod_124',
            name: 'Optimum Nutrition Whey Protein (Unopened, 1kg)',
            category: 'Food',
            price: 2800,
            originalPrice: 3500,
            condition: 'New',
            listingType: 'fixed',
            sellerId: 'usr_seller_2',
            sellerName: 'Priya Patel',
            sellerPhone: '9898989898',
            sellerRating: 4.95,
            trustScore: 98,
            location: 'Girls Hostel 1, Room 108',
            description: 'Double chocolate flavor. Completely sealed. Bought an extra tub by mistake.',
            image: 'assets/images/products/prod_protein.png',
            rating: 5.0,
            bids: [],
            offers: [],
            dateAdded: '2026-08-24',
            views: 65,
            stock: 1
        },
        {
            id: 'prod_125',
            name: 'Black Formal Placement Shoes (Size 9)',
            category: 'Fashion',
            price: 800,
            originalPrice: 1600,
            condition: 'Like New',
            listingType: 'fixed',
            sellerId: 'usr_seller_1',
            sellerName: 'Rohan Mehra',
            sellerPhone: '9811223344',
            sellerRating: 4.8,
            trustScore: 94,
            location: 'Hostel Block A, Room 405',
            description: 'Worn only once for placement interviews. Very comfortable.',
            image: 'assets/images/products/prod_shoes.png',
            rating: 4.9,
            bids: [],
            offers: [],
            dateAdded: '2026-08-24',
            views: 22,
            stock: 1
        },
        {
            id: 'prod_126',
            name: 'Adjustable Dumbbells Set (10kg)',
            category: 'Lifestyle',
            price: 700,
            originalPrice: 1500,
            condition: 'Good',
            listingType: 'fixed',
            sellerId: 'usr_seller_2',
            sellerName: 'Simranpreet Singh',
            sellerPhone: '9877665544',
            sellerRating: 4.9,
            trustScore: 95,
            location: 'Hostel Block C, Room 12',
            description: 'Perfect for hostel room workouts. Includes 4 plates of 2.5kg each.',
            image: 'assets/images/products/prod_dumbbells.png',
            rating: 4.7,
            bids: [],
            offers: [],
            dateAdded: '2026-08-25',
            views: 89,
            stock: 1
        },
        {
            id: 'prod_127',
            name: 'LED Fairy Lights (10 Meters, Warm White)',
            category: 'Birthday & Events',
            price: 150,
            originalPrice: 300,
            condition: 'Like New',
            listingType: 'fixed',
            sellerId: 'usr_seller_1',
            sellerName: 'Nikhil Gupta',
            sellerPhone: '9811223344',
            sellerRating: 4.75,
            trustScore: 90,
            location: 'Hostel Block B, Room 102',
            description: 'Perfect for hostel room birthday decorations. Warm white color, plug-in type.',
            image: 'assets/images/products/prod_fairylights.png',
            rating: 4.8,
            bids: [],
            offers: [],
            dateAdded: '2026-08-25',
            views: 45,
            stock: 2
        },
        {
            id: 'prod_128',
            name: '"Happy Birthday" Foil Balloon Banner Set',
            category: 'Birthday & Events',
            price: 100,
            originalPrice: 250,
            condition: 'Good',
            listingType: 'fixed',
            sellerId: 'usr_seller_2',
            sellerName: 'Divya Sharma',
            sellerPhone: '9877665544',
            sellerRating: 4.9,
            trustScore: 97,
            location: 'Girls Hostel 2, Room 302',
            description: 'Golden foil balloons. Used once, deflated carefully. Includes string.',
            image: 'assets/images/products/prod_balloons_new.jpg',
            rating: 4.5,
            bids: [],
            offers: [],
            dateAdded: '2026-08-25',
            views: 20,
            stock: 1
        },
        {
            id: 'prod_129',
            name: 'Party Props & Photo Booth Accessories',
            category: 'Birthday & Events',
            price: 120,
            originalPrice: 300,
            condition: 'Good',
            listingType: 'fixed',
            sellerId: 'usr_seller_1',
            sellerName: 'Rohan Mehra',
            sellerPhone: '9811223344',
            sellerRating: 4.8,
            trustScore: 94,
            location: 'Hostel Block A, Room 405',
            description: 'Fun glasses, mustaches on sticks, and hats for birthday parties.',
            image: 'assets/images/products/prod_props_new.jpg',
            rating: 4.6,
            bids: [],
            offers: [],
            dateAdded: '2026-08-25',
            views: 31,
            stock: 1
        }
    ],
    
    donations: [
        {
            id: 'don_101',
            itemName: 'Bundle of A4 One-Side Used Sheets',
            category: 'Stationery',
            description: 'A huge stack of printed assignments. The back side is completely blank, great for rough work and math practice.',
            donorName: 'Aman Verma',
            donorPhone: '9123456789',
            receiverName: null,
            receiverPhone: null,
            status: 'Available',
            datePosted: '2026-08-24',
            image: 'assets/images/products/unsplash_2a947a63bf0ac0f1a48d91a39816b8cf.jpg'
        },
        {
            id: 'don_102',
            itemName: 'Slightly Torn White Lab Coat',
            category: 'Clothing',
            description: 'Used for chemistry lab. Has a small tear near the pocket and some faint stains, but perfectly usable.',
            donorName: 'Priya Patel',
            donorPhone: '9898989898',
            receiverName: null,
            receiverPhone: null,
            status: 'Available',
            datePosted: '2026-08-23',
            image: 'assets/images/products/unsplash_a26afdbeb7d3d73a8bd6d237b34ae67f.jpg'
        },
        {
            id: 'don_103',
            itemName: 'Old Fiction Novels (Assorted)',
            category: 'Books',
            description: '3 paperback fiction books. Spines are creased. Free for any reading enthusiast!',
            donorName: 'Rahul Sharma',
            donorPhone: '9811223344',
            receiverName: null,
            receiverPhone: null,
            status: 'Available',
            datePosted: '2026-08-25',
            image: 'assets/images/products/unsplash_textbook.jpg'
        },
        {
            id: 'don_104',
            itemName: 'Half-used Poster Colors Set',
            category: 'Art Supplies',
            description: '6 small glass jars of Camel poster colors. Some are half empty, but not dried up. Good for a quick project.',
            donorName: 'Divya Sharma',
            donorPhone: '9877665544',
            receiverName: null,
            receiverPhone: null,
            status: 'Available',
            datePosted: '2026-08-25',
            image: 'assets/images/products/unsplash_designer.jpg'
        }
    ],

    tuckShop: [
        {
            id: 'tuck_01',
            name: 'A4 Spiral Notebook Set (Classmate 300 Pages x 3)',
            category: 'Notebooks',
            price: 240,
            stock: 50,
            image: 'assets/images/products/unsplash_c16251f158ed026245b071ebfcf1579a.jpg',
            description: 'High-grade 70GSM white paper with durable poly cover.'
        },
        {
            id: 'tuck_02',
            name: 'Gel Pen Box (Pentel EnerGel 0.7mm Blue - 5 Pack)',
            category: 'Pens',
            price: 180,
            stock: 35,
            image: 'assets/images/products/unsplash_pens.jpg',
            description: 'Smooth quick-dry gel ink ideal for fast exam writing.'
        },
        {
            id: 'tuck_03',
            name: 'BTech Engineering Practical Sheet Bundle (100 Sheets)',
            category: 'Practical Sheets',
            price: 120,
            stock: 100,
            image: 'assets/images/products/unsplash_2a947a63bf0ac0f1a48d91a39816b8cf.jpg',
            description: 'Standard 80GSM ruled practical pages with margin.'
        },
        {
            id: 'tuck_04',
            name: 'Faber-Castell Highlighter Set (4 Pastel Colors)',
            category: 'Highlighters',
            price: 110,
            stock: 40,
            image: 'assets/images/products/unsplash_6fd7a4deb47e33968620266961ba2d3e.jpg',
            description: 'Smudge-proof soft pastel highlighters for textbook marking.'
        },
        {
            id: 'tuck_05',
            name: 'Sticky Notes Combo (3x3 Yellow & Index Flags)',
            category: 'Sticky Notes',
            price: 85,
            stock: 60,
            image: 'assets/images/products/unsplash_8cf847b446089f4cf3d871dfb832b97e.jpg',
            description: 'Self-adhesive note pads for campus project indexing.'
        },
        {
            id: 'tuck_06',
            name: 'Transparent Hard Board Lab File Holder',
            category: 'Files',
            price: 95,
            stock: 25,
            image: 'assets/images/products/unsplash_a6e5d026a93c70c3bf32136153bb64fa.jpg',
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
            image: 'assets/images/products/unsplash_28402b60caf87ffae15b4cabdbb68f14.jpg',
            reviews: [
                { reviewerName: 'Rahul Sharma', rating: 5, comment: 'Karan helped me install Ubuntu and dual-boot my laptop. Very professional and fast!', date: '2026-08-18' },
                { reviewerName: 'Aman Verma', rating: 4, comment: 'Great help with Python project. Understood the requirements clearly.', date: '2026-08-20' },
                { reviewerName: 'Priya Patel', rating: 5, comment: 'Saved me right before my lab exam! Excellent debugging skills.', date: '2026-08-22' }
            ]
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
            image: 'assets/images/products/unsplash_designer.jpg'
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
            image: 'assets/images/products/unsplash_9be73f213120461a20ec9955fcb48621.jpg'
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
            image: 'assets/images/products/unsplash_cake.jpg'
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
        localStorage.setItem('cm_wishlist', JSON.stringify(SEED_DATA.wishlist));
        localStorage.setItem('cm_cart', JSON.stringify(SEED_DATA.cart));
        localStorage.setItem('cm_donations', JSON.stringify(SEED_DATA.donations));
        localStorage.setItem('cm_initialized', 'true');
    } else {
        // Migration: Append new seed products if not already in local storage database
        try {
            let currentProducts = JSON.parse(localStorage.getItem('cm_products')) || [];
            
            // Migration: Remove Morphy Richards 50L Hostel Mini Refrigerator (prod_109)
            const initialLen = currentProducts.length;
            currentProducts = currentProducts.filter(p => p.id !== 'prod_109');
            let updated = (currentProducts.length !== initialLen);

            const currentIds = currentProducts.map(p => p.id);
            SEED_DATA.products.forEach(p => {
                if (!currentIds.includes(p.id)) {
                    currentProducts.push(p);
                    updated = true;
                }
            });
            
            // Migration: Ensure all products have a varied stock value
            currentProducts.forEach(p => {
                if (typeof p.stock === 'undefined' || p.stock === 1) {
                    // Assign random stock between 1 and 8 if it's 1 (the old default) or undefined
                    p.stock = Math.floor(Math.random() * 8) + 1;
                    updated = true;
                }
            });

            if (updated) {
                localStorage.setItem('cm_products', JSON.stringify(currentProducts));
            }
            
            // Migration: Seed donations if empty or missing
            let currentDonations = JSON.parse(localStorage.getItem('cm_donations'));
            if (!currentDonations || currentDonations.length === 0) {
                localStorage.setItem('cm_donations', JSON.stringify(SEED_DATA.donations));
            } else {
                const currentDonIds = currentDonations.map(d => d.id);
                let donUpdated = false;
                SEED_DATA.donations.forEach(d => {
                    if (!currentDonIds.includes(d.id)) {
                        currentDonations.push(d);
                        donUpdated = true;
                    }
                });
                if (donUpdated) {
                    localStorage.setItem('cm_donations', JSON.stringify(currentDonations));
                }
            }
            
            // Migration: Append reviews to srv_prov_1 (Karan) if not present
            let currentProviders = JSON.parse(localStorage.getItem('cm_service_providers')) || [];
            const karan = currentProviders.find(p => p.id === 'srv_prov_1');
            if (karan && !karan.reviews) {
                karan.reviews = [
                    { reviewerName: 'Rahul Sharma', rating: 5, comment: 'Karan helped me install Ubuntu and dual-boot my laptop. Very professional and fast!', date: '2026-08-18' },
                    { reviewerName: 'Aman Verma', rating: 4, comment: 'Great help with Python project. Understood the requirements clearly.', date: '2026-08-20' },
                    { reviewerName: 'Priya Patel', rating: 5, comment: 'Saved me right before my lab exam! Excellent debugging skills.', date: '2026-08-22' }
                ];
                localStorage.setItem('cm_service_providers', JSON.stringify(currentProviders));
            }
            
            // Migration: Force update images for fallback items
            let forceUpdate = false;
            currentProducts.forEach(p => {
                if (p.id === 'prod_128' && p.image !== 'assets/images/products/prod_balloons_new.jpg') {
                    p.image = 'assets/images/products/prod_balloons_new.jpg';
                    forceUpdate = true;
                }
                if (p.id === 'prod_129' && p.image !== 'assets/images/products/prod_props_new.jpg') {
                    p.image = 'assets/images/products/prod_props_new.jpg';
                    forceUpdate = true;
                }
            });
            if (forceUpdate) localStorage.setItem('cm_products', JSON.stringify(currentProducts));
            
            let donUpdate = false;
            if (currentDonations && currentDonations.length > 0) {
                currentDonations.forEach(d => {
                    if (d.id === 'don_101') {
                        d.image = 'assets/images/products/unsplash_2a947a63bf0ac0f1a48d91a39816b8cf.jpg'; donUpdate = true;
                    }
                    if (d.id === 'don_102') {
                        d.image = 'assets/images/products/unsplash_a26afdbeb7d3d73a8bd6d237b34ae67f.jpg'; donUpdate = true;
                    }
                    if (d.id === 'don_103') {
                        d.image = 'assets/images/products/unsplash_textbook.jpg'; donUpdate = true;
                    }
                    if (d.id === 'don_104') {
                        d.image = 'assets/images/products/unsplash_designer.jpg'; donUpdate = true;
                    }
                });
                if (donUpdate) localStorage.setItem('cm_donations', JSON.stringify(currentDonations));
            }

        } catch (e) {
            console.error('Database migration failed:', e);
        }
    }
}

// Initialize Data Engine (Preserves user state once initialized)
initDatabase(false);
