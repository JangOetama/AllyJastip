document.addEventListener('DOMContentLoaded', function () {
    const productGrid = document.getElementById('productGrid');
    const categoryFilter = document.getElementById('categoryFilter');
    let productData = [];
    let descriptionData = [];

    // Memuat data produk dan deskripsi
    const loadProducts = () => {
        Promise.all([
            fetch('grouped_products.json').then(response => response.json()), // Menggunakan group_products.json
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

    // Fungsi untuk menghitung tanggal Close PO dan Estimasi Ready
    const calculateDates = () => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Minggu) - 6 (Sabtu)
        const date = today.getDate();
        const month = today.getMonth();
        const year = today.getFullYear();

        // Hitung hari Senin minggu depan
        let daysUntilNextMonday;
        if (dayOfWeek === 1) {
            // Jika hari ini adalah hari Senin, tambahkan 7 hari untuk mendapatkan Senin minggu depan
            daysUntilNextMonday = 7;
        } else {
            // Untuk hari lain, hitung berapa hari lagi sampai hari Senin minggu depan
            daysUntilNextMonday = (8 - dayOfWeek) % 7;
        }

        const closePODate = new Date(year, month, date + daysUntilNextMonday);

        // Estimasi ready: Tidak ada tanggal pasti, hanya pesan default
        const estimasiReadyMessage = "Maksimal 1 minggu setelah pembayaran";

        return {
            closePO: formatDate(closePODate),
            estimasiReady: estimasiReadyMessage,
        };
    };

    // Fungsi untuk memformat tanggal menjadi "dd MMMM yyyy"
    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    };

    // Render produk dalam grid
    const renderProducts = (category = 'All') => {
        productGrid.innerHTML = '';
        const filteredProducts = category === 'All'
            ? productData
            : productData.filter(product => {
                const desc = descriptionData.find(desc => product.name.includes(desc.itemCode)); // Sesuaikan dengan grup
                return desc && desc.categoryType === category;
            });

        // Hitung tanggal Close PO dan Estimasi Ready
        const { closePO, estimasiReady } = calculateDates();

        filteredProducts.forEach(product => {
            const description = descriptionData.find(desc => product.name.includes(desc.itemCode)); // Sesuaikan dengan grup

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

            const fullDescription = `🌟 *[JASTIP LOCK & LOCK ${product.name.join(', ')} ${itemName}]* 🌟  \n
🔥 *Harga Spesial Ally Jastip :*
    ~Rp ${formatPrice(originalPrice)}~ → *Rp ${formatPrice(jastipPrice)}* _(Hemat Rp ${formatPrice(originalPrice - jastipPrice)}!)_

🎯 *Skema Diskon Menarik :*
✅ Min. *${min1} pcs → Rp ${formatPrice(jastipPrice1)}/pcs*
✅ Min. *${min2} pcs → Rp ${formatPrice(jastipPrice2)}/pcs*
✅ Min. *${min3} pcs → Rp ${formatPrice(jastipPrice3)}/pcs*

📦 *Deskripsi Produk :*
${descriptionText}
📅 *Detail Order :*
- Close PO: _${closePO}_
- Estimasi Ready: _${estimasiReady}_

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
    <div class="product-images">
        ${product.image.map((img, index) => `
            <a href="/AllyJastip/detail.html?item=${product.name[index]}">
                <img src="${img}" alt="${product.name[index]}">
            </a>
        `).join('')}
    </div>
    <h3>${product.name.join(', ')}</h3>
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
            onclick="downloadImages(${JSON.stringify(product.image)}, ${JSON.stringify(product.name)})"
        >
            Download Gambar
        </button>
    </div>
`;
            productGrid.appendChild(productCard);
        });
    };

    // Fungsi untuk mengunduh semua gambar dalam grup
    window.downloadImages = (urls, filenames) => {
        urls.forEach((url, index) => {
            const proxiedUrl = `https://cors-anywhere.herokuapp.com/${url}`; // Tambahkan proxy
            console.log('Downloading image from:', proxiedUrl);
            console.log('Filename:', filenames[index]);

            fetch(proxiedUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error fetching image: ${response.status}`);
                    }
                    return response.blob();
                })
                .then(blob => {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `${filenames[index]}.jpg`;
                    link.click();
                    URL.revokeObjectURL(link.href); // Bersihkan URL setelah digunakan
                })
                .catch(error => console.error('Error downloading image:', error));
        });
    };

    // Fungsi filter produk berdasarkan kategori
    window.filterProducts = (category) => {
        renderProducts(category);
    };

    // Memuat data saat halaman dimuat
    loadProducts();
});
