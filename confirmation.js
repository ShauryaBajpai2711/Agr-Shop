document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const order = JSON.parse(localStorage.getItem('currentOrder'));

    if (!currentUser || !order) {
        window.location.href = 'index.html';
        return;
    }

    // Display user name
    const userSection = document.getElementById('userSection');
    userSection.innerHTML = `
        <span>Welcome, ${currentUser.name}</span>
        <a href="#" id="logoutLink">Logout</a>
    `;

    // Display order details
    document.getElementById('orderId').textContent = order.orderId;

    // Display shipping details
    const shippingDetails = document.getElementById('shippingDetails');
    shippingDetails.innerHTML = `
        <p>${order.shippingDetails.fullName}</p>
        <p>${order.shippingDetails.address1}</p>
        ${order.shippingDetails.address2 ? `<p>${order.shippingDetails.address2}</p>` : ''}
        <p>${order.shippingDetails.city}, ${order.shippingDetails.state}</p>
        <p>PIN: ${order.shippingDetails.pinCode}</p>
        <p>Phone: ${order.shippingDetails.phone}</p>
    `;

    // Display payment details
    const paymentDetails = document.getElementById('paymentDetails');
    if (order.paymentDetails.method === 'card') {
        paymentDetails.innerHTML = `
            <p>Paid by Card</p>
            <p>Card ending in: ${order.paymentDetails.cardNumber}</p>
        `;
    } else if (order.paymentDetails.method === 'upi') {
        paymentDetails.innerHTML = `
            <p>Paid by UPI</p>
            <p>UPI ID: ${order.paymentDetails.upiId}</p>
        `;
    } else {
        paymentDetails.innerHTML = `
            <p>Payment Method: Cash on Delivery</p>
        `;
    }

    // Display items
    const itemsList = document.getElementById('itemsList');
    order.items.forEach(item => {
        // Get seller name
        let sellerName = "Agri Shop";
        if (item.sellerId) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const seller = users.find(user => user.email === item.sellerId);
            if (seller) {
                sellerName = seller.name;
            }
        }

        const itemElement = document.createElement('div');
        itemElement.className = 'item-row';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="item-image">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <p class="seller-info">Sold by: ${sellerName}</p>
            </div>
            <div class="item-price">₹${item.price}</div>
        `;
        itemsList.appendChild(itemElement);
    });

    // Display price summary
    document.getElementById('subtotal').textContent = `₹${order.subtotal}`;
    document.getElementById('shipping').textContent = `₹${order.shipping}`;
    document.getElementById('total').textContent = `₹${order.total}`;

    // Handle logout
    document.getElementById('logoutLink').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentOrder');
        window.location.href = 'index.html';
    });
}); 