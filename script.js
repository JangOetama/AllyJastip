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
        const jastipDiscount = parseFloat(document.getElementById('jastipDiscount').value) || 0;
        const min1 = parseInt(document.getElementById('min1').value) || 3;
        const min2 = parseInt(document.getElementById('min2').value) || 5;
        const min3 = parseInt(document.getElementById('min3').value) || 10;
        const dpPercentage = parseFloat(document.getElementById('dpPercentage').value) || 50;

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

            const jastipPrice1 = originalPrice * (1 - (discountPercentage - (jastipDiscount-1)) / 100);
            const jastipPrice2 = originalPrice * (1 - (discountPercentage - (jastipDiscount-2)) / 100);
            const jastipPrice3 = originalPrice * (1 - (discountPercentage - (jastipDiscount-3)) / 100);

            const formatPrice = (price) => new Intl.NumberFormat('id-ID').format(price);

            const description = `‼️ *Barang Lock & Lock ${product.name}*  \n
*Harga Ally Jastip :* 
    ~Rp ${formatPrice(originalPrice)}~
    *Rp ${formatPrice(jastipPrice)}*\n
*Skema Diskon :*
    Min. ${min1} pcs : Rp ${formatPrice(jastipPrice1)} /pcs
    Min. ${min2} pcs : Rp ${formatPrice(jastipPrice2)} /pcs
    Min. ${min3} pcs : Rp ${formatPrice(jastipPrice3)} /pcs\n
*🌻 Deskripsi :*
    ${product.description || 'Tidak ada deskripsi'}\n\n
*🌱 Detail Order :*
* Close PO 17 April 25*
* Estimasi ready end Juni 25*\n\n
====================
List : Nama + 4 Digit No WA
1. ...
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
