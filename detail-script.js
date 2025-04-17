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

        const itemName = desc.itemName ?? 'Nama Tidak Tersedia';
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
        const jastipDiscount = 10;
        const min1 = 3, min2 = 5, min3 = 10;
        const jastipPrice = originalPrice * (1 - (discountPercentage - jastipDiscount) / 100);
        const jastipPrice1 = originalPrice * (1 - (discountPercentage - (jastipDiscount - 1)) / 100);
        const jastipPrice2 = originalPrice * (1 - (discountPercentage - (jastipDiscount - 2)) / 100);
        const jastipPrice3 = originalPrice * (1 - (discountPercentage - (jastipDiscount - 3)) / 100);

        const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);

        const { itemName, descriptionText } = generateDescription(description);

        const fullDescription = `🌟 *[JASTIP LOCK & LOCK ${product.name} ${itemName}]* 🌟  
🔥 *Harga Spesial Ally Jastip :*
    ~Rp ${formatPrice(originalPrice)}~ → *Rp ${formatPrice(jastipPrice)}* _(Hemat Rp ${formatPrice(originalPrice - jastipPrice)}!)_
🎯 *Skema Diskon Menarik :*
✅ Min. *${min1} pcs → Rp ${formatPrice(jastipPrice1)}/pcs*
✅ Min. *${min2} pcs → Rp ${formatPrice(jastipPrice2)}/pcs*
✅ Min. *${min3} pcs → Rp ${formatPrice(jastipPrice3)}/pcs*
📦 *Deskripsi Produk :*
${descriptionText}`;

        // Update Open Graph Meta Tags
        document.getElementById('ogTitle').setAttribute('content', `JASTIP LOCK & LOCK ${product.name} ${itemName}`);
        document.getElementById('ogDescription').setAttribute('content', fullDescription);
        document.getElementById('ogImage').setAttribute('content', product.image);
        document.getElementById('ogUrl').setAttribute('content', window.location.href);

        // Menampilkan detail produk
        productDetail.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="content">
                <h1>${product.name}</h1>
                <p class="price">Rp ${formatPrice(jastipPrice)} 
                    <span class="original-price">Rp ${formatPrice(originalPrice)}</span>
                </p>
                <p class="description">${fullDescription}</p>
                <div class="cta-buttons">
                    <button class="share-btn" onclick="window.open('${createWhatsAppLink(fullDescription)}', '_blank');">
                        Share to WhatsApp
                    </button>
                    <button class="download-btn" onclick="downloadImage('${product.image}', '${product.name}.jpg')">
                        Download Gambar
                    </button>
                </div>
            </div>
        `;
    };

    // Fungsi untuk membuat tautan WhatsApp
    const createWhatsAppLink = (description) => {
        const text = encodeURIComponent(description);
        return `https://wa.me/?text=${text}`;
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
                URL.revokeObjectURL(link.href);
            })
            .catch(error => console.error('Error downloading image:', error));
    };

    // Memuat data saat halaman dimuat
    loadProducts();
});
