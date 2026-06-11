const express = require("express");
const { z } = require("zod");
const sendContactEmail = require("../services/email/sendContactEmail");

const router = express.Router();

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required").trim(),
});

router.post("/", async (req, res, next) => {
  try {
    // Validate request body
    const parsed = contactSchema.safeParse(req.body);

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

    // Send email
    const result = await sendContactEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
    });

    res.json({
      success: true,
      message: "Thank you for your interest! We'll get in touch soon.",
      data: result,
    });
  } catch (err) {
    console.error("Contact email error:", err);
    next(err);
  }
});

module.exports = router;
