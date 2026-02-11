/**
 * 🍕 Zomato Order Builder
 *
 * Zomato jaisa order summary banana hai! Cart mein items hain (with quantity
 * aur addons), ek optional coupon code hai, aur tujhe final bill banana hai
 * with itemwise breakdown, taxes, delivery fee, aur discount.
 *
 * Rules:
 *   - cart is array of items:
 *     [{ name: "Butter Chicken", price: 350, qty: 2, addons: ["Extra Butter:50", "Naan:40"] }, ...]
 *   - Each addon string format: "AddonName:Price" (split by ":" to get price)
 *   - Per item total = (price + sum of addon prices) * qty
 *   - Calculate:
 *     - items: array of { name, qty, basePrice, addonTotal, itemTotal }
 *     - subtotal: sum of all itemTotals
 *     - deliveryFee: Rs 30 if subtotal < 500, Rs 15 if 500-999, FREE (0) if >= 1000
 *     - gst: 5% of subtotal, rounded to 2 decimal places parseFloat(val.toFixed(2))
 *     - discount: based on coupon (see below)
 *     - grandTotal: subtotal + deliveryFee + gst - discount (minimum 0, use Math.max)
 *     - Round grandTotal to 2 decimal places
 *
 *   Coupon codes (case-insensitive):
 *     - "FIRST50"  => 50% off subtotal, max Rs 150 (use Math.min)
 *     - "FLAT100"  => flat Rs 100 off
 *     - "FREESHIP" => delivery fee becomes 0 (discount = original delivery fee value)
 *     - null/undefined/invalid string => no discount (0)
 *
 *   - Items with qty <= 0 ko skip karo
 *   - Hint: Use map(), reduce(), filter(), split(), parseFloat(),
 *     toFixed(), Math.max(), Math.min(), toLowerCase()
 *
 * Validation:
 *   - Agar cart array nahi hai ya empty hai, return null
 *
 * @param {Array<{ name: string, price: number, qty: number, addons?: string[] }>} cart
 * @param {string} [coupon] - Optional coupon code
 * @returns {{ items: Array<{ name: string, qty: number, basePrice: number, addonTotal: number, itemTotal: number }>, subtotal: number, deliveryFee: number, gst: number, discount: number, grandTotal: number } | null}
 *
 * @example
 *   buildZomatoOrder([{ name: "Biryani", price: 300, qty: 1, addons: ["Raita:30"] }], "FLAT100")
 *   // subtotal: 330, deliveryFee: 30, gst: 16.5, discount: 100
 *   // grandTotal: 330 + 30 + 16.5 - 100 = 276.5
 *
 *   buildZomatoOrder([{ name: "Pizza", price: 500, qty: 2, addons: [] }], "FIRST50")
 *   // subtotal: 1000, deliveryFee: 0, gst: 50, discount: min(500, 150) = 150
 *   // grandTotal: 1000 + 0 + 50 - 150 = 900
 */
export function buildZomatoOrder(cart, coupon) {
  // Your code here
  if (cart === null || !Array.isArray(cart) || cart.length === 0) return null;

  let response = { items: [], subtotal: 0, deliveryFee: 0, gst: 0, discount: 0, grandTotal: 0 };

  const filteredCart = cart.filter(item => {
    if (item.qty > 0) return item
  });

  filteredCart.map((item) => {
    let itemObj = {};
    itemObj.name = item.name;
    itemObj.qty = item.qty;
    itemObj.basePrice = item.price;

    const addonPriceArr = item.addons?.map(item => {
      return Number(item.split(":")[1]);
    });
    const addonTotal = addonPriceArr?.reduce((acc, price) => acc + price, 0);
    itemObj.addonTotal = addonTotal || 0
    itemObj.itemTotal = (item.price + (addonTotal || 0)) * item.qty
    response.items.push(itemObj);
  });


  response.subtotal = response.items.reduce((acc, item) => acc + (item.itemTotal), 0);

  if (response.subtotal < 500) response.deliveryFee = 30
  else if (response.subtotal >= 500 && response.subtotal <= 999) response.deliveryFee = 15
  else response.deliveryFee = 0;

  response.gst = parseFloat((response.subtotal * 5 / 100).toFixed(2));

  if (coupon?.toUpperCase() === "FIRST50") {
    response.discount = Math.min(response.subtotal / 2, 150);
  } else if (coupon?.toUpperCase() === "FLAT100") {
    response.discount = 100
  } else if (coupon?.toUpperCase() === "FREESHIP") {
    response.discount = response.deliveryFee
    response.deliveryFee = 0
  } else response.discount = 0;

  const grandTotal = parseFloat(response.subtotal + response.deliveryFee + response.gst - Math.max(response.discount, 0).toFixed(2));

  response.grandTotal = grandTotal > 0 ? grandTotal : 0;

  return response;
};