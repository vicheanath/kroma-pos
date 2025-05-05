"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export type TaxRule = {
  id: string
  name: string
  rate: number // Percentage (e.g., 8.5 for 8.5%)
  isDefault: boolean
  appliesTo: "all" | "category" | "product"
  categoryIds?: string[]
  productIds?: string[]
  isExempt: boolean
}

export type TaxJurisdiction = {
  id: string
  name: string
  code: string
  rules: TaxRule[]
}

type TaxConfigContextType = {
  taxJurisdictions: TaxJurisdiction[]
  currentJurisdiction: TaxJurisdiction | null
  setCurrentJurisdiction: (jurisdictionId: string) => void
  addJurisdiction: (jurisdiction: Omit<TaxJurisdiction, "id">) => void
  updateJurisdiction: (jurisdiction: TaxJurisdiction) => void
  removeJurisdiction: (jurisdictionId: string) => void
  addTaxRule: (jurisdictionId: string, rule: Omit<TaxRule, "id">) => void
  updateTaxRule: (jurisdictionId: string, rule: TaxRule) => void
  removeTaxRule: (jurisdictionId: string, ruleId: string) => void
  calculateTax: (
    amount: number,
    options?: {
      productId?: string
      categoryId?: string
      isShipping?: boolean
    },
  ) => number
}

const TaxConfigContext = createContext<TaxConfigContextType>({
  taxJurisdictions: [],
  currentJurisdiction: null,
  setCurrentJurisdiction: () => {},
  addJurisdiction: () => {},
  updateJurisdiction: () => {},
  removeJurisdiction: () => {},
  addTaxRule: () => {},
  updateTaxRule: () => {},
  removeTaxRule: () => {},
  calculateTax: () => 0,
})

// Default tax jurisdictions
const DEFAULT_TAX_JURISDICTIONS: TaxJurisdiction[] = [
  {
    id: "default",
    name: "Default",
    code: "DEFAULT",
    rules: [
      {
        id: "standard",
        name: "Standard Rate",
        rate: 8.5,
        isDefault: true,
        appliesTo: "all",
        isExempt: false,
      },
      {
        id: "food",
        name: "Food Items",
        rate: 0,
        isDefault: false,
        appliesTo: "category",
        categoryIds: ["food"],
        isExempt: true,
      },
    ],
  },
  {
    id: "tax-free",
    name: "Tax Free",
    code: "TAXFREE",
    rules: [
      {
        id: "zero",
        name: "No Tax",
        rate: 0,
        isDefault: true,
        appliesTo: "all",
        isExempt: true,
      },
    ],
  },
]

export function TaxConfigProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [taxJurisdictions, setTaxJurisdictions] = useState<TaxJurisdiction[]>(DEFAULT_TAX_JURISDICTIONS)
  const [currentJurisdictionId, setCurrentJurisdictionId] = useState<string>("default")
  const { toast } = useToast()

  // Load tax jurisdictions from localStorage on mount
  useEffect(() => {
    const savedJurisdictions = localStorage.getItem("taxJurisdictions")
    const savedCurrentJurisdictionId = localStorage.getItem("currentTaxJurisdictionId")

    if (savedJurisdictions) {
      try {
        setTaxJurisdictions(JSON.parse(savedJurisdictions))
      } catch (e) {
        console.error("Failed to parse saved tax jurisdictions", e)
      }
    }

    if (savedCurrentJurisdictionId) {
      setCurrentJurisdictionId(savedCurrentJurisdictionId)
    }
  }, [])

  // Save tax jurisdictions to localStorage when they change
  useEffect(() => {
    localStorage.setItem("taxJurisdictions", JSON.stringify(taxJurisdictions))
  }, [taxJurisdictions])

  // Save current jurisdiction ID to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("currentTaxJurisdictionId", currentJurisdictionId)
  }, [currentJurisdictionId])

  const currentJurisdiction = taxJurisdictions.find((j) => j.id === currentJurisdictionId) || null

  const setCurrentJurisdiction = (jurisdictionId: string) => {
    const jurisdiction = taxJurisdictions.find((j) => j.id === jurisdictionId)
    if (jurisdiction) {
      setCurrentJurisdictionId(jurisdictionId)
      toast({
        title: "Tax Jurisdiction Changed",
        description: `Now using ${jurisdiction.name} tax rules.`,
      })
    }
  }

  const addJurisdiction = (jurisdiction: Omit<TaxJurisdiction, "id">) => {
    const newJurisdiction: TaxJurisdiction = {
      ...jurisdiction,
      id: crypto.randomUUID(),
    }
    setTaxJurisdictions((prev) => [...prev, newJurisdiction])
    toast({
      title: "Tax Jurisdiction Added",
      description: `${jurisdiction.name} has been added.`,
    })
  }

  const updateJurisdiction = (jurisdiction: TaxJurisdiction) => {
    setTaxJurisdictions((prev) => prev.map((j) => (j.id === jurisdiction.id ? jurisdiction : j)))
    toast({
      title: "Tax Jurisdiction Updated",
      description: `${jurisdiction.name} has been updated.`,
    })
  }

  const removeJurisdiction = (jurisdictionId: string) => {
    // Don't allow removing the current jurisdiction
    if (jurisdictionId === currentJurisdictionId) {
      toast({
        title: "Cannot Remove Jurisdiction",
        description: "Cannot remove the currently active tax jurisdiction.",
        variant: "destructive",
      })
      return
    }

    setTaxJurisdictions((prev) => prev.filter((j) => j.id !== jurisdictionId))
    toast({
      title: "Tax Jurisdiction Removed",
      description: "The tax jurisdiction has been removed.",
    })
  }

  const addTaxRule = (jurisdictionId: string, rule: Omit<TaxRule, "id">) => {
    const newRule: TaxRule = {
      ...rule,
      id: crypto.randomUUID(),
    }

    setTaxJurisdictions((prev) =>
      prev.map((j) => {
        if (j.id === jurisdictionId) {
          return {
            ...j,
            rules: [...j.rules, newRule],
          }
        }
        return j
      }),
    )

    toast({
      title: "Tax Rule Added",
      description: `${rule.name} has been added.`,
    })
  }

  const updateTaxRule = (jurisdictionId: string, rule: TaxRule) => {
    setTaxJurisdictions((prev) =>
      prev.map((j) => {
        if (j.id === jurisdictionId) {
          return {
            ...j,
            rules: j.rules.map((r) => (r.id === rule.id ? rule : r)),
          }
        }
        return j
      }),
    )

    toast({
      title: "Tax Rule Updated",
      description: `${rule.name} has been updated.`,
    })
  }

  const removeTaxRule = (jurisdictionId: string, ruleId: string) => {
    setTaxJurisdictions((prev) =>
      prev.map((j) => {
        if (j.id === jurisdictionId) {
          // Check if this is the only rule or if it's the default rule
          const isOnlyRule = j.rules.length === 1
          const isDefaultRule = j.rules.find((r) => r.id === ruleId)?.isDefault

          if (isOnlyRule) {
            toast({
              title: "Cannot Remove Rule",
              description: "A jurisdiction must have at least one tax rule.",
              variant: "destructive",
            })
            return j
          }

          if (isDefaultRule) {
            toast({
              title: "Cannot Remove Default Rule",
              description: "Cannot remove the default tax rule. Set another rule as default first.",
              variant: "destructive",
            })
            return j
          }

          return {
            ...j,
            rules: j.rules.filter((r) => r.id !== ruleId),
          }
        }
        return j
      }),
    )

    toast({
      title: "Tax Rule Removed",
      description: "The tax rule has been removed.",
    })
  }

  const calculateTax = (
    amount: number,
    options?: {
      productId?: string
      categoryId?: string
      isShipping?: boolean
    },
  ): number => {
    if (!currentJurisdiction) return 0

    // Find applicable tax rule
    let applicableRule: TaxRule | undefined

    // First check for product-specific rules
    if (options?.productId) {
      applicableRule = currentJurisdiction.rules.find(
        (rule) => rule.appliesTo === "product" && rule.productIds?.includes(options.productId),
      )
    }

    // Then check for category-specific rules
    if (!applicableRule && options?.categoryId) {
      applicableRule = currentJurisdiction.rules.find(
        (rule) => rule.appliesTo === "category" && rule.categoryIds?.includes(options.categoryId),
      )
    }

    // Finally, use the default rule
    if (!applicableRule) {
      applicableRule = currentJurisdiction.rules.find((rule) => rule.isDefault)
    }

    // If no rule found or rule is exempt, return 0
    if (!applicableRule || applicableRule.isExempt) return 0

    // Calculate tax amount
    return (amount * applicableRule.rate) / 100
  }

  return (
    <TaxConfigContext.Provider
      value={{
        taxJurisdictions,
        currentJurisdiction,
        setCurrentJurisdiction,
        addJurisdiction,
        updateJurisdiction,
        removeJurisdiction,
        addTaxRule,
        updateTaxRule,
        removeTaxRule,
        calculateTax,
      }}
    >
      {children}
    </TaxConfigContext.Provider>
  )
}

export const useTaxConfig = () => useContext(TaxConfigContext)
