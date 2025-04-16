document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#productTable tbody');
    let productData = [];
    let descriptionData = [];

    // Fungsi untuk memuat data produk dan deskripsi
    const loadProducts = () => {
        Promise.all([
            fetch('products.json').then(response => response.json()),
            fetch('description.json').then(response => response.json())
        ])
            .then(([products, descriptions]) => {
                productData = products;
                descriptionData = descriptions;
                renderTable();
            })
            .catch(error => console.error('Error fetching data:', error));
    };

    // Fungsi untuk merender tabel
    const renderTable = () => {
        const jastipDiscount = parseFloat(document.getElementById('jastipDiscount').value) || 0;
        const min1 = parseInt(document.getElementById('min1').value) || 3;
        const min2 = parseInt(document.getElementById('min2').value) || 5;
        const min3 = parseInt(document.getElementById('min3').value) || 10;
        const dpPercentage = parseFloat(document.getElementById('dpPercentage').value) || 50;

        tableBody.innerHTML = '';

        productData.forEach(product => {
            // Mencari deskripsi yang sesuai berdasarkan itemCode
            const description = descriptionData.find(desc => desc.itemCode === product.name);

            // Parsing harga
            const parsePrice = (price) => parseFloat(price.replace(/,/g, ''));
            const originalPrice = parsePrice(product.originalPrice);
            const discountPercentage = parseFloat(product.discountPercentage);

            // Menghitung harga setelah diskon
            const baseDiscountedPrice = originalPrice * (1 - discountPercentage / 100);
            const jastipPrice = originalPrice * (1 - (discountPercentage - jastipDiscount) / 100);
            const dpJastipPrice = jastipPrice * (1 - dpPercentage / 100);

            const jastipPrice1 = originalPrice * (1 - (discountPercentage - (jastipDiscount - 1)) / 100);
            const jastipPrice2 = originalPrice * (1 - (discountPercentage - (jastipDiscount - 2)) / 100);
            const jastipPrice3 = originalPrice * (1 - (discountPercentage - (jastipDiscount - 3)) / 100);

            // Format harga
            const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);

            // Membuat deskripsi baru berdasarkan description.json
            const generateDescription = (desc) => {
                if (!desc) return 'Deskripsi tidak tersedia';

                const capacityML = desc.capacityML ? `${desc.capacityML} mL` : '';
                const capacityL = desc.capacityL ? `${desc.capacityL} L` : '';
                const category = [desc.categoryType, desc.typeProduct, desc.productType].filter(Boolean).join('-');
                const color = desc.itemColor ? `- Warna: ${desc.itemColor}` : '';
                const pattern = desc.itemPattern ? `- Pola: ${desc.itemPattern}` : '';

                return `- Nama Item: ${desc.itemNamebyHC || desc.itemName}
- Kapasitas: ${[capacityML, capacityL].filter(Boolean).join(', ')}
- Kategori: ${category}
${color ? `${color}\n` : ''}
${pattern ? `${pattern}\n` : ''}`;
            };

            const descriptionText = generateDescription(description);

            const fullDescription = `‼️ *Barang Lock & Lock ${product.name}*  \n
*Harga Ally Jastip :* 
    ~Rp ${formatPrice(originalPrice)}~
    *Rp ${formatPrice(jastipPrice)}*\n
*Skema Diskon :*
    Min. ${min1} pcs : Rp ${formatPrice(jastipPrice1)} /pcs
    Min. ${min2} pcs : Rp ${formatPrice(jastipPrice2)} /pcs
    Min. ${min3} pcs : Rp ${formatPrice(jastipPrice3)} /pcs\n
*🌻 Deskripsi :*
${descriptionText}
*🌱 Detail Order :*
* Close PO 17 April 25*
* Estimasi ready end Juni 25*\n\n
====================
List : Nama + 4 Digit No WA
1. ...
            `;

            // Membuat baris tabel
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: auto;"></td>
                <td>${product.name}</td>
                <td>Rp ${formatPrice(originalPrice)}</td>
                <td>Rp ${formatPrice(baseDiscountedPrice)}</td>
                <td>${discountPercentage}%</td>
                <td style="white-space: pre-wrap;">${fullDescription}</td>
            `;
            tableBody.appendChild(row);
        });
    };

    // Event listener untuk form submit
    document.getElementById('configForm').addEventListener('submit', function (event) {
        event.preventDefault();
        renderTable();
    });

    // Memuat data saat halaman dimuat
    loadProducts();
});
