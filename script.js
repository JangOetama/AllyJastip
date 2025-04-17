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

            // Parsing harga
            const parsePrice = (price) => parseFloat(price.replace(/,/g, ''));
            const originalPrice = parsePrice(product.originalPrice);
            const discountPercentage = parseFloat(product.discountPercentage);
            const jastipDiscount = 10; // Diskon Jastip tetap 10%
            const jastipPrice = originalPrice * (1 - (discountPercentage - jastipDiscount) / 100);

            // Format harga
            const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);

            // Gunakan itemName dari description.json
            const itemName = description?.itemName ?? 'Nama Tidak Tersedia';

            // Fungsi untuk membuat tautan WhatsApp
            const createWhatsAppLink = (description, imageUrl) => {
                const text = encodeURIComponent(description);
                return `https://wa.me/?text=${text}`;
            };

            // Membuat deskripsi baru berdasarkan description.json
            const generateDescription = (desc) => {
                if (!desc) return 'Deskripsi tidak tersedia';
                const capacityML = desc.capacityML ? `${Math.round(parseFloat(desc.capacityML))} mL` : '';
                const capacityL = desc.capacityL ? `${parseFloat(desc.capacityL).toFixed(1)} L` : '';
                const category = [desc.categoryType, desc.typeProduct, desc.productType].filter(Boolean).join(' | ');
                const color = desc.itemColor ? `- *Warna :* ${desc.itemColor}` : '';
                const pattern = desc.itemPattern ? `- *Pola :* ${desc.itemPattern}` : '';
                return {
                    itemName: desc.itemName ?? 'Nama Tidak Tersedia',
                    descriptionText: `- *Nama Item :* ${desc.itemNamebyHC ?? desc.itemName}
- *Kapasitas :* ${[capacityML, capacityL].filter(Boolean).join(', ')}
- *Kategori :* ${category}
${color ? `${color}\n` : ''}
${pattern ? `${pattern}\n` : ''}`
                };
            };

            const { itemName, descriptionText } = generateDescription(description);

            const fullDescription = `🌟 *[JASTIP LOCK & LOCK ${product.name} ${itemName}]* 🌟  
🔥 *Harga Spesial Ally Jastip :*
    ~Rp ${formatPrice(originalPrice)}~ → *Rp ${formatPrice(jastipPrice)}* _(Hemat Rp ${formatPrice(originalPrice - jastipPrice)}!)_
📦 *Deskripsi Produk :*
${descriptionText}`;

            // Tombol Download Gambar
            const downloadImage = (url, name) => {
                const link = document.createElement('a');
                link.href = url;
                link.download = name || 'image.jpg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${product.image}" alt="${itemName}">
                <h3>${itemName}</h3>
                <p><s>Rp ${formatPrice(originalPrice)}</s> Rp ${formatPrice(jastipPrice)}</p>
                <div class="product-actions">
                    <button 
                        class="share-btn" 
                        onclick="window.open('${createWhatsAppLink(fullDescription, product.image)}', '_blank');"
                    >
                        Share to WhatsApp
                    </button>
                    <button 
                        class="download-btn" 
                        onclick="downloadImage('${product.image}', '${product.name}.jpg')"
                    >
                        Download Gambar
                    </button>
                </div>
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
