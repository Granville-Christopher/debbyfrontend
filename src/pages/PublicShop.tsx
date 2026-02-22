import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import {
  FiCreditCard,
  FiHeart,
  FiLogOut,
  FiMenu,
  FiMessageCircle,
  FiMinus,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShoppingCart,
  FiTrash2,
  FiUser,
  FiX
} from "react-icons/fi";

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
    themeColor?: string | null;
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
  }>;
};

type ShopCustomerOrder = ShopCustomerAccessResponse["orders"][number];

export const PublicShop = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shop, setShop] = useState<ShopResponse["shop"] | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedTexture, setSelectedTexture] = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isHeroCompact, setIsHeroCompact] = useState(false);
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
  const heroSectionRef = useRef<HTMLDivElement | null>(null);
  const [heroCollapseOffset, setHeroCollapseOffset] = useState(320);

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
    if (!slug) return;
    try {
      const rawCart = localStorage.getItem(`public-shop-cart:${slug}`);
      const rawFavorites = localStorage.getItem(`public-shop-favorites:${slug}`);
      const rawSession = localStorage.getItem(`public-shop-session:${slug}`);
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
    }
  }, [slug]);

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
  }, [shop?.id, shop?.bannerUrl, shop?.themeColor]);

  useEffect(() => {
    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const threshold = Math.max(0, heroCollapseOffset - 2);
        const shouldCompact = y >= threshold;
        setIsHeroCompact((prev) => (prev === shouldCompact ? prev : shouldCompact));
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
        items: order.items
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

  const categories = shop?.categories || [];
  const products = shop?.products || [];
  const allowedCheckoutMethods =
    shop?.allowedCheckoutMethods && shop.allowedCheckoutMethods.length > 0
      ? shop.allowedCheckoutMethods
      : (["whatsapp", "card"] as Array<"whatsapp" | "card">);
  const canWhatsappCheckout = allowedCheckoutMethods.includes("whatsapp");
  const canCardCheckout = allowedCheckoutMethods.includes("card");

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
    for (const product of products) {
      if (product.categoryId && counts[product.categoryId] !== undefined) {
        counts[product.categoryId] += 1;
      }
    }
    return counts;
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    let result = [...products];

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
  }, [products, activeCategoryId, searchTerm, sortBy, categoryNameById, showFavoritesOnly, favoriteProductIds]);

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

  const isFavorited = (productId: string) => favoriteProductIds.includes(productId);

  const toggleFavorite = (productId: string) => {
    setFavoriteProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const createCartItemId = (productId: string, selections: CartItem["selections"]) => {
    const selectionKey = [selections.size || "", selections.color || "", selections.texture || "", selections.length || ""].join("|");
    return `${productId}:${selectionKey}`;
  };

  const addToCart = (
    product: ShopProduct,
    selections?: CartItem["selections"],
    quantityToAdd = 1
  ) => {
    if (product.inventory <= 0) {
      setNotice("This product is currently out of stock");
      return;
    }
    const safeQuantity = Math.max(1, Math.min(Math.floor(quantityToAdd || 1), 99));
    const selected = selections || {};
    const itemId = createCartItemId(product.id, selected);
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
          price: product.price,
          currency: product.currency,
          quantity: safeQuantity,
          imageUrl: image,
          categoryName: categoryName || undefined,
          selections: selected
        }
      ];
    });
    setNotice(`${product.name} added to cart`);
  };

  const openProductDetails = (product: ShopProduct) => {
    setSelectedProduct(product);
    const images = (product.metadata?.imageUrls || []).filter(Boolean);
    setSelectedImage(images[0] || product.imageUrl || null);
    setSelectedSize("");
    setSelectedColor("");
    setSelectedTexture("");
    setSelectedLength("");
    setSelectedQuantity(1);
  };

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
  };

  const closeCheckoutModal = () => {
    setCheckoutNotice(null);
    setCheckoutPaymentLink(null);
    setShowCheckout(false);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCurrency = cartItems[0]?.currency || "USD";

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
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selections: {
            size: item.selections.size,
            color: item.selections.color,
            texture: item.selections.texture,
            length: item.selections.length
          }
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
    }, selectedQuantity);
    setSelectedProduct(null);
  };

  if (loading) {
    return <div className="min-h-screen p-8 text-center text-slate-900 font-semibold">Loading shop...</div>;
  }

  if (error || !shop) {
    return <div className="min-h-screen p-8 text-center text-red-600">{error || "Shop not found"}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
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
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight truncate">
                {shop.name}
              </h1>
              <p className="text-[10px] sm:text-xs text-white/85 mt-0.5 truncate max-w-[14rem] sm:max-w-[24rem]">
                {shop.description || "Discover quality products curated for you."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg border text-[11px] sm:text-xs font-semibold flex items-center justify-center bg-white/95 backdrop-blur ${
                  showFavoritesOnly
                    ? "border-rose-300 text-rose-700"
                    : "border-slate-200 text-slate-700"
                }`}
                onClick={() => setShowFavoritesOnly((prev) => !prev)}
                aria-label="Favorites"
              >
                <FiHeart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
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
            {shop.bannerUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center lg:hidden"
                style={{
                  backgroundImage: `linear-gradient(120deg, rgba(2,6,23,0.74), rgba(2,6,23,0.52)), url(${shop.bannerUrl})`
                }}
              />
            )}
            {shop.bannerUrl && <div className="absolute inset-0 bg-slate-950/30 lg:hidden" />}
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
                  <span className="hidden sm:inline">{showFavoritesOnly ? "Favorites On" : "Favorites"}</span>
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
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">{shop.name}</h1>
                    <p className="text-white/90 text-xs sm:text-sm md:text-base mt-1">
                      {shop.description || "Discover quality products curated for you."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 max-w-full overflow-x-auto">
                <div className="flex flex-nowrap items-center justify-end gap-2 pb-1">
                  <div className="rounded-lg bg-white/95 backdrop-blur px-2.5 py-2 border border-white/70 min-w-[82px]">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wide text-slate-500">Products</p>
                    <p className="text-sm sm:text-base font-bold text-slate-900">{shop.products.length}</p>
                  </div>
                  <div className="rounded-lg bg-white/95 backdrop-blur px-2.5 py-2 border border-white/70 min-w-[82px]">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wide text-slate-500">Categories</p>
                    <p className="text-sm sm:text-base font-bold text-slate-900">{shop.categories.length}</p>
                  </div>
                  <div className="rounded-lg bg-white/95 backdrop-blur px-2.5 py-2 border border-white/70 min-w-[82px]">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wide text-slate-500">In Stock</p>
                    <p className="text-sm sm:text-base font-bold text-slate-900">
                      {shop.products.filter((product) => product.inventory > 0).length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/95 backdrop-blur px-2.5 py-2 border border-white/70 min-w-[82px]">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wide text-slate-500">Status</p>
                    <p className="text-sm sm:text-base font-bold text-emerald-600">Open</p>
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
                              items: order.items
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

        <div className="bg-white rounded-2xl border shadow-sm p-3 sm:p-4 md:p-5 space-y-3 md:space-y-4">
          <div className="overflow-x-auto">
            <div className="inline-flex min-w-full gap-2">
              <button
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-[11px] sm:text-xs md:text-sm font-semibold border transition-all whitespace-nowrap ${
                  activeCategoryId === "all"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                }`}
                onClick={() => setActiveCategoryId("all")}
              >
                All Products
                <span className="ml-1.5 text-[10px] sm:text-[11px] opacity-80">{shop.products.length}</span>
              </button>
              {shop.categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-[11px] sm:text-xs md:text-sm font-semibold border transition-all whitespace-nowrap ${
                    activeCategoryId === category.id
                      ? "text-white border-transparent"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                  }`}
                  style={
                    activeCategoryId === category.id
                      ? { backgroundColor: shop.themeColor || "#1f2937" }
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

          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-10 text-sm h-10"
                placeholder="Search products, type, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input text-sm h-10"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "featured" | "price-asc" | "price-desc" | "name")}
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

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
              const productCategory = categoryNameById.get(product.categoryId || "");
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all"
                >
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={product.name}
                      className="w-full h-32 sm:h-36 md:h-40 object-contain bg-slate-50 p-1"
                    />
                  ) : (
                    <div className="w-full h-32 sm:h-36 md:h-40 bg-slate-100 flex items-center justify-center text-slate-400 text-xs sm:text-sm text-center px-2">
                      No product image
                    </div>
                  )}
                  <div className="p-2.5 sm:p-3 md:p-4">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                      {productCategory && (
                        <span className="text-[10px] sm:text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                          {productCategory}
                        </span>
                      )}
                      {product.metadata?.productType && (
                        <span className="text-[10px] sm:text-xs px-2 py-1 bg-blue-50 rounded-full text-blue-700">
                          {product.metadata.productType}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-xs sm:text-sm md:text-base line-clamp-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 mt-1 line-clamp-2">{product.description}</p>
                    )}
                    <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="font-bold text-xs sm:text-sm md:text-base text-slate-900">{formatPrice(product.price, product.currency)}</span>
                      <span
                        className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full w-fit ${
                          product.inventory > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {product.inventory > 0 ? `${product.inventory} in stock` : "Out of stock"}
                      </span>
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

      {showStoreMenu && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/45"
            onClick={() => setShowStoreMenu(false)}
            aria-label="Close menu overlay"
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
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
                      <p className="text-sm font-semibold text-slate-900 mt-1">{trackingOrder.order.orderNumber}</p>
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
      )}

      {showCheckout && (
        <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4" onClick={closeCheckoutModal}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Checkout</h2>
              <button className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center" onClick={closeCheckoutModal}>
                <FiX className="w-4 h-4 text-slate-600" />
              </button>
            </div>
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

            <div className="mt-5 flex justify-end">
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

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
              <button className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>Close</button>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt={selectedProduct.name}
                    className="w-full h-80 object-contain rounded-xl border bg-slate-50 p-2"
                  />
                )}
                {!selectedImage && selectedProduct.metadata?.videoUrl && (
                  <video
                    src={selectedProduct.metadata.videoUrl}
                    controls
                    className="w-full h-80 object-cover rounded-xl border bg-black"
                  />
                )}
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {((selectedProduct.metadata?.imageUrls || []).slice(0, 4).length > 0
                    ? (selectedProduct.metadata?.imageUrls || []).slice(0, 4)
                    : [selectedProduct.imageUrl].filter(Boolean) as string[]
                  ).map((img, idx) => (
                    <button key={`${img}-${idx}`} className={`border rounded-lg overflow-hidden ${selectedImage === img ? "ring-2 ring-blue-500" : ""}`} onClick={() => setSelectedImage(img)}>
                      <img src={img} alt={`preview-${idx}`} className="w-full h-16 object-contain bg-slate-50 p-1" />
                    </button>
                  ))}
                </div>
                {selectedProduct.metadata?.videoUrl && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Product Video</p>
                    <video
                      src={selectedProduct.metadata.videoUrl}
                      controls
                      className="w-full max-h-64 rounded-xl border bg-black"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {selectedProduct.description && <p className="text-gray-700">{selectedProduct.description}</p>}
                <p className="text-3xl font-bold text-gray-900">{selectedProduct.currency} {selectedProduct.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Stock: {selectedProduct.inventory}</p>

                {(selectedProduct.metadata?.colorOptions || []).length > 0 && (
                  <div>
                    <label className="label">Color</label>
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
                    <label className="label">{selectedProduct.metadata?.sizeType || "Size"}</label>
                    <select className="input" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                      <option value="">Select size</option>
                      {(selectedProduct.metadata?.sizeOptions || []).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {selectedProduct.metadata?.sizeGuideHint && (
                      <p className="text-xs text-blue-700 mt-1">{selectedProduct.metadata.sizeGuideHint}</p>
                    )}
                  </div>
                )}

                {(selectedProduct.metadata?.textureOptions || []).length > 0 && (
                  <div>
                    <label className="label">Texture</label>
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
                    <label className="label">Length</label>
                    <select className="input" value={selectedLength} onChange={(e) => setSelectedLength(e.target.value)}>
                      <option value="">Select length</option>
                      {(selectedProduct.metadata?.lengthOptions || []).map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="label">Quantity</label>
                  <div className="inline-flex items-center rounded-xl border border-slate-300 bg-slate-50 overflow-hidden">
                    <button
                      className="h-11 w-11 text-slate-700 font-bold text-lg border-r border-slate-300 hover:bg-slate-100"
                      onClick={() => setSelectedQuantity((prev) => Math.max(1, prev - 1))}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <div className="h-11 min-w-[3.5rem] px-4 flex items-center justify-center text-base font-bold text-slate-900 bg-white">
                      {selectedQuantity}
                    </div>
                    <button
                      className="h-11 w-11 text-slate-700 font-bold text-lg border-l border-slate-300 hover:bg-slate-100"
                      onClick={() =>
                        setSelectedQuantity((prev) => Math.min(selectedProduct.inventory || 1, prev + 1))
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Available: {selectedProduct.inventory}</p>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <button
                    className="btn btn-primary w-full"
                    disabled={selectedProduct.inventory <= 0}
                    onClick={addSelectedProductToCart}
                  >
                    {selectedProduct.inventory > 0
                      ? `Add ${selectedQuantity} to Cart`
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
