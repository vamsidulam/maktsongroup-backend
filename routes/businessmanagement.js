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
  limits: { fileSize: 5 * 1024 * 1024 },
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
    { name: "galleryImages", maxCount: 10 },
  ]),
  validateBody(createBusinessRequest),
  async (req, res, next) => {
    try {
      const business = await createBusiness({
        input: req.validated,
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
    { name: "galleryImages", maxCount: 10 },
  ]),
  async (req, res, next) => {
    try {
      const payload = {};
      if (req.body.name !== undefined) payload.name = req.body.name;
      if (req.body.description !== undefined) payload.description = req.body.description;
      if (req.body.url !== undefined) payload.url = req.body.url;
      if (req.body.year !== undefined) payload.year = req.body.year;
      if (req.body.removeLogoImage !== undefined) payload.removeLogoImage = req.body.removeLogoImage;
      if (req.body.removeBackgroundImage !== undefined)
        payload.removeBackgroundImage = req.body.removeBackgroundImage;
      if (req.body.removeGalleryImages !== undefined)
        payload.removeGalleryImages = req.body.removeGalleryImages;

      const hasAnyField = Object.keys(payload).length > 0 || !!req.files;
      if (!hasAnyField) {
        return res.status(400).json({
          success: false,
          error: "ValidationError",
          issues: [{ path: "", message: "Provide at least one field to update" }],
        });
      }

      const parsed = updateBusinessRequest.safeParse(
        Object.keys(payload).length > 0 ? payload : { removeLogoImage: false }
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
