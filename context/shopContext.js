import { createContext, useState, useEffect } from 'react'
import { createCheckout, updateCheckout } from "../lib/shopify"

const CartContext = createContext()

export default function ShopProvider({children}) {
    const [cart, setCart] = useState([]) //declare array of products
    const [cartOpen, setCartOpen] = useState(false)
    const [checkoutId, setCheckoutId] = useState('') //initial states
    const [checkoutUrl, setCheckoutUrl] = useState('') //initial states

    useEffect(()=>{
      if(localStorage.checkout_id){
        const cartObject = JSON.parse(localStorage.checkout_id)
        console.log(cartObject)
        if (cartObject[0].id){
          setCart([cartObject[0]])
        }
        else if (cartObject[0].length > 0){
          setCart(...[cartObject[0]])
        }
        setCheckoutId(cartObject[1].id)
        setCheckoutUrl(cartObject[1].webUrl)
      }
    },[])

    async function addToCart(newItem) {
      setCartOpen(true)
      if(cart.length === 0) {
        setCart([newItem])
        console.log(newItem)
  
        const checkout = await createCheckout(newItem.id, newItem.variantQuantity)
  
        setCheckoutId(checkout.id)
        setCheckoutUrl(checkout.webUrl)
  
        localStorage.setItem("checkout_id", JSON.stringify([newItem, checkout]))
      } else {
        let newCart = [...cart]
        let added = false
        
        cart.map(item => {
          if (item.id === newItem.id) {
            if (newItem.setVariantQuantity != null){
              item.variantQuantity = newItem.setVariantQuantity*1
            }
            else{item.variantQuantity++}
            newCart = [...cart]
            added = true
          }
        })
        if(!added) {
          newCart = [...cart, newItem]
        }
  
        setCart(newCart)
        const newCheckout = await updateCheckout(checkoutId, newCart)
        localStorage.setItem("checkout_id", JSON.stringify([newCart, newCheckout]))
      }
    }
    async function removeCartItem(itemToRemove){
      const updateCart = cart.filter(item => item.id !== itemToRemove)
      setCart(updateCart)
      const newCheckout = await updateCheckout(checkoutId, updateCart)
      localStorage.setItem("checkout_id", JSON.stringify([updateCart, newCheckout]))

      if (cart.length === 1){
        setCartOpen(false)
      }
    }
    return (
      <CartContext.Provider value={{ 
        cart,
        cartOpen,
        setCartOpen,
        addToCart,
        checkoutUrl,
        removeCartItem
      }}>
        {children}
      </CartContext.Provider>
    )
}
const ShopConsumer = CartContext.Consumer
export {ShopConsumer,CartContext}