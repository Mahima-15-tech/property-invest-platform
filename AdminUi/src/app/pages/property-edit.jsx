import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPropertyById, updateProperty } from "../../api/property";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
<<<<<<< HEAD
import { toast } from "sonner";

export function PropertyEdit() {

  const { id } = useParams();
  const navigate = useNavigate();
=======
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { 
  Building2, 
  MapPin, 
  Coins, 
  ImageIcon, 
  X, 
  Upload, 
  Sparkles, 
  ChevronLeft,
  Loader2,
  CheckCircle2
} from "lucide-react";

export function PropertyEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
>>>>>>> backup-local

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    size: "",
    description: "",
<<<<<<< HEAD
    images: [],
=======
>>>>>>> backup-local
    city: "",
    state: "",
    address: "",
    totalValue: "",
    totalShares: "",
<<<<<<< HEAD
    expectedROI: "",
    duration: "",
  });

  useEffect(() => {
    fetchProperty();
  }, []);

  const [newImages, setNewImages] = useState([]);

  const fetchProperty = async () => {
    const res = await getPropertyById(id);
    const p = res.data;

    setFormData({
      name: p.name,
      type: p.type,
      size: p.size,
      description: p.description,
      images: p.media?.images || [],
      city: p.location?.city,
      state: p.location?.state,
      address: p.location?.address,
      totalValue: p.totalValue,
      totalShares: p.totalShares,
      expectedROI: p.roi,
      duration: p.duration,
    });
  };

  

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };


  const handleUpdate = async () => {
    try {
  
      const form = new FormData();
  
      form.append("name", formData.name);
      form.append("type", formData.type);
      form.append("size", formData.size);
      form.append("description", formData.description);
  
      form.append("city", formData.city);
      form.append("state", formData.state);
      form.append("address", formData.address);
  
      form.append("totalValue", formData.totalValue);
      form.append("totalShares", formData.totalShares);
      form.append("expectedROI", formData.expectedROI);
      form.append("duration", formData.duration);
  
      newImages.forEach((img) => {
        form.append("images", img);
      });
  
      await updateProperty(id, form);
  
      toast.success("Updated Successfully");
  
      navigate("/properties");
  
    } catch (err) {
  
      console.log(err);
  
      toast.error("Update Failed");
  
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">Edit Property</h1>

      <Card className="p-6 space-y-4">

        <div>
          <Label>Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div>
          <Label>Type</Label>
          <Input
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
          />
        </div>

        <div>
          <Label>Size</Label>
          <Input
            value={formData.size}
            onChange={(e) => handleChange("size", e.target.value)}
          />
        </div>

        <div>
          <Label>Description</Label>
          <Input
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        {/* IMAGE PREVIEW */}
<div>
  <Label>Images</Label>

  <div className="grid grid-cols-3 gap-3 mt-2">
    {formData.images?.map((img, i) => (
      <div key={i} className="relative">
        <img
          src={img}
          className="h-24 w-full object-cover rounded-lg"
        />

        {/* REMOVE BUTTON */}
        <button
          onClick={() => {
            const updated = formData.images.filter((_, idx) => idx !== i);
            setFormData({ ...formData, images: updated });
          }}
          className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 rounded"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
</div>

<input
  type="file"
  multiple
  accept="image/*"
  onChange={(e) => {
    const files = Array.from(e.target.files);
  
    setNewImages(files);
  
    const previewUrls = files.map((file) =>
      URL.createObjectURL(file)
    );
  
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...previewUrls],
    }));
  }}
/>

        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="City"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
          <Input
            placeholder="State"
            value={formData.state}
            onChange={(e) => handleChange("state", e.target.value)}
          />
        </div>

        <Input
          placeholder="Address"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Total Value"
            value={formData.totalValue}
            onChange={(e) => handleChange("totalValue", e.target.value)}
          />
          <Input
            placeholder="Shares"
            value={formData.totalShares}
            onChange={(e) => handleChange("totalShares", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="ROI"
            value={formData.expectedROI}
            onChange={(e) => handleChange("expectedROI", e.target.value)}
          />
          <Input
            placeholder="Duration"
            value={formData.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
          />
        </div>

        <Button onClick={handleUpdate} className="w-full">
          Update Property
        </Button>

      </Card>
=======
    pricePerShare: "",
    expectedROI: "",
    duration: "",
    isFeatured: false,
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const res = await getPropertyById(id);
      const p = res.data;

      const totalVal = p.totalValue || "";
      const totalSh = p.totalShares || "";
      let pps = "";
      if (totalVal && totalSh) {
        pps = (parseFloat(totalVal) / parseFloat(totalSh)).toFixed(2);
      }

      setFormData({
        name: p.name || "",
        type: p.type || "",
        size: p.size || "",
        description: p.description || "",
        city: p.location?.city || "",
        state: p.location?.state || "",
        address: p.location?.address || "",
        totalValue: totalVal,
        totalShares: totalSh,
        pricePerShare: pps,
        expectedROI: p.roi || "",
        duration: p.duration || "",
        isFeatured: p.isFeatured || false,
      });

      setExistingImages(p.media?.images || []);
    } catch (err) {
      toast.error("Failed to fetch property details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };

    if (field === "totalValue" || field === "totalShares") {
      const total = parseFloat(field === "totalValue" ? value : formData.totalValue);
      const shares = parseFloat(field === "totalShares" ? value : formData.totalShares);

      if (total && shares) {
        updated.pricePerShare = (total / shares).toFixed(2);
      } else {
        updated.pricePerShare = "";
      }
    }

    setFormData(updated);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setNewImageFiles((prev) => [...prev, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

      existingImages.forEach((imgUrl) => {
        form.append("existingImages", imgUrl);
      });

      newImageFiles.forEach((file) => {
        form.append("images", file);
      });

      await updateProperty(id, form);
      toast.success("Property updated successfully 🚀");
      navigate("/properties");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update property");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans text-slate-900">
      
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
            <Building2 className="w-3.5 h-3.5" /> Asset Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
            Edit Property Details
          </h1>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        
        {/* SECTION 1: BASIC INFO */}
        <Card className="p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm bg-white space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Property Name *</Label>
            <Input
              placeholder="e.g. Manhattan Tower Residences"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-10 rounded-xl border-slate-200 focus:border-blue-500 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Property Type</Label>
              <Input
                placeholder="e.g. Residential, Commercial"
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="h-10 rounded-xl border-slate-200 focus:border-blue-500 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Property Size</Label>
              <Input
                placeholder="e.g. 1,200 sqft"
                value={formData.size}
                onChange={(e) => handleChange("size", e.target.value)}
                className="h-10 rounded-xl border-slate-200 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Description</Label>
            <Textarea
              rows={4}
              placeholder="Provide a comprehensive breakdown of the real estate asset..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="rounded-xl border-slate-200 focus:border-blue-500 text-sm resize-none"
            />
          </div>
        </Card>

        {/* SECTION 2: LOCATION */}
        <Card className="p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm bg-white space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Location Details</h2>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Full Address</Label>
            <Input
              placeholder="e.g. Plot No 42, Financial District"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="h-10 rounded-xl border-slate-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">City</Label>
              <Input
                placeholder="e.g. Mumbai"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="h-10 rounded-xl border-slate-200 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">State</Label>
              <Input
                placeholder="e.g. Maharashtra"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className="h-10 rounded-xl border-slate-200 text-sm"
              />
            </div>
          </div>
        </Card>

        {/* SECTION 3: INVESTMENT METRICS */}
        <Card className="p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm bg-white space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Coins className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Investment Metrics</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Total Asset Value (₹)</Label>
              <Input
                type="number"
                placeholder="e.g. 50000000"
                value={formData.totalValue}
                onChange={(e) => handleChange("totalValue", e.target.value)}
                className="h-10 rounded-xl border-slate-200 font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Total Issued Shares</Label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={formData.totalShares}
                onChange={(e) => handleChange("totalShares", e.target.value)}
                className="h-10 rounded-xl border-slate-200 font-mono text-sm"
              />
            </div>
          </div>

          {/* CALCULATED SHARE PRICE DISPLAY */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">Calculated Share Price</p>
              <p className="text-xl font-bold font-mono mt-0.5">
                ₹{formData.pricePerShare || 0} <span className="text-xs font-normal text-slate-400">/ share</span>
              </p>
            </div>
            <div className="p-2.5 bg-slate-800 rounded-xl">
              <Coins className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Target ROI (%)</Label>
              <Input
                placeholder="e.g. 12.5"
                value={formData.expectedROI}
                onChange={(e) => handleChange("expectedROI", e.target.value)}
                className="h-10 rounded-xl border-slate-200 font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Lock-in Duration</Label>
              <Input
                placeholder="e.g. 3 Years"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                className="h-10 rounded-xl border-slate-200 text-sm"
              />
            </div>
          </div>

          {/* FEATURED TOGGLE */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => handleChange("isFeatured", e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600 border-slate-300"
              />
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Highlight as Featured Property
              </span>
            </label>
          </div>
        </Card>

        {/* SECTION 4: MEDIA GALLERY */}
        <Card className="p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm bg-white space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Property Media</h2>
          </div>

          {/* SAVED IMAGES */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600">Saved Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {existingImages.map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-50">
                    <img src={img} alt="Saved" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-1.5 right-1.5 bg-slate-900/80 hover:bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEW IMAGES PREVIEW */}
          {newImagePreviews.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> New Images To Upload
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {newImagePreviews.map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50/30 aspect-video">
                    <img src={img} alt="New Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1.5 right-1.5 bg-slate-900/80 hover:bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPLOAD BOX */}
          <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 transition rounded-2xl p-6 text-center bg-slate-50/50 relative">
            <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="text-xs text-slate-600 font-medium">Click or drag photos to add to gallery</p>
            <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG or WEBP up to 10MB each</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </Card>

        {/* BOTTOM ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/properties")}
            className="h-10 px-5 rounded-xl text-xs font-semibold border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md shadow-slate-900/10"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Changes...
              </>
            ) : (
              "Update Property"
            )}
          </Button>
        </div>

      </form>
>>>>>>> backup-local
    </div>
  );
}