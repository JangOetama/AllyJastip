import json
import re
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

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
                # [Proses parsing sama seperti sebelumnya]
                # ... (kode parsing yang sama)

        except Exception as e:
            print(f"Error during scraping: {str(e)}")
        finally:
            browser.close()

    return products_lynk

# Fungsi untuk scraping feelbuyshop.com tetap menggunakan requests
def scrape_feelbuy():
    # ... (kode tetap sama seperti sebelumnya) ...

# Fungsi pengelompokan dan main tetap sama
def main():
    # ... (kode tetap sama seperti sebelumnya) ...

if __name__ == "__main__":
    main()
