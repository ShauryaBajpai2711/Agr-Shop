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

    // Handle payment method selection
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', togglePaymentDetails);
    });

    // Handle form submission
    document.getElementById('paymentForm').addEventListener('submit', handlePayment);

    // Initialize UPI payment on page load since it's checked by default
    const amount = calculateSubtotal() + 100;
    const orderId = generateOrderId();
    handleUPIPayment(amount, orderId);
});

function loadCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price;
    });

    const shipping = subtotal > 0 ? 40 : 0;
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('total').textContent = `₹${total}`;
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
        // Initialize UPI payment
        const amount = calculateSubtotal() + 40; // subtotal + shipping
        const orderId = generateOrderId();
        handleUPIPayment(amount, orderId);
    } else {
        cardPayment.classList.add('hidden');
        upiPayment.classList.add('hidden');
    }
}

function handlePayment(e) {
    e.preventDefault();
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    if (paymentMethod === 'upi') {
        // UPI payments are handled by the QR code and verify button
        return;
    }

    // Rest of your existing handlePayment code...
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

function generateOrderId() {
    return 'ORD' + Date.now().toString().slice(-8);
}

function calculateSubtotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.reduce((total, item) => total + item.price, 0);
}

// Add this function to handle UPI payments
function handleUPIPayment(amount, orderId) {
    // Add verify button
    const upiPaymentDiv = document.getElementById("upiPayment");
    const existingVerifyBtn = upiPaymentDiv.querySelector('.verify-btn');
    if (!existingVerifyBtn) {
        const verifyBtn = document.createElement('button');
        verifyBtn.className = 'verify-btn';
        verifyBtn.textContent = 'Verify Payment';
        verifyBtn.onclick = () => verifyUPIPayment(orderId);
        upiPaymentDiv.appendChild(verifyBtn);
    }
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