"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Discount, discountsApi } from "@/lib/db" // Import discounts API



type DiscountContextType = {
  discounts: Discount[]
  addDiscount: (discount: Omit<Discount, "id" | "usageCount">) => void
  updateDiscount: (discount: Discount) => void
  removeDiscount: (discountId: string) => void
  applyDiscountToItem: (
    price: number,
    options: {
      productId?: string
      categoryId?: string
      quantity?: number
    },
  ) => { discountedPrice: number; appliedDiscount: Discount | null }
  applyDiscountToCart: (
    subtotal: number,
    items: Array<{
      productId: string
      categoryId?: string
      price: number
      quantity: number
    }>,
    discountCode?: string,
  ) => { total: number; discount: number; appliedDiscount: Discount | null }
  validateDiscountCode: (code: string, subtotal: number) => Discount | null
}

const DiscountContext = createContext<DiscountContextType>({
  discounts: [],
  addDiscount: () => {},
  updateDiscount: () => {},
  removeDiscount: () => {},
  applyDiscountToItem: () => ({ discountedPrice: 0, appliedDiscount: null }),
  applyDiscountToCart: () => ({ total: 0, discount: 0, appliedDiscount: null }),
  validateDiscountCode: () => null,
})

export function DiscountProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const { toast } = useToast()

  // Load discounts from the database on mount
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const dbDiscounts = await discountsApi.getAll()
        setDiscounts(dbDiscounts)
      } catch (error) {
        console.error("Failed to fetch discounts from database", error)
      }
    }
    fetchDiscounts()
  }, [])

  const addDiscount = async (discount: Omit<Discount, "id" | "usageCount">) => {
    try {
      const newDiscount: Discount = {
        ...discount,
        id: crypto.randomUUID(),
        usageCount: 0,
      }
      await discountsApi.add(newDiscount)
      setDiscounts((prev) => [...prev, newDiscount])
      toast({
        title: "Discount Added",
        description: `${discount.name} has been added.`,
      })
    } catch (error) {
      console.error("Failed to add discount", error)
    }
  }

  const updateDiscount = async (discount: Discount) => {
    try {
      await discountsApi.update(discount)
      setDiscounts((prev) => prev.map((d) => (d.id === discount.id ? discount : d)))
      toast({
        title: "Discount Updated",
        description: `${discount.name} has been updated.`,
      })
    } catch (error) {
      console.error("Failed to update discount", error)
    }
  }

  const removeDiscount = async (discountId: string) => {
    try {
      await discountsApi.delete(discountId)
      setDiscounts((prev) => prev.filter((d) => d.id !== discountId))
      toast({
        title: "Discount Removed",
        description: "The discount has been removed.",
      })
    } catch (error) {
      console.error("Failed to remove discount", error)
    }
  }

  const isDiscountValid = (discount: Discount, subtotal = 0): boolean => {
    const now = new Date()

    // Check if discount is active
    if (!discount.isActive) return false

    // Check date range
    if (discount.startDate && new Date(discount.startDate) > now) return false
    if (discount.endDate && new Date(discount.endDate) < now) return false

    // Check usage limit
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) return false

    // Check minimum order amount
    if (discount.minOrderAmount && subtotal < discount.minOrderAmount) return false

    return true
  }

  const validateDiscountCode = (code: string, subtotal: number): Discount | null => {
    const discount = discounts.find((d) => d.code?.toLowerCase() === code.toLowerCase())
    if (!discount) return null

    if (!isDiscountValid(discount, subtotal)) return null

    return discount
  }

  const applyDiscountToItem = (
    price: number,
    options: {
      productId?: string
      categoryId?: string
      quantity?: number
    },
  ): { discountedPrice: number; appliedDiscount: Discount | null } => {
    // Find applicable product or category discount
    const applicableDiscounts = discounts.filter((discount) => {
      if (!isDiscountValid(discount)) return false

      if (discount.appliesTo === "product" && options.productId) {
        return discount.productIds?.includes(options.productId)
      }

      if (discount.appliesTo === "category" && options.categoryId) {
        return discount.categoryIds?.includes(options.categoryId)
      }

      return discount.appliesTo === "all"
    })

    // If no applicable discounts, return original price
    if (applicableDiscounts.length === 0) {
      return { discountedPrice: price, appliedDiscount: null }
    }

    // Find the best discount (highest value)
    const bestDiscount = applicableDiscounts.reduce((best, current) => {
      const bestValue = best.type === "percentage" ? price * (best.value / 100) : best.value
      const currentValue = current.type === "percentage" ? price * (current.value / 100) : current.value

      return currentValue > bestValue ? current : best
    }, applicableDiscounts[0])

    // Calculate discounted price
    let discountAmount = 0
    if (bestDiscount.type === "percentage") {
      discountAmount = price * (bestDiscount.value / 100)
    } else {
      discountAmount = bestDiscount.value
    }

    // Apply max discount if specified
    if (bestDiscount.maxDiscount && discountAmount > bestDiscount.maxDiscount) {
      discountAmount = bestDiscount.maxDiscount
    }

    // Ensure discount doesn't make price negative
    const discountedPrice = Math.max(0, price - discountAmount)

    return { discountedPrice, appliedDiscount: bestDiscount }
  }

  const applyDiscountToCart = (
    subtotal: number,
    items: Array<{
      productId: string
      categoryId?: string
      price: number
      quantity: number
    }>,
    discountCode?: string,
  ): { total: number; discount: number; appliedDiscount: Discount | null } => {
    // First, check for cart-level discounts
    let cartDiscount: Discount | null = null

    // If discount code provided, validate it
    if (discountCode) {
      cartDiscount = validateDiscountCode(discountCode, subtotal)
    } else {
      // Otherwise, find applicable cart discounts
      const applicableDiscounts = discounts.filter((d) => d.appliesTo === "cart" && isDiscountValid(d, subtotal))

      // Find the best discount (highest value)
      if (applicableDiscounts.length > 0) {
        cartDiscount = applicableDiscounts.reduce((best, current) => {
          const bestValue = best.type === "percentage" ? subtotal * (best.value / 100) : best.value
          const currentValue = current.type === "percentage" ? subtotal * (current.value / 100) : current.value

          return currentValue > bestValue ? current : best
        }, applicableDiscounts[0])
      }
    }

    // Calculate cart discount amount
    let discountAmount = 0
    if (cartDiscount) {
      if (cartDiscount.type === "percentage") {
        discountAmount = subtotal * (cartDiscount.value / 100)
      } else {
        discountAmount = cartDiscount.value
      }

      // Apply max discount if specified
      if (cartDiscount.maxDiscount && discountAmount > cartDiscount.maxDiscount) {
        discountAmount = cartDiscount.maxDiscount
      }

      // Increment usage count
      setDiscounts((prev) => prev.map((d) => (d.id === cartDiscount?.id ? { ...d, usageCount: d.usageCount + 1 } : d)))
    }

    // Ensure discount doesn't make total negative
    const total = Math.max(0, subtotal - discountAmount)

    return { total, discount: discountAmount, appliedDiscount: cartDiscount }
  }

  return (
    <DiscountContext.Provider
      value={{
        discounts,
        addDiscount,
        updateDiscount,
        removeDiscount,
        applyDiscountToItem,
        applyDiscountToCart,
        validateDiscountCode,
      }}
    >
      {children}
    </DiscountContext.Provider>
  )
}

export const useDiscount = () => useContext(DiscountContext)
