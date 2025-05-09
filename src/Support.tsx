import React from "react";
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

const Support: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography
        variant="h2"
        component="h1"
        sx={{
          fontWeight: 700,
          mb: 6,
          textAlign: "center",
          fontSize: { xs: "2rem", md: "2.5rem" },
        }}
      >
        Support Center
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 6,
          borderRadius: 2,
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Need Help?
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          We're here to help you get the most out of Penny Logs. If you can't
          find what you're looking for, or you need to request a new feature
          feel free to reach out to us.
        </Typography>
        <Typography variant="body1">
          Email us at:{" "}
          <Box
            component="a"
            href="mailto:support@pennylogs.app"
            sx={{
              color: "white",
              textDecoration: "underline",
              "&:hover": { opacity: 0.8 },
            }}
          >
            support@pennylogs.app
          </Box>
        </Typography>
      </Paper>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          mb: 4,
          fontSize: { xs: "1.5rem", md: "2rem" },
        }}
      >
        Frequently Asked Questions
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{ fontWeight: 500 }}>
              How do I get started with Penny Logs?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Simply sign up with your email address, and you can start tracking
              your expenses right away. No credit card required, and we only ask
              for your email to keep your account secure.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{ fontWeight: 500 }}>
              Is my data secure and private?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Yes, we take your privacy seriously. We only collect your email
              for login purposes, and your expense data is stored securely. We
              never share or sell your personal information.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{ fontWeight: 500 }}>
              How do I categorize my expenses?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              When adding a new expense, you can select from our predefined
              categories. This helps you track and analyze your spending
              patterns more effectively.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{ fontWeight: 500 }}>
              What currencies are supported?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Currently, Penny Logs supports USD (US Dollar), EGP (Egyptian
              Pound), and PHP (Philippine Peso). The default currency is USD,
              but you can change it in your settings. We are actively working on
              expanding support to more cash-centric countries in the future.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{ fontWeight: 500 }}>
              How do I export my expense data?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Data export functionality is coming soon. We're working on adding
              the ability to export your expense data for backup and analysis
              purposes.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Container>
  );
};

export default Support;
