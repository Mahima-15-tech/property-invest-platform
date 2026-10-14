import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { Card } from "../components/ui/card";

import { Button } from "../components/ui/button";

import { Input } from "../components/ui/input";

import { Label } from "../components/ui/label";

import { Textarea } from "../components/ui/textarea";

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from "../components/ui/select";

import { Progress } from "../components/ui/progress";

import { 

  Check, 

  ChevronLeft, 

  Upload, 

  Building2, 

  MapPin, 

  Coins, 

  FileText, 

  Sparkles, 

  Video, 

  Image as ImageIcon,

  CheckCircle2,

  Navigation,

  ArrowRight,

  StickyNote

} from "lucide-react";

import { toast } from "sonner";

import { createProperty } from "../../api/property";

const steps = [

  { id: 1, name: "Basic Info", completed : false },

  { id: 2, name: "Details", completed : false },

  { id: 3, name: "Media", completed : false },     

  { id: 4, name: "Amenities", completed : false }, 

  { id: 5, name: "Location", completed : false },  

  { id: 6, name: "Investment", completed : false },

  { id: 7, name: "Preview", completed : false },

];

export function PropertyCreate() {

  const [currentStep, setCurrentStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({

    name: "",

    type: "",

    description: "",

    city: "",

    state: "",

    address: "",

    street: "",

    landmark: "",

    pincode: "",

    amenities: [],

    totalValue: "",

    totalShares: "",

    pricePerShare: "",

    expectedROI: "",

    duration: "",

    shareBuyingCycle: 10,

// enableFullOwnership: false,

    images: [],

    video: null,

    brochure: null,

    documents: [],

    uploading: false,

    progress: 0,

    highlights: [],

    nearby: [],

    tenants: "",

    propertyGrade: "",

    dueDiligenceNote: "",
    legalDocumentTitle: "Property Legal Document",
    legalDocumentContent: "",
    noteValidated: false,

size: "",

  });

  const navigate = useNavigate();

  const [noteOpen, setNoteOpen] = useState(false);

const [noteDraft, setNoteDraft] = useState("");
  const [legalDocOpen, setLegalDocOpen] = useState(false);
  const [legalDocTitleDraft, setLegalDocTitleDraft] = useState("Property Legal Document");
  const [legalDocContentDraft, setLegalDocContentDraft] = useState("");

  const defaultLegalTemplate = `PROPERTY LEGAL DOCUMENT

Property Name: [Enter property name]
Property Address: [Enter full property address]
Document Date: [Enter date]

1. PROPERTY DETAILS
Describe the property and the relevant ownership or title details.

2. OWNERSHIP AND TITLE
Enter verified ownership details and reference the supporting title documents.

3. DUE DILIGENCE
List the due diligence checks completed, pending items, and the documents reviewed.

4. APPROVALS AND REGISTRATION
Enter applicable registration, permit, approval, and compliance details.

5. IMPORTANT DISCLOSURES
Add material disclosures, limitations, encumbrances, or other relevant information.

6. SUPPORTING DOCUMENTS
List the supporting documents attached to this property listing.

7. DECLARATION
The information in this document should be checked against original records and approved by the appropriate legal professional before being relied upon.

Prepared by: [Name / Organisation]
Reviewed by: [Name / Role]
Date: [DD/MM/YYYY]`;

  const openLegalDocument = () => {
    setLegalDocTitleDraft(formData.legalDocumentTitle || "Property Legal Document");
    setLegalDocContentDraft(formData.legalDocumentContent || defaultLegalTemplate.replace("[Enter property name]", formData.name || "[Enter property name]").replace("[Enter full property address]", formData.address || "[Enter full property address]"));
    setLegalDocOpen(true);
  };

  const saveLegalDocument = () => {
    if (!legalDocTitleDraft.trim()) return toast.error("Please enter a document title");
    if (legalDocContentDraft.trim().length < 20) return toast.error("Please add more content to the legal document");
    setFormData((prev) => ({
      ...prev,
      legalDocumentTitle: legalDocTitleDraft.trim(),
      legalDocumentContent: legalDocContentDraft.trim(),
    }));
    setLegalDocOpen(false);
    toast.success("Legal document saved with property details");
  };

  const downloadLegalDocumentDraft = () => {
    const content = `${formData.legalDocumentTitle || legalDocTitleDraft}\n\n${formData.legalDocumentContent || legalDocContentDraft}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(formData.legalDocumentTitle || legalDocTitleDraft || "legal-document").replace(/[^a-z0-9-_]/gi, "-")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

const openNote = () => {

  setNoteDraft(formData.dueDiligenceNote || "");

  setNoteOpen(true);

};

const saveAndValidateNote = () => {

  const text = noteDraft.trim();

  if (text.length < 10) {

    return toast.error("Note should be atleast of 10 characters");

  }

  setFormData((prev) => ({

    ...prev,

    dueDiligenceNote: text,

    noteValidated: true,

  }));

  setNoteOpen(false);

  toast.success("Due Diligence note saved ✅");

};

  const validateStep = () => {

    switch (currentStep) {

      case 1:

        if (!formData.name || !formData.type || !formData.size) {

          toast.error("Fill all basic info");

          return false;

        }

        break;

      case 2:

        if (!formData.description) {

          toast.error("Description required");

          return false;

        }

        break;

      case 3:

        if (formData.images.length < 3) {

          toast.error("Min 3 images required");

          return false;

        }

        break;

      case 4:

        if (!formData.amenities.length) {

          toast.error("Select amenities");

          return false;

        }

        break;

      case 5:

        if (!formData.city || !formData.state || !formData.address) {

          toast.error("Complete location details");

          return false;

        }

        break;

      case 6:

        if (!formData.totalValue || !formData.totalShares) {

          toast.error("Fill investment details");

          return false;

        }

        break;

    }

    return true;

  };

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {

    const valid = validateStep();

    if (!valid) return;

    if (currentStep < steps.length) {

      setCurrentStep(currentStep + 1);

    }

  };

  const handlePrevious = () => {

    if (currentStep > 1) {

      setCurrentStep(currentStep - 1);

    }

  };

  const handleSubmit = async () => {

    const valid = validateStep();

    if (!valid) return;

    setLoading(true);

    try {

      const token = localStorage.getItem("token");

      const form = new FormData();

      // BASIC

      form.append("name", formData.name);

      form.append("type", formData.type);

      form.append("size", formData.size);

      form.append("description", formData.description);

      // LOCATION

      form.append("city", formData.city);

      form.append("state", formData.state);

      form.append("address", formData.address);

      form.append("amenities", JSON.stringify(formData.amenities));

      // INVESTMENT

      form.append("totalValue", formData.totalValue);

      form.append("totalShares", formData.totalShares);

      form.append("expectedROI", formData.expectedROI);

      form.append("duration", formData.duration);

      // SHARE SETTINGS

form.append("shareBuyingCycle", formData.shareBuyingCycle);

// form.append(

//   "enableFullOwnership",

//   String(formData.enableFullOwnership)

// );

      form.append("tenants", formData.tenants);

      form.append("propertyGrade", formData.propertyGrade);

      form.append("highlights", JSON.stringify(formData.highlights));

      form.append("pricePerShare", formData.pricePerShare);

      form.append("dueDiligenceNote", formData.dueDiligenceNote || "");
      form.append("legalDocumentTitle", formData.legalDocumentTitle || "");
      form.append("legalDocumentContent", formData.legalDocumentContent || "");

      formData.images.forEach((img) => {

        form.append("images", img);

      });

      if (formData.video) {

        form.append("video", formData.video);

      }

      if (formData.brochure) {

        form.append("brochure", formData.brochure);

      }

      formData.documents.forEach(doc => {

        form.append("documents", doc);

      });

      const response = await createProperty(form);

      console.log("✅ RESPONSE:", response); 

      toast.success("Property Created");

      navigate("/properties");

    } catch (err) {

      console.log(err);

      toast.error("Error creating property");

    } finally {

      setLoading(false);

    }

  };

  const updateFormData = (field, value) => {

    const updated = { ...formData, [field]: value };

    if (field === "totalValue" || field === "totalShares") {

      const total =

        field === "totalValue"

          ? parseFloat(value)

          : parseFloat(formData.totalValue);

      const shares =

        field === "totalShares"

          ? parseFloat(value)

          : parseFloat(formData.totalShares);

      if (total && shares) {

        updated.pricePerShare = (total / shares).toFixed(2);

      }

    }

    setFormData(updated);

  };

  return (

    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">

      {/* HEADER */}

      <div className="flex items-center gap-4 border-b border-slate-100 pb-5">

        <Button 

          variant="outline" 

          size="icon" 

          onClick={() => navigate("/properties")}

          className="rounded-xl border-slate-200 hover:bg-slate-50 transition"

        >

          <ChevronLeft className="h-5 w-5 text-slate-600" />

        </Button>

        <div>

          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">

            <Building2 className="w-3.5 h-3.5" /> Property Onboarding

          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">

            Create New Property

          </h1>

        </div>

      </div>

      {/* MAIN CARD CONTAINER */}

      <Card className="p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm bg-white">

        {/* STEP PROGRESS HEADER */}

        <div className="space-y-4 mb-8">

          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">

            <span className="text-slate-900">

              Step {currentStep} <span className="text-slate-400 font-normal">of {steps.length}</span> — <span className="text-blue-600">{steps[currentStep - 1].name}</span>

            </span>

            <span className="text-slate-500 font-mono">{Math.round(progress)}% Complete</span>

          </div>

          <Progress value={progress} className="h-1.5 bg-slate-100" />

          {/* STEPPER ICONS BAR */}

          <div className="grid grid-cols-7 gap-1 pt-4 border-t border-slate-50">

            {steps.map((step) => {

              const isCurrent = step.id === currentStep;

              const isPassed = step.id < currentStep;

              return (

                <div

                  key={step.id}

                  className={`flex flex-col items-center gap-1.5 transition-all ${

                    isCurrent || isPassed ? "opacity-100" : "opacity-30"

                  }`}

                >

                  <div

                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${

                      isPassed

                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"

                        : isCurrent

                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 ring-4 ring-slate-100"

                        : "bg-slate-100 text-slate-500"

                    }`}

                  >

                    {isPassed ? (

                      <Check className="h-4 w-4 stroke-[2.5]" />

                    ) : (

                      step.id

                    )}

                  </div>

                  <span className="text-[10px] sm:text-xs font-medium text-slate-600 hidden sm:block truncate max-w-full">

                    {step.name}

                  </span>

                </div>

              );

            })}

          </div>

        </div>

        {/* STEP CONTENT BODY */}

        <div className="min-h-[280px]">

          {/* STEP 1: BASIC INFO */}

          {currentStep === 1 && (

            <div className="space-y-5">

              <div className="space-y-1.5">

                <Label className="text-xs font-semibold text-slate-700">Property Name *</Label>

                <Input

                  placeholder="e.g. Manhattan Tower Residences"

                  value={formData.name}

                  onChange={(e) => updateFormData("name", e.target.value)}

                  className="h-10 rounded-xl border-slate-200 focus:border-blue-500 text-sm"

                />

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="space-y-1.5">

                  <Label className="text-xs font-semibold text-slate-700">Property Type *</Label>

                  <Select

                    value={formData.type}

                    onValueChange={(value) => updateFormData("type", value)}

                  >

                    <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">

                      <SelectValue placeholder="Select asset type" />

                    </SelectTrigger>

                    <SelectContent className="rounded-xl border-slate-100">

                      <SelectItem value="residential">Residential</SelectItem>

                      <SelectItem value="commercial">Commercial</SelectItem>

                      <SelectItem value="mixed">Mixed Use</SelectItem>

                      <SelectItem value="industrial">Industrial</SelectItem>

                    </SelectContent>

                  </Select>

                </div>

                <div className="space-y-1.5">

                  <Label className="text-xs font-semibold text-slate-700">Property Size *</Label>

                  <Input

                    placeholder="e.g. 1,200 sqft"

                    value={formData.size}

                    onChange={(e) => updateFormData("size", e.target.value)}

                    className="h-10 rounded-xl border-slate-200 focus:border-blue-500 text-sm"

                  />

                </div>

              </div>

            </div>

          )}

          {/* STEP 2: DETAILS */}

          {currentStep === 2 && (

            <div className="space-y-5">

              <div className="space-y-1.5">

                <Label className="text-xs font-semibold text-slate-700">Description *</Label>

                <Textarea

                  rows={5}

                  placeholder="Provide a comprehensive breakdown of the real estate asset..."

                  value={formData.description}

                  onChange={(e) => updateFormData("description", e.target.value)}

                  className="rounded-xl border-slate-200 focus:border-blue-500 text-sm resize-none"

                />

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="space-y-1.5">

                  <Label className="text-xs font-semibold text-slate-700">Active Tenants</Label>

                  <Input

                    placeholder="e.g. 3 Anchor Tenants"

                    value={formData.tenants || ""}

                    onChange={(e) => updateFormData("tenants", e.target.value)}

                    className="h-10 rounded-xl border-slate-200 text-sm"

                  />

                </div>

                <div className="space-y-1.5">

                  <Label className="text-xs font-semibold text-slate-700">Property Grade</Label>

                  <Input

                    placeholder="e.g. Grade-A Commercial"

                    value={formData.propertyGrade || ""}

                    onChange={(e) => updateFormData("propertyGrade", e.target.value)}

                    className="h-10 rounded-xl border-slate-200 text-sm"

                  />

                </div>

              </div>

              <div className="space-y-1.5">

                <Label className="text-xs font-semibold text-slate-700">Highlights (Comma Separated)</Label>

                <Input

                  placeholder="e.g. Prime Location, High Rental Yield, 100% Power Backup"

                  value={formData.highlights.join(", ") || ""}

                  onChange={(e) =>

                    updateFormData(

                      "highlights",

                      e.target.value.split(",").map(i => i.trim())

                    )

                  }

                  className="h-10 rounded-xl border-slate-200 text-sm"

                />

              </div>

            </div>

          )}

          {/* STEP 3: MEDIA */}

          {currentStep === 3 && (

            <div className="space-y-6">

              {/* IMAGES */}

              <div className="space-y-2">

                <div className="flex items-center justify-between">

                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">

                    <ImageIcon className="w-4 h-4 text-slate-400" />

                    Property Gallery Images (Min 3 - Max 5)

                  </Label>

                  {formData.images.length > 0 && (

                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">

                      {formData.images.length} File(s) attached

                    </span>

                  )}

                </div>

                <div className="border-2 border-dashed border-slate-200 hover:border-slate-400 transition rounded-2xl p-6 text-center bg-slate-50/50">

                  <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />

                  <p className="text-xs text-slate-600 font-medium">Drag and drop high-res property photos here</p>

                  <p className="text-[11px] text-slate-400 mt-0.5 mb-3">PNG, JPG or WEBP up to 10MB each</p>

                  <input

                    type="file"

                    multiple

                    accept="image/*"

                    className="hidden"

                    id="images"

                    onChange={(e) => {

                      const files = Array.from(e.target.files);

                      if (files.length < 3 || files.length > 5) {

                        return toast.error("Min 3 & Max 5 images required");

                      }

                      updateFormData("images", files);

                    }}

                  />

                  <Button

                    type="button"

                    variant="outline"

                    className="h-9 px-4 rounded-xl text-xs font-semibold border-slate-200 bg-white shadow-sm"

                    onClick={() => document.getElementById("images").click()}

                  >

                    Select Photos

                  </Button>

                </div>

              </div>

              {/* VIDEO & BROCHURE GRID */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2">

                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">

                    <Video className="w-4 h-4 text-slate-400" />

                    Property Walkthrough Video

                  </Label>

                  <input

                    type="file"

                    accept="video/*"

                    onChange={(e) => updateFormData("video", e.target.files[0])}

                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"

                  />

                </div>

                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2">

                  <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">

                    <FileText className="w-4 h-4 text-slate-400" />

                    Property Brochure (PDF)

                  </Label>

                  <input

                    type="file"

                    accept=".pdf"

                    onChange={(e) => updateFormData("brochure", e.target.files[0])}

                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"

                  />

                </div>

              </div>

              {/* DOCUMENTS */}

<div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">

  <Label className="text-xs font-semibold text-slate-700">

    Legal Documents & Valuation Certificates

  </Label>

 <div className="flex flex-wrap items-center gap-2">

    {/* Choose File */}

    <label className="inline-flex items-center cursor-pointer">

      <span className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition">

        Choose File

      </span>

      <input

        type="file"

        multiple

        onChange={(e) =>

          updateFormData("documents", Array.from(e.target.files || []))

        }

        className="hidden"

      />

    </label>

    {/* Create / Edit Legal Document */}

    <button

      type="button"

      onClick={openLegalDocument}

      className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 inline-flex items-center gap-1.5 transition"

    >

      <FileText className="w-3.5 h-3.5" />

      {formData.legalDocumentContent ? "Edit Legal Template" : "Create Legal Document"}

    </button>

    {/* File Name */}

    <span className="text-xs text-slate-500">

      {formData.documents?.length > 0

        ? formData.documents.map((file) => file.name).join(", ")

        : "No file chosen"}

    </span>

  </div>

  {/* SAVED NOTE PREVIEW */}

  {formData.dueDiligenceNote && (

    <div className="p-3 rounded-xl bg-white border border-emerald-100">

      <div className="flex items-center justify-between mb-1">

        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">

          Due Diligence Note

        </span>

        {formData.noteValidated && (

          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">

            Validated

          </span>

        )}

      </div>

      <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-4">

        {formData.dueDiligenceNote}

      </p>

    </div>

  )}

</div>

              {/* SAVE MEDIA BUTTON */}

              <div className="flex justify-end pt-2">

                <Button

                  type="button"

                  onClick={() => {

                    setFormData((prev) => ({ ...prev, uploading: true }));

                    let progress = 0;

                    const interval = setInterval(() => {

                      progress += 10;

                      setFormData((prev) => ({ ...prev, progress }));

                      if (progress >= 100) clearInterval(interval);

                    }, 150);

                    setTimeout(() => {

                      setFormData((prev) => ({

                        ...prev,

                        uploading: false,

                        progress: 100,

                      }));

                      toast.success("Media Assets Uploaded ✅");

                    }, 1500);

                  }}

                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold px-5 h-9"

                >

                  Save & Validate Media

                </Button>

              </div>

{/* NOTEPAD MODAL */}

{noteOpen && (

  <div className="fixed inset-0 bg-slate-950/40 flex items-center justify-center z-50 p-4">

    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 p-5 space-y-3">

      <div className="flex items-center gap-2">

        <StickyNote className="w-4 h-4 text-blue-600" />

        <h3 className="font-bold text-slate-900 text-sm">Legal Documents Note</h3>

      </div>

      <p className="text-[11px] text-slate-500">

        Documents ki list, updates, status likhein. Ye website par Due Diligence section me dikhega.

      </p>

      <Textarea

        rows={10}

        autoFocus

        value={noteDraft}

        onChange={(e) => setNoteDraft(e.target.value)}

        placeholder={"1. Title Deed – Verified\n2. Valuation Certificate – Mar 2026\n3. RERA Registration – Pending renewal"}

        className="rounded-xl border-slate-200 text-sm font-mono resize-none"

      />

      <div className="flex items-center justify-between">

        <span className="text-[11px] text-slate-400">{noteDraft.length} characters</span>

        <div className="flex gap-2">

          <Button

            type="button"

            variant="outline"

            onClick={() => setNoteOpen(false)}

            className="h-9 rounded-xl text-xs font-semibold border-slate-200"

          >

            Cancel

          </Button>

          <Button

            type="button"

            onClick={saveAndValidateNote}

            className="h-9 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"

          >

            Save

          </Button>

        </div>

      </div>

    </div>

  </div>

)}

              {/* COMPANY LETTERHEAD LEGAL DOCUMENT MODAL */}
              {legalDocOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[70] p-2 sm:p-5">
                  <div className="bg-white w-full max-w-5xl max-h-[96vh] overflow-hidden rounded-2xl shadow-2xl border border-slate-200 flex flex-col">
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center"><FileText className="h-5 w-5" /></div>
                        <div>
                          <h3 className="font-bold text-slate-900">Company Letterhead Template</h3>
                          <p className="text-xs text-slate-500">Write the legal content inside the official-looking document preview</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setLegalDocOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl px-2" aria-label="Close editor">×</button>
                    </div>

                    <div className="overflow-y-auto bg-slate-100 p-3 sm:p-6">
                      <div className="max-w-[800px] mx-auto mb-3">
                        <Label className="text-xs font-semibold text-slate-700">Document Title</Label>
                        <Input value={legalDocTitleDraft} onChange={(e) => setLegalDocTitleDraft(e.target.value)} placeholder="e.g. Property Legal Disclosure" className="mt-1 rounded-lg bg-white" />
                      </div>

                      {/* A4-like company letterhead page */}
                      <div className="relative max-w-[800px] min-h-[760px] mx-auto bg-white shadow-lg border border-slate-200 px-6 sm:px-12 py-8 sm:py-10 text-slate-800">
                        <div className="flex items-center justify-between gap-4 border-b-2 border-slate-900 pb-5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                              <Building2 className="h-7 w-7" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-lg sm:text-2xl font-black tracking-[0.12em] text-slate-900">PRONEXWORLD</div>
                              <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-slate-500 mt-1">Property & Investment Solutions</div>
                            </div>
                          </div>
                          <div className="text-right text-[10px] sm:text-xs text-slate-500 leading-5 shrink-0">
                            <div className="font-semibold text-slate-700">OFFICIAL DOCUMENT</div>
                            <div>{new Date().toLocaleDateString("en-IN")}</div>
                            <div>Property Records</div>
                          </div>
                        </div>

                        <div className="py-6 text-center">
                          <div className="text-[10px] uppercase tracking-[0.3em] text-blue-700 font-bold">Legal & Due Diligence</div>
                          <h2 className="mt-2 text-lg sm:text-2xl font-bold text-slate-900 break-words">{legalDocTitleDraft || "Property Legal Document"}</h2>
                          <div className="w-20 h-1 bg-blue-700 mx-auto mt-3 rounded-full" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-4 mb-5 text-xs">
                          <div><span className="text-slate-500">Property Name</span><div className="font-semibold text-slate-900 mt-1">{formData.name || "To be specified"}</div></div>
                          <div><span className="text-slate-500">Property Type</span><div className="font-semibold text-slate-900 mt-1 capitalize">{formData.type || "To be specified"}</div></div>
                          <div className="sm:col-span-2"><span className="text-slate-500">Property Address</span><div className="font-semibold text-slate-900 mt-1">{formData.address || "To be specified"}{formData.city ? `, ${formData.city}` : ""}{formData.state ? `, ${formData.state}` : ""}</div></div>
                        </div>

                        <div className="mb-4 flex items-center justify-between gap-3">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Document Content</Label>
                          <span className="text-[10px] text-slate-400">{legalDocContentDraft.length} characters</span>
                        </div>
                        <Textarea
                          rows={18}
                          autoFocus
                          value={legalDocContentDraft}
                          onChange={(e) => setLegalDocContentDraft(e.target.value)}
                          className="min-h-[340px] w-full rounded-none border-0 border-l-2 border-slate-200 bg-white px-4 py-2 font-serif text-sm leading-7 text-slate-800 focus-visible:ring-0 resize-y shadow-none"
                          placeholder="Type the approved legal content here..."
                        />

                        <div className="mt-7 pt-5 border-t border-slate-200 flex items-end justify-between gap-5">
                          <div className="text-[10px] text-slate-500 leading-5 max-w-[65%]">
                            <div className="font-bold text-slate-700 uppercase tracking-wider mb-1">Important Notice</div>
                            This document should be reviewed and approved by an authorised legal professional before publication or execution.
                          </div>
                          <div className="relative h-24 w-24 shrink-0 rounded-full border-2 border-dashed border-blue-700 text-blue-800 flex flex-col items-center justify-center rotate-[-10deg]">
                            <div className="absolute inset-1 rounded-full border border-blue-300" />
                            <Building2 className="h-5 w-5 mb-1" />
                            <span className="text-[8px] font-black tracking-wider">PRONEXWORLD</span>
                            <span className="text-[7px] font-bold tracking-[0.18em] mt-0.5">DOCUMENT SEAL</span>
                          </div>
                        </div>
                        <div className="mt-6 pt-3 border-t-2 border-slate-900 flex items-center justify-between text-[9px] text-slate-400 gap-3">
                          <span>PRONEXWORLD · Property & Investment Solutions</span>
                          <span>Confidential Property Record</span>
                        </div>
                      </div>

                      <div className="max-w-[800px] mx-auto mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 leading-relaxed">
                        This is a visual letterhead/stamp template. The displayed company seal is decorative, not a legally valid signature or stamp. Use your authorised company logo and approved legal wording before publishing.
                      </div>
                    </div>

                    <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
                      <Button type="button" variant="outline" onClick={() => { setLegalDocTitleDraft("Property Legal Document"); setLegalDocContentDraft(defaultLegalTemplate.replace("[Enter property name]", formData.name || "[Enter property name]").replace("[Enter full property address]", formData.address || "[Enter full property address]")); }} className="rounded-xl text-xs">Reset Template</Button>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={downloadLegalDocumentDraft} className="rounded-xl text-xs"><Upload className="h-3.5 w-3.5 mr-1.5" />Download Draft</Button>
                        <Button type="button" variant="outline" onClick={() => setLegalDocOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                        <Button type="button" onClick={saveLegalDocument} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs">Save Document</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PROGRESS MODAL */}

              {formData.uploading && (

                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">

                  <div className="bg-white p-6 rounded-2xl w-full max-w-xs shadow-2xl space-y-3 text-center border border-slate-100">

                    <h3 className="font-bold text-slate-900 text-sm">Uploading Assets...</h3>

                    <Progress value={formData.progress} className="h-2 bg-slate-100" />

                    <p className="text-xs text-slate-500 font-mono">

                      {formData.progress}% Processed

                    </p>

                  </div>

                </div>

              )}

            </div>

          )}

          {/* STEP 4: AMENITIES */}

          {currentStep === 4 && (

            <div className="space-y-3">

              <Label className="text-xs font-semibold text-slate-700">Select Available Property Features</Label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                {[

                  "Gym","Pool","Lift","CCTV","Garden",

                  "Club House","Security","Power Backup"

                ].map((item) => {

                  const active = formData.amenities.includes(item);

                  return (

                    <div

                      key={item}

                      onClick={() => {

                        const updated = active

                          ? formData.amenities.filter(a => a !== item)

                          : [...formData.amenities, item];

                        updateFormData("amenities", updated);

                      }}

                      className={`p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${

                        active

                          ? "border-blue-600 bg-blue-50/60 text-blue-900 shadow-sm"

                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50"

                      }`}

                    >

                      <span>{item}</span>

                      {active && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}

                    </div>

                  );

                })}

              </div>

            </div>

          )}

          {/* STEP 5: LOCATION */}

          {currentStep === 5 && (

            <div className="space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="space-y-1.5">

                  <Label className="text-xs font-semibold text-slate-700">State *</Label>

                  <Input

                    placeholder="e.g. Maharashtra"

                    value={formData.state || ""}

                    onChange={(e) => updateFormData("state", e.target.value)}

                    className="h-10 rounded-xl border-slate-200 text-sm"

                  />

                </div>

                <div className="space-y-1.5">

                  <Label className="text-xs font-semibold text-slate-700">City *</Label>

                  <Input

                    placeholder="e.g. Mumbai"

                    value={formData.city || ""}

                    onChange={(e) => updateFormData("city", e.target.value)}

                    className="h-10 rounded-xl border-slate-200 text-sm"

                  />

                </div>

              </div>

              <div className="space-y-1.5">

                <Label className="text-xs font-semibold text-slate-700">Full Address *</Label>

                <Input

                  placeholder="e.g. Plot No 42, Financial District, Bandra Kurla Complex"

                  value={formData.address || ""}

                  onChange={(e) => updateFormData("address", e.target.value)}

                  className="h-10 rounded-xl border-slate-200 text-sm"

                />

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="space-y-1.5">

                  <Label className="text-xs font-semibold text-slate-700">Street / Area</Label>

                  <Input

                    placeholder="e.g. BKC Main Road"

                    value={formData.street || ""}

                    onChange={(e) => updateFormData("street", e.target.value)}

                    className="h-10 rounded-xl border-slate-200 text-sm"

                  />

                </div>

                <div className="space-y-1.5">

                  <Label className="text-xs font-semibold text-slate-700">Pincode</Label>

                  <Input

                    placeholder="e.g. 400051"

                    value={formData.pincode || ""}

                    onChange={(e) => updateFormData("pincode", e.target.value)}

                    className="h-10 rounded-xl border-slate-200 text-sm"

                  />

                </div>

              </div>

              <div className="space-y-1.5">

                <Label className="text-xs font-semibold text-slate-700">Landmark</Label>

                <Input

                  placeholder="e.g. Opposite ICICI Bank HQ"

                  value={formData.landmark || ""}

                  onChange={(e) => updateFormData("landmark", e.target.value)}

                  className="h-10 rounded-xl border-slate-200 text-sm"

                />

              </div>

              {/* MAP EMBED */}

              <div className="space-y-3 pt-2">

                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">

                  <iframe

                    title="Map Location"

                    width="100%"

                    height="200"

                    className="w-full border-0"

                    src={`https://maps.google.com/maps?q=${formData.lat || 20},${formData.lng || 77}&z=13&output=embed`}

                  />

                </div>

                <div className="flex items-center justify-between gap-2">

                  <Button

                    type="button"

                    variant="outline"

                    onClick={() => {

                      navigator.geolocation.getCurrentPosition((pos) => {

                        updateFormData("lat", pos.coords.latitude);

                        updateFormData("lng", pos.coords.longitude);

                        toast.success("Location Sync Successful 📍");

                      });

                    }}

                    className="h-9 rounded-xl border-slate-200 text-xs font-semibold gap-2"

                  >

                    <Navigation className="w-3.5 h-3.5 text-blue-600" /> Use Current Coordinates

                  </Button>

                  <p className="text-xs font-mono text-slate-400">

                    Lat: {formData.lat || "-"} | Lng: {formData.lng || "-"}

                  </p>

                </div>

              </div>

            </div>

          )}

          {/* STEP 6: INVESTMENT */}

          {/* STEP 6: INVESTMENT */}

{currentStep === 6 && (

  <div className="space-y-6">

    {/* PROPERTY VALUE + TOTAL SHARES */}

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

      <div className="space-y-1.5">

        <Label className="text-xs font-semibold text-slate-700">

          Total Asset Value (₹) *

        </Label>

        <Input

          type="number"

          placeholder="e.g. 50000000"

          value={formData.totalValue}

          onChange={(e) =>

            updateFormData("totalValue", e.target.value)

          }

          className="h-10 rounded-xl border-slate-200 font-mono text-sm"

        />

      </div>

      <div className="space-y-1.5">

        <Label className="text-xs font-semibold text-slate-700">

          Total Property Shares *

        </Label>

        <Input

          type="number"

          placeholder="e.g. 100"

          value={formData.totalShares}

          onChange={(e) =>

            updateFormData("totalShares", e.target.value)

          }

          className="h-10 rounded-xl border-slate-200 font-mono text-sm"

        />

        <p className="text-[11px] text-slate-400">

          Includes 10 company reserved shares

        </p>

      </div>

    </div>

    {/* SHARE BREAKDOWN */}

    {Number(formData.totalShares) > 0 && (

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">

          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">

            Company Reserved

          </p>

          <p className="text-xl font-bold text-slate-900 mt-1">

            10 Shares

          </p>

          <p className="text-[11px] text-slate-500 mt-1">

            Fixed company ownership

          </p>

        </div>

        <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50">

          <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-500">

            Investor Available

          </p>

          <p className="text-xl font-bold text-blue-700 mt-1">

            {Math.max(Number(formData.totalShares) - 10, 0)} Shares

          </p>

          <p className="text-[11px] text-blue-600 mt-1">

            Available for investors

          </p>

        </div>

        <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50">

          <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-500">

            Stakeholder Unit

          </p>

          <p className="text-xl font-bold text-emerald-700 mt-1">

            10 Shares

          </p>

          <p className="text-[11px] text-emerald-600 mt-1">

            = 1 Stakeholder

          </p>

        </div>

      </div>

    )}

    {/* SHARE BUYING CYCLE */}

    <div className="space-y-2">

      <Label className="text-xs font-semibold text-slate-700">

        Share Buying Cycle *

      </Label>

      <p className="text-xs text-slate-500">

        Controls the increment in which investors can purchase shares.

      </p>

      <div className="grid grid-cols-2 gap-3 pt-1">

        <button

          type="button"

          onClick={() =>

            updateFormData("shareBuyingCycle", 5)

          }

          className={`h-14 rounded-xl border text-sm font-semibold transition-all ${

            formData.shareBuyingCycle === 5

              ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"

              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"

          }`}

        >

          5 Shares

        </button>

        <button

          type="button"

          onClick={() =>

            updateFormData("shareBuyingCycle", 10)

          }

          className={`h-14 rounded-xl border text-sm font-semibold transition-all ${

            formData.shareBuyingCycle === 10

              ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"

              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"

          }`}

        >

          10 Shares

        </button>

      </div>

      {/* BUYING RULE INFO */}

      <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100">

        <p className="text-xs font-semibold text-amber-800">

          Minimum Initial Purchase: 10 Shares

        </p>

        <p className="text-[11px] text-amber-700 mt-1">

          {formData.shareBuyingCycle === 5

            ? "Investors can buy 10, 15, 20, 25... shares."

            : "Investors can buy 10, 20, 30, 40... shares."}

        </p>

      </div>

    </div>

    {/* CALCULATED SHARE PRICE */}

    <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">

      <div>

        <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">

          Calculated Share Price

        </p>

        <p className="text-xl font-bold font-mono mt-0.5">

          ₹{formData.pricePerShare || 0}

          <span className="text-xs font-normal text-slate-400">

            {" "} / share

          </span>

        </p>

      </div>

      <div className="p-2 bg-slate-800 rounded-xl">

        <Coins className="w-5 h-5 text-emerald-400" />

      </div>

    </div>

    {/* ROI + LOCK IN */}

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

      <div className="space-y-1.5">

        <Label className="text-xs font-semibold text-slate-700">

          Target ROI (%)

        </Label>

        <Input

          placeholder="e.g. 12.5"

          value={formData.expectedROI || ""}

          onChange={(e) =>

            updateFormData("expectedROI", e.target.value)

          }

          className="h-10 rounded-xl border-slate-200 font-mono text-sm"

        />

      </div>

      <div className="space-y-1.5">

        <Label className="text-xs font-semibold text-slate-700">

          Lock-in Period

        </Label>

        <div className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center text-sm font-semibold text-slate-700">

          2 Years

        </div>

        <p className="text-[11px] text-slate-400">

          Fixed default lock-in period

        </p>

      </div>

    </div>

    {/* 100% OWNERSHIP */}

    {/* <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60">

      <div className="flex items-start justify-between gap-4">

        <div>

          <h3 className="text-sm font-bold text-slate-900">

            Enable 100% Ownership Acquisition

          </h3>

          <p className="text-xs text-slate-500 mt-1 leading-relaxed">

            Allow an eligible investor to request acquisition of all

            remaining property shares.

          </p>

        </div>

        <button

          type="button"

          onClick={() =>

            updateFormData(

              "enableFullOwnership",

              !formData.enableFullOwnership

            )

          }

          className={`relative w-12 h-6 rounded-full transition-all shrink-0 ${

            formData.enableFullOwnership

              ? "bg-blue-600"

              : "bg-slate-300"

          }`}

        >

          <span

            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${

              formData.enableFullOwnership

                ? "left-7"

                : "left-1"

            }`}

          />

        </button>

      </div>

      <div

        className={`mt-4 text-xs font-semibold px-3 py-2 rounded-xl ${

          formData.enableFullOwnership

            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"

            : "bg-slate-100 text-slate-500"

        }`}

      >

        {formData.enableFullOwnership

          ? "100% Ownership Acquisition Enabled"

          : "100% Ownership Acquisition Disabled"}

      </div>

    </div> */}

  </div>

)}

          {/* STEP 7: PREVIEW */}

          {currentStep === 7 && (

            <div className="space-y-6">

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">

                <h2 className="text-base font-bold text-slate-900">Review Listing Details</h2>

                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">

                  Ready to Publish

                </span>

              </div>

              {/* IMAGE GALLERY PREVIEW */}

              {formData.images.length > 0 && (

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">

                  {formData.images.map((img, i) => (

                    <img

                      key={i}

                      src={URL.createObjectURL(img)}

                      alt="Property Preview"

                      className="h-20 w-full object-cover rounded-xl border border-slate-100 shadow-xs"

                    />

                  ))}

                </div>

              )}

              {/* SPECIFICATION GRID */}

              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">

                <div>

                  <span className="text-slate-400 block font-medium">Property Name</span>

                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{formData.name || "-"}</span>

                </div>

                <div>

                  <span className="text-slate-400 block font-medium">Type</span>

                  <span className="font-semibold text-slate-900 mt-0.5 block capitalize">{formData.type || "-"}</span>

                </div>

                <div>

                  <span className="text-slate-400 block font-medium">Size</span>

                  <span className="font-semibold text-slate-900 mt-0.5 block">{formData.size || "-"}</span>

                </div>

                <div>

                  <span className="text-slate-400 block font-medium">City / State</span>

                  <span className="font-semibold text-slate-900 mt-0.5 block">{formData.city}, {formData.state}</span>

                </div>

                <div>

                  <span className="text-slate-400 block font-medium">Total Value</span>

                  <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">₹{Number(formData.totalValue || 0).toLocaleString("en-IN")}</span>

                </div>

                <div>

  <span className="text-slate-400 block font-medium">

    Total Shares

  </span>

  <span className="font-bold text-slate-900 mt-0.5 block">

    {formData.totalShares || 0}

  </span>

</div>

<div>

  <span className="text-slate-400 block font-medium">

    Investor Shares

  </span>

  <span className="font-bold text-blue-600 mt-0.5 block">

    {Math.max(Number(formData.totalShares || 0) - 10, 0)}

  </span>

</div>

<div>

  <span className="text-slate-400 block font-medium">

    Share Buying Cycle

  </span>

  <span className="font-bold text-slate-900 mt-0.5 block">

    {formData.shareBuyingCycle} Shares

  </span>

</div>

<div>

  <span className="text-slate-400 block font-medium">

    Lock-in Period

  </span>

  <span className="font-bold text-slate-900 mt-0.5 block">

    2 Years

  </span>

</div>

{/* <div>

  <span className="text-slate-400 block font-medium">

    Full Ownership

  </span>

  <span

    className={`font-bold mt-0.5 block ${

      formData.enableFullOwnership

        ? "text-emerald-600"

        : "text-slate-500"

    }`}

  >

    {formData.enableFullOwnership

      ? "Enabled"

      : "Disabled"}

  </span>

</div> */}

                <div>

                  <span className="text-slate-400 block font-medium">Target ROI</span>

                  <span className="font-bold text-emerald-600 font-mono text-sm mt-0.5 block">{formData.expectedROI || 0}%</span>

                </div>

                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200/60">

                  <span className="text-slate-400 block font-medium">Address</span>

                  <span className="font-medium text-slate-800 mt-0.5 block">{formData.address || "-"}</span>

                </div>

                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200/60">

                  <span className="text-slate-400 block font-medium">Amenities</span>

                  <span className="font-medium text-slate-800 mt-0.5 block">{formData.amenities.join(", ") || "None"}</span>

                </div>

                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200/60">

                  <span className="text-slate-400 block font-medium">Description</span>

                  <p className="font-normal text-slate-600 mt-0.5 leading-relaxed line-clamp-3">{formData.description || "-"}</p>

                </div>

              </div>

            </div>

          )}

        </div>

        {/* BOTTOM NAV / ACTIONS */}

        <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">

          <Button 

            type="button"

            variant="outline" 

            onClick={handlePrevious} 

            disabled={currentStep === 1}

            className="h-10 px-4 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40"

          >

            Previous

          </Button>

          {currentStep < steps.length ? (

            <Button 

              type="button"

              onClick={handleNext}

              className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm"

            >

              Continue <ArrowRight className="w-3.5 h-3.5" />

            </Button>

          ) : (

            <Button 

              type="button"

              onClick={handleSubmit} 

              disabled={loading}

              className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20"

            >

              {loading ? "Publishing Listing..." : "Create Property"}

            </Button>

          )}

        </div>

      </Card>

    </div>

  );

}