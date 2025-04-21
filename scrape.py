import requests
from bs4 import BeautifulSoup
import json
import re
from difflib import SequenceMatcher

# Fungsi untuk membandingkan kesamaan dua string
def is_similar(name1, name2):
    # Menggunakan SequenceMatcher untuk mengecek kemiripan nama
    similarity = SequenceMatcher(None, name1, name2).ratio()
    return similarity > 0.8  # Threshold kemiripan (misalnya 80%)

# URL dan data login
login_url = 'https://feelbuyshop.com/preorderjastip/?f=login'
login_data = {
    'username': '085161117349',
    'submit': ''
}

product_url = 'https://feelbuyshop.com/preorderjastip/?f=home'

# Membuat sesi
session = requests.Session()

# Login
response = session.post(login_url, data=login_data)

# Mendapatkan halaman produk
product_page = session.get(product_url)

# Parsing HTML
soup = BeautifulSoup(product_page.content, 'html.parser')

# List untuk menyimpan produk
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

# Pengelompokan produk
products = []
for product in products:
    # Cari apakah ada grup yang sudah ada yang cocok
    matched_group = None
    for group in products:
        # Membandingkan harga dan nama
        if (group['originalPrice'][0] == product['originalPrice'] and
            is_similar(group['name'][0], product['name'])):
            matched_group = group
            break

    if matched_group:
        # Jika ada grup yang cocok, tambahkan ke grup tersebut
        matched_group['name'].append(product['name'])
        matched_group['image'].append(product['image'])
        matched_group['originalPrice'].append(product['originalPrice'])
        matched_group['discountedPrice'].append(product['discountedPrice'])
        matched_group['discountPercentage'].append(product['discountPercentage'])
    else:
        # Jika tidak ada grup yang cocok, buat grup baru
        products.append({
            'name': [product['name']],
            'image': [product['image']],
            'originalPrice': [product['originalPrice']],
            'discountedPrice': [product['discountedPrice']],
            'discountPercentage': [product['discountPercentage']]
        })

# Simpan hasil ke file JSON
with open('products.json', 'w') as f:
    json.dump(products, f, indent=4)

print("Scraping selesai. Data disimpan ke products.json")
