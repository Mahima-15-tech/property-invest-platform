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
<<<<<<< HEAD
import { Check, ChevronLeft, Upload } from "lucide-react";
=======
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
  ArrowRight
} from "lucide-react";
>>>>>>> backup-local
import { toast } from "sonner";
import { createProperty } from "../../api/property";

const steps = [
  { id: 1, name: "Basic Info", completed : false },
  { id: 2, name: "Details", completed : false },
<<<<<<< HEAD
  { id: 3, name: "Media", completed : false },     // 🔥 moved up
  { id: 4, name: "Amenities", completed : false }, // 🔥 new
  { id: 5, name: "Location", completed : false },  // 🔥 after amenities
=======
  { id: 3, name: "Media", completed : false },     
  { id: 4, name: "Amenities", completed : false }, 
  { id: 5, name: "Location", completed : false },  
>>>>>>> backup-local
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
  
    images: [],
    video: null,
    brochure: null,
    documents: [],
  
    uploading: false,
    progress: 0,

    highlights: [],
<<<<<<< HEAD
nearby: [],
tenants: "",
propertyGrade: "",
  });
  const navigate = useNavigate();


=======
    nearby: [],
    tenants: "",
    propertyGrade: "",
  });
  const navigate = useNavigate();

>>>>>>> backup-local
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

<<<<<<< HEAD

=======
>>>>>>> backup-local
  const handleSubmit = async () => {
    const valid = validateStep();
    if (!valid) return;
  
    setLoading(true);
  
<<<<<<< HEAD
  
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

form.append("tenants", formData.tenants);
form.append("propertyGrade", formData.propertyGrade);

form.append("highlights", JSON.stringify(formData.highlights));
// form.append("nearby", JSON.stringify(formData.nearby));

form.append("pricePerShare", formData.pricePerShare);


// ✅ ONLY IMAGES SEND
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
toast.success("Property Created 🚀");
=======
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

      form.append("tenants", formData.tenants);
      form.append("propertyGrade", formData.propertyGrade);

      form.append("highlights", JSON.stringify(formData.highlights));

      form.append("pricePerShare", formData.pricePerShare);

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
      toast.success("Property Created 🚀");
>>>>>>> backup-local
      navigate("/properties");
    } catch (err) {
      console.log(err);
      toast.error("Error creating property");
<<<<<<< HEAD
=======
    } finally {
      setLoading(false);
>>>>>>> backup-local
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

<<<<<<< HEAD
  

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/properties")}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Create New Property
          </h1>
          <p className="text-muted-foreground mt-1">
            Add a new property to the platform
          </p>
        </div>
      </div>

      {/* CARD */}
      <Card className="p-6">
        {/* PROGRESS */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* STEPS */}
        <div className="flex justify-between mb-8">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                step.id <= currentStep ? "opacity-100" : "opacity-40"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  step.id < currentStep
                    ? "bg-success text-white"
                    : step.id === currentStep
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.id < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </div>
              <span className="text-xs text-center hidden sm:block">
                {step.name}
              </span>
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div className="space-y-6">
          {/* STEP 1 (Basic_info)*/}
          {currentStep === 1 && (
            <>
              <Label>Property Name *</Label>
              <Input
                placeholder="e.g., Manhattan Tower Residences"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
              />

              <Label>Property Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => updateFormData("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="mixed">Mixed Use</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>

              <Label>Property Size *</Label>
<Input
  placeholder="e.g. 1200 sqft"
  value={formData.size}
  onChange={(e) => updateFormData("size", e.target.value)}
/>
            </>
          )}

          {/* STEP 2 (Description) */}
          {currentStep === 2 && (
            <>
              <Label>Description *</Label>
              <Textarea
                rows={8}
                value={formData.description}
                onChange={(e) =>
                  updateFormData("description", e.target.value)
                }
              />

<Label>Tenants</Label>
<Input
  placeholder="e.g. 3 Tenants"
  value={formData.tenants || ""}
  onChange={(e) => updateFormData("tenants", e.target.value)}
/>

<Label>Property Grade</Label>
<Input
  placeholder="e.g. Grade-A Building"
  onChange={(e) => updateFormData("propertyGrade", e.target.value)}
/>

<Label>Highlights</Label>
<Input
  placeholder="e.g. Fully Furnished, Prime Location"
  value={formData.highlights.join(", ") || ""}
  onChange={(e) =>
    updateFormData(
      "highlights",
      e.target.value.split(",").map(i => i.trim())
    )
  }
/>
{/* 
<Label>Nearby</Label>
<Input
  placeholder="e.g. Metro-2min, Airport-20min"
  value={formData.nearby || ""}
  onChange={(e) => updateFormData("nearby", e.target.value)}
/> */}
            </>
          )}

          {/* STEP 3 (Media)*/}
          {currentStep === 3 && (
  <div className="space-y-6">

    {/* IMAGES */}
    <div>
      <Label className="text-base font-semibold">
        Upload Photos (Min 3 - Max 5)
      </Label>

      <div className="mt-2 border-2 border-dashed rounded-xl p-6 text-center hover:border-primary cursor-pointer">
        <Upload className="mx-auto h-8 w-8 mb-2 text-muted-foreground" />
        <p className="text-sm">Choose files or drag & drop</p>

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
          variant="outline"
          className="mt-3"
          onClick={() => document.getElementById("images").click()}
        >
          Browse Files
        </Button>
      </div>
    </div>

    {/* VIDEO */}
    <div>
      <Label className="text-base font-semibold">Upload Video</Label>

      <div className="mt-2 border-2 border-dashed rounded-xl p-6 text-center">
        <input
          type="file"
          accept="video/*"
          onChange={(e) => updateFormData("video", e.target.files[0])}
        />
      </div>
    </div>

    {/* BROCHURE */}
    <div>
      <Label className="text-base font-semibold">Property Brochure (PDF)</Label>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => updateFormData("brochure", e.target.files[0])}
      />
    </div>

    {/* DOCUMENTS */}
    <div>
      <Label className="text-base font-semibold">Documents</Label>

      <input
        type="file"
        multiple
        onChange={(e) =>
          updateFormData("documents", Array.from(e.target.files))
        }
      />
    </div>

    {/* SAVE MEDIA BUTTON */}
    <div className="flex justify-end">
      <Button
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
            toast.success("Media Saved ✅");
          }, 1500);
        }}
      >
        Save Media
      </Button>
    </div>

    {/* PROGRESS MODAL STYLE */}
    {formData.uploading && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-80 shadow-xl">
          <h3 className="font-semibold mb-3">Saving Media</h3>

          <Progress value={formData.progress} />

          <p className="text-sm mt-2 text-muted-foreground">
            Uploading files...
          </p>
        </div>
      </div>
    )}
  </div>
)}

          {/* STEP 4 (Amenities) */}
          {currentStep === 4 && (
  <div className="grid grid-cols-3 gap-4">
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
        className={`p-4 rounded-xl border transition cursor-pointer text-center
        ${active
          ? "bg-primary text-white shadow-lg scale-105"
          : "hover:border-primary hover:shadow-sm"}`}
      >
        {item}
      </div>
    );
  })}
</div>
)}

          {/* STEP 5 (Location) */}
          {currentStep === 5 && (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
    <Input
  placeholder="State"
  value={formData.state || ""}
  onChange={(e) => updateFormData("state", e.target.value)}
/>
<Input
  placeholder="City"
  value={formData.city || ""}
  onChange={(e) => updateFormData("city", e.target.value)}
/>
    </div>

    <Input
  placeholder="Address"
  value={formData.address || ""}
  onChange={(e) => updateFormData("address", e.target.value)}
/>

    <div className="grid grid-cols-2 gap-4">
    <Input
  placeholder="Street"
  value={formData.street || ""}
  onChange={(e) => updateFormData("street", e.target.value)}
/>
<Input
  placeholder="Pincode"
  value={formData.pincode || ""}
  onChange={(e) => updateFormData("pincode", e.target.value)}
/>
    </div>

    <Input
  placeholder="Landmark"
  value={formData.landmark || ""}
  onChange={(e) => updateFormData("landmark", e.target.value)}
/>

    <div className="space-y-3">

  <iframe
    width="100%"
    height="250"
    className="rounded-xl"
    src={`https://maps.google.com/maps?q=${formData.lat || 20},${formData.lng || 77}&z=13&output=embed`}
  />

  <Button
    variant="outline"
    onClick={() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        updateFormData("lat", pos.coords.latitude);
        updateFormData("lng", pos.coords.longitude);
        toast.success("Location Selected 📍");
      });
    }}
  >
    Use Current Location
  </Button>

  <p className="text-sm text-muted-foreground">
    Lat: {formData.lat || "-"} | Lng: {formData.lng || "-"}
  </p>

</div>
  </div>
)}

{/* STEP 5 (Investment) */}
{currentStep === 6 && (
  <>
    <div className="grid grid-cols-2 gap-4">
      <Input
        placeholder="Total Value"
        value={formData.totalValue}
        onChange={(e) => updateFormData("totalValue", e.target.value)}
      />
      <Input
        placeholder="Total Shares"
        value={formData.totalShares}
        onChange={(e) => updateFormData("totalShares", e.target.value)}
      />
    </div>

    <div className="p-4 bg-accent rounded-lg">
      ₹ {formData.pricePerShare || 0} / share
    </div>

    <div className="grid grid-cols-2 gap-4">
    <Input
  placeholder="ROI"
  value={formData.expectedROI || ""}
  onChange={(e) => updateFormData("expectedROI", e.target.value)}
/>
<Input
  placeholder="Duration"
  value={formData.duration || ""}
  onChange={(e) => updateFormData("duration", e.target.value)}
/>
    </div>
  </>
)}

          {/* STEP 6 (PREVIEW FULL) */}
          {currentStep === 7 && (
 <div className="space-y-6">

 <h2 className="text-xl font-semibold">Preview</h2>

 {/* IMAGE GALLERY */}
 <div className="grid grid-cols-3 gap-3">
   {formData.images.map((img, i) => (
     <img
       key={i}
       src={URL.createObjectURL(img)}
       className="h-28 w-full object-cover rounded-xl shadow"
     />
   ))}
 </div>

 {/* CARD */}
 <div className="p-6 rounded-xl border bg-white shadow-sm space-y-4">

   <div className="grid grid-cols-2 gap-4">

     <div>
       <Label>Name</Label>
       <p className="font-medium">{formData.name}</p>
     </div>

     <div>
       <Label>Type</Label>
       <p>{formData.type}</p>
     </div>

     <div>
       <Label>Size</Label>
       <p>{formData.size}</p>
     </div>

     <div>
       <Label>City</Label>
       <p>{formData.city}</p>
     </div>

     <div className="col-span-2">
       <Label>Description</Label>
       <p>{formData.description}</p>
     </div>

     <div className="col-span-2">
       <Label>Address</Label>
       <p>{formData.address}</p>
     </div>

     <div className="col-span-2">
       <Label>Amenities</Label>
       <p>{formData.amenities.join(", ")}</p>
     </div>

     <div>
       <Label>Total Value</Label>
       <p>₹ {formData.totalValue}</p>
     </div>

     <div>
       <Label>ROI</Label>
       <p>{formData.expectedROI}%</p>
     </div>

   </div>
 </div>
</div>
)}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button onClick={handlePrevious} disabled={currentStep === 1}>
=======
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
              <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2">
                <Label className="text-xs font-semibold text-slate-700">Legal Documents & Valuation Certificates</Label>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    updateFormData("documents", Array.from(e.target.files))
                  }
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                />
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
          {currentStep === 6 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Total Asset Value (₹) *</Label>
                  <Input
                    placeholder="e.g. 50000000"
                    value={formData.totalValue}
                    onChange={(e) => updateFormData("totalValue", e.target.value)}
                    className="h-10 rounded-xl border-slate-200 font-mono text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Total Issued Shares *</Label>
                  <Input
                    placeholder="e.g. 5000"
                    value={formData.totalShares}
                    onChange={(e) => updateFormData("totalShares", e.target.value)}
                    className="h-10 rounded-xl border-slate-200 font-mono text-sm"
                  />
                </div>
              </div>

              {/* CALCULATED VALUE CARD */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">Calculated Share Price</p>
                  <p className="text-xl font-bold font-mono mt-0.5">
                    ₹{formData.pricePerShare || 0} <span className="text-xs font-normal text-slate-400">/ share</span>
                  </p>
                </div>
                <div className="p-2 bg-slate-800 rounded-xl">
                  <Coins className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Target ROI (%)</Label>
                  <Input
                    placeholder="e.g. 12.5"
                    value={formData.expectedROI || ""}
                    onChange={(e) => updateFormData("expectedROI", e.target.value)}
                    className="h-10 rounded-xl border-slate-200 font-mono text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Lock-in Duration</Label>
                  <Input
                    placeholder="e.g. 3 Years"
                    value={formData.duration || ""}
                    onChange={(e) => updateFormData("duration", e.target.value)}
                    className="h-10 rounded-xl border-slate-200 text-sm"
                  />
                </div>
              </div>
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
>>>>>>> backup-local
            Previous
          </Button>

          {currentStep < steps.length ? (
<<<<<<< HEAD
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit}>Create Property</Button>
          )}
        </div>
=======
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

>>>>>>> backup-local
      </Card>
    </div>
  );
}