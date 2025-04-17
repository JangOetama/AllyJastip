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

    // Fungsi untuk menghasilkan deskripsi produk
    const generateDescription = (desc) => {
        if (!desc) return 'Deskripsi tidak tersedia';

        const itemName = desc.itemName ?? 'Nama Tidak Tersedia'; // Nilai default jika undefined
        const capacityML = desc.capacityML ? `${Math.round(parseFloat(desc.capacityML))} mL` : '';
        const capacityL = desc.capacityL ? `${parseFloat(desc.capacityL).toFixed(1)} L` : '';
        const category = [desc.categoryType, desc.typeProduct, desc.productType].filter(Boolean).join(' | ');
        const color = desc.itemColor ? `- *Warna :* ${desc.itemColor}` : '';
        const pattern = desc.itemPattern ? `- *Pola :* ${desc.itemPattern}` : '';

        return {
            itemName,
            descriptionText: `- *Nama Item :* ${desc.itemNamebyHC ?? itemName}
- *Kapasitas :* ${[capacityML, capacityL].filter(Boolean).join(', ')}
- *Kategori :* ${category}
${color ? `${color}\n` : ''}
${pattern ? `${pattern}\n` : ''}`
        };
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
            const min1 = 3, min2 = 5, min3 = 10;
            const jastipPrice1 = originalPrice * (1 - (discountPercentage - (jastipDiscount - 1)) / 100);
            const jastipPrice2 = originalPrice * (1 - (discountPercentage - (jastipDiscount - 2)) / 100);
            const jastipPrice3 = originalPrice * (1 - (discountPercentage - (jastipDiscount - 3)) / 100);
            // Format harga
            const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);

            // Menghasilkan deskripsi produk
            const { itemName, descriptionText } = generateDescription(description);

            const fullDescription = `🌟 *[JASTIP LOCK & LOCK ${product.name} ${itemName}]* 🌟  \n
🔥 *Harga Spesial Ally Jastip :*
    ~Rp ${formatPrice(originalPrice)}~ → *Rp ${formatPrice(jastipPrice)}* _(Hemat Rp ${formatPrice(originalPrice - jastipPrice)}!)_

🎯 *Skema Diskon Menarik :*
✅ Min. *${min1} pcs → Rp ${formatPrice(jastipPrice1)}/pcs*
✅ Min. *${min2} pcs → Rp ${formatPrice(jastipPrice2)}/pcs*
✅ Min. *${min3} pcs → Rp ${formatPrice(jastipPrice3)}/pcs*

📦 *Deskripsi Produk :*
${descriptionText}📅 *Detail Order :*
- Close PO: _17 April 2025_
- Estimasi Ready: _Akhir Juni 2025_

⚠️ *Catatan Penting :*
- Pembelian minimal *1* pcs .
- Barang dikirim sesuai urutan pembayaran.
- Pastikan cek stok warna sebelum memesan!

====================
🛒 List Pemesanan :
    Nama + 4 Digit Akhir No WA
1. ...
`;

            // Fungsi untuk membuat tautan WhatsApp
            const createWhatsAppLink = (description) => {
                const text = encodeURIComponent(description);
                return `https://wa.me/?text=${text}`;
            };

            const productCard = document.createElement('div');
productCard.classList.add('product-card');
productCard.innerHTML = `
    <a href="/AllyJastip/detail.html?item=${product.name}">
        <img src="${product.image}" alt="${itemName}">
        <h3>${itemName}</h3>
    </a>
    <p><s>Rp ${formatPrice(originalPrice)}</s> Rp ${formatPrice(jastipPrice)}</p>
    <div class="product-actions">
        <button 
            class="share-btn" 
            onclick="window.open('${createWhatsAppLink(fullDescription)}', '_blank');"
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

    // Fungsi untuk mengunduh gambar
    window.downloadImage = (url, filename) => {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                link.click();
            })
            .catch(error => console.error('Error downloading image:', error));
    };

    // Fungsi filter produk berdasarkan kategori
    window.filterProducts = (category) => {
        renderProducts(category);
    };

    // Memuat data saat halaman dimuat
    loadProducts();
});
