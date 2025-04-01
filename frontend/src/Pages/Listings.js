import React from "react";
import ListingsParser from "../components/ListingsParser";
import { motion } from "framer-motion";

const Listings = () => {
  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="p-6 max-w-6xl mx-auto"
      >
        <h1 className="text-3xl font-semibold mb-6 text-center">Available Listings</h1>
        <ListingsParser />
      </motion.div>
  );
};

export default Listings;
