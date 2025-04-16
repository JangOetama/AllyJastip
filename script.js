document.addEventListener('DOMContentLoaded', function() {
    fetch('products.json')
        .then(response => response.json())
        .then(productData => {
            const tableBody = document.querySelector('#productTable tbody');

            productData.forEach(product => {
                // Fungsi untuk mengonversi harga dari string ke angka
                const parsePrice = (price) => {
                    return parseFloat(price.replace(/,/g, '')); // Hapus koma dan konversi ke float
                };

                // Parsing data harga dari JSON
                const originalPrice = parsePrice(product.originalPrice);
                const discountPercentage = parseFloat(product.discountPercentage);

                // Hitung harga setelah diskon jastip (10% dari harga awal)
                const jastipDiscount = 10; // Jastip discount percentage
                const baseDiscountedPrice = originalPrice * (1 - (discountPercentage) / 100);
                const jastipPrice = originalPrice * (1 - (discountPercentage - jastipDiscount) / 100);

                // Hitung DP berdasarkan skema diskon
                const dpPercentage = 50; // DP is 50% of the final price
                const min3Discount = 9; // Min. 3 pcs discount
                const min5Discount = 8; // Min. 5 pcs discount
                const min10Discount = 7; // Min. 10 pcs discount

                const calculateDP = (quantity, discount) => {
                    const finalPrice = jastipPrice * (1 - discount / 100);
                    return (finalPrice * dpPercentage) / 100;
                };

                const dp3 = calculateDP(3, min3Discount);
                const dp5 = calculateDP(5, min5Discount);
                const dp10 = calculateDP(10, min10Discount);

                // Format harga dengan pemisah ribuan
                const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);

                // Deskripsi produk
                const description = `
                    ‼️ Open PO Barang Lock N Lock \n
                    Harga JKK : 
                    Rp ${formatPrice(jastipPrice)}\n
                    DP Rp ${formatPrice(dp3)}/pcs (Min. 3 pcs)\n
                    DP Rp ${formatPrice(dp5)}/pcs (Min. 5 pcs)\n
                    DP Rp ${formatPrice(dp10)}/pcs (Min. 10 pcs)\n
                    \n
                    🌻 Deskripsi :\n
                    ${product.description || 'Tidak ada deskripsi'}\n
                    \n
                    🌱 Detail Order :\n
                    * Close PO 17 April 25\n
                    * Estimasi ready end Juni 25
                `;

                // Buat baris tabel
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: auto;"></td>
                    <td>${product.name}</td>
                    <td>Rp ${formatPrice(originalPrice)}</td>
                    <td>Rp ${formatPrice(baseDiscountedPrice)}</td>
                    <td>${discountPercentage}%</td>
                    <td style="white-space: pre-wrap;">${description}</td> <!-- Deskripsi -->
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching product data:', error));
});
