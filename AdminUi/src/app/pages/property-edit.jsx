import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPropertyById, updateProperty } from "../../api/property";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { toast } from "sonner";

export function PropertyEdit() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    size: "",
    description: "",
    images: [],
    city: "",
    state: "",
    address: "",
    totalValue: "",
    totalShares: "",
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
    </div>
  );
}