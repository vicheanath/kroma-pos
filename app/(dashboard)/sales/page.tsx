"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  usePosData,
  type Product,
  type CartItem,
  type Sale,
} from "@/components/pos-data-provider";
import { Badge } from "@/components/ui/badge";
import { Tag, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { InvoicePrint } from "@/components/invoice-print";
import {
  ReceiptSettingsProvider,
  useReceiptSettings,
} from "@/components/receipt-settings-provider";
import DiscountDialog from "@/components/DiscountDialog";
import NotesDialog from "@/components/NotesDialog";
import CustomerDialog from "@/components/CustomerDialog";
import CheckoutDialog from "@/components/CheckoutDialog";
import { SearchBar } from "./components/SearchBar";
import { CategoryFilter } from "./components/CategoryFilter";
import { ProductTabs } from "./components/ProductTabs";
import { Cart } from "./components/Cart";
import { MobileCartButton } from "./components/MobileCartButton";
import { useBarcodeScanner } from "./hooks/useBarcodeScanner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SalesPage() {
  const {
    products,
    categories,
    recordSale,
    employees,
    shifts,
    getActiveShiftForEmployee,
  } = usePosData();
  const { settings } = useReceiptSettings();
  const taxRate = settings?.taxRate || 10;
  const currencySymbol = settings?.currencySymbol || "$";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [saleNotes, setSaleNotes] = useState("");
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState(0);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Get active shift for selected employee (or first active shift)
  const activeShift = getActiveShiftForEmployee(
    selectedEmployeeId || undefined
  );

  // Get all active shifts for employee selection
  const activeShifts = shifts.filter((s) => s.status === "active");
  const activeEmployeesWithShifts = activeShifts.map((shift) => {
    const employee = employees.find((e) => e.id === shift.employeeId);
    return { shift, employee: employee || null };
  });

  // Use barcode scanner hook
  useBarcodeScanner({ products, cart, setCart });

  // Filter products based on search query and category
  useEffect(() => {
    // Always update searchResults when products change
    let filtered = [...products];

    // Apply category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.categoryId === activeCategory
      );
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          (product.category?.name &&
            product.category.name.toLowerCase().includes(query)) ||
          (product.barcode && product.barcode.toLowerCase().includes(query)) ||
          (product.sku && product.sku.toLowerCase().includes(query)) ||
          (product.description &&
            product.description.toLowerCase().includes(query))
      );
    }

    // Always set searchResults, even if empty (to show empty state)
    setSearchResults(filtered);
  }, [searchQuery, activeCategory, products]);

  // Debug: Log when products or searchResults change
  useEffect(() => {
    console.log(
      "Products changed:",
      products.length,
      "Search results:",
      searchResults.length
    );
  }, [products, searchResults]);

  // Calculate cart subtotal
  const cartSubtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Calculate discount
  const discountAmount =
    discountType === "percentage"
      ? cartSubtotal * (discountValue / 100)
      : discountValue;

  // Calculate tax
  const taxAmount = (cartSubtotal - discountAmount) * (taxRate / 100);

  // Calculate total
  const cartTotal = cartSubtotal - discountAmount + taxAmount;

  // Calculate cart item count
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Add product to cart
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is out of stock.`,
        variant: "destructive",
      });
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        // Check if we have enough stock
        if (existingItem.quantity + quantity > product.stock) {
          toast({
            title: "Stock Limit Reached",
            description: `Only ${product.stock} units of ${product.name} available.`,
            variant: "destructive",
          });
          return prevCart;
        }

        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity }];
      }
    });

    // Show a toast notification
    toast({
      title: "Added to Cart",
      description: `${quantity}x ${product.name} added to cart.`,
    });

    // Auto-open cart drawer on mobile when item is added
    if (isMobile && cart.length === 0) {
      setIsCartOpen(true);
    }
  };

  // Update cart item quantity
  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find((p) => p.id === productId);

    if (product && newQuantity > product.stock) {
      toast({
        title: "Stock Limit Reached",
        description: `Only ${product.stock} units of ${product.name} available.`,
        variant: "destructive",
      });
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId)
    );
  };

  // Clear the entire cart
  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setSaleNotes("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from the cart.",
    });
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    // Validate active shift exists
    if (!activeShift) {
      toast({
        title: "No Active Shift",
        description:
          "Please ensure an employee is clocked in before making a sale.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare the sale data with the format expected by IndexedDB
      const saleData = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          product: item.product,
        })),
        subtotal: cartSubtotal,
        tax: taxAmount,
        discount: discountAmount,
        discountType: discountType,
        total: cartTotal,
        paymentMethod,
        customerName: customerName.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        notes: saleNotes.trim() || undefined,
      };

      // recordSale will automatically find active shift if not provided
      // It will throw an error if no active shift exists
      const sale = await recordSale(
        saleData,
        selectedEmployeeId || undefined,
        activeShift?.id
      );

      setCompletedSale(sale);
      setIsCheckoutOpen(false);
      setIsInvoiceOpen(true);
      setCart([]);
      setPaymentMethod("credit");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setSaleNotes("");
      setDiscountValue(0);
    } catch (error) {
      console.error("Error recording sale:", error);
      toast({
        title: "Error",
        description: "Failed to complete the sale. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Quick add functionality - directly add 1 quantity
  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  // Apply discount
  const applyDiscount = () => {
    setIsDiscountDialogOpen(false);

    if (discountValue > 0) {
      toast({
        title: "Discount Applied",
        description: `${
          discountType === "percentage"
            ? discountValue + "%"
            : "$" + discountValue.toFixed(2)
        } discount applied to cart.`,
      });
    }
  };

  // Save notes
  const saveNotes = () => {
    setIsNotesDialogOpen(false);

    if (saleNotes.trim()) {
      toast({
        title: "Notes Saved",
        description: "Your notes have been saved to this sale.",
      });
    }
  };

  // Save customer info
  const saveCustomerInfo = () => {
    setIsCustomerDialogOpen(false);

    if (customerName || customerEmail || customerPhone) {
      toast({
        title: "Customer Info Saved",
        description: "Customer information has been saved to this sale.",
      });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <ReceiptSettingsProvider>
      <div
        className={`flex h-full w-full ${isMobile ? "flex-col" : "flex-row"} ${
          isTablet ? "gap-3" : "gap-4"
        } overflow-hidden min-w-0 p-4 md:p-6`}
      >
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Top Bar with Search and Categories */}
          <div className="space-y-3 mb-4">
            {/* Cart Summary Bar with Sidebar Toggle */}
            <div
              className={`bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg ${
                isTablet ? "p-3" : "p-4"
              } border border-primary/20 shadow-sm`}
            >
              <div className="flex items-center justify-between gap-3">
                <SidebarTrigger className="h-9 w-9 shrink-0" />
                {/* Active Shift Indicator / Employee Selector */}
                {activeShifts.length > 0 ? (
                  activeShifts.length === 1 ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">
                        {activeShifts[0].employeeId
                          ? employees.find(
                              (e) => e.id === activeShifts[0].employeeId
                            )?.name || "Shift Active"
                          : "Shift Active"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedEmployeeId}
                        onValueChange={setSelectedEmployeeId}
                      >
                        <SelectTrigger className="h-8 w-[180px] border-2 border-primary/20 bg-background">
                          <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeEmployeesWithShifts.map(
                            ({ shift, employee }) => (
                              <SelectItem
                                key={shift.id}
                                value={shift.employeeId}
                              >
                                {employee?.name || "Unknown"} - Active
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 border border-destructive/20">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="text-xs font-medium text-destructive">
                      No Active Shift
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Cart Items
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Tag className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-lg font-bold text-primary">
                        {currencySymbol}
                        {cartTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div
              className={`bg-card rounded-lg ${
                isTablet ? "p-4" : "p-5"
              } shadow-sm border border-border`}
            >
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isTablet={isTablet}
              />

              {/* Horizontal Category Navigation */}
              <div className="mt-4">
                <CategoryFilter
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  isTablet={isTablet}
                />
              </div>
            </div>
          </div>

          {/* Products Grid with Tabs */}
          <ProductTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchResults={searchResults}
            products={products}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            currencySymbol={currencySymbol}
            onAddToCart={addToCart}
            onQuickAdd={handleQuickAdd}
            containerVariants={containerVariants}
            itemVariants={itemVariants}
            isTablet={isTablet}
          />
        </div>

        {/* Cart Section - Desktop/Tablet: Sidebar, Mobile: Drawer */}
        {!isMobile && (
          <Cart
            cart={cart}
            cartItemCount={cartItemCount}
            cartSubtotal={cartSubtotal}
            discountValue={discountValue}
            discountType={discountType}
            discountAmount={discountAmount}
            taxRate={taxRate}
            taxAmount={taxAmount}
            cartTotal={cartTotal}
            currencySymbol={currencySymbol}
            onClearCart={clearCart}
            onUpdateQuantity={updateQuantity}
            onRemoveFromCart={removeFromCart}
            onDiscountClick={() => setIsDiscountDialogOpen(true)}
            onNotesClick={() => setIsNotesDialogOpen(true)}
            onCustomerClick={() => setIsCustomerDialogOpen(true)}
            onCheckoutClick={() => setIsCheckoutOpen(true)}
            containerVariants={containerVariants}
            itemVariants={itemVariants}
            isMobile={false}
            isTablet={isTablet}
          />
        )}

        {/* Mobile Cart Drawer */}
        {isMobile && (
          <Cart
            cart={cart}
            cartItemCount={cartItemCount}
            cartSubtotal={cartSubtotal}
            discountValue={discountValue}
            discountType={discountType}
            discountAmount={discountAmount}
            taxRate={taxRate}
            taxAmount={taxAmount}
            cartTotal={cartTotal}
            currencySymbol={currencySymbol}
            onClearCart={clearCart}
            onUpdateQuantity={updateQuantity}
            onRemoveFromCart={removeFromCart}
            onDiscountClick={() => setIsDiscountDialogOpen(true)}
            onNotesClick={() => setIsNotesDialogOpen(true)}
            onCustomerClick={() => setIsCustomerDialogOpen(true)}
            onCheckoutClick={() => setIsCheckoutOpen(true)}
            containerVariants={containerVariants}
            itemVariants={itemVariants}
            isMobile={true}
            isOpen={isCartOpen}
            onOpenChange={setIsCartOpen}
          />
        )}

        {/* Mobile Cart Button */}
        {isMobile && (
          <MobileCartButton
            cartItemCount={cartItemCount}
            cartTotal={cartTotal}
            currencySymbol={currencySymbol}
            onClick={() => setIsCartOpen(true)}
          />
        )}

        {/* Discount Dialog */}
        <DiscountDialog
          isOpen={isDiscountDialogOpen}
          onClose={() => setIsDiscountDialogOpen(false)}
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          discountAmount={discountAmount}
          cartTotal={cartTotal}
          currencySymbol={currencySymbol}
          applyDiscount={applyDiscount}
        />

        {/* Notes Dialog */}
        <NotesDialog
          isOpen={isNotesDialogOpen}
          onClose={() => setIsNotesDialogOpen(false)}
          saleNotes={saleNotes}
          setSaleNotes={setSaleNotes}
          saveNotes={saveNotes}
        />

        {/* Customer Dialog */}
        <CustomerDialog
          isOpen={isCustomerDialogOpen}
          onClose={() => setIsCustomerDialogOpen(false)}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerEmail={customerEmail}
          setCustomerEmail={setCustomerEmail}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          saveCustomerInfo={saveCustomerInfo}
        />

        {/* Checkout Dialog */}
        <CheckoutDialog
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          customerName={customerName}
          customerEmail={customerEmail}
          customerPhone={customerPhone}
          setIsCustomerDialogOpen={setIsCustomerDialogOpen}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          cartSubtotal={cartSubtotal}
          discountValue={discountValue}
          discountType={discountType}
          discountAmount={discountAmount}
          taxRate={taxRate}
          taxAmount={taxAmount}
          cartTotal={cartTotal}
          currencySymbol={currencySymbol}
          handleCheckout={handleCheckout}
        />

        {/* Invoice Print Dialog */}
        {completedSale && (
          <InvoicePrint
            sale={completedSale}
            isOpen={isInvoiceOpen}
            onClose={() => setIsInvoiceOpen(false)}
          />
        )}
      </div>
    </ReceiptSettingsProvider>
  );
}
