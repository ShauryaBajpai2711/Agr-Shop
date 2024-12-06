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

    // Load cart total
    loadCartSummary();

    // Display order items summary
    displayOrderSummary();

    // Handle payment method selection
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', togglePaymentDetails);
    });

    // Handle form submission
    document.getElementById('paymentForm').addEventListener('submit', handlePayment);
});

function loadCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.totalPrice;
    });

    const shipping = subtotal > 0 ? 40 : 0;
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('total').textContent = `₹${total}`;
}

// Add this new function to display order items
function displayOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderSummaryDiv = document.createElement('div');
    orderSummaryDiv.className = 'order-items-summary';
    
    let summaryHTML = '<h3>Order Items</h3>';
    
    cart.forEach(item => {
        summaryHTML += `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}" class="item-thumbnail">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p class="quantity-info">Quantity: ${item.quantity}</p>
                    <p class="price-info">₹${item.totalPrice} (₹${item.price} × ${item.quantity})</p>
                </div>
            </div>
        `;
    });

    orderSummaryDiv.innerHTML = summaryHTML;

    // Insert after order summary and before shipping address
    const orderSummary = document.querySelector('.order-summary');
    orderSummary.parentNode.insertBefore(orderSummaryDiv, orderSummary.nextSibling);
}

function togglePaymentDetails() {
    const cardPayment = document.getElementById('cardPayment');
    const upiPayment = document.getElementById('upiPayment');
    const selectedMethod = document.querySelector('input[name="payment"]:checked').value;

    if (selectedMethod === 'card') {
        cardPayment.classList.remove('hidden');
        upiPayment.classList.add('hidden');
        enableCardValidation();
    } else if (selectedMethod === 'upi') {
        cardPayment.classList.add('hidden');
        upiPayment.classList.remove('hidden');
    } else {
        cardPayment.classList.add('hidden');
        upiPayment.classList.add('hidden');
    }
}

function handlePayment(e) {
    e.preventDefault();
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const form = e.target;
    
    // Get shipping details
    const shippingDetails = {
        fullName: form.querySelector('input[placeholder="Full Name"]').value,
        address1: form.querySelector('input[placeholder="Address Line 1"]').value,
        address2: form.querySelector('input[placeholder="Address Line 2"]').value || '',
        city: form.querySelector('input[placeholder="City"]').value,
        state: form.querySelector('input[placeholder="State"]').value,
        pinCode: form.querySelector('input[placeholder="PIN Code"]').value,
        phone: form.querySelector('input[placeholder="Phone Number"]').value
    };

    // Calculate totals
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((total, item) => total + item.totalPrice, 0);
    const shipping = subtotal > 0 ? 40 : 0;
    const total = subtotal + shipping;

    // Create order object
    const order = {
        orderId: generateOrderId(),
        date: new Date().toISOString(),
        items: cart,
        shippingDetails,
        paymentDetails: {
            method: paymentMethod,
            upiId: "8400373381@ibl"
        },
        subtotal: subtotal,
        shipping: shipping,
        total: total
    };

    // Store order details
    localStorage.setItem('currentOrder', JSON.stringify(order));

    // Handle payment verification
    if (paymentMethod === 'upi') {
        verifyUPIPayment(order.orderId);
    } else if (paymentMethod === 'card') {
        processCardPayment(order);
    } else {
        processCODPayment(order);
    }
}

// Add these helper functions
function processCardPayment(order) {
    showProcessingMessage();
    setTimeout(() => {
        localStorage.setItem('cart', JSON.stringify([]));
        window.location.href = 'confirmation.html';
    }, 2000);
}

function processCODPayment(order) {
    alert('Order placed successfully! You will pay ₹' + order.total + ' at delivery.');
    localStorage.setItem('cart', JSON.stringify([]));
    window.location.href = 'confirmation.html';
}

function generateOrderId() {
    return 'ORD' + Date.now().toString().slice(-8);
}

function showProcessingMessage() {
    const btn = document.querySelector('.pay-now-btn');
    btn.disabled = true;
    btn.textContent = 'Processing...';
}

function enableCardValidation() {
    const cardInputs = document.querySelectorAll('#cardPayment input');
    cardInputs.forEach(input => {
        if (input.placeholder === 'Card Number') {
            input.maxLength = 16;
            input.pattern = '[0-9]{16}';
        } else if (input.placeholder === 'MM/YY') {
            input.maxLength = 5;
            input.pattern = '[0-9]{2}/[0-9]{2}';
        } else if (input.placeholder === 'CVV') {
            input.maxLength = 3;
            input.pattern = '[0-9]{3}';
        }
    });
}

function enableUPIValidation() {
    const upiInput = document.querySelector('#upiPayment input');
    upiInput.pattern = '[a-zA-Z0-9.]+@[a-zA-Z]+';
}

// Add this function to handle UPI payments
function handleUPIPayment(amount, orderId) {
    const upiPaymentDiv = document.getElementById("upiPayment");
    
    // Add bypass verification button
    const bypassBtn = document.createElement('button');
    bypassBtn.className = 'verify-btn bypass-btn';
    bypassBtn.textContent = 'Verify Payment (Test Mode)';
    bypassBtn.onclick = () => {
        // Create and store order details
        const form = document.getElementById('paymentForm');
        const shippingDetails = {
            fullName: form.querySelector('input[placeholder="Full Name"]').value,
            address1: form.querySelector('input[placeholder="Address Line 1"]').value,
            address2: form.querySelector('input[placeholder="Address Line 2"]').value || '',
            city: form.querySelector('input[placeholder="City"]').value,
            state: form.querySelector('input[placeholder="State"]').value,
            pinCode: form.querySelector('input[placeholder="PIN Code"]').value,
            phone: form.querySelector('input[placeholder="Phone Number"]').value
        };

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const subtotal = cart.reduce((total, item) => total + item.totalPrice, 0);
        const shipping = subtotal > 0 ? 40 : 0;
        const total = subtotal + shipping;

        const order = {
            orderId: orderId,
            date: new Date().toISOString(),
            items: cart,
            shippingDetails,
            paymentDetails: {
                method: 'upi',
                upiId: "8400373381@ibl"
            },
            subtotal: subtotal,
            shipping: shipping,
            total: total
        };

        localStorage.setItem('currentOrder', JSON.stringify(order));
        localStorage.setItem('cart', JSON.stringify([]));
        
        alert("Payment verified successfully! (Test Mode)");
        window.location.href = 'confirmation.html';
    };
    
    // Add the bypass button to the UPI payment section
    upiPaymentDiv.appendChild(bypassBtn);
}

// Function to verify payment
function verifyUPIPayment(orderId) {
    const verified = confirm("Did you complete the payment?");
    if (verified) {
        alert("Payment verified successfully!");
        // Create and store order details
        const form = document.getElementById('paymentForm');
        const shippingDetails = {
            fullName: form.querySelector('input[placeholder="Full Name"]').value,
            address1: form.querySelector('input[placeholder="Address Line 1"]').value,
            address2: form.querySelector('input[placeholder="Address Line 2"]').value,
            city: form.querySelector('input[placeholder="City"]').value,
            state: form.querySelector('input[placeholder="State"]').value,
            pinCode: form.querySelector('input[placeholder="PIN Code"]').value,
            phone: form.querySelector('input[placeholder="Phone Number"]').value
        };

        const order = {
            orderId: orderId,
            date: new Date().toISOString(),
            items: JSON.parse(localStorage.getItem('cart')) || [],
            shippingDetails,
            paymentDetails: {
                method: 'upi',
                upiId: "8400373381@ibl"
            },
            subtotal: calculateSubtotal(),
            shipping: 40,
            total: calculateSubtotal() + 40
        };

        localStorage.setItem('currentOrder', JSON.stringify(order));
        localStorage.setItem('cart', JSON.stringify([]));
        window.location.href = 'confirmation.html';
    } else {
        alert("Payment verification failed. Please try again or choose a different payment method.");
    }
}

function bypassPayment() {
    const form = document.getElementById('paymentForm');
    const shippingDetails = {
        fullName: form.querySelector('input[placeholder="Full Name"]').value,
        address1: form.querySelector('input[placeholder="Address Line 1"]').value,
        address2: form.querySelector('input[placeholder="Address Line 2"]').value || '',
        city: form.querySelector('input[placeholder="City"]').value,
        state: form.querySelector('input[placeholder="State"]').value,
        pinCode: form.querySelector('input[placeholder="PIN Code"]').value,
        phone: form.querySelector('input[placeholder="Phone Number"]').value
    };

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((total, item) => total + item.totalPrice, 0);
    const shipping = subtotal > 0 ? 40 : 0;
    const total = subtotal + shipping;

    const order = {
        orderId: generateOrderId(),
        date: new Date().toISOString(),
        items: cart,
        shippingDetails,
        paymentDetails: {
            method: 'upi',
            upiId: "8400373381@ibl"
        },
        subtotal: subtotal,
        shipping: shipping,
        total: total
    };

    localStorage.setItem('currentOrder', JSON.stringify(order));
    localStorage.setItem('cart', JSON.stringify([]));
    
    alert("Payment verified successfully! (Test Mode)");
    window.location.href = 'confirmation.html';
} 