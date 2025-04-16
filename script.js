document.addEventListener('DOMContentLoaded', function() {
    fetch('products.json')
        .then(response => response.json())
        .then(productData => {
            const tableBody = document.querySelector('#productTable tbody');

            productData.forEach(product => {
                // Hitung harga setelah diskon jastip (10% dari harga awal)
                const jastipDiscount = 10; // Jastip discount percentage
                const baseDiscountedPrice = product.originalPrice * (1 - product.discountPercentage / 100);
                const jastipPrice = baseDiscountedPrice * (1 - jastipDiscount / 100);

                // Hitung DP berdasarkan skema diskon
                const dpPercentage = 50; // DP is 50% of the final price
                const min3Discount = 9; // Min. 3 pcs discount
                const min5Discount = 8; // Min. 5 pcs discount
                const min10Discount = 7; // Min. 10 pcs discount

                const calculateDP = (quantity, discount) => {
                    const finalPrice = baseDiscountedPrice * (1 - discount / 100);
                    return (finalPrice * dpPercentage) / 100;
                };

                const dp3 = calculateDP(3, min3Discount);
                const dp5 = calculateDP(5, min5Discount);
                const dp10 = calculateDP(10, min10Discount);

                // Format harga dengan pemisah ribuan
                const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);

                // Deskripsi produk
                const description = `
                    ‼️ Open PO Barang Lock N Lock\n
                    Harga JKK : ${formatPrice(product.originalPrice)}\n
                    DP Rp ${formatPrice(dp3)}/pcs (Min. 3 pcs)\n
                    DP Rp ${formatPrice(dp5)}/pcs (Min. 5 pcs)\n
                    DP Rp ${formatPrice(dp10)}/pcs (Min. 10 pcs)\n
                    \n
                    🌻 Deskripsi :\n
                    ${product.description}\n
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
                    <td>Rp ${formatPrice(product.originalPrice)}</td>
                    <td>Rp ${formatPrice(jastipPrice)}</td>
                    <td>${product.discountPercentage}%</td>
                    <td style="white-space: pre-wrap;">${description}</td> <!-- Deskripsi -->
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching product data:', error));
});
