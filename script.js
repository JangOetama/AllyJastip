document.addEventListener('DOMContentLoaded', function() {
    fetch('products.json')
        .then(response => response.json())
        .then(productData => {
            const tableBody = document.querySelector('#productTable tbody');

            productData.forEach(product => {
                // Mengubah ekstensi gambar menjadi .webp
                const imageUrl = product.image.replace(/\.(jpg|jpeg|png)$/, '.webp');

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.originalPrice}</td>
                    <td>${product.discountedPrice}</td>
                    <td>${product.discountPercentage}</td>
                    <td><img src="${imageUrl}" alt="${product.name}" style="width: 50px; height: auto;"></td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching product data:', error));
});
