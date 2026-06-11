const express = require("express");
const multer = require("multer");

const {
  listBusinesses,
  createBusiness,
  getBusiness,
  updateBusiness,
  deleteBusiness,
} = require("../services/businessmanagement");

const listBusinessesQuery = require("../models/requests/listBusinessesQuery");
const createBusinessRequest = require("../models/requests/createBusinessRequest");
const updateBusinessRequest = require("../models/requests/updateBusinessRequest");

const { validateQuery, validateBody } = require("../helpers/validation");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 35, // Max 35 files total
    fieldSize: 10 * 1024 * 1024, // 10MB field size
  },
  fileFilter: (_req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// Public routes
router.get("/", validateQuery(listBusinessesQuery), async (req, res, next) => {
  try {
    const noPagination = req.query.noPagination === 'true';
    const result = await listBusinesses({
      ...req.validated,
      includeDeleted: false,
      noPagination,
    });

    const responseData = {
      rows: result.rows,
    };

    // Only include pagination if not disabled
    if (!noPagination) {
      responseData.pagination = {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      };
    }

    res.json({
      success: true,
      data: responseData,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const business = await getBusiness({ id: req.params.id, includeDeleted: false });
    res.json({
      success: true,
      data: { business },
    });
  } catch (err) {
    next(err);
  }
});

// Admin routes
router.post(
  "/",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "backgroundImage", maxCount: 1 },
    { name: "slideImages", maxCount: 10 },
    { name: "mobileSlideImages", maxCount: 10 },
    { name: "productImages", maxCount: 20 },
  ]),
  async (req, res, next) => {
    try {
      // Parse products if it's a string
      if (req.body.products && typeof req.body.products === 'string') {
        try {
          req.body.products = JSON.parse(req.body.products);
        } catch (e) {
          return res.status(400).json({
            success: false,
            error: "ValidationError",
            issues: [{ path: "products", message: "Invalid JSON format for products" }],
          });
        }
      }

      // Validate the request body
      const parsed = createBusinessRequest.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: "ValidationError",
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        });
      }

      const business = await createBusiness({
        input: parsed.data,
        files: req.files,
        actor: req.user,
      });
      res.status(201).json({
        success: true,
        data: { business },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/:id",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "backgroundImage", maxCount: 1 },
    { name: "slideImages", maxCount: 10 },
    { name: "mobileSlideImages", maxCount: 10 },
    { name: "productImages", maxCount: 20 },
  ]),
  async (req, res, next) => {
    try {
      const payload = {};
      if (req.body.sequence !== undefined) payload.sequence = req.body.sequence;
      if (req.body.name !== undefined) payload.name = req.body.name;
      if (req.body.description !== undefined) payload.description = req.body.description;
      if (req.body.category !== undefined) payload.category = req.body.category;
      if (req.body.shortNote !== undefined) payload.shortNote = req.body.shortNote;
      if (req.body.products !== undefined) {
        try {
          payload.products = typeof req.body.products === 'string'
            ? JSON.parse(req.body.products)
            : req.body.products;
        } catch (e) {
          return res.status(400).json({
            success: false,
            error: "ValidationError",
            issues: [{ path: "products", message: "Invalid JSON format for products" }],
          });
        }
      }
      if (req.body.existingSlideImages !== undefined) {
        payload.existingSlideImages = typeof req.body.existingSlideImages === 'string'
          ? JSON.parse(req.body.existingSlideImages)
          : req.body.existingSlideImages;
      }
      if (req.body.existingMobileSlideImages !== undefined) {
        payload.existingMobileSlideImages = typeof req.body.existingMobileSlideImages === 'string'
          ? JSON.parse(req.body.existingMobileSlideImages)
          : req.body.existingMobileSlideImages;
      }
      if (req.body.removeLogo !== undefined) payload.removeLogo = req.body.removeLogo;
      if (req.body.removeBackgroundImage !== undefined)
        payload.removeBackgroundImage = req.body.removeBackgroundImage;
      if (req.body.removeProductImages !== undefined)
        payload.removeProductImages = req.body.removeProductImages;

      const hasFiles = req.files && Object.values(req.files).some(arr => arr.length > 0);
      const hasAnyField = Object.keys(payload).length > 0 || hasFiles;
      if (!hasAnyField) {
        return res.status(400).json({
          success: false,
          error: "ValidationError",
          issues: [{ path: "", message: "Provide at least one field to update" }],
        });
      }

      const parsed = updateBusinessRequest.safeParse(
        Object.keys(payload).length > 0 ? payload : { removeLogo: false }
      );
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: "ValidationError",
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        });
      }

      const business = await updateBusiness({
        id: req.params.id,
        patch: parsed.data,
        files: req.files,
        actor: req.user,
      });
      res.json({
        success: true,
        data: { business },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await deleteBusiness({ id: req.params.id });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
