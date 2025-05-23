"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useSubscription } from "@/components/subscription-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Store, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function StoresPage() {
  const { stores, activeStore, setActiveStore, addStore, removeStore, updateStore, canUseEnterpriseFeatures } =
    useSubscription()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentStore, setCurrentStore] = useState<{
    id: string
    name: string
    address: string
    isActive: boolean
  } | null>(null)
  const [newStore, setNewStore] = useState({ name: "", address: "" })
  const { toast } = useToast()

  // Handle adding a new store
  const handleAddStore = () => {
    if (!canUseEnterpriseFeatures) {
      toast({
        title: "Enterprise Feature",
        description: "Multiple stores are only available on Enterprise plan.",
        variant: "destructive",
      })
      return
    }

    if (!newStore.name || !newStore.address) {
      toast({
        title: "Missing Information",
        description: "Please provide both store name and address.",
        variant: "destructive",
      })
      return
    }

    addStore({
      name: newStore.name,
      address: newStore.address,
      isActive: true,
    })

    setNewStore({ name: "", address: "" })
    setIsAddDialogOpen(false)
  }

  // Handle editing a store
  const handleEditStore = () => {
    if (!currentStore) return

    updateStore({
      id: currentStore.id,
      name: currentStore.name,
      address: currentStore.address,
      isActive: currentStore.isActive,
    })

    setIsEditDialogOpen(false)
    setCurrentStore(null)
  }

  // Handle deleting a store
  const handleDeleteStore = () => {
    if (!currentStore) return

    removeStore(currentStore.id)
    setIsDeleteDialogOpen(false)
    setCurrentStore(null)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  if (!canUseEnterpriseFeatures) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold tracking-tight">Store Management</h1>
          <p className="text-muted-foreground">Manage your store locations.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Enterprise Feature</h2>
              <p className="text-center text-muted-foreground mb-6 max-w-md">
                Multi-store management is only available on the Enterprise plan. Upgrade your subscription to access
                this feature.
              </p>
              <Button asChild>
                <a href="/settings/subscription">Upgrade to Enterprise</a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Management</h1>
          <p className="text-muted-foreground">Manage your store locations.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Store
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Your Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>{store.address}</TableCell>
                    <TableCell>
                      {store.id === activeStore?.id ? (
                        <Badge>Active</Badge>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setActiveStore(store.id)}>
                          Set Active
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentStore(store)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            setCurrentStore(store)
                            setIsDeleteDialogOpen(true)
                          }}
                          disabled={stores.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Store Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name</Label>
              <Input
                id="store-name"
                placeholder="Enter store name"
                value={newStore.name}
                onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address">Store Address</Label>
              <Input
                id="store-address"
                placeholder="Enter store address"
                value={newStore.address}
                onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStore}>Add Store</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Store Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
          </DialogHeader>
          {currentStore && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-store-name">Store Name</Label>
                <Input
                  id="edit-store-name"
                  placeholder="Enter store name"
                  value={currentStore.name}
                  onChange={(e) => setCurrentStore({ ...currentStore, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-store-address">Store Address</Label>
                <Input
                  id="edit-store-address"
                  placeholder="Enter store address"
                  value={currentStore.address}
                  onChange={(e) => setCurrentStore({ ...currentStore, address: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStore}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Store Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Store</DialogTitle>
          </DialogHeader>
          {currentStore && (
            <div className="py-4">
              <p>
                Are you sure you want to delete <span className="font-semibold">{currentStore.name}</span>?
              </p>
              <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStore}>
              Delete Store
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
