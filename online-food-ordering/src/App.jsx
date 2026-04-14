import React, { useState, useEffect } from 'react';
import { CheckCircle2, LogOut, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import './index.css';

const API_BASE = 'http://localhost:8001/api';
const API_ORIGIN = API_BASE.replace(/\/api$/, '');
const LOCAL_IMAGE_BASE = '/images/menu';

const imageNameMap = {
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
  const fileName = imageNameMap[String(name).toLowerCase()] || 'chole-bhature.jpg';
  return `${LOCAL_IMAGE_BASE}/${fileName}`;
};

const normalizeImage = (img, name = '') => {
  if (img && /^https?:\/\//i.test(img)) {
    if (img.startsWith(`${API_ORIGIN}/images/`)) return img;
    return `${API_ORIGIN}${mappedImagePath(name)}`;
  }

  if (img) {
    if (img.startsWith('/images/')) return `${API_ORIGIN}${img}`;
    if (img.startsWith('images/')) return `${API_ORIGIN}/${img}`;
    const safeFile = img.split('/').pop();
    return `${API_ORIGIN}${LOCAL_IMAGE_BASE}/${safeFile}`;
  }

  return `${API_ORIGIN}${mappedImagePath(name)}`;
};

const normalizeEntityImage = (entity) => ({
  ...entity,
  img: normalizeImage(entity?.img, entity?.name)
});

const fallbackImage = `${API_ORIGIN}${LOCAL_IMAGE_BASE}/chole-bhature.jpg`;

const handleImageError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = fallbackImage;
};

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestId, setSelectedRestId] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('home'); 
  const [authMode, setAuthMode] = useState('login'); 
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'CUSTOMER' });
  const [newItem, setNewItem] = useState({ name: '', desc: '', price: '', img: '' });
  const [loading, setLoading] = useState(true);
  const [orderNumber] = useState(() => Math.floor(Math.random() * 10000));

  useEffect(() => {
    fetchRestaurants();
    if (token) fetchCart();
  }, [token]);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch(`${API_BASE}/restaurants?t=${Date.now()}`);
      const data = await res.json();
      setRestaurants(data.map(normalizeEntityImage));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchMenu = async (restId) => {
    try {
      const res = await fetch(`${API_BASE}/menu?restaurantId=${restId}&t=${Date.now()}`);
      const data = await res.json();
      setMenu(data.map(normalizeEntityImage));
      setSelectedRestId(restId);
      setView('menu');
      window.scrollTo(0, 0);
    } catch (e) { console.error(e); }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_BASE}/cart/my_cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.items) {
        setCart(
          data.items.map(i => ({
            ...normalizeEntityImage(i.menu_item_detail),
            qty: i.quantity
          }))
        );
      }
    } catch (e) { console.error(e); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? 'login' : 'register';
    const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (res.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
        setView('home');
    } else {
        alert(data.error || 'Authentication failed');
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    const restId = restaurants.find(r => r.ownerId === user?.id)?.id || 1;
    const res = await fetch(`${API_BASE}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...newItem, restaurantId: restId })
    });
    if (res.ok) {
        alert("Item added successfully!");
        setNewItem({ name: '', desc: '', price: '', img: '' });
        fetchMenu(restId);
    }
  };

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('token');
      localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setCart([]);
        setView('home');
    }
  };

  const addToCart = async (item) => {
    if (!token) { setView('auth'); return; }
    try {
        const res = await fetch(`${API_BASE}/cart/add_item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ menu_item_id: item.id, quantity: 1 })
        });
        const data = await res.json();
        setCart(
          data.items.map(i => ({
            ...normalizeEntityImage(i.menu_item_detail),
            qty: i.quantity
          }))
        );
    } catch (e) { console.error(e); }
  };

  const placeOrder = async () => {
    try {
        const res = await fetch(`${API_BASE}/cart/checkout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) { setView('order'); setCart([]); }
    } catch (e) { console.error(e); }
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  if (loading) return <div className="app-wrapper flex-center" style={{height: '100vh'}}>
    <div className="loader"></div>
  </div>;

  return (
    <div className="app-wrapper">
      <header>
        <div className="container nav-container">
          <div className="logo" onClick={() => setView('home')} style={{cursor: 'pointer'}}>
            <span className="logo-badge"><UtensilsCrossed size={16} strokeWidth={2.5} /></span>
            <span className="logo-wordmark">TasteFusion</span>
          </div>
          <nav className="flex-center" style={{gap: '1rem'}}>
            {!token ? (
              <button className="btn glass" onClick={() => setView('auth')}>Login / Register</button>
            ) : (
                <div className="flex-center" style={{gap: '1rem'}}>
                    {user?.role === 'RESTAURANT_OWNER' && (
                      <button className="btn btn-secondary" onClick={() => setView('dashboard')}>Dashboard</button>
                    )}
                    <div className="user-profile-mini">
                      <span className="badge">{user?.name || user?.username}</span>
                        <button className="logout-icon-btn" title="Logout" onClick={logout}>
                          <LogOut size={16} />
                        </button>
                    </div>
                </div>
            )}
            <button className="btn btn-primary" onClick={() => setView('cart')}>
              <ShoppingBag size={17} />
              <span>Cart</span>
              {cart.length > 0 && <span className="cart-count">{cart.reduce((a,c) => a + c.qty, 0)}</span>}
            </button>
          </nav>
        </div>
      </header>

      <main className="container">
        {view === 'home' && (
          <div className="view-home animate-page-in">
            <section className="hero">
              <h1 className="hero-title">Experience the Art <br/>of <span className="hero-gradient">Great Taste</span></h1>
              <p className="hero-subtitle">Premium food from the city's finest kitchens, delivered to your doorstep in cities style.</p>
              <div className="hero-stats flex-center" style={{gap: '3rem', marginTop: '2.5rem'}}>
                <div><div className="stat-val">50+</div><div className="stat-lab">Restaurants</div></div>
                <div><div className="stat-val">30m</div><div className="stat-lab">Avg. Delivery</div></div>
                <div><div className="stat-val">4.8★</div><div className="stat-lab">Rating</div></div>
              </div>
            </section>
            
            <div className="flex-between mb-8 mt-12">
                <h2 className="section-title">Explore Local Favorites</h2>
                <div className="category-chips flex-center" style={{gap: '0.5rem'}}>
                    <span className="chip active">All</span>
                    <span className="chip">Biryani</span>
                    <span className="chip">Darbari</span>
                    <span className="chip">South Indian</span>
                </div>
            </div>

            <div className="menu-grid">
              {restaurants.map((rest, i) => (
                <div key={rest.id} className="menu-card glass animate-fade-in" style={{animationDelay: `${i * 0.1}s`, cursor: 'pointer'}} onClick={() => fetchMenu(rest.id)}>
                  <div className="card-img-container">
                    <img src={rest.img} alt={rest.name} className="card-img" loading="lazy" onError={handleImageError} />
                    <div className="card-overlay">
                        <span className="badge-promo">Free Delivery</span>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="flex-between">
                        <h3>{rest.name}</h3>
                        <span className="rating-badge">4.5 ★</span>
                    </div>
                    <p className="text-muted" style={{marginTop: '0.25rem'}}>{rest.address}</p>
                    <div className="card-footer mt-4 flex-between">
                        <span className="text-sm">25-35 mins</span>
                        <span className="text-primary font-bold">View Menu →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'menu' && (
          <div className="animate-page-in view-menu">
            <div className="menu-header glass mb-8 p-8" style={{marginTop: '2rem'}}>
                <button className="btn-link" onClick={() => setView('home')}>← Back to Restaurants</button>
                <div className="flex-between mt-4">
                    <div>
                        <h1 style={{fontSize: '2.5rem'}}>{restaurants.find(r => r.id === selectedRestId)?.name}</h1>
                        <p className="text-muted">{restaurants.find(r => r.id === selectedRestId)?.address}</p>
                    </div>
                    <div className="text-right">
                        <div className="badge-success">Open Now</div>
                        <p className="mt-2 text-primary font-bold">4.8 Excellent (500+ reviews)</p>
                    </div>
                </div>
            </div>

            <h2 className="mb-6">Popular Items</h2>
            <div className="menu-grid">
              {menu.map((item, i) => (
                <div key={item.id} className="menu-card glass animate-fade-in" style={{animationDelay: `${i * 0.05}s`}}>
                  <div className="card-img-container">
                    <img src={item.img} alt={item.name} className="card-img" loading="lazy" onError={handleImageError} />
                  </div>
                  <div className="card-content">
                    <h3>{item.name}</h3>
                    <p className="text-muted text-sm mt-1" style={{height: '3.5rem', overflow: 'hidden'}}>{item.desc}</p>
                    <div className="flex-between mt-4">
                        <span className="card-price">₹{item.price}</span>
                        <button className="btn btn-primary" onClick={() => addToCart(item)}>Add to Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'auth' && (
            <div className="flex-center animate-page-in" style={{minHeight: '80vh'}}>
                <div className="auth-card-container">
                    <div className="auth-visual glass">
                        <h2>Join the Fusion.</h2>
                        <p>Order from your favorite restaurants with just a few clicks.</p>
                    </div>
                    <form className="auth-form glass" onSubmit={handleAuth}>
                        <h2>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                        <p className="text-muted mb-6">Enter your credentials to continue</p>
                        <div className="mb-4">
                            <label className="text-muted block mb-2 text-sm uppercase font-bold tracking-wider">Username</label>
                            <input type="text" className="input-field" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="e.g. foodlover123" />
                        </div>
                        {authMode === 'register' && (
                          <div className="mb-4">
                            <label className="text-muted block mb-2 text-sm uppercase font-bold tracking-wider">Name</label>
                            <input type="text" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Rahul Sharma" />
                          </div>
                        )}
                        <div className="mb-4">
                            <label className="text-muted block mb-2 text-sm uppercase font-bold tracking-wider">Password</label>
                            <input type="password" className="input-field" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                        </div>
                        {authMode === 'register' && (
                            <div className="mb-4">
                                <label className="text-muted block mb-2 text-sm uppercase font-bold tracking-wider">Account Type</label>
                                <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                    <option value="CUSTOMER">Customer (Hungry User)</option>
                                    <option value="RESTAURANT_OWNER">Restaurant Owner</option>
                                </select>
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary w-full mt-4 h-12">{authMode === 'login' ? 'Login Securely' : 'Sign Up Now'}</button>
                        <p className="text-center mt-6 text-sm text-muted">
                            {authMode === 'login' ? "New to TasteFusion?" : "Already a member?"} 
                            <button type="button" className="text-primary cursor-pointer ml-2 font-bold link-button" onClick={() => setAuthMode(prev => prev === 'login' ? 'register' : 'login')}>
                                {authMode === 'login' ? 'Register here' : 'Login here'}
                              </button>
                        </p>
                    </form>
                </div>
            </div>
        )}

        {view === 'cart' && (
          <div className="animate-page-in container" style={{maxWidth: '800px', padding: '4rem 0'}}>
            <h1 className="mb-8">Your Order Summary</h1>
            <div className="grid grid-cols-3-1 gap-8">
                <div className="glass p-8">
                    {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="empty-cart-icon mb-4"><ShoppingBag size={34} /></div>
                        <p className="text-muted">Your cart is feeling light.</p>
                        <button className="btn-link mt-4" onClick={() => setView('home')}>Browse Restaurants</button>
                    </div>
                    ) : (
                    <div>
                        <ul className="cart-list">
                        {cart.map((item, idx) => (
                            <li key={idx} className="flex-between py-4 border-b">
                            <div className="flex-center" style={{gap: '1rem'}}>
                                <img src={item.img} style={{width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover'}} alt={item.name} loading="lazy" onError={handleImageError} />
                                <div>
                                    <h4 className="font-bold">{item.name}</h4>
                                    <span className="text-muted text-sm">₹{item.price} x {item.qty}</span>
                                </div>
                            </div>
                            <span className="font-bold">₹{item.price * item.qty}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="glass p-8 h-fit sticky-top-100">
                        <h3 className="mb-4">Bill Details</h3>
                        <div className="flex-between mb-2"><span className="text-muted">Item Total</span><span>₹{total}</span></div>
                        <div className="flex-between mb-2"><span className="text-muted">Delivery Fee</span><span>₹25</span></div>
                        <div className="flex-between mb-6"><span className="text-muted">Taxes & Charges</span><span>₹18</span></div>
                        <div className="flex-between py-4 border-t border-b mb-6 text-xl font-bold">
                            <span>To Pay</span>
                            <span className="text-primary">₹{total + 43}</span>
                        </div>
                        <button className="btn btn-primary w-full h-12" onClick={placeOrder}>Confirm Order</button>
                    </div>
                )}
            </div>
          </div>
        )}

        {view === 'order' && (
          <div className="animate-page-in text-center py-20">
             <div className="success-icon mb-6"><CheckCircle2 size={90} strokeWidth={1.7} /></div>
             <h1 className="text-4xl mb-2">Order Successful!</h1>
             <p className="text-muted text-lg mb-12">Hang tight! Your favorite meal is being prepared.</p>
             
             <div className="glass inline-block p-10 text-left min-w-[400px]">
               <h3 className="mb-6 flex-between">Tracking Order #TF-{orderNumber} <span className="badge">LIVE</span></h3>
                <div className="tracking-timeline">
                    <div className="track-step active">
                        <div className="dot"></div>
                        <div><p className="font-bold">Order Confirmed</p><p className="text-xs text-muted">12:05 PM</p></div>
                    </div>
                    <div className="track-step active">
                        <div className="dot"></div>
                        <div><p className="font-bold">Preparing Food</p><p className="text-xs text-muted">Restro is cooking...</p></div>
                    </div>
                    <div className="track-step">
                        <div className="dot"></div>
                        <div><p className="font-bold text-muted">Out for Delivery</p></div>
                    </div>
                </div>
             </div>
             
             <div className="mt-12">
                <button className="btn glass mx-auto" onClick={() => setView('home')}>Return to Home</button>
             </div>
          </div>
        )}

        {view === 'dashboard' && (
            <div className="animate-page-in py-12">
                <div className="flex-between mb-8">
                    <h1>Merchant Dashboard</h1>
                    <div className="badge-success">Store Status: ACTIVE</div>
                </div>
                
                <div className="grid grid-cols-2-1 gap-8">
                    <form className="glass p-8" onSubmit={addItem}>
                        <h3 className="mb-6">Upload New Menu Item</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="text-muted block mb-2 text-sm uppercase">Item Name</label>
                                <input type="text" className="input-field" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g. Grilled Chicken" />
                            </div>
                            <div className="mb-4">
                                <label className="text-muted block mb-2 text-sm uppercase">Category</label>
                                <select className="input-field"><option>Main Course</option><option>Starters</option></select>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="text-muted block mb-2 text-sm uppercase">Description</label>
                            <textarea className="input-field" style={{height: '100px'}} required value={newItem.desc} onChange={e => setNewItem({...newItem, desc: e.target.value})} placeholder="Write a mouth-watering description..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="text-muted block mb-2 text-sm uppercase">Base Price (INR)</label>
                                <input type="number" className="input-field" required value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="199" />
                            </div>
                            <div className="mb-4">
                                <label className="text-muted block mb-2 text-sm uppercase">Item Image URL</label>
                              <input type="text" className="input-field" required value={newItem.img} onChange={e => setNewItem({...newItem, img: e.target.value})} placeholder="Example: paneer-roll.jpg" />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary w-full mt-4 h-12">Publish to Menu</button>
                    </form>

                    <div className="flex-column gap-6">
                        <div className="glass p-6">
                            <h4 className="text-muted uppercase text-xs tracking-tighter mb-4">Revenue Today</h4>
                            <div className="text-3xl font-bold">₹14,200.00</div>
                            <div className="text-success text-xs mt-1">↑ 12% from yesterday</div>
                        </div>
                        <div className="glass p-6">
                            <h4 className="text-muted uppercase text-xs tracking-tighter mb-4">Pending orders</h4>
                            <div className="text-3xl font-bold">08</div>
                            <button className="btn-link text-xs mt-4">View Orders List →</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>

      <footer className="mt-auto py-12 border-t border-glass-border glass" style={{borderRadius: '0', background: 'rgba(15,23,42,0.95)'}}>
        <div className="container flex-between">
            <div>
                <div className="logo mb-4">
                  <span className="logo-badge"><UtensilsCrossed size={16} strokeWidth={2.5} /></span>
                  <span className="logo-wordmark">TasteFusion</span>
                </div>
                <p className="text-muted text-sm" style={{maxWidth: '300px'}}>The premium food delivery platform for cities. Built with speed and taste in mind.</p>
            </div>
            <div className="flex-center" style={{gap: '4rem'}}>
                <div>
                    <h5 className="mb-4">Company</h5>
                    <ul className="text-muted text-sm flex-column gap-2" style={{listStyle: 'none'}}>
                        <li>About Us</li>
                        <li>Careers</li>
                        <li>Blog</li>
                    </ul>
                </div>
                <div>
                    <h5 className="mb-4">Legal</h5>
                    <ul className="text-muted text-sm flex-column gap-2" style={{listStyle: 'none'}}>
                        <li>Terms</li>
                        <li>Privacy</li>
                        <li>Refund Policy</li>
                    </ul>
                </div>
            </div>
        </div>
        <div className="container text-center mt-12 text-xs text-muted">
            © 2026 TasteFusion Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
