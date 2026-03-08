import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  FiArrowRight,
  FiArrowUp,
  FiCheckCircle,
  FiGrid,
  FiPackage,
  FiShield,
  FiTruck,
  FiZap
} from "react-icons/fi";
import { apiRequest } from "../api/client";

type HomepageTemplate = "fashion" | "beauty" | "electronics" | "general" | "minimal";

type HomepageShopPayload = {
  shop: {
    id: string;
    name: string;
    slug: string;
    businessType?: string | null;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    heroImageUrls?: string[] | null;
    heroVideoUrl?: string | null;
    titleFont?: string | null;
    themeColor?: string | null;
    productCount: number;
    categoryCount: number;
  };
  homepageConfig: {
    enabled: boolean;
    template: HomepageTemplate;
    headline: string;
    subheadline: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    sectionsOrder: string[];
  };
  collectionsPath: string;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    productCount?: number;
    productImages?: string[];
  }>;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
    imageUrl?: string | null;
    categoryId?: string | null;
  }>;
};

const HOMEPAGE_TEMPLATES: HomepageTemplate[] = [
  "general",
  "fashion",
  "beauty",
  "electronics",
  "minimal"
];

const TEMPLATE_THEME: Record<
  HomepageTemplate,
  {
    rootClass: string;
    heroOverlayClass: string;
    heroPanelClass: string;
    heroBadgeClass: string;
    primaryButtonClass: string;
    secondaryButtonClass: string;
    sectionCardClass: string;
    collectionCardClass: string;
    productCardClass: string;
    trustStripClass: string;
    testimonialCardClass: string;
    footerClass: string;
    sectionTitleClass: string;
    collectionLayout: "standard" | "fashion" | "beauty" | "electronics" | "minimal";
  }
> = {
  general: {
    rootClass: "bg-slate-50 text-slate-900",
    heroOverlayClass: "bg-black/55",
    heroPanelClass:
      "bg-white/[0.04] border border-white/12 rounded-3xl backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
    heroBadgeClass: "bg-white/15 border border-white/35 text-white",
    primaryButtonClass: "bg-white text-slate-900",
    secondaryButtonClass: "border border-white/50 bg-white/10 text-white",
    sectionCardClass: "bg-white border border-slate-200 rounded-2xl shadow-sm",
    collectionCardClass: "bg-white border border-slate-200 rounded-2xl",
    productCardClass: "bg-white border border-slate-200 rounded-2xl",
    trustStripClass: "bg-white border border-slate-200 rounded-2xl",
    testimonialCardClass: "bg-white border border-slate-200 rounded-2xl",
    footerClass: "bg-white border-t border-slate-200",
    sectionTitleClass: "text-slate-900",
    collectionLayout: "standard"
  },
  fashion: {
    rootClass: "bg-stone-50 text-slate-900",
    heroOverlayClass: "bg-black/55",
    heroPanelClass: "bg-white/8 border border-white/20 rounded-[2rem] backdrop-blur-sm",
    heroBadgeClass: "bg-white/12 border border-white/35 text-white",
    primaryButtonClass: "bg-white text-slate-900",
    secondaryButtonClass: "border border-white/50 bg-white/10 text-white",
    sectionCardClass: "bg-white border border-slate-200 rounded-2xl shadow-sm",
    collectionCardClass: "bg-white border border-slate-200 rounded-[1.4rem] shadow-sm",
    productCardClass: "bg-white border border-slate-200 rounded-[1.2rem]",
    trustStripClass: "bg-white border border-slate-200 rounded-2xl",
    testimonialCardClass: "bg-white border border-slate-200 rounded-[1.2rem]",
    footerClass: "bg-white border-t border-slate-200",
    sectionTitleClass: "text-slate-900",
    collectionLayout: "fashion"
  },
  beauty: {
    rootClass: "bg-pink-50 text-slate-900",
    heroOverlayClass: "bg-black/55",
    heroPanelClass:
      "bg-white/[0.04] border border-white/12 rounded-[2rem] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]",
    heroBadgeClass: "bg-pink-100/20 border border-pink-100/45 text-white",
    primaryButtonClass: "bg-pink-100 text-pink-900",
    secondaryButtonClass: "border border-pink-100/70 bg-pink-100/20 text-white",
    sectionCardClass: "bg-white border border-pink-100 rounded-[1.6rem] shadow-sm",
    collectionCardClass: "bg-white border border-pink-100 rounded-[1.6rem] shadow-sm",
    productCardClass: "bg-white border border-pink-100 rounded-[1.3rem]",
    trustStripClass: "bg-white border border-pink-100 rounded-[1.6rem]",
    testimonialCardClass: "bg-white border border-pink-100 rounded-[1.3rem]",
    footerClass: "bg-white border-t border-pink-100",
    sectionTitleClass: "text-pink-900",
    collectionLayout: "beauty"
  },
  electronics: {
    rootClass: "bg-slate-950 text-slate-100",
    heroOverlayClass: "bg-black/55",
    heroPanelClass:
      "bg-slate-950/55 border border-cyan-300/35 rounded-[1.7rem] backdrop-blur-xl shadow-[0_18px_45px_rgba(6,182,212,0.18)]",
    heroBadgeClass: "bg-slate-950/55 border border-cyan-300/60 text-cyan-100",
    primaryButtonClass: "bg-cyan-300 text-slate-950",
    secondaryButtonClass: "border border-cyan-300/70 bg-slate-900/45 text-cyan-100",
    sectionCardClass: "bg-slate-900/70 border border-slate-700/90 rounded-2xl",
    collectionCardClass:
      "bg-slate-900/95 text-slate-100 border border-cyan-300/35 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
    productCardClass: "bg-slate-900/85 border border-slate-700 rounded-xl",
    trustStripClass: "bg-slate-900/92 text-slate-100 rounded-2xl",
    testimonialCardClass: "bg-slate-900/82 border border-slate-700 rounded-xl",
    footerClass: "bg-slate-950 text-slate-300 border-t border-cyan-300/20",
    sectionTitleClass: "text-cyan-100",
    collectionLayout: "electronics"
  },
  minimal: {
    rootClass: "bg-stone-100 text-slate-900",
    heroOverlayClass: "bg-black/55",
    heroPanelClass: "bg-white/8 border border-white/20 rounded-xl",
    heroBadgeClass: "bg-white/12 border border-white/35 text-white",
    primaryButtonClass: "bg-white text-slate-900",
    secondaryButtonClass: "border border-white/50 bg-transparent text-white",
    sectionCardClass: "bg-white border border-slate-300 rounded-xl",
    collectionCardClass: "bg-white border border-slate-300 rounded-xl",
    productCardClass: "bg-white border border-slate-300 rounded-xl",
    trustStripClass: "bg-white border border-slate-300 rounded-xl",
    testimonialCardClass: "bg-white border border-slate-300 rounded-xl",
    footerClass: "bg-white border-t border-slate-300",
    sectionTitleClass: "text-slate-900",
    collectionLayout: "minimal"
  }
};

const normalizeHomepageTemplate = (value: unknown): HomepageTemplate => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return HOMEPAGE_TEMPLATES.includes(normalized as HomepageTemplate)
    ? (normalized as HomepageTemplate)
    : "general";
};

type RevealFrom = "up" | "left" | "right";

const ScrollReveal = ({
  children,
  className,
  from = "up",
  delay = 0
}: {
  children: ReactNode;
  className?: string;
  from?: RevealFrom;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: "0px 0px -10% 0px"
  });

  const hiddenState =
    from === "left"
      ? { opacity: 0, x: -56, y: 0 }
      : from === "right"
      ? { opacity: 0, x: 56, y: 0 }
      : { opacity: 0, x: 0, y: 28 };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={hiddenState}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : hiddenState}
      transition={{
        duration: 0.62,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

const mapLegacyShopResponseToHomepage = (
  slug: string,
  legacyResponse: any
): HomepageShopPayload | null => {
  const shop = legacyResponse?.shop;
  if (!shop || !shop.id || !shop.slug) return null;
  const metadata =
    shop.metadata && typeof shop.metadata === "object" ? shop.metadata : {};
  const homepageRaw =
    metadata.homepageConfig && typeof metadata.homepageConfig === "object"
      ? metadata.homepageConfig
      : {};
  const categories = Array.isArray(shop.categories) ? shop.categories : [];
  const products = Array.isArray(shop.products) ? shop.products : [];
  const productImagesByCategory = new Map<string, string[]>();
  const productCountByCategory = new Map<string, number>();
  for (const product of products) {
    const categoryId = String((product as any)?.categoryId || "").trim();
    if (!categoryId) continue;
    productCountByCategory.set(categoryId, (productCountByCategory.get(categoryId) || 0) + 1);
    const metadata =
      (product as any)?.metadata && typeof (product as any).metadata === "object"
        ? ((product as any).metadata as Record<string, unknown>)
        : {};
    const metadataImages = Array.isArray(metadata.imageUrls)
      ? metadata.imageUrls.map((entry) => String(entry || "").trim()).filter(Boolean)
      : [];
    const imageCandidates = [String((product as any)?.imageUrl || "").trim(), ...metadataImages].filter(Boolean);
    if (imageCandidates.length === 0) continue;
    const existing = productImagesByCategory.get(categoryId) || [];
    existing.push(...imageCandidates);
    productImagesByCategory.set(categoryId, existing);
  }

  return {
    shop: {
      id: String(shop.id),
      name: String(shop.name || "Shop"),
      slug: String(shop.slug),
      businessType: String((shop as any).businessType || (metadata as any).businessType || "") || null,
      description: String(shop.description || "") || null,
      logoUrl: String(shop.logoUrl || "") || null,
      bannerUrl: String(shop.bannerUrl || "") || null,
      heroImageUrls: Array.isArray(shop.heroImageUrls)
        ? shop.heroImageUrls.map((entry: unknown) => String(entry || "")).filter(Boolean).slice(0, 4)
        : [],
      heroVideoUrl: String(shop.heroVideoUrl || "") || null,
      titleFont: String((metadata as any).titleFont || "") || null,
      themeColor: String(shop.themeColor || "") || null,
      productCount: products.length,
      categoryCount: categories.length
    },
    homepageConfig: {
      enabled: (homepageRaw as any).enabled !== false,
      template: normalizeHomepageTemplate((homepageRaw as any).template),
      headline: String((homepageRaw as any).headline || ""),
      subheadline: String((homepageRaw as any).subheadline || ""),
      primaryCtaLabel: String((homepageRaw as any).primaryCtaLabel || "Start Shopping"),
      secondaryCtaLabel: String((homepageRaw as any).secondaryCtaLabel || "View Collections"),
      sectionsOrder: Array.isArray((homepageRaw as any).sectionsOrder)
        ? (homepageRaw as any).sectionsOrder.map((entry: unknown) => String(entry || "")).filter(Boolean)
        : []
    },
    collectionsPath: `/shop/${encodeURIComponent(slug)}/collections`,
    categories: categories.map((entry: any) => ({
      id: String(entry.id || ""),
      name: String(entry.name || "Collection"),
      slug: String(entry.slug || ""),
      productCount: Number(productCountByCategory.get(String(entry.id || "").trim()) || 0),
      productImages: productImagesByCategory.get(String(entry.id || "").trim()) || []
    })),
    products: products.map((entry: any) => {
      const metadata =
        entry?.metadata && typeof entry.metadata === "object"
          ? (entry.metadata as Record<string, unknown>)
          : {};
      const metadataImages = Array.isArray(metadata.imageUrls)
        ? metadata.imageUrls.map((url) => String(url || "").trim()).filter(Boolean)
        : [];
      const imageCandidates = [String(entry.imageUrl || "").trim(), ...metadataImages].filter(Boolean);
      return {
        id: String(entry.id || ""),
        name: String(entry.name || "Product"),
        slug: String(entry.slug || ""),
        price: Number(entry.price || 0),
        currency: String(entry.currency || "USD"),
        imageUrl: imageCandidates[0] || null,
        categoryId: String(entry.categoryId || "") || null
      };
    })
  };
};

export const PublicShopEntry = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<HomepageShopPayload | null>(null);
  const [heroSlide, setHeroSlide] = useState(0);
  const [isHeroCompact, setIsHeroCompact] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const [heroCollapseOffset, setHeroCollapseOffset] = useState(320);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!slug) {
        setError("Invalid shop.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const next = await apiRequest<HomepageShopPayload>(`/shops/${slug}/homepage`);
        if (!mounted) return;
        setPayload(next);
        if (!next.homepageConfig?.enabled) {
          navigate(next.collectionsPath || `/shop/${slug}/collections`, { replace: true });
          return;
        }
      } catch (err: any) {
        try {
          const legacy = await apiRequest<any>(`/shops/${slug}`);
          const mapped = mapLegacyShopResponseToHomepage(slug, legacy);
          if (!mounted) return;
          if (!mapped) {
            setError("Failed to load shop homepage.");
            return;
          }
          setPayload(mapped);
          if (!mapped.homepageConfig?.enabled) {
            navigate(mapped.collectionsPath || `/shop/${slug}/collections`, {
              replace: true
            });
            return;
          }
        } catch (legacyErr: any) {
          if (!mounted) return;
          setError(
            legacyErr?.message ||
              err?.message ||
              "Failed to load shop homepage."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [slug, navigate]);

  const collectionsPath = useMemo(() => {
    return payload?.collectionsPath || (slug ? `/shop/${slug}/collections` : "/");
  }, [payload?.collectionsPath, slug]);

  const heroImages = useMemo(() => {
    const fromConfig = Array.isArray(payload?.shop?.heroImageUrls)
      ? payload.shop.heroImageUrls.map((entry) => String(entry || "").trim()).filter(Boolean)
      : [];
    if (fromConfig.length) return fromConfig;
    const fromProducts = (payload?.products || [])
      .map((product) => String(product.imageUrl || "").trim())
      .filter(Boolean)
      .slice(0, 4);
    if (fromProducts.length) return fromProducts;
    const banner = String(payload?.shop?.bannerUrl || "").trim();
    return banner ? [banner] : [];
  }, [payload?.products, payload?.shop?.bannerUrl, payload?.shop?.heroImageUrls]);

  useEffect(() => {
    if (!payload?.shop?.heroVideoUrl && heroImages.length > 1) {
      const timer = setInterval(() => {
        setHeroSlide((prev) => (prev + 1) % heroImages.length);
      }, 4500);
      return () => clearInterval(timer);
    }
    setHeroSlide(0);
    return undefined;
  }, [payload?.shop?.heroVideoUrl, heroImages.length]);

  useEffect(() => {
    const measureHeroBottom = () => {
      const heroEl = heroSectionRef.current;
      if (!heroEl) return;
      const rect = heroEl.getBoundingClientRect();
      const absoluteTop = rect.top + (window.scrollY || 0);
      const absoluteBottom = Math.round(absoluteTop + rect.height);
      setHeroCollapseOffset(Math.max(0, absoluteBottom));
    };

    measureHeroBottom();
    const onResize = () => measureHeroBottom();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && heroSectionRef.current) {
      observer = new ResizeObserver(() => measureHeroBottom());
      observer.observe(heroSectionRef.current);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      observer?.disconnect();
    };
  }, [
    payload?.shop?.id,
    payload?.shop?.bannerUrl,
    payload?.shop?.themeColor,
    payload?.shop?.heroVideoUrl,
    heroImages.length
  ]);

  useEffect(() => {
    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const threshold = Math.max(0, heroCollapseOffset - 2);
        const shouldCompact = y >= threshold;
        const shouldShowBackToTop = y >= 180;
        setIsHeroCompact((prev) => (prev === shouldCompact ? prev : shouldCompact));
        setShowBackToTop((prev) => (prev === shouldShowBackToTop ? prev : shouldShowBackToTop));
        rafId = null;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, [heroCollapseOffset]);

  const collectionShowcase = useMemo(() => {
    const productsByCategory = new Map<string, Array<{ imageUrl?: string | null }>>();
    for (const product of payload?.products || []) {
      const categoryId = String(product?.categoryId || "").trim();
      if (!categoryId) continue;
      const existing = productsByCategory.get(categoryId) || [];
      existing.push(product);
      productsByCategory.set(categoryId, existing);
    }

    const eligibleCategories = (payload?.categories || []).filter((category) => {
      const categoryId = String(category?.id || "").trim();
      const categoryProductCount = Number(category?.productCount || 0);
      return categoryId && (categoryProductCount > 0 || (productsByCategory.get(categoryId)?.length || 0) > 0);
    });

    const shuffled = [...eligibleCategories];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, 3).map((item, index) => {
      const categoryProducts = productsByCategory.get(String(item.id || "").trim()) || [];
      const categoryImagePool = Array.isArray(item.productImages)
        ? item.productImages.filter((url) => String(url || "").trim())
        : [];
      const productsWithImage = categoryProducts.filter((entry) => String(entry.imageUrl || "").trim());
      const imagePool = productsWithImage.length > 0 ? productsWithImage : categoryProducts;
      const chosenProduct =
        imagePool.length > 0
          ? imagePool[Math.floor(Math.random() * imagePool.length)]
          : null;
      const image =
        (categoryImagePool.length > 0
          ? categoryImagePool[Math.floor(Math.random() * categoryImagePool.length)]
          : String(chosenProduct?.imageUrl || "").trim()) ||
        heroImages[index % Math.max(heroImages.length, 1)] ||
        "";
      const keyword = String(item.name || "Collection").trim();
      const description =
        index === 0
          ? `Explore top picks in ${keyword.toLowerCase()} with curated essentials and best sellers.`
          : index === 1
          ? `Fresh arrivals in ${keyword.toLowerCase()} designed for everyday style and fast checkout.`
          : `Discover versatile options in ${keyword.toLowerCase()} with quality pieces for every customer.`;
      const highlights =
        index === 0
          ? ["Best sellers", "High-converting picks", "New arrivals"]
          : index === 1
          ? ["Trending now", "Limited drops", "Fast shipping"]
          : ["Everyday essentials", "Top rated", "Easy returns"];
      const href = item.id
        ? `${collectionsPath}?category=${encodeURIComponent(item.id)}`
        : collectionsPath;
      return { name: keyword, description, image, highlights, href };
    });
  }, [collectionsPath, heroImages, payload?.categories, payload?.products]);

  const testimonials = useMemo(() => {
    const shopName = payload?.shop?.name || "This store";
    return [
      {
        quote: `${shopName} made shopping smooth. Product quality matched exactly what I saw.`,
        name: "Verified Buyer",
        role: "Repeat Customer",
        stars: 5
      },
      {
        quote: "Fast delivery updates and clean checkout flow. I found what I needed quickly.",
        name: "A. Customer",
        role: "First-Time Buyer",
        stars: 5
      },
      {
        quote: "Collections are easy to browse and product cards are clear on mobile.",
        name: "R. Shopper",
        role: "Mobile Shopper",
        stars: 4
      }
    ];
  }, [payload?.shop?.name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-slate-700" />
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-4">
          <h1 className="text-lg font-semibold">Unable to load storefront homepage</h1>
          <p className="text-sm text-slate-600">{error || "Shop not found."}</p>
          <Link
            to={collectionsPath}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium"
          >
            Open Collections
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const { shop, homepageConfig, products } = payload;
  const shopTypeNormalized = String(shop.businessType || "")
    .trim()
    .toLowerCase();
  const hasExplicitClothingShopType =
    shopTypeNormalized === "cloth" ||
    shopTypeNormalized === "cloths" ||
    shopTypeNormalized === "clothes" ||
    shopTypeNormalized === "clothing" ||
    shopTypeNormalized === "fashion" ||
    shopTypeNormalized === "apparel" ||
    shopTypeNormalized.includes("cloth") ||
    shopTypeNormalized.includes("fashion") ||
    shopTypeNormalized.includes("apparel");
  const clothingKeywords = [
    "cloth",
    "clothes",
    "clothing",
    "fashion",
    "apparel",
    "mens",
    "men",
    "women",
    "unisex"
  ];
  const hasCatalogClothingSignal = [...(payload.categories || []), ...(payload.products || [])].some((entry) => {
    const haystack = String((entry as any)?.name || "")
      .trim()
      .toLowerCase();
    return clothingKeywords.some((keyword) => haystack.includes(keyword));
  });
  const isClothingShop = hasExplicitClothingShopType || hasCatalogClothingSignal;
  const showHeroQuickLinks = isClothingShop;
  const theme = TEMPLATE_THEME[homepageConfig.template || "general"];
  const heroHeadline = homepageConfig.headline || shop.name;
  const heroSubheadline = homepageConfig.subheadline || shop.description || "";
  const featurePillars = [
    {
      icon: FiShield,
      title: "Trusted Checkout",
      body: "Secure checkout flow with clear pricing and reliable order confirmation."
    },
    {
      icon: FiTruck,
      title: "Delivery Visibility",
      body: "Customers get order and delivery updates from placement to completion."
    },
    {
      icon: FiZap,
      title: "Fast Shopping Path",
      body: "Collections, product cards, and CTAs are optimized for conversion speed."
    }
  ];
  const isElectronicsTemplate = theme.collectionLayout === "electronics";
  const infoCardClass = isElectronicsTemplate
    ? "rounded-xl border border-slate-700 bg-slate-950/50 p-3"
    : "rounded-xl border border-slate-200 bg-white p-3";
  const infoHeadingClass = isElectronicsTemplate ? "text-slate-100" : "text-slate-900";
  const infoBodyClass = isElectronicsTemplate ? "text-slate-300" : "text-slate-600";
  const infoEyebrowClass = isElectronicsTemplate ? "text-cyan-200" : "text-slate-500";
  const trustChipClass = isElectronicsTemplate
    ? "text-xs rounded-full px-2.5 py-1 bg-slate-950/70 text-cyan-100"
    : "text-xs rounded-full px-2.5 py-1 bg-white/80 border border-slate-200";
  const ctaButtonClass = isElectronicsTemplate
    ? "inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950"
    : "inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white";
  const scrollToSection = (sectionId: string) => {
    if (typeof window === "undefined") return;
    const target = document.getElementById(sectionId);
    if (!target) return;
    const offset = 88;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  };
  const trustStripContent = (
    <ScrollReveal from="up">
      <div className={`${theme.trustStripClass} p-3 md:p-4 flex flex-wrap items-center justify-between gap-3`}>
        <p className="text-xs md:text-sm font-medium m-0">
          Trusted by customers shopping across fashion, beauty, lifestyle, and essentials.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className={trustChipClass}>{shop.productCount}+ Products</span>
          <span className={trustChipClass}>{shop.categoryCount}+ Collections</span>
        </div>
      </div>
    </ScrollReveal>
  );

  return (
    <div className={`min-h-screen ${theme.rootClass}`}>
      <div
        className={`fixed left-0 right-0 top-0 z-50 transition-transform duration-200 ${
          isHeroCompact ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div
          className="h-[5.25rem] backdrop-blur border-b border-white/10 px-4 md:px-6 lg:px-8"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(2,6,23,0.46), rgba(2,6,23,0.72)), linear-gradient(120deg, ${
              shop.themeColor || "#2563eb"
            } 0%, rgba(15,23,42,0.94) 100%)`
          }}
        >
          <div className="h-full mx-auto w-full max-w-6xl flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1
                className="text-base md:text-lg font-bold text-white tracking-tight truncate"
                style={{
                  fontFamily:
                    shop.titleFont ||
                    '"Playfair Display","Bodoni Moda","Times New Roman",serif'
                }}
              >
                {shop.name}
              </h1>
              <p className="text-xs text-white/85 mt-0.5 truncate max-w-[22rem]">
                {shop.description || "Discover quality products curated for you."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={collectionsPath}
                className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur text-slate-800"
              >
                Collections
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <section
        ref={heroSectionRef}
        className={`relative z-20 overflow-x-hidden overflow-y-visible md:overflow-hidden border-b min-h-[62vh] sm:min-h-[70vh] md:min-h-[90vh] ${
          isElectronicsTemplate ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"
        }`}
      >
        {showHeroQuickLinks && (
          <div className="absolute top-4 right-4 sm:top-5 sm:right-6 md:top-6 md:right-8 z-20 flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-white bg-black/30 border border-white/35 backdrop-blur-sm hover:bg-black/40 transition-colors"
              onClick={() => scrollToSection("featured-collections")}
            >
              Featured Collections
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-white bg-black/30 border border-white/35 backdrop-blur-sm hover:bg-black/40 transition-colors"
              onClick={() => scrollToSection("latest-products")}
            >
              Latest Products
            </button>
          </div>
        )}
        <div className="absolute inset-0">
          {shop.heroVideoUrl ? (
            <video
              src={shop.heroVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : heroImages.length > 0 ? (
            <img
              src={heroImages[heroSlide]}
              alt={shop.name}
              className="h-full w-full object-cover transition-opacity duration-700"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `linear-gradient(120deg, ${shop.themeColor || "#1d4ed8"} 0%, #0f172a 100%)`
              }}
            />
          )}
          <div className={`absolute inset-0 ${theme.heroOverlayClass}`} />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 h-full flex items-center pt-14 pb-32 md:pt-24 md:pb-36">
          <div className="w-full max-w-4xl mr-auto space-y-5 md:space-y-6">
            <div className="w-full max-w-3xl mt-6 sm:mt-0 pl-0 pr-5 py-5 md:pl-[3px] md:pr-8 md:py-8 lg:pl-[3px] lg:pr-10 lg:py-10 text-white space-y-4">
              <p className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${theme.heroBadgeClass}`}>
                {shop.name}
              </p>
              <h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                style={{ fontFamily: shop.titleFont || undefined }}
              >
                {heroHeadline}
              </h1>
              <p className="text-sm md:text-base lg:text-lg text-white/90 max-w-2xl">{heroSubheadline}</p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={collectionsPath}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${theme.primaryButtonClass}`}
                >
                  {homepageConfig.primaryCtaLabel || "Start Shopping"}
                  <FiArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={collectionsPath}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${theme.secondaryButtonClass}`}
                >
                  {homepageConfig.secondaryCtaLabel || "View Collections"}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:block absolute inset-x-0 bottom-6 z-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            {trustStripContent}
          </div>
        </div>
      </section>

      <div className="md:hidden relative z-30 -mt-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          {trustStripContent}
        </div>
      </div>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-14 pb-8 md:py-12 space-y-8">
        {collectionShowcase.length > 0 ? collectionShowcase.map((block, index) => {
          const revealFrom: RevealFrom = index % 2 === 1 ? "right" : "left";
          const revealKey = `${block.name}-${index}`;
          if (theme.collectionLayout === "fashion") {
            return (
              <ScrollReveal key={revealKey} from={revealFrom} delay={index * 0.06}>
                <div className={`${theme.collectionCardClass} relative overflow-hidden min-h-[230px] md:min-h-[300px]`}>
                {block.image ? (
                  <img src={block.image} alt={block.name} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-stone-100" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/20" />
                <div className="relative p-4 md:p-6 text-white space-y-2 h-full flex flex-col justify-end">
                  <p className="text-xs font-semibold uppercase tracking-wide m-0">Editorial Drop</p>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight m-0">{block.name}</h2>
                  <p className="text-sm text-white/90 m-0">{block.description}</p>
                  <Link to={block.href} className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                    Browse {block.name}
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                </div>
              </ScrollReveal>
            );
          }

          if (theme.collectionLayout === "beauty") {
            return (
              <ScrollReveal key={revealKey} from={revealFrom} delay={index * 0.06}>
                <div className={`${theme.collectionCardClass} p-4 md:p-5 grid grid-cols-2 md:grid-cols-[1.1fr,1fr] gap-4`}>
                <div className="rounded-2xl overflow-hidden border border-pink-100 bg-pink-50 h-52 md:h-64">
                  {block.image ? (
                    <img src={block.image} alt={block.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-pink-100" />
                  )}
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-pink-700 m-0">Beauty Edit</p>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-pink-900 m-0">{block.name}</h2>
                  <p className="text-sm md:text-base text-slate-600 m-0">{block.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {block.highlights.map((entry) => (
                      <span key={`${block.name}-${entry}`} className="text-xs rounded-full px-2.5 py-1 bg-pink-100 text-pink-900">{entry}
                      </span>
                    ))}
                  </div>
                  <Link to={block.href} className="inline-flex items-center gap-2 text-sm font-semibold text-pink-800">
                    Browse {block.name}
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                </div>
              </ScrollReveal>
            );
          }

          if (theme.collectionLayout === "electronics") {
            return (
              <ScrollReveal key={revealKey} from={revealFrom} delay={index * 0.06}>
                <div className={`${theme.collectionCardClass} p-4 md:p-5 space-y-3`}>
                <div className="grid grid-cols-2 md:grid-cols-[1fr,1.2fr] gap-4 items-center">
                  <div className="rounded-xl overflow-hidden border border-cyan-300/35 bg-slate-950/60 h-48 md:h-56">
                    {block.image ? (
                      <img src={block.image} alt={block.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-slate-800" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300 m-0">Tech Collection</p>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 m-0">{block.name}</h2>
                    <p className="text-sm text-slate-300 m-0">{block.description}</p>
                    <ul className="m-0 p-0 flex flex-wrap gap-1.5">
                      {block.highlights.map((entry) => (
                        <li
                          key={`${block.name}-${entry}`}
                          className="list-none text-xs text-cyan-100 inline-flex items-center gap-2 rounded-full border border-cyan-300/35 px-2.5 py-1 bg-slate-950/60"
                        >
                          <FiZap className="h-3 w-3 text-cyan-300" />
                          {entry}
                        </li>
                      ))}
                    </ul>
                    <Link to={block.href} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
                      Browse {block.name}
                      <FiArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                </div>
              </ScrollReveal>
            );
          }

          if (theme.collectionLayout === "minimal") {
            return (
              <ScrollReveal key={revealKey} from={revealFrom} delay={index * 0.06}>
                <div className={`${theme.collectionCardClass} p-4 md:p-6`}>
                <div className="grid grid-cols-2 md:grid-cols-[1fr,1.2fr] gap-4 md:gap-6 items-center">
                  <div className="rounded-xl overflow-hidden border border-stone-200 h-44 md:h-56">
                    {block.image ? (
                      <img src={block.image} alt={block.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-stone-200" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl md:text-2xl font-semibold tracking-tight m-0">{block.name}</h2>
                    <p className="text-sm text-slate-600 m-0">{block.description}</p>
                    <Link to={block.href} className="inline-flex items-center gap-2 text-sm font-semibold">
                      Browse {block.name}
                      <FiArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                </div>
              </ScrollReveal>
            );
          }

          const desktopReversed = index % 2 === 1;
          return (
            <ScrollReveal key={revealKey} from={revealFrom} delay={index * 0.06}>
              <div
                className={`grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8 items-center ${
                  desktopReversed ? "[&>*:first-child]:order-2 [&>*:last-child]:order-1" : ""
                }`}
              >
                <div className={`${theme.collectionCardClass} overflow-hidden`}>
                  {block.image ? (
                    <img src={block.image} alt={block.name} className="h-56 md:h-72 w-full object-cover" />
                  ) : (
                    <div className="h-56 md:h-72 w-full bg-slate-100" />
                  )}
                </div>
                <div className={`space-y-3 ${theme.sectionTitleClass}`}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 m-0">Browse</p>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight m-0">{block.name}</h2>
                  <p className="text-sm md:text-base text-slate-600 m-0">{block.description}</p>
                  <Link to={block.href} className="inline-flex items-center gap-2 text-sm font-semibold hover:text-blue-700">
                    Browse {block.name}
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          );
        }) : (
          <ScrollReveal from="up">
            <div className={`${theme.sectionCardClass} p-4 md:p-5`}>
              <h3 className={`text-base md:text-lg font-semibold m-0 ${infoHeadingClass}`}>Collection Preview Unavailable</h3>
              <p className={`mt-2 text-sm m-0 ${infoBodyClass}`}>
                Add products to categories (with at least one product image) to show category browse cards here.
              </p>
              <Link to={collectionsPath} className={`mt-3 ${ctaButtonClass}`}>
                Browse Collections
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal from="up">
          <div className={`p-4 md:p-5 ${theme.sectionCardClass}`}>
          <h3 className={`text-base md:text-lg font-semibold m-0 ${infoHeadingClass}`}>Why Customers Buy Here</h3>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            {featurePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className={infoCardClass}>
                  <Icon className={`h-4 w-4 ${isElectronicsTemplate ? "text-cyan-300" : "text-slate-600"}`} />
                  <p className={`mt-2 text-sm font-semibold m-0 ${infoHeadingClass}`}>{pillar.title}</p>
                  <p className={`mt-1 text-xs m-0 ${infoBodyClass}`}>{pillar.body}</p>
                </div>
              );
            })}
          </div>
          </div>
        </ScrollReveal>

        <ScrollReveal from="up" delay={0.04}>
          <div className={`${theme.sectionCardClass} p-4 md:p-5`}>
          <h3 className={`text-base md:text-lg font-semibold m-0 ${infoHeadingClass}`}>Shopping Journey</h3>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={infoCardClass}>
              <p className={`text-xs font-semibold uppercase tracking-wide m-0 ${infoEyebrowClass}`}>Step 1</p>
              <p className={`mt-1 text-sm font-semibold m-0 ${infoHeadingClass}`}>Browse Collections</p>
              <p className={`mt-1 text-xs m-0 ${infoBodyClass}`}>Customers discover categories quickly from the hero and collection blocks.</p>
            </div>
            <div className={infoCardClass}>
              <p className={`text-xs font-semibold uppercase tracking-wide m-0 ${infoEyebrowClass}`}>Step 2</p>
              <p className={`mt-1 text-sm font-semibold m-0 ${infoHeadingClass}`}>Pick Products</p>
              <p className={`mt-1 text-xs m-0 ${infoBodyClass}`}>Latest products and featured cards guide them to high-converting inventory.</p>
            </div>
            <div className={infoCardClass}>
              <p className={`text-xs font-semibold uppercase tracking-wide m-0 ${infoEyebrowClass}`}>Step 3</p>
              <p className={`mt-1 text-sm font-semibold m-0 ${infoHeadingClass}`}>Checkout Smoothly</p>
              <p className={`mt-1 text-xs m-0 ${infoBodyClass}`}>Secure checkout and delivery updates close the loop from purchase to fulfillment.</p>
            </div>
          </div>
          </div>
        </ScrollReveal>

        <ScrollReveal from="up" delay={0.08}>
          <div id="featured-collections">
          <div className="mb-3 flex items-center gap-2">
            <FiGrid className={`h-4 w-4 ${isElectronicsTemplate ? "text-cyan-300" : "text-slate-500"}`} />
            <h2 className={`text-sm font-semibold uppercase tracking-wide ${theme.sectionTitleClass}`}>
              Featured Collections
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {payload.categories.length > 0 ? (
              payload.categories.map((category) => (
                <Link
                  key={category.id}
                  to={`${collectionsPath}?category=${encodeURIComponent(category.id)}`}
                  className={`${theme.sectionCardClass} p-4 hover:-translate-y-0.5 transition-transform`}
                >
                  <p className={`font-medium m-0 ${infoHeadingClass}`}>{category.name}</p>
                </Link>
              ))
            ) : (
              <p className={`text-sm ${infoBodyClass}`}>No categories available yet.</p>
            )}
          </div>
          </div>
        </ScrollReveal>

        <ScrollReveal from="up" delay={0.1}>
          <div id="latest-products">
          <div className="mb-3 flex items-center gap-2">
            <FiPackage className={`h-4 w-4 ${isElectronicsTemplate ? "text-cyan-300" : "text-slate-500"}`} />
            <h2 className={`text-sm font-semibold uppercase tracking-wide ${theme.sectionTitleClass}`}>
              Latest Products
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className={`${theme.productCardClass} p-3`}>
                  <div
                    className={`aspect-square rounded-lg overflow-hidden ${
                      isElectronicsTemplate ? "bg-slate-950/70 border border-slate-700" : "bg-slate-100"
                    }`}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <p className={`mt-2 text-sm font-medium truncate m-0 ${infoHeadingClass}`}>{product.name}</p>
                  <p className={`text-xs m-0 ${infoBodyClass}`}>
                    {product.currency} {Number(product.price || 0).toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <p className={`text-sm col-span-2 md:col-span-3 lg:col-span-4 ${infoBodyClass}`}>
                No products available yet.
              </p>
            )}
          </div>
          </div>
        </ScrollReveal>

        <ScrollReveal from="up" delay={0.12}>
          <div>
          <h2 className={`text-sm font-semibold uppercase tracking-wide ${theme.sectionTitleClass}`}>
            Customer Reviews
          </h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            {testimonials.map((item, idx) => (
              <div key={`${item.name}-${idx}`} className={`${theme.testimonialCardClass} p-4`}>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: item.stars }).map((_, i) => (
                    <FiCheckCircle key={`${idx}-${i}`} className="h-3.5 w-3.5" />
                  ))}
                </div>
                <p className={`mt-2 text-sm m-0 ${isElectronicsTemplate ? "text-slate-200" : "text-slate-700"}`}>"{item.quote}"</p>
                <p className={`mt-2 text-xs font-semibold m-0 ${infoHeadingClass}`}>{item.name}</p>
                <p className={`text-xs m-0 ${infoBodyClass}`}>{item.role}</p>
              </div>
            ))}
          </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-10">
        <ScrollReveal from="up">
          <div className={`${theme.sectionCardClass} p-4 md:p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between`}>
          <div>
            <h3 className={`text-lg md:text-xl font-semibold m-0 ${infoHeadingClass}`}>
              Ready to browse full collections?
            </h3>
            <p className={`text-sm m-0 ${infoBodyClass}`}>
              See every category and product in the complete storefront catalog.
            </p>
          </div>
          <Link
            to={collectionsPath}
            className={ctaButtonClass}
          >
            Open Collections
            <FiArrowRight className="h-4 w-4" />
          </Link>
          </div>
        </ScrollReveal>
      </section>

      <button
        className={`fixed bottom-4 right-3 sm:bottom-6 sm:right-5 z-[120] h-10 w-10 sm:h-11 sm:w-11 rounded-full text-white shadow-lg border border-white/20 flex items-center justify-center transition-all duration-200 ${
          showBackToTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        style={{ backgroundColor: shop.themeColor || "#2563eb" }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        title="Back to top"
      >
        <FiArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <footer className={theme.footerClass}>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm m-0">
            {shop.name} - Powered by Debby
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link className="text-xs hover:underline" to={collectionsPath}>
              Collections
            </Link>
            <Link className="text-xs hover:underline" to={collectionsPath}>
              Latest Products
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
