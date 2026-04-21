import { useState } from "react";

export default function AnimBtn({ children, className = "", onClick, disabled, type = "button", style }) {
  const [flipping, setFlipping] = useState(false);

  const handleClick = (e) => {
    if (disabled) return;
    setFlipping(true);
    setTimeout(() => setFlipping(false), 500);
    if (onClick) onClick(e);
  };

  return (
    <button
      type={type}
      className={`btn ${className} ${flipping ? "flipping" : ""}`}
      onClick={handleClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}
