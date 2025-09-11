// Simulación de base de datos de usuarios
const users = JSON.parse(localStorage.getItem('users')) || [
    { id: 1, name: 'Administrador', email: 'admin@example.com', password: 'admin123', role: 'admin', createdAt: '2023-01-01' },
    { id: 2, name: 'Usuario Ejemplo', email: 'user@example.com', password: 'user123', role: 'user', createdAt: '2023-01-02' }
];

// Guardar usuarios en localStorage si no existen
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Función para verificar el login y redirigir según el rol
function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Redirigir según el rol
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
        
        return true;
    }
    
    return false;
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Verificar si el usuario está logueado
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Si no hay usuario logueado y está en una página que requiere autenticación
    if (!currentUser && !window.location.pathname.endsWith('login.html')) {
        window.location.href = 'login.html';
        return false;
    }
    
    return currentUser;
}

// Verificar si el usuario actual es administrador
function checkAdminAccess() {
    const currentUser = checkAuth();
    
    if (currentUser && currentUser.role !== 'admin') {
        alert('No tienes permisos para acceder a esta página.');
        window.location.href = 'index.html';
        return false;
    }
    
    return currentUser;
}

// Manejar el formulario de login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const messageElement = document.getElementById('loginMessage');
        
        const loginSuccess = loginUser(email, password);
        
        if (!loginSuccess) {
            messageElement.textContent = 'Credenciales incorrectas. Inténtalo de nuevo.';
        }
    });
}

// Manejar el botón de cerrar sesión
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('admin.html')) {
        checkAdminAccess();
    } else if (!window.location.pathname.endsWith('login.html')) {
        checkAuth();
    }
});

// Funciones para la gestión de usuarios
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tableBody = document.getElementById('usersTableBody');
    
    tableBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.createdAt}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${user.id}">✏️</button>
                <button class="action-btn delete-btn" data-id="${user.id}">🗑️</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Agregar event listeners a los botones
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            editUser(userId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            deleteUser(userId);
        });
    });
}

function openUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('userForm');
    
    if (userId) {
        // Modo edición
        modalTitle.textContent = 'Editar Usuario';
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.id === userId);
        
        if (user) {
            document.getElementById('userId').value = user.id;
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.role;
            document.getElementById('userPassword').required = false;
        }
    } else {
        // Modo creación
        modalTitle.textContent = 'Crear Nuevo Usuario';
        form.reset();
        document.getElementById('userId').value = '';
        document.getElementById('userPassword').required = true;
    }
    
    modal.style.display = 'block';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

function saveUser(userData) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (userData.id) {
        // Editar usuario existente
        const index = users.findIndex(u => u.id === userData.id);
        if (index !== -1) {
            // Mantener la contraseña original si no se proporciona una nueva
            if (!userData.password) {
                userData.password = users[index].password;
            }
            users[index] = userData;
        }
    } else {
        // Crear nuevo usuario
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        userData.id = newId;
        userData.createdAt = new Date().toISOString().split('T')[0];
        users.push(userData);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    loadUsers();
    closeUserModal();
}

function editUser(userId) {
    openUserModal(userId);
}

function deleteUser(userId) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const filteredUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        loadUsers();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Cargar usuarios al iniciar
    loadUsers();
    
    // Botón para crear usuario
    document.getElementById('createUserBtn').addEventListener('click', function() {
        openUserModal();
    });
    
    // Cerrar modal
    document.querySelector('.close').addEventListener('click', closeUserModal);
    
    // Enviar formulario de usuario
    document.getElementById('userForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userData = {
            id: parseInt(document.getElementById('userId').value) || null,
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            password: document.getElementById('userPassword').value,
            role: document.getElementById('userRole').value
        };
        
        saveUser(userData);
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('userModal');
        if (e.target === modal) {
            closeUserModal();
        }
    });
});

// Funciones para la gestión de productos
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tableBody = document.getElementById('productsTableBody');
    
    tableBody.innerHTML = '';
    
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px;">
                    No hay productos registrados. 
                    <button id="addFirstProduct" class="btn-primary" style="margin-left: 10px; padding: 5px 10px;">
                        Agregar primer producto
                    </button>
                </td>
            </tr>
        `;
        
        document.getElementById('addFirstProduct').addEventListener('click', function() {
            openProductModal();
        });
        
        return;
    }
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.id}</td>
            <td>
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.name}" class="table-image">` : 
                    '<div style="width:50px; height:50px; background:#eee; display:flex; align-items:center; justify-content:center; border-radius:4px;">📷</div>'
                }
            </td>
            <td>${product.name}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${product.stock}</td>
            <td>
                <span class="status-badge ${product.status === 'active' ? 'status-active' : 'status-inactive'}">
                    ${product.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <button class="action-btn edit-btn" data-id="${product.id}">✏️</button>
                <button class="action-btn delete-btn" data-id="${product.id}">🗑️</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Agregar event listeners a los botones
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            deleteProduct(productId);
        });
    });
}

function getCategoryName(categoryKey) {
    const categories = {
        'electronics': 'Electrónicos',
        'clothing': 'Ropa',
        'home': 'Hogar',
        'sports': 'Deportes',
        'books': 'Libros'
    };
    
    return categories[categoryKey] || categoryKey;
}

function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    if (productId) {
        // Modo edición
        modalTitle.textContent = 'Editar Producto';
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.id === productId);
        
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productStatus').value = product.status;
            document.getElementById('productImage').value = product.image || '';
        }
    } else {
        // Modo creación
        modalTitle.textContent = 'Agregar Nuevo Producto';
        form.reset();
        document.getElementById('productId').value = '';
        document.getElementById('productStatus').value = 'active';
    }
    
    modal.style.display = 'block';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Función para guardar producto
function saveProduct(productData) {
    console.log("Guardando producto:", productData);
    
    // Obtener productos actuales
    let products = JSON.parse(localStorage.getItem('products')) || [];
    
    if (productData.id) {
        // Modo edición - Buscar y actualizar producto existente
        const index = products.findIndex(p => p.id == productData.id);
        if (index !== -1) {
            // Preservar la fecha de creación si existe
            if (products[index].createdAt) {
                productData.createdAt = products[index].createdAt;
            }
            products[index] = productData;
            console.log("Producto actualizado:", productData);
        }
    } else {
        // Modo creación - Añadir nuevo producto
        // Generar nuevo ID
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        productData.id = newId;
        productData.createdAt = new Date().toISOString();
        products.push(productData);
        console.log("Nuevo producto añadido:", productData);
    }
    
    // Guardar en localStorage
    localStorage.setItem('products', JSON.stringify(products));
    
    // Recargar la tabla de productos
    loadProducts();
    
    // Cerrar el modal
    closeProductModal();
    
    // Mostrar mensaje de confirmación
    alert(productData.id ? "Producto actualizado correctamente" : "Producto creado correctamente");
}

// Función para cargar productos en la tabla
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tableBody = document.getElementById('productsTableBody');
    
    console.log("Cargando productos:", products);
    
    tableBody.innerHTML = '';
    
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px;">
                    No hay productos registrados. 
                    <button id="addFirstProduct" class="btn-primary" style="margin-left: 10px; padding: 5px 10px;">
                        Agregar primer producto
                    </button>
                </td>
            </tr>
        `;
        
        document.getElementById('addFirstProduct').addEventListener('click', function() {
            openProductModal();
        });
        
        return;
    }
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.id}</td>
            <td>
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.name}" class="table-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"> 
                     <div style="width:50px; height:50px; background:#eee; display:none; align-items:center; justify-content:center; border-radius:4px;">📷</div>` : 
                    '<div style="width:50px; height:50px; background:#eee; display:flex; align-items:center; justify-content:center; border-radius:4px;">📷</div>'
                }
            </td>
            <td>${product.name}</td>
            <td>$${parseFloat(product.price || 0).toFixed(2)}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${product.stock || 0}</td>
            <td>
                <span class="status-badge ${product.status === 'active' ? 'status-active' : 'status-inactive'}">
                    ${product.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <button class="action-btn edit-btn" data-id="${product.id}">✏️</button>
                <button class="action-btn delete-btn" data-id="${product.id}">🗑️</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Agregar event listeners a los botones
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            deleteProduct(productId);
        });
    });
}

// Función para obtener el nombre de la categoría
function getCategoryName(categoryKey) {
    const categories = {
        'electronics': 'Electrónicos',
        'clothing': 'Ropa',
        'home': 'Hogar',
        'sports': 'Deportes',
        'books': 'Libros'
    };
    
    return categories[categoryKey] || categoryKey;
}

// Función para abrir el modal de producto
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    if (productId) {
        // Modo edición
        modalTitle.textContent = 'Editar Producto';
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.id == productId);
        
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productStatus').value = product.status;
            document.getElementById('productImage').value = product.image || '';
        }
    } else {
        // Modo creación
        modalTitle.textContent = 'Agregar Nuevo Producto';
        form.reset();
        document.getElementById('productId').value = '';
        document.getElementById('productStatus').value = 'active';
    }
    
    modal.style.display = 'block';
}

// Función para cerrar el modal
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Función para editar producto
function editProduct(productId) {
    openProductModal(productId);
}

// Función para eliminar producto
function deleteProduct(productId) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.filter(p => p.id != productId);
        localStorage.setItem('products', JSON.stringify(products));
        loadProducts();
        alert('Producto eliminado correctamente');
    }
}

// Event listeners cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cargar productos al iniciar
    loadProducts();
    
    // Botón para crear producto
    const createProductBtn = document.getElementById('createProductBtn');
    if (createProductBtn) {
        createProductBtn.addEventListener('click', function() {
            openProductModal();
        });
    }
    
    // Cerrar modal
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }
    
    // Enviar formulario de producto
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const productData = {
                id: document.getElementById('productId').value ? parseInt(document.getElementById('productId').value) : null,
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                price: parseFloat(document.getElementById('productPrice').value),
                stock: parseInt(document.getElementById('productStock').value),
                category: document.getElementById('productCategory').value,
                status: document.getElementById('productStatus').value,
                image: document.getElementById('productImage').value
            };
            
            saveProduct(productData);
        });
    }
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('productModal');
        if (e.target === modal) {
            closeProductModal();
        }
    });
});

// Cargar productos del carrito
function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsList = document.getElementById('cartItemsList');
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="empty-cart">
                <p>Tu carrito está vacío</p>
                <a href="productos.html" class="continue-shopping">Seguir Comprando</a>
            </div>
        `;
        updateSummary(cart);
        return;
    }
    
    cartItemsList.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">Eliminar</button>
            </div>
        `;
        
        cartItemsList.appendChild(cartItem);
    });
    
    // Agregar event listeners
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            updateQuantity(productId, 1);
        });
    });
    
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            updateQuantity(productId, -1);
        });
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const newQuantity = parseInt(this.value) || 1;
            setQuantity(productId, newQuantity);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });
    
    updateSummary(cart);
}

// Actualizar cantidad de un producto
function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity < 1) {
            item.quantity = 1;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
    }
}

// Establecer cantidad específica
function setQuantity(productId, quantity) {
    if (quantity < 1) quantity = 1;
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
    }
}

// Eliminar producto del carrito
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
    
    // Mostrar mensaje
    showNotification('Producto eliminado del carrito');
}

// Actualizar resumen de compra
function updateSummary(cart) {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 5.99 : 0; // Costo de envío fijo
    const discount = 0; // Por defecto sin descuento
    
    const total = subtotal + shipping - discount;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('discount').textContent = `-$${discount.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Aplicar cupón (solo visual)
document.getElementById('applyCoupon')?.addEventListener('click', function(e) {
    e.preventDefault();
    
    const couponCode = document.getElementById('couponCode').value;
    if (!couponCode) return;
    
    // Simular aplicación de cupón (solo visual)
    document.getElementById('discount').textContent = '-$10.00';
    
    // Recalcular total con descuento
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    
    const subtotal = parseFloat(subtotalElement.textContent.replace('$', ''));
    const shipping = parseFloat(shippingElement.textContent.replace('$', ''));
    const discount = 10.00;
    
    const total = subtotal + shipping - discount;
    totalElement.textContent = `$${total.toFixed(2)}`;
    
    // Mostrar mensaje
    showNotification('Cupón aplicado correctamente');
});

// Proceder al pago
document.getElementById('checkoutBtn')?.addEventListener('click', function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de pagar.');
        return;
    }
    
    alert('¡Gracias por tu compra! En un sistema real, esto te redirigiría a la pasarela de pago.');
    
    // Limpiar carrito después de la compra
    localStorage.removeItem('cart');
    loadCart();
    updateCartCount();
});

// Mostrar notificación
function showNotification(message) {
    // Crear elemento de notificación si no existe
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.classList.add('show');
    
    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Actualizar contador del carrito
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
});

// Función para añadir producto al carrito
function addToCart(productId, productName, productPrice, productImage, quantity = 1) {
    // Obtener carrito actual o inicializar si no existe
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Buscar si el producto ya está en el carrito
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex >= 0) {
        // Si existe, aumentar la cantidad
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Si no existe, añadir nuevo producto
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: quantity
        });
    }
    
    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Actualizar contador del carrito
    updateCartCount();
    
    // Mostrar notificación
    showNotification(`${productName} añadido al carrito`);
    
    return true;
}

// Función para actualizar el contador del carrito
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    console.log("Actualizando contador del carrito. Total items:", totalItems);
    
    // Actualizar todos los elementos con la clase cart-count
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        console.log("Contador actualizado en elemento:", element);
    });
    
    // También actualizar por ID por si acaso
    const cartCountById = document.getElementById('cartCount');
    if (cartCountById) {
        cartCountById.textContent = totalItems;
    }
}

// Función para mostrar notificaciones
function showNotification(message, isError = false) {
    // Eliminar notificación existente si hay una
    const existingNotification = document.querySelector('.cart-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `cart-notification ${isError ? 'error' : 'success'}`;
    notification.textContent = message;
    
    // Añadir estilos si no existen
    if (!document.querySelector('#cart-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'cart-notification-styles';
        styles.textContent = `
            .cart-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 4px;
                color: white;
                z-index: 10000;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: fadeIn 0.3s, fadeOut 0.3s 2.7s forwards;
            }
            .cart-notification.success { background-color: #4CAF50; }
            .cart-notification.error { background-color: #f44336; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Cargar contador al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página cargada, actualizando contador del carrito...");
    updateCartCount();
});

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log("Página visible again, actualizando contador...");
        updateCartCount();
    }
});

function redirectToAdmin() {
    window.location.href = "admin.html";
}
function redirectToAdmin1() {
    window.location.href = "admin_usuario.html";
}
function redirectToAdmi2() {
    window.location.href = "admin_producto.html";
}
function redirectToBlog() {
    window.location.href = "blogs.html";
}
function redirectToCarrito() {
    window.location.href = "carrito.html";
}
function redirectToContact() {
    window.location.href = "contacto.html";
}
function redirectToHome() {
    window.location.href = "index.html";
}
function redirectToLogin() {
    window.location.href = "login.html";
}
function redirectToAbout() {
    window.location.href = "nosotros.html";
}
function redirectToProducts() {
    window.location.href = "productos.html";
}
function redirectToRegister() {
    window.location.href = "registro.html";
}

//Blogs
function redirectToBlog1() {
    window.location.href = "blog1.html";
}
function redirectToBlog2() {
    window.location.href = "blog2.html";
}

//Productos
function redirectToProduct1() {
    window.location.href = "smiski.html";
}
function redirectToProduct2() {
    window.location.href = "pompompurin.html";
}
function redirectToProduct3() {
    window.location.href = "mk.html";
}
function redirectToProduct4() {
    window.location.href = "cinnamoroll.html";
}
function redirectToProduct5() {
    window.location.href = "sanrio.html";
}
function redirectToProduct6() {
    window.location.href = "snoopy.html";
}