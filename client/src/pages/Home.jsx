import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useAnimationFrame, useScroll, useTransform } from 'framer-motion';
import { productAPI } from '../api/axios';
import ProductCard from '../components/common/ProductCard';
import {
  ArrowRight, Award, Bird, Cat, Dog, Fish, HeartHandshake,
  Leaf, Rabbit, Search, ShieldCheck, ShoppingBag,
  Sparkles, Star, Store, Truck, Turtle, WandSparkles
} from 'lucide-react';
import premiumWinkingCatBanner from '../assets/premium-winking-cat-banner.png';
import './Home.css';

const TRUST_BADGES = [
  { Icon: ShieldCheck, label: 'Verified sellers' },
  { Icon: Award, label: 'Premium quality' },
  { Icon: Truck, label: 'Fast delivery' },
];

const STATS = [
  { value: '10k+', label: 'Premium products' },
  { value: '500+', label: 'Trusted sellers' },
  { value: '50k+', label: 'Happy pet families' },
];

const VALUE_CARDS = [
  {
    Icon: WandSparkles,
    title: 'Curated like a boutique',
    body: 'A refined marketplace for food, toys, wellness, and accessories selected for pets who deserve better.',
  },
  {
    Icon: HeartHandshake,
    title: 'Built around trust',
    body: 'Verified sellers, clear product details, secure checkout, and support designed for calm buying decisions.',
  },
  {
    Icon: Leaf,
    title: 'Naturally elevated',
    body: 'Warm materials, premium brands, and thoughtful essentials for healthier daily rituals.',
  },
];

const animalShowcase = [
  {
    key: 'dog',
    name: 'Dogs',
    subtitle: 'Heroic companions, elevated daily rituals.',
    Icon: Dog,
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=90',
    position: 'center 45%',
  },
  {
    key: 'cat',
    name: 'Cats',
    subtitle: 'Elegant comfort for calm, curious homes.',
    Icon: Cat,
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=90',
    position: 'center 42%',
  },
  {
    key: 'bird',
    name: 'Birds',
    subtitle: 'Bright care for expressive, graceful companions.',
    Icon: Bird,
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=1200&q=90',
    position: 'center 38%',
  },
  {
    key: 'fish',
    name: 'Fish',
    subtitle: 'Cinematic aquarium calm for peaceful spaces.',
    Icon: Fish,
    image: 'https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?auto=format&fit=crop&w=1200&q=90',
    position: 'center 50%',
  },
  {
    key: 'rabbit',
    name: 'Rabbits',
    subtitle: 'Soft habitats and gentle care for quiet bonds.',
    Icon: Rabbit,
    image: 'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?auto=format&fit=crop&w=1200&q=90',
    position: 'center 45%',
  },
  {
    key: 'reptile',
    name: 'Reptiles',
    subtitle: 'Exotic habitats with precise, premium care.',
    Icon: Turtle,
    image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1200&q=90',
    position: 'center 45%',
  },
];

const lifestyleShowcase = [
  {
    title: 'Architectural pet homes',
    text: 'Warm spaces designed around comfort.',
    image: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=1000&q=90',
  },
  {
    title: 'Premium nutrition moments',
    text: 'Clean ingredients, beautifully served.',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=1000&q=90',
  },
  {
    title: 'Boutique walking gear',
    text: 'Soft materials for daily rituals.',
    image: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=1000&q=90',
  },
  {
    title: 'Calm wellness care',
    text: 'Thoughtful grooming and recovery.',
    image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1000&q=90',
  },
  {
    title: 'Cozy rest essentials',
    text: 'Textures made for slower evenings.',
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1000&q=90',
  },
  {
    title: 'Playful design objects',
    text: 'Toys that look good at home.',
    image: 'https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?auto=format&fit=crop&w=1000&q=90',
  },
];

const heroOrbitAnimals = [
  {
    key: 'dog',
    name: 'Dogs',
    subtitle: 'Heroic daily companions',
    Icon: Dog,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=92',
  },
  {
    key: 'cat',
    name: 'Cats',
    subtitle: 'Quiet elegance at home',
    Icon: Cat,
    image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=900&q=92',
  },
  {
    key: 'bird',
    name: 'Birds',
    subtitle: 'Colorful bright rituals',
    Icon: Bird,
    image: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=900&q=92',
  },
  {
    key: 'fish',
    name: 'Fish',
    subtitle: 'Calm aquatic worlds',
    Icon: Fish,
    image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=900&q=92',
  },
  {
    key: 'rabbit',
    name: 'Rabbits',
    subtitle: 'Warm gentle comfort',
    Icon: Rabbit,
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=92',
  },
  {
    key: 'reptile',
    name: 'Reptiles',
    subtitle: 'Exotic habitat care',
    Icon: Turtle,
    image: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?auto=format&fit=crop&w=900&q=92',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

function HeroOrbitShowcase({ lift }) {
  const [angle, setAngle] = useState(0);
  const [paused, setPaused] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => (
    typeof window === 'undefined' ? 1200 : window.innerWidth
  ));

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useAnimationFrame((time) => {
    if (!paused) setAngle((time / 42) % 360);
  });

  const radius = viewportWidth < 680 ? 142 : viewportWidth < 900 ? 188 : viewportWidth < 1180 ? 212 : 236;

  return (
    <motion.div
      className="premium-hero__visual premium-hero__visual--orbit"
      style={{ y: lift }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="orbit-stage" aria-label="Premium rotating animal categories">
        {heroOrbitAnimals.map(({ Icon, ...animal }, index) => {
          const theta = (angle + index * (360 / heroOrbitAnimals.length)) % 360;
          const radians = theta * (Math.PI / 180);
          const depth = (Math.cos(radians) + 1) / 2;
          const floatY = Math.sin(radians * 1.4) * 14;
          const scale = 0.74 + depth * 0.32;
          const opacity = 0.42 + depth * 0.58;
          const shadowFade = 0.78 + depth * 0.22;

          return (
            <motion.div
              key={animal.key}
              className={`orbit-card orbit-card--${animal.key}`}
              style={{
                zIndex: Math.round(depth * 100),
                opacity,
                filter: `saturate(${0.86 + depth * 0.24}) drop-shadow(0 24px 42px rgba(22,36,25,${0.14 * shadowFade}))`,
                transform: `translate(-50%, -50%) rotateY(${theta}deg) translateZ(${radius}px) translateY(${floatY}px) rotateY(${-theta}deg) scale(${scale})`,
              }}
              transition={{ type: 'spring', stiffness: 230, damping: 22 }}
            >
              <Link to={`/products?pet_type=${animal.key}`} className="orbit-card__link">
                <img src={animal.image} alt={`${animal.name} premium lifestyle photography`} />
                <div className="orbit-card__veil" />
                <div className="orbit-card__label">
                  <span><Icon size={17} strokeWidth={2} /></span>
                  <div>
                    <strong>{animal.name}</strong>
                    <small>{animal.subtitle}</small>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroLift = useTransform(scrollY, [0, 520], [0, -54]);

  useEffect(() => {
    productAPI.getCategories().then(r => setCategories(r.data.data)).catch(() => setCategories([]));
    productAPI.getAll({ featured: 1, limit: 8 }).then(r => setFeatured(r.data.data)).catch(() => setFeatured([]));
    productAPI.getAll({ sort: 'created_at', order: 'DESC', limit: 4 }).then(r => setNewArrivals(r.data.data)).catch(() => setNewArrivals([]));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const fallbackCategories = [
    { id: 'food', slug: 'food', name: 'Nutrition', product_count: '2k+', Icon: Leaf },
    { id: 'toys', slug: 'toys', name: 'Toys', product_count: '1.4k+', Icon: Sparkles },
    { id: 'accessories', slug: 'accessories', name: 'Accessories', product_count: '900+', Icon: ShoppingBag },
    { id: 'health', slug: 'health', name: 'Wellness', product_count: '700+', Icon: ShieldCheck },
  ];
  const categoryTiles = (categories.length ? categories.slice(0, 4) : fallbackCategories).map((cat, index) => ({
    ...cat,
    Icon: fallbackCategories[index % fallbackCategories.length].Icon,
  }));

  return (
    <main className="home premium-home">
      <section className="premium-hero">
        <div className="hero-particles" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, index) => (
            <span key={index} className={`hero-particle hero-particle--${index + 1}`} />
          ))}
        </div>

        <div className="container premium-hero__inner">
          <motion.div
            className="premium-hero__content"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div className="premium-kicker" whileHover={{ y: -2 }}>
              <Sparkles size={15} strokeWidth={2} />
              Premium pet marketplace
            </motion.div>

            <h1 className="premium-hero__title">
              Curated care<br />
              for pets with<br />
              <span>exceptional<br />taste.</span>
            </h1>

            <p className="premium-hero__copy">
              Discover elevated food, wellness, toys, and accessories from<br className="desktop-break" />
              trusted sellers. A warmer, smarter way to shop for every<br className="desktop-break" />
              animal you love.
            </p>

            <form onSubmit={handleSearch} className="premium-search">
              <Search size={18} strokeWidth={2} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search premium food, beds, toys..."
              />
              <motion.button type="submit" className="magnetic-btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                Explore
                <ArrowRight size={16} strokeWidth={2.2} />
              </motion.button>
            </form>

            <div className="trust-row">
              {TRUST_BADGES.map(({ Icon, label }) => (
                <span key={label}>
                  <Icon size={16} strokeWidth={2} />
                  {label}
                </span>
              ))}
            </div>

            <div className="hero-stats">
              {STATS.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="hero-stat"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.12, duration: 0.55 }}
                >
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <HeroOrbitShowcase lift={heroLift} />
        </div>
      </section>

      <section className="animal-showcase-section">
        <div className="container">
          <motion.div
            className="luxury-section-head luxury-section-head--center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={fadeUp}
            transition={{ duration: 0.55 }}
          >
            <span>Explore by companion</span>
            <h2>Beautiful care starts with the animal you love.</h2>
          </motion.div>

          <motion.div
            className="animal-gallery"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } },
            }}
          >
            {animalShowcase.map(({ Icon, ...animal }, index) => (
              <motion.article
                key={animal.key}
                className={`animal-card animal-card--${index + 1}`}
                variants={{
                  hidden: { opacity: 0, y: 34, scale: 0.96 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -10 }}
              >
                <Link to={`/products?pet_type=${animal.key}`} className="animal-card__link">
                  <img
                    src={animal.image}
                    alt={`${animal.name} premium pet products`}
                    style={{ objectPosition: animal.position }}
                  />
                  <div className="animal-card__overlay" />
                  <div className="animal-card__content">
                    <span className="animal-card__icon" aria-hidden="true"><Icon size={20} strokeWidth={1.9} /></span>
                    <div className="animal-card__copy">
                      <div>
                        <strong>{animal.name}</strong>
                        <p>{animal.subtitle}</p>
                      </div>
                      <span className="animal-card__cta">
                        Shop {animal.name}
                        <ArrowRight size={15} strokeWidth={2.2} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="editorial-strip">
        <div className="container editorial-strip__grid">
          <motion.div
            className="editorial-copy"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={fadeUp}
            transition={{ duration: 0.55 }}
          >
            <span>Designed for modern pet families</span>
            <h2>Marketplace utility with boutique-level emotion.</h2>
            <p>
              PetMarket combines fast discovery, trusted sellers, and elevated curation
              so the first visit feels personal, polished, and worth coming back to.
            </p>
            <Link to="/products" className="text-link">
              Browse the collection <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
          </motion.div>

          <div className="lifestyle-marquee" aria-label="Luxury pet lifestyle showcase">
            <motion.div
              className="lifestyle-marquee__track"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            >
              {[...lifestyleShowcase, ...lifestyleShowcase].map((item, index) => (
                <motion.article
                  key={`${item.title}-${index}`}
                  className="lifestyle-card"
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                >
                  <img src={item.image} alt={item.title} />
                  <div className="lifestyle-card__shade" />
                  <div className="lifestyle-card__copy">
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="premium-categories">
        <div className="container">
          <div className="luxury-section-head luxury-section-head--center">
            <span>Intelligent discovery</span>
            <h2>Find the right product faster.</h2>
          </div>
          <div className="category-lux-grid">
            {categoryTiles.map(({ Icon, ...cat }, index) => (
              <motion.div
                key={cat.id || cat.slug || cat.name}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.45 }}
              >
                <Link to={`/products?category=${cat.slug}`} className="category-lux-card">
                  <span><Icon size={22} strokeWidth={1.9} /></span>
                  <div>
                    <strong>{cat.name}</strong>
                    <small>{cat.product_count || 'Curated'} products</small>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="value-section">
        <div className="container value-grid">
          {VALUE_CARDS.map(({ Icon, title, body }, index) => (
            <motion.article
              key={title}
              className="value-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
            >
              <span><Icon size={23} strokeWidth={1.9} /></span>
              <h3>{title}</h3>
              <p>{body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="product-showcase product-showcase--featured">
          <div className="container">
            <div className="section-header premium-products-head">
              <div>
                <span className="section-label"><Star size={16} fill="currentColor" strokeWidth={0} /> Editor picks</span>
                <h2 className="section-title">Featured products with a premium edge.</h2>
                <p className="section-subtitle">Handpicked favorites from trusted sellers.</p>
              </div>
              <Link to="/products?featured=1" className="btn btn-outline">View Featured</Link>
            </div>
            <div className="grid-4 premium-product-grid">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="seller-cta">
        <motion.div
          className="container seller-cta__inner"
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.28 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="seller-cta__content">
            <span className="section-label"><Store size={16} strokeWidth={2} /> For premium sellers</span>
            <h2>Launch a storefront that feels as refined as your brand.</h2>
            <p>Reach pet parents with a marketplace experience built around trust, detail, and beautiful discovery.</p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link to="/register" className="magnetic-btn seller-cta__btn">
                Start selling
                <ArrowRight size={16} strokeWidth={2.2} />
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="seller-cta__photo"
            whileHover={{ y: -8, rotate: -0.4 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            aria-hidden="true"
          >
            <img
              src={premiumWinkingCatBanner}
              alt=""
            />
            <div className="seller-cta__photo-glass">
              <Sparkles size={16} strokeWidth={2} />
              Wink-worthy pet discovery
            </div>
          </motion.div>
        </motion.div>
      </section>

      {newArrivals.length > 0 && (
        <section className="product-showcase">
          <div className="container">
            <div className="section-header premium-products-head">
              <div>
                <span className="section-label"><Sparkles size={16} strokeWidth={2} /> Fresh arrivals</span>
                <h2 className="section-title">New pieces for better daily rituals.</h2>
                <p className="section-subtitle">Recently added products with a polished marketplace feel.</p>
              </div>
              <Link to="/products" className="btn btn-outline">Browse All</Link>
            </div>
            <div className="grid-4 premium-product-grid">
              {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
