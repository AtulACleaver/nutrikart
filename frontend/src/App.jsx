import { BrowserRouter, Routes, Route } from "react-router-dom"
import { CartProvider } from "./store/cartContext"
import { ProfileProvider } from "./store/ProfileContext"
import { ToastProvider } from "./components/ui/Toast"
import Plan from "./pages/Plan"
import Shop from "./pages/Shop"
import Cart from "./pages/Cart"
import Product from "./pages/Product"
import HowItWorks from "./pages/HowItWorks"

export default function App() {
	return (
		<ProfileProvider>
			<CartProvider>
				<ToastProvider>
					<BrowserRouter>
						<Routes>
							<Route path="/" element={<Plan />} />
							<Route path="/shop" element={<Shop />} />
							<Route path="/cart" element={<Cart />} />
							<Route path="/product/:id" element={<Product />} />
							<Route path="/how-it-works" element={<HowItWorks />} />
						</Routes>
					</BrowserRouter>
				</ToastProvider>
			</CartProvider>
		</ProfileProvider>
	)
}
