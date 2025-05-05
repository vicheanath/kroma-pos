"use client"

import { useState } from "react"
import { useTaxConfig, type TaxJurisdiction, type TaxRule } from "@/components/tax-config-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Check, Calculator } from "lucide-react"

export default function TaxSettingsPage() {
  const {
    taxJurisdictions,
    currentJurisdiction,
    setCurrentJurisdiction,
    addJurisdiction,
    updateJurisdiction,
    removeJurisdiction,
    addTaxRule,
    updateTaxRule,
    removeTaxRule,
  } = useTaxConfig()

  const [isAddJurisdictionOpen, setIsAddJurisdictionOpen] = useState(false)
  const [isEditJurisdictionOpen, setIsEditJurisdictionOpen] = useState(false)
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false)
  const [isEditRuleOpen, setIsEditRuleOpen] = useState(false)

  const [currentJurisdictionEdit, setCurrentJurisdictionEdit] = useState<TaxJurisdiction | null>(null)
  const [currentRuleEdit, setCurrentRuleEdit] = useState<TaxRule | null>(null)

  const [newJurisdiction, setNewJurisdiction] = useState<Omit<TaxJurisdiction, "id">>({
    name: "",
    code: "",
    rules: [],
  })

  const [newRule, setNewRule] = useState<Omit<TaxRule, "id">>({
    name: "",
    rate: 0,
    isDefault: false,
    appliesTo: "all",
    isExempt: false,
  })

  const handleAddJurisdiction = () => {
    addJurisdiction(newJurisdiction)
    setNewJurisdiction({
      name: "",
      code: "",
      rules: [],
    })
    setIsAddJurisdictionOpen(false)
  }

  const handleEditJurisdiction = () => {
    if (!currentJurisdictionEdit) return
    updateJurisdiction(currentJurisdictionEdit)
    setIsEditJurisdictionOpen(false)
    setCurrentJurisdictionEdit(null)
  }

  const handleAddRule = () => {
    if (!currentJurisdiction) return
    addTaxRule(currentJurisdiction.id, newRule)
    setNewRule({
      name: "",
      rate: 0,
      isDefault: false,
      appliesTo: "all",
      isExempt: false,
    })
    setIsAddRuleOpen(false)
  }

  const handleEditRule = () => {
    if (!currentJurisdiction || !currentRuleEdit) return
    updateTaxRule(currentJurisdiction.id, currentRuleEdit)
    setIsEditRuleOpen(false)
    setCurrentRuleEdit(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tax Settings</h1>
          <p className="text-muted-foreground">Manage tax jurisdictions and rules for your store</p>
        </div>
        <Button onClick={() => setIsAddJurisdictionOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Jurisdiction
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tax Jurisdictions</CardTitle>
          <Select value={currentJurisdiction?.id || ""} onValueChange={setCurrentJurisdiction}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select jurisdiction" />
            </SelectTrigger>
            <SelectContent>
              {taxJurisdictions.map((jurisdiction) => (
                <SelectItem key={jurisdiction.id} value={jurisdiction.id}>
                  {jurisdiction.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Rules</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxJurisdictions.length > 0 ? (
                taxJurisdictions.map((jurisdiction) => (
                  <TableRow key={jurisdiction.id}>
                    <TableCell className="font-medium">{jurisdiction.name}</TableCell>
                    <TableCell>{jurisdiction.code}</TableCell>
                    <TableCell>{jurisdiction.rules.length} rules</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentJurisdictionEdit(jurisdiction)
                            setIsEditJurisdictionOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeJurisdiction(jurisdiction.id)}
                          disabled={jurisdiction.id === currentJurisdiction?.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-muted-foreground">No tax jurisdictions found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {currentJurisdiction && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tax Rules for {currentJurisdiction.name}</CardTitle>
            <Button onClick={() => setIsAddRuleOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Applies To</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Exempt</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentJurisdiction.rules.length > 0 ? (
                  currentJurisdiction.rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>{rule.rate}%</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {rule.appliesTo === "all"
                            ? "All Products"
                            : rule.appliesTo === "category"
                              ? "Categories"
                              : "Specific Products"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rule.isDefault ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {rule.isExempt ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCurrentRuleEdit(rule)
                              setIsEditRuleOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => removeTaxRule(currentJurisdiction.id, rule.id)}
                            disabled={rule.isDefault}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">No tax rules found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Jurisdiction Dialog */}
      <Dialog open={isAddJurisdictionOpen} onOpenChange={setIsAddJurisdictionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Tax Jurisdiction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Jurisdiction Name</Label>
              <Input
                id="name"
                value={newJurisdiction.name}
                onChange={(e) => setNewJurisdiction({ ...newJurisdiction, name: e.target.value })}
                placeholder="California"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Jurisdiction Code</Label>
              <Input
                id="code"
                value={newJurisdiction.code}
                onChange={(e) => setNewJurisdiction({ ...newJurisdiction, code: e.target.value })}
                placeholder="CA"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddJurisdictionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddJurisdiction}>Add Jurisdiction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Jurisdiction Dialog */}
      <Dialog open={isEditJurisdictionOpen} onOpenChange={setIsEditJurisdictionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tax Jurisdiction</DialogTitle>
          </DialogHeader>
          {currentJurisdictionEdit && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Jurisdiction Name</Label>
                <Input
                  id="edit-name"
                  value={currentJurisdictionEdit.name}
                  onChange={(e) => setCurrentJurisdictionEdit({ ...currentJurisdictionEdit, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-code">Jurisdiction Code</Label>
                <Input
                  id="edit-code"
                  value={currentJurisdictionEdit.code}
                  onChange={(e) => setCurrentJurisdictionEdit({ ...currentJurisdictionEdit, code: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditJurisdictionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditJurisdiction}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tax Rule Dialog */}
      <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Tax Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="Standard Rate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-rate">Tax Rate (%)</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="rule-rate"
                  type="number"
                  value={newRule.rate}
                  onChange={(e) => setNewRule({ ...newRule, rate: Number.parseFloat(e.target.value) || 0 })}
                  className="pl-9"
                  placeholder="8.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-applies-to">Applies To</Label>
              <Select
                value={newRule.appliesTo}
                onValueChange={(value: "all" | "category" | "product") => setNewRule({ ...newRule, appliesTo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select where tax applies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="category">Specific Categories</SelectItem>
                  <SelectItem value="product">Specific Products</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rule-default">Default Rule</Label>
                <Switch
                  id="rule-default"
                  checked={newRule.isDefault}
                  onCheckedChange={(checked) => setNewRule({ ...newRule, isDefault: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                The default rule applies to all products that don't match other rules.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rule-exempt">Tax Exempt</Label>
                <Switch
                  id="rule-exempt"
                  checked={newRule.isExempt}
                  onCheckedChange={(checked) => setNewRule({ ...newRule, isExempt: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground">Tax exempt items are not taxed (0% rate).</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRuleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRule}>Add Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tax Rule Dialog */}
      <Dialog open={isEditRuleOpen} onOpenChange={setIsEditRuleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tax Rule</DialogTitle>
          </DialogHeader>
          {currentRuleEdit && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rule-name">Rule Name</Label>
                <Input
                  id="edit-rule-name"
                  value={currentRuleEdit.name}
                  onChange={(e) => setCurrentRuleEdit({ ...currentRuleEdit, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-rule-rate">Tax Rate (%)</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="edit-rule-rate"
                    type="number"
                    value={currentRuleEdit.rate}
                    onChange={(e) =>
                      setCurrentRuleEdit({ ...currentRuleEdit, rate: Number.parseFloat(e.target.value) || 0 })
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-rule-applies-to">Applies To</Label>
                <Select
                  value={currentRuleEdit.appliesTo}
                  onValueChange={(value: "all" | "category" | "product") =>
                    setCurrentRuleEdit({ ...currentRuleEdit, appliesTo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select where tax applies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="category">Specific Categories</SelectItem>
                    <SelectItem value="product">Specific Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-rule-default">Default Rule</Label>
                  <Switch
                    id="edit-rule-default"
                    checked={currentRuleEdit.isDefault}
                    onCheckedChange={(checked) => setCurrentRuleEdit({ ...currentRuleEdit, isDefault: checked })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-rule-exempt">Tax Exempt</Label>
                  <Switch
                    id="edit-rule-exempt"
                    checked={currentRuleEdit.isExempt}
                    onCheckedChange={(checked) => setCurrentRuleEdit({ ...currentRuleEdit, isExempt: checked })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRuleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
