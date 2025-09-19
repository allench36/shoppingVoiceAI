"use client";

// app/page.js
import { useCart } from "../../context/CartContext";
import { products } from "../../data/products";
import ProductCard from "../../components/ProductCard";
import Header from "../../components/Header";
import { useVoice } from "../../hooks/useVoice";
import { useRef, useCallback } from "react";

export default function Home() {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();

  // Ref to always have latest cart
  const cartRef = useRef(cart);
  cartRef.current = cart;

  
  // Stable voice command handler
  const handleVoiceCommand = useCallback(
    (command) => {
      const lower = command.toLowerCase();
      let matched = false;
      
      // dont allow combinations of actions

      // Add product
      if (lower.includes("add")) {
        products.forEach((p) => {
          if (lower.includes(p.name.toLowerCase())) {
            addToCart(p);
            matched = true;
            window.speechSynthesis.speak(
              new SpeechSynthesisUtterance(`${p.name} added to your cart`)
            );
          }
        });
        if (!matched) {
          window.speechSynthesis.speak(
            new SpeechSynthesisUtterance(`This item is not available`)
          );
        }
      } else if (lower.includes("remove")){
        // Remove product
        products.forEach((p) => {
          if (lower.includes(p.name.toLowerCase())) {
            const exists = cartRef.current.find((item) => item.id === p.id);
            if (exists) {
              removeFromCart(p.id);
              matched = true;
              window.speechSynthesis.speak(
                new SpeechSynthesisUtterance(`${p.name} removed from your cart`)
              );
            }
          }
        });
        if (!matched) {
          window.speechSynthesis.speak(
            new SpeechSynthesisUtterance(`This item is not in your cart`)
          );
        }
      } else if (lower.includes("show")) {
        // 🔹 Show individual product
        products.forEach((p) => {
          if (lower.includes(p.name.toLowerCase())) {
            matched = true;
            const details = `${p.name}, price ${p.price} dollars. ${
              p.description || ""
            }`;
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(details));
          }
        });
        if (lower.includes("cart") && !matched) {
          if (cartRef.current.length === 0) {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance("Your cart is empty"));
          } else {
            const itemNames = cartRef.current.map((i) => i.name).join(", ");
            window.speechSynthesis.speak(
              new SpeechSynthesisUtterance(`Your cart contains: ${itemNames}`)
            );
          }
        } else if (!matched) {
          window.speechSynthesis.speak(new SpeechSynthesisUtterance("This item is not available"));
        }
      } else if (lower.includes("clear") && lower.includes("cart")) {
        // clear cart
        clearCart();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Your cart has been cleared"));
      } else if (lower.includes("check") && lower.includes("out")) {
        // checkout
        const synth = window.speechSynthesis;
        if (cartRef.current.length === 0) {
          synth.speak(new SpeechSynthesisUtterance("Your cart is empty. Cannot checkout."));
        } else {
          const totalItems = cartRef.current.length;
          synth.speak(
            new SpeechSynthesisUtterance(
              `Checking out ${totalItems} items. Thank you for your purchase!`
            )
          );
          // Clear cart after checkout
          clearCart();
        }
      }
    },
    [addToCart]
  );

  // Activate voice recognition
  useVoice(handleVoiceCommand);

  return (
    <div>
      <Header />
      <main className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} addToCart={addToCart} />
        ))}
      </main>
    </div>
  );
}