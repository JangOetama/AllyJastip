// cypress/e2e/scraping.spec.js
/// <reference types="cypress" />
const stringSimilarity = require('string-similarity');

describe('Web Scraping Integration', () => {
  let allProducts = [];

  before(() => {
    // Persiapan sesi untuk feelbuyshop.com [[7]]
    cy.session('feelbuy_login', () => {
      cy.request({
        method: 'POST',
        url: 'https://feelbuyshop.com/preorderjastip/?f=login',
        form: true,
        body: {
          username: '085161117349',
          submit: ''
        }
      });
    });
  });

  it('Scrape Lynk.id', () => {
    cy.visit('https://lynk.id/waffalya');
    
    cy.get('a[href]').each(($el) => {
      const name = $el.find('p.filter-0').text().trim();
      const price = $el.find('span.price').text().replace(/[^0-9]/g, '');
      const image = $el.find('img[src]').attr('src');
      const link = 'https://lynk.id' + $el.attr('href');

      if (name && price && image && link) {
        allProducts.push({
          name: [name],
          image: [image],
          originalPrice: price,
          discountedPrice: price,
          discountPercentage: '0.0%',
          link: link,
          type: 'Book'
        });
      }
    });
  });

  it('Scrape FeelBuyShop', () => {
    cy.visit('https://feelbuyshop.com/preorderjastip/?f=home');
    
    cy.get('#mydivproduct .product__item').each(($item) => {
      const name = $item.find('.product__item__text h6').text().trim();
      const originalPrice = $item.find('.product__item__text h5 s').text().replace(/[^0-9]/g, '');
      const discountText = $item.find('.product__item__text h5 sup font').text().trim();
      const discountPercentage = parseFloat(discountText.match(/(\d+)/)[0]) || 0;
      const discountedPrice = originalPrice - (originalPrice * (discountPercentage / 100));
      const image = 'https://feelbuyshop.com/preorderjastip/' + $item.find('.product__item__pic').attr('data-setbg');

      allProducts.push({
        name: [name],
        image: [image],
        originalPrice: originalPrice,
        discountedPrice: Math.round(discountedPrice).toLocaleString(),
        discountPercentage: `${discountPercentage}%`,
        link: '',
        type: 'Jastip'
      });
    });
  });

  after(() => {
    // Proses pengelompokan produk [[7]]
    const grouped = [];
    allProducts.forEach(product => {
      const match = grouped.find(g => 
        g.originalPrice === product.originalPrice &&
        g.discountedPrice === product.discountedPrice &&
        g.discountPercentage === product.discountPercentage &&
        stringSimilarity.compareTwoStrings(g.name[0], product.name[0]) > 0.8
      );
      
      if (match) {
        match.name.push(...product.name);
        match.image.push(...product.image);
      } else {
        grouped.push({...product});
      }
    });

    cy.writeFile('cypress/fixtures/grouped_products.json', grouped);
    cy.log('Scraping selesai! File JSON berhasil disimpan');
  });
});
