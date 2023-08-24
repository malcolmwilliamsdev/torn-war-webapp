import React from "react";
import { Box } from "@mui/material";

export default function NotFound() {
  return (
    <Box display={"flex"} flexDirection={"column"} textAlign={"center"}>
      <h1>404</h1>
      <p>Page Not Found :(</p>
    </Box>
  );
}
