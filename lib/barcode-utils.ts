import JsBarcode from "jsbarcode"

// Barcode types
export type BarcodeType = "CODE128" | "EAN13" | "EAN8" | "UPC" | "CODE39"

export type BarcodeOptions = {
  format: BarcodeType
  width: number
  height: number
  displayValue: boolean
  fontSize: number
  margin: number
  background: string
  lineColor: string
  text?: string
}

// Default barcode options
export const DEFAULT_BARCODE_OPTIONS: BarcodeOptions = {
  format: "CODE128",
  width: 2,
  height: 100,
  displayValue: true,
  fontSize: 16,
  margin: 10,
  background: "#FFFFFF",
  lineColor: "#000000",
}

// Generate barcode on canvas element
export function generateBarcode(
  canvas: HTMLCanvasElement,
  value: string,
  options: Partial<BarcodeOptions> = {},
): boolean {
  try {
    JsBarcode(canvas, value, {
      ...DEFAULT_BARCODE_OPTIONS,
      ...options,
    })
    return true
  } catch (error) {
    console.error("Error generating barcode:", error)
    return false
  }
}

// Generate random barcode value based on type
export function generateRandomBarcodeValue(type: BarcodeType): string {
  let randomBarcode = ""

  switch (type) {
    case "EAN13":
      // Generate 12 digits (13th is check digit)
      for (let i = 0; i < 12; i++) {
        randomBarcode += Math.floor(Math.random() * 10).toString()
      }
      break
    case "EAN8":
      // Generate 7 digits (8th is check digit)
      for (let i = 0; i < 7; i++) {
        randomBarcode += Math.floor(Math.random() * 10).toString()
      }
      break
    case "UPC":
      // Generate 11 digits (12th is check digit)
      for (let i = 0; i < 11; i++) {
        randomBarcode += Math.floor(Math.random() * 10).toString()
      }
      break
    case "CODE128":
    case "CODE39":
    default:
      // Generate alphanumeric code
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      for (let i = 0; i < 10; i++) {
        randomBarcode += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      break
  }

  return randomBarcode
}

// Validate barcode value based on type
export function validateBarcodeValue(value: string, type: BarcodeType): boolean {
  switch (type) {
    case "EAN13":
      return /^\d{12,13}$/.test(value)
    case "EAN8":
      return /^\d{7,8}$/.test(value)
    case "UPC":
      return /^\d{11,12}$/.test(value)
    case "CODE39":
      return /^[A-Z0-9\-. $/+%]+$/.test(value)
    case "CODE128":
    default:
      return value.length > 0
  }
}

// Convert canvas to image data URL
export function canvasToDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png")
}

// Convert canvas to blob
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error("Failed to convert canvas to blob"))
      }
    })
  })
}
