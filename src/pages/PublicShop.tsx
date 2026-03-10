import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import {
  FiArrowUp,
  FiCreditCard,
  FiDownload,
  FiHeart,
  FiLogOut,
  FiMenu,
  FiMessageCircle,
  FiMinus,
  FiPlus,
  FiRefreshCw,
  FiCopy,
  FiSearch,
  FiSliders,
  FiShoppingCart,
  FiTrash2,
  FiUser,
  FiX
} from "react-icons/fi";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

type ShopCategory = {
  id: string;
  name: string;
  slug: string;
};

type ShopProduct = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  imageUrl?: string | null;
  inventory: number;
  averageRating?: number;
  ratingCount?: number;
  categoryId?: string | null;
  metadata?: {
    imageUrls?: string[];
    videoUrl?: string;
    productType?: string;
    sizeType?: string;
    sizeOptions?: string[];
    sizeGuideHint?: string;
    colorOptions?: string[];
    textureOptions?: string[];
    lengthOptions?: string[];
    subscribeEnabled?: boolean;
    subscribeCadence?: "weekly" | "monthly" | "quarterly" | null;
    subscribeDiscountPercent?: number;
    subscribePrepaidCycles?: number | null;
  } | null;
};

type ShopResponse = {
  shop: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    heroImageUrls?: string[] | null;
    heroVideoUrl?: string | null;
    themeColor?: string | null;
    metadata?: { titleFont?: string | null } | null;
    sellerWhatsApp?: string | null;
    businessMode?: "own" | "dropship" | "hybrid";
    checkoutMode?: "whatsapp_only" | "card_only" | "hybrid";
    allowedCheckoutMethods?: Array<"whatsapp" | "card">;
    dropshipEnabled?: boolean;
    supplierCount?: number;
    categories: ShopCategory[];
    products: ShopProduct[];
  };
};

type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  imageUrl?: string | null;
  categoryName?: string;
  selections: {
    size?: string;
    color?: string;
    texture?: string;
    length?: string;
  };
  purchaseMode?: "one_time" | "subscribe";
  subscription?: {
    cadence?: "weekly" | "monthly" | "quarterly";
    discountPercent?: number;
    prepaidCycles?: number | null;
  };
};

type CheckoutOrderResponse = {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: number;
    totalAmount: number;
    currency: string;
    createdAt: string;
  };
  customer?: {
    id: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  whatsappMessage: string;
  whatsappUrl: string | null;
  paymentLink: string | null;
  paymentGateway: string | null;
  warning: string | null;
};

type CheckoutNotice = {
  tone: "success" | "error";
  message: string;
};

type OrderPaymentStatusResponse = {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: number;
    totalAmount: number;
    currency: string;
    createdAt: string;
    paidAt?: string | null;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      metadata?: any;
    }>;
    customer?: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      phone?: string | null;
    } | null;
    returns?: Array<{
      id: string;
      status: string;
      reason: string;
      note?: string | null;
      requestedAt?: string | null;
      updatedAt?: string | null;
      resolutionNote?: string | null;
    }>;
  };
  payment: {
    id: string;
    status: string;
    gatewayProvider?: string | null;
    gatewayPaymentId?: string | null;
    paymentLink?: string | null;
  } | null;
};

type ShopCustomerSession = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

type ShopCustomerAccessResponse = {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    subtotal: number;
    totalAmount: number;
    currency: string;
    createdAt: string;
    paidAt?: string | null;
    payment: {
      id: string;
      status: string;
      gatewayProvider?: string | null;
      gatewayPaymentId?: string | null;
      paymentLink?: string | null;
    } | null;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      metadata?: any;
    }>;
    returns?: Array<{
      id: string;
      status: string;
      reason: string;
      note?: string | null;
      requestedAt?: string | null;
      updatedAt?: string | null;
      resolutionNote?: string | null;
    }>;
  }>;
};

type ShopCustomerOrder = ShopCustomerAccessResponse["orders"][number];

type StorefrontAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  gclid?: string;
  fbclid?: string;
};

type ShopCheckoutOptionsResponse = {
  currency: string;
  methods: Array<{
    id: string;
    label: string;
    category: "card" | "wallet" | "bnpl" | "bank";
    gateway: "stripe" | "paystack" | "paypal" | "hybrid";
    enabled: boolean;
    reason?: string;
  }>;
  hasAnyMethod: boolean;
  allowedCheckoutMethods?: Array<"whatsapp" | "card">;
};

type ShopRecommendationProduct = ShopProduct & {
  score?: number;
  reasons?: string[];
};

type ShopRecommendationsResponse = {
  settings: {
    enabled: boolean;
    maxItems: number;
    boostInStock: number;
    boostPopular: number;
    boostPriceSimilarity: number;
    synonyms: Array<{ term: string; aliases: string[] }>;
  };
  products: ShopRecommendationProduct[];
};

type ShopReturnRequestResponse = {
  request: {
    id: string;
    status: string;
    reason: string;
    note?: string | null;
  };
  orderId: string;
  orderNumber: string;
};

type ProductReviewsResponse = {
  summary: {
    productId: string;
    productName: string;
    averageRating: number;
    ratingCount: number;
    breakdown: Record<number, number>;
  };
  reviews: Array<{
    id: string;
    rating: number;
    title?: string | null;
    comment?: string | null;
    mediaUrls?: string[];
    verifiedBuyer: boolean;
    createdAt: string;
    customerName: string;
  }>;
};

type ReviewInviteLookupResponse = {
  invite: {
    id: string;
    expiresAt: string;
    product: {
      id: string;
      name: string;
      slug: string;
      imageUrl?: string | null;
    };
    order: {
      id: string;
      orderNumber: string;
      status: string;
      createdAt: string;
    };
    customerName?: string | null;
  };
};

const deterministicHash = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const getDeterministicSubset = <T,>(items: T[], count: number, seed: string) => {
  if (!Array.isArray(items) || items.length === 0 || count <= 0) return [] as T[];
  const keyed = items.map((item, index) => {
    const score = deterministicHash(`${seed}:${index}`);
    return { item, score };
  });
  keyed.sort((a, b) => a.score - b.score);
  return keyed.slice(0, count).map((entry) => entry.item);
};

const formatRatingValue = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "0.0";
  return Number(value).toFixed(1);
};

export const PublicShop = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shop, setShop] = useState<ShopResponse["shop"] | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [showProductPanel, setShowProductPanel] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedTexture, setSelectedTexture] = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPurchaseMode, setSelectedPurchaseMode] = useState<"one_time" | "subscribe">("one_time");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isHeroCompact, setIsHeroCompact] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [showStoreMenu, setShowStoreMenu] = useState(false);
  const [storeMenuTab, setStoreMenuTab] = useState<"orders" | "account">("orders");
  const [showCheckout, setShowCheckout] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [checkoutNotice, setCheckoutNotice] = useState<CheckoutNotice | null>(null);
  const [checkoutPaymentLink, setCheckoutPaymentLink] = useState<string | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<OrderPaymentStatusResponse | null>(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [showPaymentResultModal, setShowPaymentResultModal] = useState(false);
  const [paymentResultTone, setPaymentResultTone] = useState<"success" | "warning" | "error">("success");
  const [paymentResultMessage, setPaymentResultMessage] = useState("");
  const [loadingPaymentResult, setLoadingPaymentResult] = useState(false);
  const [submittingCheckout, setSubmittingCheckout] = useState<"whatsapp" | "card" | null>(null);
  const [customerSession, setCustomerSession] = useState<ShopCustomerSession | null>(null);
  const [customerOrders, setCustomerOrders] = useState<ShopCustomerAccessResponse["orders"]>([]);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessNotice, setAccessNotice] = useState<CheckoutNotice | null>(null);
  const [accessForm, setAccessForm] = useState({ email: "", phone: "" });
  const [checkoutEntryMode, setCheckoutEntryMode] = useState<"choose" | "existing" | "new">(
    "choose"
  );
  const [returningCheckoutForm, setReturningCheckoutForm] = useState({ email: "", phone: "" });
  const [authenticatingReturning, setAuthenticatingReturning] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    note: ""
  });
  const [checkoutOptions, setCheckoutOptions] = useState<ShopCheckoutOptionsResponse | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<ShopRecommendationProduct[]>([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [returnItemQuantities, setReturnItemQuantities] = useState<Record<string, number>>({});
  const [productReviewDetailsById, setProductReviewDetailsById] = useState<
    Record<string, ProductReviewsResponse>
  >({});
  const [loadingReviewProductId, setLoadingReviewProductId] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loadingReviewInvite, setLoadingReviewInvite] = useState(false);
  const [reviewInviteDetails, setReviewInviteDetails] = useState<ReviewInviteLookupResponse["invite"] | null>(
    null
  );
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    token: "",
    rating: 5,
    title: "",
    comment: ""
  });
  const heroSectionRef = useRef<HTMLDivElement | null>(null);
  const [heroCollapseOffset, setHeroCollapseOffset] = useState(320);
  const [storefrontSessionId, setStorefrontSessionId] = useState("");
  const [storefrontAttribution, setStorefrontAttribution] = useState<StorefrontAttribution | null>(null);
  const trackedPageViewRef = useRef<string>("");
  const productPanelCloseTimerRef = useRef<number | null>(null);
  const productPanelAnimationFrameRef = useRef<number | null>(null);
  const heroVideoUrl = String(shop?.heroVideoUrl || "").trim();
  const heroImageUrls = useMemo(() => {
    const direct = Array.isArray(shop?.heroImageUrls)
      ? shop.heroImageUrls.map((entry) => String(entry || "").trim()).filter(Boolean).slice(0, 4)
      : [];
    if (direct.length > 0) return direct;
    const fallbackBanner = String(shop?.bannerUrl || "").trim();
    return fallbackBanner ? [fallbackBanner] : [];
  }, [shop?.heroImageUrls, shop?.bannerUrl]);
  const hasHeroCarousel = !heroVideoUrl && heroImageUrls.length > 1;
  const storefrontThemeColor = String(shop?.themeColor || "").trim();

  const createStorefrontSessionId = () =>
    `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

  const normalizeAttribution = (raw: Record<string, unknown> | null | undefined): StorefrontAttribution => {
    const source = String(raw?.source || "").trim();
    const medium = String(raw?.medium || "").trim();
    const campaign = String(raw?.campaign || "").trim();
    const term = String(raw?.term || "").trim();
    const content = String(raw?.content || "").trim();
    const gclid = String(raw?.gclid || "").trim();
    const fbclid = String(raw?.fbclid || "").trim();
    const next: StorefrontAttribution = {};
    if (source) next.source = source;
    if (medium) next.medium = medium;
    if (campaign) next.campaign = campaign;
    if (term) next.term = term;
    if (content) next.content = content;
    if (gclid) next.gclid = gclid;
    if (fbclid) next.fbclid = fbclid;
    return next;
  };

  const extractAttributionFromSearch = (search: string): StorefrontAttribution => {
    const params = new URLSearchParams(search || "");
    return normalizeAttribution({
      source: params.get("utm_source") || params.get("debby_source") || "",
      medium: params.get("utm_medium") || params.get("debby_channel") || "",
      campaign: params.get("utm_campaign") || "",
      term: params.get("utm_term") || "",
      content: params.get("utm_content") || "",
      gclid: params.get("gclid") || "",
      fbclid: params.get("fbclid") || ""
    });
  };

  const trackStorefrontEvent = async (
    eventName:
      | "page_view"
      | "view_product"
      | "add_to_cart"
      | "begin_checkout"
      | "purchase"
      | "search"
      | "track_order"
      | "open_cart"
      | "return_request",
    payload?: Record<string, any>
  ) => {
    if (!slug) return;
    try {
      await apiRequest(`/shops/${slug}/events`, {
        method: "POST",
        body: {
          eventName,
          sessionId: storefrontSessionId || undefined,
          source: storefrontAttribution?.source,
          medium: storefrontAttribution?.medium,
          campaign: storefrontAttribution?.campaign,
          term: storefrontAttribution?.term,
          content: storefrontAttribution?.content,
          gclid: storefrontAttribution?.gclid,
          fbclid: storefrontAttribution?.fbclid,
          url: typeof window !== "undefined" ? window.location.href : undefined,
          referrer: typeof document !== "undefined" ? document.referrer : undefined,
          ...(payload || {})
        }
      });
    } catch {
      // Telemetry is best-effort; checkout and browsing should not fail on analytics transport issues.
    }
  };

  const applyCustomerSession = (profile: ShopCustomerAccessResponse["customer"]) => {
    const nextSession: ShopCustomerSession = {
      id: profile.id,
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      address: profile.address || ""
    };
    setCustomerSession(nextSession);
    setAccessForm({
      email: nextSession.email || "",
      phone: nextSession.phone || ""
    });
    setCheckoutForm((prev) => ({
      ...prev,
      firstName: nextSession.firstName || prev.firstName,
      lastName: nextSession.lastName || prev.lastName,
      phone: nextSession.phone || prev.phone,
      email: nextSession.email || prev.email,
      address: nextSession.address || prev.address
    }));
  };

  const fetchCustomerAccess = async (
    contact: { email?: string; phone?: string },
    opts?: { silent?: boolean }
  ) => {
    if (!slug) return null;
    const email = String(contact.email || "")
      .trim()
      .toLowerCase();
    const phone = String(contact.phone || "").trim();
    if (!email && !phone) {
      if (!opts?.silent) {
        setAccessNotice({ tone: "error", message: "Enter your email or phone number." });
      }
      return null;
    }
    try {
      setAccessLoading(true);
      const data = await apiRequest<ShopCustomerAccessResponse>(`/shops/${slug}/customer/access`, {
        method: "POST",
        body: {
          email,
          phone
        }
      });
      applyCustomerSession(data.customer);
      setCustomerOrders(data.orders || []);
      if (!opts?.silent) {
        setAccessNotice({
          tone: "success",
          message: `Welcome back. ${data.orders.length} order${data.orders.length === 1 ? "" : "s"} found.`
        });
      }
      return data;
    } catch (err: any) {
      if (err?.response?.status === 404 || !opts?.silent) {
        setCustomerSession(null);
        setCustomerOrders([]);
      }
      if (!opts?.silent) {
        setAccessNotice({
          tone: "error",
          message:
            err?.response?.data?.error ||
            err?.message ||
            "Could not find your profile. Place your first order to create it."
        });
      }
      return null;
    } finally {
      setAccessLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const data = await apiRequest<ShopResponse>(`/shops/${slug}`);
        setShop(data.shop);
        setActiveCategoryId("all");
        setSearchTerm("");
        setSortBy("featured");
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to load shop");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  useEffect(() => {
    const loadCheckoutOptions = async () => {
      if (!slug || !shop) {
        setCheckoutOptions(null);
        return;
      }
      try {
        const preferredCurrency =
          cartItems[0]?.currency || shop.products?.[0]?.currency || "USD";
        const data = await apiRequest<ShopCheckoutOptionsResponse>(
          `/shops/${slug}/checkout/options?currency=${encodeURIComponent(preferredCurrency)}`
        );
        setCheckoutOptions(data);
      } catch {
        setCheckoutOptions(null);
      }
    };
    loadCheckoutOptions();
  }, [slug, shop?.id, cartItems]);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!slug || !shop?.id) {
        setRecommendedProducts([]);
        return;
      }
      try {
        const params = new URLSearchParams();
        if (selectedProduct?.id) {
          params.set("productId", selectedProduct.id);
        } else {
          if (activeCategoryId !== "all") params.set("categoryId", activeCategoryId);
          if (searchTerm.trim()) params.set("q", searchTerm.trim());
        }
        params.set("limit", "8");
        const data = await apiRequest<ShopRecommendationsResponse>(
          `/shops/${slug}/recommendations?${params.toString()}`
        );
        setRecommendedProducts(Array.isArray(data.products) ? data.products : []);
      } catch {
        setRecommendedProducts([]);
      }
    };
    loadRecommendations();
  }, [slug, shop?.id, activeCategoryId, searchTerm, selectedProduct?.id]);

  useEffect(() => {
    const loadProductReviews = async () => {
      if (!slug || !selectedProduct?.id) return;
      try {
        setLoadingReviewProductId(selectedProduct.id);
        const data = await apiRequest<ProductReviewsResponse>(
          `/shops/${slug}/products/${selectedProduct.id}/reviews`
        );
        setProductReviewDetailsById((prev) => ({
          ...prev,
          [selectedProduct.id]: data
        }));
      } catch {
        // Keep storefront responsive even when reviews fail to load.
      } finally {
        setLoadingReviewProductId((prev) => (prev === selectedProduct.id ? null : prev));
      }
    };
    loadProductReviews();
  }, [slug, selectedProduct?.id]);

  useEffect(() => {
    const loadReviewInviteFromUrl = async () => {
      if (!slug) return;
      const params = new URLSearchParams(location.search || "");
      const token = String(params.get("token") || "").trim();
      if (!token) return;
      try {
        setLoadingReviewInvite(true);
        const data = await apiRequest<ReviewInviteLookupResponse>(
          `/shops/${slug}/reviews/invite/${encodeURIComponent(token)}`
        );
        setReviewInviteDetails(data.invite);
        setReviewForm({
          token,
          rating: 5,
          title: "",
          comment: ""
        });
        setShowReviewModal(true);
      } catch (err: any) {
        setNotice(err?.response?.data?.error || err?.message || "This review link is invalid.");
      } finally {
        setLoadingReviewInvite(false);
      }
    };
    loadReviewInviteFromUrl();
  }, [slug, location.search]);

  useEffect(() => {
    if (!slug) return;
    try {
      const rawCart = localStorage.getItem(`public-shop-cart:${slug}`);
      const rawFavorites = localStorage.getItem(`public-shop-favorites:${slug}`);
      const rawSession = localStorage.getItem(`public-shop-session:${slug}`);
      const sessionIdKey = `public-shop-session-id:${slug}`;
      const attributionKey = `public-shop-attribution:${slug}`;
      const currentSessionId = localStorage.getItem(sessionIdKey) || createStorefrontSessionId();
      localStorage.setItem(sessionIdKey, currentSessionId);
      setStorefrontSessionId(currentSessionId);
      let persistedAttribution: StorefrontAttribution = {};
      const rawAttribution = localStorage.getItem(attributionKey);
      if (rawAttribution) {
        try {
          persistedAttribution = normalizeAttribution(JSON.parse(rawAttribution));
        } catch {
          persistedAttribution = {};
        }
      }
      const queryAttribution = extractAttributionFromSearch(location.search);
      const mergedAttribution = normalizeAttribution({
        ...persistedAttribution,
        ...queryAttribution
      });
      if (Object.keys(mergedAttribution).length > 0) {
        setStorefrontAttribution(mergedAttribution);
        localStorage.setItem(attributionKey, JSON.stringify(mergedAttribution));
      } else {
        setStorefrontAttribution(null);
      }
      setCartItems(rawCart ? (JSON.parse(rawCart) as CartItem[]) : []);
      setFavoriteProductIds(rawFavorites ? (JSON.parse(rawFavorites) as string[]) : []);
      if (rawSession) {
        const parsed = JSON.parse(rawSession) as ShopCustomerSession;
        const email = String(parsed?.email || "").trim();
        const phone = String(parsed?.phone || "").trim();
        if (email || phone) {
          setCustomerSession({
            id: parsed.id,
            firstName: String(parsed.firstName || ""),
            lastName: String(parsed.lastName || ""),
            email,
            phone,
            address: String(parsed.address || "")
          });
          setAccessForm({ email, phone });
          fetchCustomerAccess({ email, phone }, { silent: true }).catch(() => undefined);
        } else {
          setCustomerSession(null);
          setCustomerOrders([]);
        }
      } else {
        setCustomerSession(null);
        setCustomerOrders([]);
      }
    } catch {
      setCartItems([]);
      setFavoriteProductIds([]);
      setCustomerSession(null);
      setCustomerOrders([]);
      setStorefrontSessionId("");
      setStorefrontAttribution(null);
    }
  }, [slug, location.search]);

  useEffect(() => {
    if (!slug) return;
    localStorage.setItem(`public-shop-cart:${slug}`, JSON.stringify(cartItems));
  }, [cartItems, slug]);

  useEffect(() => {
    if (!slug) return;
    localStorage.setItem(`public-shop-favorites:${slug}`, JSON.stringify(favoriteProductIds));
  }, [favoriteProductIds, slug]);

  useEffect(() => {
    if (!slug) return;
    if (!customerSession) {
      localStorage.removeItem(`public-shop-session:${slug}`);
      return;
    }
    localStorage.setItem(`public-shop-session:${slug}`, JSON.stringify(customerSession));
  }, [customerSession, slug]);

  useEffect(() => {
    if (!slug || !storefrontSessionId) return;
    localStorage.setItem(`public-shop-session-id:${slug}`, storefrontSessionId);
  }, [slug, storefrontSessionId]);

  useEffect(() => {
    if (!slug) return;
    const key = `public-shop-attribution:${slug}`;
    if (!storefrontAttribution || Object.keys(storefrontAttribution).length === 0) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(storefrontAttribution));
  }, [slug, storefrontAttribution]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    if (!accessNotice) return;
    const t = setTimeout(() => setAccessNotice(null), 3500);
    return () => clearTimeout(t);
  }, [accessNotice]);

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
  }, [shop?.id, shop?.bannerUrl, shop?.themeColor, heroVideoUrl, heroImageUrls.length]);

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

  useEffect(() => {
    setHeroSlideIndex(0);
  }, [shop?.id, heroVideoUrl, heroImageUrls.length]);

  useEffect(() => {
    if (!hasHeroCarousel) return;
    const timer = window.setTimeout(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroImageUrls.length);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [hasHeroCarousel, heroImageUrls.length, heroSlideIndex]);

  useEffect(() => {
    if (!showStoreMenu) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showStoreMenu]);

  const fetchOrderPaymentStatus = async (orderId: string, reference?: string) => {
    if (!slug || !orderId) return null;
    const qs = new URLSearchParams();
    if (reference) qs.set("reference", reference);
    const query = qs.toString();
    const result = await apiRequest<OrderPaymentStatusResponse>(
      `/shops/${slug}/orders/${orderId}/payment-status${query ? `?${query}` : ""}`
    );
    setTrackingOrder(result);
    return result;
  };

  const openOrderDetails = async (order: ShopCustomerOrder) => {
    setTrackingOrder({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        totalAmount: order.totalAmount,
        currency: order.currency,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        items: order.items,
        returns: order.returns || []
      },
      payment: order.payment
    });
    setShowOrderDetailsModal(true);
    try {
      setLoadingOrderDetails(true);
      await fetchOrderPaymentStatus(order.id, order.payment?.gatewayPaymentId || undefined);
    } catch {
      // Keep fallback order details in modal.
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const handleCustomerOrderLogout = () => {
    setCustomerSession(null);
    setCustomerOrders([]);
    setAccessForm({ email: "", phone: "" });
    setCheckoutEntryMode("choose");
    setAccessNotice({ tone: "success", message: "Logged out from order access." });
  };

  const copyTrackingId = async (trackingId: string) => {
    const value = String(trackingId || "").trim();
    if (!value) {
      setNotice("Tracking ID is not available yet.");
      return;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const tempInput = document.createElement("textarea");
        tempInput.value = value;
        tempInput.style.position = "fixed";
        tempInput.style.left = "-9999px";
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      setNotice(`Tracking ID copied: ${value}`);
    } catch {
      setNotice("Failed to copy tracking ID. Please copy manually.");
    }
  };

  const openReturnRequestModal = () => {
    if (!trackingOrder) return;
    const initialQuantities = trackingOrder.order.items.reduce<Record<string, number>>((acc, item) => {
      acc[item.id] = Math.max(1, Number(item.quantity || 1));
      return acc;
    }, {});
    setReturnItemQuantities(initialQuantities);
    setReturnReason("");
    setReturnNote("");
    setShowReturnModal(true);
  };

  const submitReturnRequest = async () => {
    if (!slug || !trackingOrder) return;
    if (!returnReason.trim()) {
      setNotice("Select or provide a return reason.");
      return;
    }

    const selectedItems = trackingOrder.order.items
      .map((item) => {
        const requestedQuantity = Math.min(
          Math.max(Number(returnItemQuantities[item.id] || 0), 0),
          Math.max(1, Number(item.quantity || 1))
        );
        if (requestedQuantity <= 0) return null;
        return {
          orderItemId: item.id,
          quantity: requestedQuantity
        };
      })
      .filter((entry): entry is { orderItemId: string; quantity: number } => Boolean(entry));

    if (selectedItems.length === 0) {
      setNotice("Select at least one item quantity to return.");
      return;
    }

    const accessEmail =
      String(customerSession?.email || "").trim() ||
      String(trackingOrder.order.customer?.email || "").trim();
    const accessPhone =
      String(customerSession?.phone || "").trim() ||
      String(trackingOrder.order.customer?.phone || "").trim();
    if (!accessEmail && !accessPhone) {
      setNotice("Sign in with the email or phone used for this order before requesting a return.");
      return;
    }

    try {
      setSubmittingReturn(true);
      const payload = {
        email: accessEmail || undefined,
        phone: accessPhone || undefined,
        reason: returnReason.trim(),
        note: returnNote.trim() || undefined,
        items: selectedItems
      };
      const result = await apiRequest<ShopReturnRequestResponse>(
        `/shops/${slug}/orders/${trackingOrder.order.id}/returns`,
        { method: "POST", body: payload }
      );

      await trackStorefrontEvent("return_request", {
        orderId: trackingOrder.order.id,
        value: Number(trackingOrder.order.totalAmount || 0),
        currency: trackingOrder.order.currency,
        metadata: {
          returnId: result.request.id,
          reason: result.request.reason,
          items: selectedItems.length
        }
      });

      setShowReturnModal(false);
      setNotice(`Return request submitted for order ${result.orderNumber}.`);
      await fetchOrderPaymentStatus(
        trackingOrder.order.id,
        trackingOrder.payment?.gatewayPaymentId || undefined
      );
      if (accessEmail || accessPhone) {
        await fetchCustomerAccess(
          {
            email: accessEmail,
            phone: accessPhone
          },
          { silent: true }
        );
      }
    } catch (err: any) {
      setNotice(err?.response?.data?.error || err?.message || "Failed to submit return request.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  const clearReviewTokenFromUrl = () => {
    const params = new URLSearchParams(location.search || "");
    if (!params.has("token")) return;
    params.delete("token");
    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : ""
      },
      { replace: true }
    );
  };

  const submitProductReview = async () => {
    if (!slug || !reviewForm.token) {
      setNotice("Missing review token.");
      return;
    }
    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      setNotice("Select a rating between 1 and 5 stars.");
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await apiRequest<{ review: { id: string; status: string }; pendingModeration: boolean }>(
        `/shops/${slug}/reviews/submit`,
        {
          method: "POST",
          body: {
            token: reviewForm.token,
            rating: reviewForm.rating,
            title: reviewForm.title.trim() || undefined,
            comment: reviewForm.comment.trim() || undefined
          }
        }
      );

      const targetProductId = reviewInviteDetails?.product?.id;
      if (targetProductId) {
        const latest = await apiRequest<ProductReviewsResponse>(
          `/shops/${slug}/products/${targetProductId}/reviews`
        ).catch(() => null);
        if (latest) {
          setProductReviewDetailsById((prev) => ({ ...prev, [targetProductId]: latest }));
          setShop((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              products: prev.products.map((product) =>
                product.id === targetProductId
                  ? {
                      ...product,
                      averageRating: latest.summary.averageRating,
                      ratingCount: latest.summary.ratingCount
                    }
                  : product
              )
            };
          });
          setSelectedProduct((prev) =>
            prev && prev.id === targetProductId
              ? {
                  ...prev,
                  averageRating: latest.summary.averageRating,
                  ratingCount: latest.summary.ratingCount
                }
              : prev
          );
        }
      }

      setShowReviewModal(false);
      setReviewInviteDetails(null);
      setReviewForm({ token: "", rating: 5, title: "", comment: "" });
      clearReviewTokenFromUrl();
      setNotice(
        response.pendingModeration
          ? "Thanks. Your review was submitted and is pending moderation."
          : "Thanks. Your review was submitted successfully."
      );
    } catch (err: any) {
      setNotice(err?.response?.data?.error || err?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const runPaymentResultFlow = async () => {
      if (!slug) return;
      const params = new URLSearchParams(location.search);
      if (params.get("paymentResult") !== "1") return;

      const orderId = String(params.get("orderId") || "").trim();
      const reference =
        String(params.get("reference") || params.get("trxref") || params.get("transaction_id") || "").trim() ||
        undefined;
      if (!orderId) return;

      try {
        setLoadingPaymentResult(true);
        const result = await fetchOrderPaymentStatus(orderId, reference);
        const paymentStatus = String(result?.payment?.status || "").toLowerCase();
        const orderStatus = String(result?.order?.status || "").toLowerCase();
        const isSuccess =
          ["completed", "verified"].includes(paymentStatus) || ["paid", "completed"].includes(orderStatus);
        const isFailed = ["failed", "flagged"].includes(paymentStatus) || ["failed", "cancelled"].includes(orderStatus);

        if (isSuccess) {
          setPaymentResultTone("success");
          setPaymentResultMessage(
            `Payment successful. Order ${result?.order?.orderNumber || ""} is confirmed. Track your order below.`
          );
        } else if (isFailed) {
          setPaymentResultTone("error");
          setPaymentResultMessage("Payment failed. You can try checkout again from your cart.");
        } else {
          setPaymentResultTone("warning");
          setPaymentResultMessage("Payment is still processing. Please refresh order status in a moment.");
        }
        setShowPaymentResultModal(true);
      } catch (err: any) {
        setPaymentResultTone("error");
        setPaymentResultMessage(err?.response?.data?.error || err?.message || "Could not confirm payment status.");
        setShowPaymentResultModal(true);
      } finally {
        setLoadingPaymentResult(false);
      }

      const cleaned = new URLSearchParams(location.search);
      cleaned.delete("paymentResult");
      cleaned.delete("paymentId");
      cleaned.delete("reference");
      cleaned.delete("trxref");
      cleaned.delete("transaction_id");
      const nextSearch = cleaned.toString();
      navigate(
        {
          pathname: location.pathname,
          search: nextSearch ? `?${nextSearch}` : ""
        },
        { replace: true }
      );
    };

    runPaymentResultFlow();
  }, [location.pathname, location.search, navigate, slug]);

  useEffect(() => {
    if (!slug || !shop?.id || !storefrontSessionId) return;
    const key = `${slug}|${location.pathname}|${location.search}|${storefrontSessionId}|${
      storefrontAttribution?.source || ""
    }|${storefrontAttribution?.medium || ""}|${storefrontAttribution?.campaign || ""}`;
    if (trackedPageViewRef.current === key) return;
    trackedPageViewRef.current = key;
    trackStorefrontEvent("page_view", {
      metadata: {
        shopId: shop.id
      }
    }).catch(() => undefined);
  }, [slug, shop?.id, location.pathname, location.search, storefrontSessionId, storefrontAttribution]);

  const categories = shop?.categories || [];
  const products = shop?.products || [];
  const inStockProducts = useMemo(
    () => products.filter((product) => Number(product.inventory || 0) > 0),
    [products]
  );
  const allowedCheckoutMethods =
    checkoutOptions?.allowedCheckoutMethods && checkoutOptions.allowedCheckoutMethods.length > 0
      ? checkoutOptions.allowedCheckoutMethods
      : shop?.allowedCheckoutMethods && shop.allowedCheckoutMethods.length > 0
      ? shop.allowedCheckoutMethods
      : (["whatsapp", "card"] as Array<"whatsapp" | "card">);
  const canWhatsappCheckout = allowedCheckoutMethods.includes("whatsapp");
  const canCardCheckout = allowedCheckoutMethods.includes("card");
  const selectedProductReviewDetails = selectedProduct
    ? productReviewDetailsById[selectedProduct.id] || null
    : null;
  const selectedProductAverageRating = selectedProductReviewDetails
    ? Number(selectedProductReviewDetails.summary.averageRating || 0)
    : Number(selectedProduct?.averageRating || 0);
  const selectedProductRatingCount = selectedProductReviewDetails
    ? Number(selectedProductReviewDetails.summary.ratingCount || 0)
    : Number(selectedProduct?.ratingCount || 0);
  const selectedProductSubscribeEnabled = Boolean(selectedProduct?.metadata?.subscribeEnabled);
  const selectedProductSubscribeDiscount = selectedProductSubscribeEnabled
    ? Math.max(0, Math.min(100, Number(selectedProduct?.metadata?.subscribeDiscountPercent || 0)))
    : 0;
  const selectedProductPrice = Number(selectedProduct?.price || 0);
  const selectedProductDiscountedPrice =
    selectedPurchaseMode === "subscribe" && selectedProductSubscribeEnabled
      ? selectedProductPrice * (1 - selectedProductSubscribeDiscount / 100)
      : selectedProductPrice;

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories) {
      map.set(category.id, category.name);
    }
    return map;
  }, [categories]);

  const productsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const category of categories) {
      counts[category.id] = 0;
    }
    for (const product of inStockProducts) {
      if (product.categoryId && counts[product.categoryId] !== undefined) {
        counts[product.categoryId] += 1;
      }
    }
    return counts;
  }, [categories, inStockProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    let result = [...inStockProducts];

    if (activeCategoryId !== "all") {
      result = result.filter((product) => product.categoryId === activeCategoryId);
    }

    if (showFavoritesOnly) {
      const favoriteSet = new Set(favoriteProductIds);
      result = result.filter((product) => favoriteSet.has(product.id));
    }

    if (normalizedSearch) {
      result = result.filter((product) => {
        const searchable = [
          product.name,
          product.description || "",
          product.metadata?.productType || "",
          categoryNameById.get(product.categoryId || "") || ""
        ]
          .join(" ")
          .toLowerCase();
        return searchable.includes(normalizedSearch);
      });
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [inStockProducts, activeCategoryId, searchTerm, sortBy, categoryNameById, showFavoritesOnly, favoriteProductIds]);

  const recommendedDisplayProducts = useMemo(() => {
    const maxItems = 4;
    const recommendedInStock = recommendedProducts
      .filter((product) => Number(product.inventory || 0) > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0));
    const popularRanked = recommendedInStock.filter((product) =>
      Array.isArray(product.reasons)
        ? product.reasons.some((reason) => String(reason).toLowerCase().includes("popular"))
        : false
    );

    const selected: ShopRecommendationProduct[] = [];
    const usedIds = new Set<string>();
    const pushUnique = (product: ShopRecommendationProduct) => {
      if (!product?.id || usedIds.has(product.id)) return;
      selected.push(product);
      usedIds.add(product.id);
    };

    for (const product of popularRanked) {
      if (selected.length >= maxItems) break;
      pushUnique(product);
    }

    if (selected.length < maxItems) {
      const fallbackPool =
        selected.length > 0
          ? inStockProducts.filter((product) => !usedIds.has(product.id))
          : inStockProducts;
      const daySeed = new Date().toISOString().slice(0, 10);
      const seed = `${shop?.id || slug || "store"}:${daySeed}`;
      const fallback = getDeterministicSubset(
        fallbackPool,
        maxItems - selected.length,
        seed
      ).map((product) => ({
        ...product,
        score: 0,
        reasons: ["fallback"]
      }));
      for (const product of fallback) {
        if (selected.length >= maxItems) break;
        pushUnique(product);
      }
    }

    return selected.slice(0, maxItems);
  }, [recommendedProducts, inStockProducts, shop?.id, slug]);

  const activeCategoryName =
    activeCategoryId === "all"
      ? "All Products"
      : categories.find((category) => category.id === activeCategoryId)?.name || "Category";

  const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

  const getOrderStatusLabel = (status?: string | null) =>
    String(status || "pending")
      .replace(/_/g, " ")
      .trim();

  const getOrderStatusBadgeClass = (status?: string | null) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "delivered") {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    if (normalized === "in_transit") {
      return "bg-sky-100 text-sky-800 border-sky-200";
    }
    if (normalized === "supplier_sent") {
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    }
    if (
      normalized === "return_requested" ||
      normalized === "return_in_progress" ||
      normalized === "requested" ||
      normalized === "approved" ||
      normalized === "received" ||
      normalized === "refunded" ||
      normalized === "exchanged"
    ) {
      return "bg-violet-100 text-violet-800 border-violet-200";
    }
    if (normalized === "paid" || normalized === "completed" || normalized === "verified") {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (normalized === "failed" || normalized === "cancelled" || normalized === "flagged") {
      return "bg-rose-100 text-rose-800 border-rose-200";
    }
    if (normalized === "awaiting_payment" || normalized === "processing" || normalized === "pending") {
      return "bg-amber-100 text-amber-800 border-amber-200";
    }
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  const canRequestReturn = (status?: string | null) => {
    const normalized = String(status || "").toLowerCase();
    return ["paid", "completed", "delivered", "in_transit", "supplier_sent"].includes(normalized);
  };

  const getLatestReturnRequest = (
    returns: Array<{
      id: string;
      status: string;
      updatedAt?: string | null;
      requestedAt?: string | null;
    }> = []
  ) => {
    if (!Array.isArray(returns) || returns.length === 0) return null;
    const sorted = [...returns].sort((a, b) =>
      String(b.updatedAt || b.requestedAt || "").localeCompare(String(a.updatedAt || a.requestedAt || ""))
    );
    return sorted[0] || null;
  };

  const isFavorited = (productId: string) => favoriteProductIds.includes(productId);

  const toggleFavorite = (productId: string) => {
    setFavoriteProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const createCartItemId = (
    productId: string,
    selections: CartItem["selections"],
    purchaseMode: CartItem["purchaseMode"] = "one_time",
    cadence?: string
  ) => {
    const selectionKey = [selections.size || "", selections.color || "", selections.texture || "", selections.length || ""].join("|");
    return `${productId}:${selectionKey}:${purchaseMode || "one_time"}:${String(cadence || "")}`;
  };

  const addToCart = (
    product: ShopProduct,
    selections?: CartItem["selections"],
    quantityToAdd = 1,
    purchase?: {
      mode?: "one_time" | "subscribe";
      cadence?: "weekly" | "monthly" | "quarterly";
      discountPercent?: number;
      prepaidCycles?: number | null;
    }
  ) => {
    if (product.inventory <= 0) {
      setNotice("This product is currently out of stock");
      return;
    }
    const safeQuantity = Math.max(1, Math.min(Math.floor(quantityToAdd || 1), 99));
    const selected = selections || {};
    const productMeta = product.metadata || {};
    const subscribeEnabled = Boolean(productMeta.subscribeEnabled);
    const mode = subscribeEnabled && purchase?.mode === "subscribe" ? "subscribe" : "one_time";
    const cadence = mode === "subscribe"
      ? purchase?.cadence || productMeta.subscribeCadence || "monthly"
      : undefined;
    const discountPercent = mode === "subscribe"
      ? Number(purchase?.discountPercent ?? productMeta.subscribeDiscountPercent ?? 0)
      : 0;
    const prepaidCycles = mode === "subscribe"
      ? Number(purchase?.prepaidCycles ?? productMeta.subscribePrepaidCycles ?? 0) || null
      : null;
    const effectiveUnitPrice =
      mode === "subscribe" && Number.isFinite(discountPercent) && discountPercent > 0
        ? Number(product.price || 0) * (1 - discountPercent / 100)
        : Number(product.price || 0);
    const itemId = createCartItemId(product.id, selected, mode, cadence);
    const image = (product.metadata?.imageUrls || []).find(Boolean) || product.imageUrl || null;
    const categoryName = categoryNameById.get(product.categoryId || "");

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      const nextQuantity = (existing?.quantity || 0) + safeQuantity;
      if (nextQuantity > product.inventory) {
        setNotice(`Only ${product.inventory} unit(s) available for this product option.`);
        return prev;
      }
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: Math.min(item.quantity + safeQuantity, 99) } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          name: product.name,
          price: Number(effectiveUnitPrice.toFixed(2)),
          currency: product.currency,
          quantity: safeQuantity,
          imageUrl: image,
          categoryName: categoryName || undefined,
          selections: selected,
          purchaseMode: mode,
          subscription:
            mode === "subscribe"
              ? {
                  cadence,
                  discountPercent: Number.isFinite(discountPercent) ? discountPercent : 0,
                  prepaidCycles
                }
              : undefined
        }
      ];
    });
    setNotice(`${product.name} added to cart`);
    trackStorefrontEvent("add_to_cart", {
      productId: product.id,
      quantity: safeQuantity,
      value: Number(effectiveUnitPrice || 0) * safeQuantity,
      currency: product.currency,
      metadata: {
        selections: selected,
        purchaseMode: mode,
        subscription: mode === "subscribe" ? { cadence, discountPercent, prepaidCycles } : null
      }
    }).catch(() => undefined);
  };

  const closeProductDetails = () => {
    setShowProductPanel(false);
    if (productPanelAnimationFrameRef.current) {
      window.cancelAnimationFrame(productPanelAnimationFrameRef.current);
      productPanelAnimationFrameRef.current = null;
    }
    if (productPanelCloseTimerRef.current) {
      window.clearTimeout(productPanelCloseTimerRef.current);
    }
    productPanelCloseTimerRef.current = window.setTimeout(() => {
      setSelectedProduct(null);
      productPanelCloseTimerRef.current = null;
    }, 260);
  };

  const openProductDetails = (product: ShopProduct) => {
    if (productPanelCloseTimerRef.current) {
      window.clearTimeout(productPanelCloseTimerRef.current);
      productPanelCloseTimerRef.current = null;
    }
    if (productPanelAnimationFrameRef.current) {
      window.cancelAnimationFrame(productPanelAnimationFrameRef.current);
      productPanelAnimationFrameRef.current = null;
    }
    setShowProductPanel(false);
    setSelectedProduct(product);
    const images = (product.metadata?.imageUrls || []).filter(Boolean);
    setSelectedImage(images[0] || product.imageUrl || null);
    setSelectedSize("");
    setSelectedColor("");
    setSelectedTexture("");
    setSelectedLength("");
    setSelectedQuantity(1);
    setSelectedPurchaseMode("one_time");
    productPanelAnimationFrameRef.current = window.requestAnimationFrame(() => {
      setShowProductPanel(true);
      productPanelAnimationFrameRef.current = null;
    });
    trackStorefrontEvent("view_product", {
      productId: product.id,
      value: Number(product.price || 0),
      currency: product.currency
    }).catch(() => undefined);
  };

  useEffect(() => {
    return () => {
      if (productPanelCloseTimerRef.current) {
        window.clearTimeout(productPanelCloseTimerRef.current);
      }
      if (productPanelAnimationFrameRef.current) {
        window.cancelAnimationFrame(productPanelAnimationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeProductDetails();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedProduct]);

  const updateCartItemQuantity = (itemId: string, nextQuantity: number) => {
    if (nextQuantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.min(Math.max(nextQuantity, 1), 99) } : item
      )
    );
  };

  const removeCartItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => setCartItems([]);

  const openCheckoutModal = () => {
    setCheckoutNotice(null);
    setCheckoutPaymentLink(null);
    if (!customerSession) {
      setCheckoutEntryMode("choose");
      setReturningCheckoutForm({
        email: accessForm.email || checkoutForm.email || "",
        phone: accessForm.phone || checkoutForm.phone || ""
      });
    }
    setShowCheckout(true);
    trackStorefrontEvent("open_cart", {
      value: cartSubtotal,
      currency: cartCurrency,
      quantity: cartCount
    }).catch(() => undefined);
  };

  const closeCheckoutModal = () => {
    setCheckoutNotice(null);
    setCheckoutPaymentLink(null);
    setShowCheckout(false);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCurrency = cartItems[0]?.currency || "USD";
  const favoriteCount = favoriteProductIds.length;

  const getSelectionText = (selections: CartItem["selections"]) => {
    const parts: string[] = [];
    if (selections.size) parts.push(`Size: ${selections.size}`);
    if (selections.color) parts.push(`Color: ${selections.color}`);
    if (selections.texture) parts.push(`Texture: ${selections.texture}`);
    if (selections.length) parts.push(`Length: ${selections.length}`);
    return parts.length > 0 ? ` (${parts.join(", ")})` : "";
  };

  const validateCheckoutForm = () => {
    if (cartItems.length === 0) return "Your cart is empty";
    if (!customerSession && checkoutEntryMode !== "new") {
      return "Tell us if you have placed an order before to continue.";
    }
    if (customerSession) {
      const sessionEmail = String(customerSession.email || "").trim();
      const sessionPhone = String(customerSession.phone || "").trim();
      if (!sessionEmail && !sessionPhone) {
        return "Sign in with your email or phone to continue.";
      }
      if (!checkoutForm.address.trim() && !String(customerSession.address || "").trim()) {
        return "Delivery address is required";
      }
      return null;
    }

    if (!checkoutForm.firstName.trim()) return "First name is required";
    if (!checkoutForm.lastName.trim()) return "Last name is required";
    if (!checkoutForm.phone.trim()) return "Phone number with country code is required";
    if (!/^\+[1-9]\d{7,14}$/.test(checkoutForm.phone.trim())) {
      return "Phone number must include country code, e.g. +2348012345678";
    }
    if (!checkoutForm.email.trim()) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutForm.email.trim())) {
      return "Enter a valid email address";
    }
    if (!checkoutForm.address.trim()) return "Delivery address is required";
    return null;
  };

  const authenticateReturningCustomerFromCheckout = async () => {
    if (!slug) return;
    const email = String(returningCheckoutForm.email || "")
      .trim()
      .toLowerCase();
    const phone = String(returningCheckoutForm.phone || "").trim();

    if (!email || !phone) {
      setCheckoutNotice({
        tone: "error",
        message: "Enter both email and phone number used for your previous order."
      });
      return;
    }
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      setCheckoutNotice({
        tone: "error",
        message: "Phone number must include country code, e.g. +2348012345678"
      });
      return;
    }

    try {
      setAuthenticatingReturning(true);
      setCheckoutNotice(null);
      const data = await apiRequest<ShopCustomerAccessResponse>(`/shops/${slug}/customer/access`, {
        method: "POST",
        body: { email, phone }
      });
      applyCustomerSession(data.customer);
      setCustomerOrders(data.orders || []);
      setAccessForm({ email: data.customer.email || email, phone: data.customer.phone || phone });
      setCheckoutNotice({ tone: "success", message: "Welcome back. Your profile is loaded." });
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Could not verify your previous order details.";
      if (String(message).toLowerCase().includes("no customer profile found")) {
        setCheckoutEntryMode("new");
        setCheckoutForm((prev) => ({
          ...prev,
          email,
          phone
        }));
        setCheckoutNotice({
          tone: "error",
          message:
            "No previous order profile found with these details. Please continue with full checkout details."
        });
        return;
      }
      setCheckoutNotice({ tone: "error", message });
    } finally {
      setAuthenticatingReturning(false);
    }
  };

  const submitCheckout = async (method: "whatsapp" | "card") => {
    if (!shop || !slug) return;
    if (method === "whatsapp" && !canWhatsappCheckout) {
      setCheckoutNotice({
        tone: "error",
        message: "WhatsApp checkout is not available for this shop."
      });
      return;
    }
    if (method === "card" && !canCardCheckout) {
      setCheckoutNotice({
        tone: "error",
        message: "Card checkout is not available for this shop."
      });
      return;
    }
    if (!customerSession && checkoutEntryMode !== "new") {
      setCheckoutNotice({
        tone: "error",
        message: "Choose whether you have placed an order before before continuing checkout."
      });
      return;
    }
    const validationError = validateCheckoutForm();
    if (validationError) {
      setCheckoutNotice({ tone: "error", message: validationError });
      return;
    }

    try {
      setCheckoutNotice(null);
      setSubmittingCheckout(method);
      const sessionEmail = String(customerSession?.email || "").trim();
      const sessionPhone = String(customerSession?.phone || "").trim();
      if (method === "card" && customerSession && !sessionEmail && !checkoutForm.email.trim()) {
        setCheckoutNotice({
          tone: "error",
          message: "Card checkout requires an email on your customer profile."
        });
        return;
      }

      const checkoutPayload: Record<string, any> = {
        note: checkoutForm.note.trim(),
        paymentMethod: method,
        attribution: {
          sessionId: storefrontSessionId || undefined,
          source: storefrontAttribution?.source,
          medium: storefrontAttribution?.medium,
          campaign: storefrontAttribution?.campaign,
          term: storefrontAttribution?.term,
          content: storefrontAttribution?.content,
          gclid: storefrontAttribution?.gclid,
          fbclid: storefrontAttribution?.fbclid
        },
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selections: {
            size: item.selections.size,
            color: item.selections.color,
            texture: item.selections.texture,
            length: item.selections.length
          },
          purchaseMode: item.purchaseMode || "one_time",
          subscription:
            item.purchaseMode === "subscribe"
              ? {
                  cadence: item.subscription?.cadence || "monthly",
                  prepaidCycles:
                    typeof item.subscription?.prepaidCycles === "number"
                      ? item.subscription.prepaidCycles
                      : undefined
                }
              : undefined
        }))
      };

      if (customerSession) {
        checkoutPayload.customerSession = {
          email: sessionEmail || checkoutForm.email.trim(),
          phone: sessionPhone
        };
        if (checkoutForm.address.trim()) {
          checkoutPayload.address = checkoutForm.address.trim();
        }
      } else {
        checkoutPayload.firstName = checkoutForm.firstName.trim();
        checkoutPayload.lastName = checkoutForm.lastName.trim();
        checkoutPayload.phone = checkoutForm.phone.trim();
        checkoutPayload.email = checkoutForm.email.trim();
        checkoutPayload.address = checkoutForm.address.trim();
      }

      const response = await apiRequest<CheckoutOrderResponse>(`/shops/${slug}/orders`, {
        method: "POST",
        body: checkoutPayload
      });

      if (response.customer) {
        applyCustomerSession({
          id: response.customer.id || "",
          firstName: response.customer.firstName || "",
          lastName: response.customer.lastName || "",
          email: response.customer.email || "",
          phone: response.customer.phone || "",
          address: response.customer.address || checkoutForm.address.trim()
        });
      }

      if (method === "whatsapp") {
        if (!response.whatsappUrl) {
          setCheckoutNotice({
            tone: "error",
            message: "Seller WhatsApp is not configured yet for this shop."
          });
          return;
        }
        window.open(response.whatsappUrl, "_blank", "noopener,noreferrer");
        clearCart();
        setCheckoutPaymentLink(null);
        setCheckoutForm((prev) => ({ ...prev, note: "" }));
        if (response.customer?.email || response.customer?.phone) {
          await fetchCustomerAccess(
            {
              email: response.customer?.email || "",
              phone: response.customer?.phone || ""
            },
            { silent: true }
          );
        }
        setCheckoutNotice({
          tone: "success",
          message: `Order ${response.order.orderNumber} sent on WhatsApp.`
        });
        return;
      }

      if (!response.paymentLink) {
        setCheckoutNotice({
          tone: "error",
          message: response.warning || "Checkout link could not be created. Try WhatsApp checkout."
        });
        return;
      }

      window.open(response.paymentLink, "_blank", "noopener,noreferrer");
      clearCart();
      setCheckoutPaymentLink(response.paymentLink);
      setCheckoutForm((prev) => ({ ...prev, note: "" }));
      if (response.customer?.email || response.customer?.phone) {
        await fetchCustomerAccess(
          {
            email: response.customer?.email || "",
            phone: response.customer?.phone || ""
          },
          { silent: true }
        );
      }
      setCheckoutNotice({
        tone: "success",
        message: `Order ${response.order.orderNumber} created. ${response.paymentGateway || "Card"} checkout opened in a new tab.`
      });
    } catch (err: any) {
      setCheckoutNotice({
        tone: "error",
        message: err?.response?.data?.error || err?.message || "Failed to place order"
      });
    } finally {
      setSubmittingCheckout(null);
    }
  };

  const addSelectedProductToCart = () => {
    if (!selectedProduct) return;
    if (selectedQuantity < 1) {
      setNotice("Quantity must be at least 1");
      return;
    }
    if (selectedQuantity > selectedProduct.inventory) {
      setNotice(`Only ${selectedProduct.inventory} unit(s) available`);
      return;
    }

    if ((selectedProduct.metadata?.sizeOptions || []).length > 0 && !selectedSize) {
      setNotice("Please select size");
      return;
    }
    if ((selectedProduct.metadata?.colorOptions || []).length > 0 && !selectedColor) {
      setNotice("Please select color");
      return;
    }
    if ((selectedProduct.metadata?.textureOptions || []).length > 0 && !selectedTexture) {
      setNotice("Please select texture");
      return;
    }
    if ((selectedProduct.metadata?.lengthOptions || []).length > 0 && !selectedLength) {
      setNotice("Please select length");
      return;
    }

    addToCart(selectedProduct, {
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      texture: selectedTexture || undefined,
      length: selectedLength || undefined
    }, selectedQuantity, {
      mode: selectedPurchaseMode,
      cadence:
        selectedPurchaseMode === "subscribe"
          ? selectedProduct.metadata?.subscribeCadence || "monthly"
          : undefined,
      discountPercent:
        selectedPurchaseMode === "subscribe"
          ? Number(selectedProduct.metadata?.subscribeDiscountPercent || 0)
          : undefined,
      prepaidCycles:
        selectedPurchaseMode === "subscribe"
          ? Number(selectedProduct.metadata?.subscribePrepaidCycles || 0) || null
          : undefined
    });
    closeProductDetails();
  };

  if (loading) {
    return <div className="min-h-screen p-8 text-center text-slate-900 font-semibold">Loading shop...</div>;
  }

  if (error || !shop) {
    return <div className="min-h-screen p-8 text-center text-red-600">{error || "Shop not found"}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <style>{`
        @keyframes debbyHeroZoomOut {
          0% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes debbyHeroSingleZoom {
          0% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
      `}</style>
      <div
        className={`fixed left-0 right-0 top-0 z-50 transition-transform duration-200 ${
          isHeroCompact ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div
          className="h-[5.25rem] sm:h-[5.75rem] backdrop-blur border-b border-white/10 px-3 sm:px-4 md:px-6 lg:px-8"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(2,6,23,0.46), rgba(2,6,23,0.72)), linear-gradient(120deg, ${shop.themeColor || "#2563eb"} 0%, rgba(15,23,42,0.94) 100%)`
          }}
        >
          <div className="h-full flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1
                className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight truncate"
                style={{ fontFamily: shop.metadata?.titleFont || '"Playfair Display","Bodoni Moda","Times New Roman",serif' }}
              >
                {shop.name}
              </h1>
              <p className="text-[10px] sm:text-xs text-white/85 mt-0.5 truncate max-w-[14rem] sm:max-w-[24rem]">
                {shop.description || "Discover quality products curated for you."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg border text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur ${
                  showFavoritesOnly
                    ? "border-rose-300 text-rose-700"
                    : "border-slate-200 text-slate-700"
                }`}
                onClick={() => setShowFavoritesOnly((prev) => !prev)}
                aria-label="Favorites"
              >
                <FiHeart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                <span>{favoriteCount}</span>
              </button>
              <button
                className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg border border-slate-200 text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur text-slate-700"
                onClick={openCheckoutModal}
              >
                <FiShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{cartCount}</span>
              </button>
              <button
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-slate-200 text-slate-700 bg-white/95 backdrop-blur flex items-center justify-center"
                onClick={() => {
                  setStoreMenuTab("orders");
                  setShowStoreMenu(true);
                }}
                aria-label="Open menu"
              >
                <FiMenu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-0 pb-6 md:py-8 space-y-5 md:space-y-6">
        <div
          ref={heroSectionRef}
          className="-mx-3 sm:mx-0 rounded-none sm:rounded-3xl overflow-hidden border-0 sm:border bg-white shadow-xl"
        >
          <div
            className="relative h-[20rem] sm:h-72 md:h-80"
            style={{
              backgroundImage: `linear-gradient(120deg, ${shop.themeColor || "#2563eb"} 0%, rgba(15,23,42,0.94) 100%)`
            }}
          >
            {heroVideoUrl ? (
              <>
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  src={heroVideoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-slate-950/40" />
              </>
            ) : hasHeroCarousel ? (
              <>
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className="h-full flex transition-transform duration-700 ease-out"
                    style={{
                      width: `${heroImageUrls.length * 100}%`,
                      transform: `translateX(-${(heroSlideIndex * 100) / heroImageUrls.length}%)`
                    }}
                  >
                    {heroImageUrls.map((imageUrl, index) => (
                      <div
                        key={`hero-image-${index}`}
                        className="h-full flex-shrink-0 overflow-hidden"
                        style={{
                          width: `${100 / heroImageUrls.length}%`
                        }}
                      >
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url("${imageUrl}")`,
                            transformOrigin: "center",
                            animation:
                              index === heroSlideIndex
                                ? "debbyHeroZoomOut 1000ms ease-out both"
                                : "none"
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 bg-slate-950/40" />
              </>
            ) : heroImageUrls.length > 0 ? (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url("${heroImageUrls[0]}")`,
                    transformOrigin: "center",
                    animation: "debbyHeroSingleZoom 3000ms ease-out both"
                  }}
                />
                <div className="absolute inset-0 bg-slate-950/40" />
              </>
            ) : null}
            <div className="absolute inset-0 p-4 sm:p-6 md:p-8 lg:p-10">
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-10 flex items-center gap-2">
                <button
                  className={`h-9 sm:h-10 px-3 sm:px-3.5 rounded-lg border text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur ${
                    showFavoritesOnly
                      ? "border-rose-300 text-rose-700"
                      : "border-slate-200 text-slate-700"
                  }`}
                  onClick={() => setShowFavoritesOnly((prev) => !prev)}
                >
                  <FiHeart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                  <span>Favorites ({favoriteCount})</span>
                </button>
                <button
                  className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-lg border border-slate-200 text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur text-slate-700"
                  onClick={openCheckoutModal}
                >
                  <FiShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Cart ({cartCount})</span>
                </button>
                <button
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg border border-slate-200 text-slate-700 bg-white/95 backdrop-blur flex items-center justify-center"
                  onClick={() => {
                    setStoreMenuTab("orders");
                    setShowStoreMenu(true);
                  }}
                  aria-label="Open menu"
                >
                  <FiMenu className="w-4 h-4" />
                </button>
              </div>

              <div className="h-full flex items-center">
                <div className="flex items-center gap-3 sm:gap-4 max-w-3xl">
                  {shop.logoUrl ? (
                    <img
                      src={shop.logoUrl}
                      alt={shop.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl border-2 border-white/70 object-cover bg-white"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl border-2 border-white/70 bg-white/20 text-white flex items-center justify-center text-xl md:text-2xl font-bold">
                      {shop.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h1
                      className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight"
                      style={{ fontFamily: shop.metadata?.titleFont || '"Playfair Display","Bodoni Moda","Times New Roman",serif' }}
                    >
                      {shop.name}
                    </h1>
                    <p className="text-white/90 text-xs sm:text-sm md:text-base mt-1">
                      {shop.description || "Discover quality products curated for you."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 md:bottom-8 md:right-8 max-w-full overflow-x-auto">
                <div className="flex flex-nowrap items-center justify-end gap-2 pb-1">
                  <div className="rounded-md bg-white/95 backdrop-blur px-2 py-1.5 border border-white/70 min-w-[70px] sm:min-w-[78px]">
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-wide text-slate-500">Products</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{shop.products.length}</p>
                  </div>
                  <div className="rounded-md bg-white/95 backdrop-blur px-2 py-1.5 border border-white/70 min-w-[70px] sm:min-w-[78px]">
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-wide text-slate-500">Categories</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{shop.categories.length}</p>
                  </div>
                  <div className="rounded-md bg-white/95 backdrop-blur px-2 py-1.5 border border-white/70 min-w-[70px] sm:min-w-[78px]">
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-wide text-slate-500">In Stock</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      {shop.products.filter((product) => product.inventory > 0).length}
                    </p>
                  </div>
                  <div className="rounded-md bg-white/95 backdrop-blur px-2 py-1.5 border border-white/70 min-w-[70px] sm:min-w-[78px]">
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-wide text-slate-500">Status</p>
                    <p className="text-xs sm:text-sm font-bold text-emerald-600">Open</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {notice && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-emerald-700">
            {notice}
          </div>
        )}

        <div className="hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Track Your Orders</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Use your email or phone to access your orders without a password.
              </p>
            </div>
            {customerSession && (
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-secondary text-xs sm:text-sm flex items-center gap-2"
                  onClick={() =>
                    fetchCustomerAccess(
                      {
                        email: customerSession.email,
                        phone: customerSession.phone
                      },
                      { silent: false }
                    )
                  }
                  disabled={accessLoading}
                >
                  <FiRefreshCw className="w-4 h-4" />
                  {accessLoading ? "Refreshing..." : "Refresh"}
                </button>
                <button
                  className="btn btn-secondary text-xs sm:text-sm flex items-center gap-2"
                  onClick={() => {
                    setCustomerSession(null);
                    setCustomerOrders([]);
                    setAccessForm({ email: "", phone: "" });
                    setCheckoutEntryMode("choose");
                    setAccessNotice({ tone: "success", message: "Logged out from order access." });
                  }}
                >
                  <FiLogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>

          {accessNotice && (
            <div
              className={`mt-3 rounded-xl border px-3 py-2 text-xs sm:text-sm ${
                accessNotice.tone === "error"
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              {accessNotice.message}
            </div>
          )}

          {customerSession ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Signed In As</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  <FiUser className="inline w-4 h-4 mr-1.5 -mt-0.5" />
                  {customerSession.firstName || customerSession.lastName
                    ? `${customerSession.firstName} ${customerSession.lastName}`.trim()
                    : "Returning customer"}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {customerSession.email || customerSession.phone}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-2">Recent Orders</p>
                {customerOrders.length === 0 ? (
                  <p className="text-sm text-slate-500">No orders found yet for this profile.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {customerOrders.slice(0, 6).map((order) => (
                      <button
                        key={order.id}
                        className="w-full text-left border rounded-xl px-3 py-2 hover:border-slate-400 transition-colors"
                        onClick={async () => {
                          setTrackingOrder({
                            order: {
                              id: order.id,
                              orderNumber: order.orderNumber,
                              status: order.status,
                              subtotal: order.subtotal,
                              totalAmount: order.totalAmount,
                              currency: order.currency,
                              createdAt: order.createdAt,
                              paidAt: order.paidAt,
                              items: order.items,
                              returns: order.returns || []
                            },
                            payment: order.payment
                          });
                          setShowOrderDetailsModal(true);
                          try {
                            setLoadingOrderDetails(true);
                            await fetchOrderPaymentStatus(
                              order.id,
                              order.payment?.gatewayPaymentId || undefined
                            );
                          } catch {
                            // Keep fallback order details in modal.
                          } finally {
                            setLoadingOrderDetails(false);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{order.orderNumber}</p>
                          <span
                            className={`text-xs capitalize font-bold border rounded-full px-2 py-0.5 ${getOrderStatusBadgeClass(
                              order.status
                            )}`}
                          >
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(order.createdAt).toLocaleString()} •{" "}
                          <span className="font-semibold text-slate-700">
                            {formatPrice(order.totalAmount, order.currency)}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Tracking ID: {order.orderNumber}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  className="input text-sm"
                  placeholder="Email address"
                  value={accessForm.email}
                  onChange={(e) => setAccessForm((prev) => ({ ...prev, email: e.target.value }))}
                />
                <input
                  className="input text-sm"
                  placeholder="Phone (+country code)"
                  value={accessForm.phone}
                  onChange={(e) => setAccessForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  className="btn btn-primary text-xs sm:text-sm"
                  onClick={() =>
                    fetchCustomerAccess(
                      { email: accessForm.email, phone: accessForm.phone },
                      { silent: false }
                    )
                  }
                  disabled={accessLoading}
                >
                  {accessLoading ? "Checking..." : "Access My Orders"}
                </button>
                <p className="text-xs text-slate-500">
                  Tip: Enter the same checkout email to auto-fill future orders.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:mx-auto lg:w-full lg:max-w-6xl">
        <div className="bg-white rounded-2xl border shadow-sm p-2 sm:p-4 md:p-5 space-y-2 sm:space-y-3 md:space-y-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_220px] gap-2 sm:gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-slate-400 w-4 h-4" />
              <input
                className="input pl-10 text-[11px] sm:text-sm h-9 sm:h-10 !py-0 leading-none"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className={`sm:hidden h-9 px-2.5 rounded-lg border text-[11px] font-semibold leading-none flex items-center justify-center gap-1.5 ${
                showMobileFilters
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
              onClick={() => setShowMobileFilters((prev) => !prev)}
              aria-label="Toggle filters"
            >
              <FiSliders className="w-3.5 h-3.5" />
              Filters
            </button>
            <select
              className="hidden sm:block input text-[11px] sm:text-sm h-9 sm:h-10 !py-0 leading-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "featured" | "price-asc" | "price-desc" | "name")}
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low-High</option>
              <option value="price-desc">Price: High-Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>

          <div className={`${showMobileFilters ? "grid" : "hidden"} sm:hidden grid-cols-2 gap-2`}>
            <select
              className="input text-[11px] h-9 !py-0 leading-none"
              value={activeCategoryId}
              onChange={(e) => setActiveCategoryId(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All Categories ({inStockProducts.length})</option>
              {shop.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({productsByCategory[category.id] || 0})
                </option>
              ))}
            </select>
            <select
              className="input text-[11px] h-9 !py-0 leading-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "featured" | "price-asc" | "price-desc" | "name")}
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Low-High</option>
              <option value="price-desc">High-Low</option>
              <option value="name">A-Z</option>
            </select>
          </div>

          <div className="hidden sm:block overflow-x-auto pb-1">
            <div className="inline-flex min-w-full gap-2">
              <button
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-[11px] sm:text-xs md:text-sm font-semibold leading-none border transition-all whitespace-nowrap ${
                  activeCategoryId === "all"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                }`}
                onClick={() => setActiveCategoryId("all")}
              >
                All Products
                <span className="ml-1.5 text-[10px] sm:text-[11px] opacity-80">{inStockProducts.length}</span>
              </button>
              {shop.categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-[11px] sm:text-xs md:text-sm font-semibold leading-none border transition-all whitespace-nowrap ${
                    activeCategoryId === category.id
                      ? storefrontThemeColor
                        ? "text-white border-transparent"
                        : "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                  }`}
                  style={
                    activeCategoryId === category.id && storefrontThemeColor
                      ? { backgroundColor: storefrontThemeColor }
                      : undefined
                  }
                  onClick={() => setActiveCategoryId(category.id)}
                >
                  {category.name}
                  <span className="ml-1.5 text-[10px] sm:text-[11px] opacity-80">{productsByCategory[category.id] || 0}</span>
                </button>
              ))}
            </div>
          </div>
        {recommendedDisplayProducts.length > 0 && (
          <div className="pt-3 sm:pt-4 md:pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900">Recommended For You</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                  Top picks based on what shoppers buy most.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-stretch gap-1.5 sm:gap-2.5">
              {recommendedDisplayProducts.map((product) => {
                const coverImage =
                  (product.metadata?.imageUrls || []).find((url) => !!url) || product.imageUrl || null;
                return (
                  <button
                    key={`recommended-${product.id}`}
                    type="button"
                    className="h-full text-left border rounded-lg overflow-hidden hover:border-slate-400 transition-colors bg-white flex flex-col"
                    onClick={() =>
                      openProductDetails({
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        currency: product.currency,
                        imageUrl: product.imageUrl,
                        inventory: product.inventory,
                        averageRating: product.averageRating,
                        ratingCount: product.ratingCount,
                        categoryId: product.categoryId,
                        metadata: product.metadata
                      })
                    }
                  >
                    <div className="p-1.5 pb-0">
                      {coverImage ? (
                        <div className="w-full h-16 sm:h-20 rounded-md overflow-hidden border border-slate-100 bg-slate-50">
                          <img
                            src={coverImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-16 sm:h-20 bg-slate-100 flex items-center justify-center text-[9px] sm:text-[10px] text-slate-500 rounded-md border border-slate-200 overflow-hidden">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="px-1.5 py-1.5 sm:px-2 sm:py-2 flex min-h-[3.2rem] sm:min-h-[3.6rem] flex-col justify-between">
                      <p className="text-[9px] sm:text-xs font-semibold text-slate-900 line-clamp-2 min-h-[1.9rem]">
                        {product.name}
                      </p>
                      <p className="text-[9px] sm:text-xs text-slate-600 mt-0.5">
                        {formatPrice(product.price, product.currency)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">{activeCategoryName}</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} found
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white border rounded-2xl p-10 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">No products available</h3>
            {activeCategoryId !== "all" ? (
              <p className="text-slate-500 mt-2">
                No products available in <span className="font-semibold">{activeCategoryName}</span> right now.
              </p>
            ) : showFavoritesOnly ? (
              <p className="text-slate-500 mt-2">No favorite products match this view yet.</p>
            ) : searchTerm ? (
              <p className="text-slate-500 mt-2">No products match your search. Try a different keyword.</p>
            ) : (
              <p className="text-slate-500 mt-2">This storefront is being stocked. Check back soon.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map((product) => {
              const coverImage =
                (product.metadata?.imageUrls || []).find((url) => !!url) || product.imageUrl || null;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="relative">
                    <div className="px-2 pt-2">
                      {coverImage ? (
                        <div className="w-full h-32 sm:h-36 md:h-40 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                          <img
                            src={coverImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 sm:h-36 md:h-40 bg-slate-100 flex items-center justify-center text-slate-400 text-xs sm:text-sm text-center px-2 rounded-xl border border-slate-200 overflow-hidden">
                          No product image
                        </div>
                      )}
                    </div>
                    {Number(product.ratingCount || 0) > 0 && (
                      <span className="absolute top-2 left-2 text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full shadow-sm bg-amber-100 text-amber-800">
                        {formatRatingValue(Number(product.averageRating || 0))}★
                        <span className="ml-1 opacity-80">({Number(product.ratingCount || 0)})</span>
                      </span>
                    )}
                    <span
                      className={`absolute top-2 right-2 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-sm ${
                        product.inventory > 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {product.inventory > 0 ? `${product.inventory} in stock` : "Out of stock"}
                    </span>
                  </div>
                  <div className="p-2.5 sm:p-3 md:p-4">
                    <h3 className="font-semibold text-slate-900 text-xs sm:text-sm md:text-base line-clamp-2">{product.name}</h3>
                    <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2">
                      <span className="font-bold text-xs sm:text-sm md:text-base text-slate-900">{formatPrice(product.price, product.currency)}</span>
                    </div>
                    <div className="mt-3 sm:mt-4 grid grid-cols-[1fr_auto] gap-2">
                      <button
                        className="btn btn-secondary text-[11px] sm:text-xs md:text-sm px-3 sm:px-4 md:px-6 py-2 md:py-2.5"
                        onClick={() => openProductDetails(product)}
                        disabled={product.inventory <= 0}
                      >
                        {product.inventory > 0 ? "Add to Cart" : "Out of Stock"}
                      </button>
                      <button
                        className={`h-10 w-10 rounded-lg border flex items-center justify-center ${
                          isFavorited(product.id)
                            ? "bg-rose-50 border-rose-300 text-rose-600"
                            : "bg-white border-slate-200 text-slate-600"
                        }`}
                        onClick={() => toggleFavorite(product.id)}
                        aria-label={isFavorited(product.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <FiHeart className={`w-4 h-4 ${isFavorited(product.id) ? "fill-current" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {storefrontThemeColor && (
        <button
          className={`fixed bottom-4 right-3 sm:bottom-6 sm:right-5 z-[120] h-10 w-10 sm:h-11 sm:w-11 rounded-full text-white shadow-lg border border-white/20 flex items-center justify-center transition-all duration-200 ${
            showBackToTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
          style={{ backgroundColor: storefrontThemeColor }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          title="Back to top"
        >
          <FiArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      <div
        className={`fixed inset-0 z-[130] isolate ${
          showStoreMenu ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
          <button
            className={`absolute inset-0 bg-black/55 ${
              showStoreMenu ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setShowStoreMenu(false)}
            aria-label="Close menu overlay"
          />
          <aside
            className={`absolute right-0 top-0 z-10 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col transform transition-transform duration-500 ease-out will-change-transform ${
              showStoreMenu ? "translate-x-0" : "translate-x-full"
            }`}
          >
              <div className="px-4 sm:px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Store Menu</p>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">{shop.name}</h3>
                </div>
                <button
                  className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center"
                  onClick={() => setShowStoreMenu(false)}
                  aria-label="Close menu"
                >
                  <FiX className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {isInstallable && (
                <div className="px-4 sm:px-5 py-3 border-b border-slate-200">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      setShowStoreMenu(false);
                      void promptInstall();
                    }}
                  >
                    <FiDownload className="h-4 w-4" />
                    Install App
                  </button>
                </div>
              )}

              <div className="px-4 sm:px-5 py-3 border-b border-slate-200">
                <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    storeMenuTab === "orders" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                  }`}
                  onClick={() => setStoreMenuTab("orders")}
                >
                  Orders
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    storeMenuTab === "account" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                  }`}
                  onClick={() => setStoreMenuTab("account")}
                >
                  Account
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
              {storeMenuTab === "orders" ? (
                <>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">Track Your Orders</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Use your email or phone to access your orders without a password.
                    </p>
                  </div>

                  {accessNotice && (
                    <div
                      className={`rounded-xl border px-3 py-2 text-xs sm:text-sm ${
                        accessNotice.tone === "error"
                          ? "bg-rose-50 border-rose-200 text-rose-700"
                          : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      }`}
                    >
                      {accessNotice.message}
                    </div>
                  )}

                  {customerSession ? (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Signed In As</p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">
                          <FiUser className="inline w-4 h-4 mr-1.5 -mt-0.5" />
                          {customerSession.firstName || customerSession.lastName
                            ? `${customerSession.firstName} ${customerSession.lastName}`.trim()
                            : "Returning customer"}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {customerSession.email || customerSession.phone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-secondary text-xs sm:text-sm flex items-center gap-2"
                          onClick={() =>
                            fetchCustomerAccess(
                              {
                                email: customerSession.email,
                                phone: customerSession.phone
                              },
                              { silent: false }
                            )
                          }
                          disabled={accessLoading}
                        >
                          <FiRefreshCw className="w-4 h-4" />
                          {accessLoading ? "Refreshing..." : "Refresh"}
                        </button>
                        <button
                          className="btn btn-secondary text-xs sm:text-sm flex items-center gap-2"
                          onClick={handleCustomerOrderLogout}
                        >
                          <FiLogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900 mb-2">Recent Orders</p>
                        {customerOrders.length === 0 ? (
                          <p className="text-sm text-slate-500">No orders found yet for this profile.</p>
                        ) : (
                          <div className="space-y-2">
                            {customerOrders.slice(0, 8).map((order) => (
                              <button
                                key={order.id}
                                className="w-full text-left border rounded-xl px-3 py-2 hover:border-slate-400 transition-colors"
                                onClick={async () => {
                                  setShowStoreMenu(false);
                                  await openOrderDetails(order);
                                }}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-slate-900">{order.orderNumber}</p>
                                  <span
                                    className={`text-xs capitalize font-bold border rounded-full px-2 py-0.5 ${getOrderStatusBadgeClass(
                                      order.status
                                    )}`}
                                  >
                                    {getOrderStatusLabel(order.status)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(order.createdAt).toLocaleString()} •{" "}
                                  <span className="font-semibold text-slate-700">
                                    {formatPrice(order.totalAmount, order.currency)}
                                  </span>
                                </p>
                                <p className="text-xs text-slate-500 mt-1">Tracking ID: {order.orderNumber}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          className="input text-sm"
                          placeholder="Email address"
                          value={accessForm.email}
                          onChange={(e) => setAccessForm((prev) => ({ ...prev, email: e.target.value }))}
                        />
                        <input
                          className="input text-sm"
                          placeholder="Phone (+country code)"
                          value={accessForm.phone}
                          onChange={(e) => setAccessForm((prev) => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <button
                        className="btn btn-primary text-xs sm:text-sm"
                        onClick={() =>
                          fetchCustomerAccess(
                            { email: accessForm.email, phone: accessForm.phone },
                            { silent: false }
                          )
                        }
                        disabled={accessLoading}
                      >
                        {accessLoading ? "Checking..." : "Access My Orders"}
                      </button>
                      <p className="text-xs text-slate-500">
                        Tip: Enter the same checkout email to auto-fill future orders.
                      </p>
                    </div>
                  )}

                  {trackingOrder && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Latest Tracking</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{trackingOrder.order.orderNumber}</p>
                        <button
                          className="btn btn-secondary text-xs px-2 py-1 h-auto"
                          onClick={() => copyTrackingId(trackingOrder.order.orderNumber)}
                        >
                          <FiCopy className="inline w-3.5 h-3.5 mr-1" />
                          Copy ID
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Status:{" "}
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold capitalize ${getOrderStatusBadgeClass(
                            trackingOrder.order.status
                          )}`}
                        >
                          {getOrderStatusLabel(trackingOrder.order.status)}
                        </span>
                      </p>
                      {getLatestReturnRequest(trackingOrder.order.returns || []) && (
                        <p className="text-xs text-slate-600 mt-1">
                          Return:{" "}
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold capitalize ${getOrderStatusBadgeClass(
                              getLatestReturnRequest(trackingOrder.order.returns || [])?.status
                            )}`}
                          >
                            {getOrderStatusLabel(
                              getLatestReturnRequest(trackingOrder.order.returns || [])?.status || "requested"
                            )}
                          </span>
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          className="btn btn-secondary text-xs"
                          onClick={async () => {
                            setShowStoreMenu(false);
                            setShowOrderDetailsModal(true);
                            await fetchOrderPaymentStatus(
                              trackingOrder.order.id,
                              trackingOrder.payment?.gatewayPaymentId || undefined
                            );
                          }}
                        >
                          View Details
                        </button>
                        <button
                          className="btn btn-secondary text-xs"
                          onClick={async () => {
                            try {
                              setLoadingPaymentResult(true);
                              await fetchOrderPaymentStatus(
                                trackingOrder.order.id,
                                trackingOrder.payment?.gatewayPaymentId || undefined
                              );
                            } finally {
                              setLoadingPaymentResult(false);
                            }
                          }}
                          disabled={loadingPaymentResult}
                        >
                          {loadingPaymentResult ? "Refreshing..." : "Refresh"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Profile</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {customerSession
                        ? customerSession.firstName || customerSession.lastName
                          ? `${customerSession.firstName} ${customerSession.lastName}`.trim()
                          : "Returning customer"
                        : "Guest shopper"}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {customerSession
                        ? customerSession.email || customerSession.phone || "Signed in for order tracking"
                        : "Sign in from Orders tab to track history."}
                    </p>
                  </div>

                  <button
                    className="btn btn-primary w-full text-sm flex items-center justify-center gap-2"
                    onClick={() => {
                      setShowStoreMenu(false);
                      openCheckoutModal();
                    }}
                  >
                    <FiShoppingCart className="w-4 h-4" />
                    Open Checkout ({cartCount})
                  </button>

                  <button
                    className={`btn w-full text-sm flex items-center justify-center gap-2 ${
                      showFavoritesOnly ? "btn-primary" : "btn-secondary"
                    }`}
                    onClick={() => setShowFavoritesOnly((prev) => !prev)}
                  >
                    <FiHeart className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                    {showFavoritesOnly ? "Showing Favorites" : "Show Favorites"}
                  </button>

                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Store Stats</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="rounded-lg border border-slate-200 p-2">
                        <p className="text-[10px] uppercase text-slate-500">Products</p>
                        <p className="text-sm font-bold text-slate-900">{shop.products.length}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 p-2">
                        <p className="text-[10px] uppercase text-slate-500">Categories</p>
                        <p className="text-sm font-bold text-slate-900">{shop.categories.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
      </div>

      {showCheckout && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/45" onClick={closeCheckoutModal} />
          <aside
            className="absolute right-0 top-0 h-full w-full sm:w-[36rem] lg:w-[42rem] bg-white border-l border-slate-200 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-5 py-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Cart & Checkout</h2>
              <button className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center" onClick={closeCheckoutModal}>
                <FiX className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
            {checkoutNotice && (
              <div
                className={`mb-4 rounded-xl border px-3 py-2 text-xs sm:text-sm ${
                  checkoutNotice.tone === "error"
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}
              >
                {checkoutNotice.message}
              </div>
            )}

            {cartItems.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                Your cart is empty.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="border rounded-xl p-3 sm:p-4 flex items-start gap-3">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-md object-cover border bg-white" />
                      ) : (
                        <div className="w-14 h-14 rounded-md border bg-slate-100" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-semibold text-slate-900">{item.name}</p>
                        {item.categoryName && <p className="text-xs text-slate-500 mt-0.5">{item.categoryName}</p>}
                        <p className="text-xs text-slate-600 mt-1">{getSelectionText(item.selections).replace(/^\s*\(/, "").replace(/\)\s*$/, "") || "Standard option"}</p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {item.purchaseMode === "subscribe"
                            ? `Subscribe (${String(item.subscription?.cadence || "monthly")}${item.subscription?.discountPercent ? `, ${item.subscription.discountPercent}% off` : ""})`
                            : "One-time purchase"}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">{formatPrice(item.price * item.quantity, item.currency)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="h-8 w-8 rounded border border-slate-200 bg-white text-slate-700 flex items-center justify-center"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        >
                          <FiMinus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm w-8 text-center font-semibold text-slate-800">{item.quantity}</span>
                        <button
                          className="h-8 w-8 rounded border border-slate-200 bg-white text-slate-700 flex items-center justify-center"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        >
                          <FiPlus className="w-3.5 h-3.5" />
                        </button>
                        <button className="h-8 w-8 rounded border border-rose-200 text-rose-600 flex items-center justify-center ml-1" onClick={() => removeCartItem(item.id)}>
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border p-3 sm:p-4 space-y-3">
                  {customerSession ? (
                    <>
                      <p className="text-sm font-semibold text-slate-900">Checkout Profile</p>
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                        <p className="text-xs uppercase tracking-wide text-emerald-700">Logged In</p>
                        <p className="text-sm font-semibold text-emerald-800 mt-1">
                          {customerSession.firstName || customerSession.lastName
                            ? `${customerSession.firstName} ${customerSession.lastName}`.trim()
                            : "Returning customer"}
                        </p>
                        <p className="text-xs text-emerald-700 mt-1">
                          {customerSession.email || customerSession.phone}
                        </p>
                      </div>
                      {!String(checkoutForm.address || customerSession.address || "").trim() && (
                        <input
                          className="input text-sm"
                          placeholder="Delivery address *"
                          value={checkoutForm.address}
                          onChange={(e) => setCheckoutForm((prev) => ({ ...prev, address: e.target.value }))}
                        />
                      )}
                      <textarea
                        className="input text-sm min-h-[84px]"
                        placeholder="Order note"
                        value={checkoutForm.note}
                        onChange={(e) => setCheckoutForm((prev) => ({ ...prev, note: e.target.value }))}
                      />
                    </>
                  ) : checkoutEntryMode === "choose" ? (
                    <>
                      <p className="text-sm font-semibold text-slate-900">
                        Have you placed an order before?
                      </p>
                      <p className="text-xs text-slate-500">
                        If yes, use the same email and phone number to load your saved customer profile.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn btn-secondary text-xs sm:text-sm"
                          onClick={() => {
                            setCheckoutEntryMode("existing");
                            setCheckoutNotice(null);
                          }}
                        >
                          Yes, I have
                        </button>
                        <button
                          className="btn btn-primary text-xs sm:text-sm"
                          onClick={() => {
                            setCheckoutEntryMode("new");
                            setCheckoutNotice(null);
                          }}
                        >
                          No, first time
                        </button>
                      </div>
                    </>
                  ) : checkoutEntryMode === "existing" ? (
                    <>
                      <p className="text-sm font-semibold text-slate-900">Returning Customer Sign In</p>
                      <p className="text-xs text-slate-500">
                        Enter the exact email and phone number from your previous order.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          className="input text-sm"
                          placeholder="Email address"
                          value={returningCheckoutForm.email}
                          onChange={(e) =>
                            setReturningCheckoutForm((prev) => ({ ...prev, email: e.target.value }))
                          }
                        />
                        <input
                          className="input text-sm"
                          placeholder="Phone (+country code)"
                          value={returningCheckoutForm.phone}
                          onChange={(e) =>
                            setReturningCheckoutForm((prev) => ({ ...prev, phone: e.target.value }))
                          }
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn btn-primary text-xs sm:text-sm"
                          onClick={authenticateReturningCustomerFromCheckout}
                          disabled={authenticatingReturning}
                        >
                          {authenticatingReturning ? "Checking..." : "Continue"}
                        </button>
                        <button
                          className="btn btn-secondary text-xs sm:text-sm"
                          onClick={() => setCheckoutEntryMode("new")}
                        >
                          Use full checkout form
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-slate-900">
                        Buyer Details <span className="text-rose-600">*</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          className="input text-sm"
                          placeholder="First name *"
                          value={checkoutForm.firstName}
                          onChange={(e) => setCheckoutForm((prev) => ({ ...prev, firstName: e.target.value }))}
                        />
                        <input
                          className="input text-sm"
                          placeholder="Last name *"
                          value={checkoutForm.lastName}
                          onChange={(e) => setCheckoutForm((prev) => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          className="input text-sm"
                          placeholder="Phone (+country code) *"
                          value={checkoutForm.phone}
                          onChange={(e) => setCheckoutForm((prev) => ({ ...prev, phone: e.target.value }))}
                        />
                        <input
                          className="input text-sm"
                          placeholder="Email address *"
                          value={checkoutForm.email}
                          onChange={(e) => setCheckoutForm((prev) => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <input
                        className="input text-sm"
                        placeholder="Delivery address *"
                        value={checkoutForm.address}
                        onChange={(e) => setCheckoutForm((prev) => ({ ...prev, address: e.target.value }))}
                      />
                      <textarea
                        className="input text-sm min-h-[84px]"
                        placeholder="Order note"
                        value={checkoutForm.note}
                        onChange={(e) => setCheckoutForm((prev) => ({ ...prev, note: e.target.value }))}
                      />
                    </>
                  )}
                </div>

                <div className="rounded-xl bg-slate-50 border p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-slate-600">Subtotal</p>
                  <p className="text-lg font-bold text-slate-900">{formatPrice(cartSubtotal, cartCurrency)}</p>
                </div>

                {checkoutOptions?.methods && checkoutOptions.methods.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Available Checkout Methods</p>
                    <p className="text-sm text-slate-700 mt-1">
                      {checkoutOptions.methods
                        .filter((method) => method.enabled)
                        .map((method) => method.label)
                        .join(", ") || "No card methods currently available"}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button className="btn btn-secondary" onClick={clearCart} disabled={submittingCheckout !== null}>
                    Clear Cart
                  </button>
                  {canWhatsappCheckout && (
                    <button
                      className="btn btn-secondary flex items-center gap-2"
                      onClick={() => submitCheckout("whatsapp")}
                      disabled={
                        cartItems.length === 0 ||
                        submittingCheckout !== null ||
                        (!customerSession && checkoutEntryMode !== "new")
                      }
                    >
                      <FiMessageCircle className="w-4 h-4" />
                      {submittingCheckout === "whatsapp" ? "Submitting..." : "Complete Order on WhatsApp"}
                    </button>
                  )}
                  {canCardCheckout && (
                    <button
                      className="btn btn-primary flex items-center gap-2"
                      onClick={() => submitCheckout("card")}
                      disabled={
                        cartItems.length === 0 ||
                        submittingCheckout !== null ||
                        (!customerSession && checkoutEntryMode !== "new")
                      }
                    >
                      <FiCreditCard className="w-4 h-4" />
                      {submittingCheckout === "card" ? "Creating Payment..." : "Checkout"}
                    </button>
                  )}
                </div>
                {!canWhatsappCheckout && !canCardCheckout && (
                  <p className="text-xs text-rose-700">
                    Checkout is currently unavailable for this shop. Please contact the seller.
                  </p>
                )}
                {checkoutPaymentLink && (
                  <div className="flex justify-end">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => window.open(checkoutPaymentLink, "_blank", "noopener,noreferrer")}
                    >
                      Open Checkout Link Again
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  {customerSession
                    ? "You are using your saved customer profile for this shop."
                    : "Required details are used for order records and customer history for this shop."}
                </p>
              </div>
            )}
            </div>
          </aside>
        </div>
      )}

      {showPaymentResultModal && (
        <div
          className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPaymentResultModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-slate-900">
              {paymentResultTone === "success"
                ? "Payment Successful"
                : paymentResultTone === "error"
                ? "Payment Failed"
                : "Payment Update"}
            </h3>
            <p
              className={`mt-2 text-sm ${
                paymentResultTone === "success"
                  ? "text-emerald-700"
                  : paymentResultTone === "error"
                  ? "text-rose-700"
                  : "text-amber-700"
              }`}
            >
              {paymentResultMessage}
            </p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm text-slate-700">
                Want a storefront like this for your own business?
              </p>
              <a
                href="/signup"
                className="inline-block mt-2 text-sm font-semibold text-blue-700 hover:underline"
              >
                Click here to set up your storefront
              </a>
            </div>
            <div className="mt-5 flex justify-end">
              <button className="btn btn-primary" onClick={() => setShowPaymentResultModal(false)}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showOrderDetailsModal && trackingOrder && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowOrderDetailsModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Order Details</p>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {trackingOrder.order.orderNumber}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${getOrderStatusBadgeClass(
                      trackingOrder.order.status
                    )}`}
                  >
                    {getOrderStatusLabel(trackingOrder.order.status)}
                  </span>
                  {trackingOrder.payment?.status && (
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${getOrderStatusBadgeClass(
                        trackingOrder.payment.status
                      )}`}
                    >
                      Payment: {getOrderStatusLabel(trackingOrder.payment.status)}
                    </span>
                  )}
                  {getLatestReturnRequest(trackingOrder.order.returns || []) && (
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${getOrderStatusBadgeClass(
                        getLatestReturnRequest(trackingOrder.order.returns || [])?.status
                      )}`}
                    >
                      Return:{" "}
                      {getOrderStatusLabel(
                        getLatestReturnRequest(trackingOrder.order.returns || [])?.status || "requested"
                      )}
                    </span>
                  )}
                </div>
              </div>
              <button className="btn btn-secondary" onClick={() => setShowOrderDetailsModal(false)}>
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Created</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {new Date(trackingOrder.order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {formatPrice(trackingOrder.order.totalAmount, trackingOrder.order.currency)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Tracking ID</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {trackingOrder.order.orderNumber}
                    </p>
                  </div>
                  <button
                    className="btn btn-secondary text-xs"
                    onClick={() => copyTrackingId(trackingOrder.order.orderNumber)}
                  >
                    <FiCopy className="w-3.5 h-3.5 mr-1" />
                    Copy Tracking ID
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-bold text-slate-900">Items Ordered</h4>
              {trackingOrder.order.items.length === 0 ? (
                <p className="text-sm text-slate-500">No items found for this order.</p>
              ) : (
                <div className="space-y-2">
                  {trackingOrder.order.items.map((item) => {
                    const selections =
                      (item.metadata && typeof item.metadata === "object" ? (item.metadata as any).selections : null) ||
                      null;
                    const selectionParts = [
                      selections?.size ? `Size: ${selections.size}` : "",
                      selections?.color ? `Color: ${selections.color}` : "",
                      selections?.texture ? `Texture: ${selections.texture}` : "",
                      selections?.length ? `Length: ${selections.length}` : ""
                    ].filter(Boolean);
                    return (
                      <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                            {selectionParts.length > 0 && (
                              <p className="text-xs text-slate-500 mt-1">{selectionParts.join(" • ")}</p>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-700">x{item.quantity}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-slate-600">
                            {formatPrice(item.unitPrice, trackingOrder.order.currency)} each
                          </span>
                          <span className="font-bold text-slate-900">
                            {formatPrice(item.totalPrice, trackingOrder.order.currency)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-bold text-slate-900">Return Requests</h4>
              {!Array.isArray(trackingOrder.order.returns) || trackingOrder.order.returns.length === 0 ? (
                <p className="text-sm text-slate-500">No return request submitted for this order.</p>
              ) : (
                <div className="space-y-2">
                  {trackingOrder.order.returns.map((request) => (
                    <div key={request.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-700">Request ID: {request.id}</p>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${getOrderStatusBadgeClass(
                            request.status
                          )}`}
                        >
                          {getOrderStatusLabel(request.status)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">Reason: {request.reason}</p>
                      {request.resolutionNote && (
                        <p className="text-xs text-slate-600 mt-1">Update: {request.resolutionNote}</p>
                      )}
                      <p className="text-[11px] text-slate-500 mt-1">
                        Updated: {new Date(request.updatedAt || request.requestedAt || "").toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              {canRequestReturn(trackingOrder.order.status) && (
                <button
                  className="btn btn-secondary"
                  onClick={openReturnRequestModal}
                  disabled={submittingReturn}
                >
                  Request Return
                </button>
              )}
              <button
                className="btn btn-secondary flex items-center gap-2"
                onClick={async () => {
                  try {
                    setLoadingOrderDetails(true);
                    await fetchOrderPaymentStatus(
                      trackingOrder.order.id,
                      trackingOrder.payment?.gatewayPaymentId || undefined
                    );
                  } finally {
                    setLoadingOrderDetails(false);
                  }
                }}
                disabled={loadingOrderDetails}
              >
                <FiRefreshCw className="w-4 h-4" />
                {loadingOrderDetails ? "Refreshing..." : "Refresh Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && trackingOrder && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowReturnModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-auto p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Return Request</p>
                <h3 className="text-lg font-bold text-slate-900">{trackingOrder.order.orderNumber}</h3>
              </div>
              <button className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="label">Reason *</label>
                <textarea
                  className="input min-h-[90px] text-sm"
                  placeholder="Why are you returning these items?"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Additional Note (optional)</label>
                <textarea
                  className="input min-h-[76px] text-sm"
                  placeholder="Add any extra details for the seller"
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-2">Select Item Quantities</p>
                <div className="space-y-2">
                  {trackingOrder.order.items.map((item) => (
                    <div key={`return-item-${item.id}`} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            Ordered: {item.quantity} • {formatPrice(item.totalPrice, trackingOrder.order.currency)}
                          </p>
                        </div>
                        <input
                          type="number"
                          min={0}
                          max={Math.max(1, item.quantity)}
                          className="input w-20 text-sm"
                          value={String(returnItemQuantities[item.id] ?? item.quantity)}
                          onChange={(e) => {
                            const nextValue = Number(e.target.value || 0);
                            setReturnItemQuantities((prev) => ({
                              ...prev,
                              [item.id]: Math.min(
                                Math.max(Number.isFinite(nextValue) ? nextValue : 0, 0),
                                Math.max(1, item.quantity)
                              )
                            }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => setShowReturnModal(false)}
                disabled={submittingReturn}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={submitReturnRequest}
                disabled={submittingReturn}
              >
                {submittingReturn ? "Submitting..." : "Submit Return Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div
          className="fixed inset-0 bg-black/55 z-[70] flex items-center justify-center p-4"
          onClick={() => {
            setShowReviewModal(false);
            clearReviewTokenFromUrl();
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Delivered Review</p>
                <h3 className="text-lg font-bold text-slate-900">
                  {reviewInviteDetails?.product?.name || "Rate your product"}
                </h3>
                {reviewInviteDetails?.order?.orderNumber ? (
                  <p className="text-xs text-slate-500 mt-1">Order {reviewInviteDetails.order.orderNumber}</p>
                ) : null}
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowReviewModal(false);
                  clearReviewTokenFromUrl();
                }}
              >
                Close
              </button>
            </div>

            {loadingReviewInvite ? (
              <p className="text-sm text-slate-600 mt-4">Loading review form...</p>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="label">Your rating</label>
                  <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 p-1.5 bg-slate-50">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`review-star-${star}`}
                        type="button"
                        className={`h-8 w-8 rounded-md text-base ${
                          reviewForm.rating >= star
                            ? "bg-amber-100 text-amber-700"
                            : "bg-white text-slate-400 border border-slate-200"
                        }`}
                        onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Review title (optional)</label>
                  <input
                    className="input"
                    placeholder="Short summary"
                    maxLength={120}
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Comments (optional)</label>
                  <textarea
                    className="input min-h-[110px]"
                    placeholder="Share your experience with this product"
                    maxLength={2000}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  />
                </div>
                <div className="pt-1 flex justify-end gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowReviewModal(false);
                      clearReviewTokenFromUrl();
                    }}
                    disabled={submittingReview}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={submitProductReview}
                    disabled={submittingReview}
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className={`fixed inset-0 z-[140] isolate ${showProductPanel ? "pointer-events-auto" : "pointer-events-none"}`}>
          <button
            className={`absolute inset-0 bg-slate-950/55 backdrop-blur-[1px] transition-opacity duration-300 ${
              showProductPanel ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeProductDetails}
            aria-label="Close product details"
          />
          <aside
            className={`absolute right-0 top-0 h-full w-full sm:w-[36rem] lg:w-[42rem] bg-white border-l border-slate-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out will-change-transform ${
              showProductPanel ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-20 bg-white flex items-center justify-between gap-3 border-b border-slate-200 px-4 sm:px-6 py-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Product Details</p>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{selectedProduct.name}</h2>
              </div>
              <button
                className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-600 flex items-center justify-center"
                onClick={closeProductDetails}
                aria-label="Close details"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <div className="bg-slate-50 border-b xl:border-b-0 xl:border-r border-slate-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                  <div className="rounded-2xl border border-slate-200 bg-white p-2.5">
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt={selectedProduct.name}
                        className="w-full h-[40vh] min-h-[18rem] max-h-[32rem] object-contain rounded-xl bg-slate-50"
                      />
                    ) : selectedProduct.metadata?.videoUrl ? (
                      <video
                        src={selectedProduct.metadata.videoUrl}
                        controls
                        className="w-full h-[40vh] min-h-[18rem] max-h-[32rem] object-cover rounded-xl bg-black"
                      />
                    ) : (
                      <div className="w-full h-[40vh] min-h-[18rem] max-h-[32rem] rounded-xl bg-slate-100" />
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {((selectedProduct.metadata?.imageUrls || []).slice(0, 5).length > 0
                      ? (selectedProduct.metadata?.imageUrls || []).slice(0, 5)
                      : ([selectedProduct.imageUrl].filter(Boolean) as string[])
                    ).map((img, idx) => (
                      <button
                        key={`${img}-${idx}`}
                        className={`border rounded-lg overflow-hidden bg-white ${
                          selectedImage === img ? "ring-2 ring-blue-500 border-blue-300" : "border-slate-200"
                        }`}
                        onClick={() => setSelectedImage(img)}
                      >
                        <img
                          src={img}
                          alt={`preview-${idx}`}
                          className="w-full h-14 sm:h-16 object-contain bg-slate-50 p-1 rounded-md"
                        />
                      </button>
                    ))}
                  </div>

                  {selectedProduct.metadata?.videoUrl && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-2">
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">Product Video</p>
                      <video
                        src={selectedProduct.metadata.videoUrl}
                        controls
                        className="w-full max-h-64 rounded-lg border border-slate-200 bg-black"
                      />
                    </div>
                  )}
                </div>

                <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedProductRatingCount > 0 && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        {formatRatingValue(selectedProductAverageRating)}★
                        <span className="ml-1 opacity-80">({selectedProductRatingCount})</span>
                      </span>
                    )}
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        selectedProduct.inventory > 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {selectedProduct.inventory > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                    {categoryNameById.get(selectedProduct.categoryId || "") && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {categoryNameById.get(selectedProduct.categoryId || "")}
                      </span>
                    )}
                    {selectedProduct.metadata?.productType && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                        {selectedProduct.metadata.productType}
                      </span>
                    )}
                  </div>

                  {selectedProduct.description && (
                    <p className="text-sm text-slate-700 leading-relaxed">{selectedProduct.description}</p>
                  )}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <p className="text-sm uppercase tracking-wide text-slate-500">Price</p>
                    <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1">
                      {selectedProduct.currency} {selectedProductDiscountedPrice.toFixed(2)}
                    </p>
                    {selectedPurchaseMode === "subscribe" && selectedProductSubscribeEnabled && selectedProductSubscribeDiscount > 0 && (
                      <p className="text-xs text-emerald-700 mt-1">
                        Includes {selectedProductSubscribeDiscount}% subscribe discount.
                      </p>
                    )}
                    <p className="text-sm text-slate-600 mt-1">Available stock: {selectedProduct.inventory}</p>
                  </div>

                  {selectedProductSubscribeEnabled && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                      <p className="text-sm uppercase tracking-wide text-slate-500">Purchase Mode</p>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPurchaseMode("one_time")}
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            selectedPurchaseMode === "one_time"
                              ? "border-slate-800 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          One-time purchase
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPurchaseMode("subscribe")}
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            selectedPurchaseMode === "subscribe"
                              ? "border-emerald-700 bg-emerald-700 text-white"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          Subscribe & Save
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-slate-600">
                        Cadence: {String(selectedProduct.metadata?.subscribeCadence || "monthly")}
                        {selectedProduct.metadata?.subscribePrepaidCycles
                          ? ` • Prepaid bundle: ${selectedProduct.metadata.subscribePrepaidCycles} cycle(s)`
                          : ""}
                      </p>
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                    <p className="text-sm uppercase tracking-wide text-slate-500">Ratings & Reviews</p>
                    {loadingReviewProductId === selectedProduct.id ? (
                      <p className="text-sm text-slate-600 mt-2">Loading reviews...</p>
                    ) : selectedProductRatingCount > 0 ? (
                      <>
                        <p className="text-base font-semibold text-slate-900 mt-2">
                          {formatRatingValue(selectedProductAverageRating)} out of 5
                        </p>
                        <p className="text-xs text-slate-500">
                          {selectedProductRatingCount} verified rating
                          {selectedProductRatingCount === 1 ? "" : "s"}
                        </p>
                        {selectedProductReviewDetails?.summary?.breakdown && (
                          <div className="mt-3 space-y-1.5">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = Number(selectedProductReviewDetails.summary.breakdown?.[star] || 0);
                              const total = Math.max(1, selectedProductRatingCount);
                              const percent = Math.round((count / total) * 100);
                              return (
                                <div key={`breakdown-${star}`} className="flex items-center gap-2 text-xs">
                                  <span className="w-8 text-slate-600">{star}★</span>
                                  <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-amber-400" style={{ width: `${percent}%` }} />
                                  </div>
                                  <span className="w-8 text-right text-slate-500">{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                          {(selectedProductReviewDetails?.reviews || []).slice(0, 5).map((review) => (
                            <div key={review.id} className="rounded-lg border border-slate-200 p-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-900">
                                  {review.customerName}
                                  {review.verifiedBuyer ? (
                                    <span className="ml-1.5 text-[10px] text-emerald-700">Verified buyer</span>
                                  ) : null}
                                </p>
                                <span className="text-xs font-semibold text-amber-700">{review.rating}★</span>
                              </div>
                              {review.title ? (
                                <p className="text-xs font-semibold text-slate-800 mt-1">{review.title}</p>
                              ) : null}
                              {review.comment ? (
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{review.comment}</p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-slate-600 mt-2">No ratings yet.</p>
                    )}
                  </div>

                  {(selectedProduct.metadata?.colorOptions || []).length > 0 && (
                    <div>
                      <label className="label text-sm">Color</label>
                      <select className="input" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                        <option value="">Select color</option>
                        {(selectedProduct.metadata?.colorOptions || []).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(selectedProduct.metadata?.sizeOptions || []).length > 0 && (
                    <div>
                      <label className="label text-sm">{selectedProduct.metadata?.sizeType || "Size"}</label>
                      <select className="input" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                        <option value="">Select size</option>
                        {(selectedProduct.metadata?.sizeOptions || []).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {selectedProduct.metadata?.sizeGuideHint && (
                        <p className="text-sm text-blue-700 mt-1">{selectedProduct.metadata.sizeGuideHint}</p>
                      )}
                    </div>
                  )}

                  {(selectedProduct.metadata?.textureOptions || []).length > 0 && (
                    <div>
                      <label className="label text-sm">Texture</label>
                      <select className="input" value={selectedTexture} onChange={(e) => setSelectedTexture(e.target.value)}>
                        <option value="">Select texture</option>
                        {(selectedProduct.metadata?.textureOptions || []).map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(selectedProduct.metadata?.lengthOptions || []).length > 0 && (
                    <div>
                      <label className="label text-sm">Length</label>
                      <select className="input" value={selectedLength} onChange={(e) => setSelectedLength(e.target.value)}>
                        <option value="">Select length</option>
                        {(selectedProduct.metadata?.lengthOptions || []).map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="label text-sm">Quantity</label>
                    <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden shadow-sm">
                      <button
                        className="h-10 w-10 text-slate-700 border-r border-slate-300 hover:bg-slate-50 flex items-center justify-center"
                        onClick={() => setSelectedQuantity((prev) => Math.max(1, prev - 1))}
                        aria-label="Decrease quantity"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <div className="h-10 min-w-[3.2rem] px-3 flex items-center justify-center text-sm font-bold text-slate-900">
                        {selectedQuantity}
                      </div>
                      <button
                        className="h-10 w-10 text-slate-700 border-l border-slate-300 hover:bg-slate-50 flex items-center justify-center"
                        onClick={() =>
                          setSelectedQuantity((prev) => Math.min(selectedProduct.inventory || 1, prev + 1))
                        }
                        aria-label="Increase quantity"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 shadow-[0_-6px_16px_rgba(15,23,42,0.08)]">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <button
                  className="btn btn-primary w-full h-11 text-sm"
                  disabled={selectedProduct.inventory <= 0}
                  onClick={addSelectedProductToCart}
                >
                  {selectedProduct.inventory > 0
                    ? selectedPurchaseMode === "subscribe" && selectedProductSubscribeEnabled
                      ? `Subscribe (${selectedQuantity})`
                      : `Add ${selectedQuantity} to Cart`
                    : "Out of Stock"}
                </button>
                <button
                  className={`h-11 w-11 rounded-lg border flex items-center justify-center ${
                    isFavorited(selectedProduct.id)
                      ? "bg-rose-50 border-rose-300 text-rose-600"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                  onClick={() => toggleFavorite(selectedProduct.id)}
                  aria-label={isFavorited(selectedProduct.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  <FiHeart className={`w-4 h-4 ${isFavorited(selectedProduct.id) ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
