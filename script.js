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

  // Add categories for the selected type
  if (groupedProducts[selectedType]) {
    const categories = Object.keys(groupedProducts[selectedType]);
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }
}

// Event listener for Type filter
document.getElementById('type-filter').addEventListener('change', (event) => {
  const selectedType = event.target.value;
  updateCategoryFilter(selectedType);
  applyFilters();
});

// Filters
document.getElementById('category-filter').addEventListener('change', applyFilters);

function applyFilters() {
  const type = document.getElementById('type-filter').value;
  const category = document.getElementById('category-filter').value;

  let filtered = [];

  if (type === 'all') {
    // Show all products
    filtered = products;
  } else {
    if (category === 'all') {
      // Show all categories for the selected type
      filtered = Object.values(groupedProducts[type]).flat();
    } else {
      // Show only the selected category
      filtered = groupedProducts[type][category] || [];
    }
  }

  renderProducts(filtered);
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
});

// Filters
document.getElementById('type-filter').addEventListener('change', (event) => {
  const selectedType = event.target.value;
  updateCategoryFilter(selectedType);
  applyFilters();
});

document.getElementById('category-filter').addEventListener('change', applyFilters);

function applyFilters() {
  const type = document.getElementById('type-filter').value;
  const category = document.getElementById('category-filter').value;

  let filtered = [];

  if (type === 'all') {
    // Show all products
    filtered = products;
  } else {
    if (category === 'all') {
      // Show all categories for the selected type
      filtered = products.filter(p => p.type === type);
    } else {
      // Show only the selected category
      filtered = products.filter(p => p.type === type && p.category === category);
    }
  }

  renderProducts(filtered);
}
