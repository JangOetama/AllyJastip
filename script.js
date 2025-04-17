document.addEventListener('DOMContentLoaded', function () {
    const productGrid = document.getElementById('productGrid');
    const categoryFilter = document.getElementById('categoryFilter');
    let productData = [];
    let descriptionData = [];

    // Memuat data produk dan deskripsi
    const loadProducts = () => {
        Promise.all([
            fetch('products.json').then(response => response.json()),
            fetch('description.json').then(response => response.json())
        ])
            .then(([products, descriptions]) => {
                productData = products;
                descriptionData = descriptions;
                renderCategories();
                renderProducts();
            })
            .catch(error => console.error('Error fetching data:', error));
    };

    // Render filter kategori
    const renderCategories = () => {
        const categories = ['All', ...new Set(descriptionData.map(desc => desc.categoryType))];
        categoryFilter.innerHTML = `
            ${categories.map(category => `<button onclick="filterProducts('${category}')">${category}</button>`).join('')}
        `;
    };

    // Render produk dalam grid
    const renderProducts = (category = 'All') => {
        productGrid.innerHTML = '';
        const filteredProducts = category === 'All'
            ? productData
            : productData.filter(product => {
                const desc = descriptionData.find(desc => desc.itemCode === product.name);
                return desc && desc.categoryType === category;
            });

        filteredProducts.forEach(product => {
            const description = descriptionData.find(desc => desc.itemCode === product.name);
            const originalPrice = parseFloat(product.originalPrice.replace(/,/g, ''));
            const discountedPrice = parseFloat(product.discountedPrice.replace(/,/g, ''));

            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <a href="/AllyJastip/${product.name}">
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p><s>Rp ${originalPrice.toLocaleString()}</s> Rp ${discountedPrice.toLocaleString()}</p>
                </a>
            `;
            productGrid.appendChild(productCard);
        });
    };

    // Fungsi filter produk berdasarkan kategori
    window.filterProducts = (category) => {
        renderProducts(category);
    };

    // Memuat data saat halaman dimuat
    loadProducts();
});
