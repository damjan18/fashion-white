# Fashion White - Premium Men's Fashion Store

Moderna e-commerce platforma za prodaju muške odjeće sa admin panelom za upravljanje inventarom, narudžbama i analitikom.

## 🚀 Funkcionalnosti

### Korisnički sajt
- **Višejezičnost** - Srpski (Latin) i Engleski
- **Kategorije proizvoda** - Majice, Košulje, Duksevi, Jakne, Pantalone, Farmerke, Šortsevi, Aksesoari
- **Filteri** - Po brendu, stilu, cijeni, dostupnosti
- **Korpa** - Dodavanje proizvoda sa veličinama i količinama
- **Narudžba** - Forma za narudžbu sa plaćanjem pouzećem

### Admin Panel
- **Dashboard** - Pregled danas narudžbi, prihoda, niskog stanja
- **Proizvodi** - Dodavanje, izmjena, brisanje proizvoda
- **Inventar** - Upravljanje stanjem po veličinama
- **Narudžbe** - Pregled i promjena statusa narudžbi
- **Brendovi** - Upravljanje brendovima
- **Analitika** - Grafikoni prodaje, najprodavaniji proizvodi

## 📦 Tehnologije

- **Frontend:** React 18 + Vite
- **Stilovi:** CSS Modules
- **Routing:** React Router v6
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Email:** EmailJS
- **Grafikoni:** Recharts
- **Ikone:** Lucide React

## 🛠️ Instalacija

### 1. Kloniraj projekat

```bash
cd fashion-white
npm install
```

### 2. Podesi Supabase

1. Idi na [supabase.com](https://supabase.com) i kreiraj nalog
2. Kreiraj novi projekat
3. Idi na **Settings > API** i kopiraj:
   - Project URL
   - anon/public key

4. Kreiraj `.env` fajl:

```bash
cp .env.example .env
```

5. Popuni `.env` sa svojim podacima:

```env
VITE_SUPABASE_URL=https://tvoj-projekat.supabase.co
VITE_SUPABASE_ANON_KEY=tvoj-anon-key
```

### 3. Kreiraj tabele u Supabase

Idi na **SQL Editor** u Supabase i pokreni sledeći SQL:

```sql
-- Brands tabela
CREATE TABLE brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products tabela
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_sr VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description_sr TEXT,
  description_en TEXT,
  category VARCHAR(50) NOT NULL,
  brand_id UUID REFERENCES brands(id),
  base_price DECIMAL(10,2) NOT NULL,
  style VARCHAR(50) DEFAULT 'streetwear',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Variants tabela (veličine i stanje)
CREATE TABLE product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(20) NOT NULL,
  quantity INTEGER DEFAULT 0,
  sku VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, size)
);

-- Orders tabela
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  note TEXT,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items tabela
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indeksi za bolje performanse
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Dodaj početne brendove
INSERT INTO brands (name) VALUES 
  ('Polo Ralph Lauren'),
  ('Lacoste'),
  ('Armani'),
  ('Gucci'),
  ('Kenzo');
```

### 4. Podesi autentifikaciju

1. U Supabase idi na **Authentication > Users**
2. Klikni **Add User** i dodaj svoj email i lozinku
3. Ovo će biti admin nalog za pristup panelu

### 5. Podesi Row Level Security (opciono ali preporučeno)

```sql
-- Omogući RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Politike za javno čitanje
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (is_active = true);

-- Politike za upisivanje narudžbi
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert order_items" ON order_items FOR INSERT WITH CHECK (true);

-- Admin politike (za autentifikovane korisnike)
CREATE POLICY "Admin all products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all variants" ON product_variants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all brands" ON brands FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all order_items" ON order_items FOR ALL USING (auth.role() = 'authenticated');
```

### 6. Podesi EmailJS (za notifikacije)

1. Idi na [emailjs.com](https://www.emailjs.com/) i kreiraj nalog
2. Kreiraj Email Service (npr. Gmail)
3. Kreiraj Email Template sa ovim varijablama:
   - `{{order_id}}` - ID narudžbe
   - `{{customer_name}}` - Ime kupca
   - `{{customer_phone}}` - Telefon
   - `{{customer_address}}` - Adresa
   - `{{items_list}}` - Lista artikala
   - `{{total}}` - Ukupan iznos
   - `{{order_date}}` - Datum narudžbe

4. Dodaj u `.env`:

```env
VITE_EMAILJS_SERVICE_ID=tvoj_service_id
VITE_EMAILJS_TEMPLATE_ID=tvoj_template_id
VITE_EMAILJS_PUBLIC_KEY=tvoj_public_key
```

### 7. Pokreni projekat

```bash
npm run dev
```

Sajt će biti dostupan na: http://localhost:5173

Admin panel: http://localhost:5173/admin

## 📁 Struktura projekta

```
fashion-white/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminLayout.jsx
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Navbar.jsx
│   │   └── shop/
│   │       ├── Cart.jsx
│   │       ├── OrderForm.jsx
│   │       ├── ProductCard.jsx
│   │       ├── ProductFilters.jsx
│   │       └── ProductModal.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── LanguageContext.jsx
│   ├── data/
│   │   └── translations.js
│   ├── hooks/
│   ├── lib/
│   │   ├── email.js
│   │   └── supabase.js
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Brands.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── Products.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── Home.jsx
│   │   └── Shop.jsx
│   ├── styles/
│   │   ├── components/
│   │   │   └── *.module.css
│   │   └── globals.css
│   ├── utils/
│   │   └── helpers.js
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

## 🚀 Deploy na Vercel

1. Push projekat na GitHub
2. Idi na [vercel.com](https://vercel.com)
3. Importuj projekat sa GitHub-a
4. Dodaj Environment Variables (iz .env fajla)
5. Deploy!

## 📝 Korištenje

### Dodavanje proizvoda

1. Prijavi se na admin panel (/admin)
2. Idi na "Proizvodi" > "Dodaj proizvod"
3. Popuni podatke i odaberi veličine
4. Idi na "Inventar" da podesiš količine

### Upravljanje narudžbama

1. Kada stigne narudžba, dobićeš email
2. U admin panelu idi na "Narudžbe"
3. Promijeni status: Nova → Potvrđena → Poslata → Isporučena
4. Kada potvr diš narudžbu, stanje se automatski smanjuje

### Dodavanje novog brenda

1. Idi na "Brendovi" > "Dodaj brend"
2. Unesi naziv i opciono logo URL
3. Brend će biti dostupan u filterima

## 🔧 Prilagođavanje

### Promjena telefona/emaila

Izmijeni u fajlovima:
- `src/pages/Contact.jsx`
- `src/components/common/Footer.jsx`

### Dodavanje nove kategorije

1. Dodaj u `src/data/translations.js` u `categories` array
2. Dodaj prijevode za oba jezika

### Promjena boja

Izmijeni CSS varijable u `src/styles/globals.css`

## 📞 Podrška

Za pitanja ili probleme, kontaktiraj nas na info@fashionwhite.me

---

Made with ❤️ for Fashion White
