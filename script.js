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
            img.alt = product.name.join(', ');
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
                    <p>${product.name.join(', ')}</p>
                    <p class="price">
                        ${product.discountPercentage !== "0%" ? 
                            `<span class="original-price">${product.originalPrice}</span>` : ''}
                        <span class="discounted-price">${product.discountedPrice}</span>
                    </p>
                `;

                card.appendChild(imageContainer);
                card.appendChild(productInfo);

                if(product.link) {
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
                const searchMatch = p.name.some(name => name.toLowerCase().includes(searchText));
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
            document.getElementById('biolink-section').classList.add('active');
            document.getElementById('market-section').classList.remove('active');
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.getElementById('tab-biolink').classList.add('active');
        });

        document.getElementById('tab-market').addEventListener('click', () => {
            document.getElementById('market-section').classList.add('active');
            document.getElementById('biolink-section').classList.remove('active');
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.getElementById('tab-market').classList.add('active');
            applyFilters();
        });
