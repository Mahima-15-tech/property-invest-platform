import React, { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

import {
  Settings as SettingsIcon,
  Building2,
  CreditCard,
  Landmark,
  WalletCards,
  Percent,
  Save,
  Upload,
  QrCode,
  Mail,
  Lock,
KeyRound,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import axios from "../../api/axios";

export function Settings() {
  // ==========================================
  // PAYMENT SETTINGS
  // ==========================================

  const [paymentSettings, setPaymentSettings] = useState({
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: "",
    qrCode: "",
  });

  const [qrPreview, setQrPreview] = useState("");

  const [savingPayment, setSavingPayment] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const [paymentError, setPaymentError] = useState("");

  // ==========================================
// COMMISSION SETTINGS
// ==========================================

const [commissionSettings, setCommissionSettings] = useState({
  commissionRate: "",
});

const [loadingCommission, setLoadingCommission] = useState(false);

const [savingCommission, setSavingCommission] = useState(false);

const [commissionError, setCommissionError] = useState("");

// ==========================================
// ADMIN ACCOUNT SETTINGS
// ==========================================

const [adminEmail, setAdminEmail] = useState("");

const [emailData, setEmailData] = useState({
  newEmail: "",
  password: "",
});

const [passwordData, setPasswordData] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const [savingEmail, setSavingEmail] = useState(false);

const [savingPassword, setSavingPassword] = useState(false);

const [accountError, setAccountError] = useState("");

  // ==========================================
  // GET AUTH TOKEN
  // ==========================================

  const getToken = () => {
    return (
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token")
    );
  };

  // ==========================================
  // LOAD PAYMENT SETTINGS
  // ==========================================

  const fetchPaymentSettings = async () => {
    try {
      setLoadingPayment(true);
      setPaymentError("");

      const res = await axios.get("/admin/payment-settings");

      const settings = res.data?.settings;

      if (settings) {
        setPaymentSettings({
          accountName: settings.accountName || "",
          accountNumber: settings.accountNumber || "",
          ifscCode: settings.ifscCode || "",
          bankName: settings.bankName || "",
          upiId: settings.upiId || "",
          qrCode: settings.qrCode || "",
        });

        if (settings.qrCode) {
          setQrPreview(settings.qrCode);
        }
      }
    } catch (error) {
      console.error("GET PAYMENT SETTINGS ERROR:", error);

      setPaymentError(
        error.response?.data?.message ||
          "Failed to load payment settings"
      );
    } finally {
      setLoadingPayment(false);
    }
  };

  // ==========================================
// FETCH COMMISSION SETTINGS
// ==========================================
const fetchCommissionSettings = async () => {
  try {
    setLoadingCommission(true);
    setCommissionError("");

    const res = await axios.get(
      "/admin/commission-settings"
    );

    const settings = res.data?.settings;

    if (settings) {
      setCommissionSettings({
        commissionRate: settings.commissionRate ?? "",
      });
    }

  } catch (error) {
    console.error(
      "GET COMMISSION SETTINGS ERROR:",
      error
    );

    setCommissionError(
      error.response?.data?.message ||
      "Failed to load commission settings"
    );

  } finally {
    setLoadingCommission(false);
  }
};


// ==========================================
// FETCH ADMIN PROFILE
// ==========================================

const fetchAdminProfile = async () => {
  try {
    setAccountError("");

    const res = await axios.get("/auth/me");

    setAdminEmail(res.data?.email || "");

  } catch (error) {
    console.error(
      "GET ADMIN PROFILE ERROR:",
      error
    );

    setAccountError(
      error.response?.data?.message ||
      "Failed to load admin profile"
    );
  }
};
  // ==========================================
  // LOAD ON PAGE OPEN
  // ==========================================

  

  useEffect(() => {
    fetchPaymentSettings();
    fetchCommissionSettings();
    fetchAdminProfile();
  }, []);


  // ==========================================
// CHANGE ADMIN EMAIL
// ==========================================

const handleChangeEmail = async () => {
  try {
    setSavingEmail(true);
    setAccountError("");

    if (!emailData.newEmail) {
      alert("Please enter a new email address.");
      return;
    }

    if (!emailData.password) {
      alert("Please enter your current password.");
      return;
    }

    const res = await axios.put(
      "/admin/change-email",
      {
        email: emailData.newEmail,
        currentPassword: emailData.password,
      }
    );

    alert(
      res.data?.message ||
      "Email changed successfully."
    );

    setAdminEmail(
      res.data?.email || emailData.newEmail
    );

    setEmailData({
      newEmail: "",
      password: "",
    });

  } catch (error) {
    console.error(
      "CHANGE EMAIL ERROR:",
      error
    );

    const message =
      error.response?.data?.message ||
      "Failed to change email";

    setAccountError(message);

    alert(message);

  } finally {
    setSavingEmail(false);
  }
};

// ==========================================
// CHANGE ADMIN PASSWORD
// ==========================================

const handleChangePassword = async () => {
  try {
    setSavingPassword(true);
    setAccountError("");

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setAccountError("Please fill all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    const res = await axios.put(
      "/admin/change-password",
      {
        currentPassword,
        newPassword,
        confirmPassword,
      }
    );

    alert(
      res.data?.message ||
      "Password changed successfully."
    );

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  } catch (error) {
    console.error(
      "CHANGE PASSWORD ERROR:",
      error
    );

    const message =
      error.response?.data?.message ||
      "Failed to change password";

    setAccountError(message);

  } finally {
    setSavingPassword(false);
  }
};


  // ==========================================
// COMMISSION INPUT CHANGE
// ==========================================

const handleCommissionChange = (e) => {
  const { name, value } = e.target;

  setCommissionSettings((prev) => ({
    ...prev,
    [name]: value,
  }));
};

// ==========================================
// SAVE COMMISSION SETTINGS
// ==========================================

const handleSaveCommission = async () => {
  try {
    setSavingCommission(true);
    setCommissionError("");

    const res = await axios.put(
      "/admin/commission-settings",
      {
        commissionRate: Number(
          commissionSettings.commissionRate
        ),
      }
    );

    const settings = res.data?.settings;

    if (settings) {
      setCommissionSettings({
        commissionRate: settings.commissionRate ?? "",
      });
    }

    alert("Commission rate saved successfully.");

  } catch (error) {
    console.error(
      "SAVE COMMISSION SETTINGS ERROR:",
      error
    );

    const message =
      error.response?.data?.message ||
      "Failed to save commission settings";

    setCommissionError(message);

    alert(message);

  } finally {
    setSavingCommission(false);
  }
};

  // ==========================================
  // PAYMENT INPUT CHANGE
  // ==========================================

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;

    setPaymentSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // QR IMAGE CHANGE
  // ==========================================

  const handleQrChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("QR image should be less than 10MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setQrPreview(previewUrl);

    setPaymentSettings((prev) => ({
      ...prev,
      qrCode: file,
    }));
  };

  // ==========================================
  // SAVE PAYMENT SETTINGS
  // ==========================================

  const handleSavePayment = async () => {
    try {
      setSavingPayment(true);
      setPaymentError("");

      const formData = new FormData();

      formData.append(
        "accountName",
        paymentSettings.accountName
      );

      formData.append(
        "accountNumber",
        paymentSettings.accountNumber
      );

      formData.append(
        "ifscCode",
        paymentSettings.ifscCode
      );

      formData.append(
        "bankName",
        paymentSettings.bankName
      );

      formData.append(
        "upiId",
        paymentSettings.upiId
      );

      if (paymentSettings.qrCode instanceof File) {
        formData.append(
          "qrCode",
          paymentSettings.qrCode
        );
      }

      const res = await axios.put(
        "/admin/payment-settings",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const settings = res.data?.settings;

      if (settings) {
        setPaymentSettings({
          accountName: settings.accountName || "",
          accountNumber: settings.accountNumber || "",
          ifscCode: settings.ifscCode || "",
          bankName: settings.bankName || "",
          upiId: settings.upiId || "",
          qrCode: settings.qrCode || "",
        });

        if (settings.qrCode) {
          setQrPreview(settings.qrCode);
        }
      }

      alert("Payment settings saved successfully.");
    } catch (error) {
      console.error(
        "SAVE PAYMENT SETTINGS ERROR:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Failed to save payment settings";

      setPaymentError(message);

      alert(message);
    } finally {
      setSavingPayment(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50/70 px-1 py-1">
      <div className="space-y-6">

        {/* ==========================================
            PAGE HEADER
        ========================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                <SettingsIcon className="h-5 w-5 text-slate-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Settings
                </h1>

                <p className="mt-0.5 text-sm text-slate-500">
                  Configure platform settings and preferences
                </p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 sm:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />

            <span className="text-xs font-semibold text-emerald-700">
              Admin Configuration
            </span>
          </div>

        </div>

        {/* ==========================================
            TABS
        ========================================== */}

        <Tabs
          defaultValue="general"
          className="space-y-6"
        >

          <TabsList className="h-auto w-full justify-start gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:w-fit">

            <TabsTrigger
              value="general"
              className="gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Building2 className="h-4 w-4" />
              General
            </TabsTrigger>

            <TabsTrigger
  value="account"
  className="gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
>
  <ShieldCheck className="h-4 w-4" />
  Account & Security
</TabsTrigger>

            <TabsTrigger
              value="payment"
              className="gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <CreditCard className="h-4 w-4" />
              Payment
            </TabsTrigger>

            <TabsTrigger
              value="commission"
              className="gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Percent className="h-4 w-4" />
              Commission
            </TabsTrigger>

          </TabsList>

          {/* ==========================================
              GENERAL
          ========================================== */}

          <TabsContent
            value="general"
            className="mt-0 space-y-5"
          >

            <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900">
                      Platform Settings
                    </CardTitle>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Manage your platform identity and support information
                    </p>
                  </div>

                </div>

              </CardHeader>

              <CardContent className="space-y-5 p-5 sm:p-6">

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <div className="space-y-2">

                    <Label
                      htmlFor="platform-name"
                      className="text-sm font-medium text-slate-700"
                    >
                      Platform Name
                    </Label>

                    <Input
                      id="platform-name"
                      defaultValue="PronexWorld"
                      className="h-11 rounded-xl border-slate-200 bg-white text-slate-800 shadow-none focus:border-blue-400 focus:ring-blue-100"
                    />

                  </div>

                  <div className="space-y-2">

                    <Label
                      htmlFor="support-email"
                      className="flex items-center gap-2 text-sm font-medium text-slate-700"
                    >
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      Support Email
                    </Label>

                    <Input
                      id="support-email"
                      type="email"
                      defaultValue="support@pronexworld.com"
                      className="h-11 rounded-xl border-slate-200 bg-white text-slate-800 shadow-none focus:border-blue-400 focus:ring-blue-100"
                    />

                  </div>

                </div>

                <div className="flex justify-end border-t border-slate-100 pt-5">

                  <Button className="h-10 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>

                </div>

              </CardContent>



            </Card>

          </TabsContent>


          {/* ==========================================
    ACCOUNT & SECURITY
========================================== */}

<TabsContent
  value="account"
  className="mt-0 space-y-5"
>

  <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

    {/* HEADER */}

    <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
        </div>

        <div>
          <CardTitle className="text-base font-semibold text-slate-900">
            Admin Account Security
          </CardTitle>

          <p className="mt-0.5 text-xs text-slate-500">
            Manage your admin email and password securely
          </p>
        </div>

      </div>

    </CardHeader>


    <CardContent className="space-y-8 p-5 sm:p-6">

      {/* ERROR */}

      {accountError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Something went wrong
            </p>

            <p className="mt-0.5 text-xs text-red-600">
              {accountError}
            </p>
          </div>

        </div>
      )}


      {/* ========================================= */}
      {/* CHANGE EMAIL */}
      {/* ========================================= */}

      <div className="rounded-2xl border border-slate-200">

        <div className="border-b border-slate-100 bg-blue-50/50 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Change Email Address
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Update the email used for your admin account
              </p>
            </div>

          </div>

        </div>


        <div className="space-y-5 p-5">

          <div className="rounded-xl bg-slate-50 px-4 py-3">

            <p className="text-xs text-slate-500">
              Current Email
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {adminEmail || "Loading..."}
            </p>

          </div>


          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div className="space-y-2">

              <Label className="text-sm font-medium text-slate-700">
                New Email Address
              </Label>

              <Input
                type="email"
                value={emailData.newEmail}
                onChange={(e) =>
                  setEmailData((prev) => ({
                    ...prev,
                    newEmail: e.target.value,
                  }))
                }
                placeholder="Enter new email"
                className="h-11 rounded-xl border-slate-200"
              />

            </div>


            <div className="space-y-2">

              <Label className="text-sm font-medium text-slate-700">
                Current Password
              </Label>

              <Input
                type="password"
                value={emailData.password}
                onChange={(e) =>
                  setEmailData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                placeholder="Enter current password"
                className="h-11 rounded-xl border-slate-200"
              />

            </div>

          </div>


          <div className="flex justify-end">

            <Button
              onClick={handleChangeEmail}
              disabled={savingEmail}
              className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
            >

              {savingEmail ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Update Email
                </>
              )}

            </Button>

          </div>

        </div>

      </div>


      {/* ========================================= */}
      {/* CHANGE PASSWORD */}
      {/* ========================================= */}

      <div className="rounded-2xl border border-slate-200">

        <div className="border-b border-slate-100 bg-amber-50/50 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <Lock className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Change Password
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Use a strong password to keep your account secure
              </p>
            </div>

          </div>

        </div>


        <div className="space-y-5 p-5">

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            <div className="space-y-2">

              <Label className="text-sm font-medium text-slate-700">
                Current Password
              </Label>

              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="Current password"
                className="h-11 rounded-xl border-slate-200"
              />

            </div>


            <div className="space-y-2">

  <Label className="text-sm font-medium text-slate-700">
    New Password
  </Label>

  <Input
    type="password"
    value={passwordData.newPassword}
    onChange={(e) =>
      setPasswordData((prev) => ({
        ...prev,
        newPassword: e.target.value,
      }))
    }
    placeholder="New password"
    className={`h-11 rounded-xl ${
      passwordData.confirmPassword
        ? passwordData.newPassword ===
          passwordData.confirmPassword
          ? "border-emerald-400 focus:border-emerald-500"
          : "border-red-400 focus:border-red-500"
        : "border-slate-200"
    }`}
  />

  {/* Password Match Status */}
  {/* {passwordData.confirmPassword && (
    <p
      className={`text-xs font-medium ${
        passwordData.newPassword ===
        passwordData.confirmPassword
          ? "text-emerald-600"
          : "text-red-500"
      }`}
    >
      {passwordData.newPassword ===
      passwordData.confirmPassword
        ? "✓ Passwords match"
        : "✕ Passwords do not match"}
    </p>
  )} */}

</div>


<div className="space-y-2">

<Label className="text-sm font-medium text-slate-700">
  Confirm New Password
</Label>

<Input
  type="password"
  value={passwordData.confirmPassword}
  onChange={(e) =>
    setPasswordData((prev) => ({
      ...prev,
      confirmPassword: e.target.value,
    }))
  }
  placeholder="Confirm new password"
  className={`h-11 rounded-xl ${
    passwordData.confirmPassword
      ? passwordData.newPassword ===
        passwordData.confirmPassword
        ? "border-emerald-400 focus:border-emerald-500"
        : "border-red-400 focus:border-red-500"
      : "border-slate-200"
  }`}
/>

{/* Validation directly below Confirm Password */}
{passwordData.confirmPassword && (
  <p
    className={`text-xs font-medium ${
      passwordData.newPassword ===
      passwordData.confirmPassword
        ? "text-emerald-600"
        : "text-red-500"
    }`}
  >
    {passwordData.newPassword ===
    passwordData.confirmPassword
      ? "✓ Passwords match"
      : "✕ Passwords do not match"}
  </p>
)}

</div>

          </div>


          <div className="flex justify-end">

            <Button
              onClick={handleChangePassword}
              disabled={savingPassword}
              className="h-10 rounded-xl bg-amber-600 px-5 text-sm font-semibold text-white hover:bg-amber-700"
            >

              {savingPassword ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}

            </Button>

          </div>

        </div>

      </div>

    </CardContent>

  </Card>

</TabsContent>

          {/* ==========================================
              PAYMENT
          ========================================== */}

          <TabsContent
            value="payment"
            className="mt-0 space-y-5"
          >

            {/* Payment Header */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Landmark className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-blue-600">
                      Bank Transfer
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      Bank Details
                    </p>
                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <WalletCards className="h-5 w-5 text-violet-600" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-violet-600">
                      Digital Payment
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      UPI Details
                    </p>
                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <QrCode className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-emerald-600">
                      QR Payment
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      Scan & Pay
                    </p>
                  </div>

                </div>

              </div>

            </div>

            <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <CardTitle className="text-base font-semibold text-slate-900">
                        Payment Configuration
                      </CardTitle>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Manage payment details shown to investors
                      </p>
                    </div>

                  </div>

                  {loadingPayment && (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Loading
                    </div>
                  )}

                </div>

              </CardHeader>

              <CardContent className="p-5 sm:p-6">

                {/* ERROR */}

                {paymentError && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        Something went wrong
                      </p>

                      <p className="mt-0.5 text-xs text-red-600">
                        {paymentError}
                      </p>
                    </div>

                  </div>
                )}

                {/* BANK SECTION */}

                <div className="rounded-2xl border border-slate-200 bg-white">

                  <div className="border-b border-slate-100 bg-blue-50/50 px-4 py-4 sm:px-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                        <Landmark className="h-4 w-4 text-blue-600" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Bank Transfer Details
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Investors will see these details when they choose Bank Transfer.
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-5">

                    <div className="space-y-2">
                      <Label
                        htmlFor="accountName"
                        className="text-sm font-medium text-slate-700"
                      >
                        Account Name
                      </Label>

                      <Input
                        id="accountName"
                        name="accountName"
                        value={paymentSettings.accountName}
                        onChange={handlePaymentChange}
                        placeholder="Enter account name"
                        className="h-11 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="accountNumber"
                        className="text-sm font-medium text-slate-700"
                      >
                        Account Number
                      </Label>

                      <Input
                        id="accountNumber"
                        name="accountNumber"
                        value={paymentSettings.accountNumber}
                        onChange={handlePaymentChange}
                        placeholder="Enter account number"
                        className="h-11 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="ifscCode"
                        className="text-sm font-medium text-slate-700"
                      >
                        IFSC Code
                      </Label>

                      <Input
                        id="ifscCode"
                        name="ifscCode"
                        value={paymentSettings.ifscCode}
                        onChange={handlePaymentChange}
                        placeholder="Enter IFSC code"
                        className="h-11 rounded-xl border-slate-200 uppercase focus:border-blue-400 focus:ring-blue-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="bankName"
                        className="text-sm font-medium text-slate-700"
                      >
                        Bank Name
                      </Label>

                      <Input
                        id="bankName"
                        name="bankName"
                        value={paymentSettings.bankName}
                        onChange={handlePaymentChange}
                        placeholder="Enter bank name"
                        className="h-11 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                      />
                    </div>

                  </div>

                </div>

                {/* UPI SECTION */}

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white">

                  <div className="border-b border-slate-100 bg-violet-50/50 px-4 py-4 sm:px-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                        <WalletCards className="h-4 w-4 text-violet-600" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          UPI Payment Details
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Configure the UPI ID and QR code used for investor payments.
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="space-y-6 p-4 sm:p-5">

                    <div className="max-w-xl space-y-2">

                      <Label
                        htmlFor="upiId"
                        className="text-sm font-medium text-slate-700"
                      >
                        UPI ID
                      </Label>

                      <Input
                        id="upiId"
                        name="upiId"
                        value={paymentSettings.upiId}
                        onChange={handlePaymentChange}
                        placeholder="example@upi"
                        className="h-11 rounded-xl border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                      />

                    </div>

                    {/* QR UPLOAD */}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_220px]">

                      <div>

                        <Label className="text-sm font-medium text-slate-700">
                          Payment QR Code
                        </Label>

                        <p className="mt-1 text-xs text-slate-500">
                          Upload the QR code that investors should scan for UPI payment.
                        </p>

                        <label
                          htmlFor="qrCode"
                          className="mt-4 flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-5 py-6 text-center transition hover:border-violet-300 hover:bg-violet-50/30"
                        >

                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                            <Upload className="h-5 w-5 text-violet-600" />
                          </div>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            Upload QR Code
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            PNG, JPG or WEBP · Max 10MB
                          </p>

                          <input
                            id="qrCode"
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={handleQrChange}
                            className="hidden"
                          />

                        </label>

                      </div>

                      {/* QR PREVIEW */}

                      <div>

                        <p className="text-sm font-medium text-slate-700">
                          QR Preview
                        </p>

                        <div className="mt-3 flex h-[220px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-3">

                          {qrPreview ? (
                            <div className="flex h-full w-full items-center justify-center rounded-xl bg-white p-3 shadow-sm">

                              <img
                                src={qrPreview}
                                alt="Payment QR Code"
                                className="h-full w-full object-contain rounded-lg"
                              />

                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center">

                              <QrCode className="h-10 w-10 text-slate-300" />

                              <p className="mt-2 text-xs font-medium text-slate-400">
                                No QR uploaded
                              </p>

                            </div>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* SAVE */}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-xs text-slate-400">
                    Payment details are displayed to investors during payment.
                  </p>

                  <Button
                    onClick={handleSavePayment}
                    disabled={
                      savingPayment ||
                      loadingPayment
                    }
                    className="h-10 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                  >
                    {savingPayment ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Payment Settings
                      </>
                    )}
                  </Button>

                </div>

              </CardContent>

            </Card>

          </TabsContent>

          {/* ==========================================
              COMMISSION
          ========================================== */}

          <TabsContent
            value="commission"
            className="mt-0 space-y-5"
          >

            <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                    <Percent className="h-5 w-5 text-amber-600" />
                  </div>

                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900">
                      Commission Rules
                    </CardTitle>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Configure broker, platform and referral fee percentages
                    </p>
                  </div>

                </div>

              </CardHeader>

              <CardContent className="p-5 sm:p-6">

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                  {/* BROKER */}

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">

                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                      <Percent className="h-4 w-4 text-blue-600" />
                    </div>

                    <Label
                      htmlFor="broker-commission"
                      className="text-sm font-semibold text-slate-800"
                    >
                      Broker Commission
                    </Label>

                    <p className="mt-1 text-xs text-slate-500">
                      Commission paid to brokers on eligible transactions.
                    </p>

                    <div className="relative mt-4">

                    <Input
  id="broker-commission"
  name="commissionRate"
  type="number"
  min="0"
  max="100"
  value={commissionSettings.commissionRate}
  onChange={handleCommissionChange}
  disabled={loadingCommission}
  className="h-11 rounded-xl border-blue-100 bg-white pr-10"
/>

                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        %
                      </span>

                    </div>

                  </div>

                  {/* PLATFORM

                  <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4">

                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                      <CreditCard className="h-4 w-4 text-violet-600" />
                    </div>

                    <Label
                      htmlFor="platform-fee"
                      className="text-sm font-semibold text-slate-800"
                    >
                      Platform Fee
                    </Label>

                    <p className="mt-1 text-xs text-slate-500">
                      Fee retained by the platform on applicable transactions.
                    </p>

                    <div className="relative mt-4">

                    <Input
  id="platform-fee"
  name="platformFee"
  type="number"
  step="0.01"
  value={commissionSettings.platformFee}
  onChange={handleCommissionChange}
  disabled={loadingCommission}
  className="h-11 rounded-xl border-violet-100 bg-white pr-10"
/>

                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        %
                      </span>

                    </div>

                  </div> */}

                  {/* REFERRAL */}

                  {/* <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">

                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                      <WalletCards className="h-4 w-4 text-emerald-600" />
                    </div>

                    <Label
                      htmlFor="referral-bonus"
                      className="text-sm font-semibold text-slate-800"
                    >
                      Referral Bonus
                    </Label>

                    <p className="mt-1 text-xs text-slate-500">
                      Bonus percentage applied to eligible referral activity.
                    </p>

                    <div className="relative mt-4">

                    <Input
  id="referral-bonus"
  name="referralBonus"
  type="number"
  step="0.01"
  value={commissionSettings.referralBonus}
  onChange={handleCommissionChange}
  disabled={loadingCommission}
  className="h-11 rounded-xl border-emerald-100 bg-white pr-10"
/>

                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        %
                      </span>

                    </div>

                  </div> */}

                </div>

                <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">

                <Button
  onClick={handleSaveCommission}
  disabled={
    savingCommission ||
    loadingCommission
  }
  className="h-10 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
>
  {savingCommission ? (
    <>
      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    <>
      <Save className="mr-2 h-4 w-4" />
      Save Changes
    </>
  )}
</Button>

                </div>

              </CardContent>

            </Card>

          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}