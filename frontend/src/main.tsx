import React from "react"

import ReactDOM from "react-dom/client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// === ORIGINAL THEME ===
import App from "./App"
import "./index.css"

// === NEW FIGMA THEME ===
// import App from "./new-theme/App"
// import "./new-theme/index.css"

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
