document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and is a buyer
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.type !== 'buyer') {
        window.location.href = 'login.html';
        return;
    }

    // Display user name
    const userSection = document.getElementById('userSection');
    userSection.innerHTML = `
        <span>Welcome, ${currentUser.name}</span>
        <a href="#" id="logoutLink">Logout</a>
    `;

    // Handle logout
    document.getElementById('logoutLink').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Load cart items
    loadCart();

    // Handle checkout
    document.getElementById('checkoutBtn').addEventListener('click', handleCheckout);
});

function loadCart() {
    const cartItems = document.getElementById('cartItems');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        updateSummary(0);
        return;
    }

    cartItems.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.price;
        
        // Get seller name
        let sellerName = "Agri Shop";
        if (item.sellerId) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const seller = users.find(user => user.email === item.sellerId);
            if (seller) {
                sellerName = seller.name;
            }
        }

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p class="seller-info">Sold by: ${sellerName}</p>
                <p class="cart-item-price">₹${item.price}</p>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
        `;
        cartItems.appendChild(cartItem);
    });

    updateSummary(subtotal);
}

function updateSummary(subtotal) {
    const shipping = subtotal > 0 ? 40 : 0;
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('total').textContent = `₹${total}`;
}

function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function handleCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Redirect to payment page
    window.location.href = 'payment.html';
} 