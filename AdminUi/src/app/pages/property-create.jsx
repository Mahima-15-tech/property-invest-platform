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
import { Check, ChevronLeft, Upload } from "lucide-react";
import { toast } from "sonner";
import { createProperty } from "../../api/property";

const steps = [
  { id: 1, name: "Basic Info", completed : false },
  { id: 2, name: "Details", completed : false },
  { id: 3, name: "Media", completed : false },     // 🔥 moved up
  { id: 4, name: "Amenities", completed : false }, // 🔥 new
  { id: 5, name: "Location", completed : false },  // 🔥 after amenities
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
nearby: [],
tenants: "",
propertyGrade: "",
  });
  const navigate = useNavigate();


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
      navigate("/properties");
    } catch (err) {
      console.log(err);
      toast.error("Error creating property");
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
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit}>Create Property</Button>
          )}
        </div>
      </Card>
    </div>
  );
}