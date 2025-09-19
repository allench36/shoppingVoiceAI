// components/Header.js
import { useCart } from "../context/CartContext";

export default function Header() {
  const { cart } = useCart();
  return (
    <header className="p-4 border-b flex justify-between items-center">
      <h1 className="text-xl font-bold">Voice Shop</h1>
      <div>Cart: {cart.length}</div>
    </header>
  );
}