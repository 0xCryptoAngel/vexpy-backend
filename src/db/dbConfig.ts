import mongoose from "mongoose";
const dbConfig = async () => {
  mongoose.set("strictQuery", false);
  // await mongoose.connect(process.env.MONGO_URI!);
  await mongoose.connect(process.env.MONGODB_URL!);
  console.log("MongoDb Connected");
};

export default dbConfig;
