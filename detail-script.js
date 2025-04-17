document.addEventListener('DOMContentLoaded', function () {
    const productDetail = document.getElementById('productDetail');
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
                renderProductDetail();
            })
            .catch(error => console.error('Error fetching data:', error));
    };

    // Mendapatkan query parameter
    const getProductFromQuery = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('item');
    };

    // Render detail produk
    const renderProductDetail = () => {
        const productCode = getProductFromQuery();
        if (!productCode) {
            productDetail.innerHTML = '<h1>Produk tidak ditemukan</h1>';
            return;
        }

        const product = productData.find(p => p.name === productCode);
        const description = descriptionData.find(desc => desc.itemCode === productCode);

        if (!product || !description) {
            productDetail.innerHTML = '<h1>Produk tidak ditemukan</h1>';
            return;
        }

        const originalPrice = parseFloat(product.originalPrice.replace(/,/g, ''));
        const discountedPrice = parseFloat(product.discountedPrice.replace(/,/g, ''));

        productDetail.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="watermarked">
            <h2>${product.name}</h2>
            <p><s>Rp ${originalPrice.toLocaleString()}</s> Rp ${discountedPrice.toLocaleString()}</p>
            <p>${description.descriptionText}</p>
            <a href="https://wa.me/admin_link" class="chat-admin">Chat Admin</a>
        `;
    };

    // Memuat data saat halaman dimuat
    loadProducts();
});
