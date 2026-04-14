const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 8001;
const SECRET_KEY = 'food-ordering-secret-key';
const ASSET_BASE_URL = process.env.ASSET_BASE_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

const offlineImageMap = {
    'royal biryani plaza': 'royal-biryani-plaza.jpg',
    'spice garden': 'paneer-roll.jpg',
    'the dhaba express': 'chole-bhature.jpg',
    'pind balluchi': 'lassi.jpg',
    'south indian sensation': 'idli-sambar.jpg',
    'pizza & pasta hub': 'pizza-pasta-hub.jpg',
    'pizza and pasta hub': 'pizza-pasta-hub.jpg',
    'the sweet shop': 'rava-kesari.jpg',
    'hyderabadi chicken biryani': 'hyderabadi-chicken-biryani.jpg',
    'mutton dum biryani': 'mutton-dum-biryani.jpg',
    'chicken 65': 'chicken-roll.jpg',
    'anda biryani': 'royal-biryani-plaza.jpg',
    'mirchi ka salan': 'medu-vada.jpg',
    'paneer tikka masala': 'paneer-tikka-masala.jpg',
    'dal makhani': 'dal-makhani.jpg',
    'daal makhani': 'dal-makhani.jpg',
    'butter naan': 'butter-naan.jpg',
    'malai kofta': 'malai-kofta.jpg',
    'mixed veg': 'mixed-veg.jpg',
    'mixed': 'mixed-veg.jpg',
    'chole bhature': 'chole-bhature.jpg',
    'lassi (tall glass)': 'lassi.jpg',
    'veg momos (8 pcs)': 'veg-momos.jpg',
    'veg momo': 'veg-momos.jpg',
    'chicken roll': 'chicken-roll.jpg',
    'paneer roll': 'paneer-roll.jpg',
    'amritsari kulcha': 'amritsari-kulcha.jpg',
    'sarson ka saag': 'sarson-ka-saag.jpg',
    'sarso ka saag': 'sarson-ka-saag.jpg',
    'makki di roti': 'makki-di-roti.jpg',
    'makke di roti': 'makki-di-roti.jpg',
    'akke di roti': 'makki-di-roti.jpg',
    'butter chicken': 'butter-chicken.jpg',
    'rajma chawal': 'rajma-chawal.jpg',
    'garlic naan': 'garlic-naan.jpg',

    'idli sambar (2 pcs)': 'idli-sambar.jpg',
    'vada (2 pcs)': 'medu-vada.jpg',
    'paper plain dosa': 'paper-dosa.jpg',
    'onion uttapam': 'onion-uttapam.jpg',
    'filter coffee': 'filter-coffee.jpg',
    'rava kesari': 'rava-kesari.jpg',
    'margherita pizza': 'margherita-pizza.jpg',
    'farmhouse pizza': 'farmhouse-pizza.jpg',
    'white sauce pasta': 'white-sauce-pasta.jpg',
    'red sauce pasta': 'red-sauce-pasta.jpg',
    'garlic bread (4 pcs)': 'garlic-bread-4-pcs.jpg',
    'chocolate brownie': 'chocolate-brownie.jpg',
    'gulab jamun (2 pcs)': 'gulab-jamun.jpg',
    'gulab jamun': 'gulab-jamun.jpg',
    'ras malai (2 pcs)': 'ras-malai.jpg',
    'ras malai': 'ras-malai.jpg',
    'rasmalai': 'ras-malai.jpg',
    'samosa (2 pcs)': 'samosa.jpg',
    'samosa': 'samosa.jpg',
    'paneer pakoda': 'paneer-roll.jpg',
    'jalebi (250g)': 'jalebi.jpg',
    'jalebi': 'jalebi.jpg',
    'kaju katli (250g)': 'kaju-katli.jpg',
    'kaju katli': 'kaju-katli.jpg'
};

const mappedImagePath = (name = '') => {
    const fileName = offlineImageMap[String(name).toLowerCase()] || 'chole-bhature.jpg';
    return `/images/menu/${fileName}`;
};

const toAbsoluteAsset = (assetPath) => `${ASSET_BASE_URL}${assetPath}`;

const toOfflineImage = (img, name = '') => {
    if (img && /^https?:\/\//i.test(img)) {
        if (img.startsWith(`${ASSET_BASE_URL}/images/`)) return img;
        return toAbsoluteAsset(mappedImagePath(name));
    }

    if (img && !/^https?:\/\//i.test(img)) {
        if (img.startsWith('/images/')) return toAbsoluteAsset(img);
        if (img.startsWith('images/')) return toAbsoluteAsset(`/${img}`);
        const fileName = img.split('/').pop();
        return toAbsoluteAsset(`/images/menu/${fileName}`);
    }

    return toAbsoluteAsset(mappedImagePath(name));
};

const withOfflineImage = (entity) => ({
    ...entity,
    img: toOfflineImage(entity.img, entity.name)
});

let users = [];
let restaurants = [
    { id: 1, name: "Royal Biryani Plaza", address: "Station Road, City Center", phone: "9876543210", ownerId: 0, img: "" },
    { id: 2, name: "Spice Garden", address: "Green Avenue, North Side", phone: "9123456789", ownerId: 0, img: "" },
    { id: 3, name: "The Dhaba Express", address: "Main Highway, Sector 4", phone: "9988776655", ownerId: 0, img: "" },
    { id: 4, name: "Pind Balluchi", address: "Grand Palace Mall, Level 3", phone: "9812345678", ownerId: 0, img: "" },
    { id: 5, name: "South Indian Sensation", address: "Near Railway Crossing", phone: "9765432109", ownerId: 0, img: "" },
    { id: 6, name: "Pizza & Pasta Hub", address: "New Market Loop", phone: "9555666777", ownerId: 0, img: "" },
    { id: 7, name: "The Sweet Shop", address: "Main Bazaar Road", phone: "9444333222", ownerId: 0, img: "" }
];

let menuItems = [
    // Royal Biryani Plaza (1)
    { id: 1, restaurantId: 1, name: "Hyderabadi Chicken Biryani", desc: "Long grain aromatic rice with tender chicken.", price: 210, img: "" },
    { id: 2, restaurantId: 1, name: "Mutton Dum Biryani", desc: "Rich mutton biryani slow cooked for hours.", price: 280, img: "" },
    { id: 3, restaurantId: 1, name: "Chicken 65", desc: "Spicy deep-fried chicken starter.", price: 160, img: "" },
    { id: 10, restaurantId: 1, name: "Anda Biryani", desc: "Garden fresh vegetables with basmati rice.", price: 150, img: "" },
    { id: 11, restaurantId: 1, name: "Mirchi ka Salan", desc: "Traditional peanut based spicy gravy.", price: 80, img: "" },

    // Spice Garden (2)
    { id: 4, restaurantId: 2, name: "Paneer Tikka Masala", desc: "Char-grilled paneer in rich tomato gravy.", price: 180, img: "" },
    { id: 5, restaurantId: 2, name: "Dal Makhani", desc: "Slow-cooked black lentils with cream.", price: 140, img: "" },
    { id: 6, restaurantId: 2, name: "Butter Naan", desc: "Soft white bread baked in tandoor.", price: 40, img: "" },
    { id: 12, restaurantId: 2, name: "Malai Kofta", desc: "Potato and paneer balls in cashew gravy.", price: 220, img: "" },
    { id: 13, restaurantId: 2, name: "Mixed Veg", desc: "Sautéed seasonal vegetables with spices.", price: 160, img: "" },

    // The Dhaba Express (3)
    { id: 7, restaurantId: 3, name: "Chole Bhature", desc: "Classic Punjabi chickpea curry with fried bread.", price: 120, img: "" },
    { id: 8, restaurantId: 3, name: "Lassi (Tall Glass)", desc: "Sweet thickened yogurt drink.", price: 60, img: "" },
    { id: 9, restaurantId: 3, name: "Veg Momos (8 pcs)", desc: "Steamed dumplings with spicy chutney.", price: 100, img: "" },
    { id: 14, restaurantId: 3, name: "Chicken Roll", desc: "Spiced chicken wrapped in paratha.", price: 120, img: "" },
    { id: 15, restaurantId: 3, name: "Paneer Roll", desc: "Roasted paneer wrapped in paratha.", price: 110, img: "" },

    // Pind Balluchi (4)
    { id: 16, restaurantId: 4, name: "Amritsari Kulcha", desc: "Stuffed bread served with chole.", price: 150, img: "" },
    { id: 17, restaurantId: 4, name: "Sarson ka Saag", desc: "Mustard green curry with butter.", price: 180, img: "" },
    { id: 18, restaurantId: 4, name: "Makki di Roti", desc: "Maize flour flatbread.", price: 30, img: "" },
    { id: 19, restaurantId: 4, name: "Butter Chicken", desc: "Tandoori chicken in creamy tomato gravy.", price: 320, img: "" },
    { id: 20, restaurantId: 4, name: "Rajma Chawal", desc: "Kidney beans curry served with rice.", price: 140, img: "" },
    { id: 21, restaurantId: 4, name: "Garlic Naan", desc: "Oven baked bread with garlic butter.", price: 50, img: "" },

    // South Indian Sensation (5)
    { id: 22, restaurantId: 5, name: "Idli Sambar (2 pcs)", desc: "Steamed rice cakes with lentil soup.", price: 60, img: "" },
    { id: 23, restaurantId: 5, name: "Vada (2 pcs)", desc: "Deep fried lentil donuts.", price: 70, img: "" },
    { id: 24, restaurantId: 5, name: "Paper Plain Dosa", desc: "Large crispy rice crepe.", price: 80, img: "" },
    { id: 25, restaurantId: 5, name: "Onion Uttapam", desc: "Thick savory pancake with onions.", price: 110, img: "" },
    { id: 26, restaurantId: 5, name: "Filter Coffee", desc: "Aromatic South Indian coffee.", price: 40, img: "" },
    { id: 27, restaurantId: 5, name: "Rava Kesari", desc: "Sweet semolina dessert with saffron.", price: 80, img: "" },

    // Pizza & Pasta Hub (6)
    { id: 28, restaurantId: 6, name: "Margherita Pizza", desc: "Classic cheese and tomato pizza.", price: 240, img: "" },
    { id: 29, restaurantId: 6, name: "Farmhouse Pizza", desc: "Loaded with capsicum, onion, mushroom.", price: 320, img: "" },
    { id: 30, restaurantId: 6, name: "White Sauce Pasta", desc: "Penne in creamy alfredo sauce.", price: 210, img: "" },
    { id: 31, restaurantId: 6, name: "Red Sauce Pasta", desc: "Penne in spicy tomato arrabbiata.", price: 190, img: "" },
    { id: 32, restaurantId: 6, name: "Garlic Bread (4 pcs)", desc: "Toasted bread with garlic and herbs.", price: 120, img: "" },
    { id: 33, restaurantId: 6, name: "Chocolate Brownie", desc: "Fudgy brownie with walnuts.", price: 150, img: "" },

    // The Sweet Shop (7)
    { id: 34, restaurantId: 7, name: "Gulab Jamun (2 pcs)", desc: "Deep fried milk solids in syrup.", price: 50, img: "" },
    { id: 35, restaurantId: 7, name: "Ras Malai (2 pcs)", desc: "Flattened balls in malai cream.", price: 80, img: "" },
    { id: 36, restaurantId: 7, name: "Samosa (2 pcs)", desc: "Crispy fried pastry with potato.", price: 30, img: "" },
    { id: 37, restaurantId: 7, name: "Paneer Pakoda", desc: "Spiced paneer fritters.", price: 90, img: "" },
    { id: 38, restaurantId: 7, name: "Jalebi (250g)", desc: "Deep fried spiral batter in syrup.", price: 100, img: "" },
    { id: 39, restaurantId: 7, name: "Kaju Katli (250g)", desc: "Cashew fudge dessert.", price: 250, img: "" }
];

let carts = {}; 
let orders = [];

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/api/auth/register', async (req, res) => {
    const { username, password, role, email, phone, address, name } = req.body;
    if (users.find(u => u.username === username)) return res.status(400).json({ error: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: users.length + 1, username, name: name || username, password: hashedPassword, role: role || 'CUSTOMER', email, phone, address };
    users.push(user);
    const token = jwt.sign({ id: user.id, username: user.username, name: user.name, role: user.role }, SECRET_KEY);
    res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, name: user.name || user.username, role: user.role }, SECRET_KEY);
    res.json({ token, user: { id: user.id, username: user.username, name: user.name || user.username, role: user.role } });
});

app.get('/api/restaurants', (req, res) => res.json(restaurants.map(withOfflineImage)));

app.post('/api/restaurants', authenticateToken, (req, res) => {
    if (req.user.role !== 'RESTAURANT_OWNER') return res.status(403).json({ error: 'Forbidden' });
    const { name, address, phone, img } = req.body;
    const restaurant = { id: restaurants.length + 1, name, address, phone, ownerId: req.user.id, img: toOfflineImage(img, name) };
    restaurants.push(restaurant);
    res.json(withOfflineImage(restaurant));
});

app.get('/api/menu', (req, res) => {
    const { restaurantId } = req.query;
    if (restaurantId) return res.json(menuItems.filter(item => item.restaurantId == restaurantId).map(withOfflineImage));
    res.json(menuItems.map(withOfflineImage));
});

app.post('/api/menu', authenticateToken, (req, res) => {
    if (req.user.role !== 'RESTAURANT_OWNER') return res.status(403).json({ error: 'Forbidden' });
    const { restaurantId, name, desc, price, img } = req.body;
    const item = { id: menuItems.length + 1, restaurantId, name, desc, price, img: toOfflineImage(img, name) };
    menuItems.push(item);
    res.json(withOfflineImage(item));
});

app.get('/api/cart/my_cart', authenticateToken, (req, res) => res.json({ items: carts[req.user.id] || [] }));

app.post('/api/cart/add_item', authenticateToken, (req, res) => {
    const { menu_item_id, quantity } = req.body;
    const item = menuItems.find(i => i.id == menu_item_id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const normalizedItem = withOfflineImage(item);
    if (!carts[req.user.id]) carts[req.user.id] = [];
    const existing = carts[req.user.id].find(i => i.menu_item_id == menu_item_id);
    if (existing) { existing.quantity += (quantity || 1); } 
    else { carts[req.user.id].push({ menu_item_id, quantity: quantity || 1, menu_item_detail: normalizedItem }); }
    res.json({ items: carts[req.user.id] });
});

app.post('/api/cart/checkout', authenticateToken, (req, res) => {
    const cartItems = carts[req.user.id];
    if (!cartItems || cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    const total = cartItems.reduce((acc, i) => acc + (i.menu_item_detail.price * i.quantity), 0);
    const order = { id: orders.length + 1, userId: req.user.id, restaurantId: cartItems[0].menu_item_detail.restaurantId, total_amount: total, status: 'PLACED', payment_status: 'SUCCESS', items: cartItems, created_at: new Date() };
    orders.push(order);
    carts[req.user.id] = [];
    res.json(order);
});

app.get('/api/orders', authenticateToken, (req, res) => {
    if (req.user.role === 'RESTAURANT_OWNER') {
        const myRestaurants = restaurants.filter(r => r.ownerId === req.user.id).map(r => r.id);
        return res.json(orders.filter(o => myRestaurants.includes(o.restaurantId)));
    }
    res.json(orders.filter(o => o.userId === req.user.id));
});

const printLoadedData = () => {
    console.log('Loaded restaurants:', restaurants.map(r => r.name).join(', '));
    console.log('Loaded menu items:', menuItems.map(m => `${m.id}:${m.name}`).join(' | '));
};

printLoadedData();

app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));

