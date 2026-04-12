const Invoice = require("../models/Invoice");
const Class = require("../models/Class");
const Student = require("../models/Student");

const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find(req.branchFilter)
      .populate("student_id", "full_name phone")
      .populate("class_id", "name");
    res.json(invoices);
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

const createInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create({ ...req.body, branch_id: req.body.branch_id || req.user.branch_id });
    res.status(201).json(invoice);
  } catch (error) { res.status(400).json({ message: "Invalid data" }); }
};

const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Not found" });
    if (req.user.role !== "SuperAdmin" && String(invoice.branch_id) !== String(req.user.branch_id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // Auto update status based on paid amount
    let { paid_amount, amount } = req.body;
    let newPaid = paid_amount !== undefined ? paid_amount : invoice.paid_amount;
    let newAmount = amount !== undefined ? amount : invoice.amount;
    let status = "Unpaid";
    
    if (newPaid >= newAmount) status = "Paid";
    else if (newPaid > 0) status = "Partial";

    Object.assign(invoice, req.body);
    invoice.status = status;
    if(status === "Paid" && !invoice.payment_date) invoice.payment_date = new Date();
    
    await invoice.save();
    res.json(invoice);
  } catch (error) { res.status(400).json({ message: "Invalid data" }); }
};

const getMyInvoices = async (req, res) => {
  try {
    if (req.user.role !== "Student") return res.status(403).json({ message: "Forbidden" });
    if(!req.user.student_id) return res.json([]);
    const invoices = await Invoice.find({ student_id: req.user.student_id }).populate("class_id", "name");
    res.json(invoices);
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

module.exports = { getInvoices, createInvoice, updateInvoice, getMyInvoices };
