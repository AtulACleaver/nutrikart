import { BrowserRouter, Routes, Route } from "react-router-dom"
import { CartProvider } from "./store/cartContext"
import Home from "./pages/Home"
import Cart from "./pages/Cart"
import Product from "./pages/Product"

export default function App() {
	return (
		<CartProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/cart" element={<Cart />} />
					<Route path="/product/:id" element={<Product />} />
				</Routes>
			</BrowserRouter>
		</CartProvider>
	)
}
