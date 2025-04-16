document.addEventListener('DOMContentLoaded', function() {
    fetch('products.json')
        .then(response => response.json())
        .then(productData => {
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
        })
        .catch(error => console.error('Error fetching product data:', error));
});
