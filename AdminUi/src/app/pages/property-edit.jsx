import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPropertyById, updateProperty } from "../../api/property";

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";

import { toast } from "sonner";

import {
  Building2,
  MapPin,
  Coins,
  ImageIcon,
  FileText,
  Video,
  FileDown,
  X,
  Upload,
  Sparkles,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Plus,
  Home,
  Settings2,
  Eye,
  Trash2,
  ExternalLink,
  Tag,
  Star,
  Globe,
} from "lucide-react";

export function PropertyEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    // BASIC
    name: "",
    type: "",
    size: "",
    description: "",

    // LOCATION
    city: "",
    state: "",
    address: "",
    street: "",
    landmark: "",
    pincode: "",
    lat: "",
    lng: "",

    // INVESTMENT
    totalValue: "",
    totalShares: "",
    pricePerShare: "",

    expectedROI: "",
    targetROI: "",
    rentalYield: "",
    appreciation: "",

    duration: "",

    // SHARE SETTINGS
    shareBuyingCycle: 10,
    enableFullOwnership: false,

    // PROPERTY DETAILS
    tenants: "",
    propertyGrade: "",

    // STATUS
    status: "funding",

    isFeatured: false,
    isPublished: true,
  });

  // =====================================================
  // AMENITIES
  // =====================================================

  const [amenities, setAmenities] = useState([]);
  const [amenityInput, setAmenityInput] = useState("");

  // =====================================================
  // HIGHLIGHTS
  // =====================================================

  const [highlights, setHighlights] = useState([]);
  const [highlightInput, setHighlightInput] = useState("");

  // =====================================================
  // IMAGES
  // =====================================================

  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  // =====================================================
  // DOCUMENTS
  // =====================================================

  const [existingDocuments, setExistingDocuments] = useState([]);
  const [newDocumentFiles, setNewDocumentFiles] = useState([]);

  // =====================================================
  // VIDEO
  // =====================================================

  const [existingVideo, setExistingVideo] = useState("");
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [removeVideo, setRemoveVideo] = useState(false);

  // =====================================================
  // BROCHURE
  // =====================================================

  const [existingBrochure, setExistingBrochure] = useState("");
  const [newBrochureFile, setNewBrochureFile] = useState(null);
  const [removeBrochure, setRemoveBrochure] = useState(false);

  // =====================================================
  // FETCH PROPERTY
  // =====================================================

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);

      const res = await getPropertyById(id);

      // API kabhi res.data.data bhi de sakti hai
      const p = res?.data?.data || res?.data;

      if (!p) {
        throw new Error("Property data not found");
      }

      console.log("EDIT PROPERTY DATA:", p);

      // =================================================
      // PREFILL FORM
      // =================================================

      setFormData({
        // BASIC
        name: p.name || "",
        type: p.type || "",
        size: p.size || "",
        description: p.description || "",

        // LOCATION
        city: p.location?.city || "",
        state: p.location?.state || "",
        address: p.location?.address || "",
        street: p.location?.street || "",
        landmark: p.location?.landmark || "",
        pincode: p.location?.pincode || "",
        lat: p.location?.lat ?? "",
        lng: p.location?.lng ?? "",

        // INVESTMENT
        totalValue: p.totalValue ?? "",
        totalShares: p.totalShares ?? "",
        pricePerShare: p.pricePerShare ?? "",

        // RETURNS
        expectedROI: p.roi ?? p.expectedROI ?? "",
        targetROI: p.targetROI ?? "",
        rentalYield: p.rentalYield ?? "",
        appreciation: p.appreciation ?? "",
        duration: p.duration || "",

        // SHARE SETTINGS
        shareBuyingCycle: p.shareBuyingCycle ?? 10,
        enableFullOwnership: p.enableFullOwnership ?? false,

        // PROPERTY DETAILS
        tenants: p.tenants || "",
        propertyGrade: p.propertyGrade || "",

        // STATUS
        status: p.status || "funding",

        isFeatured: p.isFeatured ?? false,
        isPublished: p.isPublished ?? true,
      });

      // =================================================
      // MEDIA PREFILL
      // =================================================

   // ================= MEDIA =================

setExistingImages(
  p.media?.images || p.images || []
);

setExistingDocuments(
  p.media?.documents || p.documents || []
);

setExistingVideo(
  p.media?.video || p.video || ""
);

setExistingBrochure(
  p.media?.brochure || p.brochure || ""
);

      // =================================================
      // ARRAYS PREFILL
      // =================================================

      setAmenities(p.amenities || []);

      setHighlights(p.highlights || []);

    } catch (err) {
      console.error("FETCH PROPERTY ERROR:", err);

      toast.error("Failed to fetch property details");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      if (
        field === "totalValue" ||
        field === "totalShares"
      ) {
        const total = parseFloat(
          field === "totalValue"
            ? value
            : prev.totalValue
        );

        const shares = parseFloat(
          field === "totalShares"
            ? value
            : prev.totalShares
        );

        if (total > 0 && shares > 0) {
          updated.pricePerShare = (
            total / shares
          ).toFixed(2);
        } else {
          updated.pricePerShare = "";
        }
      }

      return updated;
    });
  };

  // =====================================================
  // AMENITIES
  // =====================================================

  const addAmenity = () => {
    const value = amenityInput.trim();

    if (!value) return;

    if (
      amenities.some(
        (item) =>
          item.toLowerCase() === value.toLowerCase()
      )
    ) {
      toast.error("Amenity already added");
      return;
    }

    setAmenities((prev) => [
      ...prev,
      value,
    ]);

    setAmenityInput("");
  };

  const removeAmenity = (index) => {
    setAmenities((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // =====================================================
  // HIGHLIGHTS
  // =====================================================

  const addHighlight = () => {
    const value = highlightInput.trim();

    if (!value) return;

    if (
      highlights.some(
        (item) =>
          item.toLowerCase() === value.toLowerCase()
      )
    ) {
      toast.error("Highlight already added");
      return;
    }

    setHighlights((prev) => [
      ...prev,
      value,
    ]);

    setHighlightInput("");
  };

  const removeHighlight = (index) => {
    setHighlights((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // =====================================================
  // IMAGES
  // =====================================================

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(
          `${file.name} is not a valid image`
        );
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(
          `${file.name} is larger than 10MB`
        );
        return false;
      }

      return true;
    });

    if (!validFiles.length) return;

    const previews = validFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setNewImageFiles((prev) => [
      ...prev,
      ...validFiles,
    ]);

    setNewImagePreviews((prev) => [
      ...prev,
      ...previews,
    ]);

    e.target.value = "";
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const removeNewImage = (index) => {
    if (newImagePreviews[index]) {
      URL.revokeObjectURL(
        newImagePreviews[index]
      );
    }

    setNewImageFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setNewImagePreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // =====================================================
  // DOCUMENTS
  // =====================================================

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    setNewDocumentFiles((prev) => [
      ...prev,
      ...files,
    ]);

    e.target.value = "";
  };

  const removeExistingDocument = (index) => {
    setExistingDocuments((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const removeNewDocument = (index) => {
    setNewDocumentFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // =====================================================
  // VIDEO
  // =====================================================

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setNewVideoFile(file);
    setRemoveVideo(false);

    e.target.value = "";
  };

  const handleRemoveVideo = () => {
    setExistingVideo("");
    setNewVideoFile(null);
    setRemoveVideo(true);
  };

  // =====================================================
  // BROCHURE
  // =====================================================

  const handleBrochureChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setNewBrochureFile(file);
    setRemoveBrochure(false);

    e.target.value = "";
  };

  const handleRemoveBrochure = () => {
    setExistingBrochure("");
    setNewBrochureFile(null);
    setRemoveBrochure(true);
  };

  // =====================================================
  // UPDATE PROPERTY
  // =====================================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Property name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const form = new FormData();

      // =================================================
      // BASIC FORM DATA
      // =================================================

      Object.entries(formData).forEach(
        ([key, value]) => {
          form.append(key, String(value ?? ""));
        }
      );

      // =================================================
      // ARRAYS
      // =================================================

      form.append(
        "amenities",
        JSON.stringify(amenities)
      );

      form.append(
        "highlights",
        JSON.stringify(highlights)
      );

      // =================================================
      // EXISTING IMAGES
      // =================================================

      form.append(
        "existingImages",
        JSON.stringify(existingImages)
      );

      // =================================================
      // NEW IMAGES
      // =================================================

      newImageFiles.forEach((file) => {
        form.append("images", file);
      });

      // =================================================
      // EXISTING DOCUMENTS
      // =================================================

      form.append(
        "existingDocuments",
        JSON.stringify(existingDocuments)
      );

      // =================================================
      // NEW DOCUMENTS
      // =================================================

      newDocumentFiles.forEach((file) => {
        form.append("documents", file);
      });

      // =================================================
      // VIDEO
      // =================================================

      if (newVideoFile) {
        form.append("video", newVideoFile);
      }

      form.append(
        "removeVideo",
        String(removeVideo)
      );

      // =================================================
      // BROCHURE
      // =================================================

      if (newBrochureFile) {
        form.append("brochure", newBrochureFile);
      }

      form.append(
        "removeBrochure",
        String(removeBrochure)
      );

      // =================================================
      // API CALL
      // =================================================

      await updateProperty(id, form);

      toast.success(
        "Property updated successfully 🚀"
      );

      navigate("/properties");

    } catch (err) {
      console.error(
        "UPDATE PROPERTY ERROR:",
        err
      );

      toast.error(
        err?.response?.data?.message ||
          "Failed to update property"
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
        </div>

        <div className="text-center">
          <p className="font-semibold text-slate-800">
            Loading property details
          </p>

          <p className="text-sm text-slate-400 mt-1">
            Please wait while we prepare the property information...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="max-w-6xl mx-auto pb-16 px-4 sm:px-6 lg:px-8">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="pt-6 pb-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

          <div className="flex items-start gap-4">

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                navigate("/properties")
              }
              className="shrink-0 rounded-xl border-slate-200 hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div>

              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                <Building2 className="w-4 h-4" />
                Asset Management
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                Edit Property
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                Review the existing details and update the property information.
              </p>

            </div>

          </div>

          <div className="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-xl">
            <Eye className="w-4 h-4 text-blue-600" />

            <span className="text-xs font-semibold text-blue-700">
              Existing data is pre-filled
            </span>
          </div>

        </div>

      </div>

      <form
        onSubmit={handleUpdate}
        className="space-y-6"
      >

        {/* ================================================= */}
        {/* BASIC INFORMATION */}
        {/* ================================================= */}

        <Card className="p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm bg-white">

          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">

            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Basic Information
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Update the primary details of your property.
              </p>
            </div>

          </div>

          <div className="space-y-5">

            <div className="space-y-2">

              <Label>
                Property Name{" "}
                <span className="text-rose-500">*</span>
              </Label>

              <Input
                value={formData.name}
                onChange={(e) =>
                  handleChange("name", e.target.value)
                }
                placeholder="Enter property name"
                className="h-11 rounded-xl"
                required
              />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div className="space-y-2">

                <Label>Property Type</Label>

                <Input
                  value={formData.type}
                  onChange={(e) =>
                    handleChange("type", e.target.value)
                  }
                  placeholder="Residential / Commercial"
                  className="h-11 rounded-xl"
                />

              </div>

              <div className="space-y-2">

                <Label>Property Size</Label>

                <Input
                  value={formData.size}
                  onChange={(e) =>
                    handleChange("size", e.target.value)
                  }
                  placeholder="e.g. 1,200 sqft"
                  className="h-11 rounded-xl"
                />

              </div>

            </div>

            <div className="space-y-2">

              <Label>Description</Label>

              <Textarea
                rows={5}
                value={formData.description}
                onChange={(e) =>
                  handleChange(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Describe the property..."
                className="rounded-xl resize-none"
              />

            </div>

          </div>

        </Card>

        {/* ================================================= */}
        {/* LOCATION */}
        {/* ================================================= */}

        <Card className="p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm bg-white">

          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">

            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-rose-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Location Details
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Manage the complete property address.
              </p>
            </div>

          </div>

          <div className="space-y-5">

            <div className="space-y-2">

              <Label>Full Address</Label>

              <Input
                value={formData.address}
                onChange={(e) =>
                  handleChange(
                    "address",
                    e.target.value
                  )
                }
                placeholder="Enter full address"
                className="h-11 rounded-xl"
              />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div className="space-y-2">

                <Label>City</Label>

                <Input
                  value={formData.city}
                  onChange={(e) =>
                    handleChange("city", e.target.value)
                  }
                  placeholder="Mumbai"
                  className="h-11 rounded-xl"
                />

              </div>

              <div className="space-y-2">

                <Label>State</Label>

                <Input
                  value={formData.state}
                  onChange={(e) =>
                    handleChange("state", e.target.value)
                  }
                  placeholder="Maharashtra"
                  className="h-11 rounded-xl"
                />

              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div className="space-y-2">

                <Label>Street</Label>

                <Input
                  value={formData.street}
                  onChange={(e) =>
                    handleChange("street", e.target.value)
                  }
                  placeholder="Enter street"
                  className="h-11 rounded-xl"
                />

              </div>

              <div className="space-y-2">

                <Label>Landmark</Label>

                <Input
                  value={formData.landmark}
                  onChange={(e) =>
                    handleChange(
                      "landmark",
                      e.target.value
                    )
                  }
                  placeholder="Nearby landmark"
                  className="h-11 rounded-xl"
                />

              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div className="space-y-2">

                <Label>Pincode</Label>

                <Input
                  value={formData.pincode}
                  onChange={(e) =>
                    handleChange(
                      "pincode",
                      e.target.value
                    )
                  }
                  placeholder="400001"
                  className="h-11 rounded-xl"
                />

              </div>

              <div className="space-y-2">

                <Label>Latitude</Label>

                <Input
                  type="number"
                  value={formData.lat}
                  onChange={(e) =>
                    handleChange("lat", e.target.value)
                  }
                  placeholder="19.0760"
                  className="h-11 rounded-xl"
                />

              </div>

              <div className="space-y-2">

                <Label>Longitude</Label>

                <Input
                  type="number"
                  value={formData.lng}
                  onChange={(e) =>
                    handleChange("lng", e.target.value)
                  }
                  placeholder="72.8777"
                  className="h-11 rounded-xl"
                />

              </div>

            </div>

          </div>

        </Card>

        {/* ================================================= */}
        {/* PROPERTY DETAILS */}
        {/* ================================================= */}

        <Card className="p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm bg-white">

          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">

            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <Home className="w-5 h-5 text-violet-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Property Details
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Additional information and property status.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="space-y-2">

              <Label>Tenants</Label>

              <Input
                value={formData.tenants}
                onChange={(e) =>
                  handleChange(
                    "tenants",
                    e.target.value
                  )
                }
                placeholder="Tenant details"
                className="h-11 rounded-xl"
              />

            </div>

            <div className="space-y-2">

              <Label>Property Grade</Label>

              <Input
                value={formData.propertyGrade}
                onChange={(e) =>
                  handleChange(
                    "propertyGrade",
                    e.target.value
                  )
                }
                placeholder="A / B / Premium"
                className="h-11 rounded-xl"
              />

            </div>

          </div>

          <div className="mt-5 space-y-2">

            <Label>Property Status</Label>

            <select
              value={formData.status}
              onChange={(e) =>
                handleChange(
                  "status",
                  e.target.value
                )
              }
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            >
              <option value="funding">
                Funding
              </option>

              <option value="funded">
                Funded
              </option>

              <option value="sold">
                Sold
              </option>
            </select>

          </div>

        </Card>

        {/* ================================================= */}
        {/* AMENITIES */}
        {/* ================================================= */}

        <Card className="p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm bg-white">

          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">

            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Amenities
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Add features available with this property.
              </p>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            <Input
              value={amenityInput}
              onChange={(e) =>
                setAmenityInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAmenity();
                }
              }}
              placeholder="e.g. Swimming Pool"
              className="h-11 rounded-xl"
            />

            <Button
              type="button"
              onClick={addAmenity}
              className="h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>

          </div>

          {amenities.length > 0 ? (

            <div className="flex flex-wrap gap-2 mt-5">

              {amenities.map((item, index) => (

                <div
                  key={`${item}-${index}`}
                  className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />

                  {item}

                  <button
                    type="button"
                    onClick={() =>
                      removeAmenity(index)
                    }
                    className="ml-1 hover:text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>

                </div>

              ))}

            </div>

          ) : (

            <p className="text-sm text-slate-400 mt-5">
              No amenities added yet.
            </p>

          )}

        </Card>

        {/* ================================================= */}
        {/* HIGHLIGHTS */}
        {/* ================================================= */}

        <Card className="p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm bg-white">

          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">

            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Property Highlights
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Add important selling points of the property.
              </p>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            <Input
              value={highlightInput}
              onChange={(e) =>
                setHighlightInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addHighlight();
                }
              }}
              placeholder="e.g. Prime Location"
              className="h-11 rounded-xl"
            />

            <Button
              type="button"
              onClick={addHighlight}
              className="h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>

          </div>

          {highlights.length > 0 ? (

            <div className="flex flex-wrap gap-2 mt-5">

              {highlights.map((item, index) => (

                <div
                  key={`${item}-${index}`}
                  className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 px-3 py-2 rounded-xl text-sm font-medium"
                >
                  <Star className="w-3.5 h-3.5" />

                  {item}

                  <button
                    type="button"
                    onClick={() =>
                      removeHighlight(index)
                    }
                    className="ml-1 hover:text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>

                </div>

              ))}

            </div>

          ) : (

            <p className="text-sm text-slate-400 mt-5">
              No highlights added yet.
            </p>

          )}

        </Card>

        {/* ================================================= */}
        {/* INVESTMENT METRICS */}
        {/* ================================================= */}

        <Card className="p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm bg-white">

          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">

            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Coins className="w-5 h-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Investment Metrics
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Configure the investment and expected returns.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="space-y-2">

              <Label>Total Asset Value (₹)</Label>

              <Input
                type="number"
                value={formData.totalValue}
                onChange={(e) =>
                  handleChange(
                    "totalValue",
                    e.target.value
                  )
                }
                placeholder="50000000"
                className="h-11 rounded-xl"
              />

            </div>

            <div className="space-y-2">

              <Label>Total Issued Shares</Label>

              <Input
                type="number"
                value={formData.totalShares}
                onChange={(e) =>
                  handleChange(
                    "totalShares",
                    e.target.value
                  )
                }
                placeholder="5000"
                className="h-11 rounded-xl"
              />

            </div>

          </div>

          {/* SHARE PRICE */}

          <div className="mt-5 p-5 rounded-2xl bg-slate-950 text-white flex items-center justify-between">

            <div>

              <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                Calculated Share Price
              </p>

              <p className="text-2xl font-bold mt-1">
                ₹{formData.pricePerShare || 0}

                <span className="text-sm font-normal text-slate-400 ml-2">
                  / share
                </span>
              </p>

            </div>

            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Coins className="w-6 h-6 text-emerald-400" />
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

            <div className="space-y-2">

              <Label>Expected ROI (%)</Label>

              <Input
                type="number"
                value={formData.expectedROI}
                onChange={(e) =>
                  handleChange(
                    "expectedROI",
                    e.target.value
                  )
                }
                placeholder="12"
                className="h-11 rounded-xl"
              />

            </div>

            <div className="space-y-2">

              <Label>Target ROI (%)</Label>

              <Input
                type="number"
                value={formData.targetROI}
                onChange={(e) =>
                  handleChange(
                    "targetROI",
                    e.target.value
                  )
                }
                placeholder="15"
                className="h-11 rounded-xl"
              />

            </div>

            <div className="space-y-2">

              <Label>Rental Yield (%)</Label>

              <Input
                type="number"
                value={formData.rentalYield}
                onChange={(e) =>
                  handleChange(
                    "rentalYield",
                    e.target.value
                  )
                }
                placeholder="8"
                className="h-11 rounded-xl"
              />

            </div>

            <div className="space-y-2">

              <Label>Appreciation (%)</Label>

              <Input
                type="number"
                value={formData.appreciation}
                onChange={(e) =>
                  handleChange(
                    "appreciation",
                    e.target.value
                  )
                }
                placeholder="10"
                className="h-11 rounded-xl"
              />

            </div>

            <div className="space-y-2">

              <Label>Lock-in Duration</Label>

              <Input
                value={formData.duration}
                onChange={(e) =>
                  handleChange(
                    "duration",
                    e.target.value
                  )
                }
                placeholder="e.g. 3 Years"
                className="h-11 rounded-xl"
              />

            </div>

          </div>

          {/* FEATURED */}

          <div className="mt-6 pt-5 border-t border-slate-100">

            <label className="flex items-center justify-between gap-5 cursor-pointer">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>

                <div>

                  <p className="text-sm font-semibold">
                    Featured Property
                  </p>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Display this property prominently.
                  </p>

                </div>

              </div>

              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  handleChange(
                    "isFeatured",
                    e.target.checked
                  )
                }
                className="w-5 h-5 accent-blue-600"
              />

            </label>

          </div>

        </Card>

        {/* ================================================= */}
        {/* SHARE CONFIGURATION */}
        {/* ================================================= */}

        <Card className="p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm bg-white">

          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">

            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-indigo-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Share Configuration
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Configure property ownership settings.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">

              <Label>Share Buying Cycle</Label>

              <select
                value={formData.shareBuyingCycle}
                onChange={(e) =>
                  handleChange(
                    "shareBuyingCycle",
                    Number(e.target.value)
                  )
                }
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value={5}>
                  5 Shares Cycle
                </option>

                <option value={10}>
                  10 Shares Cycle
                </option>
              </select>

            </div>

            <div className="flex items-center">

              <label className="flex items-center gap-3 cursor-pointer">

                <input
                  type="checkbox"
                  checked={
                    formData.enableFullOwnership
                  }
                  onChange={(e) =>
                    handleChange(
                      "enableFullOwnership",
                      e.target.checked
                    )
                  }
                  className="w-5 h-5 accent-blue-600"
                />

                <div>

                  <p className="text-sm font-semibold">
                    Enable Full Ownership
                  </p>

                  <p className="text-xs text-slate-500">
                    Allow investors to purchase full ownership.
                  </p>

                </div>

              </label>

            </div>

          </div>

        </Card>

        {/* ================================================= */}
        {/* MEDIA */}
        {/* ================================================= */}

        <Card className="p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm bg-white">

          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">

            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-pink-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Property Images
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Manage existing photos or upload new ones.
              </p>
            </div>

          </div>

          {/* EXISTING IMAGES */}

          {existingImages.length > 0 && (

            <div className="mb-6">

              <Label className="text-sm font-semibold">
                Existing Images
              </Label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">

                {existingImages.map((img, index) => (

                  <div
                    key={`${img}-${index}`}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100"
                  >

                    <img
                      src={img}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeExistingImage(index)
                      }
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-slate-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                ))}

              </div>

            </div>

          )}

          {/* NEW IMAGES */}

          {newImagePreviews.length > 0 && (

            <div className="mb-6">

              <Label className="text-sm font-semibold text-emerald-700">
                New Images Ready To Upload
              </Label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">

                {newImagePreviews.map(
                  (img, index) => (

                    <div
                      key={img}
                      className="relative group rounded-xl overflow-hidden border border-emerald-200 aspect-video"
                    >

                      <img
                        src={img}
                        alt="New property"
                        className="w-full h-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeNewImage(index)
                        }
                        className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-slate-900/80 text-white flex items-center justify-center hover:bg-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

          {/* IMAGE UPLOAD */}

          <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 text-center bg-slate-50 transition">

            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-3" />

            <p className="font-semibold text-sm text-slate-700">
              Upload Property Images
            </p>

            <p className="text-xs text-slate-400 mt-1">
              PNG, JPG, JPEG or WEBP • Maximum 10MB per file
            </p>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

          </div>

        </Card>

        {/* ================================================= */}
        {/* DOCUMENTS */}
        {/* ================================================= */}

        <Card className="p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm bg-white">

          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">

            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Property Documents
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Upload and manage legal or supporting documents.
              </p>
            </div>

          </div>

          {existingDocuments.length > 0 && (

            <div className="space-y-3 mb-6">

              <Label>Existing Documents</Label>

              {existingDocuments.map(
                (document, index) => (

                  <div
                    key={`${document}-${index}`}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50"
                  >

                    <div className="flex items-center gap-3 min-w-0">

                      <FileText className="w-5 h-5 text-blue-600 shrink-0" />

                      <p className="text-sm font-medium truncate">
                        Document {index + 1}
                      </p>

                    </div>

                    <div className="flex items-center gap-2">

                      <a
                        href={document}
                        target="_blank"
                        rel="noreferrer"
                        className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-blue-50"
                      >
                        <ExternalLink className="w-4 h-4 text-blue-600" />
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          removeExistingDocument(index)
                        }
                        className="w-9 h-9 rounded-lg border border-rose-100 bg-rose-50 flex items-center justify-center hover:bg-rose-100"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

          {newDocumentFiles.length > 0 && (

            <div className="space-y-3 mb-6">

              <Label className="text-emerald-700">
                New Documents
              </Label>

              {newDocumentFiles.map(
                (file, index) => (

                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50"
                  >

                    <div className="flex items-center gap-3 min-w-0">

                      <FileText className="w-5 h-5 text-emerald-600 shrink-0" />

                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeNewDocument(index)
                      }
                      className="w-9 h-9 rounded-lg bg-white border border-rose-100 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-rose-600" />
                    </button>

                  </div>

                )
              )}

            </div>

          )}

          <div className="relative border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl p-7 text-center bg-slate-50">

            <FileDown className="w-8 h-8 mx-auto text-slate-400 mb-3" />

            <p className="font-semibold text-sm">
              Upload Documents
            </p>

            <p className="text-xs text-slate-400 mt-1">
              PDF, DOC, DOCX and other supporting files
            </p>

            <input
              type="file"
              multiple
              onChange={handleDocumentUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

          </div>

        </Card>

        {/* ================================================= */}
        {/* VIDEO & BROCHURE */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* VIDEO */}

          <Card className="p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm bg-white">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-600" />
              </div>

              <div>
                <h2 className="font-bold">
                  Property Video
                </h2>

                <p className="text-xs text-slate-500">
                  Add or replace property video.
                </p>
              </div>

            </div>

            {existingVideo && !removeVideo && !newVideoFile && (

              <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">

                <span className="text-sm font-medium">
                  Existing Video Available
                </span>

                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>

            )}

            {newVideoFile && (

              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 mb-4">

                <span className="text-sm font-medium truncate">
                  {newVideoFile.name}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setNewVideoFile(null)
                  }
                >
                  <X className="w-4 h-4 text-rose-600" />
                </button>

              </div>

            )}

            <div className="relative">

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </Button>

              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

            </div>

          </Card>

          {/* BROCHURE */}

          <Card className="p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm bg-white">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                <FileDown className="w-5 h-5 text-cyan-600" />
              </div>

              <div>
                <h2 className="font-bold">
                  Property Brochure
                </h2>

                <p className="text-xs text-slate-500">
                  Upload property brochure.
                </p>
              </div>

            </div>

            {existingBrochure &&
              !removeBrochure &&
              !newBrochureFile && (

                <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">

                  <a
                    href={existingBrochure}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-blue-600"
                  >
                    View Existing Brochure
                  </a>

                  <button
                    type="button"
                    onClick={handleRemoveBrochure}
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                  </button>

                </div>

              )}

            {newBrochureFile && (

              <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 mb-4">

                <span className="text-sm font-medium truncate">
                  {newBrochureFile.name}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setNewBrochureFile(null)
                  }
                >
                  <X className="w-4 h-4 text-rose-600" />
                </button>

              </div>

            )}

            <div className="relative">

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Brochure
              </Button>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleBrochureChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

            </div>

          </Card>

        </div>

        {/* ================================================= */}
        {/* PUBLISH SETTINGS */}
        {/* ================================================= */}

        <Card className="p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm bg-white">

          <label className="flex items-center justify-between gap-5 cursor-pointer">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-600" />
              </div>

              <div>

                <p className="font-semibold text-sm">
                  Publish Property
                </p>

                <p className="text-xs text-slate-500 mt-0.5">
                  Make this property visible to users.
                </p>

              </div>

            </div>

            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) =>
                handleChange(
                  "isPublished",
                  e.target.checked
                )
              }
              className="w-5 h-5 accent-blue-600"
            />

          </label>

        </Card>

        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur border-t border-slate-200 py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate("/properties")
            }
            disabled={isSubmitting}
            className="h-11 px-6 rounded-xl"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-7 rounded-xl bg-slate-950 hover:bg-slate-800 text-white shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Update Property
              </>
            )}
          </Button>

        </div>

      </form>

    </div>
  );
}