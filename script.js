document.addEventListener('DOMContentLoaded', function() {
    const productData = [
        { name: 'HLE313S2', originalPrice: 'Rp. 72,000', discountedPrice: 'Rp. 43,200', discountPercentage: '40%' },
        { name: 'HLE314S3', originalPrice: 'Rp. 139,000', discountedPrice: 'Rp. 83,400', discountPercentage: '40%' },
        { name: 'HPL817LB', originalPrice: 'Rp. 190,000', discountedPrice: 'Rp. 114,000', discountPercentage: '40%' }
        // Tambahkan data produk lainnya di sini
    ];

    const tableBody = document.querySelector('#productTable tbody');

    productData.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.originalPrice}</td>
            <td>${product.discountedPrice}</td>
            <td>${product.discountPercentage}</td>
        `;
        tableBody.appendChild(row);
    });
});
