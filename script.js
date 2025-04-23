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

    // Populate Type and Category filters
    const types = [...new Set(products.map(p => p.type))];
    const categories = [...new Set(products.map(p => p.category))];

    const typeFilter = document.getElementById('type-filter');
    types.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeFilter.appendChild(option);
    });

    const categoryFilter = document.getElementById('category-filter');
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });

    renderProducts(products);
  });

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
document.getElementById('type-filter').addEventListener('change', applyFilters);
document.getElementById('category-filter').addEventListener('change', applyFilters);

function applyFilters() {
  const type = document.getElementById('type-filter').value;
  const category = document.getElementById('category-filter').value;

  const filtered = products.filter(product => {
    const typeMatch = type === 'all' || product.type === type;
    const categoryMatch = category === 'all' || product.category === category;
    return typeMatch && categoryMatch;
  });

  renderProducts(filtered);
}
