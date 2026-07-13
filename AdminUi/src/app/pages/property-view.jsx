import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPropertyById } from "../../api/property";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export function PropertyView() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);

  useEffect(() => {
    fetchProperty();
  }, []);

  const fetchProperty = async () => {
    const res = await getPropertyById(id);
    setProperty(res.data);
  };

  if (!property) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">{property.name}</h1>
        <p className="text-muted-foreground">
          {property.location?.city}, {property.location?.state}
        </p>
      </div>

      {/* IMAGE GRID */}
     {/* IMAGE GALLERY */}
<div className="grid grid-cols-4 gap-3">
  {property.media?.images?.length > 0 ? (
    property.media.images.map((img, i) => (
      <img
        key={i}
        src={img}
        alt="property"
        className={`rounded-xl object-cover w-full 
          ${i === 0 ? "col-span-2 row-span-2 h-full" : "h-40"}`}
      />
    ))
  ) : (
    <p>No Images Available</p>
  )}
</div>

      {/* MAIN DETAILS */}
      <div className="grid grid-cols-2 gap-4">

        <Card className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Type</p>
          <p className="font-medium">{property.type}</p>
        </Card>

        <Card className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Size</p>
          <p className="font-medium">{property.size}</p>
        </Card>

        <Card className="p-4 space-y-2 col-span-2">
          <p className="text-sm text-muted-foreground">Description</p>
          <p>{property.description}</p>
        </Card>

        <Card className="p-4 space-y-2 col-span-2">
          <p className="text-sm text-muted-foreground">Address</p>
          <p>{property.location?.address}</p>
        </Card>

      </div>

      {/* AMENITIES */}
      <Card className="p-4">
        <p className="mb-2 font-semibold">Amenities</p>
        <div className="flex flex-wrap gap-2">
          {property.amenities?.map((a, i) => (
            <Badge key={i}>{a}</Badge>
          ))}
        </div>
      </Card>

      {/* INVESTMENT */}
      <div className="grid grid-cols-3 gap-4">

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="font-bold text-lg">₹ {property.totalValue}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">ROI</p>
          <p className="font-bold text-lg">{property.roi}%</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Duration</p>
          <p className="font-bold text-lg">{property.duration} months</p>
        </Card>

      </div>
    </div>
  );
}