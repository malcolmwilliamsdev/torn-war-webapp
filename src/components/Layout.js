import React from "react";

import { AppBar, Container, Toolbar, Typography } from "@mui/material";

export default function Layout({ children }) {
  return (
    <>
      <AppBar sx={{ display: "flex", flexDirection: "row" }}>
        <Toolbar sx={{ mr: "0" }}>
          <Typography fontWeight={500} fontSize={"1.25em"}>
            Torn Ranked War Payout
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Container
        maxWidth={"xl"}
        disableGutters
        sx={{ display: "flex", justifyContent: "center" }}
      >
        {children}
      </Container>
    </>
  );
}
