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

  const handleVoiceCommand2 = useCallback(async (command) => {
    try {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      const data = await res.json();
      const synth = window.speechSynthesis;

      if (data.intent === "error") {
        synth.speak(new SpeechSynthesisUtterance(data.message || "Error processing command"));
        return;
      }

      if (data.intent === "unknown") {
        synth.speak(new SpeechSynthesisUtterance("Sorry, I did not understand your command."));
        return;
      }

      switch (data.intent) {
        case "add":

          data.products.forEach((p) => {
            const productInfo = products.find((prod) => prod.name.toLowerCase() === p.name.toLowerCase());
            if (!productInfo) {
              synth.speak(new SpeechSynthesisUtterance(`Product ${p.name} not found`));
              return;
            }
            for (let i = 0; i < p.quantity; i++) {
              addToCart({ ...productInfo });
            }
            synth.speak(new SpeechSynthesisUtterance(`${p.quantity} ${p.name}${p.quantity > 1 ? "s" : ""} added to your cart`));
          });
          break;

        case "remove":
          data.products.forEach((p) => {
            const currentQty = cartRef.current.filter(item => item.name.toLowerCase() === p.name.toLowerCase()).length;


            if (currentQty === 0) {
              synth.speak(new SpeechSynthesisUtterance(`Cannot remove ${p.name}, it is not in your cart`));
              return;
            }

            if (currentQty < p.quantity) {
              synth.speak(new SpeechSynthesisUtterance(`Cannot remove ${p.quantity} ${p.name}${p.quantity > 1 ? "s" : ""}, only ${currentQty} in your cart`));
              return;
            }
            const productInfo = cartRef.current.find(
              item => item.name.toLowerCase() === p.name.toLowerCase()
            );

            for (let i = 0; i < p.quantity; i++) {
              removeFromCart(productInfo.id);
            }

            synth.speak(new SpeechSynthesisUtterance(`${p.quantity} ${p.name}${p.quantity > 1 ? "s" : ""} removed from your cart`));
          });
          break;

        case "show_cart":
          if (cartRef.current.length === 0) {
            synth.speak(new SpeechSynthesisUtterance("Your cart is empty"));
          } else {
            const itemNames = cartRef.current.map((i) => i.name).join(", ");
            synth.speak(new SpeechSynthesisUtterance(`Your cart contains: ${itemNames}`));
          }
          break;
        
        case "show_product":
          if (!data.products || data.products.length === 0) {
            synth.speak(new SpeechSynthesisUtterance("No products specified to show."));
          } else {
            data.products.forEach((p) => {
              const found = products.find((prod) => prod.name.toLowerCase() === p.name.toLowerCase());
              if (found) {
                const description = found.description ? `. ${found.description}` : "";
                synth.speak(
                  new SpeechSynthesisUtterance(`${found.name}, price ${found.price} dollars${description}`)
                );
              } else {
                synth.speak(new SpeechSynthesisUtterance(`Product ${p.name} not found`));
              }
            });
          }
          break;


        case "clear_cart":
          clearCart();
          synth.speak(new SpeechSynthesisUtterance("Your cart has been cleared"));
          break;

        case "checkout":
          if (cartRef.current.length === 0) {
            synth.speak(new SpeechSynthesisUtterance("Your cart is empty. Cannot checkout."));
          } else {
            const totalItems = cartRef.current.length;
            synth.speak(new SpeechSynthesisUtterance(`Checking out ${totalItems} items. Thank you for your purchase!`));
            clearCart();
          }
          break;

        default:
          synth.speak(new SpeechSynthesisUtterance("Unknown command"));
      }
    } catch (err) {
      console.error("Voice command error:", err);
      window.speechSynthesis.speak(new SpeechSynthesisUtterance("Error processing voice command"));
    }
  }, [addToCart, removeFromCart, clearCart]);


  
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
  useVoice(handleVoiceCommand2);

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