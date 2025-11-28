import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertContactSchema, insertProductSchema, insertCoaSchema, insertAffiliateApplicationSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup authentication
  await setupAuth(app);

  // Get authenticated user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Search products
  app.get("/api/products/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        const products = await storage.getAllProducts();
        return res.json(products);
      }
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ error: "Failed to search products" });
    }
  });

  // Get single product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Get COA by batch number
  app.get("/api/coa/:batchNumber", async (req, res) => {
    try {
      const coa = await storage.getCoaByBatchNumber(req.params.batchNumber);
      if (!coa) {
        return res.status(404).json({ error: "COA not found" });
      }
      res.json(coa);
    } catch (error) {
      console.error("Error fetching COA:", error);
      res.status(500).json({ error: "Failed to fetch COA" });
    }
  });

  // Create order (can be used by guests or authenticated users)
  app.post("/api/orders", async (req: any, res) => {
    try {
      const orderData = { ...req.body };
      
      // If user is authenticated, link order to their account
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        orderData.userId = req.user.claims.sub;
      }
      
      const validatedData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid order data" });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Get user's orders (authenticated)
  app.get("/api/orders/my-orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      
      // Get orders by user ID or email
      let orders = await storage.getOrdersByUserId(userId);
      
      // If no orders by userId, try by email for legacy orders
      if (orders.length === 0 && userEmail) {
        orders = await storage.getOrdersByEmail(userEmail);
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Create contact submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid contact data" });
      }
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  // Create affiliate application
  app.post("/api/affiliate-apply", async (req, res) => {
    try {
      const validatedData = insertAffiliateApplicationSchema.parse(req.body);
      console.log("New affiliate application received:", validatedData);
      const application = await storage.createAffiliateApplication(validatedData);
      res.status(201).json({ success: true, message: "Application received successfully", application });
    } catch (error) {
      console.error("Error creating affiliate application:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid application data" });
      }
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // === ADMIN ROUTES ===
  
  // Check if user is admin middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await storage.getUser(userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }
    next();
  };

  // Admin: Get all orders
  app.get("/api/admin/orders", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Admin: Update order status
  app.patch("/api/admin/orders/:id/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Admin: Create product
  app.post("/api/admin/products", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid product data" });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Admin: Update product
  app.patch("/api/admin/products/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Admin: Delete product
  app.delete("/api/admin/products/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Admin: Get all COAs
  app.get("/api/admin/coas", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allCoas = await storage.getAllCoas();
      res.json(allCoas);
    } catch (error) {
      console.error("Error fetching COAs:", error);
      res.status(500).json({ error: "Failed to fetch COAs" });
    }
  });

  // Admin: Create COA
  app.post("/api/admin/coas", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertCoaSchema.parse(req.body);
      const coa = await storage.createCoa(validatedData);
      res.status(201).json(coa);
    } catch (error) {
      console.error("Error creating COA:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid COA data" });
      }
      res.status(500).json({ error: "Failed to create COA" });
    }
  });

  // Admin: Update COA
  app.patch("/api/admin/coas/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const coa = await storage.updateCoa(req.params.id, req.body);
      if (!coa) {
        return res.status(404).json({ error: "COA not found" });
      }
      res.json(coa);
    } catch (error) {
      console.error("Error updating COA:", error);
      res.status(500).json({ error: "Failed to update COA" });
    }
  });

  // Admin: Delete COA
  app.delete("/api/admin/coas/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteCoa(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "COA not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting COA:", error);
      res.status(500).json({ error: "Failed to delete COA" });
    }
  });

  // Admin: Get all contacts
  app.get("/api/admin/contacts", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  return httpServer;
}
