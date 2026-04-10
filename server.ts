import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import admin from "firebase-admin";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load firebase config
let firebaseConfig: any = {};
function loadFirebaseConfig() {
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    console.log("Checking for firebase config at:", configPath);
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      firebaseConfig = JSON.parse(content);
      console.log("Firebase config loaded successfully. Project:", firebaseConfig?.projectId);
      return true;
    } else {
      console.error("Firebase config file not found at:", configPath);
      firebaseConfig = {}; // Ensure it's an object
      return false;
    }
  } catch (err) {
    console.error("Error loading firebase config:", err);
    firebaseConfig = {}; // Ensure it's an object
    return false;
  }
}

loadFirebaseConfig();

// Initialize Firebase Admin
let db: admin.firestore.Firestore;
let bucket: any;

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log("Starting server initialization...");

  try {
    console.log("Checking admin apps...");
    const currentApps = (admin && admin.apps && Array.isArray(admin.apps)) ? admin.apps : [];
    console.log(`Found ${currentApps.length} apps`);
    
    if (currentApps.length === 0) {
      if (!firebaseConfig || typeof firebaseConfig !== 'object' || Object.keys(firebaseConfig).length === 0) {
        console.log("Firebase config empty or invalid, attempting to reload...");
        loadFirebaseConfig();
      }

      const adminConfig: admin.AppOptions = {
        projectId: firebaseConfig?.projectId,
        storageBucket: firebaseConfig?.storageBucket
      };
      
      console.log("Initializing Firebase Admin with:", JSON.stringify({
        projectId: adminConfig.projectId,
        storageBucket: adminConfig.storageBucket
      }));

      admin.initializeApp(adminConfig);
      console.log("Firebase Admin initialized");
    } else {
      console.log("Firebase Admin already initialized, using existing app");
    }
    
    db = admin.firestore();
    
    // Try to get the bucket from the default app
    try {
      const defaultApp = admin.app();
      let bucketName = (firebaseConfig?.storageBucket || process.env.STORAGE_BUCKET || "").trim();
      
      console.log("Initial bucket initialization attempt with name:", bucketName || "default");
      
      if (bucketName) {
        bucket = defaultApp.storage().bucket(bucketName);
      } else {
        bucket = defaultApp.storage().bucket();
      }

      // Verify if bucket exists and handle potential naming issues
      try {
        const [exists] = await bucket.exists();
        if (!exists) {
          console.warn(`Bucket ${bucket.name} does not exist. Trying fallback...`);
          if (bucketName.endsWith('.firebasestorage.app')) {
            const fallbackName = bucketName.replace('.firebasestorage.app', '.appspot.com');
            console.log(`Trying fallback bucket name: ${fallbackName}`);
            const fallbackBucket = defaultApp.storage().bucket(fallbackName);
            const [fallbackExists] = await fallbackBucket.exists();
            if (fallbackExists) {
              bucket = fallbackBucket;
              console.log(`Fallback bucket ${bucket.name} exists and will be used.`);
            } else {
              const projectId = firebaseConfig?.projectId;
              if (projectId) {
                const projectBucket = defaultApp.storage().bucket(projectId);
                const [projectExists] = await projectBucket.exists().catch(() => [false]);
                if (projectExists) bucket = projectBucket;
              }
            }
          } else if (bucketName.endsWith('.appspot.com')) {
            const fallbackName = bucketName.replace('.appspot.com', '.firebasestorage.app');
            console.log(`Trying fallback bucket name: ${fallbackName}`);
            const fallbackBucket = defaultApp.storage().bucket(fallbackName);
            const [fallbackExists] = await fallbackBucket.exists();
            if (fallbackExists) {
              bucket = fallbackBucket;
              console.log(`Fallback bucket ${bucket.name} exists and will be used.`);
            }
          }
        } else {
          console.log(`Confirmed: Bucket ${bucket.name} exists.`);
        }
      } catch (existsErr) {
        console.error("Error checking bucket existence:", existsErr);
        // If we can't even check existence, it's likely a permission issue or the bucket name is wrong
        // We'll proceed and hope for the best, or the upload route will try lazy init
      }
      
      if (bucket) {
        console.log(`Storage bucket object ready: ${bucket.name}`);
      }
    } catch (storageErr) {
      console.error("Error initializing storage bucket during startup:", storageErr);
    }

    if (!bucket) {
      console.error("Warning: Storage bucket could not be initialized during startup");
    }
    
    console.log("Firebase services (Firestore & Storage) are ready");
  } catch (err) {
    console.error("Firebase Admin initialization failed:", err);
  }

  const upload = multer({ storage: multer.memoryStorage() });

  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Backend System is running" });
  });

  // Example API for image metadata (though we use Firestore directly)
  app.get("/api/images", (req, res) => {
    res.json({ message: "Use Firestore client SDK to fetch images for real-time updates" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware initialized");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
