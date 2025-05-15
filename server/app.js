import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotnet from "dotenv";
import { connectDB } from "./db/connection.js";
import ChatRoute from "./routes/chat.js";
import UserRoute from "./routes/user.js";
import path from "path";
import { createUser } from "./init-mongo.js";

dotnet.config();

let app = express();
let port = process.env.PORT;

const allowedOrigins = ["http://localhost:8080", "http://localhost:5001", "http://localhost:5000", "https://d3shm7c63roazp.cloudfront.net"];

app.use(
    cors({
      credentials: true,
      origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
    })
);

// app.use(cors({ credentials: true, origin: process.env.SITE_URL }));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));

// api route
app.use("/api/chat/", ChatRoute);
app.use("/api/user/", UserRoute);
app.use("/api/health/", (req, res) => res.status(200).json({msg: "api is running"}));

// front end react route
/*app.get('/*',(req,res)=>{
    res.sendFile(path.join(`${path.resolve(path.dirname(''))}/dist/index.html`))
})*/

app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

connectDB((err) => {
  if (err) return console.log("MongoDB Connect Failed : ", err);

  console.log("MongoDB Connected");

  app.listen(port, () => {
    console.log("server started", port);
  });
});

createUser((err) => {
  if (err) {
    console.log("error creating users");
  }
});
