import { useEffect, useState } from "react";
<<<<<<< HEAD
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
=======
import { useParams, useNavigate } from "react-router-dom";
import { getPropertyById } from "../../api/property";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Coins,
  TrendingUp,
  Clock,
  ShieldCheck,
  FileText,
  Video,
  Download,
  Users,
  Award,
  Sparkles,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  ArrowUpRight,
  PieChart
} from "lucide-react";

export function PropertyView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const res = await getPropertyById(id);
      setProperty(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load property details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 font-medium">Property not found.</p>
        <Button onClick={() => navigate("/properties")} variant="outline" className="mt-4 rounded-xl">
          Back to Properties
        </Button>
      </div>
    );
  }

  // Fallback lists
  const images = property.images || property.media?.images || [];
  const videoUrl = property.video || property.media?.video;
  const brochureUrl = property.brochure || property.media?.brochure;
  const documents = property.documents || property.media?.documents || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-sans text-slate-900">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/properties")}
            className="rounded-xl border-slate-200 hover:bg-slate-50 transition shrink-0"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </Button>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide">
                {property.type || "Real Estate"}
              </span>
              {property.propertyGrade && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Grade {property.propertyGrade}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              {property.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {[property.location?.address, property.location?.city, property.location?.state, property.location?.pincode]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {brochureUrl && (
            <a href={brochureUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" className="rounded-xl border-slate-200 text-xs font-semibold gap-1.5 h-10">
                <Download className="w-4 h-4 text-blue-600" /> Brochure
              </Button>
            </a>
          )}
          <Button
            onClick={() => navigate(`/properties/edit/${id}`)}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-10 px-5"
          >
            Edit Property
          </Button>
        </div>
      </div>

      {/* IMAGE GALLERY GRID */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Main Large Image */}
          <div className="md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-64 md:h-auto min-h-[260px]">
            <img src={images[0]} alt="Main Property" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
          </div>
          {/* Side Small Images */}
          {images.slice(1, 5).map((img, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-32 md:h-40">
              <img src={img} alt={`Property ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-xs">
          No Images Uploaded
        </div>
      )}

      {/* INVESTMENT & FINANCIAL STATS HEADER CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl border-slate-100 shadow-sm bg-white">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Asset Value</p>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-1">
            ₹{property.totalValue?.toLocaleString() || 0}
          </p>
        </Card>

        <Card className="p-4 rounded-2xl border-slate-100 shadow-sm bg-white">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Share Price</p>
          <p className="text-lg sm:text-xl font-bold font-mono text-blue-600 mt-1">
            ₹{property.sharePrice || property.calculator?.pricePerShare || 0}
          </p>
        </Card>

        <Card className="p-4 rounded-2xl border-slate-100 shadow-sm bg-white">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Target ROI</p>
          <p className="text-lg sm:text-xl font-bold font-mono text-emerald-600 mt-1">
            {property.roi || property.targetROI || 0}%
          </p>
        </Card>

        <Card className="p-4 rounded-2xl border-slate-100 shadow-sm bg-white">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Lock-in Duration</p>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-1">
            {property.duration || 0} Months
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN - MAIN DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* DESCRIPTION & OVERVIEW */}
          <Card className="p-6 rounded-2xl border-slate-100 shadow-sm bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Property Overview</h2>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description || "No description provided for this asset."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block">Property Size</span>
                <span className="font-semibold text-slate-800">{property.size || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Category</span>
                <span className="font-semibold text-slate-800 capitalize">{property.category || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Tenants Status</span>
                <span className="font-semibold text-slate-800">{property.tenants || "N/A"}</span>
              </div>
            </div>
          </Card>

          {/* HIGHLIGHTS */}
          {property.highlights?.length > 0 && (
            <Card className="p-6 rounded-2xl border-slate-100 shadow-sm bg-white space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">Key Highlights</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {property.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* AMENITIES */}
          {property.amenities?.length > 0 && (
            <Card className="p-6 rounded-2xl border-slate-100 shadow-sm bg-white space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Amenities & Features</h2>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {property.amenities.map((item, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg border-0">
                    {item}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* VIDEO TOUR */}
          {videoUrl && (
            <Card className="p-6 rounded-2xl border-slate-100 shadow-sm bg-white space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Video className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-bold text-slate-900">Property Video Tour</h2>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden bg-black mt-2">
                <video src={videoUrl} controls className="w-full h-full object-contain" />
              </div>
            </Card>
          )}

        </div>

        {/* RIGHT COLUMN - FINANCIAL BREAKDOWN & DOCUMENTS */}
        <div className="space-y-6">
          
          {/* FUNDING & SHARES CARD */}
          <Card className="p-6 rounded-2xl border-slate-100 shadow-sm bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <PieChart className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Funding Progress</h2>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Funded</span>
                <span className="text-blue-600">{property.fundedPercent || 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(property.fundedPercent || 0, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Total Issued Shares:</span>
                <span className="font-mono font-bold text-slate-800">{property.totalShares || 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Available Shares:</span>
                <span className="font-mono font-bold text-emerald-600">{property.sharesLeft ?? property.availableShares ?? 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Rental Yield:</span>
                <span className="font-mono font-bold text-slate-800">{property.rentalYield || 0}%</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Expected Appreciation:</span>
                <span className="font-mono font-bold text-slate-800">{property.appreciation || 0}%</span>
              </div>
            </div>
          </Card>

          {/* LOCATION BREAKDOWN */}
          <Card className="p-6 rounded-2xl border-slate-100 shadow-sm bg-white space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Location Info</h2>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p><strong className="text-slate-800">Address:</strong> {property.location?.address || "N/A"}</p>
              {property.location?.street && <p><strong className="text-slate-800">Street:</strong> {property.location.street}</p>}
              {property.location?.landmark && <p><strong className="text-slate-800">Landmark:</strong> {property.location.landmark}</p>}
              <p><strong className="text-slate-800">City / State:</strong> {property.location?.city}, {property.location?.state}</p>
              <p><strong className="text-slate-800">Pincode:</strong> {property.location?.pincode || "N/A"}</p>
            </div>
          </Card>

          {/* DOCUMENTS */}
          {documents.length > 0 && (
            <Card className="p-6 rounded-2xl border-slate-100 shadow-sm bg-white space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Legal Documents</h2>
              </div>

              <div className="space-y-2 pt-1">
                {documents.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 transition group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                      <span className="text-xs font-medium text-slate-700 group-hover:text-blue-700 truncate">
                        {doc.name || `Document ${i + 1}`}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  </a>
                ))}
              </div>
            </Card>
          )}

        </div>

      </div>

>>>>>>> backup-local
    </div>
  );
}