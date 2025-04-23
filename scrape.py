import json
import re
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import requests

def scrape_lynk():
    url = "https://lynk.id/waffalya"
    products_lynk = []

    with sync_playwright() as p:
        # Launch browser dengan konfigurasi stealth
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36"
            ]
        )
        
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            java_script_enabled=True,
            bypass_csp=True
        )
        
        page = context.new_page()
        
        try:
            # Navigasi ke URL dengan delay acak
            page.goto(url, wait_until="networkidle", timeout=60000)
            
            # Tunggu elemen muncul
            page.wait_for_selector('a[href^="/products/"]', timeout=30000)
            
            # Ambil HTML setelah render JavaScript
            html_content = page.content()
            
            soup = BeautifulSoup(html_content, 'html.parser')
            
            product_elements = soup.find_all('a', href=True)

            for product in product_elements:
                # Parsing data produk
                name_element = product.find('p', class_='filter-0')
                name = name_element.get_text(strip=True) if name_element else None

                price_element = product.find('span', class_='price')
                price = price_element.get_text(strip=True).replace("IDR ", "").replace("K", "000") if price_element else None

                image_element = product.find('img', alt="product_image")
                image_url = image_element['src'] if image_element and 'src' in image_element.attrs else None

                link = "https://lynk.id" + product['href']

                # Validasi data sebelum ditambahkan
                if name and price and image_url and link:
                    products_lynk.append({
                        "name": [name],
                        "image": [image_url],
                        "originalPrice": price,
                        "discountedPrice": price,  # Asumsi tidak ada diskon
                        "discountPercentage": "0.0%",
                        "link": link,
                        "type": "Book"  # Tipe produk untuk lynk.id [[8]]
                    })

        except Exception as e:
            print(f"Error during scraping: {str(e)}")
        finally:
            browser.close()

    return products_lynk

# Fungsi untuk scraping feelbuyshop.com tetap menggunakan requests
def scrape_feelbuy():
    # URL login dan data login untuk feelbuyshop.com
    login_url = 'https://feelbuyshop.com/preorderjastip/?f=login'
    login_data = {
        'username': '085161117349',
        'submit': ''
    }

    product_url_feelbuy = 'https://feelbuyshop.com/preorderjastip/?f=home'

    # Inisialisasi session dengan requests
    session = requests.Session()

    # Login ke situs feelbuyshop.com
    response = session.post(login_url, data=login_data)

    # Ambil halaman produk dari feelbuyshop.com
    product_page_feelbuy = session.get(product_url_feelbuy)

    # Parsing HTML feelbuyshop.com
    soup_feelbuy = BeautifulSoup(product_page_feelbuy.content, 'html.parser')

    # Ekstraksi data produk dari feelbuyshop.com
    products_feelbuy = []
    for item in soup_feelbuy.select('#mydivproduct .product__item'):
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

        products_feelbuy.append({
            'name': name,
            'image': 'https://feelbuyshop.com/preorderjastip/' + image_url if image_url else None,
            'originalPrice': original_price_text,
            'discountedPrice': "{:,.0f}".format(discounted_price),
            'discountPercentage': "{}%".format(discount_percentage),
            'link': "",  # Link kosong karena tidak ada informasi link
            'type': "Jastip"  # Tipe produk untuk feelbuyshop.com
        })

    return products_feelbuy

# Gabungkan data dari kedua sumber
def main():
    # Scrape data dari feelbuyshop.com
    products_feelbuy = scrape_feelbuy()

    # Scrape data dari lynk.id
    products_lynk = scrape_lynk()

    # Gabungkan semua produk dari kedua sumber
    all_products = products_feelbuy + products_lynk

    # Mengelompokkan produk berdasarkan kriteria
    grouped_products = []
    for product in all_products:
        # Cari apakah produk ini bisa dimasukkan ke grup yang sudah ada
        added_to_group = False
        for group in grouped_products:
            # Pengelompokan hanya berlaku untuk produk dari feelbuyshop.com
            if (
                'link' in product and product['link'] == "" and  # Pastikan ini produk dari feelbuyshop.com
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
            grouped_products.append({
                'name': [product['name']] if isinstance(product['name'], str) else product['name'],
                'image': [product['image']] if isinstance(product['image'], str) else product['image'],
                'originalPrice': product['originalPrice'],
                'discountedPrice': product['discountedPrice'],
                'discountPercentage': product['discountPercentage'],
                'link': product.get('link', ""),  # Pastikan ada field link
                'type': product['type']  # Tambahkan field type
            })

    # Simpan hasil ke file JSON
    with open('grouped_products.json', 'w') as f:
        json.dump(grouped_products, f, indent=4)

    print("Scraping selesai. Data disimpan ke grouped_products.json")

if __name__ == "__main__":
    main()
