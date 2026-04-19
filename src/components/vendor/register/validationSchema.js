import * as yup from "yup";
import { validateVerhoeff } from "../../../utils/verhoeffs";

// === VALIDATION SCHEMA ===
export const registrationSchema = yup
  .object({
    // 1. Personal Details
    name: yup.string().required("Full Name is required"),
    email: yup
      .string()
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address (e.g., name@example.com)",
      )
      .required("Email is required"),
    phone: yup
      .string()
      .matches(
        /^[6-9]\d{9}$/,
        "Please enter a valid Indian phone number (10 digits starting with 6-9)",
      )
      .required("Phone number is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character",
      )
      .required("Password is required"),
    aadhar: yup
      .string()
      .matches(/^\d{12}$/, "Aadhar number must be exactly 12 digits")
      .test(
        "verhoeff-check",
        "Invalid Aadhar Number (Checksum failed)",
        (value) => validateVerhoeff(value), // Using the imported function
      )
      .required("Aadhar number is required"),

    // 2. Business Information
    businessName: yup.string().required("Business Name is required"),
    businessType: yup.string().required("Business Type is required"),
    businessAddress: yup.string().required("Physical Address is required"),
    yearsInBusiness: yup
      .number()
      .typeError("Must be a valid number")
      .min(0, "Cannot be negative")
      .required("Years in business is required"),

    // 3. Legal & Banking
    pan: yup
      .string()
      .transform((value) => value.toUpperCase())
      .matches(
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        "Invalid PAN format (e.g., ABCDE1234F)",
      )
      .required("PAN Number is required"),

    // ✅ STRICT GST REGEX FOR INDIA
    gst: yup
      .string()
      .transform((value) => value.toUpperCase())
      .matches(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Invalid GST format (e.g., 22AAAAA0000A1Z5)",
      )
      .required("GST Number is required"),

    bankName: yup.string().required("Bank Name is required"),

    // ✅ STRICT IFSC REGEX (5th char must be 0)
    ifscCode: yup
      .string()
      .transform((value) => value.toUpperCase())
      .matches(
        /^[A-Z]{4}0[A-Z0-9]{6}$/,
        "Invalid IFSC Code (5th character must be '0')",
      )
      .required("IFSC Code is required"),

    bankHolderName: yup.string().required("Account Holder Name is required"),
    bankAccount: yup
      .string()
      .min(9, "Account number too short")
      .max(18, "Account number too long")
      .required("Bank Account Number is required"),
  })
  .required();
