"use client";

import dynamic from "next/dynamic";

// Lazy-load the widget so the chatbot bundle (and TipTap-free deps) only ship
// when the user actually interacts with storefront pages.
export const ChatBot = dynamic(
  () => import("./chat-widget").then((m) => m.ChatWidget),
  { ssr: false },
);
