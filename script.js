// Load BioLink Data
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

    // Populate Type filter
    const types = [...new Set(products.map(p => p.type))];
    const typeFilter = document.getElementById('type-filter');
    types.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeFilter.appendChild(option);
    });

    // Default: Populate Category filter for the first type
    updateCategoryFilter(types[0]);

    // Initial render
    applyFilters();
  })
  .catch(error => {
    console.error("Error loading grouped_products.json:", error);
  });

// Update Category filter based on selected Type
function updateCategoryFilter(selectedType) {
  const categoryFilter = document.getElementById('category-filter');
  categoryFilter.innerHTML = ''; // Clear existing options

  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = 'all';
  defaultOption.textContent = 'All Categories';
  categoryFilter.appendChild(defaultOption);

  // Add categories for the selected type or all types
  if (selectedType === 'all') {
    const allCategories = [...new Set(products.map(p => p.category))];
    allCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  } else {
    const categories = [...new Set(products.filter(p => p.type === selectedType).map(p => p.category))];
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }
}

// Render Products
// Render Products
function renderProducts(filteredProducts) {
  const productGrid = document.getElementById('product-grid');
  productGrid.innerHTML = ''; // Clear existing products

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = '<p>No products found.</p>';
    return;
  }

  filteredProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Create image container for slideshow
    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
    imageContainer.style.position = 'relative';
    imageContainer.style.overflow = 'hidden';

    // Check if there are multiple images
    if (product.image.length > 1) {
      product.image.forEach((imgSrc, index) => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = product.name.join(', ');
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.opacity = index === 0 ? '1' : '0'; // Only show the first image initially
        img.style.transition = 'opacity 0.5s ease-in-out';
        imageContainer.appendChild(img);
      });

      // Add automatic slideshow functionality
      let currentIndex = 0;
      setInterval(() => {
        const images = imageContainer.querySelectorAll('img');
        images[currentIndex].style.opacity = '0'; // Hide current image
        currentIndex = (currentIndex + 1) % images.length; // Move to the next image
        images[currentIndex].style.opacity = '1'; // Show next image
      }, 3000); // Change image every 3 seconds
    } else {
      // If only one image, display it directly
      const img = document.createElement('img');
      img.src = product.image[0];
      img.alt = product.name.join(', ');
      img.style.width = '100%';
      img.style.height = 'auto';
      imageContainer.appendChild(img);
    }

    // Append image container and other details to the card
    card.innerHTML += `
      <p>${product.name.join(', ')}</p>
      <p class="price">
        ${product.discountPercentage !== "0%" ? `<span class="original-price">${product.originalPrice}</span>` : ''}
        <span class="discounted-price">${product.discountedPrice}</span>
      </p>
    `;
    card.prepend(imageContainer); // Add image container to the top of the card

    if (product.link) {
      card.onclick = () => window.open(product.link, '_blank');
    }
    productGrid.appendChild(card);
  });
}

// Apply Filters and Search
function applyFilters() {
  const type = document.getElementById('type-filter').value;
  const category = document.getElementById('category-filter').value;
  const searchText = document.getElementById('search-box').value.toLowerCase();

  let filtered = products;

  // Filter by Type
  if (type !== 'all') {
    filtered = filtered.filter(p => p.type === type);
  }

  // Filter by Category
  if (category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }

  // Filter by Search Text
  if (searchText) {
    filtered = filtered.filter(p =>
      p.name.some(name => name.toLowerCase().includes(searchText))
    );
  }

  renderProducts(filtered);
}

// Tab Switching
document.getElementById('tab-biolink').addEventListener('click', () => {
  document.getElementById('biolink-section').classList.add('active');
  document.getElementById('market-section').classList.remove('active');
  document.getElementById('tab-biolink').classList.add('active');
  document.getElementById('tab-market').classList.remove('active');
});

document.getElementById('tab-market').addEventListener('click', () => {
  document.getElementById('biolink-section').classList.remove('active');
  document.getElementById('market-section').classList.add('active');
  document.getElementById('tab-biolink').classList.remove('active');
  document.getElementById('tab-market').classList.add('active');

  // Trigger filter agar produk Market langsung muncul
  applyFilters();
});

// Event Listeners
document.getElementById('type-filter').addEventListener('change', (event) => {
  const selectedType = event.target.value;
  updateCategoryFilter(selectedType);
  applyFilters();
});

document.getElementById('category-filter').addEventListener('change', applyFilters);

document.getElementById('search-box').addEventListener('input', applyFilters);
