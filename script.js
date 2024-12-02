// Product data
const products = [
    {
        name: "Organic Fertilizer",
        price: 2499,
        image: "https://m.media-amazon.com/images/I/81qNDYd89UL._AC_UF1000,1000_QL80_.jpg",
        description: "100% organic fertilizer for better crop yield"
    },
    {
        name: "Garden Tools Set",
        price: 3999,
        image: "https://m.media-amazon.com/images/I/71SQR9JrOtL._AC_UF1000,1000_QL80_.jpg",
        description: "Complete set of essential gardening tools"
    },
    {
        name: "Seeds Collection",
        price: 1599,
        image: "https://m.media-amazon.com/images/I/91oPakxNvhL._AC_UF1000,1000_QL80_.jpg",
        description: "Variety of high-quality vegetable seeds"
    },
    {
        name: "Watering Can",
        price: 1299,
        image: "https://m.media-amazon.com/images/I/61+2jdMdFqL._AC_UF1000,1000_QL80_.jpg",
        description: "Durable plastic watering can with sprinkler head"
    },
    {
        name: "Plant Protection Net",
        price: 1999,
        image: "https://m.media-amazon.com/images/I/71Y1S2hYy6L._AC_UF1000,1000_QL80_.jpg",
        description: "Protective netting for your valuable crops"
    },
    {
        name: "Pruning Shears",
        price: 1899,
        image: "https://m.media-amazon.com/images/I/71jzxX98DAL._AC_UF1000,1000_QL80_.jpg",
        description: "Professional grade pruning shears"
    }
];

// Function to create product cards
function createProductCards() {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = ''; // Clear existing products
    
    // Get products from localStorage or use default products
    const storedProducts = JSON.parse(localStorage.getItem('products')) || products;
    
    storedProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Get seller name if product has sellerId
        let sellerName = "Agri Shop";
        if (product.sellerId) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const seller = users.find(user => user.email === product.sellerId);
            if (seller) {
                sellerName = seller.name;
            }
        }
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="seller-info">Sold by: ${sellerName}</p>
                <p class="price">₹${product.price}</p>
                <button class="add-to-cart-btn" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                    Add to Cart
                </button>
            </div>
        `;
        
        productGrid.appendChild(productCard);
    });
}

// Function to add items to cart
function addToCart(product) {
    if (!isLoggedIn() || getCurrentUser().type !== 'buyer') {
        alert('Please login as a buyer to purchase products');
        window.location.href = 'login.html';
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Product added to cart!');
}

// Helper functions
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartCount.textContent = cart.length;
    }
}

// Initialize all functions when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createProductCards();
    
    // Handle user authentication status
    const userSection = document.getElementById('userSection');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        userSection.innerHTML = `
            <span>Welcome, ${currentUser.name}</span>
            <a href="#" id="logoutLink">Logout</a>
        `;

        // Add cart icon if user is a buyer
        if (currentUser.type === 'buyer') {
            const nav = document.querySelector('nav ul');
            const cartLi = document.createElement('li');
            cartLi.innerHTML = `
                <a href="cart.html" class="cart-icon">
                    🛒 Cart <span id="cartCount">0</span>
                </a>
            `;
            nav.insertBefore(cartLi, userSection);
            updateCartCount();
        }

        // Handle logout
        document.getElementById('logoutLink').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.reload();
        });
    }
});

// Add this function to handle UPI payments
function handleUPIPayment(amount, orderId) {
    // UPI Payment details
    const upiDetails = {
        pa: "8400373381@ibl", // Replace with your actual UPI ID
        pn: "Agri Shop",
        tr: orderId,
        tn: "Purchase from Agri Shop",
        am: amount,
        cu: "INR"
    };

    // Create UPI payment URL
    const upiUrl = `upi://pay?pa=${upiDetails.pa}&pn=${encodeURIComponent(upiDetails.pn)}&tr=${upiDetails.tr}&tn=${encodeURIComponent(upiDetails.tn)}&am=${upiDetails.am}&cu=${upiDetails.cu}`;

    // Create QR code for UPI payment
    const qrcode = new QRCode(document.getElementById("qrcode"), {
        text: upiUrl,
        width: 200,
        height: 200
    });

    // Also provide a direct link for mobile devices
    const upiLink = document.createElement('a');
    upiLink.href = upiUrl;
    upiLink.className = 'upi-link';
    upiLink.textContent = 'Click here to pay via UPI app';
    document.getElementById("upiPayment").appendChild(upiLink);
}

// Add this to your payment form handling
function processUPIPayment(e) {
    e.preventDefault();
    const amount = calculateTotal(); // Your function to calculate total
    const orderId = generateOrderId(); // Your function to generate order ID

    // Show UPI payment options
    const paymentSection = document.getElementById('paymentSection');
    paymentSection.innerHTML = `
        <div class="upi-payment">
            <h3>Pay using UPI</h3>
            <div id="qrcode"></div>
            <div id="upiPayment"></div>
            <p>After payment, click verify to confirm your order</p>
            <button onclick="verifyUPIPayment('${orderId}')" class="verify-btn">
                Verify Payment
            </button>
        </div>
    `;

    // Generate QR code and UPI link
    handleUPIPayment(amount, orderId);
}

// Function to verify payment
function verifyUPIPayment(orderId) {
    // In a real application, you would verify with your backend
    // For demo, we'll simulate verification
    const verified = confirm("Did you complete the payment?");
    if (verified) {
        alert("Payment verified successfully!");
        // Clear cart and redirect to confirmation
        localStorage.setItem('cart', JSON.stringify([]));
        window.location.href = 'confirmation.html';
    } else {
        alert("Payment verification failed. Please try again or choose a different payment method.");
    }
} 