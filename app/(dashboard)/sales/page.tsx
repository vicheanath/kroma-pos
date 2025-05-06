"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  usePosData,
  type Product,
  type CartItem,
  type Sale,
} from "@/components/pos-data-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  X,
  Tag,
  Percent,
  ArrowRight,
  User,
  FileText,
  BarChart,
} from "lucide-react";
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

export default function SalesPage() {
  const { products, categories, recordSale } = usePosData();
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
  const [quickAddAmount, setQuickAddAmount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState(0);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter products based on search query and category
  useEffect(() => {
    let filtered = products;

    // Apply category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.categoryId === activeCategory
      );
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.barcode && product.barcode.includes(searchQuery)) ||
          (product.sku &&
            product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (product.description &&
            product.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
    }

    setSearchResults(filtered);
  }, [searchQuery, activeCategory, products]);

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

      const sale = await recordSale(saleData);

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

  // Quick add functionality
  const handleQuickAdd = (product: Product) => {
    if (quickAddAmount) {
      addToCart(product, quickAddAmount);
      setQuickAddAmount(null);
    } else {
      setQuickAddAmount(1);
    }
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

  // Focus search input when pressing '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      <div className="flex h-full flex-col md:flex-row gap-4">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar with Search and Categories */}
          <div className="bg-card rounded-lg p-4 shadow-sm mb-4">
            <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search products by name, SKU, barcode... (Press '/' to focus)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex gap-1 items-center">
                  <ShoppingCart className="h-3 w-3" />
                  <span>{cartItemCount} items</span>
                </Badge>
                <Badge variant="outline" className="flex gap-1 items-center">
                  <Tag className="h-3 w-3" />
                  <span>
                    {currencySymbol}
                    {cartTotal.toFixed(2)}
                  </span>
                </Badge>
              </div>
            </div>

            {/* Horizontal Category Navigation */}
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-2 pb-1">
                <Button
                  variant={activeCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory("all")}
                  className="rounded-full"
                >
                  All Products
                </Button>

                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      activeCategory === category.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                    className="rounded-full"
                    style={
                      category.color
                        ? {
                            backgroundColor:
                              activeCategory === category.id
                                ? category.color
                                : "transparent",
                            color:
                              activeCategory === category.id
                                ? "white"
                                : category.color,
                            borderColor: category.color,
                          }
                        : {}
                    }
                  >
                    {category.icon && (
                      <span className="mr-1">{category.icon}</span>
                    )}
                    {category.name}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Products Grid with Tabs */}
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <div className="px-1">
              <TabsList className="grid grid-cols-4 h-10 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="all"
              className="flex-1 overflow-auto mt-0 data-[state=active]:flex-1"
            >
              <div className="h-full overflow-auto p-1">
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {searchResults.map((product) => (
                    <motion.div key={product.id} variants={itemVariants}>
                      <Card
                        className="overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => addToCart(product)}
                      >
                        <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden relative">
                          {product.image ? (
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-12 w-12 text-muted-foreground" />
                          )}

                          {product.stock <= 5 && (
                            <Badge
                              variant={
                                product.stock === 0
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="absolute top-2 right-2"
                            >
                              {product.stock === 0
                                ? "Out of stock"
                                : `${product.stock} left`}
                            </Badge>
                          )}
                        </div>

                        <CardContent className="p-3 flex-1 flex flex-col">
                          <h3 className="font-medium text-sm line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-1">
                            {product.category}
                          </p>
                          {product.sku && (
                            <p className="text-xs text-muted-foreground">
                              SKU: {product.sku}
                            </p>
                          )}
                          <div className="mt-auto">
                            <p className="text-lg font-bold">
                              {currencySymbol}
                              {product.price.toFixed(2)}
                            </p>
                          </div>
                        </CardContent>

                        <CardFooter className="p-3 pt-0 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAdd(product);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            {quickAddAmount
                              ? `Add ${quickAddAmount}`
                              : "Quick Add"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}

                  {searchResults.length === 0 && (
                    <div className="col-span-full flex justify-center items-center h-40">
                      <p className="text-muted-foreground">No products found</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent
              value="popular"
              className="flex-1 overflow-auto mt-0 data-[state=active]:flex-1"
            >
              <div className="h-full overflow-auto p-1">
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {products
                    .slice()
                    .sort((a, b) => b.stock - a.stock)
                    .slice(0, 10)
                    .map((product) => (
                      <motion.div key={product.id} variants={itemVariants}>
                        <Card
                          className="overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => addToCart(product)}
                        >
                          <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden relative">
                            {product.image ? (
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-12 w-12 text-muted-foreground" />
                            )}

                            {product.stock <= 5 && (
                              <Badge
                                variant={
                                  product.stock === 0
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="absolute top-2 right-2"
                              >
                                {product.stock === 0
                                  ? "Out of stock"
                                  : `${product.stock} left`}
                              </Badge>
                            )}
                          </div>

                          <CardContent className="p-3 flex-1 flex flex-col">
                            <h3 className="font-medium text-sm line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-1">
                              {product.category}
                            </p>
                            {product.sku && (
                              <p className="text-xs text-muted-foreground">
                                SKU: {product.sku}
                              </p>
                            )}
                            <div className="mt-auto">
                              <p className="text-lg font-bold">
                                {currencySymbol}
                                {product.price.toFixed(2)}
                              </p>
                            </div>
                          </CardContent>

                          <CardFooter className="p-3 pt-0 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAdd(product);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              {quickAddAmount
                                ? `Add ${quickAddAmount}`
                                : "Quick Add"}
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent
              value="recent"
              className="flex-1 overflow-auto mt-0 data-[state=active]:flex-1"
            >
              <div className="h-full overflow-auto p-1">
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {products
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((product) => (
                      <motion.div key={product.id} variants={itemVariants}>
                        <Card
                          className="overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => addToCart(product)}
                        >
                          <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden relative">
                            {product.image ? (
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-12 w-12 text-muted-foreground" />
                            )}

                            {product.stock <= 5 && (
                              <Badge
                                variant={
                                  product.stock === 0
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="absolute top-2 right-2"
                              >
                                {product.stock === 0
                                  ? "Out of stock"
                                  : `${product.stock} left`}
                              </Badge>
                            )}
                          </div>

                          <CardContent className="p-3 flex-1 flex flex-col">
                            <h3 className="font-medium text-sm line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-1">
                              {product.category}
                            </p>
                            {product.sku && (
                              <p className="text-xs text-muted-foreground">
                                SKU: {product.sku}
                              </p>
                            )}
                            <div className="mt-auto">
                              <p className="text-lg font-bold">
                                {currencySymbol}
                                {product.price.toFixed(2)}
                              </p>
                            </div>
                          </CardContent>

                          <CardFooter className="p-3 pt-0 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAdd(product);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              {quickAddAmount
                                ? `Add ${quickAddAmount}`
                                : "Quick Add"}
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent
              value="favorites"
              className="flex-1 overflow-auto mt-0 data-[state=active]:flex-1"
            >
              <div className="h-full overflow-auto p-1">
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <BarChart className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Favorites feature coming soon
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll be able to mark products as favorites for quick
                    access
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Cart Section */}
        <div className="w-full md:w-96 flex flex-col border rounded-lg bg-card shadow-sm">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Shopping Cart
            </h2>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-destructive hover:text-destructive"
                onClick={clearCart}
              >
                Clear
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            <AnimatePresence>
              {cart.length > 0 ? (
                <motion.div
                  className="divide-y"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {cart.map((item) => (
                    <motion.div
                      key={item.product.id}
                      variants={itemVariants}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center p-4 hover:bg-muted/50"
                    >
                      <div className="w-12 h-12 bg-muted rounded-md mr-3 flex-shrink-0 overflow-hidden">
                        {item.product.image ? (
                          <img
                            src={item.product.image || "/placeholder.svg"}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 m-3 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {currencySymbol}
                          {item.product.price.toFixed(2)} each
                        </p>
                      </div>

                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add products by clicking on them
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 border-t bg-muted/30">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>
                  {currencySymbol}
                  {cartSubtotal.toFixed(2)}
                </span>
              </div>

              {discountValue > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Discount{" "}
                    {discountType === "percentage" ? `(${discountValue}%)` : ""}
                    :
                  </span>
                  <span className="text-red-500">
                    -{currencySymbol}
                    {discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({taxRate}%):</span>
                <span>
                  {currencySymbol}
                  {taxAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span className="text-lg">
                  {currencySymbol}
                  {cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                disabled={cart.length === 0}
                className="flex items-center justify-center"
                onClick={() => setIsDiscountDialogOpen(true)}
              >
                <Percent className="h-4 w-4 mr-1" />
                Discount
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={cart.length === 0}
                className="flex items-center justify-center"
                onClick={() => setIsNotesDialogOpen(true)}
              >
                <FileText className="h-4 w-4 mr-1" />
                Notes
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={cart.length === 0}
                className="flex items-center justify-center"
                onClick={() => setIsCustomerDialogOpen(true)}
              >
                <User className="h-4 w-4 mr-1" />
                Customer
              </Button>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
            >
              Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

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
