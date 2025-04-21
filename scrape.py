import requests
from bs4 import BeautifulSoup
import json
import re

def is_similar_name(name1, name2):
    # Cocokkan bagian awal nama (minimal 3 karakter pertama harus sama)
    pattern = re.compile(r'^' + re.escape(name1[:3]))
    return bool(pattern.match(name2))

# URL login dan data login
login_url = 'https://feelbuyshop.com/preorderjastip/?f=login'
login_data = {
    'username': '085161117349',
    'submit': ''
}

product_url = 'https://feelbuyshop.com/preorderjastip/?f=home'

session = requests.Session()

# Login ke situs
response = session.post(login_url, data=login_data)

# Ambil halaman produk
product_page = session.get(product_url)

soup = BeautifulSoup(product_page.content, 'html.parser')

products = []
for item in soup.select('#mydivproduct .product__item'):
    name = item.select_one('.product__item__text h6').text.strip()
    original_price_text = item.select_one('.product__item__text h5 s').text.strip().replace('Rp. ', '')
    original_price = float(original_price_text.replace(',', ''))

    discount_percentage_text = item.select_one('.product__item__text h5 sup font').text.strip()
    discount_percentage = 0

    match = re.search(r'(-?\d+(\.\d+)?)%', discount_percentage_text)
    if match:
        discount_percentage = float(match.group(1).replace('-', ''))

    discounted_price = original_price - (original_price * (discount_percentage / 100))
    image_tag = item.select_one('.product__item__pic')
    image_url = image_tag['data-setbg'] if image_tag else None

    products.append({
        'name': name,
        'image': 'https://feelbuyshop.com/preorderjastip/' + image_url if image_url else None,
        'originalPrice': original_price_text,
        'discountedPrice': "{:,.0f}".format(discounted_price),
        'discountPercentage': "{}%".format(discount_percentage)
    })

# Mengelompokkan produk berdasarkan kriteria
products = []
for product in products:
    # Cari apakah produk ini bisa dimasukkan ke grup yang sudah ada
    added_to_group = False
    for group in products:
        # Periksa apakah produk ini mirip dengan salah satu nama dalam grup
        if (
            group['originalPrice'] == product['originalPrice'] and
            group['discountedPrice'] == product['discountedPrice'] and
            group['discountPercentage'] == product['discountPercentage'] and
            any(is_similar_name(product['name'], existing_name) for existing_name in group['name'])
        ):
            # Tambahkan produk ke grup yang ada
            group['name'].append(product['name'])
            group['image'].append(product['image'])
            added_to_group = True
            break

    if not added_to_group:
        # Buat grup baru jika tidak ada yang cocok
        products.append({
            'name': [product['name']],
            'image': [product['image']],
            'originalPrice': product['originalPrice'],
            'discountedPrice': product['discountedPrice'],
            'discountPercentage': product['discountPercentage']
        })

# Simpan hasil ke file JSON
with open('products.json', 'w') as f:
    json.dump(products, f, indent=4)

print("Scraping selesai. Data disimpan ke products.json")
