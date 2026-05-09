import { BrowserRouter, Routes, Route } from "react-router-dom"
import { CartProvider } from "./store/cartContext"
import { ProfileProvider } from "./store/ProfileContext"
import Plan from "./pages/Plan"
import Shop from "./pages/Shop"
import Cart from "./pages/Cart"
import Product from "./pages/Product"

export default function App() {
	return (
		<ProfileProvider>
			<CartProvider>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<Plan />} />
						<Route path="/shop" element={<Shop />} />
						<Route path="/cart" element={<Cart />} />
						<Route path="/product/:id" element={<Product />} />
					</Routes>
				</BrowserRouter>
			</CartProvider>
		</ProfileProvider>
	)
}
