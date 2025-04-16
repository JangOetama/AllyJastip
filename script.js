document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('#productTable tbody');
    let productData = []; 

    const loadProducts = () => {
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                productData = data;
                renderTable(); 
            })
            .catch(error => console.error('Error fetching product data:', error));
    };

    const renderTable = () => {
        const min1 = parseInt(document.getElementById('min1').value) || 3;
        const min2 = parseInt(document.getElementById('min2').value) || 5;
        const min3 = parseInt(document.getElementById('min3').value) || 10;
        const jastipDiscount = parseFloat(document.getElementById('jastipDiscount').value) || 10;
        const dpPercentage = parseFloat(document.getElementById('dpPercentage').value) || 50;
        const min3Discount = parseFloat(document.getElementById('min3Discount').value) || 9;
        const min5Discount = parseFloat(document.getElementById('min5Discount').value) || 8;
        const min10Discount = parseFloat(document.getElementById('min10Discount').value) || 7;

        tableBody.innerHTML = '';

        productData.forEach(product => {
            const parsePrice = (price) => {
                return parseFloat(price.replace(/,/g, '')); 
            };

            const originalPrice = parsePrice(product.originalPrice);
            const discountPercentage = parseFloat(product.discountPercentage);

            const baseDiscountedPrice = originalPrice * (1 - discountPercentage / 100);
            const jastipPrice = originalPrice * (1 - (discountPercentage - jastipDiscount) / 100);
            const dpJastipPrice = jastipPrice * (1 - dpPercentage / 100);

            const jastipPrice1 = originalPrice * (1 - (discountPercentage - min3Discount) / 100);
            const jastipPrice2 = originalPrice * (1 - (discountPercentage - min5Discount) / 100);
            const jastipPrice3 = originalPrice * (1 - (discountPercentage - min10Discount) / 100);

            const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);

            const description = `
                ‼️ *Open PO Barang Lock N Lock ${product.name}*  \n
                *Harga JKK :* 
                ~Rp ${formatPrice(originalPrice)}~
                Rp ${formatPrice(jastipPrice)}
                *DP Rp ${formatPrice(dpJastipPrice)} /pcs*\n
                *Skema Diskon :*
                Min. ${min1} pcs : Rp ${formatPrice(jastipPrice1)} /pcs
                Min. ${min2} pcs : Rp ${formatPrice(jastipPrice2)} /pcs
                Min. ${min3} pcs : Rp ${formatPrice(jastipPrice3)} /pcs\n
                *🌻 Deskripsi :*
                ${product.description || 'Tidak ada deskripsi'}\n
                \n
                *🌱 Detail Order :*
                * Close PO 17 April 25*
                * Estimasi ready end Juni 25*
            `;
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
    };

    document.getElementById('configForm').addEventListener('submit', function(event) {
        event.preventDefault(); 
        renderTable(); 
    });

    loadProducts();
});
