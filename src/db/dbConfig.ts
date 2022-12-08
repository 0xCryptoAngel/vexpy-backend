import mongoose from "mongoose";
const dbConfig = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("MongoDb Connected");
};

export default dbConfig;
