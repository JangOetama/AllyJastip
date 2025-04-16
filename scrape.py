import requests
from bs4 import BeautifulSoup
import json

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
    original_price = item.select_one('.product__item__text h5 s').text.strip()
    discounted_price = item.select_one('.product__item__text h5').text.strip().split('<sup')[0].strip()
    discount_percentage = item.select_one('.product__item__text h5 sup font').text.strip()

    products.append({
        'name': name,
        'originalPrice': original_price,
        'discountedPrice': discounted_price,
        'discountPercentage': discount_percentage
    })

with open('products.json', 'w') as f:
    json.dump(products, f)

print("Scraping selesai. Data disimpan ke products.json")
