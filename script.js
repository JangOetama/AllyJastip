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

                const jastipDiscount = 10;
                const baseDiscountedPrice = originalPrice * (1 - (discountPercentage) / 100);
                const jastipPrice = originalPrice * (1 - (discountPercentage - jastipDiscount) / 100);
                const dpPercentage = 50; 
                const dpJastipPrice = jastipPrice * (1- dpPercentage /100)

                const min3Discount = 9; // Min. 3 pcs discount
                const min5Discount = 8; // Min. 5 pcs discount
                const min10Discount = 7; // Min. 10 pcs discount
                
                const jastipPrice3 = originalPrice * (1 - (discountPercentage - min3Discount) / 100);
                const jastipPrice5 = originalPrice * (1 - (discountPercentage - min5Discount) / 100);
                const jastipPrice10 = originalPrice * (1 - (discountPercentage - min10Discount) / 100);

                // Format harga dengan pemisah ribuan
                const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);

                // Deskripsi produk
                const description = `
                    ‼️ *Open PO Barang Lock N Lock ${product.name}*  \n
                    *Harga JKK :* 
                    Rp ${formatPrice(jastipPrice)}
                    *DP Rp ${formatPrice(dpJastipPrice)} /pcs*\n
                    *Skema Diskon :*
                    Min. 3 pcs : Rp ${formatPrice(jastipPrice3)} /pcs
                    Min. 5 pcs : Rp ${formatPrice(jastipPrice5)} /pcs
                    Min. 10 pcs : Rp ${formatPrice(jastipPrice10)} /pcs\n
                    *🌻 Deskripsi :*
                    ${product.description || 'Tidak ada deskripsi'}\n
                    \n
                    *🌱 Detail Order :*
                    * Close PO 17 April 25*
                    * Estimasi ready end Juni 25*
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
