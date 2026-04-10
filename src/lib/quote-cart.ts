export interface CartItem {
  productId: string;
  itemCode: string;
  itemName: string;
  variant: string | null;
  category: string;
  quantity: number;
}

const CART_KEY = "lm-quote-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addToCart(item: Omit<CartItem, "quantity">, qty: number = 1): CartItem[] {
  const cart = getCart();
  const existing = cart.find((c) => c.productId === item.productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...item, quantity: qty });
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
  return cart;
}

export function updateQuantity(productId: string, quantity: number): CartItem[] {
  const cart = getCart();
  const item = cart.find((c) => c.productId === productId);
  if (item) {
    item.quantity = Math.max(1, quantity);
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
  return cart;
}

export function removeFromCart(productId: string): CartItem[] {
  const cart = getCart().filter((c) => c.productId !== productId);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
  return cart;
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cart-updated"));
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}
