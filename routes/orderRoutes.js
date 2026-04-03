const express = require("express");
const router  = express.Router();
const ctrl    = require("../controlles/ordercontrolles");
const { Auth } = require("../middlewares/isAuth");
const isAdmin  = require("../middlewares/isAdmin");

// Public — anyone can place an order (optionally authenticated)
router.post("/",        ctrl.CreateOrder);
router.get("/config",   ctrl.GetConfig);    // delivery fee config for frontend

// Admin only
router.get("/",         Auth, isAdmin, ctrl.GetOrders);
router.get("/:id",      Auth, isAdmin, ctrl.GetOrder);
router.patch("/:id",    Auth, isAdmin, ctrl.UpdateOrderStatus);
router.delete("/:id",   Auth, isAdmin, ctrl.DeleteOrder);

module.exports = router;
