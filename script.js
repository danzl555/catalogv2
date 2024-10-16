async function loadProducts() {
    try {
        const response = await fetch('https://dummyjson.com/products');
        const data = await response.json();
        const products = data.products;

        const root = document.getElementById('product-container');
        const cart = document.querySelector('.product-cart-bascket');
        const totalPriceElement = document.querySelector('.total__price');
        const showMoreButton = document.createElement('button');
        const checkoutButton = document.querySelector('.checkout-btn');

        let total = 0;
        let cartItems = {};
        let currentProductIndex = 0;

        showMoreButton.textContent = 'Show More';
        showMoreButton.classList.add('show-more-button');
        root.appendChild(showMoreButton);

        if (localStorage.getItem('cartItems')) {
            cartItems = JSON.parse(localStorage.getItem('cartItems'));
            Object.values(cartItems).forEach(item => {
                displayCartItem(item.product, item.quantity);
                total += item.quantity * item.product.price;
            });
            updateTotalPrice();
        }

        function loadMoreProducts() {
            const endIndex = Math.min(currentProductIndex + 9, products.length);
            for (let i = currentProductIndex; i < endIndex; i++) {
                const product = products[i];
                const card = document.createElement('div');
                card.classList.add('card');

                card.innerHTML = `
                    <img
                        src="${product.thumbnail}"
                        class="product-image"
                        alt="${product.title}"
                    />
                    <h2 class="title">${product.title}</h2>
                    <p class="desc">${product.description}</p>
                    <div class="price-cart">
                        <p class="price">$${product.price}</p>
                        <button class="buy-button">
                            <img src="./img/cart-icon.png" alt="cart icon" />
                        </button>
                    </div>
                `;

                const buyButton = card.querySelector('.buy-button');
                buyButton.addEventListener('click', () => {
                    addToCart(product);
                });

                root.insertBefore(card, showMoreButton);
            }
            currentProductIndex += 9;
            if (currentProductIndex >= products.length) {
                showMoreButton.style.display = 'none';
            }
        }

        loadMoreProducts();
        showMoreButton.addEventListener('click', loadMoreProducts);

        function addToCart(product) {
            if (cartItems[product.id]) {
                cartItems[product.id].quantity++;
                const itemElement = cart.querySelector(`.cart-item-${product.id}`);
                const quantityElement = itemElement.querySelector('.quantity');
                const priceElement = itemElement.querySelector('.price');
                quantityElement.textContent = `x${cartItems[product.id].quantity}`;
                priceElement.textContent = `$${(cartItems[product.id].quantity * product.price).toFixed(2)}`;
            } else {
                cartItems[product.id] = { product, quantity: 1 };
                displayCartItem(product, 1);
            }

            total += product.price;
            updateTotalPrice();
            saveCartToLocalStorage();
        }

        function displayCartItem(product, quantity) {
            const cartItem = document.createElement('div');
            cartItem.classList.add('product-card', `cart-item-${product.id}`);

            cartItem.innerHTML = `
                <img src="${product.thumbnail}" alt="${product.title}" />
                <div class="product-info">
                    <h3>${product.title}</h3>
                    <p class="quantity">x${quantity}</p>
                    <p class="price">$${(quantity * product.price).toFixed(2)}</p>
                </div>
                <span class="close-btn">&times;</span>
            `;

            const closeBtn = cartItem.querySelector('.close-btn');
            closeBtn.addEventListener('click', () => {
                removeFromCart(product.id);
            });

            cart.appendChild(cartItem);
        }

        function removeFromCart(productId) {
            const cartItem = cart.querySelector(`.cart-item-${productId}`);
            const quantity = cartItems[productId].quantity;
            const productPrice = cartItems[productId].product.price;

            total -= productPrice * quantity;
            cartItem.remove();
            delete cartItems[productId];

            updateTotalPrice();
            saveCartToLocalStorage();
        }

        function updateTotalPrice() {
            totalPriceElement.textContent = `$${total.toFixed(2)}`;
        }

        function saveCartToLocalStorage() {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        }

        // Обработчик события для кнопки CHECKOUT
        checkoutButton.addEventListener('click', () => {
            cartItems = {}; // Очищаем корзину
            total = 0; // Обнуляем общую сумму
            cart.innerHTML = ''; // Удаляем все товары из корзины
            updateTotalPrice(); // Обновляем отображение общей суммы
            localStorage.removeItem('cartItems'); // Удаляем корзину из localStorage
        });

    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
    }
}

window.onload = loadProducts;
