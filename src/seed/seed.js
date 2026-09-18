require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const Product = require('../models/Product');
const Category = require('../models/Category');
const Inventory = require('../models/Inventory');
const Admin = require('../models/Admin');
const Discount = require('../models/Discount');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env file');
  process.exit(1);
}

// ─── Seed Data ───────────────────────────────────────────────
const categories = [
  { name: 'Serums', slug: 'serums', description: 'Concentrated botanical serums for targeted skin concerns' },
  { name: 'Cleansers', slug: 'cleansers', description: 'Gentle botanical cleansers for all skin types' },
  { name: 'Moisturizers', slug: 'moisturizers', description: 'Rich hydrating creams and emollients' },
  { name: 'Eye Care', slug: 'eye-care', description: 'Specialized treatments for the delicate eye area' },
];

const products = [
  {
    name: 'Radiance Face Serum',
    tagline: 'Botanical Vitamin C & Niacinamide Infusion',
    category: 'serums',
    price: 24500,
    originalPrice: 29000,
    image: '/Serum-1.jfif',
    secondaryImage: '/Serum-2.jfif',
    gallery: ['/Serum-1.jfif', '/Serum-2.jfif'],
    description: 'An intensive illuminating serum powered by stable Vitamin C and concentrated niacinamide to fade hyperpigmentation, smooth texture, and restore a luminous, glass-skin glow.',
    benefits: [
      'Instantly brightens dull and tired complexions',
      'Reduces the appearance of dark spots and sun damage',
      'Strengthens the lipid moisture barrier',
      'Lightweight, fast-absorbing texture with zero stickiness',
    ],
    ingredients: ['Tetrahexyldecyl Ascorbate (Vitamin C)', 'Niacinamide (Vitamin B3)', 'Snow Mushroom Extract', 'Hyaluronic Acid Complex'],
    howToUse: 'Dispense 3-4 drops onto clean, slightly damp skin every morning. Gently press into face, neck, and décolletage until fully absorbed.',
    skinType: 'All skin types, especially dull or uneven tones.',
    stock: 145,
    rating: 4.9,
    reviewCount: 128,
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'Velvet Hydration Cream',
    tagline: 'Rich Ceramide & Peptides Restorative Moisturizer',
    category: 'moisturizers',
    price: 26000,
    image: '/Velvet-1.jfif',
    secondaryImage: '/Velvet-2.jfif',
    gallery: ['/Velvet-1.jfif', '/Velvet-2.jfif', '/prod-1.png'],
    description: 'A deeply nourishing, cushion-soft cream that melts seamlessly into the skin, delivering 48-hour moisture while reinforcing cellular structure with biomimetic peptides and ceramides.',
    benefits: [
      'Locks in deep, sustained hydration without clogging pores',
      'Plumps fine lines and dry dehydration patches',
      'Calms redness and environmental irritation',
      'Leaves a luxurious, satin-velvet finish',
    ],
    ingredients: ['Ceramide NP, AP, EOP', 'Palmitoyl Tripeptide-1', 'Squalane (Olive-derived)', 'Centella Asiatica'],
    howToUse: 'Warm a pearl-sized amount between fingertips and massage upward into face and neck morning and night.',
    skinType: 'Dry, normal, and sensitive skin needing intensive barrier repair.',
    stock: 0,
    rating: 4.8,
    reviewCount: 94,
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'Botanical Cleansing Oil',
    tagline: 'Melting Makeup Remover & Nourishing Pre-Cleanse',
    category: 'cleansers',
    price: 17500,
    image: '/boc-1.jfif',
    secondaryImage: '/boc-2.jfif',
    gallery: ['/boc-1.jfif', '/boc-2.jfif', '/prod-2.png'],
    description: 'A silky, transformative cleansing oil that effortlessly dissolves waterproof makeup, mineral SPF, and daily impurities while keeping natural oils intact.',
    benefits: [
      'Effortlessly melts heavy makeup and stubborn SPF',
      'Emulsifies instantly upon contact with water',
      'Nourishes with antioxidant-rich botanical oils',
      'Never leaves a greasy residue or tight feeling',
    ],
    ingredients: ['Camellia Seed Oil', 'Jojoba Esters', 'Rosehip Fruit Oil', 'Bisabolol'],
    howToUse: 'Massage 2-3 pumps onto dry skin in circular motions. Add warm water to emulsify into a milky lather, then rinse thoroughly.',
    skinType: 'All skin types, including oily and acne-prone skin.',
    stock: 12,
    rating: 4.9,
    reviewCount: 76,
    isNew: true,
  },
  {
    name: 'Renewal Eye Elixir',
    tagline: 'Peptide & Caffeine Awakening Treatment',
    category: 'eye-care',
    price: 21000,
    image: '/ree-1.jfif',
    secondaryImage: '/ree-2.jfif',
    gallery: ['/ree-1.jfif', '/ree-2.jfif', '/prod-3.png'],
    description: 'A cooling, lightweight eye treatment engineered to target dark circles, puffiness, and expression lines with high-potency caffeine and botanical peptide complexes.',
    benefits: [
      'Instantly de-puffs under-eye bags upon application',
      'Brightens stubborn dark circles over time',
      'Firms delicate skin around the orbital bone',
      'Includes a cooling ceramic applicator tip',
    ],
    ingredients: ['Green Tea Caffeine', 'Acetyl Tetrapeptide-5', 'Niacinamide', 'Cucumber Distillate'],
    howToUse: 'Gently glide the ceramic tip around the eye contour morning and night. Tap excess product gently with your ring finger.',
    skinType: 'All skin types prone to fatigue, dark circles, or puffiness.',
    stock: 185,
    rating: 4.7,
    reviewCount: 52,
    isBestSeller: true,
  },
];

const discounts = [
  { code: 'WELCOME10', type: 'Percentage', value: '10%', usesCount: 1254, expiryDate: 'Never', isActive: true },
  { code: 'SUMMER20', type: 'Percentage', value: '20%', usesCount: 342, expiryDate: '2026-12-31', isActive: true },
  { code: 'ELORIA500', type: 'Fixed Amount', value: 'Rs 500', usesCount: 89, expiryDate: '2026-12-31', isActive: true },
];

// ─── Seed Function ────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      Inventory.deleteMany({}),
      Admin.deleteMany({}),
      Discount.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Seed categories
    await Category.insertMany(categories);
    console.log(`📁 Seeded ${categories.length} categories`);

    // Seed products
    const productsWithSlug = products.map(p => ({
      ...p,
      slug: p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }));
    const createdProducts = await Product.insertMany(productsWithSlug);
    console.log(`📦 Seeded ${createdProducts.length} products`);

    // Seed inventory
    const inventoryDocs = createdProducts.map((p, i) => ({
      product: p._id,
      productName: p.name,
      sku: `ELR-SKU-${1000 + i}`,
      availableStock: p.stock,
    }));
    await Inventory.insertMany(inventoryDocs);
    console.log(`📊 Seeded ${inventoryDocs.length} inventory records`);

    // Seed discounts
    await Discount.insertMany(discounts);
    console.log(`🏷️  Seeded ${discounts.length} discount codes`);

    // Seed admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@eloria.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    await Admin.create({ email: adminEmail, password: hashedPassword });
    console.log(`👤 Admin created: ${adminEmail}`);

    console.log('\n✅ Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
