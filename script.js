        fetch('biolink_data.json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('profile-photo').src = data.profile.photo;
                document.getElementById('instagram-id').textContent = data.profile.instagram_id;
                document.getElementById('followers').textContent = `${data.profile.followers} Followers`;
                document.getElementById('description').textContent = data.profile.description;

                const buttonContainer = document.getElementById('button-container');
                data.buttons.forEach(button => {
                    const btn = document.createElement('a');
                    btn.href = button.link;
                    btn.textContent = button.name;
                    buttonContainer.appendChild(btn);
                });
            });

        // Load Market Data
        let products = [];
        fetch('grouped_products.json')
            .then(response => response.json())
            .then(data => {
                products = data;
                populateFilters();
                applyFilters();
            });

        function populateFilters() {
            // Populate Type filter
            const types = [...new Set(products.map(p => p.type))];
            const typeFilter = document.getElementById('type-filter');
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeFilter.appendChild(option);
            });

            updateCategoryFilter('all');
        }

        function updateCategoryFilter(selectedType) {
            const categoryFilter = document.getElementById('category-filter');
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';

            const categories = selectedType === 'all' 
                ? [...new Set(products.map(p => p.category))]
                : [...new Set(products.filter(p => p.type === selectedType).map(p => p.category))];

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        }

function renderProducts(filteredProducts) {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = '';

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        // Image Container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';

        // Tambahkan semua gambar
        product.image.forEach((imgSrc, index) => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = product.name; // Gunakan product.name secara langsung
            img.style.opacity = index === 0 ? '1' : '0';
            imageContainer.appendChild(img);
        });

        // Logic slideshow hanya jika ada lebih dari 1 gambar
        if (product.image.length > 1) {
            let currentIndex = 0;
            const totalImages = product.image.length;

            // Fungsi untuk mengganti gambar
            const cycleImages = () => {
                const images = imageContainer.querySelectorAll('img');

                // Fade out gambar saat ini
                images[currentIndex].style.opacity = '0';

                // Update index
                currentIndex = (currentIndex + 1) % totalImages;

                // Fade in gambar berikutnya
                setTimeout(() => {
                    images[currentIndex].style.opacity = '1';
                }, 500); // Sesuaikan dengan durasi transisi CSS
            };

            // Mulai interval
            let intervalId = setInterval(cycleImages, 3000);

            // Hentikan interval saat card dihover
            card.addEventListener('mouseenter', () => clearInterval(intervalId));
            card.addEventListener('mouseleave', () => {
                intervalId = setInterval(cycleImages, 3000);
            });
        }

        // Product Info
        const productInfo = document.createElement('div');
        productInfo.innerHTML = `
            <p>${product.name}</p> <!-- Gunakan product.name secara langsung -->
            <p class="price">
                ${product.discountPercentage !== "0%" ? 
                    `<span class="original-price">${product.originalPrice}</span>` : ''}
                <span class="discounted-price">${product.discountedPrice}</span>
            </p>
        `;

        card.appendChild(imageContainer);
        card.appendChild(productInfo);

        if (product.link) {
            card.onclick = () => window.open(product.link, '_blank');
        }

        productGrid.appendChild(card);
    });
}

function applyFilters() {
    const type = document.getElementById('type-filter').value;
    const category = document.getElementById('category-filter').value;
    const searchText = document.getElementById('search-box').value.toLowerCase();

    let filtered = products.filter(p => {
        const typeMatch = type === 'all' || p.type === type;
        const categoryMatch = category === 'all' || p.category === category;
        const searchMatch = p.name.toLowerCase().includes(searchText); // Modifikasi di sini
        return typeMatch && categoryMatch && searchMatch;
    });

    renderProducts(filtered);
}

        // Event Listeners
        document.getElementById('type-filter').addEventListener('change', function() {
            updateCategoryFilter(this.value);
            applyFilters();
        });

        document.getElementById('category-filter').addEventListener('change', applyFilters);
        document.getElementById('search-box').addEventListener('input', applyFilters);

        // Tab Switching
        document.getElementById('tab-biolink').addEventListener('click', () => {
            switchTab('biolink');
        });

        document.getElementById('tab-market').addEventListener('click', () => {
            switchTab('market');
            applyFilters();
        });

        document.getElementById('tab-analytics').addEventListener('click', () => {
            switchTab('analytics');
            generateAnalytics();
        });

        function switchTab(activeTab) {
            // Hide all sections
            document.getElementById('biolink-section').classList.remove('active');
            document.getElementById('market-section').classList.remove('active');
            document.getElementById('analytics-section').classList.remove('active');
            
            // Remove active class from all tabs
            document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
            
            // Show active section and tab
            document.getElementById(`${activeTab}-section`).classList.add('active');
            document.getElementById(`tab-${activeTab}`).classList.add('active');
        }

        // Analytics Functions
        function generateAnalytics() {
            if (!products || products.length === 0) return;

            // Calculate key metrics
            const totalProducts = products.length;
            const totalSavings = calculateTotalSavings();
            const avgDiscount = calculateAverageDiscount();
            const priceRange = calculatePriceRange();

            // Update metric cards
            document.getElementById('total-products').textContent = totalProducts.toLocaleString();
            document.getElementById('avg-discount').textContent = avgDiscount.toFixed(1) + '%';
            document.getElementById('total-savings').textContent = `Rp ${totalSavings.toLocaleString('id-ID')}`;
            document.getElementById('price-range').textContent = `Rp ${priceRange.min.toLocaleString('id-ID')} - Rp ${priceRange.max.toLocaleString('id-ID')}`;

            // Generate category analysis
            generateCategoryAnalysis();
            
            // Generate top discounted products
            generateTopDiscountedProducts();
            
            // Generate price distribution
            generatePriceDistribution();
        }

        function calculateTotalSavings() {
            return products.reduce((total, product) => {
                const originalStr = product.originalPrice?.toString() || '0';
                const discountedStr = product.discountedPrice?.toString() || '0';
                
                // Remove all non-numeric characters except decimal points
                const original = parseFloat(originalStr.replace(/[^0-9.]/g, '')) || 0;
                const discounted = parseFloat(discountedStr.replace(/[^0-9.]/g, '')) || 0;
                
                return total + (original - discounted);
            }, 0);
        }

        function calculateAverageDiscount() {
            const validDiscounts = products.filter(product => {
                const discountStr = product.discountPercentage?.toString() || '0%';
                const discountPercent = parseFloat(discountStr.replace('%', ''));
                return !isNaN(discountPercent) && discountPercent > 0;
            });

            if (validDiscounts.length === 0) return 0;

            const totalDiscount = validDiscounts.reduce((total, product) => {
                const discountStr = product.discountPercentage?.toString() || '0%';
                const discountPercent = parseFloat(discountStr.replace('%', ''));
                return total + discountPercent;
            }, 0);
            
            return totalDiscount / validDiscounts.length;
        }

        function calculatePriceRange() {
            const validPrices = products
                .map(p => {
                    const priceStr = p.discountedPrice?.toString() || '0';
                    return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
                })
                .filter(price => !isNaN(price) && price > 0);

            if (validPrices.length === 0) {
                return { min: 0, max: 0 };
            }

            return {
                min: Math.min(...validPrices),
                max: Math.max(...validPrices)
            };
        }

        function generateCategoryAnalysis() {
            const categoryCount = {};
            products.forEach(product => {
                const category = product.category;
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            });

            const categoryAnalysisDiv = document.getElementById('category-analysis');
            categoryAnalysisDiv.innerHTML = '';

            Object.entries(categoryCount)
                .sort(([,a], [,b]) => b - a)
                .forEach(([category, count]) => {
                    const categoryItem = document.createElement('div');
                    categoryItem.className = 'category-item';
                    categoryItem.innerHTML = `
                        <span class="category-name">${category}</span>
                        <span class="category-count">${count} products</span>
                    `;
                    categoryAnalysisDiv.appendChild(categoryItem);
                });
        }

        function generateTopDiscountedProducts() {
            const topDiscounted = products
                .filter(p => {
                    const discountStr = p.discountPercentage?.toString() || '0%';
                    const discountPercent = parseFloat(discountStr.replace('%', ''));
                    return !isNaN(discountPercent) && discountPercent > 0;
                })
                .sort((a, b) => {
                    const aDiscount = parseFloat((a.discountPercentage?.toString() || '0%').replace('%', ''));
                    const bDiscount = parseFloat((b.discountPercentage?.toString() || '0%').replace('%', ''));
                    return bDiscount - aDiscount;
                })
                .slice(0, 5);

            const topDiscountedDiv = document.getElementById('top-discounted');
            topDiscountedDiv.innerHTML = '';

            topDiscounted.forEach(product => {
                const productItem = document.createElement('div');
                productItem.className = 'product-item';
                productItem.innerHTML = `
                    <span class="product-name">${product.name || 'Unknown Product'}</span>
                    <span class="product-discount">${product.discountPercentage || '0%'}</span>
                `;
                topDiscountedDiv.appendChild(productItem);
            });
        }

        function generatePriceDistribution() {
            const priceRanges = {
                'Under Rp 50,000': 0,
                'Rp 50,000 - Rp 100,000': 0,
                'Rp 100,000 - Rp 200,000': 0,
                'Rp 200,000 - Rp 300,000': 0,
                'Over Rp 300,000': 0
            };

            products.forEach(product => {
                const priceStr = product.discountedPrice?.toString() || '0';
                const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
                
                if (!isNaN(price) && price > 0) {
                    if (price < 50000) priceRanges['Under Rp 50,000']++;
                    else if (price < 100000) priceRanges['Rp 50,000 - Rp 100,000']++;
                    else if (price < 200000) priceRanges['Rp 100,000 - Rp 200,000']++;
                    else if (price < 300000) priceRanges['Rp 200,000 - Rp 300,000']++;
                    else priceRanges['Over Rp 300,000']++;
                }
            });

            const priceDistributionDiv = document.getElementById('price-distribution');
            priceDistributionDiv.innerHTML = '';

            Object.entries(priceRanges).forEach(([range, count]) => {
                const rangeItem = document.createElement('div');
                rangeItem.className = 'price-range';
                rangeItem.innerHTML = `
                    <span class="category-name">${range}</span>
                    <span class="price-count">${count} products</span>
                `;
                priceDistributionDiv.appendChild(rangeItem);
            });
        }

        // Export Functions
        function exportAnalytics(format) {
            const analyticsData = {
                summary: {
                    totalProducts: products.length,
                    averageDiscount: calculateAverageDiscount(),
                    totalSavings: calculateTotalSavings(),
                    priceRange: calculatePriceRange()
                },
                products: products,
                categories: getCategoryAnalysis(),
                generatedAt: new Date().toISOString()
            };

            if (format === 'csv') {
                exportToCSV(analyticsData);
            } else if (format === 'json') {
                exportToJSON(analyticsData);
            }
        }

        function getCategoryAnalysis() {
            const categoryCount = {};
            products.forEach(product => {
                const category = product.category;
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            });
            return categoryCount;
        }

        function exportToCSV(data) {
            const csvContent = [
                ['Product Name', 'Category', 'Original Price', 'Discounted Price', 'Discount %'].join(','),
                ...data.products.map(p => [
                    `"${p.name}"`,
                    `"${p.category}"`,
                    `"${p.originalPrice}"`,
                    `"${p.discountedPrice}"`,
                    `"${p.discountPercentage}"`
                ].join(','))
            ].join('\n');

            downloadFile(csvContent, 'jastip-analytics.csv', 'text/csv');
        }

        function exportToJSON(data) {
            const jsonContent = JSON.stringify(data, null, 2);
            downloadFile(jsonContent, 'jastip-analytics.json', 'application/json');
        }

        function downloadFile(content, filename, contentType) {
            const blob = new Blob([content], { type: contentType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        function generateReport() {
            const reportData = {
                title: 'Ally Jastip Business Analytics Report',
                generatedAt: new Date().toLocaleDateString('id-ID'),
                summary: {
                    totalProducts: products.length,
                    averageDiscount: calculateAverageDiscount().toFixed(1) + '%',
                    totalSavings: 'Rp ' + calculateTotalSavings().toLocaleString('id-ID'),
                    categories: Object.keys(getCategoryAnalysis()).length
                },
                topCategories: Object.entries(getCategoryAnalysis())
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5),
                topDiscounts: products
                    .filter(p => parseFloat(p.discountPercentage.replace('%', '')) > 0)
                    .sort((a, b) => parseFloat(b.discountPercentage.replace('%', '')) - parseFloat(a.discountPercentage.replace('%', '')))
                    .slice(0, 5)
                    .map(p => ({ name: p.name, discount: p.discountPercentage }))
            };

            const reportHTML = `
                <html>
                <head>
                    <title>${reportData.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        h1 { color: #FF69B4; }
                        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .metric { display: inline-block; margin: 10px 20px 10px 0; }
                        .metric-value { font-size: 24px; font-weight: bold; color: #FF69B4; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background-color: #FF69B4; color: white; }
                    </style>
                </head>
                <body>
                    <h1>${reportData.title}</h1>
                    <p>Generated on: ${reportData.generatedAt}</p>
                    
                    <div class="summary">
                        <h2>Key Metrics</h2>
                        <div class="metric">
                            <div>Total Products</div>
                            <div class="metric-value">${reportData.summary.totalProducts}</div>
                        </div>
                        <div class="metric">
                            <div>Average Discount</div>
                            <div class="metric-value">${reportData.summary.averageDiscount}</div>
                        </div>
                        <div class="metric">
                            <div>Total Savings</div>
                            <div class="metric-value">${reportData.summary.totalSavings}</div>
                        </div>
                        <div class="metric">
                            <div>Categories</div>
                            <div class="metric-value">${reportData.summary.categories}</div>
                        </div>
                    </div>

                    <h2>Top Categories</h2>
                    <table>
                        <tr><th>Category</th><th>Product Count</th></tr>
                        ${reportData.topCategories.map(([cat, count]) => `<tr><td>${cat}</td><td>${count}</td></tr>`).join('')}
                    </table>

                    <h2>Top Discounted Products</h2>
                    <table>
                        <tr><th>Product Name</th><th>Discount</th></tr>
                        ${reportData.topDiscounts.map(p => `<tr><td>${p.name}</td><td>${p.discount}</td></tr>`).join('')}
                    </table>
                </body>
                </html>
            `;

            const newWindow = window.open('', '_blank');
            newWindow.document.write(reportHTML);
            newWindow.document.close();
        }

        // Make functions globally available
        window.exportAnalytics = exportAnalytics;
        window.generateReport = generateReport;
