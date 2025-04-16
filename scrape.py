import requests
from bs4 import BeautifulSoup
import json
import re

login_url = 'https://feelbuyshop.com/preorderjastip/?f=login'
login_data = {
    'username': '085161117349',
    'submit': ''
}

product_url = 'https://feelbuyshop.com/preorderjastip/?f=home'

session = requests.Session()

response = session.post(login_url, data=login_data)

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
        discount_percentage = float(match.group(1))

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

with open('products.json', 'w') as f:
    json.dump(products, f, indent=4)

print("Scraping selesai. Data disimpan ke products.json")
