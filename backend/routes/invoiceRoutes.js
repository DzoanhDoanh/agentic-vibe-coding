const express = require("express");
const router = express.Router();
const { getInvoices, createInvoice, updateInvoice, getMyInvoices } = require("../controllers/invoiceController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { isolateBranch } = require("../middlewares/branchIsolationMiddleware");

router.use(protect);

router.get("/my", getMyInvoices);

router.use("/", isolateBranch);
router.route("/")
  .get(authorize("SuperAdmin", "BranchAdmin"), getInvoices)
  .post(authorize("SuperAdmin", "BranchAdmin"), createInvoice);
router.route("/:id")
  .put(authorize("SuperAdmin", "BranchAdmin"), updateInvoice);

module.exports = router;
