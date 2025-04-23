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
let groupedProducts = {}; // Struktur untuk mengelompokkan produk

fetch('grouped_products.json')
  .then(response => response.json())
  .then(data => {
    products = data;

    // Kelompokkan produk berdasarkan type dan category
    products.forEach(product => {
      const type = product.type;
      const category = product.category;

      if (!groupedProducts[type]) {
        groupedProducts[type] = {};
      }

      if (!groupedProducts[type][category]) {
        groupedProducts[type][category] = [];
      }

      groupedProducts[type][category].push(product);
    });

    // Populate Type filter
    const types = Object.keys(groupedProducts);
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
    // Get all unique categories from all types
    const allCategories = [...new Set(products.map(p => p.category))];
    allCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  } else {
    // Get categories for the selected type
    const categories = Object.keys(groupedProducts[selectedType]);
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }
}

// Render Products
function renderProducts(filteredProducts) {
  const productGrid = document.getElementById('product-grid');
  productGrid.innerHTML = '';
  filteredProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image[0]}" alt="${product.name.join(', ')}">
      <p>${product.name.join(', ')}</p>
      <p class="price">
        ${product.discountPercentage !== "0%" ? `<span class="original-price">${product.originalPrice}</span>` : ''}
        <span class="discounted-price">${product.discountedPrice}</span>
      </p>
    `;
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

// Event Listeners
document.getElementById('type-filter').addEventListener('change', (event) => {
  const selectedType = event.target.value;
  updateCategoryFilter(selectedType);
  applyFilters();
});

document.getElementById('category-filter').addEventListener('change', applyFilters);

document.getElementById('search-box').addEventListener('input', applyFilters);
