# Backend Business API - Updated Structure

## ✅ Updated Business Model

### New Schema Structure

```javascript
{
  name: String,              // Business name (required)
  logo: String,              // Logo image URL
  backgroundImage: String,   // Background/hero image URL
  description: String,       // Short description (required)
  category: String,          // Business category (required)
  shortNote: String,         // Tagline/short note
  products: [{               // Products array
    name: String,            // Product name (required)
    image: String,           // Product image URL
    description: String      // Product description
  }],
  createdBy: ObjectId,       // User who created
  updatedBy: ObjectId,       // User who last updated
  deletedAt: Date,           // Soft delete timestamp
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

### Removed Fields
- ❌ `url` (removed)
- ❌ `year` (removed)
- ❌ `logoUrl` → renamed to `logo`
- ❌ `backgroundImageUrl` → renamed to `backgroundImage`
- ❌ `galleryImageUrls` → replaced with `products[].image`

### Added Fields
- ✅ `category` - Business category
- ✅ `shortNote` - Tagline
- ✅ `products` - Array of products with images

---

## 📡 API Endpoints

### 1. **GET /businesses** (Public)
Get all businesses with optional pagination.

**Query Parameters:**
- `page` (optional) - Page number
- `limit` (optional) - Items per page
- `noPagination` (optional) - Set to 'true' to get all businesses

**Response:**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "MAKTSON Business",
        "logo": "https://...",
        "backgroundImage": "https://...",
        "description": "Short description",
        "category": "Technology",
        "shortNote": "Innovation at scale",
        "products": [
          {
            "name": "Product 1",
            "image": "https://...",
            "description": "Product description"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

---

### 2. **GET /businesses/:id** (Public)
Get a single business by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "business": {
      "id": "507f1f77bcf86cd799439011",
      "name": "MAKTSON Business",
      "logo": "https://...",
      "backgroundImage": "https://...",
      "description": "Short description",
      "category": "Technology",
      "shortNote": "Innovation at scale",
      "products": [...]
    }
  }
}
```

---

### 3. **POST /businesses** (Admin Only)
Create a new business.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `name` (required) - Business name
- `description` (required) - Short description
- `category` (required) - Business category
- `shortNote` (optional) - Tagline
- `products` (optional) - JSON string of products array
  ```json
  [
    {"name": "Product 1", "description": "Desc 1"},
    {"name": "Product 2", "description": "Desc 2"}
  ]
  ```

**File Uploads:**
- `logo` (optional) - Logo image file
- `backgroundImage` (optional) - Background image file
- `productImages` (optional) - Array of product image files (matched by index)

**Example:**
```bash
curl -X POST http://localhost:3001/businesses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=New Business" \
  -F "description=Great business" \
  -F "category=Technology" \
  -F "shortNote=Innovation" \
  -F 'products=[{"name":"Product 1","description":"First product"}]' \
  -F "logo=@logo.jpg" \
  -F "backgroundImage=@bg.jpg" \
  -F "productImages=@product1.jpg"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "business": { ... }
  }
}
```

---

### 4. **PATCH /businesses/:id** (Admin Only)
Update an existing business.

**Content-Type:** `multipart/form-data`

**Form Fields (all optional):**
- `name` - Update business name
- `description` - Update description
- `category` - Update category
- `shortNote` - Update tagline
- `products` - JSON string to replace products array
- `removeLogo` - Set to 'true' to remove logo
- `removeBackgroundImage` - Set to 'true' to remove background
- `removeProductImages` - JSON array of product indices `[0, 2]`

**File Uploads (all optional):**
- `logo` - Replace logo image
- `backgroundImage` - Replace background image
- `productImages` - Replace product images (matched by index)

**Example:**
```bash
curl -X PATCH http://localhost:3001/businesses/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "shortNote=Updated tagline" \
  -F 'products=[{"name":"Updated Product","description":"New desc"}]' \
  -F "productImages=@new-product.jpg"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "business": { ... }
  }
}
```

---

### 5. **DELETE /businesses/:id** (Admin Only)
Soft delete a business (sets `deletedAt` timestamp).

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Business deleted successfully"
  }
}
```

---

## 🔐 Authentication

Admin endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📂 File Upload Structure

Images are organized in folders:
```
uploads/
└── businesses/
    └── business-name/
        ├── logo.jpg
        ├── background.jpg
        └── products/
            ├── product_0.jpg
            ├── product_1.jpg
            └── product_2.jpg
```

---

## 🚀 Testing the API

### 1. Start the Backend
```bash
cd backend
npm start
```

Server runs on: **http://localhost:3001**

### 2. Test Endpoints

**Get all businesses:**
```bash
curl http://localhost:3001/businesses?noPagination=true
```

**Get one business:**
```bash
curl http://localhost:3001/businesses/BUSINESS_ID
```

**Create business (requires auth):**
```bash
curl -X POST http://localhost:3001/businesses \
  -H "Authorization: Bearer TOKEN" \
  -F "name=Test Business" \
  -F "description=Test Description" \
  -F "category=Technology" \
  -F "logo=@logo.jpg"
```

---

## 📝 Notes

- All image uploads are handled via **Multer**
- Images are stored in the `uploads/` folder
- Maximum file size: **5MB per file**
- Supported formats: **Images only** (JPG, PNG, etc.)
- Product images are matched to products by **array index**
- Soft delete: businesses are not permanently removed, just marked as deleted

---

## ✅ Migration from Old Structure

If you have existing businesses with old structure:
- `logoUrl` → `logo`
- `backgroundImageUrl` → `backgroundImage`
- `galleryImageUrls[0]` → can be moved to `products[0].image`
- `url` and `year` fields removed (update client if needed)
