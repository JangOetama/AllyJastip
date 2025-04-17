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
        const discountPercentage = parseFloat(product.discountPercentage);
        const jastipDiscount = 10; // Diskon Jastip tetap 10%
        const min1 = 3, min2 = 5, min3 = 10;

        // Menghitung harga setelah diskon
        const baseDiscountedPrice = originalPrice * (1 - discountPercentage / 100);
        const jastipPrice = originalPrice * (1 - (discountPercentage - jastipDiscount) / 100);
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

        // Update Open Graph Meta Tags
        document.getElementById('ogTitle').setAttribute('content', `JASTIP LOCK & LOCK ${product.name} ${itemName}`);
        document.getElementById('ogDescription').setAttribute('content', fullDescription);
        document.getElementById('ogImage').setAttribute('content', product.image);
        document.getElementById('ogUrl').setAttribute('content', window.location.href);

        // Menampilkan detail produk
        productDetail.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="watermarked">
            <h2>${product.name}</h2>
            <p><s>Rp ${formatPrice(originalPrice)}</s> Rp ${formatPrice(jastipPrice)}</p>
            <p style="white-space: pre-wrap;">${fullDescription}</p>
            <a href="https://wa.me/?text=${encodeURIComponent(fullDescription)}" class="chat-admin">Chat Admin</a>
        `;
    };

    // Memuat data saat halaman dimuat
    loadProducts();
});
