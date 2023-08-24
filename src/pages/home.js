import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  FormLabel,
  RadioGroup,
  Radio,
  Slider,
  FormControlLabel,
  Typography,
  Grid,
  Link,
  Input,
  Divider,
  InputAdornment,
} from "@mui/material";

import { Members, Faction } from "../Classes";
import PayoutTable from "../components/PayoutTable";

export default function Home() {
  const apiKey = "oPwvqYidy0LPZkHp"; // public key
  const [warID, setWarID] = useState(0);
  const [reportData, setReportData] = useState(null);
  const [reportError, setReportError] = useState(null);
  const [factionData, setFactionData] = useState(null);
  const [factionID, setFactionID] = useState(null);
  const [totalMoney, setTotalMoney] = useState(0);
  const [fixedPay, setFixedPay] = useState(0);
  const [moneyError, setMoneyError] = useState(null);
  const [memberRatio, setMemberRatio] = useState(80);
  const [factionRatio, setFactionRatio] = useState(15);
  const [mvpRatio, setMvpRatio] = useState(5);
  const [payType, setPayType] = useState("Attacks");
  const [showPayout, setShowPayout] = useState(false);
  const [calculateTrigger, setCalculateTrigger] = useState(false);

  const handleFind = () => {
    fetchReport();
  };

  const handleCalculate = () => {
    const moneyValue = payType === "Fixed" ? fixedPay : totalMoney;
    if (parseInt(moneyValue) <= 0) {
      setMoneyError("Broke ass bitch");
    } else {
      setMoneyError(null);
      setShowPayout(true);
      setCalculateTrigger(!calculateTrigger);
    }
  };

  const fetchReport = async () => {
    try {
      const response = await fetch(
        `https://api.torn.com/torn/${warID}?selections=rankedwarreport&key=${apiKey}`
      );
      const data = await response.json();
      setReportData(data.rankedwarreport);

      if (data.error) {
        setReportError(data.error.error);
      } else {
        setReportError(null);
      }
    } catch (error) {
      setReportError("Error fetching data. Torn may be down.");
      //console.error("Error fetching JSON data:", error);
    }
  };

  const decodeHtmlEntities = (text) => {
    const parser = new DOMParser();
    const decoded = parser.parseFromString(text, "text/html").body.textContent;
    return decoded;
  };

  const populateFactionData = useCallback(() => {
    const factionIDs = Object.keys(reportData.factions);
    //console.log(factionIDs);

    const factions = factionIDs.map((id) => {
      const faction = reportData.factions[id];
      const members = Object.keys(faction.members).map((memberId) => {
        const member = faction.members[memberId];
        return new Members(
          memberId,
          member.name,
          member.score,
          member.attacks,
          member.faction_id
        );
      });

      return new Faction(
        id,
        faction.name,
        faction.score,
        faction.attacks,
        members
      );
    });

    setFactionData(factions);
    //console.log(factions);
  }, [reportData]);

  useEffect(() => {
    if (!reportData) return;
    //console.log(reportData);

    populateFactionData();
  }, [reportData, populateFactionData]);

  const handleChangeRatio = (type, value) => {
    // Ensure the value is within the range [0, 100]
    const newValue = Math.min(Math.max(value, 0), 100);

    if (type === "member") {
      setMemberRatio(newValue);

      // Calculate remaining ratio
      const remainingRatio = 100 - newValue - factionRatio - mvpRatio;

      // Adjust other ratios if needed
      const newFactionRatio = Math.max(
        Math.min(factionRatio + remainingRatio, 100),
        0
      );
      const newMvpRatio = 100 - newValue - newFactionRatio;

      setFactionRatio(newFactionRatio);
      setMvpRatio(newMvpRatio);
    } else if (type === "faction") {
      setFactionRatio(newValue);

      // Calculate remaining ratio
      const remainingRatio = 100 - newValue - memberRatio - mvpRatio;

      // Adjust other ratios if needed
      const newMemberRatio = Math.max(
        Math.min(memberRatio + remainingRatio, 100),
        0
      );
      const newMvpRatio = 100 - newMemberRatio - newValue;

      setMemberRatio(newMemberRatio);
      setMvpRatio(newMvpRatio);
    } else if (type === "mvp") {
      setMvpRatio(newValue);

      // Calculate remaining ratio
      const remainingRatio = 100 - newValue - memberRatio - factionRatio;

      // Adjust other ratios if needed
      const newMemberRatio = Math.max(
        Math.min(memberRatio + remainingRatio, 100),
        0
      );
      const newFactionRatio = 100 - newMemberRatio - newValue;

      setMemberRatio(newMemberRatio);
      setFactionRatio(newFactionRatio);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection={"column"}
      padding={"1em"}
      width={"100%"}
      maxWidth={"1009px"}
    >
      <TextField
        variant="standard"
        id="warID"
        label="War ID"
        type="number"
        error={reportError != null}
        helperText={reportError || ""}
        onChange={(event) => {
          setWarID(event.target.value);
        }}
        sx={{ mb: "0.5em" }}
      />

      <Button variant="contained" onClick={handleFind} sx={{ mb: "0.75em" }}>
        Find War
      </Button>

      {factionData != null ? (
        <>
          <FormLabel>My Faction:</FormLabel>
          <RadioGroup>
            {factionData.map((faction) => (
              <FormControlLabel
                onChange={() => {
                  setFactionID(faction.id);
                }}
                key={faction.id}
                value={faction.id}
                control={<Radio />}
                label={decodeHtmlEntities(faction.name)}
              />
            ))}
          </RadioGroup>
          <Divider sx={{ mb: "0.5em" }} />
        </>
      ) : (
        <>
          <Box display="flex" flexDirection="column" padding="0.25em">
            <Typography textAlign={"center"} mt="0.5em">
              This tool was developed by{" "}
              <Link href="https://www.torn.com/profiles.php?XID=2866181">
                Sixpathsmac [2866181]
              </Link>{" "}
              for the horrible moment after a war has ended and it is time to
              pay up to 100 people.
            </Typography>
            <Typography textAlign={"center"}>
              <br />
              It is completely free to use😁
            </Typography>
            <Typography variant="caption" textAlign={"center"}>
              <br />
              (All dollar values are rounded by flooring)
            </Typography>

            <img
              src="capture.png"
              alt="screenshot"
              width="80%"
              style={{
                aspectRatio: 16 / 9,
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: "2em",
                //transform: "rotate(-2.5deg)",
                boxShadow:
                  "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px",
              }}
            />
          </Box>
        </>
      )}

      {factionID && (
        <>
          <FormLabel>Pay by:</FormLabel>
          <RadioGroup
            value={payType}
            onChange={(event) => setPayType(event.target.value)}
          >
            <FormControlLabel
              value={"Attacks"}
              control={<Radio />}
              label="Attack Ratio"
            />

            <FormControlLabel
              value={"Score"}
              control={<Radio />}
              label="Score Ratio"
            />

            <FormControlLabel
              value={"Fixed"}
              control={<Radio />}
              label="Fixed Per Attack"
            />
          </RadioGroup>

          {payType === "Fixed" ? (
            <>
              <TextField
                variant="standard"
                id="fixedPay"
                label="Pay Per Attack"
                type="number"
                error={moneyError != null}
                helperText={moneyError || ""}
                onChange={(event) => {
                  setFixedPay(event.target.value);
                  setTotalMoney(event.target.value);
                }}
                defaultValue={0}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                sx={{ mb: "1em" }}
              />
            </>
          ) : (
            <>
              <TextField
                variant="standard"
                id="totalMoney"
                label="Total Money Earned"
                type="number"
                error={moneyError != null}
                helperText={moneyError || ""}
                onChange={(event) => {
                  setFixedPay(event.target.value);
                  setTotalMoney(event.target.value);
                }}
                defaultValue={0}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                sx={{ mb: "1em" }}
              />
              <FormLabel sx={{ mb: "0.5em" }}>Payout Ratios:</FormLabel>
              <Grid container spacing={2} sx={{ mb: "1em" }}>
                <Grid item xs={2.5}>
                  <Typography>Members:</Typography>
                  <Typography>
                    ${((totalMoney * memberRatio) / 100).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={9.5}>
                  <Box display="flex">
                    <Slider
                      value={memberRatio}
                      valueLabelDisplay="auto"
                      onChange={(event, newValue) => {
                        handleChangeRatio("member", newValue);
                      }}
                      sx={{ mr: "1em" }}
                    />
                    <Input
                      value={memberRatio}
                      size="small"
                      disableUnderline
                      onChange={(event) => {
                        const newValue = event.target.value;
                        handleChangeRatio("member", newValue);
                      }}
                      inputProps={{
                        step: 1,
                        min: 0,
                        max: 100,
                        type: "number",
                      }}
                      sx={{ width: "3em" }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={2.5}>
                  <Typography>Faction:</Typography>
                  <Typography>
                    ${((totalMoney * factionRatio) / 100).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={9.5}>
                  <Box display="flex">
                    <Slider
                      value={factionRatio}
                      valueLabelDisplay="auto"
                      onChange={(event, newValue) => {
                        handleChangeRatio("faction", newValue);
                      }}
                      sx={{ mr: "1em" }}
                    />
                    <Input
                      value={factionRatio}
                      size="small"
                      disableUnderline
                      onChange={(event) => {
                        const newValue = event.target.value;
                        handleChangeRatio("faction", newValue);
                      }}
                      inputProps={{
                        step: 1,
                        min: 0,
                        max: 100,
                        type: "number",
                      }}
                      sx={{ width: "3em" }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={2.5}>
                  <Typography>MVPs:</Typography>
                  <Typography>
                    ${((totalMoney * mvpRatio) / 100).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={9.5}>
                  <Box display="flex">
                    <Slider
                      value={mvpRatio}
                      valueLabelDisplay="auto"
                      onChange={(event, newValue) => {
                        handleChangeRatio("mvp", newValue);
                      }}
                      sx={{ mr: "1em" }}
                    />
                    <Input
                      value={mvpRatio}
                      size="small"
                      disableUnderline
                      onChange={(event) => {
                        const newValue = event.target.value;
                        handleChangeRatio("mvp", newValue);
                      }}
                      inputProps={{
                        step: 1,
                        min: 0,
                        max: 100,
                        type: "number",
                      }}
                      sx={{ width: "3em" }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </>
          )}

          <Button
            variant="contained"
            onClick={handleCalculate}
            sx={{ mb: "1em" }}
          >
            Calculate Payouts
          </Button>

          {showPayout && (
            <PayoutTable
              updateTrigger={calculateTrigger}
              payType={payType}
              faction={factionData.find((faction) => faction.id === factionID)}
              fixedPay={fixedPay}
              totalMoney={totalMoney}
              memberRatio={memberRatio}
              mvpRatio={mvpRatio}
            />
          )}
        </>
      )}
    </Box>
  );
}
