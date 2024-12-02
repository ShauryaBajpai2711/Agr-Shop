document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and is a seller
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.type !== 'seller') {
        window.location.href = 'login.html';
        return;
    }

    // Display user name
    document.getElementById('userName').textContent = `Welcome, ${currentUser.name}`;

    // Handle logout
    document.getElementById('logoutLink').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Load seller's products
    loadSellerProducts();

    // Handle add product form submission
    const addProductForm = document.getElementById('addProductForm');
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newProduct = {
            name: addProductForm.name.value,
            price: parseFloat(addProductForm.price.value),
            image: addProductForm.image.value,
            description: addProductForm.description.value,
            sellerId: currentUser.email
        };

        // Get existing products
        const products = JSON.parse(localStorage.getItem('products')) || [];
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));

        // Reset form and reload products
        addProductForm.reset();
        loadSellerProducts();
        alert('Product added successfully!');
    });
});

function loadSellerProducts() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const myProducts = products.filter(product => product.sellerId === currentUser.email);
    
    const productGrid = document.getElementById('myProductGrid');
    productGrid.innerHTML = '';

    myProducts.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="price">₹${product.price}</p>
                <div class="actions">
                    <button class="edit-btn" onclick="editProduct(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteProduct(${index})">Delete</button>
                </div>
            </div>
        `;
        
        productGrid.appendChild(productCard);
    });
}

function deleteProduct(index) {
    if (confirm('Are you sure you want to delete this product?')) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const myProducts = products.filter(product => product.sellerId === currentUser.email);
        
        // Find the actual product index in the main products array
        const productToDelete = myProducts[index];
        const mainIndex = products.findIndex(p => 
            p.name === productToDelete.name && 
            p.sellerId === currentUser.email
        );
        
        products.splice(mainIndex, 1);
        localStorage.setItem('products', JSON.stringify(products));
        loadSellerProducts();
    }
}

function editProduct(index) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const myProducts = products.filter(product => product.sellerId === currentUser.email);
    const product = myProducts[index];

    // Populate form with product data
    const form = document.getElementById('addProductForm');
    form.name.value = product.name;
    form.price.value = product.price;
    form.image.value = product.image;
    form.description.value = product.description;

    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
} 