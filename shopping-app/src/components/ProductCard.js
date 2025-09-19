// components/ProductCard.js
import React from "react";

export default function ProductCard({ product, addToCart }) {
  return (
    <div className="border p-4 rounded shadow">
      <h3 className="font-bold">{product.name}</h3>
      <p>${product.price.toFixed(2)}</p>
      <button
        className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
        onClick={() => addToCart(product)}
      >
        Add to Cart
      </button>
    </div>
  );
}